SLUG = "sum-list"
TITLE = "Firstbug's Sum"
DIFFICULTY = 1
FUNCTION = "total"
SIGNATURE = "def total(nums):"
UNORDERED = False
TOPICS = ["loops", "debugging"]

# Floor 1, Firstbug (the Moth Room): an off-by-one in a loop that sums a list.

STATEMENT = """
`total(nums)` should return the sum of every number in the list (0 for an empty
list). It's close, but a bug has crept into the loop. Find it and fix it.

```
total([1, 2, 3])  ->  6
total([])         ->  0
```
"""

PUBLIC_CASES = [
    [[1, 2, 3]],
    [[]],
    [[10, -4]],
]

HIDDEN_CASES = [
    [[5]],
    [[0, 0, 0]],
    [[7, 1, 1, 1]],
    [[-3, -3, -3]],
    [[100, 200, 300, 400]],
]

BUGGY_PY = """
def total(nums):
    result = 0
    for i in range(1, len(nums)):
        result += nums[i]
    return result
"""

BUGGY_JS = """
function total(nums) {
  let result = 0
  for (let i = 1; i < nums.length; i++) {
    result += nums[i]
  }
  return result
}
"""


def solve(nums):
    return sum(nums)
