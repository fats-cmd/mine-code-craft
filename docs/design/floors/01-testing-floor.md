# Floor 1: The Testing Floor

> *"The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves."*
> Ada Lovelace, 1843

The first floor of the Tower and the entrance exam. A new Climber walks through the origins of computing and learns every way the game is played. Then they must beat the first two people who ever imagined a programmable machine: **Charles Babbage** and **Ada Lovelace**. Only after that do they reach the **Testing Hall**, where everyone else on Floor 1 is.

Follows the floor anatomy in [`../GAME_DESIGN.md`](../GAME_DESIGN.md): **Setting → Henchmen → Boss → Floor Hall → Floor Exam**.

---

## 1. Setting: the Engine Hall

A Victorian engine house *inside* a computer. Brass, oak, iron and gaslight, with the machinery quietly glowing teal where data flows. As you walk it, it slowly turns modern: the floor goes from wooden boards to circuit-board traces, the light from gas lamps to LEDs. That gradient *is* the story, from the loom to the machine you're playing on.

**Mood:** wonder first, then pressure. Calm and museum-like at the start. The engines grow louder as you approach the boss.

**Narrator:** **the Guide**, the Tower's guide, an original character who explains each mechanic in one or two lines and reappears on later floors. Its **name and design are still to come**; Ronald will design it. In the greybox it's a small floating light.

## 2. Layout

```
                         ┌──────────────────────────┐
                         │      TESTING HALL        │  shared · all Floor-1 Climbers
                         │  stations · duel pads ·  │
                         │  quest board · EXAM GATE │──► Floor 2
                         └────────────▲─────────────┘
                                      │  the Gate of Notes (opens on victory)
                         ┌────────────┴─────────────┐
                         │     THE ENGINE ROOM      │  BOSS: Babbage & Lovelace
                         │  Difference Engine (L)   │
                         │  Analytical Engine (C)   │
                         │  Ada's desk & Notes (R)  │
                         └────────────▲─────────────┘
                                      │
    ┌─────────────────────────────────┴───────────────────────────────┐
    │                       THE TIMELINE WALK                         │  solo
    │  ① Abacus Court → ② Loom Gallery → ③ Card Archive →             │
    │  ④ Gear Works → ⑤ The Moth Room                                 │
    └─────────────────────────────────▲───────────────────────────────┘
                                      │
                              ARRIVAL PLATFORM  (spawn, the Guide says hello)
```

The **Timeline Walk** is one route with five rooms. Each room teaches one thing and ends in a henchman. Sizes are small on purpose: about 3–5 minutes to walk through without stopping. Total time to the boss is 10–15 minutes for a newcomer.

## 3. The Timeline Walk: tutorial and henchmen

Each room teaches either a **game mechanic** or a **Task Format**, then tests it with a henchman. Henchmen are short Challenges (difficulty 1–2) with a themed creature or object around them.

| # | Room | Teaches | Henchman | Task |
|---|---|---|---|---|
| ① | **Abacus Court** | Walking, camera, jumping across giant abacus beads | none, just movement | Reach the far side |
| ② | **Loom Gallery**: a towering Jacquard loom weaving glowing thread | **Quiz** format | **Shuttle Sprite**: a darting loom shuttle | Quiz: 3 questions on what a program, an input and an output are |
| ③ | **Card Archive**: walls of punched cards | **Predict** format | **Punched Card**: a card that reads itself aloud | Predict: the output of a 3-line loop |
| ④ | **Gear Works**: giant meshing cogs, some jammed | Reading code; difficulty ramps | **Loose Cog** (×2) | Predict: a simple arithmetic sequence, then a counter in a loop |
| ⑤ | **The Moth Room**: a dark relay cabinet with one moth fluttering inside | **Fix** format | **The Moth**: a nod to the moth found in the Harvard Mark II relay in 1947, logged as the "first actual case of bug being found" | Fix: an off-by-one in a loop that sums a list |

**Code** (writing a function from scratch) is introduced in the boss fight itself, with Ada as the teacher. That gives the boss a job beyond being a wall.

Every henchman uses the shared battle UI (M3). A fail costs one **Integrity** point and lets you retry with a new question. Henchmen never block progress permanently.

## 4. Boss: the Examiners, Babbage & Lovelace

**Framing:** they aren't villains. They're **the Examiners** of the first floor: proud, sharp and fair. Babbage is gruff and impatient with sloppy thinking. Ada is quick, poetic and challenging. When you win, they step aside and Ada says the line that opens the Gate. Portray both respectfully ([ADR-0010](../../adr/0010-historical-figures-as-examiners.md)).

**Arena:** the Engine Room.
- **Left:** a full-size **Difference Engine**. The real Difference Engine No. 2 was finally built by the Science Museum, London, in 1991.
- **Centre:** the unbuilt **Analytical Engine**, rising from the floor in glowing wireframe.
- **Right:** Ada's desk, with the **Notes** floating as pages of light.

**Climber Integrity:** 5 points. A wrong answer costs 1, a timeout costs 1. At 0 you're "returned to the Walk's end" and retry from the **start of the current phase**, not the whole fight.

### Phase 1: "The Difference Engine" (Babbage)

Babbage's engine tabulated polynomials using the **method of finite differences**: add up columns of differences and you never need to multiply. The fight teaches exactly that.

- **Mechanic:** the engine cranks out a table. You must give the next value before the crank completes (a visible timer). Each correct answer jams one of its three columns. Three jams finish the phase.
- **Tasks:** 3 × **Predict / Quiz** on difference tables, getting harder:
  1. Next term of 2, 4, 6, 8… (first differences constant)
  2. Next term of 1, 4, 9, 16… (second differences constant)
  3. Next term of a cubic, given its difference table
- **Babbage's attack:** the "crank". The timer speeds up after each jam.

### Phase 2: "Note G" (Lovelace)

In 1843 Ada published her Notes on the Analytical Engine. **Note G** lays out, step by step, how the Engine could compute **Bernoulli numbers**. It's often called the first published computer program. Historians have pointed out a small error in its table of operations, which is the perfect excuse for a **Fix** fight.

- **Mechanic:** Ada "weaves" the program as glowing thread between the engines. You must find and fix the faults before the weave completes.
- **Tasks:**
  1. **Fix**: a short Python/JS translation of a loop with two operands swapped. The tests show the wrong output. This is the homage to Note G's error.
  2. **Quiz** (fast, 3 questions): what is a loop / a variable / an operation? Ada's own vocabulary of operations and variables, mapped to modern terms.
- **Ada's attack:** "weaving": red threads cut across the Task panel's timer bar, and each one you leave unfixed costs Integrity when the weave completes.

### Phase 3: "The Analytical Engine" (both)

The machine they designed and never saw built boots up, and you program it.

- **Mechanic:** the first **Code** Task in the game. The Guide and Ada walk you through the editor in two lines. Babbage provides the inputs, Ada the expected outputs. Pass all hidden cases and the Engine runs.
- **Task:** **Code**, difficulty 2: `next_value(sequence)`, which uses finite differences to predict the next term of a polynomial sequence. It ties phases 1 and 2 together: you've done this by hand, now make the machine do it.
- **Victory:** the Engine spins up, the teal glow floods the room, and the Notes pages fly to form the **Gate of Notes**. Ada: *"It weaves your pattern now. Go on: they're waiting for you above."*

### Rewards

- Title **"Engine Breaker"**.
- Cosmetic **Brass Goggles** (a new eyes part).
- The boss stays beaten forever, including after a Fall.

## 5. The Testing Hall (Floor 1's Floor Hall)

The first shared space, and where the game becomes multiplayer. It's today's `BaseRoom`, re-skinned and scoped to Floor 1.

- **Look:** the Engine Hall's modern end. A vaulted hall of brass and glass with circuit-trace floors, the Analytical Engine humming in the centre, and the **Exam Gate** to Floor 2 glowing at the far end.
- **Who's here:** everyone whose current floor is 1, in Hall Instances of ~50.
- **Stations:** practice terminals for each Format (Trials).
- **Duel pads:** walk up and challenge, plus a ranked queue terminal.
- **Quest board** with starter quests:
  - *First Blood*: win your first Casual Duel.
  - *Show Me the Way*: say hello to a Climber who's been on Floor 1 longer than you.
  - *Practice Makes*: pass 3 Station Tasks.
- **Exam Gate:** the **Floor 1 Exam**. Five mixed-Format Tasks at difficulty 2, and you must pass 4. Passing it climbs you to Floor 2.
- **Fall rule:** none here. Floor 1 is the floor of the Tower.

## 6. Art direction

| | |
|---|---|
| **Style** | Stylized low-poly with soft toon shading. Chunky silhouettes, readable from the third-person camera. Not realistic. |
| **Palette** | Brass `#c9a227`, oak `#6b3e26`, iron `#2b2f3a`, parchment `#f2e6c9`, data-teal `#19c3d6`, warning-red `#e2483d` |
| **Lighting** | Warm gas-lamp pools in the Walk, cold teal light from the machines, and bloom on anything carrying data (M-later: `@react-three/postprocessing`) |
| **Scale** | 1 Blender unit = 1 m. The Climber is 1.8 m tall. Doorways are at least 3 m wide and 3.5 m tall (the camera needs room). |
| **Budget** | Aim for under 150k triangles visible per room and under 50 draw calls. Reuse props with `--instance`. Textures up to 1024², WebP (the model script does this). |

### Blender asset list

Build them in this order; earlier items unblock playtesting. Greybox first: every room can start as boxes in code, then models replace the boxes one by one.

| Priority | Asset | Notes |
|---|---|---|
| P0 | **Engine Room shell** | Floor, walls, three alcoves. Simple, because the engines carry it. |
| P0 | **Difference Engine** | Hero prop. Columns of number wheels; 3 columns need separate meshes so they can animate "jamming". |
| P0 | **Babbage** and **Lovelace** | Stylized, Victorian clothing, built from public-domain portraits as reference. Rig with Mixamo (idle, talk, "attack" gestures, defeat bow). |
| P1 | **Analytical Engine** | Wireframe/teal hologram material, so it can be lighter geometry. |
| P1 | **Ada's desk and Notes pages** | Pages as flat planes with an emissive texture. |
| P1 | **Timeline Walk modules** | A kit of wall, arch, floor (wood → circuit) and lamp pieces, to snap rooms together. |
| P2 | **Jacquard loom**, **card wall**, **cogs**, **relay cabinet** | One hero prop per room. |
| P2 | Henchmen: **Shuttle Sprite**, **Punched Card**, **Loose Cog**, **The Moth** | Small and simple, and they need to read as "enemies". |
| P2 | **The Guide** | Design to come. It appears on every floor, so it's worth a strong silhouette. |
| P3 | Testing Hall set dressing | Gate, pads, terminals, quest board. |

### Audio list

| Cue | Feel |
|---|---|
| Walk ambience | Distant clockwork, gas hiss, a soft music box. |
| Henchman sting | Short, playful, mechanical. |
| Boss intro | Big orchestral hit plus a steam whistle, then the title card *"THE EXAMINERS"*. |
| Phase 1 crank loop | Rhythmic gear clatter that speeds up with the timer. |
| Phase 2 weave | Strings and a harpsichord; tension rises as the thread grows. |
| Phase 3 boot-up | The machine whirs up into a synth chord, the floor's first electronic sound. |
| Victory / Gate | Triumphant brass resolving into a modern synth pad. |

## 7. Challenge content to write

All in the content pipeline (M3), Python and JS for Code/Fix/Predict.

| Encounter | Format | Count | Difficulty |
|---|---|---|---|
| Shuttle Sprite | Quiz | 6 (3 used, 3 for retries) | 1 |
| Punched Card | Predict | 3 | 1 |
| Loose Cog ×2 | Predict | 4 | 1–2 |
| The Moth | Fix | 2 | 1 |
| Babbage, phase 1 | Predict/Quiz (difference tables) | 6 | 1–2 |
| Lovelace, phase 2 | Fix ("Note G") + Quiz | 2 + 6 | 2 |
| Phase 3 | Code: `next_value` | 1 (+1 alternate) | 2 |
| Floor 1 Exam | Mixed | pool of 15 | 2 |

**About 45 Challenges for Floor 1.** The existing 8 problems are general practice (Station) content.

## 8. Build plan

1. **Greybox (code only) ✅:** all rooms and the Engine Room as primitives, the Guide as a floating light with on-screen lines, henchmen as glowing shapes, and Pass/Fail buttons standing in for Tasks. Walkable end to end.
2. **Wire the Tasks:** henchmen and boss phases call the challenge engine (M3). Integrity, phase checkpoints, victory and the Gate.
3. **Floor-scoped Hall:** `FloorRoom` for Floor 1 replaces the generic Base ([ADR-0009](../../adr/0009-floor-scoped-presence.md)).
4. **Art pass:** Blender models replace greybox pieces one at a time (`npm run model`). Then sound.
5. **Exam Gate → Floor 2 placeholder.**

## Open questions (Ronald)

- **The Guide:** name and design to come (Ronald).
- Should the boss be **beatable on the first try** by a total beginner, or is a retry or two intended?
- **Integrity 5** for the boss: too forgiving or too harsh?
- Should Floor 1 players get an **"invite a friend into my Hall"** option, or is it strictly floor-scoped?
