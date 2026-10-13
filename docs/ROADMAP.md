# Roadmap

Milestones in build order. Each one ends in something you can **see working in the browser**. If a milestone has no visible result, it's scoped wrong. Finish and play each milestone before starting the next. Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md). Terms: [`../CONTEXT.md`](../CONTEXT.md).

**v0.1 (first playable) = M0–M4.** v0.2 = M5. Everything after that depends on what players actually do.

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

### M4 — Duels  → **v0.1**
- Walk-up challenge flow in the Base. `DuelRoom` with best of 3 (Quiz + Code in v0.1). Server clock, focus dot, forfeit, 30 s reconnect window.
- Battle takeover UI (Canvas hidden, `frameloop="never"`, never unmounted).
- Glicko-2 rating (unit tested). `matches`/`rounds` writes. Simple leaderboard page.
- Ranked vs Casual flag exists (Perks don't yet).

**Done when:** two accounts play a full Duel from a walk-up challenge. The winner's Rank goes up. A forged "I passed" message doesn't win. Returning to the Base is instant, and your avatar showed as `battling` the whole time.

**→ Stop. Get real people to play v0.1.**

### M5 — Queue, Stations, all four Formats  → v0.2
- `QueueRoom` with Rank-window matchmaking (Ranked + Casual). HUD queue button.
- Stations in the Base (practice Trial, format-specific queue).
- Fix and Predict formats in the pipeline and UI. Round 2 enabled. Content up to the pre-launch targets.

### M6 — Progression
- XP and Levels, Mastery per Topic, profile page with Mastery chart.
- Cosmetics inventory, earned unlocks, Titles on nameplates.

### M7 — The Tower
- Floors and Floor Tests (TrialRoom). `highest_floor` on nameplates. A Tower view showing progress.

### M8 — Roles & Perks
- Role selection at Level 5, Perk Trees, equip up to 3.
- Server-authoritative `perk:use` in Casual Duels and Trials. Ranked lockout (unit tested). Effect visuals.
- Balance pass from Casual match data.

### M9 — Boss Floors: the Meta Legion
- Minion waves, HP, Guardian multi-phase Code Challenge, Zark presentation.
- First Boss Floor at Floor 5. Title *Breaker of the Meta Legion*.

### M10 — Public launch readiness
- Redis presence and driver, multiple server processes, sticky sessions, deployment (measure regions on the real host).
- Custom SMTP for auth email. Rate limits, chat/name filtering, report/block/mute, abandonment cooldowns.
- Logs and metrics. Content-bug alarm on grading disagreements.

---

## Not planned (say so in an ADR if this changes)

Mobile/touch · voice · spectating and replays · server-side code execution · languages beyond Python/JS · real-money purchases · co-op raids and live world events (the Boss design leaves room for both later) · friends lists and parties (after M10) · user-generated content.
