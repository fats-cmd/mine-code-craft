# Voxel Coding Arena — MVP Spec

A blocky 3D world where logged-in users walk around, click someone, and challenge them to a Python problem. Also hosts scheduled learning sessions.

Built for fun. Success = you enjoyed building it and people in the company played it twice.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| 3D | Three.js + React Three Fiber | Ecosystem, and drei saves weeks |
| Multiplayer | Colyseus | Room-based authoritative state, matchmaking built in |
| Auth + DB | Supabase (Postgres, RLS, Storage) | One service, already familiar |
| Code execution | Pyodide in a Web Worker | Real CPython, client-side, zero attack surface |
| Editor | CodeMirror 6 | Monaco's advantage is a language server you won't have |
| Game server host | Fly.io | Cheapest always-on; JNB/LHR/AMS to test latency from Nigeria |
| Client host | Vercel or Cloudflare Pages | Static bundle, free |

**Not used, deliberately:** physics engine, chunk mesher, server-side sandbox, Elo, face tracking, voice.

---

## Architecture

```
Browser
├── React app
│   ├── R3F Canvas ── grid world (InstancedMesh) + remote players
│   ├── CodeMirror 6 ── duel editor
│   └── Pyodide Worker ── runs user Python, terminated on timeout
│
├── Supabase JS ── auth, profiles, stats, sessions   (HTTPS)
└── Colyseus client ── WorldRoom + DuelRoom          (WebSocket)

Fly.io: Colyseus (Node) ── verifies Supabase JWT in onAuth
                        └─ writes duel results to Postgres
```

Two socket connections at once during a duel. The client stays in `WorldRoom` (so the avatar doesn't vanish) while joining `DuelRoom` in parallel. Colyseus supports this.

**Auth seam:** client authenticates with Supabase → passes `access_token` to `joinOrCreate` → Colyseus verifies the JWT in `onAuth` before the player enters. No duplicated session logic.

---

## The world

A JSON file, not a mesh:

```json
{
  "size": [64, 16, 64],
  "palette": ["air", "stone", "grass", "wood", "glass"],
  "blocks": [[0,0,0,1], [0,1,0,2]]
}
```

Rendered as one `InstancedMesh` per material — thousands of blocks, one draw call each.

**This is the reason for the grid.** Collision is `map[x][y][z] !== 0`. An integer array lookup, roughly fifteen lines, no raycasting and no physics engine. A GLTF world would need one or the other.

The server loads the same file, so position validation later is free.

---

## Data model (Supabase)

Problems live in a repo JSON file for v1, not a table. ~15 hand-written. Referenced everywhere by `problem_slug`.

```sql
profiles (
  id uuid pk references auth.users,
  username text unique not null,
  character_preset smallint default 0,   -- 0..5
  skin_url text,                          -- Supabase Storage, 64x64 png
  wins int default 0,
  losses int default 0,
  current_streak int default 0,
  best_streak int default 0
)

submissions (
  id uuid pk,
  user_id uuid references profiles,
  duel_id uuid references duels null,     -- null = solo attempt
  problem_slug text not null,
  source_code text not null,              -- keep it; makes cheating visible after the fact
  tests_passed int, tests_total int,
  duration_ms int,
  created_at timestamptz default now()
)

duels (
  id uuid pk,
  problem_slug text not null,
  player_a uuid, player_b uuid,
  winner_id uuid null,                    -- null = both gave up / expired
  started_at timestamptz, ended_at timestamptz
)

sessions (
  id uuid pk,
  host_id uuid references profiles,
  title text, description text,
  starts_at timestamptz not null,         -- UTC; render local with Intl
  capacity int default 20
)

session_rsvps (session_id, user_id, primary key (session_id, user_id))

reported_skins (
  id uuid pk, reported_user uuid, reporter uuid,
  reason text, resolved bool default false
)
```

**Leaderboards are queries, not tables.**

- Per-problem fastest: `min(duration_ms)` from `submissions` where `tests_passed = tests_total`, grouped by `problem_slug, user_id`
- Overall: `wins`, `current_streak` off `profiles`, updated when a duel ends

Solo submissions count toward per-problem boards. That's deliberate — it means the app is worth opening when nobody else is online.

**RLS:** profiles readable by all, writable by owner. Submissions insert-own, read-own plus aggregate views. Duels written only by the service role (the Colyseus server).

---

## Colyseus rooms

### WorldRoom (max ~20)

```ts
class Player extends Schema {
  @type("string") id; @type("string") username;
  @type("number") x; @type("number") y; @type("number") z;
  @type("number") rotY;
  @type("uint8")  preset;
  @type("string") skinUrl;
  @type("string") status;   // "idle" | "dueling" | "away"
}
class WorldState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
```

Movement is client-authoritative in v1 — the client sends its own position and the server relays it. Someone can teleport. In a social space nobody cares, and the fix later is one grid lookup server-side.

Messages: `move`, `chat`, `challenge`, `challenge:accept`, `challenge:decline`.

Patch rate 50ms (Colyseus default). Client sends `move` at ~15Hz, only when it changed.

**Interpolation is the thing that decides whether this feels good.** Render remote players ~100ms behind and lerp between the last two snapshots. Applying positions the moment packets arrive makes everyone stutter. This is the single highest-value detail in the whole networking layer.

### DuelRoom (exactly 2)

Created via `matchMaker.createRoom` on accept; both players get seat reservations.

```ts
class Duelist extends Schema {
  @type("string") id;
  @type("uint8") testsPassed; @type("uint8") testsTotal;
  @type("boolean") focused;      // tab visibility
  @type("boolean") finished;
}
class DuelState extends Schema {
  @type("string") problemSlug;
  @type("number") startedAt; @type("number") endsAt;   // server owns the clock
  @type({ map: Duelist }) players;
  @type("string") winnerId;
}
```

Blind race: you see your opponent's **tests passed**, **focus dot**, and the **timer**. Never their code. You feel them gaining and can't see how — that's the format.

---

## Duel rules

**First correct submission wins.** All tests must pass.

**Research allowed, tab switches visible.** `visibilitychange` flips `focused`, which renders as an amber dot on the opponent's nameplate. No penalty, no blocking. Leaving to look something up is legal and costs you seconds — and your opponent sees you needed help. Social pressure does the enforcement; nothing to arbitrate.

**Paste blocked** via `preventDefault` on the editor's paste event.

Both are deterrence, not security. A second monitor beats the focus dot; devtools beats the paste block. Fine for colleagues playing a game. **Do not attach hiring, money, or anything consequential to these results** without server-side re-execution.

**Execution:** Pyodide in a dedicated Worker. Lazy-load on challenge accept (~7MB first time, cached after) with a "warming up" state. Timeouts are `worker.terminate()` and respawn — you cannot interrupt Python inside Pyodide, so killing the Worker is the only reliable stop. Costs about a second.

Run the test harness **inside** Python and pass a small JSON result back out. Don't marshal Python objects into JS to compare there — you'll fight type conversion for nothing.

---

## Characters

Six presets you author. After that, **64×64 Minecraft skin upload** — standard UV layout, so any existing skin works. Infinite variety, zero asset pipeline, and you aren't the one distributing the images.

Report button → `reported_skins` → admin flag. In a shared world with user-uploaded textures you will need this. It's a table and a button, not a feature.

No licensed characters, no real people's likenesses shipped as presets.

---

## Screens

1. **Auth** — Supabase, email or GitHub
2. **Character select** — six presets, skin upload
3. **World** — canvas, world chat panel, player list, sessions button
4. **Duel** — full takeover
5. **Sessions** — upcoming list, RSVP, "join now" when live
6. **Leaderboards** — per-problem fastest + overall wins/streak

**On duel start, hide the Canvas with CSS and set `frameloop="never"`.** Do not unmount it — that destroys the WebGL context and you re-upload every geometry and texture on the way back.

---

## Build order

Each step ends in something you can look at.

1. **Local movement.** Grid world from JSON, blocky character, WASD, third-person camera, grid collision. *Ends: you can walk around.*
2. **Two tabs.** Colyseus WorldRoom, both characters visible, interpolated. *Ends: the milestone. This is where the fun is concentrated.*
3. **Identity.** Supabase auth, profiles, presets, name tags, JWT verified in `onAuth`. *Ends: it's you, not "player_2".*
4. **Chat.** World chat via room messages. Ephemeral, no persistence. *An afternoon.*
5. **Solo solve.** Problem JSON, CodeMirror, Pyodide Worker, tests, write a submission row. *Ends: the hard technical piece, de-risked without networking.*
6. **Duel.** Click a player → challenge → DuelRoom → blind race → winner → stats. *Ends: the product exists.*
7. **Leaderboards.** Two queries, two tables.
8. **Sessions.** List, create, RSVP.

Steps 1–2 are the good part. If you stall after them you still got what you came for.

Don't deploy until step 6. `localhost` with two tabs is the correct host until then.

---

## Explicitly not in v1

Voice · face tracking · multiple worlds · friends lists · Elo · spectating · replays · multi-language · server-side execution · persistent chat · mobile · block placing · terrain generation · session recurrence · email or push notifications.

---

## Known risks

**Interpolation.** Get it wrong and everything looks broken regardless of what else works. Budget real time.

**Pyodide bundle.** 7MB. If it loads on page load instead of on demand, the app feels dead on a slow connection.

**Client-reported results are forgeable.** Server owns the clock and the test cases; the source is stored. Enough to make cheating visible. Not enough to make it impossible.

**`auto_stop_machines = false` in `fly.toml`.** Otherwise the machine sleeps and drops every socket.

**Region latency is untested.** Deploy to `jnb`, `lhr`, and `ams` and measure from Port Harcourt before committing. Don't assume Johannesburg wins — West African traffic often routes to Europe over the subsea cables rather than overland.

**Scope creep into Minecraft.** If you find yourself writing a chunk mesher, greedy meshing, or block placement, you have lost the month to the wrong problem. The world is a fixed JSON file. It stays that way.
