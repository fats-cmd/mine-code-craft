# 0012 — Clean voxel art, meshed in code

**Status:** accepted · 2026-10-14

## Context
After playing the M4a greybox, the owner asked for "a cleaner voxel low poly look rather [than] a typical minecraft look" and shared references: a voxel city, a voxel anime character, a voxel diorama and a voxel island. The plan until then was Blender models replacing greybox boxes one at a time (M4d).

## Decision
- The game's look is **voxel**: flat vertex colours, baked ambient occlusion, a bright palette, one sun with soft shadows and a light sky. See [ART_DIRECTION.md](../design/ART_DIRECTION.md).
- Voxels are meshed **at load, in our own code**: `meshVoxels()` in `packages/shared` does face culling, AO and greedy merging. There are no texture or model files for architecture.
- Architecture is built with `VoxelBuilder`, whose `solid()` emits both the collider and the voxels, so the art can never drift from the physics.
- Climbers are voxel avatars built from parts with pivots and animated in code (walk, jump pose). There is no skeleton or Mixamo step for them.
- Hand-made models come from MagicaVoxel (`.vox`), loaded into the same mesher when the first one is needed.

## Consequences
- M4d becomes a voxel art and sound pass instead of a Blender pass. The `npm run model` pipeline stays for any non-voxel asset.
- Load does a little meshing work (Floor 1: about 0.4 s on a laptop CPU), and nothing is downloaded for it.
- Per-voxel colour noise is off-limits for large surfaces, because it defeats face merging. Variation goes per tile, plank or brick.
- Avatar customisation (M6 cosmetics) becomes "more voxel parts", which is cheap to add and to validate on the server.
