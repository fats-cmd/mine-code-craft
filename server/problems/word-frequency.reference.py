import re

SLUG = "word-frequency"
TITLE = "Word Frequency"
DIFFICULTY = 2
FUNCTION = "word_frequency"
SIGNATURE = "def word_frequency(text):"
UNORDERED = False

STATEMENT = """
Count how many times each word appears in the text, and return a dictionary mapping
word to count.

- A **word is a maximal run of ASCII letters** (`a`–`z`, `A`–`Z`). Everything else —
  digits, spaces, punctuation, apostrophes — is a separator. So `"don't"` is the two
  words `don` and `t`, and `"h2o"` is `h` and `o`.
- Counting is **case-insensitive**, and keys in the result are **lowercase**.
- Text with no letters gives an empty dictionary.

```
word_frequency("the cat the")   ->  {"the": 2, "cat": 1}
word_frequency("Hi, hi. HI!")   ->  {"hi": 3}
word_frequency("123 456")       ->  {}
```

The order of keys in your dictionary does not matter.
"""

PUBLIC_CASES = [
    ["the cat the"],
    ["Hi, hi. HI!"],
    ["123 456"],
]

HIDDEN_CASES = [
    [""],
    ["a"],
    ["a a a a a"],
    ["one two three"],
    ["don't stop"],
    ["h2o and c2h5oh"],
    ["   spaced   out   "],
    ["Mixed CASE mixed case MIXED"],
    ["punctuation!!! everywhere??? really..."],
    ["aaa bbb aaa ccc bbb aaa"],
    ["The rain in SPAIN stays mainly in the plain"],
    ["!@#$%^&*()"],
]


def solve(text):
    counts = {}
    for word in re.findall(r"[a-zA-Z]+", text):
        word = word.lower()
        counts[word] = counts.get(word, 0) + 1
    return counts
