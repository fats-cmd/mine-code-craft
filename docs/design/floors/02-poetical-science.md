# Floor 2: Poetical Science, the floor of Augusta Ada King, Countess of Lovelace

> *"The Analytical Engine has no pretensions whatever to originate any thing. It can do whatever we know how to order it to perform."*
> Ada Lovelace, Note G, 1843

On Floor 1 you chased Ada Lovelace up the Timeline Walk and watched her leave through the Gate of Notes. Floor 2 is **her** floor: a sky of voxel islands built from her own ideas, which she called *poetical science*. She has set it as an exam. Cross its three wings, collect the three pages of her Notes, and she will meet you in her Study at the top of the Spire.

The floor teaches three things, one per wing, and they are her three great ideas:

1. **The Algorithm wing.** A program is an ordered list of operations, with loops ("cycles", in her words) and variables. Her **Note G** is often called the first published algorithm.
2. **The Symbol wing.** The Engine could act on *symbols*, not just numbers, and so compose music. This is **general-purpose computing**: anything you can encode, a machine can process.
3. **The Objection wing.** *"The Engine has no pretensions to originate anything."* Can a machine create? This is the question the whole Tower climbs towards, into the AI era ([ADR-0013](../../adr/0013-the-towers-story.md)).

Follows the floor anatomy in [`../GAME_DESIGN.md`](../GAME_DESIGN.md): **Setting → Henchmen → Boss → Floor Hall → Floor Exam**.

---

## 1. Setting: Poetical Science

Ada called her way of thinking **poetical science**: imagination and mathematics working together. Floor 2 is that idea made into a place. It's an archipelago of floating voxel islands at dawn, joined by bridges of light, with a tall **Spire** in the middle and a glass **Observatory** on top.

- **Mood:** awe and lightness after Floor 1's engine house. It's open sky, wind, birds and distant music. The higher you go, the more the islands look like *thought*: equations carved into cliffs, staves of music strung between islands, punched cards drifting like leaves.
- **A nod to her childhood:** she studied how birds fly and designed a flying machine at 12, calling it *Flyology*. Gliders and paper wings drift between the islands; the bridges between wings are flight paths.
- **The Guide** is still the narrator: one or two lines per area. Its design is still to come.
- **Ada is testing from afar.** She isn't in the wings in person. At the end of each wing she appears as a **projection of light from her Notes**: proud, a little teasing, never cruel. She gives one line and the wing's page.

Floor 2 is the first **open-world** floor, as the art references asked. The islands are bigger and you can see the next wing across the sky, but the route stays readable.

## 2. Layout

```
                        ┌──────────────────────────┐
                        │     THE OBSERVATORY      │  Floor Hall · shared
                        │  stations · duel pads ·  │
                        │ telescope · EXAM GATE ───┼──► Floor 3 (Turing)
                        └────────────▲─────────────┘
                                     │
                        ┌────────────┴─────────────┐
                        │     THE STUDY SPIRE      │  BOSS: Ada Lovelace
                        │  her desk · the Notes ·  │  (needs the 3 pages)
                        │  the Music Island below  │
                        └────────────▲─────────────┘
                                     │
   ┌──────────────────┐   ┌──────────┴──────────┐   ┌──────────────────┐
   │ ALGORITHM WING   │◄──┤   THE LANDING (hub) ├──►│   SYMBOL WING    │
   │ the Loom Isles   │   │  arrival from the   │   │ the Music Isles  │
   │ ends: MENABREA   │   │  Gate of Notes      │   │ ends: page II    │
   │ → page I         │   └──────────┬──────────┘   └──────────────────┘
   └──────────────────┘              ▼
                        ┌──────────────────────────┐
                        │     OBJECTION WING       │  opens after pages I and II
                        │   the Mirror Isles       │
                        │   ends: page III         │
                        └──────────────────────────┘
```

- **Order:** Algorithm, then Symbol, then Objection, the order the ideas build on each other. The Objection wing's bridge forms once pages I and II are in hand.
- **Time:** about 25–35 minutes to the boss for a Climber who arrives fresh from Floor 1, with each wing around 8–10 minutes.
- **The key:** the three **pages of the Notes**. Placed on the Spire's lectern, they open the Study.

## 3. The wings and their henchmen

Henchmen are Tasks (one Challenge each, see GAME_DESIGN). Floor 2 difficulty is **2–3**. Floor 1 introduced each Format; here every Format appears in all three wings.

### Wing I: the Algorithm wing (the Loom Isles)

Islands terraced like a Jacquard loom, with Note G's table of operations carved into the cliffs as stepping stones.

**Teaches:** a program is an ordered sequence of operations; variables hold values; a loop repeats a block; *tracing* means following the values step by step. This is how Ada laid out Note G, as a table of variables and operations.

| Encounter | Task | Format |
|---|---|---|
| **Operation Cards** ×2: living punched cards. The Engine took two kinds, *Operation* cards (what to do) and *Variable* cards (what to do it to). | (1) Put five shuffled steps of a small program in the right order. (2) Name what's in each variable after the steps run. | Quiz, then Predict |
| **Bernoulli Imps** ×2: little number sprites escaped from Note G's table. | (1) Trace a loop and give its output (a running sum, then a product). (2) An off-by-one in a loop. | Predict, then Fix |
| **Menabrea**: henchman boss, see below. | Three Tasks, below. | Quiz, Predict, Code |

#### Henchman boss: Luigi Federico Menabrea

**Who he was:** an Italian engineer (1809–1896), later Prime Minister of Italy. After Babbage lectured in Turin in 1840, Menabrea wrote the first published paper on the Analytical Engine (1842, in French). Ada translated it into English and added her own **Notes A to G**, about three times as long as the paper itself. Note G is in *her* notes on *his* paper.

**In the game:** **the Memoirist**, keeper of the bridge out of the Algorithm wing. He is proud of his paper and wants to know whether you understood the machine it describes, or only how to use it. He is shown with respect, like the Examiners ([ADR-0010](../../adr/0010-historical-figures-as-examiners.md): he died more than 70 years ago, so his real name is fine). His lines are clearly the game's own dialogue, never invented quotes presented as historical.

| Phase | Task | Format |
|---|---|---|
| 1. *The Memoir* | Map the Engine's parts to a modern computer: the Store is memory, the Mill is the processor, the cards are the program, and the printer is output. | Quiz |
| 2. *The Table* | A Note G-style table: give the value of each variable after each operation. | Predict |
| 3. *The Translation* | His paper describes a calculation in words; write it as a function, e.g. `sum_of_squares(n)` with a loop. | Code |

He's a **henchman boss**: three Tasks and Integrity checkpoints like a boss, but shorter, with no phase music. Beating him gives **page I**.

**Ada's projection:** *"Signor Menabrea described the machine. I wished to show what it could do. Now you have done both."*

### Wing II: the Symbol wing (the Music Isles)

Islands shaped like piano keys and staves of music, strung between them. Notes hang in the air as glowing voxels, and each one has a number painted on it.

**Teaches:** anything can be **encoded** as numbers (notes, letters, colours), and a machine that operates on numbers can operate on all of them. That is general-purpose computing. Ada saw it in 1843: *"…the engine might compose elaborate and scientific pieces of music of any degree of complexity or extent."* (Note A)

| Encounter | Task | Format |
|---|---|---|
| **Score Wraiths** ×3: sheet music come to life, hissing chords. | (1) Encode a short melody as numbers using a given table (C=0, D=2, E=4…). (2) Decode a list of numbers back into notes. (3) Fix a `transpose(melody, k)` that forgets to wrap round the octave (`% 12`). | Predict, Predict, Fix |
| **Operation Cards** (elite) | Quiz: what else can be encoded? Text as character codes, colours as RGB, images as grids of numbers. The bridge to "symbols, not just numbers". | Quiz |
| **The Score Gate** (puzzle, no fight) | Write `encode(name)`, which turns your Climber's name into numbers. The gate plays it as a tune and opens. A short Code warm-up for the boss. | Code |

**Page II.** Ada's projection: *"You see it now: the Engine does not care whether its numbers are quantities or notes. Only we do."*

### Wing III: the Objection wing (the Mirror Isles)

Glassy islands that reflect everything, including you. The henchmen here are **Echoes**: elite versions of earlier henchmen that copy back exactly what they're given. That's the theme of the wing: does a machine only ever repeat its instructions?

**Teaches:**
- *Deterministic*: same input, same output, every time.
- *Pseudo-random*: numbers that look random but come from a rule and a **seed**.
- *Generative rules*: a few rules can produce many outputs nobody wrote out by hand.

This sets up the boss's last phase and the AI floors to come.

| Encounter | Task | Format |
|---|---|---|
| **Echo of the Imp** | Predict the output of a function called twice with the same input. Then decide: will a third call differ? | Predict + Quiz |
| **Echo of the Card** | Trace a tiny pseudo-random generator (a linear congruential rule, e.g. `x = (5*x + 3) % 16`) from a seed. What are the next three numbers? Will seed 7 always give the same sequence? | Predict |
| **Echo of the Wraith** | Fix a melody generator whose rule lets it jump too far (the "no leap bigger than 4 steps" rule is wrong). | Fix |

**Page III.** Ada's projection: *"It surprised you, did it not? Ask yourself who wrote the rule that surprised you."*

## 4. Boss: Augusta Ada King, Countess of Lovelace

**Framing:** the Examiner of Floor 2. She is proud, quick and poetic, and fair. She isn't a villain ([ADR-0010](../../adr/0010-historical-figures-as-examiners.md)). She is testing whether you understand what she saw in the Engine. On Floor 1 she said you *might*; this is where she finds out.

**Arena: the Study.** A round room at the top of the Spire, open to the sky.
- Her desk sits in the centre, with the **Notes** orbiting it as pages of light.
- A window looks down on the **Music Island**, a giant voxel instrument that plays during phase 3.
- The unbuilt Analytical Engine appears as a wireframe ghost behind her.

**Climber Integrity:** 5. Each phase is a checkpoint, as on Floor 1. Wrong answers and timeouts cost 1; at 0 you restart the current phase.

### Phase 1: "Note G"

Note G sets out how the Engine would compute the **Bernoulli numbers**, as a table of operations and variables. Historians later found a small error in the published table: two operands in one step are the wrong way round. Ada **weaves** the program as glowing threads across the room, and you must catch the fault before the weave completes. Red threads cross the Task timer, and any left unfixed cost Integrity.

- **Task 1, Predict:** trace the first two iterations of a simplified Note G loop (Python/JS translation). What's in `v4` and `v5`?
- **Task 2, Fix:** the same loop with two operands swapped, the homage to the real error. The tests show the wrong Bernoulli number.

### Phase 2: "The Science of Operations"

Ada argued that the Engine *"might act upon other things besides number"*. In this phase she proves it on you. She changes the room's symbols (notes, letters, colours) into numbers and back, faster and faster.

- **Task 1, Code:** `encode(melody)` and `decode(numbers)` with a given note table. The pair must round-trip.
- **Task 2, Quiz** (fast, 3 questions): which of these could the Engine have processed, given an encoding? A melody, a poem, a picture, a chess position. Answer: all of them. Why? Because they can be encoded as numbers.

### Phase 3: "The Objection"

The finale, and the bridge to the AI era. Ada reads her own line aloud: *"The Analytical Engine has no pretensions whatever to originate any thing."* Then she sets the challenge: *"Make it compose, then. Let us hear whether it originates."*

- **Task, Code:** `compose(seed, length)`. The `random(seed)` helper is provided, and the function must return a melody that follows the rules:
  - stay in the given scale;
  - no leap bigger than 4 steps;
  - start and end on the tonic;
  - the same seed always gives the same melody;
  - different seeds give different melodies.

  Grading checks only the rules, never taste. Hidden tests try several seeds and lengths.
- **It plays.** When it passes, the melody plays in the browser (a simple Web Audio synth). The Music Island lights up note by note in time.
- **Ada's verdict.** This is the floor's turning point. You win the fight, but she doesn't concede the question: *"Charming. And every note of it was in your rules, and your seed. It did whatever you knew how to order it to perform."* Then, softer: *"Perhaps someone after me will find an answer. Go up. A Mr Turing has been waiting to argue with me."*

**Victory:** the three pages fly together into a single Note, which opens the stairs to the **Observatory**. **Floor 3** is Alan Turing, whose 1950 paper answers "Lady Lovelace's Objection" by name.

### Rewards

- **Title:** "Poetical Scientist".
- **Locker item:** the **Starlit Visor** (a new eyes style), plus the **flame** colour in Paint.
- **The Objection Journal** gets its first entry (see GAME_DESIGN, *The thread*): her Objection, in her words.
- Ada stays beaten forever, including after a Fall.

## 5. The Observatory (Floor 2's Floor Hall)

A glass dome on the Spire's highest island. The stars overhead are data: constellations are drawn as loops and sequences, and they redraw as you solve things.

- **Who's here:** everyone whose current floor is 2, in Hall Instances of ~50.
- **Stations:**
  - Format practice terminals.
  - **The Telescope:** "trace the stars". Tracing and loop Tasks, where each correct answer draws a constellation.
  - **The Piano:** Compose practice. The melodies other Climbers made play in the Hall, if they choose.
- **Duel pads** and a ranked queue terminal.
- **Quest board:**
  - *Night Sky*: draw three constellations at the Telescope.
  - *Duet*: win a Casual Duel against someone who arrived on Floor 2 after you.
  - *Encore*: compose a melody that another Climber "likes" at the Piano.
- **The Exam Gate, the Floor 2 Exam:** 5 Tasks at difficulty 2–3, weighted to **tracing and loops**, with one encoding Task. Pass 4 to climb to Floor 3.
- **Fall rule:** from here on you can fall back to Floor 1 (see *The Fall* in GAME_DESIGN). Babbage stays beaten if you do.

## 6. Art direction

| | |
|---|---|
| **Style** | Clean voxel, the first open-world floor: islands, bridges, open sky (the island and diorama references). See [ART_DIRECTION](../ART_DIRECTION.md). |
| **Palette** | Dawn lilac `#b9a7ff`, sky `#bfe3f2`, parchment `#f2e6c9`, Victorian plum `#6b2d5c`, starlight gold `#f5c518`, ink `#1b1b1f`, music teal `#19c3d6` |
| **Lighting** | Low dawn sun, long soft shadows, mist below the islands. The Objection wing is cooler and glassier. The Study is warm lamplight against the sky. |
| **Scale** | As Floor 1: 0.5 m architecture grid, 0.1 m characters. Islands are 20–40 m across, and bridges are at least 3 m wide. |

### Asset list

| Priority | Asset | Notes |
|---|---|---|
| P0 | **Island kit** | Cliff, grass top, bridge-of-light, stair, railing. Built with VoxelBuilder. |
| P0 | **Ada Lovelace** (boss) | A Victorian dress in plum, dark ringlets, a hand-made MagicaVoxel head. Animated by parts: weave (arms sweep), read, verdict (closes the book), defeat (a respectful bow). |
| P0 | **The Study**, **the Notes pages**, **the Music Island** | The Music Island is a giant playable instrument whose keys light up per note. |
| P1 | **Luigi Menabrea** | A 19th-century engineer's coat and a manuscript under his arm. |
| P1 | Henchmen: **Operation Cards**, **Bernoulli Imps**, **Score Wraiths**, **Echoes** | Echoes are glassy recolours of the others. |
| P2 | **The Observatory** dome, telescope, piano | |
| P2 | Flyology gliders and birds | Ambient life. |

### Audio list

| Cue | Feel |
|---|---|
| Island ambience | Wind, birds, faint music-box phrases from far islands. |
| Algorithm wing | Ticking, a loom's shuttle rhythm. |
| Symbol wing | Each island plays its own note; together they form a chord. |
| Objection wing | The same phrase echoed and delayed (a mirror). |
| Boss intro | A harpsichord flourish rising into strings. Title card: *"THE COUNTESS OF LOVELACE"*. |
| Phase 3 | **Your** melody, played by the arena. |
| Victory | Your melody harmonised by an orchestra, then a quiet, distant electronic tone: Turing's floor above. |

## 7. Teaching toward the AI era

Floor 2 is where the Tower's question is asked out loud. What each floor adds to it:

| Floor | Idea about machines | Answer to the Objection so far |
|---|---|---|
| 1 · Babbage | Machines follow procedures: they tabulate and calculate. | (not asked yet) |
| 2 · Lovelace | Algorithms, encoding, general-purpose machines. **Can they originate?** | "No: only what we order." |
| 3 · Turing | Computability, the imitation game. Learning machines are his reply to Lovelace. | "Maybe: a machine that learns can surprise its maker." |
| … | Search, data, learning from examples, neural networks. | Each floor adds evidence. |
| top floors | Generative AI: models that compose, write and code. | The Climber answers it themselves. |

The phase 3 Compose task is planted on purpose. The same `compose` idea returns on the AI floors as a model trained on melodies, and the Climber hears the difference between *rules they wrote* and *patterns it learned*.

## 8. Challenge content to write

| Encounter | Format | Count (incl. retries) | Difficulty |
|---|---|---|---|
| Operation Cards ×2 | Quiz / Predict | 6 | 2 |
| Bernoulli Imps ×2 | Predict / Fix | 6 | 2 |
| Menabrea | Quiz / Predict / Code | 2 + 3 + 2 | 2–3 |
| Score Wraiths ×3 | Predict / Fix | 8 | 2 |
| Elite Operation Cards | Quiz | 4 | 2 |
| Score Gate | Code `encode(name)` | 2 | 2 |
| Echoes ×3 | Predict / Quiz / Fix | 8 | 3 |
| Ada, phase 1 | Predict + Fix (Note G) | 2 + 2 | 3 |
| Ada, phase 2 | Code (`encode`/`decode`) + Quiz | 2 + 6 | 3 |
| Ada, phase 3 | Code `compose(seed, length)` | 2 | 3 |
| Floor 2 Exam | Mixed (tracing, loops, encoding) | pool of 15 | 2–3 |

**About 75 Challenges.** All Code, Fix and Predict tasks are in Python and JavaScript.

## 9. Build plan

1. **Floor 1 rework ✅ (greybox):** Babbage alone, and Ada as an NPC who leads you up the Walk and leaves through the Gate of Notes ([Floor 1 doc](01-testing-floor.md)).
2. **The challenge engine (M3)**, then wire Floor 1's Tasks (M4b).
3. **Floors become data:** generalise `testingFloor.ts` into a floor definition (rooms or islands, henchmen, boss, exam) that both floors use. Climbing from Floor 1 to Floor 2 changes your current floor (M4c, with `FloorRoom`).
4. **Floor 2 greybox:** islands, wings, pages, Menabrea, Ada, the Observatory. Pass/Fail stand-ins until its Tasks are written.
5. **Compose runtime:** a seeded `random()` helper in both runners, plus a Web Audio player for melodies.
6. **Art and sound pass**, then the Floor 2 Exam.

## Open questions (Ronald)

- **Wing order:** fixed (Algorithm → Symbol → Objection), or can the first two be done in either order?
- **Echoes:** are glassy copies of earlier henchmen enough, or does the Objection wing deserve its own creature?
- **Compose phase:** should the Hall's Piano let Climbers *publish* melodies for others to hear (needs moderation), or keep them private?
- **Ada's design:** a hand-made MagicaVoxel model (recommended for the boss), or code-built like the Floor 1 Examiners?
