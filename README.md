# mine-codecraft

A browser 3D game where players meet in a shared hub, battle each other on computer-science challenges, and climb a tower. Start with [`CONTEXT.md`](CONTEXT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Run it

Node 22+.

```sh
npm install
npm run dev        # client on http://localhost:5173
```

Click the canvas to capture the mouse. WASD moves, Shift runs, Space jumps, Esc releases the mouse. Add `?debug` to the URL to draw the physics colliders.

## Layout

| Path | What |
|---|---|
| `apps/client` | React + R3F + Rapier game client |
| `packages/shared` | Pure TS shared by client and (later) server, unit tested |
| `server/problems` | Duel problem sources and generator (`python3 server/problems/build_problems.py`) |
| `shared/problems` | Generated public problem files |
| `docs/` | Architecture, roadmap, ADRs, research |

## CI

The workflow is at `docs/setup/ci.yml` for now. The token Claude pushes with can't create workflow files, so move it into place from your own machine:

```sh
mkdir -p .github/workflows && git mv docs/setup/ci.yml .github/workflows/ci.yml
```

## Checks

```sh
npm run lint && npm run typecheck && npm test && npm run build
```
