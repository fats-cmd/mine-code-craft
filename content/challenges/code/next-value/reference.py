SLUG = "next-value"
TITLE = "The Next Value"
DIFFICULTY = 2
FUNCTION = "next_value"
SIGNATURE = "def next_value(sequence):"
UNORDERED = False
TOPICS = ["loops", "lists", "sequences"]

# Floor 1, Babbage's phase 3: the Analytical Engine boots and you program it.

STATEMENT = """
Babbage's Difference Engine predicted the next value of a polynomial sequence
without ever multiplying. Take the differences between neighbours, then the
differences of those, and so on, until a row is all the same number. Then add
back up the last column.

```
1   4   9   16   (25)
  3   5   7    (9)
    2   2   (2)
```

Write `next_value(sequence)`: given at least two whole numbers of a polynomial
sequence, return the next one.

```
next_value([2, 4, 6, 8])         ->  10
next_value([1, 4, 9, 16])        ->  25
next_value([1, 8, 27, 64, 125])  ->  216
```
"""

PUBLIC_CASES = [
    [[2, 4, 6, 8]],
    [[1, 4, 9, 16]],
    [[1, 8, 27, 64, 125]],
]

HIDDEN_CASES = [
    [[5, 5, 5]],
    [[3, 1]],
    [[0, 1, 4, 9, 16, 25]],
    [[1, 3, 6, 10, 15]],
    [[2, 9, 28, 65, 126]],
    [[-1, -8, -27, -64]],
    [[10, 7, 4, 1]],
    [[1, 2, 4, 7, 11, 16]],
    [[0, 0, 0, 0, 0]],
    [[100, 1000]],
]


def solve(sequence):
    rows = [list(sequence)]
    while len(set(rows[-1])) > 1 and len(rows[-1]) > 1:
        last = rows[-1]
        rows.append([b - a for a, b in zip(last, last[1:])])
    total = 0
    for row in rows:
        total += row[-1]
    return total
