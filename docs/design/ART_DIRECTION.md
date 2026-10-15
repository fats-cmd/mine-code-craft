# Art direction: clean voxel, low poly

The look of the Tower, set 2026-10-14 from the owner's four references:

- a low-poly voxel city;
- a voxel anime character (style only, not that character);
- a diorama of trees, cliffs and water;
- a floating voxel island.

The aim is a **clean voxel diorama**, not a Minecraft look. Decision record: [ADR-0012](../adr/0012-voxel-art-direction.md).

## What makes it "clean voxel" rather than "Minecraft"

| Do | Don't |
|---|---|
| Flat vertex colours, no textures | Pixel-art block textures |
| Soft **baked ambient occlusion** in every crease and corner (the mesher does it) | Hard, uniformly lit cubes |
| Subtle colour variation per tile, plank or brick (±4–8 % brightness) | Noisy per-voxel speckle, or perfectly flat fills |
| A bright, warm palette with a few saturated accents per room | Desaturated greys and browns everywhere |
| Small voxels for characters and props (0.1–0.25 m), larger for architecture (0.5 m) | One block size for everything |
| A light sky, gentle fog, one warm sun with soft shadows | Dark interiors lit only by point lights |
| Readable silhouettes: pillars, cornices, framed doorways | Featureless boxes |

## Scales

| What | Voxel size | Where it's built |
|---|---|---|
| Architecture (floors, walls, pillars, ledges) | **0.5 m** | `apps/client/src/floor/rooms.ts` through `VoxelBuilder` |
| Big props (cogs, the Exam Gate, the Analytical Engine) | 0.25 m | `apps/client/src/floor/models.ts` |
| Climbers, Examiners, small props, henchmen | **0.1 m** (Climbers are 18 voxels tall) or 0.125 m | `apps/client/src/avatar/avatarVoxels.ts`, `models.ts` |

Architecture and colliders come from the same call: `solid(min, max, paint)` adds a box collider and fills the box with voxels, so what you see is what you bump into. Boxes sit on the 0.5 m grid. `deco()` is walk-through decoration and `clear()` cuts voxels (never colliders).

## Characters

Climbers are built from parts (head, torso, two arms, two legs), each a voxel grid around its own pivot, so walking is just rotating the limb groups. Current choices (a first pass, see [CHARACTERS.md](./CHARACTERS.md)):

- Big head (5×5×5 voxels) on a compact body: the anime-chibi proportion from the reference.
- Eyes are always visible, two dark voxels. Visors (band, goggles, shades) sit over them.
- Hair is the main way to tell people apart, in the accent colour. Hand-made hairstyles come from MagicaVoxel and are painted in greys so they take the player's colour.
- Builds (slim, regular, broad) change width, never height: the physics capsule is the same for everyone.
- Players dress Climbers in the Locker and can paint markings onto existing voxels. Slots, code locations and the `.vox` workflow: [CHARACTERS.md](./CHARACTERS.md).
- NPC extras (Babbage's top hat and sideburns) exist only for NPCs.

## Palette per Floor 1 room

The walk goes from **warm sandstone and wood** (Arrival, Abacus, Loom, Archive) to **brass and stone** (Gear Works), **dusk** (Moth Room) and **teal machine light** (Engine Room, Testing Hall). Each room has five colours in `STYLE` (rooms.ts): floor, wall, trim, cap and lamp. Glowing pieces (threads, screens, pads, the Gate) use the unlit `GLOW` material, so they read as light sources without real lights.

## Performance rules

- One merged mesh per room (plus one for its glow). The mesher **merges flat, same-coloured faces** into bigger quads. That is why colour variation is per tile, plank or brick, never per voxel: whole tiles become single quads (Floor 1 dropped from 163k to 60k triangles).
- The underside of the ground is never meshed (`hideDownBelow: 0`).
- Rooms further than the fog (`FOG_FAR`) are hidden. Their colliders stay.
- One shadow-casting sun. Its shadow camera follows the Climber and snaps to whole texels, so shadow edges don't crawl.
- If frames get slow, the renderer drops resolution first, then shadows (`PerformanceMonitor` in `App.tsx`).

## Making art

- **In code** (what Floor 1 uses now): `VoxelBuilder` for architecture and `VoxelModel` for props. This is fast to iterate and needs no assets in git.
- **[MagicaVoxel](https://ephtracy.github.io/)** for hand-made models (bosses, hero props, Climber cosmetics). Export to `.vox`. A `.vox` → `VoxelGrid` loader is the next tool to add when the first hand-made model arrives. It keeps the same mesher, AO and merge path, so imported models match the code-built ones.
- Blender stays for anything that isn't voxel (rare from here on).
