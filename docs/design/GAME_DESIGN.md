# Game design

What the game *is*, as opposed to how it's built ([`../ARCHITECTURE.md`](../ARCHITECTURE.md)). Terms are defined in [`../../CONTEXT.md`](../../CONTEXT.md). This is a living document: we design a floor, build it, play it, and come back here.

---

## The pitch

You are a **Climber** at the bottom of the **Tower**, a world built out of the history and ideas of computer science. Every floor is its own place, with its own story, its own **Boss** and its own **Tasks**. You beat them with real programming and CS knowledge, not reflexes.

You only ever share a floor with the people who are on it *right now*. Fast climbers race ahead. Someone stuck on Floor 3 for three months will meet every newcomer who arrives there. And the Tower pushes back: **fail a test and you fall a floor.**

## Pillars

Every feature gets checked against these. If it serves none of them, it waits.

1. **Every fight is real CS.** Bosses, henchmen and duels are won by solving actual problems. Never by grinding, never by paying.
2. **Each floor is a world.** A floor is a destination with a setting, a story and a boss you remember, not a level number.
3. **Your floor is your crowd.** Presence is floor-scoped, so the people you see are your peers. That's where rivalries, help and social pressure come from.
4. **The climb has stakes.** You can fall. Falling has to feel fair, because otherwise people quit.

---

## Anatomy of a floor

Every floor is built from the same parts, so each new one is mostly content: a setting, art and challenges.

```
┌──────────────────────── FLOOR n ─────────────────────────┐
│                                                          │
│  SETTING      a themed 3D place, with story and NPCs     │
│     │                                                    │
│     ▼                                                    │
│  APPROACH     solo: walk through the setting,            │
│     │         fight HENCHMEN (one Task each)             │
│     ▼                                                    │
│  BOSS         solo: multi-phase fight, one Task per hit  │
│     │         beaten once, stays beaten                  │
│     ▼                                                    │
│  FLOOR HALL   shared: everyone currently on Floor n      │
│     │         quests, stations, duels, chat              │
│     ▼                                                    │
│  FLOOR EXAM   the gate to Floor n+1                      │
└──────────────────────────────────────────────────────────┘
```

| Part | What it is | Multiplayer? |
|---|---|---|
| **Setting** | The floor's place and story: environment, mood, music, NPCs, lore you pick up as you walk. | Solo during the Approach, shared in the Hall |
| **Henchmen** | Small encounters on the way to the boss. Each henchman *is* a Task: one Challenge, themed to the setting (a cog that jams, a moth in the circuit). | Solo |
| **Boss** | The floor's signature fight. Two to four phases, each a Task or a short sequence of Tasks. The Climber has **Integrity** (hit points): wrong answers and timeouts cost Integrity. Beat the boss once and it stays beaten. | Solo (co-op raids are a later idea) |
| **Floor Hall** | The floor's shared space. You see every Climber whose current floor is this one, split into Hall Instances of ~50. | Shared |
| **Quests** | Hall objectives: solve stations, help others, and **challenge real players**. | Mixed |
| **Floor Exam** | A short, harder Trial in the Hall. Pass it to climb to the next floor. | Solo |

**Tasks are Challenges.** A Task is a Challenge placed in the world, in one of the four Formats (Code, Fix, Predict, Quiz). The challenge engine (M3) runs them all, so a boss is a sequence of Challenges plus presentation.

## The core loop

```
     arrive on floor ──► Approach + Boss (solo, once)
                                   │
                                   ▼
            ┌──────────────► Floor Hall ◄──────────────┐
            │          meet · quest · duel             │
            │                     │                    │
       fall a floor          Floor Exam           climb a floor
     (failed a stake)             │                (new Setting)
            │                     ▼                    │
            └──────────── pass? ──┴─── yes ─────────────┘
```

## Floor-scoped presence

- Your **current floor** is a number on your profile. The only Floor Hall you can enter is the one for your current floor.
- The Approach and Boss on each floor are solo, so newcomers aren't rushed or spoiled. Everyone meets in the Hall.
- Veterans who stay on a floor see everyone who arrives after them, and newcomers see who's been stuck there. That's intended: it gives you mentors, rivals and something to prove.
- The Hall shows each Climber's floor history on their nameplate: *"Floor 3 · 41 days"*.

## Challenging real players

Hall quests and Stations lead to **Duels** (best of three Rounds, see Architecture §5) against Climbers on your floor. Three kinds:

| Kind | Stakes | How it starts |
|---|---|---|
| **Casual Duel** | None. Perks on. | Walk up and challenge, or a Station |
| **Ranked Duel** | Rank (Glicko-2). Perks off. | Queue in the Hall |
| **Stake Duel** | **Your floor.** The loser of a Stake Duel takes a **Strike**. See *The Fall*. | Quest-driven, opt-in, both players must accept |

## The Fall (proposal: rules to tune by playing)

"Those who fail the test fall to the previous floor." Falling is the game's biggest stick, so it needs rules that make it feel earned and never like being griefed.

**Proposed rules:**
1. **Floor 1 is the floor of the Tower.** Nobody falls below it.
2. **You fall on 3 Strikes.** A Strike comes from:
   - losing a Stake Duel;
   - failing a **Standing Exam**: a re-test triggered by long inactivity on your floor (proposed: 30 days without a single passed Task).
3. **Strikes heal.** One Strike is removed for each Task you pass on your floor, so active Climbers rarely fall.
4. **Arrival grace.** You can't take Strikes in your first 7 days on a floor.
5. **One floor at a time.** You can't fall more than one floor per 24 hours.
6. **Falling lands you in the lower floor's Hall.** Its boss stays beaten. To climb back you only need that floor's Exam.

**Open questions for Ronald:** Is 3 Strikes right? Should Stake Duels also exist across floors (someone below challenging someone above)? Should inactivity cause Strikes at all, or only duels?

## Tone

- **Respectful towards history.** Historical computing pioneers appear as **Examiners**: proud, demanding and fair. When you beat them they acknowledge you; they are never mocked. Only figures who died 70+ years ago appear by name ([ADR-0010](../adr/0010-historical-figures-as-examiners.md)).
- **Parody for the modern villain.** Big-Tech satire stays fictional (the Meta Legion, ADR-0007).
- **Anime energy.** Boss intros, phase transitions, title cards, aura effects. The game should feel *mad*: big moments, big sound, big text.
- **Teach while fighting.** Every boss's Tasks are about *their* contribution to computing, so you learn the history by beating it.

## Planned floors (sketch)

Only Floor 1 is designed in detail ([`floors/01-testing-floor.md`](floors/01-testing-floor.md)). Each later floor gets its own doc before it's built.

| Floor | Working name | Boss idea | Theme / topic |
|---|---|---|---|
| 1 | **The Testing Floor** | Ada Lovelace & Charles Babbage | Origins of computing: algorithms, loops, the first program |
| 2 | The Codebreakers' Hut | Alan Turing (Bletchley) | Logic, state machines, ciphers |
| 3 | The Compiler Deck | *an homage character* (Grace Hopper died 1992: too recent, see ADR-0010) | Compilers, debugging, the first "bug" |
| 4 | The Shortest Path | *an homage character* (Dijkstra died 2002) | Graphs, shortest paths |
| … | … | … | … |
| top | The Meta Spire | Zark and the Meta Legion | Everything |

Floors 2+ are sketches to show where this goes, not commitments.
