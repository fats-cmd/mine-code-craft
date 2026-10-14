# 0001 — A shared Base hub plus a floor-climbing Tower

**Status:** partly superseded by [ADR-0009](0009-floor-scoped-presence.md) (2026-10-14): there is no single shared Base anymore; each floor has its own Floor Hall · originally accepted 2026-10-13

## Context
The game is a public 3D world where Climbers meet, battle, and progress. The theme is inspired by tower-climbing anime. We considered three options: every Floor as its own 3D zone, the Tower as only a rank badge, or a single hub with a floor climb.

## Decision
One hand-built **Base** where all social play happens (meeting, challenging, queueing). The **Tower** is the progression: Floors are cleared through Floor Tests (solo Trials) and Boss Floors. The highest Floor cleared shows on your nameplate.

## Consequences
- One world to build and optimise, not dozens. New Floors are content, not new 3D zones.
- Boss Floors and Floor Tests reuse the Trial machinery.
- Floors can get their own small 3D scenes later without changing the model.
