SLUG = "group-anagrams"
TITLE = "Group Anagrams"
DIFFICULTY = 4
FUNCTION = "group_anagrams"
SIGNATURE = "def group_anagrams(words):"
UNORDERED = True

STATEMENT = """
Group the words that are anagrams of each other. Return a list of groups.

- Two words are anagrams if they use exactly the same letters the same number of times.
- **Each group must be sorted alphabetically**, so a group is always written the same way.
- The **order of the groups does not matter** — return them however they fall out.
- Comparison is case-sensitive: `"Ab"` and `"ba"` are not anagrams.
- Duplicate words stay duplicated inside their group.

```
group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
  ->  [["ate", "eat", "tea"], ["nat", "tan"], ["bat"]]      (in any group order)

group_anagrams([])       ->  []
group_anagrams(["a"])    ->  [["a"]]
```
"""

PUBLIC_CASES = [
    [["eat", "tea", "tan", "ate", "nat", "bat"]],
    [[]],
    [["a"]],
]

HIDDEN_CASES = [
    [[""]],
    [["", ""]],
    [["ab", "ba"]],
    [["Ab", "ba"]],
    [["abc", "cba", "bac", "xyz"]],
    [["dog", "god", "cat", "act", "tac"]],
    [["listen", "silent", "enlist", "google"]],
    [["aa", "aa", "aa"]],
    [["one", "two", "three", "four"]],
    [["aab", "aba", "baa", "abb", "bab", "bba"]],
    [["x", "y", "z", "x", "y", "z"]],
    [["stressed", "desserts", "dessert"]],
]


def solve(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word))
        groups.setdefault(key, []).append(word)
    return [sorted(group) for group in groups.values()]
