# 0004 — Colyseus rooms: instanced Base, separate battle rooms

**Status:** accepted · 2026-10-13

## Context
The target is thousands of concurrent players. Keeping everyone in one world would need area-of-interest filtering and sharding.

## Decision
- `BaseRoom` instances of up to ~50 Climbers, filled by `joinOrCreate`.
- `QueueRoom` for matchmaking, `DuelRoom` (2 players) and `TrialRoom` (1 player) for battles.
- A Climber keeps their BaseRoom connection during a battle.
- One process until launch prep, then the Redis presence and driver for horizontal scaling.

## Consequences
- Each room's state stays small, and scaling means adding processes.
- Friends can end up in different instances. Joining a friend's instance by room ID is a planned follow-up.
