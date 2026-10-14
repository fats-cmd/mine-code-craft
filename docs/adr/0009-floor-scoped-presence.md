# 0009 — Presence is floor-scoped: you share a Floor Hall with Climbers on your floor

**Status:** accepted · 2026-10-14 · supersedes the "one shared Base for everyone" part of [ADR-0001](0001-hub-and-tower-structure.md)

## Context
ADR-0001 had a single shared Base at the bottom of the Tower, where everyone met regardless of progress, with Floors as solo Trials. The owner's design (2026-10-14) is different: every floor is its own place, and you see the players who are on *your* floor. A veteran stuck on a floor meets every newcomer who reaches it.

## Decision
- Every floor has a **Floor Hall**: the shared space for Climbers whose current floor is that floor.
- The server room becomes a `FloorRoom` keyed by floor number. Clients call `joinOrCreate("floor", { floor })`, the room is defined with `filterBy(["floor"])`, and instancing (~50 per instance) works per floor exactly as `BaseRoom` does today.
- The server decides which floor you may join. Today that's floor 1 for everyone (guests); with sign-in it comes from the profile.
- A floor's **Approach and Boss** are solo (client scene plus server-graded Tasks via `TrialRoom`). Only the Hall is shared.
- Duels, quests and chat happen inside a Floor Hall and only involve Climbers on that floor.

## Consequences
- Today's `BaseRoom` becomes Floor 1's Hall, mostly by renaming and adding a `floor` field. The movement, interpolation, identity and chat code carries over unchanged.
- Each floor has its own Hall scene (art) on shared Hall mechanics (stations, pads, quest board, exam gate).
- Population is split by floor. A quiet floor can feel empty, so floor population and an "N Climbers on this floor" indicator matter, and very empty floors may need merging or bots later.
