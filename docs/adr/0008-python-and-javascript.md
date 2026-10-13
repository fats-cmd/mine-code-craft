# 0008 — Python and JavaScript, with one number rule for JS

**Status:** accepted · 2026-10-13

## Context
Code, Fix and Predict Challenges support Python and JavaScript. The comparator was designed for Python values, where `1` (int) and `1.0` (float) are different types. JavaScript has only one number type.

## Decision
- Python `reference.py` stays the source of truth for expected outputs. An optional `reference.js` must agree on every case, and the content build checks this.
- When `language = javascript`, the comparator treats int and float as one numeric type (still with 1e-9 rel/abs tolerance). All other type distinctions hold in both languages (`true` ≠ `1`, `"1"` ≠ `1`, `null` ≠ `[]`).
- Challenges whose answer depends on Python-only semantics (tuples, sets, big-int overflow) are marked `languages: [python]`.

## Consequences
- Each Challenge needs a JS signature and starter, which roughly doubles authoring effort for Code and Fix.
- No other languages without a new ADR, since each one adds a runner and per-language starter code for every Challenge.
