SLUG = "largest"
TITLE = "The Biggest Number"
DIFFICULTY = 1
FUNCTION = "largest"
SIGNATURE = "def largest(nums):"
UNORDERED = False
TOPICS = ["loops", "debugging"]

STATEMENT = """
`largest(nums)` should return the biggest number in a non-empty list. It works
on the examples you'd try first, but not on every list. Find the bug and fix it.

```
largest([3, 9, 2])  ->  9
```
"""

PUBLIC_CASES = [
    [[3, 9, 2]],
    [[1]],
]

HIDDEN_CASES = [
    [[-5, -2, -9]],
    [[-1]],
    [[0, -1]],
    [[4, 4, 4]],
    [[-10, 3, -20]],
]

BUGGY_PY = """
def largest(nums):
    best = 0
    for n in nums:
        if n > best:
            best = n
    return best
"""

BUGGY_JS = """
function largest(nums) {
  let best = 0
  for (const n of nums) {
    if (n > best) best = n
  }
  return best
}
"""


def solve(nums):
    return max(nums)
