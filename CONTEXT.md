# mine-codecraft — domain glossary

A browser 3D game. Players walk around a shared hub as avatars, challenge each other to computer-science battles, and climb a tower whose floors are tests. The theme is inspired by tower-climbing anime (Tower of God and similar): floors, tests, ranks, team roles and perks. It borrows no names, characters or terms from any franchise.

Use these words in code, issues, commits and docs. If you need a concept that isn't here, add it here first.

## People

| Term | Meaning | Avoid |
|---|---|---|
| **Climber** | A signed-in player. Has a profile, avatar, Role, Rank and Level. | user (fine in auth code only), hero |
| **Opponent** | The other Climber in a Duel. | enemy (reserved for the Legion) |

## Places

| Term | Meaning |
|---|---|
| **Tower** | The whole game world, as a fiction. Climbers climb it floor by floor. |
| **Base** | The shared 3D hub at the bottom of the Tower, built by hand in R3F. This is where Climbers meet, chat, challenge each other and queue. |
| **Base Instance** | One running copy of the Base: a `BaseRoom` with up to ~50 Climbers. New instances open automatically as players arrive. |
| **Station** | A fixed place in the Base (a terminal or arena pad) that you walk up to. It starts a Trial or puts you in a Duel queue for a specific format or topic. |
| **Floor** | One level of the Tower. Each Floor has a **Floor Test**. Passing it unlocks the next Floor. Your highest cleared Floor is shown on your nameplate. |
| **Boss Floor** | A Floor whose test is a fight against the Legion: waves of Minions, then a Guardian. |

## Activities

| Term | Meaning |
|---|---|
| **Challenge** | One unit of content: a single question or problem. It has a **Format**, a **Topic**, a **Difficulty** (1–5) and server-side answers. |
| **Format** | The kind of Challenge. Exactly four: **Code** (write a function, graded against hidden cases), **Fix** (given buggy code, make it pass), **Predict** (read a snippet and type its exact output), **Quiz** (multiple choice). |
| **Language** | `python` or `javascript`. Applies to Code, Fix and Predict. Quiz is language-agnostic. |
| **Topic** | A CS area tag: `arrays`, `strings`, `hashing`, `recursion`, `graphs`, `big-o`, `sql`, `networking`… Drives Mastery. |
| **Duel** | A PvP battle between two Climbers: **best of 3 Rounds**. |
| **Round** | One segment of a Duel, played on one Format with its own clock. The first correct answer (or the higher score for Quiz) wins the Round. |
| **Ranked** | A Duel mode that changes Rank. **Perks are disabled.** Started only from the queue. |
| **Casual** | A Duel mode with Perks enabled and no Rank change. Walk-up challenges default to Casual. |
| **Trial** | A single-player run against Challenges: practice at a Station, a Floor Test, or a Boss Floor. |
| **Submission** | One graded attempt at a Challenge: the source or answer, the result, and timing. Always graded by the server. |

## Progression

| Term | Meaning |
|---|---|
| **Rank** | Ranked skill rating (Glicko-2). Used for queue matchmaking and leaderboards. |
| **XP / Level** | Earned from every Duel and Trial. Levels unlock Perk points and cosmetics. |
| **Mastery** | Per-Topic progress, so Climbers can see what they're good at. |
| **Role** | The Climber's class, picked once and changeable later. Each Role has a **Perk Tree**. Working set: **Debugger**, **Speedster**, **Architect**, **Scout**. |
| **Perk** | An anime-style ability unlocked in a Perk Tree. It has limited **Charges** per Duel and only works in Casual Duels and Trials. The server applies every Perk effect. |
| **Cosmetic** | An avatar part, colour, aura, title or victory animation. No gameplay effect. Earned in v1, designed so it could be sold later. |
| **Title** | A Cosmetic shown under your name, e.g. *"Breaker of the Meta Legion"*. |

## The antagonist

| Term | Meaning |
|---|---|
| **Meta Legion** | The army that holds the Tower's upper floors. A parody stand-in for Big Tech. It is never a real person or company by name or likeness ([ADR-0007](docs/adr/0007-parody-antagonist.md)). |
| **Zark** | The Legion's leader (working name), fought as the final Guardian. |
| **Minion** | One enemy in a Boss Floor wave. Defeated by solving one short Challenge. |
| **Guardian** | The boss at the end of a Boss Floor: a multi-phase Challenge. |
