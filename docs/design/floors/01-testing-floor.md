# Floor 1: The Testing Floor

> *"The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves."*
> Ada Lovelace, 1843

The first floor of the Tower and the entrance exam. A new Climber walks through the origins of computing and learns every way the game is played.

**The story:**
- **The hook.** On the Arrival Platform, **Ada Lovelace** appears, looks straight at you, and slips away up the Timeline Walk. The objective reads **"Follow Ada Lovelace"**, so you think catching her is the goal.
- **The chase.** **Charles Babbage**'s machines bar the way.
- **The twist.** In the Engine Room, Babbage himself is the boss: *"You'll not reach her without passing through my Engines."*
- **The payoff.** Ada watches the fight from a balcony. When Babbage falls, she acknowledges you and leaves through the Gate of Notes to **Floor 2, her floor** ([`02-poetical-science.md`](02-poetical-science.md)), where she waits.

Only then do you reach the **Testing Hall**, where everyone else on Floor 1 is.

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
                         │     THE ENGINE ROOM      │  BOSS: Charles Babbage
                         │  Difference Engine (L)   │
                         │  Analytical Engine (C)   │
                         │  Ada's balcony (R, above)│
                         └────────────▲─────────────┘
                                      │
    ┌─────────────────────────────────┴───────────────────────────────┐
    │                       THE TIMELINE WALK                         │  solo
    │  ① Abacus Court → ② Loom Gallery → ③ Card Archive →             │
    │  ④ Gear Works → ⑤ The Moth Room                                 │
    └─────────────────────────────────▲───────────────────────────────┘
                                      │
                              ARRIVAL PLATFORM  (spawn · Ada appears, then slips away)
```

The **Timeline Walk** is one route with five rooms. Each room teaches one thing and ends in a henchman. Sizes are small on purpose: about 3–5 minutes to walk through without stopping. Total time to the boss is 10–15 minutes for a newcomer.

## 3. The Timeline Walk: tutorial and henchmen

Each room teaches either a **game mechanic** or a **Task Format**, then tests it with a henchman. Henchmen are short Challenges (difficulty 1–2) with a themed creature or object around them.

| # | Room | Teaches | Henchman | Task |
|---|---|---|---|---|
| ① | **Abacus Court** | Walking, camera, jumping across giant abacus beads | none, just movement | Reach the far side |
| ② | **Loom Gallery**: a towering Jacquard loom weaving glowing thread | **Quiz** format | **Weftdart**: a loom shuttle trailing its weft thread | Quiz: 3 questions on what a program, an input and an output are |
| ③ | **Card Archive**: walls of punched cards | **Predict** format | **Holloquy**: a punched card that reads its own holes aloud | Predict: the output of a 3-line loop |
| ④ | **Gear Works**: giant meshing cogs, some jammed | Reading code; difficulty ramps | **Cogsnap Tick** and **Cogsnap Tock**: twin cogs snapped loose | Predict: a simple arithmetic sequence, then a counter in a loop |
| ⑤ | **The Moth Room**: a dark relay cabinet with one moth fluttering inside | **Fix** format | **Firstbug**: a nod to the moth found in the Harvard Mark II relay in 1947, logged as the "first actual case of bug being found" | Fix: an off-by-one in a loop that sums a list |

**Code** (writing a function from scratch) is introduced in the boss fight itself, in Babbage's last phase. That gives the boss a job beyond being a wall.

### Following Ada

Ada is an NPC on this floor, never a fight. She is always one room ahead.

- **Arrival Platform:** she stands at the far doorway, looks back at you, and walks off up the Walk. The objective becomes **"Follow Ada Lovelace"**.
- **Each room:** as you enter, you glimpse her by the exit. She leaves a **Note** (a glowing page) with a hint for that room's Task, then slips through the door before you reach her. The Notes are short, in her voice, and teach the Format. For example, at the Loom: *"The Engine weaves algebraical patterns, just as the loom weaves flowers. Find the pattern."*
- **The Engine Room:** she is on a **balcony behind glass**, above and behind Babbage. She doesn't help. She watches.
- **After the fight:** she says her line, walks to the Gate of Notes and is gone.

She can't be caught, talked into helping, or attacked: she is the reason to climb, not an obstacle.

Every henchman uses the shared battle UI (M3). A fail costs one **Integrity** point and lets you retry with a new question. Henchmen never block progress permanently.

## 4. Boss: the Examiner, Charles Babbage

**Framing:** Babbage is the Examiner of the first floor: proud, sharp and fair, gruff and impatient with sloppy thinking. He designed the machines you have been fighting through, and he won't let you reach Ada until you have proved you understand them. When you win, he steps aside with grudging respect. Portray him respectfully ([ADR-0010](../../adr/0010-historical-figures-as-examiners.md)).

**Intro line:** *"You'll not reach her without passing through my Engines."*

**Arena:** the Engine Room.
- **Left:** a full-size **Difference Engine**. The real Difference Engine No. 2 was finally built by the Science Museum, London, in 1991.
- **Centre:** the unbuilt **Analytical Engine**, rising from the floor in glowing wireframe.
- **Right, above:** **Ada's balcony**, behind glass. She watches the whole fight.

**Climber Integrity:** 5 points. A wrong answer costs 1, a timeout costs 1. At 0 you're "returned to the Walk's end" and retry from the **start of the current phase**, not the whole fight.

### Phase 1: "The Difference Engine"

Babbage's engine tabulated polynomials using the **method of finite differences**: add up columns of differences and you never need to multiply. The fight teaches exactly that.

- **Mechanic:** the engine cranks out a table. You must give the next value before the crank completes (a visible timer). Each correct answer jams one of its three columns. Three jams finish the phase.
- **Tasks:** 3 × **Predict / Quiz** on difference tables, getting harder:
  1. Next term of 2, 4, 6, 8… (first differences constant)
  2. Next term of 1, 4, 9, 16… (second differences constant)
  3. Next term of a cubic, given its difference table
- **Babbage's attack:** the "crank". The timer speeds up after each jam.

### Phase 2: "The Mill and the Store"

The Analytical Engine split a computer into the parts every computer still has: the **Store** (memory, columns of numbered variables) and the **Mill** (the processor that does the arithmetic). It was driven by punched cards (the program). Babbage opens the wireframe Engine and makes you run it by hand.

- **Mechanic:** cards fly from the reader to the Mill, and values move between Store columns. You must say what each column holds before the cards finish. Each correct trace locks one Store column.
- **Tasks:**
  1. **Quiz** (3 questions): Store, Mill, cards and printer mapped to memory, processor, program and output.
  2. **Predict**: a short sequence of operations on variables `v1`–`v4` (with one loop). What's in each variable at the end?
- **Babbage's attack:** "the card storm". Each wrong answer shuffles the next card sequence.

### Phase 3: "The Analytical Engine"

The machine he designed and never saw built boots up, and you program it.

- **Mechanic:** the first **Code** Task in the game. The Guide walks you through the editor in two lines. Babbage provides the inputs and the expected outputs. Pass all hidden cases and the Engine runs.
- **Task:** **Code**, difficulty 2: `next_value(sequence)`, which uses finite differences to predict the next term of a polynomial sequence. It ties phases 1 and 2 together: you've done this by hand, now make the machine do it.
- **Victory:** the Engine spins up and the teal glow floods the room. Babbage steps back: *"Hm. You'll do."*
- **Then Ada,** from the balcony: *"You may yet understand what I saw in it."* She walks to the Gate of Notes, which opens for her and for you, and leaves for Floor 2.

*Moved to Floor 2:* Note G, the weave, and Ada as an Examiner. That is her floor now.

### Rewards

- Title **"Engine Breaker"**.
- The first page of **the Objection Journal**: Ada's line from the balcony (see GAME_DESIGN, *The thread*).
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
| **Style** | Clean voxel diorama: flat colours, baked AO, chunky silhouettes readable from the third-person camera. See [ART_DIRECTION](../ART_DIRECTION.md). |
| **Palette** | Brass `#c9a227`, oak `#6b3e26`, iron `#2b2f3a`, parchment `#f2e6c9`, data-teal `#19c3d6`, warning-red `#e2483d` |
| **Lighting** | One warm sun and a light sky. Lamps and data (threads, screens, pads) glow with unlit voxels. Bloom is a later option (`@react-three/postprocessing`). |
| **Scale** | 1 unit = 1 m. Architecture is on a 0.5 m voxel grid; the Climber is 1.8 m tall (18 voxels of 0.1 m). Doorways are at least 3 m wide and 3.5 m tall (the camera needs room). |
| **Budget** | Aim for under 150k triangles visible per room and under 50 draw calls. Reuse props with `--instance`. Textures up to 1024², WebP (the model script does this). |

### Asset list

Build them in this order; earlier items unblock playtesting. All rooms and these props now exist as code-built voxels (`floor/rooms.ts`, `floor/models.ts`). The art pass replaces the important ones with hand-made MagicaVoxel models.

| Priority | Asset | Notes |
|---|---|---|
| P0 | **Engine Room shell** | Floor, walls, three alcoves. Simple, because the engines carry it. |
| P0 | **Difference Engine** | Hero prop. Columns of number wheels; 3 columns need separate meshes so they can animate "jamming". |
| P0 | **Babbage** | **Hand-made in MagicaVoxel** (every boss must look good and authentic): Victorian clothing, from public-domain portraits. Animated by parts in code, like Climbers (idle, talk, "attack" gestures, defeat bow). The code-built figure in the greybox is a placeholder. |
| P0 | **Ada** (NPC here, boss on Floor 2) | Same model as Floor 2. Here she needs only walk, look back and leave. |
| P1 | **Analytical Engine** | Wireframe/teal hologram material, so it can be lighter geometry. |
| P1 | **Ada's balcony** and her **Notes** (one per room) | A glass-fronted balcony; the Notes are glowing pages. |
| P1 | **Timeline Walk modules** | A kit of wall, arch, floor (wood → circuit) and lamp pieces, to snap rooms together. |
| P2 | **Jacquard loom**, **card wall**, **cogs**, **relay cabinet** | One hero prop per room. |
| P2 | Henchmen: **Weftdart**, **Holloquy**, **Cogsnap Tick and Tock**, **Firstbug** | Small and simple, and they need to read as "enemies". |
| P2 | **The Guide** | Design to come. It appears on every floor, so it's worth a strong silhouette. |
| P3 | Testing Hall set dressing | Gate, pads, terminals, quest board. |

### Audio list

| Cue | Feel |
|---|---|
| Walk ambience | Distant clockwork, gas hiss, a soft music box. |
| Henchman sting | Short, playful, mechanical. |
| Ada's theme | A short harpsichord phrase whenever she appears ahead of you; it grows fuller each room. |
| Boss intro | Big orchestral hit plus a steam whistle, then the title card *"CHARLES BABBAGE"*. |
| Phase 1 crank loop | Rhythmic gear clatter that speeds up with the timer. |
| Phase 2 card storm | Punched cards clattering through the reader, faster with every wrong answer. |
| Phase 3 boot-up | The machine whirs up into a synth chord, the floor's first electronic sound. |
| Victory / Gate | Triumphant brass, then Ada's theme as she leaves through the Gate. |

## 7. Challenge content to write

All in the content pipeline (M3), Python and JS for Code/Fix/Predict.

| Encounter | Format | Count | Difficulty |
|---|---|---|---|
| Weftdart | Quiz | 6 (3 used, 3 for retries) | 1 |
| Holloquy | Predict | 3 | 1 |
| Cogsnap Tick, Tock | Predict | 4 | 1–2 |
| Firstbug | Fix | 2 | 1 |
| Babbage, phase 1 | Predict/Quiz (difference tables) | 6 | 1–2 |
| Babbage, phase 2 | Quiz (Store/Mill) + Predict (trace) | 6 + 3 | 2 |
| Ada's Notes (hints, one per room) | none: text only | 5 | – |
| Phase 3 | Code: `next_value` | 1 (+1 alternate) | 2 |
| Floor 1 Exam | Mixed | pool of 15 | 2 |

**About 45 Challenges for Floor 1.** The existing 8 problems are general practice (Station) content.

## 8. Build plan

1. **Greybox (code only) ✅:** all rooms and the Engine Room as primitives, the Guide as a floating light with on-screen lines, henchmen as glowing shapes, and Pass/Fail buttons standing in for Tasks. Walkable end to end.
2. **Story rework ✅ (greybox):** Babbage alone in the arena, and Ada as an NPC who appears at Arrival, slips away ahead of you room by room, watches from a balcony, and leaves through the Gate after the fight.
3. **Wire the Tasks:** henchmen and boss phases call the challenge engine (M3). Integrity, phase checkpoints, victory and the Gate.
   - **Henchmen ✅:** each fights with a real Challenge from its pool (`pool` in `testingFloor.ts`), graded by the server in a TrialRoom. A pass lands a Move (Quiz jab, Predict kick, Fix push); a fail takes a Counter and costs 1 Integrity. After a Quiz or Predict answer the next question comes from the pool. A Fix stays on screen so you can keep editing, until a knockout swaps in a different bug. The Moves and Counters are on-screen effects for now; avatar animations come with the art pass.
   - **Babbage's phases:** still Pass/Fail. Next.
4. **Floor-scoped Hall:** `FloorRoom` for Floor 1 replaces the generic Base ([ADR-0009](../../adr/0009-floor-scoped-presence.md)).
5. **Art pass:** the code-built voxel version is in. Next, hand-made MagicaVoxel models for the hero props and characters. Then sound.
6. **Exam Gate → Floor 2** ([Poetical Science](02-poetical-science.md)).

## Open questions (Ronald)

- **The Guide:** name and design to come (Ronald).
- Should the boss be **beatable on the first try** by a total beginner, or is a retry or two intended?
- **Integrity 5** for the boss: too forgiving or too harsh?
- Should Floor 1 players get an **"invite a friend into my Hall"** option, or is it strictly floor-scoped?
