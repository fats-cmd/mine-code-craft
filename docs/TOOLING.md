# Tooling

Everything used to make the game: what's already wired into the repo, and the free outside software that goes with it. Each item explains when you'd reach for it.

---

## In the repo (nothing to install beyond `npm install`)

| Tool | Use it for | How |
|---|---|---|
| **Debug mode** | Seeing what the engine sees: collider outlines, an FPS/CPU overlay, your live position (for placing pieces), and a Leva tweak panel for live values | Add `?debug` to the URL: `http://localhost:5173/?debug`. Click the small ▸ on the panel's title bar to expand it. |
| **Floor teleports** | Jumping straight to any room, beating all henchmen, resetting floor progress | `?debug` → expand **Floor 1** in the panel. Online, the server must run with `--dev-teleport`, which `npm run dev` does. |
| **Leva** | Tuning numbers live (speeds, light colours, camera distance, boss timings) without reloading | `useControls("Lighting", { intensity: 1 })` in any component. It shows only with `?debug`; normal players get the default. Shared debug switches are in `src/dev/devTools.ts`. |
| **`npm run model`** | Turning a Blender export into a game-ready model **and** a typed React component | See *Blender → game* below |
| **Draco decoder** | Decoding compressed models, served from our own `/draco/` folder rather than Google's CDN | Automatic: copied from `three` before every `dev` and `build` |
| **Vitest** | Unit-testing game rules (movement, chat, names, later: Integrity, Strikes) | `npm test` |
| **Playwright** | Driving the real game in a browser to check a feature end to end | Used by Claude during development; Chromium is preinstalled in cloud sessions |

## Blender → game

1. Model in Blender. **1 unit = 1 metre**, and the Climber is 1.8 m tall. Apply transforms (`Ctrl+A → All Transforms`) before export.
2. Save the `.blend` in `art/<floor>/` and export **glTF Binary (`.glb`)** to `art/exports/` with *Apply Modifiers* on, *+Y Up* on, and *Compression* off (our script compresses).
3. Run:
   ```sh
   npm run model -- art/exports/difference-engine.glb    # from the repo root
   ```
   That writes:
   - `apps/client/public/models/difference-engine.glb`: Draco-compressed geometry with textures resized to WebP.
   - `apps/client/src/world/models/DifferenceEngine.tsx`: a component with every mesh and material named and typed.
4. Use it like any component:
   ```tsx
   import { DifferenceEngine } from "./models/DifferenceEngine"
   <DifferenceEngine position={[-6, 0, 0]} />
   ```
   For collisions, wrap it in `<RigidBody type="fixed" colliders="trimesh">`. For big static pieces, prefer simple `CuboidCollider`s: they're cheaper and smoother to walk on.

**Name things in Blender.** Object and material names become property names in the component (`nodes.Wheel_3`, `materials.Brass`). Good names make animating parts easy, e.g. jamming the engine's third column.

Extra `gltfjsx` flags pass straight through: `--instance` for props repeated many times, `--keepnames`, and `--name MyName` to choose the component name.

---

## Outside software (all free)

### Must-have

| Software | For | Notes |
|---|---|---|
| **[Blender](https://www.blender.org/)** | Every 3D model: rooms, engines, bosses, henchmen | The standard. Low-poly modelling plus its built-in glTF exporter is all we need. |
| **[Mixamo](https://www.mixamo.com/)** | Rigging and animating humanoids (Ada, Babbage, later Climbers): idle, talk, gesture, bow | Free with an Adobe account. Upload an unrigged character, auto-rig it, download animations as FBX, import into Blender, export `.glb`. |
| **VS Code** with *ESLint*, *Tailwind CSS IntelliSense*, *glTF Tools* | Code, plus previewing `.glb` files inside the editor | |

### Textures and 2D

| Software | For |
|---|---|
| **[Krita](https://krita.org/)** | Painting textures, UI art, boss portraits and title cards |
| **[Material Maker](https://www.materialmaker.org/)** | Procedural materials (brass, oak, iron, circuit traces) exported as texture maps |
| **[Inkscape](https://inkscape.org/)** | Vector icons and HUD elements |

### Sound and music

| Software | For |
|---|---|
| **[Audacity](https://www.audacityteam.org/)** | Recording, cutting and cleaning sound effects |
| **[jsfxr](https://sfxr.me/)** | Quick game sounds in the browser: hits, pickups, UI blips |
| **[BeepBox](https://www.beepbox.co/)** / **[LMMS](https://lmms.io/)** | Music: BeepBox for sketching, LMMS for full tracks |
| **[Freesound](https://freesound.org/)** | Recorded sounds (gears, steam, crowds). **Check each sound's licence**: prefer CC0, and credit CC-BY sounds. |

### Free 3D assets to start from (CC0)

[Kenney](https://kenney.nl/assets), [Quaternius](https://quaternius.com/) and [Poly Pizza](https://poly.pizza/) are good for placeholders and props while the hero models are being made. **Check the licence on every download** and keep a list in `art/CREDITS.md`.

### Inspecting and debugging

| Tool | For |
|---|---|
| **[gltf.report](https://gltf.report/)** | Drop a `.glb` in to see its size, triangle count, textures and what's heavy |
| **[three.js editor](https://threejs.org/editor/)** | Opening a `.glb` to check scale, pivots and materials outside the game |
| **Spector.js** (browser extension) | Capturing one frame to see every draw call when the game gets slow |
| **React Developer Tools** (browser extension) | Inspecting component state and props |

### Planning

| Tool | For |
|---|---|
| **[Excalidraw](https://excalidraw.com/)** | Floor layouts and boss-arena sketches (export PNGs into `docs/design/`) |
| **[Figma](https://www.figma.com/)** | HUD and battle-UI mockups |
| **GitHub Issues / Projects** | Tracking every asset and Task, e.g. one issue per item in a floor's asset list |

---

## Storing art in git

`.blend`, `.psd` and `.kra` files are large binaries. The repo's `.gitattributes` routes them through **Git LFS**, so they don't bloat history:

```sh
git lfs install     # once per machine
```

GitHub's free LFS quota is 1 GB of storage and 1 GB of bandwidth a month. Plenty for one floor; keep an eye on it as the art grows. Exported `.glb` files in `apps/client/public/models/` stay in normal git, because they're small after compression and the game needs them.
