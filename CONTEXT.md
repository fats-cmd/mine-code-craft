# mine-codecraft — domain glossary

A browser 3D game. Players climb a Tower whose floors are built out of computing history. Each floor has its own setting, henchmen and boss, all beaten with real CS. Players meet and battle the other players on the same floor. The theme is inspired by tower-climbing anime (Tower of God and similar): floors, tests, ranks, team roles and perks. It borrows no names, characters or terms from any franchise.

Use these words in code, issues, commits and docs. If you need a concept that isn't here, add it here first.

## People

| Term | Meaning | Avoid |
|---|---|---|
| **Climber** | A signed-in player. Has a profile, avatar, Role, Rank and Level. | user (fine in auth code only), hero |
| **Opponent** | The other Climber in a Duel. | enemy (reserved for the Legion) |
| **Guest** | A Climber who hasn't signed in. Their name and Look live in their browser and are sent when joining. Everything works except anything that needs to be saved (Rank, XP). | anonymous |
| **Look** | How a Climber's avatar appears: three colours (outfit, skin, accent) and three parts (hair, headwear, eyes). Cosmetics extend it later. | skin (means the skin colour only), outfit |

## Places

| Term | Meaning |
|---|---|
| **Tower** | The whole game world, as a fiction. Climbers climb it floor by floor. |
| **Floor** | One level of the Tower, and its own world. Built from a **Setting**, **Henchmen**, a **Boss**, a **Floor Hall** and a **Floor Exam** ([design](docs/design/GAME_DESIGN.md)). Your **current floor** decides which Hall you can enter. |
| **Setting** | A floor's place, story and mood: the 3D environment you walk through. |
| **Approach** | The solo route through a floor's Setting, past its Henchmen, to its Boss. |
| **Floor Hall** | A floor's shared space, holding every Climber whose current floor it is. Quests, Stations, Duels and chat happen here. Floor 1's Hall is the **Testing Hall**. |
| **Hall Instance** | One running copy of a Floor Hall: up to ~50 Climbers (code: today `BaseRoom`, becoming `FloorRoom` in M4). |
| **Station** | A fixed place in a Floor Hall (a terminal or arena pad) that you walk up to. It starts a Trial or a Duel queue. |
| **Base** | *Old name* (M0–M2) for the shared hub, which is now Floor 1's Testing Hall. Still the name in code until M4 renames it. |

## Activities

| Term | Meaning |
|---|---|
| **Challenge** | One unit of content: a single question or problem. It has a **Format**, a **Topic**, a **Difficulty** (1–5) and server-side answers. |
| **Format** | The kind of Challenge. Exactly four: **Code** (write a function, graded against hidden cases), **Fix** (given buggy code, make it pass), **Predict** (read a snippet and type its exact output), **Quiz** (multiple choice). |
| **Language** | `python` or `javascript`. Applies to Code, Fix and Predict. Quiz is language-agnostic. |
| **Topic** | A CS area tag: `arrays`, `strings`, `hashing`, `recursion`, `graphs`, `big-o`, `sql`, `networking`… Drives Mastery. |
| **Duel** | A PvP battle between two Climbers: **best of 3 Rounds**. |
| **Round** | One segment of a Duel, played on one Format with its own clock. The first correct answer (or the higher score for Quiz) wins the Round. |
| **Stake Duel** | An opt-in Duel where both players stake their floor: the loser takes a Strike ([ADR-0011](docs/adr/0011-the-fall.md), proposed). |
| **Ranked** | A Duel mode that changes Rank. **Perks are disabled.** Started only from the queue. |
| **Casual** | A Duel mode with Perks enabled and no Rank change. Walk-up challenges default to Casual. |
| **Task** | A Challenge placed in the world: what a Henchman is, and what each Boss phase is made of. |
| **Henchman** | A small enemy on a floor's Approach. Beating it means passing one Task (e.g. the Moth: a Fix Task). |
| **Boss** | A floor's signature fight: 2–4 phases, each a Task or a short run of them. Beaten once, it stays beaten. |
| **Examiner** | A Boss who is a real historical computing pioneer (Floor 1: Babbage & Lovelace). Portrayed as demanding and fair, never mocked ([ADR-0010](docs/adr/0010-historical-figures-as-examiners.md)). |
| **Integrity** | A Climber's hit points during an Approach or Boss fight. A wrong answer or timeout costs 1. At 0 you retry from the last checkpoint. |
| **Floor Exam** | The Trial in a Floor Hall that climbs you to the next floor. |
| **Trial** | A single-player run against Challenges: Station practice, a Floor Exam, or a Standing Exam. |
| **the Guide** | The Tower's guide: explains each mechanic in a line or two, floor after floor. An original character whose **name and design are still to come** (the owner will design it). In the greybox it's a small floating light with on-screen lines. |
| **Submission** | One graded attempt at a Challenge: the source or answer, the result, and timing. Always graded by the server. |

## Progression

| Term | Meaning |
|---|---|
| **Rank** | Ranked skill rating (Glicko-2). Used for queue matchmaking and leaderboards. |
| **Strike** | A mark against your standing on a floor. Three Strikes and you Fall. Passing Tasks heals them. |
| **Fall** | Dropping to the previous floor's Hall. Never below Floor 1, at most once per 24 h. |
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
| **Zark** | The Legion's leader (working name), fought as the Boss of the Meta Spire. |
| **Meta Spire** | The top floor, where Zark and the Legion are the Boss. |
