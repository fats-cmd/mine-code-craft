SLUG = "moving-average"
TITLE = "Moving Average"
DIFFICULTY = 3
FUNCTION = "moving_average"
SIGNATURE = "def moving_average(nums, k):"
UNORDERED = False

STATEMENT = """
Return the average of every window of `k` consecutive numbers, left to right.

- The result has `len(nums) - k + 1` entries.
- If `k` is larger than the list, or `k` is zero or negative, return an empty list.
- Results are floats. **Small floating-point differences are accepted** — a running
  sum and a fresh sum per window will not agree to the last bit, and both are correct.

```
moving_average([1, 2, 3, 4], 2)     ->  [1.5, 2.5, 3.5]
moving_average([1, 2, 3], 3)        ->  [2.0]
moving_average([1, 2], 5)           ->  []
```
"""

PUBLIC_CASES = [
    [[1, 2, 3, 4], 2],
    [[1, 2, 3], 3],
    [[1, 2], 5],
]

HIDDEN_CASES = [
    [[], 1],
    [[], 0],
    [[5], 1],
    [[1, 2, 3, 4, 5], 1],
    [[1, 2, 3], 0],
    [[1, 2, 3], -2],
    [[0.1, 0.2, 0.3, 0.4, 0.5], 3],
    [[0.1] * 30, 3],
    [[1e-12, 2e-12, 3e-12], 2],
    # Large magnitude, all positive (no cancellation): a sliding-window solution
    # is genuinely correct here yet its floats differ from the reference's by ~0.25
    # absolute. Only *relative* tolerance forgives that -- absolute-only would wrongly
    # fail a correct player. This is the case that makes the tolerance rule necessary.
    [[1e10, 3.3e12, 0.5, 2.5e15, 3.3e12, 2.5e15, 1.0], 4],
    [[0.5, 7.7, 1.6, 0.1, 0.05], 2],
    [[-1, -2, -3, -4], 2],
    [[10, -10, 10, -10, 10], 2],
    [[1.5, 2.5, 3.5], 2],
    [[7, 7, 7, 7, 7, 7, 7], 4],
]


def solve(nums, k):
    if k <= 0 or k > len(nums):
        return []
    return [sum(nums[i:i + k]) / k for i in range(len(nums) - k + 1)]
