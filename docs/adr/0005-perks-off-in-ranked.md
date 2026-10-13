# 0005 — Perks work in Casual and Trials, never in Ranked

**Status:** accepted · 2026-10-13

## Context
Anime-style Role perks (extra time, reveal a failing case, disrupt the opponent) are core to the fantasy, but if they affect rating, Rank partly measures your loadout.

## Decision
Perks are enabled in Casual Duels and Trials (including Floor Tests and Boss Floors) and disabled in Ranked. The server applies every effect. The client only requests `perk:use`.

## Consequences
- Rank stays a skill measure. Perks get their own playground.
- Perk rules are pure and unit-tested in `packages/shared/perks`.
