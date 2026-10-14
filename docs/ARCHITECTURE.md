# Architecture

How the game is built. Vocabulary is defined in [`../CONTEXT.md`](../CONTEXT.md). Build order is in [`ROADMAP.md`](./ROADMAP.md). Each decision has an ADR in [`adr/`](./adr/).

**Target:** a public, desktop-browser game that can scale to thousands of concurrent Climbers. **v0.1:** the Base hub plus Duels, then everything else in milestones.

---

## 1. System overview

```
Browser (desktop)
├── React app (Vite, Tailwind)
│   ├── R3F Canvas ─ Base world (hand-built), avatars, Rapier physics
│   ├── Battle UI ─ CodeMirror 6, Quiz/Predict panels, timers, Perk bar
│   └── Runners (Web Workers)
│       ├── Pyodide worker ─ Python
│       └── JS worker ─ JavaScript
│
├── supabase-js ─ auth, profile reads, leaderboards        (HTTPS)
└── @colyseus/sdk ─ BaseRoom + DuelRoom/TrialRoom/Queue     (WebSocket)

Game server (Node, Colyseus)
├── Rooms: BaseRoom · QueueRoom · DuelRoom · TrialRoom
├── Grading: comparator + private answer bank (never sent to clients)
├── Rating, XP, Mastery, Perk rules
└── Writes results to Postgres with the service-role key

Supabase: Auth (GitHub, Google, email) · Postgres (+RLS) · Storage (later)
Redis (from M10): Colyseus presence + driver for multiple server processes
```

**What each piece owns:**

| Concern | Owner | Why |
|---|---|---|
| Identity | Supabase Auth | One login system. The game server only verifies the JWT. |
| Live state (positions, Duel clocks, scores) | Colyseus rooms | Authoritative, in memory, pushed to clients. |
| Durable state (profiles, Rank, XP, matches) | Postgres | Only the game server writes to the game tables. |
| Running player code | The player's own browser | Free at any scale, instant feedback ([ADR-0002](adr/0002-browser-execution-server-grading.md)). |
| Deciding if an answer is correct | The game server | Expected outputs never leave it, so a forged "I won" message does nothing. |

---

## 2. Repository layout

npm workspaces. Moving `Interactive_plane/` to `apps/client/` is the first task in M0.

```
apps/
  client/            React + R3F app (today's Interactive_plane/)
    src/world/       the Base: your hand-built R3F scene, colliders
    src/avatar/      local player controller, remote avatars, interpolation
    src/battle/      Duel/Trial UI, editor, format panels
    src/runners/     pyodide.worker.ts, js.worker.ts, runner protocol
    src/net/         Colyseus client, room hooks
  server/            Colyseus app
    src/rooms/       BaseRoom, QueueRoom, DuelRoom, TrialRoom
    src/grading/     loads the private answer bank, calls the comparator
    src/progression/ rating (Glicko-2), XP, mastery, perk rules
    src/db/          Postgres writes (service role)
packages/
  shared/            pure TS shared by both sides, no runtime deps
    comparator/      structural answer comparison (unit tested)
    interpolation/   snapshot buffer (unit tested)
    protocol/        message types, room option types, enums
    perks/           perk definitions (data) + pure effect rules
content/
  challenges/<format>/<slug>/   authored source of every Challenge
  build/                        generator → public + private bundles
supabase/
  migrations/        SQL schema + RLS, versioned
docs/
```

**The rule that keeps this clean:** `packages/shared` is pure functions and types only. No React, no Colyseus, no I/O. Everything with a nasty edge case lives there and gets unit tests: comparison, interpolation, rating, perk effects. Everything else is checked by eye in the running game.

The typed Colyseus client uses `import type { server } from "apps/server/..."`. `import type` keeps server code out of the client bundle.

---

## 3. The Base (3D world)

- **You build it by hand in R3F code**: meshes, lights and props under `apps/client/src/world/`.
- **Physics: Rapier** (`@react-three/rapier`), replacing `@react-three/cannon` ([ADR-0003](adr/0003-rapier-physics.md)). Static world meshes get `RigidBody type="fixed"` with cuboid/trimesh colliders. The local avatar uses Rapier's **kinematic character controller** (slopes, steps, sliding along walls).
- **Clamp frame `dt` to 0.1 s** before moving the avatar. During a battle the Canvas is backgrounded, and a throttled tab can return a multi-second `dt`. The character controller sweeps the capsule, so big steps don't tunnel, but gravity and position would still jump. Don't cap lower than ~0.1: a 1/30 cap made the game run at half speed at 15 fps.
- **During a battle:** hide the Canvas with CSS and set `frameloop="never"`. **Never unmount it.** Unmounting destroys the WebGL context and re-uploads everything on return.
- **Avatars:** flat-colour box/low-poly characters built from Cosmetic parts (head, body, colour, aura). The same code renders the local and remote avatars. Only the input source differs.
- **Camera:** third-person follow. `PointerLockControls` is fine for mouse-look in the meantime.

---

## 4. Networking (Colyseus)

**Versions (checked 2026-10-13): Colyseus 0.18.** 0.18 became the stable release after the August plan, which had pinned 0.17 because 0.18 had no stable client yet.

- **Server:** `@colyseus/core` + `@colyseus/ws-transport`, not the `colyseus` meta-package. The meta-package pulls in `@colyseus/auth`, which has a vulnerable transitive dependency (`elliptic` via `grant`), and we don't use it since Supabase does auth.
- **Client:** `@colyseus/sdk@0.18`. The old `colyseus.js` package is dead.
- **Schema:** `@colyseus/schema@5`, using the decorator-free `schema({...}, 'Name')` builder with `t.*` field types. No `experimentalDecorators` config needed.
- **Client API:**
  - `Callbacks.get(room).onAdd("climbers", …)` for collection changes.
  - `room.onStateChange` fires once per patch and is an emitter, not an unsubscribe function. Use `.once` / `.remove`.
  - `joinOrCreate` resolves *before* the first state arrives.

### Rooms

| Room | Players | Lifetime | Purpose |
|---|---|---|---|
| `BaseRoom` → `FloorRoom` | ≤ 50 | while occupied | One Hall Instance of one floor. Avatar positions, nameplates, status, chat, walk-up challenges. `BaseRoom` today; becomes `FloorRoom`, keyed by floor with `filterBy(["floor"])`, in M4 ([ADR-0009](adr/0009-floor-scoped-presence.md)). |
| `QueueRoom` | many | always on (one per region) | Ranked/Casual matchmaking by Rank and format. Creates a DuelRoom when it pairs two Climbers. |
| `DuelRoom` | exactly 2 | one Duel | Best-of-3 Rounds, server clock, grading, Perks (Casual), result write. |
| `TrialRoom` | 1 | one Trial or fight | Station practice, Floor Exams, and a floor's Henchmen and Boss phases. Same grading and clock code as Duels, one player. |

**A Climber stays in their `BaseRoom` during a battle** and joins the battle room in parallel, so their avatar stays visible in the Base (status `battling`). Two sockets at once is supported.

**Instancing:** `joinOrCreate("base")` fills an instance up to `maxClients` before opening another. Friends who want the same instance join by room ID (a later feature). In M10, a Redis presence/driver lets several Node processes share the matchmaker. Until then one process runs everything.

### BaseRoom state

As built in M1 and M2 (`apps/server/src/rooms/BaseState.ts`). Later milestones add `role`, `floor` (highest cleared, for the nameplate) and an `anim` field. Cosmetics (M6) extend `Look`.

```ts
const Look = schema({
  body: t.string(), skin: t.string(), accent: t.string(),  // #rrggbb
  hair: t.string(), headwear: t.string(), visor: t.string(),  // part ids, see HAIR/HEADWEAR/VISOR
}, 'Look')

const Climber = schema({
  name: t.string(),          // unique within the instance: a clash becomes "Name#2"
  look: t.ref(Look),
  x: t.float32(), y: t.float32(), z: t.float32(),  // capsule centre
  rotY: t.float32(),
  status: t.string().default('idle'),              // idle | battling | away
}, 'Climber')

const BaseState = schema({
  serverTime: t.float64().default(0),  // stamped in onBeforePatch and on join
  climbers: t.map(Climber),
}, 'BaseState')
```

**Messages** (names and types in `packages/shared/src/protocol.ts`):

| Message | Direction | Purpose |
|---|---|---|
| `move` | client → server | Sent at ≤ 15 Hz, only when the position or heading changed. |
| `respawn` | client → server | The client fell off the world; the server moves it, so it isn't a teleport. |
| `correction` | server → client | The last move was refused; snap back to this position. |
| `chat` | client → server `{ text }`, then server → everyone as a `ChatLine` | World chat (M2). See **Chat** below. |

M4 adds `challenge:send|accept|decline|cancel`. Joiners spawn on a small ring around the spawn point (`spawnPoint()`), not stacked on one spot.

**Join options carry the guest identity** (M2): `joinOrCreate("base", { name, look })`. The server never rejects a join over them:
- `checkName()`: 3–16 characters, letters, digits, spaces and `_ . -`. Reserved names like admin, server, mod and Zark are blocked, compared ignoring case and punctuation. A bad name falls back to `Climber-xxxx`.
- `uniqueName()` numbers clashes (`Name#2`).
- `parseLook()` replaces each invalid field with its default.

When sign-in lands, only this step changes: name and look come from the verified profile, and join options shrink to `{ token }`.

**Chat** is ephemeral: room messages only, never stored.
- `cleanChat()` makes it one line, strips control characters and caps it at 200 characters. Messages that end up empty are dropped.
- A token bucket allows a burst of 5, then one message per 1.5 s per Climber. The excess is dropped silently.
- React renders the text, so it is always escaped. Never use `dangerouslySetInnerHTML` for chat.
- On the client, the latest line shows as a speech bubble for 6 s. Joins and leaves appear as client-side notices.

**Movement is client-authoritative with server sanity checks** (`validateMove()` in `packages/shared`).
- Horizontal speed is capped at 1.25× run speed plus a small slack, with elapsed time counted per move capped at 0.5 s.
- Accepted positions are clamped to the Base bounds. Rejected ones get a `correction`. Server-side Rapier is not worth it for a social hub with no combat movement. Revisit only if the Base gains movement-based gameplay.

### Interpolation (remote avatars)

Render remote avatars **100 ms in the past** (2× the 50 ms patch rate) and lerp between the two buffered snapshots that straddle `now − 100 ms`. Buffer snapshots by server time, not arrival order: every patch carries `serverTime`, and `ClockSync` maps local time onto it using the lowest-latency recent sample. Rotation lerps along the **shortest arc** across ±π. Discrete fields (`status`, `anim`, `look`) **snap** to the newer snapshot. When the buffer starves, **hold** the last position, never extrapolate. Full algorithm: [`research/interpolation-collision-grading.md`](./research/interpolation-collision-grading.md) §1. Lives in `packages/shared/interpolation` with unit tests.

---

## 5. Battles

### Duel format (v0.1)

**Best of 3 Rounds: a Round win is 1 point, and the first Climber to 2 points wins the Duel.** Each Round is one Format, picked by the server from the pool for that mode, and has its own clock:

| Round | Format pool | Clock | Round winner |
|---|---|---|---|
| 1 | Quiz (5 questions) | 2 min | more correct answers; tie → lower total answer time |
| 2 | Predict or Fix | 4 min | first correct Submission |
| 3 | Code | 10 min | first Submission passing all hidden cases |

If a Round's clock expires with no winner, the Round is a draw and both get half a point. If the Duel is still tied after 3 Rounds, it is a draw: Rank changes by the Glicko-2 draw rule, XP is paid for participation only. **Forfeit** is always available and ends the Duel as a loss. A disconnect has a 30 s reconnect window, then it counts as a forfeit.

v0.1 ships Quiz + Code only (Round 2 is skipped until Fix/Predict land in M5). This keeps the first playable version within existing content.

**Blind race:** you see your Opponent's Round score or tests-passed count, a **focus dot** (tab hidden = amber), and the clock. You never see their code.

### How a Duel starts

1. **Walk-up:** click an idle Climber → `challenge:send` → they accept → the BaseRoom asks the matchmaker for a `DuelRoom` and gives both a seat reservation. Always Casual.
2. **Queue:** a Station or the HUD button joins `QueueRoom` with `{ mode, language }`. Pairing uses the closest Rank inside a window that widens over time (±100 → ±400 over 60 s). In Ranked, Perks are disabled.
3. **Station:** a Station opens either a solo `TrialRoom` (practice) or a format-specific queue.

### Running code and grading

**The client runs code. The server judges it.** ([ADR-0002](adr/0002-browser-execution-server-grading.md))

```
Round start ─ server sends: statement, starter code, public cases WITH expected,
              hidden cases WITHOUT expected (args only)
Player runs  ─ worker executes solve(*args) for every case, returns JSON outputs
Submit       ─ client sends { roundId, language, source, outputs[] }
Server       ─ comparator(outputs, privateExpected) → pass/fail per case
             ─ stores source + result, updates Round state
```

- **Python:** Pyodide in a dedicated worker, lazy-loaded when a battle or Trial starts (~7 MB first load, cached). The harness runs inside Python and returns one JSON string. Python values are never marshalled into JS for comparison.
- **JavaScript:** a separate worker with no DOM access. Code is loaded through a `Blob` URL module and returns JSON the same way.
- **Timeouts:** `worker.terminate()` and respawn. This is the only reliable way to stop runaway code in either runtime. Keep one warm spare worker per language.
- **Quiz:** the client sends the chosen option index. The answer key and the timing live on the server.
- **Predict:** nothing runs on the client. The player types the output, and the server compares it with whitespace normalised (trailing spaces and newlines ignored), case-sensitive.
- **Paste is blocked** in the editor during Duels. This is deterrence only.

**The comparator** (`packages/shared/comparator`) follows ICPC/Kattis conventions, carried over from the original design and still correct:

- Compare structurally, leaf by leaf.
- Floats match within a relative **or** absolute tolerance of `1e-9`.
- Comparison is case-sensitive.
- Lists are ordered unless the Challenge declares `unordered: true`.
- Dicts/objects always compare by key.
- `unordered` and floats are never combined in one Challenge.

**One change for JavaScript:** JS has one number type, so when `language = javascript`, `1` and `1.0` compare equal and int/float type mismatches are not failures. `true` vs `1` and `"1"` vs `1` still fail in both languages. ([ADR-0008](adr/0008-python-and-javascript.md))

**Honest limits:** a player can still get outside help (a friend, an AI, a second monitor). Server grading makes a fake win require *real* answers, but it does not prove the player wrote them. Never attach money or hiring decisions to Rank.

---

## 6. Content pipeline

All Challenges are files in the repo, reviewed in PRs. A generator turns them into two bundles:

| Output | Contains | Shipped to |
|---|---|---|
| `packages/shared/content/*.json` | statements, starter code per language, public cases + expected, quiz questions **without** answers, metadata | client bundle |
| `apps/server/content/*.private.json` | hidden-case expected outputs, quiz answer keys, predict expected output | **server only** |

Per format:

- **Code:** `reference.py` is the source of truth (as in today's `server/problems/`). The generator runs it to produce every expected output. Each Challenge gets a JS signature and starter. A `reference.js` is optional, and if present the generator checks that it agrees with Python on every case.
- **Fix:** like Code, plus the buggy starter per language.
- **Predict:** a snippet per language. The generator *executes* it to capture the expected output, so it is never hand-typed.
- **Quiz:** YAML: question, options, answer index, topic, difficulty, explanation.

The **8 existing problems** in `server/problems/` move into `content/challenges/code/` unchanged. Their three comparator pins (README) stay binding.

**Content volume is the real bottleneck for a public game.** Duels pick Challenges by mode, difficulty and topic, avoiding ones either player has seen recently. Plan for roughly 40 Quiz questions, 15 Code, 10 Fix and 15 Predict before a public launch.

---

## 7. Progression

| System | Rule | Where |
|---|---|---|
| **Rank** | Glicko-2. Ranked Duels only. New Climbers start at 1500 / RD 350. | `server/progression/rating.ts` (pure, tested) |
| **XP / Level** | XP for every Duel (win > draw > loss) and Trial. Level curve `xpFor(n) = 100·n^1.5`. | server |
| **Mastery** | Per Topic: correct Submissions weighted by difficulty, decaying slowly. Shown as a radar or bars. | server, written to `mastery` |
| **Floors** | Beat the floor's Boss (once), then pass its Floor Exam in the Hall to climb. Falling ([ADR-0011](adr/0011-the-fall.md), proposed) drops you one floor. | TrialRoom |
| **Roles & Perks** | Pick a Role at Level 5. One Perk point per Level, spent in that Role's tree. Up to 3 Perks equipped. Respec costs a cooldown, not currency. | `packages/shared/perks` |
| **Cosmetics** | Unlocked by Level, Floors, Boss clears and Titles. Inventory in Postgres. No payments in v1, but the schema has a `source` column so purchases could be added later. | server |

### Perks (Casual Duels and Trials only)

Perks are **data plus pure effect functions** in `packages/shared/perks`. The client sends `perk:use { perkId }`, the server checks the Climber owns it, has it equipped and has Charges left, then applies the effect to room state. The client never applies its own effects. Starter trees (to be balanced in M8):

| Role | Self perks | Opponent perks |
|---|---|---|
| **Debugger** | *Stack Trace*: reveal the input of the first failing hidden case | — |
| **Speedster** | *Overclock*: +45 s on your Round clock | *Lag Spike*: Opponent's editor is read-only for 5 s |
| **Architect** | *Blueprint*: show a hint or solution skeleton | — |
| **Scout** | *Recon*: see the next Round's Format and Topic early | *Fog of War*: blur the Opponent's Quiz options for 4 s |

### Floors: Henchmen and Bosses

Game design lives in [`design/GAME_DESIGN.md`](design/GAME_DESIGN.md), and each floor gets its own doc ([Floor 1](design/floors/01-testing-floor.md)). Technically every encounter is the same thing: a solo `TrialRoom` run of Tasks (Challenges) with **Integrity** (hit points), a server clock and phase checkpoints. Henchmen are one Task; a Boss is 2–4 phases. A floor is content plus presentation, not new infrastructure. The top floor's Boss is Zark and the Meta Legion.

---

## 8. Identity and data

**Guests first (M2, built):** players pick a name and look in the character creator. It is saved in `localStorage` and sent as join options, with the rules above. The game is fully playable this way.

**Auth (deferred):** Supabase with **GitHub**, **Google** and **email + password**.
- Supabase's built-in SMTP is limited to ~2 emails/hour, which is unusable for a public game. Before the public launch, connect a free-tier transactional provider (Resend, Brevo…) as custom SMTP. Until then, turn off email confirmation for local development.
- The client passes `access_token` to every `joinOrCreate`. `onAuth` in each room verifies the JWT with Supabase's JWKS, so there is one source of session truth.

**Schema sketch** (`supabase/migrations/`):

```sql
profiles      (id uuid pk → auth.users, name text unique, role text, level int, xp int,
               highest_floor int, look jsonb, created_at)
ratings       (climber_id pk, rating float, rd float, vol float, games int, updated_at)
matches       (id uuid pk, mode text, a uuid, b uuid, winner uuid null, result text,
               a_rating_delta float, b_rating_delta float, started_at, ended_at)
rounds        (match_id, n smallint, format text, challenge_slug text, winner uuid null,
               primary key (match_id, n))
submissions   (id uuid pk, climber_id, match_id null, trial_id null, challenge_slug,
               language text, source text, passed int, total int, ms int, created_at)
trials        (id uuid pk, climber_id, kind text, floor int null, result text, created_at)
mastery       (climber_id, topic text, score float, primary key (climber_id, topic))
perks_owned   (climber_id, perk_id text, rank smallint, equipped bool)
cosmetics_owned (climber_id, cosmetic_id text, source text, acquired_at)
reports       (id uuid pk, reporter, reported, reason text, context jsonb, resolved bool)
```

**RLS:** profiles, ratings and leaderboards are readable by everyone. A Climber can update only cosmetic and display fields on their own profile. **Every progression table is written only by the game server's service role**, never by the client. The service-role key is a server secret and never appears in the client bundle.

**Leaderboards** are queries or materialised views over `ratings`, `profiles.highest_floor` and `submissions`, not hand-maintained tables.

---

## 9. Scale, safety and operations (M10, before public launch)

- **Horizontal scaling:** the Colyseus Redis presence and driver let several processes share rooms and the matchmaker. Use sticky WebSocket routing. Base Instances spread naturally.
- **Region:** deploy close to the players first. Earlier measurements from Nigeria favoured South Africa (`jnb`) over Europe by ~35 ms. Re-measure on the real host.
- **Abuse:** rate-limit chat and challenges per Climber, filter profanity in names and chat, have a report button (→ `reports`), and allow blocking and muting a Climber.
- **Abandonment:** repeated Duel leaves add a short queue cooldown.
- **Observability:** structured server logs, room counts, Duel completion rate, and grading disagreements (any case where the comparator rejects a reference solution is a content bug).
- **Cost:** player code runs in browsers, so compute grows with sockets, not with Submissions. Supabase free tier until real traffic. A paid plan also stops the free-tier auto-pause.

---

## 10. Tests

Unit tests only where pure logic has nasty edges. These are all in `packages/shared` or `server/progression`:

1. **Comparator:** floats rel/abs, unordered, dict key order, JS number rule, type mismatches, NaN/∞.
2. **Interpolation:** midpoint, before/after the buffer, ±π shortest arc, out-of-order and duplicate timestamps, eviction.
3. **Rating:** Glicko-2 reference vectors from the paper, draws, new-player RD.
4. **Perk rules:** charges, Ranked lockout, effect stacking and expiry.
5. **Content build:** every reference solution passes its own cases, and Python/JS references agree.

Everything else (rendering, movement feel, UI) is checked by hand with two browser tabs.
