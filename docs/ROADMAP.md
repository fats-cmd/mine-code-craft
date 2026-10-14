# Roadmap

Milestones in build order. Each one ends in something you can **see working in the browser**. If a milestone has no visible result, it's scoped wrong. Finish and play each milestone before starting the next. Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md). Terms: [`../CONTEXT.md`](../CONTEXT.md).

**v0.1 (first playable) = M0–M4: the Testing Floor, end to end.** Re-planned 2026-10-14 around floors (see [`design/GAME_DESIGN.md`](./design/GAME_DESIGN.md)). Everything after that depends on what players actually do.

---

### M0 — Foundation ✅
- The first-person cannon `Player.tsx` + `useKeyboard` are replaced by the Rapier `apps/client/src/avatar/Player.tsx` and drei `KeyboardControls`.
- npm workspaces: `apps/client` (move `Interactive_plane/`), `apps/server`, `packages/shared`, `content/`.
- Swap `@react-three/cannon` for `@react-three/rapier`. Static colliders on your Base meshes. Kinematic character controller, WASD + mouse-look, third-person camera, `dt` clamped to 0.1 s.
- Repin `react`/`react-dom` to `~19.2.x` (R3F's peer range stops before 19.3).
- Vitest in `packages/shared`. CI runs lint, typecheck and tests on every PR (workflow parked at `docs/setup/ci.yml` until moved into `.github/workflows/`).
- Ignore `__pycache__/` and untrack the committed `.pyc` files.

**Done when:** you walk around your Base, slide along walls, climb steps, and tabbing away for 10 s then back doesn't drop you through the floor.

### M1 — The Base is multiplayer ✅
- Scaffold the Colyseus server. `BaseRoom` with the `Climber` schema, `move` at 15 Hz, server speed/bounds checks.
- Remote avatars with the 100 ms interpolation buffer (`packages/shared/interpolation`, unit tested).
- Instancing: `maxClients` set low (e.g. 3) for testing, so you can watch a second instance open.

**Done when:** two tabs see each other move smoothly. A throttled tab degrades gracefully instead of teleporting. A fourth tab lands in a new instance.

### M2 — Identity

**M2a: Guest identity ✅**
- Character creator: name plus look (3 colours, and hair / headwear / eye parts), remembered in `localStorage`, with an "Edit character" button in the Base.
- The server validates name and look from join options (reserved names, `Name#2` on clashes, lenient look parsing). Real names and looks show in the Base.
- World chat: Enter to talk, a chat log, speech bubbles, join/leave notices. Ephemeral, cleaned, rate-limited, escaped on render. Typing doesn't move the avatar.

**Done when:** two tabs see each other's chosen names and looks and can talk, and markup in chat shows as text.

**M2b: Sign-in (deferred until the owner decides)**
- Supabase project and `supabase/migrations`. GitHub, Google and email sign-in. `profiles` + RLS.
- Name and look move from join options into the profile. JWT verified in `onAuth`.

**Done when:** two different accounts see each other's names and looks, and a tampered token is rejected.

### M3 — Challenge engine (solo, dev route `/trial/:slug`)
- Content pipeline. Migrate the 8 problems into `content/challenges/code/`. Add JS signatures and starters. Write the first ~20 Quiz questions.
- Pyodide worker and JS worker, timeouts via terminate and respawn, warm spares.
- Comparator in `packages/shared` (unit tested, including the JS number rule). `TrialRoom` grades on the server and writes a `submissions` row.
- Editor (CodeMirror 6, Python and JS modes) and the Quiz panel.

**Done when:** you solve a Code Challenge in both languages and a Quiz. `while True: pass` and `for(;;){}` are killed and the UI recovers. A wrong answer shows a useful diff. Rows land in Postgres.

### M4 — The Testing Floor  → **v0.1**
Floor 1 end to end, per [`design/floors/01-testing-floor.md`](./design/floors/01-testing-floor.md).
- **M4a: Greybox ✅:** Arrival, the five Timeline Walk rooms, the Engine Room and the Testing Hall built from primitives (`apps/client/src/floor/`). The Guide's lines on screen. Henchmen as glowing placeholders with Pass/Fail standing in for Tasks. Progress, Integrity, doors and the Gate of Notes work, the Hall is the only room where you see other players, and `?debug` has room teleports.
  - Known gap: on return you spawn at the Arrival Platform even after beating the boss (the doors stay open). M4c fixes it once the server knows your progress.
- **M4b: Tasks:** henchmen and the three boss phases run Challenges through the M3 engine. Integrity, phase checkpoints, the boss staying beaten, the Gate of Notes.
- **M4c: Floor-scoped Hall:** `BaseRoom` becomes `FloorRoom` with `filterBy(["floor"])` ([ADR-0009](./adr/0009-floor-scoped-presence.md)). The Testing Hall is Floor 1's Hall, with nameplates showing time on the floor.
- **M4d: Art and sound pass:** Blender models replace greybox pieces (`npm run model`), plus the audio list.

**Done when:** a brand-new player walks the Timeline, beats all five henchmen and Babbage & Lovelace, enters the Testing Hall, and sees the other Floor-1 players there.

**→ Stop. Get real people to play v0.1.**

### M5 — Duels in the Hall
- Walk-up challenge flow in the Floor Hall. `DuelRoom` with best of 3. Server clock, focus dot, forfeit, 30 s reconnect window.
- Battle takeover UI (Canvas hidden, `frameloop="never"`, never unmounted).
- Glicko-2 rating (unit tested). `matches`/`rounds` writes. Simple leaderboard.
- Ranked vs Casual flag (Perks don't exist yet).

**Done when:** two players on Floor 1 play a full Duel from a walk-up challenge, the winner's Rank goes up, and a forged "I passed" message doesn't win.

### M6 — Queue, Stations, Quests
- `QueueRoom` matchmaking per floor (Ranked + Casual). Practice Stations in the Hall. The quest board with the Floor 1 starter quests.

### M7 — Climbing: Floor Exam, Floor 2, the Fall
- Needs sign-in (M2b) for persistent floors.
- Floor Exam gate. `current_floor` on profiles. Floor 2 designed (own doc) and built.
- The Fall as proposed in [ADR-0011](./adr/0011-the-fall.md): Strikes, Stake Duels, grace, at most one floor per day.

### M8 — Progression
- XP and Levels, Mastery per Topic, profile page with a Mastery chart.
- Cosmetics inventory, earned unlocks (Brass Goggles, titles like *Engine Breaker*) on nameplates.

### M9 — Roles & Perks
- Role selection at Level 5, Perk Trees, equip up to 3.
- Server-authoritative `perk:use` in Casual Duels and Trials. Ranked lockout (unit tested). Effect visuals.

### M10 — More floors, up to the Meta Spire
- One floor per design doc: Setting, Henchmen, Boss, Hall. The top floor is Zark and the Meta Legion.

### M11 — Public launch readiness
- Redis presence and driver, multiple server processes, sticky sessions, deployment (measure regions on the real host).
- Custom SMTP for auth email. Rate limits, chat/name filtering, report/block/mute, abandonment cooldowns.
- Logs and metrics. Content-bug alarm on grading disagreements.

---

## Not planned (say so in an ADR if this changes)

Mobile/touch · voice · spectating and replays · server-side code execution · languages beyond Python/JS · real-money purchases · co-op raids and live world events (the Boss design leaves room for both later) · friends lists and parties (after M11) · user-generated content.
