# 0013 — The Tower's story is Lovelace's Objection, and Floor 2 is Ada's

**Status:** accepted · 2026-10-16

## Context
The game's aim is to teach computer science as it evolves into the AI era, and Floors 1 and 2 need a story that carries the climb. Until now Ada Lovelace and Charles Babbage shared Floor 1's boss fight, which used up Ada in a single phase and gave the Tower no thread beyond "history, in order".

Ada wrote the line that makes the best thread. In Note G (1843): *"The Analytical Engine has no pretensions whatever to originate any thing. It can do whatever we know how to order it to perform."* Alan Turing answered it by name in 1950 ("Lady Lovelace's Objection"), and today's generative AI reopens it.

## Decision
- **The Tower's central question is Lovelace's Objection:** can a machine originate anything? Each floor's Examiner adds their answer to the Climber's **Objection Journal**. The AI floors take it on directly, and at the top the Climber answers it.
- **Floor 1 is Babbage's.**
  - Ada appears as an NPC: she shows up at Arrival, and the objective reads "Follow Ada Lovelace".
  - She stays a room ahead through the Walk and watches the boss fight from a balcony.
  - Babbage alone is the boss, in three phases on his Engines.
  - When he falls she says *"You may yet understand what I saw in it"* and leaves through the Gate of Notes.
- **Floor 2 is Ada's: "Poetical Science"**, a sky of islands built from her ideas.
  - **Three wings:** Shuttlecrest (algorithms, Note G), Staveholm (encoding, music, general-purpose computing) and Mirrormere (the Objection). The first two can be done in either order.
  - **Luigi Menabrea** and **Augustus De Morgan** are henchman bosses, and **Mary Somerville** hosts the Hall.
  - **Ada is the Examiner**, with three phases: Note G, the Science of Operations, and the Objection, which ends with the Climber's program composing music.
  - **The Hall** is the Starloom.
  - Winning melodies from the last phase stay in the world as **Songclouds** for later Climbers to find.
- **Alan Turing moves to Floor 3**, answering her Objection.
- **Passing a Task lands a Move** (punch, kick, push); **failing takes a Counter**. This applies everywhere, including Duels, as presentation only. Moves on Examiners hit their guard, not their body.

## Consequences
- Every boss is a hand-made MagicaVoxel model. Names of places and creatures are unique to the Tower, and each floor introduces several pioneers (the Pioneer Codex).
- Ada and Babbage each get a whole floor, and Ada stays an Examiner throughout: proud, fair and never a villain ([ADR-0010](0010-historical-figures-as-examiners.md)). Menabrea (died 1896), De Morgan (1871), Somerville (1872) and Turing (1954) are within ADR-0010's 70-year rule.
- Floor 1's code changes: the boss data, the HUD objective, the Guide lines, and a new Ada NPC and balcony. Babbage stays beaten after a Fall, like every boss.
- Floor 2 needs a few things that don't exist yet:
  - a floor definition shared by both floors, generalising `testingFloor.ts`;
  - a seeded `random()` in both code runners;
  - a Web Audio player for the Compose phase.
- Every later floor's design has to say what it adds to the Objection.
