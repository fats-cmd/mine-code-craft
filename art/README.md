# art

Source art for the game. Not shipped; the game ships the compressed exports in `apps/client/public/models/`.

```
art/
  floor-01/        .blend, textures, references for the Testing Floor
  shared/          Climber parts, Punch, UI art reused across floors
  exports/         .glb exported from Blender, input to `npm run model`
  templates/       MagicaVoxel templates to sculpt avatar parts on (generated: `npm run vox:templates -w apps/client`)
  CREDITS.md       every third-party asset and its licence
```

Workflow and settings: [`../docs/TOOLING.md`](../docs/TOOLING.md#blender--game).

## Comparing art styles: `/art-test`

Open `/art-test` (e.g. http://localhost:5173/art-test) to see the same character as a Blender `.glb` (left) and a MagicaVoxel `.vox` (right), side by side under the game's own light, with a Climber for scale. Drop a file anywhere on the page, or use **Load…**. Copies at `apps/client/public/art-test/firstbug.glb` and `firstbug.vox` load on open.

Each side shows its triangles, meshes (about one draw call each), materials, textures, file size and animations. The `.glb` plays its first animation. Camera buttons give the in-game distance, a close-up and a top view; **Same height** scales both to the slider's height so only the style differs.

Export from Blender as **glTF Binary (.glb)**. A `.vox` voxel is 0.1 m, like the code-built henchmen.
