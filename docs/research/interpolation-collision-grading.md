# Reference implementations: interpolation, voxel collision, output grading

Research notes for the three seams that carry real algorithmic risk in Voxel Coding Arena. Gathered 2026-08-21 from primary sources. Each claim is cited; where a source contradicts `For-Claude/SPEC.md`, that's called out.

---

## 1. Entity interpolation

**Source:** [Gabriel Gambetta, *Entity Interpolation*](https://www.gabrielgambetta.com/entity-interpolation.html) (Fast-Paced Multiplayer, Part III).

### The rule for render delay

> `RENDER_DELAY = 1 / SERVER_TICK_HZ`

The delay must be **at least one server update interval**, because the render timestamp has to fall *between two snapshots you already hold*, and consecutive snapshots are one interval apart.

Applied here: Colyseus's default patch rate is **50 ms (20 Hz)**, so the minimum is 50 ms. `SPEC.md` specifies **~100 ms**, which is 2× the interval — one interval to make interpolation possible at all, one more as jitter margin. **The spec's number is correct and well-chosen.** Don't "optimise" it down to 50 ms; that leaves zero tolerance for a single late packet.

### The algorithm

```
render_time = now - RENDER_DELAY

# drop snapshots we've passed, keeping the one just before render_time
while len(buffer) >= 2 and buffer[1].time <= render_time:
    buffer.pop_front()

if len(buffer) >= 2 and buffer[0].time <= render_time <= buffer[1].time:
    a, b = buffer[0], buffer[1]
    alpha = (render_time - a.time) / (b.time - a.time)   # in [0,1]
    lerp(a.pos, b.pos, alpha)
else:
    hold last known position   # buffer starved
```

Snapshots are **stored sorted by server timestamp**, not by arrival order — UDP-style reordering doesn't apply over Colyseus's WebSocket, but a stale patch after a stall does.

### Two details that are bugs if missed

1. **Angles interpolate along the shortest arc.** Naive `lerp(3.10, -3.10)` spins the avatar most of the way around the circle. This is the ±π wraparound; it must be handled explicitly.
2. **Discrete state snaps, it does not blend.** Gambetta's note: interpolate positions, but take `status`, `username`, `preset` from the *newer* snapshot directly. Lerping a status enum is meaningless.

### On starvation

When the buffer runs dry, the article's fallback is to hold or briefly dead-reckon. Dead reckoning is explicitly called out as **useless for humanoid characters** — "players stop and turn corners instantly" — and only suits vehicles. **Hold the last position.** Do not extrapolate walking avatars.

### The accepted consequence

> "Every player sees a slightly different rendering of the game world" — yourself in the present, everyone else 100 ms in the past.

This is fine and invisible here. It matters only for aiming, which this game does not have, so **lag compensation is correctly out of scope.**

---

## 2. Voxel collision

**Source:** [fenomas/voxel-aabb-sweep](https://github.com/fenomas/voxel-aabb-sweep) (Andy Hall, MIT), built on [fast-voxel-raycast](https://github.com/fenomas/fast-voxel-raycast). This is the collision layer of `noa-engine`, a production JS voxel engine.

### Where it contradicts the spec

`SPEC.md` describes collision as `map[x][y][z] !== 0`, "roughly fifteen lines, no raycasting." The README rejects the naive form of exactly that: moving the box **along each axis in turn** is

> "inaccurate for larger movements"

and produces **"anisotropic results"** — a bias toward registering collisions on particular axes depending on approach direction. Its own approach is a single unified traversal that "essentially raycasts along the AABB's leading corner," checking the leading face whenever the ray crosses a voxel plane.

### The resolution, and why the spec is still mostly right

Per-axis resolution is fine **when per-frame movement is small relative to a block** — which is true for a walking character at 60 fps. The spec's simple version is the right call for this project.

**But it fails hard on one specific input: a large `dt`.** And this project manufactures large `dt` deliberately — the duel is a full-screen takeover that backgrounds the Canvas, and `visibilitychange` is a core mechanic. A backgrounded tab throttles `requestAnimationFrame`; on return, an unclamped `dt` can be **seconds**. `pos += vel * dt` then steps straight through the floor, and the grid check never sees the blocks in between.

**Mitigation (cheap, non-negotiable):** clamp `dt` per frame — `dt = Math.min(dt, 1/30)` — and substep movement if it still exceeds a fraction of a block. Roughly three lines, and it turns a tunneling bug that only reproduces after tab-switching into a non-issue. This is the single highest-value thing in these notes for Phase 1.

**Escape hatch:** if collision still feels wrong against corners, `npm i voxel-aabb-sweep` rather than writing a sweep by hand.

### Boundary handling

The library defaults `epsilon` to **1e-10**, the "rounding factor by which an AABB must cross a voxel boundary to count" — so a face landing exactly flush on a boundary doesn't register a crossing. Standing exactly on `y = 4.0` must not read as intersecting the block at `y = 4`. Pick a consistent half-open convention for cell occupancy and test it.

---

## 3. Output grading

**Source:** [ICPC / Kattis Problem Package Format — output validators](https://icpc.io/problem-package-format/spec/legacy.html). This is the format ICPC and Kattis actually judge with.

The default validator is **not `===`**. It is "essentially a beefed-up diff" that **tokenizes both sides and compares token by token.** Directly relevant to the server-side comparator, since the client returns actual outputs for the server to check.

### The conventions worth copying

| Rule | Default | Note |
|---|---|---|
| Whitespace | "any sequence of 1 or more whitespace characters are equivalent" | Spacing, line breaks, trailing newline all immaterial |
| Case | **Insensitive** by default; `case_sensitive` opts in | Flip this for us — Python `True` ≠ `true` |
| Floats | Exact unless a tolerance is set | With no tolerance, floats "have to match exactly" |
| Float tolerance | `float_relative_tolerance` / `float_absolute_tolerance` | Accepted if within **either** — combined permissively |
| Float formatting | Irrelevant once tolerance is on | `0.0314` matches `3.14000000e-2` |

**The key one:** a token passes if it's within the relative **or** the absolute tolerance. Relative alone breaks near zero; absolute alone breaks on large magnitudes. You need both, OR'd. `1e-9` for each is a sane default.

Custom validators exist for when diff isn't enough (`validation: custom`, exit **42** = accepted, **43** = wrong answer). Our equivalent is a per-problem comparison mode.

### Implication for our comparator

Comparing across a JS/Python boundary means the tokenizer model doesn't fully transfer — we're comparing JSON-serialised return values, not stdout text. What does transfer:

- **Compare structurally, then per-leaf**, not by string equality of the whole payload.
- **Floats: relative-or-absolute, 1e-9 both.** Never `===` on a float.
- **Be explicit about collection ordering.** A problem returning a set or dict keys needs to declare whether order matters; Python dict order is insertion-ordered and will differ between correct solutions.
- **Case-sensitive**, unlike the ICPC default, because we're comparing typed values rather than prose.

---

## Summary of changes to the spec

| Spec claim | Verdict |
|---|---|
| Interpolate remote players ~100 ms behind | ✅ Correct — 2× Colyseus's 50 ms patch rate |
| "Interpolation is the single highest-value detail" | ✅ Confirmed, and shortest-arc angles + snapped discrete fields are the parts most often missed |
| Collision is `map[x][y][z] !== 0`, ~15 lines | ⚠️ Right for this game, **but needs a `dt` clamp** or tab-switching tunnels through the floor |
| Server owns clock and test cases | ✅ And the comparator should follow ICPC float/whitespace conventions, not `===` |
| Dead reckoning / lag compensation | ✅ Correctly out of scope — useless for humanoids, and there's no aiming |
