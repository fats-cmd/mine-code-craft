# 0006 — Supabase for auth and persistence. The game server writes progression.

**Status:** accepted · 2026-10-13

## Decision
Supabase Auth with GitHub, Google and email/password. Postgres with RLS. Colyseus verifies the access token in `onAuth`. All progression tables (ratings, matches, submissions, XP, perks, cosmetics) are written only by the game server with the service-role key. Clients read public data directly.

## Consequences
- One identity system, and progression can't be written from the client.
- Built-in SMTP (~2 emails/hour) is unusable publicly, so custom SMTP is a launch requirement (M10).
- Free-tier projects pause after a week of inactivity. Expect that in development and use a paid plan for the public launch.
