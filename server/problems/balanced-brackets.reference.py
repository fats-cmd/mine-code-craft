SLUG = "balanced-brackets"
TITLE = "Balanced Brackets"
DIFFICULTY = 1
FUNCTION = "is_balanced"
SIGNATURE = "def is_balanced(s):"
UNORDERED = False

STATEMENT = """
Return `True` if every bracket in the string is closed by the matching kind, in the
right order, and `False` otherwise.

- The three pairs are `()`, `[]` and `{}`.
- **Any character that is not a bracket is ignored**, so `"a(b)c"` is balanced.
- The empty string is balanced.

```
is_balanced("([]{})")   ->  True
is_balanced("([)]")     ->  False
is_balanced("(")        ->  False
is_balanced("f(x[0])")  ->  True
```
"""

PUBLIC_CASES = [
    ["([]{})"],
    ["([)]"],
    ["("],
    ["f(x[0])"],
]

HIDDEN_CASES = [
    [""],
    [")"],
    ["]("],
    ["(("],
    ["))"],
    ["{[()]}"],
    ["{[(])}"],
    ["no brackets at all"],
    ["(((((((((())))))))))"],
    ["(]"],
    ["a(b[c{d}e]f)g"],
    ["([{}])(]"],
]


def solve(s):
    closing = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in closing:
            if not stack or stack.pop() != closing[ch]:
                return False
    return not stack
