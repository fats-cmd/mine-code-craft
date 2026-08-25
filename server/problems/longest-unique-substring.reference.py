SLUG = "longest-unique-substring"
TITLE = "Longest Unique Substring"
DIFFICULTY = 4
FUNCTION = "longest_unique"
SIGNATURE = "def longest_unique(s):"
UNORDERED = False

STATEMENT = """
Return the **length** of the longest substring of `s` that contains no repeated
character.

- A substring is contiguous. `"abcabc"` has no unique substring longer than 3.
- Characters are compared exactly: case matters, spaces count as characters.
- The empty string gives `0`.

Return the length, not the substring itself.

```
longest_unique("abcabcbb")  ->  3     ("abc")
longest_unique("bbbbb")     ->  1     ("b")
longest_unique("pwwkew")    ->  3     ("wke")
longest_unique("")          ->  0
```
"""

PUBLIC_CASES = [
    ["abcabcbb"],
    ["bbbbb"],
    ["pwwkew"],
    [""],
]

HIDDEN_CASES = [
    ["a"],
    ["aa"],
    ["ab"],
    ["abcdefghij"],
    ["abba"],
    ["tmmzuxt"],
    ["dvdf"],
    ["aAbBcC"],
    ["a b c a b"],
    ["!@#!@#"],
    ["0123456789012"],
    ["abcdeafghij"],
    ["thequickbrownfox"],
    ["nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"],
]


def solve(s):
    last_seen = {}
    best = 0
    start = 0
    for i, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1
        last_seen[ch] = i
        best = max(best, i - start + 1)
    return best
