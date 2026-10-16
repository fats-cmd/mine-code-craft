# Challenge content

Every Challenge (CONTEXT: Challenge, Format) is written here and built, never hand-edited
downstream. Expected outputs are computed, not typed:

```
npm run content          # python3 content/build/build.py
```

| Source | Format | What the build does |
|---|---|---|
| `challenges/code/<slug>/reference.py` | Code | runs `solve()` on every case to get the expected outputs |
| `challenges/code/<slug>/reference.js` | Code | optional; must agree with Python on every case (ADR-0008) |
| `challenges/fix/<slug>/reference.py` | Fix | as Code, plus `BUGGY_PY` / `BUGGY_JS`; checks the buggy code fails at least one case |
| `challenges/predict/<slug>.yaml` | Predict | runs each snippet (`python3`, `node`) and captures its output |
| `challenges/quiz/<bank>.yaml` | Quiz | checks 2-5 distinct options and a valid answer index; slugs are `<bank>-<id>` |

Outputs:

| File | Contents | Reaches the client? |
|---|---|---|
| `packages/shared/src/content/challenges.gen.ts` | statements, starters, snippets, quiz options, **public cases with expected** | yes, in the bundle |
| `apps/server/content/challenges.private.json` | **hidden cases (args + expected), Predict outputs, Quiz answers** | hidden args only, at trial time |

**The split that makes server grading work** (ADR-0002): hidden *args* must reach the
client at trial time, because the browser is the only thing that runs the player's code.
Hidden *expected outputs* never leave the server. "Never bundled" means not in the static
build; it does not mean never sent.

## Reference-file contract (Code and Fix)

Required: `SLUG` (equal to the folder name), `TITLE`, `DIFFICULTY`, `FUNCTION`
(snake_case; the JS name is its camelCase), `SIGNATURE`, `STATEMENT`, `PUBLIC_CASES`,
`HIDDEN_CASES`, `solve`. Optional: `TOPICS`, `UNORDERED` (default false), `LANGUAGES`
(default both). Fix also needs `BUGGY_PY` and `BUGGY_JS`. Every case is a list of
positional args, splatted into `solve(*args)`, deep-copied per case. Results cross the
wire as typed JSON (Python floats tagged `{"$float": x}`), and a `solve` returning a tuple
or set fails the build rather than storing something a browser can't produce.

## What each problem exercises in the comparator

The set is chosen so the comparator (`packages/shared/src/challenge/comparator.ts`) has a real fixture for every
branch, not just for `===`.

| # | Slug | Diff | Return type | Comparator branch it pins |
|---|---|---|---|---|
| 1 | `two-sum` | 1 | `list[int]` | ordered list of ints; **empty list ≠ no result** |
| 2 | `balanced-brackets` | 1 | `bool` | `True` is not `"true"` and not `1` |
| 3 | `run-length-encode` | 2 | `str` | exact strings, case-sensitive, empty string |
| 4 | `word-frequency` | 2 | `dict[str, int]` | **dict compared by key, not insertion order** |
| 5 | `rotate-matrix` | 3 | `list[list]` | nested structure + shape; mixed leaf types |
| 6 | `moving-average` | 3 | `list[float]` | **relative-OR-absolute 1e-9 tolerance** |
| 7 | `group-anagrams` | 4 | `list[list[str]]` | **`unordered: true`** |
| 8 | `longest-unique-substring` | 4 | `int` | scalar int; sliding-window edge cases |

Two per difficulty tier, so a duel can pick a level without repeating.

## Three pins, discovered while drafting these

These are load-bearing. Getting any of them wrong marks a correct solution wrong —
which the plan calls the worst bug this game can have.

### 1. `unordered` is a *list* flag. Dicts always compare by key.

Dict key order is never semantic — two correct solutions building the same dict in
different insertion orders are both right, and `word-frequency`'s statement explicitly
promises the player that key order doesn't matter. So dict comparison is key-set plus
per-key value, always, with no flag involved. `word-frequency` therefore has
`UNORDERED = False` and still compares order-insensitively at the dict level. That is
not a contradiction; `unordered` only ever relaxes **list** ordering.

### 2. `unordered` and float tolerance never co-occur — keep it that way.

`group-anagrams` is the only unordered problem, and it contains only strings. That means
its multiset comparison can be done by canonicalising each element to a JSON string and
sorting — cheap and exact. Combining `unordered` with float tolerance would break that:
tolerant equality isn't a hash, so you'd need bipartite matching between expected and
actual elements. **Don't add an unordered problem with floats in it** without accepting
that cost. The inner groups here are specified as sorted so the problem stays
well-defined even under a strictly-ordered reading.

### 3. Float cases: all-positive mixed magnitude is fair. Sign-cancelling is a trap.

`moving-average` exists to prove the tolerance rule is necessary, and it does — verified,
not assumed. Its hidden case `[1e10, 3.3e12, 0.5, 2.5e15, 3.3e12, 2.5e15, 1.0], k=4`:

- reference (fresh `sum` per window) → `…1250825000000000.2`
- O(n) sliding window → `…1250825000000000.0`
- `math.fsum` (exactly rounded) agrees with the reference

Absolute difference **0.25**, relative difference **2.0e-16**. The sliding-window player
is genuinely correct, so:

- exact `==` fails them,
- **absolute-only** tolerance fails them (0.25 ≫ 1e-9),
- **relative** tolerance passes them.

That single case is why the rule is relative **OR** absolute rather than either alone.

The trap to avoid: the same divergence at large magnitude *with opposite signs*
(e.g. `[1e16, 1e16, 0.2, -0.7, …]`) makes a sliding window catastrophically wrong —
100% relative error — because the big terms cancel and destroy the small ones. No
tolerance can rescue that, and no tolerance should try. **Float cases stay all-positive,
or keep magnitudes within a couple of orders.** Every current case satisfies this;
the first draft of this problem used only uniform magnitudes and so exercised the
tolerance branch not at all.

## Adding a Challenge

Write the source file, run `npm run content`, commit both outputs. Then re-check the three pins
above — particularly, if the return type contains floats, verify a plausible alternative
implementation still lands inside 1e-9 relative before committing the case.
