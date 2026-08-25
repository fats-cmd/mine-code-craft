SLUG = "rotate-matrix"
TITLE = "Rotate Matrix"
DIFFICULTY = 3
FUNCTION = "rotate"
SIGNATURE = "def rotate(matrix):"
UNORDERED = False

STATEMENT = """
Rotate a 2-D list 90 degrees **clockwise** and return the result as a new list of lists.

- The matrix does **not** have to be square. An `m × n` matrix rotates into an `n × m`
  one: the first row becomes the last column.
- All rows have the same length.
- An empty matrix (`[]`) rotates to `[]`.

```
rotate([[1, 2],
        [3, 4]])        ->  [[3, 1],
                             [4, 2]]

rotate([[1, 2, 3],
        [4, 5, 6]])     ->  [[4, 1],
                             [5, 2],
                             [6, 3]]
```
"""

PUBLIC_CASES = [
    [[[1, 2], [3, 4]]],
    [[[1, 2, 3], [4, 5, 6]]],
]

HIDDEN_CASES = [
    [[]],
    [[[1]]],
    [[[1, 2, 3]]],
    [[[1], [2], [3]]],
    [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
    [[[1, 2], [3, 4], [5, 6], [7, 8]]],
    [[[0, 0], [0, 0]]],
    [[[-1, -2], [-3, -4]]],
    [[["a", "b"], ["c", "d"]]],
    [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]],
    [[[True, False], [False, True]]],
]


def solve(matrix):
    if not matrix:
        return []
    rows = len(matrix)
    cols = len(matrix[0])
    return [[matrix[rows - 1 - r][c] for r in range(rows)] for c in range(cols)]
