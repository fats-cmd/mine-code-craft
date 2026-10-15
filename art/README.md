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
