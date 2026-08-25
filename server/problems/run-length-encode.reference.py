SLUG = "run-length-encode"
TITLE = "Run-Length Encode"
DIFFICULTY = 2
FUNCTION = "encode"
SIGNATURE = "def encode(s):"
UNORDERED = False

STATEMENT = """
Compress a string by replacing each run of identical characters with the character
followed by the length of the run.

- **Every run gets a count, including runs of length 1** — `"abc"` becomes `"a1b1c1"`,
  not `"abc"`.
- Runs of length 10 or more use the full number: ten `a`s become `"a10"`.
- The empty string encodes to the empty string.
- Characters are case-sensitive: `"aA"` is two runs.

```
encode("aaabbc")  ->  "a3b2c1"
encode("abc")     ->  "a1b1c1"
encode("")        ->  ""
encode("aA")      ->  "a1A1"
```
"""

PUBLIC_CASES = [
    ["aaabbc"],
    ["abc"],
    [""],
    ["aA"],
]

HIDDEN_CASES = [
    ["a"],
    ["aa"],
    ["aaaaaaaaaa"],
    ["aaaaaaaaaaaa"],
    ["wwwwwwwwwwwwbbb"],
    ["abababab"],
    ["  "],
    ["112233"],
    ["!!??!!"],
    ["zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"],
    ["aabbaabb"],
    ["The quick brown fox"],
]


def solve(s):
    if not s:
        return ""
    out = []
    run_char = s[0]
    run_len = 1
    for ch in s[1:]:
        if ch == run_char:
            run_len += 1
        else:
            out.append(f"{run_char}{run_len}")
            run_char = ch
            run_len = 1
    out.append(f"{run_char}{run_len}")
    return "".join(out)
