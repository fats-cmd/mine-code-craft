# The eight duel problems

Generated, never hand-edited. `<slug>.reference.py` is the single source of truth for
one problem; `build_problems.py` runs its `solve()` to produce every expected output:

```
python3 server/problems/build_problems.py
```

Outputs:

| File | Contents | Reaches the client? |
|---|---|---|
| `shared/problems/<slug>.json` | statement, signature, starter, **public samples with expected** | yes, in the bundle |
| `shared/problems/index.json` | slug / title / difficulty / unordered | yes, in the bundle |
| `server/problems/<slug>.private.json` | **hidden cases: args + expected** | args only, at duel time |

**The split that makes server-grading work** (plan decision 2): hidden *args* must reach
the client at duel time — the browser is the only thing that runs Python. Hidden
*expected outputs* never leave the server. "Never bundled" means not in the static
build; it does not mean never sent.

## Reference-file contract

Required module attributes, enforced by the generator: `SLUG`, `TITLE`, `DIFFICULTY`,
`FUNCTION`, `SIGNATURE`, `STATEMENT`, `PUBLIC_CASES`, `HIDDEN_CASES`, `solve`.
Optional: `UNORDERED` (defaults false). Every case is a list of positional args, splatted
into `solve(*args)`. Every expected value is JSON-round-tripped, so a `solve` returning a
tuple or set fails the build rather than silently storing something a browser can't produce.

## What each problem exercises in the comparator

The set is chosen so Phase 5's comparator (seam 3 of 3) has a real fixture for every
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

## Adding a problem later

Write one `<slug>.reference.py`, re-run the generator. Then re-check the three pins
above — particularly, if the return type contains floats, verify a plausible alternative
implementation still lands inside 1e-9 relative before committing the case.
