# 0011 — The Fall: failing tests can drop you a floor

**Status:** proposed · 2026-10-14 · rules to be tuned by playtesting

## Context
The owner wants real stakes: "those who fail the test will fall to the previous floor." Falling is the strongest motivator in the game and the fastest way to make people quit if it feels unfair or griefable.

## Decision (proposed)
- Floor 1 is the bottom; nobody falls below it.
- A Climber falls on **3 Strikes**. A Strike comes from losing an opt-in **Stake Duel** or failing a **Standing Exam** (triggered by about 30 days with no passed Task on the floor).
- Each Task passed on your current floor heals one Strike.
- Climbers have **7 days of arrival grace** on a new floor, and fall **at most one floor per 24 hours**.
- Falling lands you in the lower floor's Hall. Bosses stay beaten, so climbing back needs only that floor's Exam.
- The server alone decides Strikes and Falls (they are progression, written with the service role).

## Consequences
- Needs persistent profiles, so the Fall waits for sign-in (M2b). Guests always start at Floor 1.
- Stake Duels must be mutually accepted, so nobody can be dragged down by someone else alone.
- Numbers (3 Strikes, 7 days, 30 days) are placeholders until floors 1–3 have been played.
