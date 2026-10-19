# Art exploration (open)

A running record of how the owner is choosing the art pipeline for characters. **Nothing here is decided yet.** The current rules still hold: voxel art ([ADR-0012](../adr/0012-voxel-art-direction.md), [ART_DIRECTION](./ART_DIRECTION.md)), with Ada and every boss hand-made in MagicaVoxel (GAME_DESIGN, "Bosses look the part"). When the owner picks, a new ADR records the choice, and ADR-0012 and the boss rule are updated to match. Until then, those documents stay as they are.

For now, work focuses on game logic and story while the owner learns to make voxel models.

## The question

How should characters (henchmen, Examiners, NPCs) be made?

1. **Hand-made voxel** in MagicaVoxel or VoxEdit: today's rule.
2. **AI-generated voxel**, cleaned up by hand in MagicaVoxel.
3. **Blender-style `.glb`**: smooth low-poly, rigged and animated.

The look the owner wants is high-resolution voxel art like a MagicaVoxel render: chunky but detailed, with a limited palette and soft light. The reference was a white voxel wolf, roughly 80–100 voxels long.

## The test bench: `/art-test`

A dev page (`apps/client/src/artTest/ArtTest.tsx`) that shows two versions of a character side by side under the game's own light, with a Climber for scale. Either side takes a `.glb` or a `.vox`, and each side shows triangles, meshes, materials, textures, file size and animations. How to use it: [`art/README.md`](../../art/README.md).

Judge models at **Game distance**, not only close up: that's how players see them.

## Findings

### 2026-10: the first AI-generated moth (Firstbug)

| | Generated `.vox` | Today's code-built Firstbug |
|---|---|---|
| Size | 32 × 15 × 11 voxels (859 voxels) | about 14 × 12 × 2 |
| Colours | 96 | 5 |
| Triangles | about 2,550, in 1 draw call | 590, in 2 draw calls |
| File | 4 KB | none (built in code) |

- **Works:** it loads into the game unchanged and is cheap. It clearly reads as a moth, and its wing shading is richer than the code-built one.
- **Doesn't, yet:** it's low resolution, so it looks crude up close. It has no readable face, which a henchman needs. Its colours drifted to magenta and maroon instead of the lavender and brown asked for.
- **Next try:** ask for more detail (about 64 voxels wide), make the face the focus, and fix the palette in MagicaVoxel if it drifts.
- **Takeaway:** one default-settings generation shows what the generator does, not what the style can do.

### Lighting gap

A MagicaVoxel render uses soft, path-traced studio light. The game uses one sun, a sky fill and baked ambient occlusion, so the same model looks flatter and harsher in game. Screen-space AO and softer shadows would close most of that gap. This hasn't been tried yet.

## Generation prompts

Start every prompt with the shared style line, so all characters come out as one family:

```
High-detail voxel art game character in the style of MagicaVoxel, crisp visible cubes, clean limited palette, soft studio lighting, single character, full body, centered on a plain light background.
```

Use this negative prompt for all of them:

```
smooth surfaces, realistic, photo, blurry, multiple characters, text, logo, scenery, cluttered background, cropped, extra limbs
```

The colours match today's in-game models (`apps/client/src/floor/models.ts`, `TestingFloor.tsx`).

### Henchmen (Floor 1)

**Weftdart** (Loom Gallery, Quiz)
```
A small living loom shuttle creature: a pointed, boat-shaped wooden spindle with cyan-teal paint (#19c3d6) and white tips at both ends, two bright alert eyes on its side, trailing a long glowing thread of pale cyan light (#9ff6fa) behind it like a tail. Fast, darting, playful but sneaky. Floating, angled as if diving forward, three-quarter view.
```

**Holloquy** (Card Archive, Predict)
```
A living punched card from an old Jacquard loom or Babbage's Analytical Engine: a flat, upright cream paper card (#f2e6c9) with rows of small brown punched holes (#8a6a3a) and one clipped top corner. It has a face made of the holes: two eyes and an open mouth mid-speech, as if reading its own holes aloud. Tiny paper-fold arms. Bookish, chatty, a bit smug. Front three-quarter view.
```

**Cogsnap Tick** (Gear Works, Predict)
```
A brass cog creature that snapped loose from a giant clockwork machine: a thick round gear with 8 chunky teeth in warm brass (#c9a227) with darker worn edges, a hole in the centre, two eyes and a determined frown on its face. Little rivets, a scuff of oil. Rolling on its edge, ready to fight. Three-quarter view.
```

**Cogsnap Tock** (Gear Works, Predict): Tick's prompt with three changes: brighter orange-brass (#e2a227), a furious scowl, and one chipped tooth with a small crack. Angrier than its twin.

**Firstbug** (Moth Room, Fix)
```
A cute but mischievous voxel moth creature, game enemy character. Chunky fuzzy body in dark brown (#5a4a3a) with a lighter tan belly, two big feathery antennae, large round wings in soft lavender (#b9a7ff) with darker purple edge shading, and one glowing pale-yellow eye spot (#fff0b0) on each wing. Large expressive face with big glowing eyes facing the viewer, the face is the focus, with a cheeky, troublemaking look; small legs tucked under the body. Wings spread wide, symmetrical, front three-quarter view, neutral hovering pose. Inspired by the moth found in the Harvard Mark II computer in 1947, the "first actual case of bug being found".
```

### Examiners

These are real people, so the prompts aim for dignity, never comedy ([ADR-0010](../adr/0010-historical-figures-as-examiners.md)). Generate them in an **A-pose**, so they can be rigged later.

**Charles Babbage** (Floor 1 boss)
```
Charles Babbage, the Victorian mathematician and inventor of the Difference Engine, in his fifties around 1840. Proud, stern, sharp-eyed expression with raised eyebrows. Receding hairline with grey-white side whiskers (#c8c8c8), clean-shaven chin. Tall black top hat, dark charcoal-navy frock coat (#2b2f3a) with a high white collar and dark cravat, waistcoat with a brass watch chain, dark trousers (#1e1e24), black boots. Holds a small brass gear in one hand. Dignified, gruff but fair, a respected examiner, not a villain. Standing in an A-pose, front three-quarter view.
```

**Ada Lovelace** (watches Floor 1; Floor 2's Examiner)
```
Ada Lovelace, the mathematician who wrote the first computer program, in her late twenties around 1843. Intelligent, confident, poised expression with a faint knowing smile. Dark brown hair (#3b2416) centre-parted and gathered into a low bun with ringlets at the sides. Plum-purple Victorian gown (#6b2d5c) with a fitted bodice, a lace collar, and a full skirt in a darker plum (#5a2450). Holds a folded handwritten note covered in mathematical symbols, with faint glowing woven threads curling from it. Elegant and proud, a respected examiner, never a villain. Standing in an A-pose, front three-quarter view.
```

### Tips

- **Same resolution for every character,** so voxel sizes match side by side.
- **Ask for separate parts** (head, torso, arms, legs) where the tool allows, so the model can be animated.
- **Plan to fix faces and hands** in MagicaVoxel. A generated face rarely looks "good and authentic" as it comes out.
- **Scale:** a `.vox` voxel is 0.1 m in game. A henchman is about 20–30 voxels across; a person is about 17–18 voxels tall.
- **Licences:** a model taken from Sketchfab or itch.io needs a licence that allows commercial use and modification, and an entry in `art/CREDITS.md`.

## Log

- **2026-10:** compared Blender `.glb` against voxel and leaned voxel after seeing high-detail voxel references. Built `/art-test`. Tested the first AI-generated moth (above). The owner is learning to make voxel models; the decision is deferred. ADRs are unchanged.
