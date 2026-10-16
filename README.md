# mine-codecraft

A browser 3D game where players meet in a shared hub, battle each other on computer-science challenges, and climb a tower. Start with [`CONTEXT.md`](CONTEXT.md), [`docs/design/GAME_DESIGN.md`](docs/design/GAME_DESIGN.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md). Making art or sound? Read [`docs/TOOLING.md`](docs/TOOLING.md).

## Run it

Node 22+.

```sh
npm install
npm run dev        # game server on :2567 and client on http://localhost:5173
```

Open two browser tabs to see each other move. The client also runs on its own (`npm run dev:client`): without a server it shows "offline" and plays solo.

| Variable | Where | Default |
|---|---|---|
| `VITE_SERVER_URL` | client | `http://localhost:2567` |
| `PORT` | server | `2567` |
| `BASE_MAX_CLIENTS` | server | `50` (set it to `3` to watch new Base Instances open) |

Pick a name and look, then **Enter the Base**. Click the canvas to capture the mouse. WASD moves, Shift runs, Space jumps, **E** faces a henchman or the Examiners, Enter opens chat, Esc or F releases the mouse.

You start on **Floor 1, the Testing Floor** (greybox): walk the Timeline, beat the henchmen and Babbage & Lovelace, then meet other players in the Testing Hall. Add `?debug` to the URL for collider outlines, an FPS overlay, your position, and a tweak panel with teleports to every room (expand **Floor 1** in it).

**Trials:** open `/trial` (e.g. http://localhost:5173/trial) to play any Challenge on its own: write Code or Fix in Python or JavaScript, answer a Quiz, or Predict an output. Your code runs in the browser and the server grades it. Python loads the first time you use it (about 10 MB). After editing anything in `content/challenges/`, run `npm run content`.

## Layout

| Path | What |
|---|---|
| `apps/client` | React + R3F + Rapier game client |
| `apps/server` | Colyseus game server (`BaseRoom`) |
| `packages/shared` | Pure TS shared by client and (later) server, unit tested |
| `content/` | Challenge sources (Code, Fix, Predict, Quiz) and the build (`npm run content`) |
| `docs/` | Game design (`design/`), architecture, roadmap, ADRs, tooling |
| `art/` | Blender sources and exports (Git LFS), credits |

## CI

The workflow is at `docs/setup/ci.yml` for now. The token Claude pushes with can't create workflow files, so move it into place from your own machine:

```sh
mkdir -p .github/workflows && git mv docs/setup/ci.yml .github/workflows/ci.yml
```

## Checks

```sh
npm run lint && npm run typecheck && npm test && npm run build
```
