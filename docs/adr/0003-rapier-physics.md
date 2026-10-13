# 0003 — Rapier for physics and the character controller

**Status:** accepted · 2026-10-13 · supersedes the grid-collision design and the current `@react-three/cannon` use

## Context
The Base is built by hand in R3F code (not a voxel grid), so grid-lookup collision no longer fits. The repo currently uses `@react-three/cannon`, which has little maintenance and no character controller.

## Decision
Use `@react-three/rapier`: fixed rigid bodies for world geometry, and Rapier's kinematic character controller for the local avatar. Clamp frame `dt` to 0.1 s (see `packages/shared/src/movement.ts`).

## Consequences
- Slopes, steps and wall-sliding come built in.
- Rapier also runs in Node, so server-side movement validation is possible later. For now the server only checks speed and bounds (movement is client-authoritative).
- `@react-three/cannon` gets removed in M0.
