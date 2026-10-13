# Voxel Coding Arena — Implementation Plan

The phase-by-phase build plan. `SPEC.md` remains the source of truth for *what* the thing is; this file is *how it gets built and in what order*, after a design review on 2026-08-21.

Working rules, memory-file discipline, and the verified dependency table live in [`CLAUDE_CODE_KICKOFF.md`](./CLAUDE_CODE_KICKOFF.md). Algorithm research for the three risky seams lives in [`../docs/research/interpolation-collision-grading.md`](../docs/research/interpolation-collision-grading.md). Read all three before Phase 1.

---

## Decisions taken in review

Locked in. Where these overrule `SPEC.md`, this file wins and the reason is stated.

| # | Decision | Consequence |
|---|---|---|
| 1 | **Colyseus `0.17.10`**, client `@colyseus/sdk@0.17.43`, schema `4.x` | `0.18.3` is `next`-tagged with no stable client. The client package was **renamed** — `colyseus.js` is dead at `0.16.22`. |
| 2 | **Server grades duels.** Client returns actual outputs; server compares against hidden expected outputs | Problems split public/private. Forging a win now needs the actual answers, not one WebSocket message. Upgrades the spec's "cheating is visible" to "cheating doesn't work." |
| 3 | **v1 stops at the duel.** Phases 7–8 (leaderboards, sessions) cut | Ship 0–6, play it, then decide from what people ask for. |
| 4 | **Tests at exactly three seams**: collision, interpolation, grading | Pure functions with nasty edges, each miserable to debug through a canvas. Everything else is verified by eye. |
| 5 | **Flat-colour presets.** Skin upload deferred | Minecraft-skin UVs on eight box limbs is a half-day of hand-written UV arrays. `reported_skins` drops out of v1 with it. |
| 6 | **Phase 0 folded into Phase 1** | It had no visible result, which the kickoff's own rules call mis-scoped. |
| 7 | **Solo solve is a dev-only route** (`/solve/:slug`), not a shipped mode | Cutting leaderboards removed solo's only reward. Phase 5 keeps its full de-risking value at zero UI cost. |
| 8 | **8 problems**, drafted for you, each with a reference solution | 15 is a lot of authoring for a game played twice. 8 means a duel rarely repeats. |
| 9 | **Duel: 15 minutes**, expiry = no winner, plus a forfeit button | `winner_id` null, no stats change. A too-hard problem shouldn't cost anyone a streak. |
| 10 | **npm workspaces**: `client/`, `server/`, `shared/` | The official typed-client seam is `import type` across packages; three packages now genuinely share code. |
| 11 | **Both auth providers** — GitHub OAuth **and** email+password, confirmation **disabled** | Forced by fact: Supabase's built-in SMTP allows **2 emails/hour project-wide**, unchangeable without custom SMTP. Magic links would break with two colleagues signing up. See "Auth" below. |
| 12 | **World from a committed generator script** | Nobody hand-writes 65k cells. Not a terrain generator — that's the scope creep the spec warns about. |
| 13 | **Zero spend. `localhost` for all of v1.** Deployment is a post-v1 appendix | Region question already answered for free, below. |

### The region question, already answered

The spec asks for `jnb`/`lhr`/`ams` to be measured from Nigeria before committing, and separately says don't deploy until step 6. Both satisfied at zero cost by measuring RTT to region-pinned public endpoints instead of deploying anything.

Measured from this machine, 2026-08-21, TCP connect to AWS regional endpoints, 7 samples:

| Proxy region | Stands in for | min | median |
|---|---|---|---|
| `af-south-1` Cape Town | `jnb` | **84 ms** | **94 ms** |
| `eu-west-2` London | `lhr` | 119 ms | 141 ms |
| `eu-central-1` Frankfurt | `ams` | 131 ms | 144 ms |

**South Africa wins by ~35 ms.** This contradicts the spec's hedge that West African traffic often routes to Europe over subsea cables rather than overland — from this connection, it doesn't.

⚠️ It's a proxy: AWS ≠ Fly, and Cape Town ≠ Johannesburg. Treat it as "deploy to `jnb` first," not as a final number, and re-measure against a real Fly machine whenever you deploy. But it's enough to stop worrying about the decision now.

### Auth

"Both providers" plus a 2-email/hour cap resolves to:

- **GitHub OAuth** — primary path. Zero emails, and it hands you a username and avatar for free.
- **Email + password with "Confirm email" turned OFF** in the Supabase dashboard — zero emails in the happy path.

Not magic links: every sign-in sends mail, and the third person to log in within an hour gets a `429`.

Consequences to accept: unconfirmed emails mean anyone can register any address (fine for colleagues), and **password reset is the one path that still needs email** — it'll work twice an hour, or you reset it from the dashboard yourself. If the game outgrows that, wire up free-tier Resend or Brevo; that's a 20-minute job, not a redesign.

### Money

Everything in v1 is free. Two things to know:

- **Supabase free projects pause after 1 week of inactivity**, limit 2 active. For a game people "play twice," it *will* be asleep when someone tries it in week 3. Unpausing is one dashboard click — just know that's the failure mode, not a bug in your code.
- Free plan: 500 MB database, 1 GB storage, 50k MAU. Nowhere near any of these.
- **Fly costs money and is deferred entirely.** Verify current pricing when you get to the appendix; don't trust a figure quoted today.

---

## Phase 1 — Foundation, world, and movement

*Absorbs the old Phase 0.*

**Goal:** you can walk around a blocky world and can't walk through walls.

### Setup

1. npm workspaces at the root: move the existing React app to `client/`, add `shared/`, scaffold `server/` with `npm create colyseus-app@0.17.1`.
2. Install into `client/`: `three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8 @colyseus/sdk@0.17.43 @supabase/supabase-js@2.112.3`
3. **Repin `react`/`react-dom` from `^19.2.8` to `~19.2.8`.** R3F 9.7.0's peer range is `react >=19 <19.3`; the caret allows 19.3 and breaks it.
4. Server `tsconfig.json`: `experimentalDecorators: true`, `useDefineForClassFields: false`. Without these, schema sync misbehaves in ways that look like your code is wrong.
5. `.gitignore` += `**/memory.md`, `.env`. Add `.env.example`, `phases/`, root README with how to run both sides.

### World

`shared/scripts/build-world.ts` emits `shared/world.json` — flat grass floor, boundary wall, a few raised platforms for verifying collision against edges and overhangs. Commit both script and output. Size per spec: `[64, 16, 64]`.

Render one `InstancedMesh` per material. Character is a handful of `BoxGeometry` limbs, flat colours.

### Movement and collision

WASD + mouse-look, third-person camera. Collision is the spec's grid lookup — `map[x][y][z] !== 0`, per-axis resolution — which is the right call at walking speed.

⚠️ **Clamp `dt`.** This is the highest-value three lines in the whole phase:

```ts
const dt = Math.min(rawDt, 1 / 30)
```

Per-axis grid collision fails on large `dt`, and **this project manufactures large `dt` on purpose**: the duel is a full-screen takeover that backgrounds the Canvas, and `visibilitychange` is a core mechanic. A throttled `requestAnimationFrame` returning after seconds sends `pos += vel * dt` straight through the floor. Substep if a single frame's movement still exceeds a fraction of a block. Details and citation in the research notes.

Pick a half-open convention for cell occupancy and stick to it, so standing exactly on `y = 4.0` doesn't read as intersecting the block at `y = 4`.

### Tests — seam 1 of 3 (`/tdd`)

Pure `collide(map, aabb, delta) → resolvedDelta`, no R3F involved:

- axis-aligned wall stops movement on that axis only, sliding preserved on the others
- inside corner, both axes blocked
- flush landing on a block boundary is not a collision (the `1e-10`-style epsilon case)
- **a `dt` spike does not tunnel** — the regression test for the bug above
- floor, ceiling, and step-up against a one-block ledge

**Verified when:** you walk around, slide along walls, cannot clip through anything, and tab-switching away for ten seconds then returning does not drop you through the floor.

---

## Phase 2 — Multiplayer

**The milestone. Spend time here — the fun is concentrated in this phase.**

**Goal:** two tabs, both avatars visible, movement smooth rather than stuttery.

`WorldRoom` (max ~20) with the `Player` schema from `SPEC.md` — **the spec's `@type()` decorator syntax is verified current, use it as written.** Client sends `move` at ~15 Hz, only on change. Keep the default 50 ms patch rate.

Client uses the new API — the old `room.state.players.onAdd(...)` form is gone:

```ts
import { Client, Callbacks } from "@colyseus/sdk"
const callbacks = Callbacks.get(room)
callbacks.onAdd("players", (player, sessionId) => { /* ... */ })
```

### Interpolation

The spec calls this the single highest-value detail in the networking layer, and the research confirms it. `RENDER_DELAY = 100 ms` — exactly 2× the 50 ms patch rate, one interval to make interpolation possible plus one as jitter margin. **Do not tune it down to 50 ms**; that leaves zero tolerance for one late packet.

Buffer snapshots **sorted by server timestamp**, not arrival order. Each frame, find the pair straddling `now - RENDER_DELAY` and lerp. Full algorithm in the research notes.

Three things that are bugs if missed:

1. **Angles lerp along the shortest arc.** Naive `lerp(3.10, -3.10)` spins the avatar nearly all the way around. This is the ±π wraparound.
2. **Discrete fields snap, they don't blend** — `status`, `username`, `preset` come from the newer snapshot. Lerping an enum is meaningless.
3. **On buffer starvation, hold the last position.** Do not dead-reckon; extrapolation is documented as useless for humanoids, who stop and turn instantly.

### Tests — seam 2 of 3 (`/tdd`)

Pure `interpolate(buffer, renderTime) → renderState`:

- exact midpoint between two snapshots
- `renderTime` before the buffer's start, and after its end (starvation → hold)
- **shortest-arc rotation across the ±π boundary** — both directions
- out-of-order and duplicate-timestamp arrivals
- a joiner present in the newer snapshot only
- old snapshots get evicted, buffer doesn't grow forever

**Verified when:** two tabs, both avatars visible, and movement looks smooth — not stuttery, and not sliding on ice. Throttle one tab in devtools and confirm it degrades gracefully instead of teleporting.

---

## Phase 3 — Identity

**Goal:** you log in, pick a character, and the other tab sees your username.

Supabase project on the free plan. `profiles` table + RLS (readable by all, writable by owner). GitHub OAuth **and** email+password with confirmation disabled, per the Auth section above.

Character select: six flat-colour presets. No skin upload — deferred, and `reported_skins` leaves v1 with it.

Name tags above avatars (drei `Billboard`/`Text`). Pass the Supabase `access_token` to `joinOrCreate`; verify the JWT in Colyseus `onAuth` before the player enters, so there's one source of session truth.

Optional but cheap: the typed client, `new Client<typeof server>(url)` with `import type { server } from "../../server/src/app.config.ts"`. `import type` keeps server code out of the client bundle.

**Verified when:** log in both tabs as different users, each sees the other's real username over the right avatar. A tampered token is rejected by `onAuth`.

---

## Phase 4 — Chat

**Goal:** two tabs can talk. An afternoon.

World chat over Colyseus room messages. Ephemeral — no table, no history. Clamp message length, escape on render, cap the visible log.

**Verified when:** two tabs hold a conversation and a 10,000-character message doesn't break the layout.

---

## Phase 5 — Solo solve

**The hardest technical piece, and deliberately the one with no networking in it.** Pyodide's worker lifecycle is the thing most likely to eat a weekend; debugging it *and* room state simultaneously is how projects stall.

**Goal:** you solve a problem, tests pass, an infinite loop gets killed cleanly, and a `submissions` row lands in Postgres.

Reachable at `/solve/:slug` — a dev route, not linked from the UI.

### Problems

**Done — all eight are drafted and generated.** See [`../server/problems/README.md`](../server/problems/README.md) for the set, the reference-file contract, and the three comparator pins they encode. Regenerate with `python3 server/problems/build_problems.py`.

Split per decision 2:

- `server/problems/<slug>.reference.py` — metadata, statement, case inputs, and the reference solution. **The single source of truth.** Every expected output is produced by running `solve()`, never hand-typed, so a problem cannot drift out of sync with its own answers.
- `shared/problems/<slug>.json` — title, statement, signature, starter code, **public sample cases with expected outputs**. Bundled to the client.
- `server/problems/<slug>.private.json` — **hidden cases: args and expected outputs.** Not in the client bundle.

⚠️ **Hidden *args* must reach the client at duel time** — the browser is the only thing that runs Python, since server-side execution is an explicit non-goal. Only the hidden *expected outputs* stay on the server. "Never bundled" means absent from the static build; it does not mean never sent. That asymmetry is exactly what makes forging a win require actually solving the problem.

Two problems per difficulty tier (1–4), so a duel can pick a level without repeating.

### Pyodide

`pyodide@314.0.5` — the major tracks Python, so this is **Python 3.14**.

Dedicated Web Worker, **lazy-loaded on demand** with a visible "warming up" state. ~7 MB first load, cached after. If it loads on page load, the app feels dead on a slow connection — a named risk in the spec.

Run the harness **inside** Python and pass one JSON result out. Do not marshal Python objects into JS to compare there; that's a fight with type conversion for no benefit.

Timeout is `worker.terminate()` and respawn — you cannot interrupt Python inside Pyodide, so killing the worker is the only reliable stop. Costs about a second. Keep a warm spare if the respawn pause annoys you.

### Grading — seam 3 of 3 (`/tdd`)

Even though solo runs client-side, **build the comparator as a shared pure function now** — Phase 6 runs the same code server-side, and this is the phase where it gets tested properly.

Design follows ICPC/Kattis judge conventions, not `===` (citations in the research notes):

- Compare **structurally, leaf by leaf**. Never string-equality the whole payload.
- **Floats: accepted if within relative OR absolute tolerance, `1e-9` each.** Relative alone breaks near zero; absolute alone breaks at large magnitudes. Both, OR'd. `moving-average` contains the case that proves it: two correct solutions differ by **0.25 absolute but 2e-16 relative**, so absolute-only would fail a correct player. Verified, not assumed — see `server/problems/README.md`.
- **Case-sensitive** — unlike the ICPC default, because we compare typed values, not prose. Python `True` ≠ `"true"`.
- **Lists are order-sensitive unless the problem declares `"unordered": true`.** A per-problem flag, never a global guess — guessing wrong marks a correct solution wrong, the worst bug this game can have.
- **Dicts always compare by key, with no flag.** Dict key order is never semantic: two correct solutions inserting in different orders are both right, and `word-frequency`'s statement promises the player that key order doesn't matter. So `unordered` relaxes *list* ordering only. `word-frequency` is `unordered: false` and still compares order-insensitively at the dict level; that is intended, not a contradiction.
- **`unordered` + float tolerance is deliberately never combined.** Tolerant equality isn't a hash, so an unordered *and* tolerant comparison needs bipartite matching rather than canonical-serialise-and-sort. `group-anagrams` is the only unordered problem and holds only strings, keeping the cheap path valid. Don't add a floats-and-unordered problem without accepting that cost.

Tests: int/str/bool exact; float within and outside each tolerance; float near zero where relative fails and absolute saves it; large magnitude where the reverse holds; nested lists and dicts; `unordered` on and off; dict key order irrelevant; `None` vs `null`; NaN and infinity; type mismatch (`1` vs `"1"`, `1` vs `1.0`, `True` vs `1`).

Two of these have concrete fixtures waiting in the problem set rather than needing invention:

- **large magnitude, relative saves it** — `moving-average` hidden case `[1e10, 3.3e12, 0.5, 2.5e15, 3.3e12, 2.5e15, 1.0]`, `k=4`: expected `…000.2`, a correct sliding-window solution gives `…000.0`. 0.25 absolute, 2e-16 relative.
- **float near zero, absolute saves it** — this one has no fair problem-level fixture and must be a unit test: expected `0.0`, actual `1e-17`. Relative difference is 1.0, absolute is 1e-17. Attempting to manufacture it inside `moving-average` requires catastrophic sign-cancellation, which makes a sliding-window solution genuinely wrong rather than merely differently-rounded — see the README's third pin.

**Verified when:** you solve a problem and tests pass; a wrong answer fails with a useful diff; `while True: pass` is killed and the UI recovers; a `submissions` row is in Postgres with the source code stored.

---

## Phase 6 — Duel

**Goal:** two tabs complete a real duel and the winner's stats change. The product exists.

Click a player → `challenge` → accept → `matchMaker.createRoom` + seat reservations for both. Client stays in `WorldRoom` throughout so the avatar doesn't vanish; two sockets at once is supported and intended.

`DuelState` / `Duelist` per `SPEC.md`. Blind race: opponent's **tests-passed count**, **focus dot**, **timer**. Never their code.

- **Server owns the clock.** 15 minutes, `startedAt`/`endsAt` server-set.
- **Server grades.** Client submits actual outputs for the hidden cases; server runs the Phase 5 comparator and decides. First all-pass wins.
- Expiry → no winner, `winner_id` null, no stats change. **Forfeit button** so a stuck player frees both without waiting it out.
- `visibilitychange` → `focused` → amber dot on the opponent's nameplate. No penalty, no blocking.
- Paste blocked via `preventDefault` on the editor.
- Server writes `duels` and updates `profiles` stats with the **service role key** (never shipped to the client).

**On duel start, hide the Canvas with CSS and set `frameloop="never"`. Do not unmount it** — unmounting destroys the WebGL context and re-uploads every geometry and texture on the way back.

**Verified when:** two tabs run a full duel; the winner's `wins` and `current_streak` increment and the loser's `losses` does; a forged `testsPassed` message does **not** win; expiry and forfeit both leave stats untouched; returning to the world is instant and the avatar never disappeared.

### Deterrence, honestly

Paste-blocking and the focus dot are social deterrence, not security. A second monitor beats the dot; devtools beats the paste block. Server grading closes the "just claim you won" hole, but a determined cheat still gets help from outside the tab. **Don't attach hiring, money, or anything consequential to these results.**

---

## Then stop

Play it. Get colleagues to play it. **Decide 7–8 from what they actually ask for**, not from this document.

If nobody asks for leaderboards, that's the answer. If sessions turn out to want a Slack message and a calendar invite instead of a feature, that's cheaper and better.

---

## Appendix — deployment, when you're ready to spend

Not part of v1. `localhost` with two tabs is the correct host for everything above.

- **Deploy to `jnb` first** — measured above at ~35 ms better than Europe from your connection. Re-measure against a real Fly machine to confirm the proxy held.
- **`auto_stop_machines = false`** in `fly.toml`, or the machine sleeps and drops every socket.
- Client to Vercel or Cloudflare Pages — static bundle, free.
- Service role key as a Fly secret. Never in the client bundle.
- Verify Fly's current pricing yourself at that point; don't trust a number quoted in August 2026.
- Expect the Supabase project to have paused if a week went by.

---

## Explicitly not in v1

Voice · face tracking · multiple worlds · friends lists · Elo · spectating · replays · multi-language · server-side Python execution · persistent chat · mobile · block placing · terrain generation · leaderboards · sessions · skin upload · session recurrence · notifications.

**The one to watch:** if you find yourself writing a chunk mesher, greedy meshing, or block placement, you've lost the month to the wrong problem. The world is a fixed JSON file. It stays that way.
