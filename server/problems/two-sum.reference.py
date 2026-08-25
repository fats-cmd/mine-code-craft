SLUG = "two-sum"
TITLE = "Two Sum"
DIFFICULTY = 1
FUNCTION = "two_sum"
SIGNATURE = "def two_sum(nums, target):"
UNORDERED = False

STATEMENT = """
Given a list of integers and a target, find the two numbers that add up to the
target and return **their indices** in ascending order.

- At most one pair sums to the target, so there is never a tie to break.
- If no pair sums to the target, return an empty list.
- The same element cannot be used twice.

```
two_sum([2, 7, 11, 15], 9)  ->  [0, 1]
two_sum([3, 2, 4], 6)       ->  [1, 2]
two_sum([1, 2, 3], 100)     ->  []
```
"""

PUBLIC_CASES = [
    [[2, 7, 11, 15], 9],
    [[3, 2, 4], 6],
    [[1, 2, 3], 100],
]

HIDDEN_CASES = [
    [[], 0],
    [[5], 5],
    [[0, 0], 0],
    [[-3, 4, 1], 1],
    [[-8, -2, -5], -7],
    [[1000000, 999999], 1999999],
    [[10, 20, 30, 40, 50], 90],
    [[1, 2, 3, 4, 5, 6, 7, 8, 9, 100], 109],
    [[4, 4], 8],
    [[7, 1, 2, 3], 10],
]


def solve(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
