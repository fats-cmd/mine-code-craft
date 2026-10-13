# Claude Code — Project Kickoff

Paste this as your first message in Claude Code, with `SPEC.md` in the repo root.

---

## The prompt

> Read `SPEC.md` in the repo root before doing anything. It is the source of truth for this project — architecture, data model, room schemas, and explicit non-goals. If something I ask contradicts it, say so instead of silently picking one.
>
> React, Vite, and Tailwind are already installed and working. Do not scaffold or reinstall them.
>
> **Before writing code that uses a framework, read its current documentation.** Your training data is stale on all of these — Colyseus schema decorators, R3F hooks, Pyodide's worker API, and CodeMirror 6's extension system have all changed in ways that will silently produce broken code. Fetch the docs, then write. If a URL 404s, search for the current one rather than guessing at the API.
>
> | Library | Docs |
> |---|---|
> | Colyseus | https://docs.colyseus.io — client: `/getting-started/typescript`, schema: `/state/schema/`, migration: `/migrating/0.17` |
> | React Three Fiber | https://r3f.docs.pmnd.rs |
> | drei | https://drei.docs.pmnd.rs |
> | Three.js | https://threejs.org/docs/ |
> | Pyodide | https://pyodide.org/en/stable/ |
> | CodeMirror 6 | https://codemirror.net/docs/ |
> | Supabase | https://supabase.com/docs |
>
> **Phase structure.** The project is built in numbered phases (below). Each phase gets a directory `phases/NN-name/` containing a `memory.md`. Add `**/memory.md` to `.gitignore` — these are working notes, not repo content.
>
> At the **start** of a phase, create its `memory.md` from the template below. **During** the phase, update it as you go — every non-obvious decision, every gotcha, every API that didn't work the way the docs implied. At the **end**, write the handoff section. When you begin any phase, first read the `memory.md` of every prior phase.
>
> ```markdown
> # Phase NN — <name>
>
> ## Goal
> One sentence. What is true when this phase is done.
>
> ## Status
> not started | in progress | done
>
> ## Decisions
> - What was chosen, and what was rejected and why.
>
> ## Gotchas
> - Things that cost time. API surprises, version mismatches,
>   docs that were wrong, config that had to be exact.
>
> ## Files
> - path — what it does
>
> ## Verified
> How I confirmed this actually works. Not "should work."
>
> ## Handoff
> What the next phase needs to know. Anything left half-done.
> ```
>
> **Working rules.**
> - One phase at a time. Do not start the next until I confirm the current one works.
> - Each phase must end in something I can look at and verify by hand. If a phase has no visible result, it's scoped wrong — tell me.
> - Build only what the phase requires. If you spot something the next phase needs, note it in `memory.md`; don't build it.
> - When a design choice isn't covered by `SPEC.md`, ask. Don't infer.
> - Prefer boring and working over clever. This is a fun project — I'd rather read the code in a month than admire it now.
> - Comments explain *why*, never *what*.
>
> **Start with Phase 0.** Set up the structure, then stop and show me what you've done before touching Phase 1.

---

## Verified stack — checked 2026-08-21

Confirmed against the npm registry and the live docs on this date. **Three of these would have silently broken the build**, which is exactly why the "read the docs first" rule above exists. Re-verify if you start this project months from now.

| Package | Use | Why this one |
|---|---|---|
| `colyseus` (server) | `0.17.10` | This is `latest`. **`0.18.3` exists but sits on the `next` tag** — no stable client pairs with it and the docs are still v0.17. Don't reach for the bigger number. |
| `@colyseus/sdk` (client) | `0.17.43` | ⚠️ **The client package was renamed.** `colyseus.js` is frozen at `0.16.22` (Oct 2025). Install `@colyseus/sdk`. |
| `@colyseus/schema` | `4.x` (`4.0.31`) | `@colyseus/sdk@0.17.43` pins `^4.0.7` and the server line agrees. `5.0.14` is on `next` — it pairs with 0.18, not 0.17. |
| `create-colyseus-app` | `0.17.1` | Scaffolds the 0.17 server. |
| `three` | `0.185.1` | |
| `@react-three/fiber` | `9.7.0` | ⚠️ peer range is `react >=19 <19.3`. See the React row. |
| `@react-three/drei` | `10.7.8` | peers `@react-three/fiber@^9`. |
| `react` / `react-dom` | **`~19.2.8`, not `^19.2.8`** | ⚠️ `^` permits 19.3+, which falls outside R3F's peer range. Pin to the minor — the repo currently has the caret. |
| `pyodide` | `314.0.5` | New scheme: the major tracks Python, so `314` = **Python 3.14**. `315.x` is alpha. |
| `@supabase/supabase-js` | `2.112.3` | |
| `@codemirror/lang-python` | `6.2.1` | |

**API facts that differ from anything older you'll find:**

- Client import is `import { Client, Callbacks } from "@colyseus/sdk"`.
- State callbacks go through a handler now: `const callbacks = Callbacks.get(room)`, then `callbacks.onAdd("players", cb)`. The old `room.state.players.onAdd(...)` form is gone.
- `@type()` decorators are **still current** — the schema classes in `SPEC.md` are correct as written. (A function-based `schema()` API also exists, aimed at plain JS.)
- `tsconfig.json` needs `experimentalDecorators: true` and `useDefineForClassFields: false`, or state sync misbehaves in ways that look like your code is wrong.
- Typed client: `new Client<typeof server>(url)` with `import type { server } from "../../server/src/app.config.ts"`. `import type` keeps server code out of the client bundle — this is the official cross-package typing seam, and it shapes the repo layout.
- Schema limits: 64 synchronizable fields per class; map keys are string-only.

---

## Phases

> **[`PLAN.md`](./PLAN.md) is the operative plan** — it carries the review decisions, per-phase acceptance criteria, and the test seams. What follows is the index. Where the two differ, `PLAN.md` wins.
>
> Also read [`../docs/research/interpolation-collision-grading.md`](../docs/research/interpolation-collision-grading.md) before Phases 1, 2, and 5. It has the reference algorithms and the one bug that will otherwise bite you.
>
> **v1 is Phases 1–6.** Old Phase 0 is folded into Phase 1 (it had no visible result). Leaderboards and sessions are cut — ship the duel, play it, then decide.

**Phase 1 — Foundation, world, and movement**
npm workspaces (`client/`, `server/`, `shared/`), server scaffolded with `npm create colyseus-app@0.17.1`. Install into `client/`: `three @react-three/fiber @react-three/drei @colyseus/sdk @supabase/supabase-js` — note `@colyseus/sdk`, **not** the retired `colyseus.js`. Repin `react`/`react-dom` from `^19.2.8` to `~19.2.8` for R3F's peer range, and set `experimentalDecorators` / `useDefineForClassFields: false` in the server tsconfig. Then: world from a committed generator script, `InstancedMesh` rendering, blocky character, WASD + mouse-look, third-person camera, grid-lookup collision — **with `dt` clamped**, see `PLAN.md`.
*Verified when:* you walk around, can't clip through anything, and tab-switching away for ten seconds doesn't drop you through the floor.

**Phase 2 — Multiplayer**
Colyseus `WorldRoom`, `Player` schema, client sends `move` at ~15Hz. Remote players rendered with ~100ms interpolation buffer.
*Verified when:* two browser tabs, both characters visible, movement is smooth and not stuttery. **This is the milestone — spend time here.**

**Phase 3 — Identity**
Supabase auth, `profiles` table with RLS, six preset characters, character select screen, name tags above avatars, JWT verified in Colyseus `onAuth`.
*Verified when:* you log in, pick a character, and the other tab sees your username.

**Phase 4 — Chat**
World chat via Colyseus room messages. Ephemeral, no persistence, no database.
*Verified when:* two tabs can talk.

**Phase 5 — Solo solve**
Problems JSON (~15 hand-written), CodeMirror 6 with Python mode, Pyodide in a dedicated Web Worker, lazy-loaded. Test harness runs inside Python and returns JSON. Timeout via `worker.terminate()` and respawn. Writes a `submissions` row.
*Verified when:* you solve a problem, tests pass, an infinite loop gets killed cleanly, and the row lands in Postgres. **Hardest technical piece — no networking involved, which is the point.**

**Phase 6 — Duel**
Click a player → challenge → accept → `DuelRoom` with seat reservations. Blind race: opponent's tests-passed count, focus dot, server-owned 15-minute timer, forfeit button. Paste blocked. Full-screen takeover with the Canvas hidden and `frameloop="never"`. **The server grades** — the client submits actual outputs, the server compares against hidden expected outputs. Winner recorded, stats updated.
*Verified when:* two tabs complete a real duel, the winner's stats change, and a forged `testsPassed` message does not win.

**Then stop.** Play it. Decide leaderboards and sessions from what people ask for, not from this document.

---

## One note

Phase 5 before Phase 6 looks like a detour. It isn't — Pyodide's worker lifecycle is the thing most likely to eat a weekend, and debugging it while also debugging room state is how projects stall. Solve it alone, then wire it up.
