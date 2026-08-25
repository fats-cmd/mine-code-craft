#!/usr/bin/env python3
"""Generate the public and private problem JSON from the reference solutions.

Each `<slug>.reference.py` in this directory is the single source of truth for one
problem: metadata, statement, case inputs, and the reference solution. Expected
outputs are computed by running that solution — never hand-typed — so a problem
cannot drift out of sync with its own answers.

Emits, for each problem:

  shared/problems/<slug>.json           public: statement, signature, sample cases
                                        WITH expected outputs. Bundled to the client.

  server/problems/<slug>.private.json   hidden cases WITH expected outputs.
                                        Server-side only, never in the client bundle.

On the wire during a duel the server sends the hidden `args` but withholds the
hidden `expected`; the client runs them and returns actual outputs for grading.
That split is the whole reason forging a win requires actually solving the problem.

Usage:  python3 server/problems/build_problems.py
"""

import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent.parent
PUBLIC_OUT = REPO / "shared" / "problems"
PRIVATE_OUT = HERE

REQUIRED = [
    "SLUG", "TITLE", "DIFFICULTY", "FUNCTION", "SIGNATURE",
    "STATEMENT", "PUBLIC_CASES", "HIDDEN_CASES", "solve",
]


def load(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for field in REQUIRED:
        if not hasattr(mod, field):
            sys.exit(f"{path.name}: missing {field}")
    return mod


def run_cases(mod, cases, kind):
    out = []
    for i, args in enumerate(cases):
        try:
            expected = mod.solve(*args)
        except Exception as exc:
            sys.exit(f"{mod.SLUG}: {kind} case {i} raised {type(exc).__name__}: {exc}")
        # Round-trip through JSON so the stored value is exactly what a client can
        # produce. Catches tuples, sets, and other types that don't survive the wire.
        try:
            expected = json.loads(json.dumps(expected))
        except (TypeError, ValueError) as exc:
            sys.exit(f"{mod.SLUG}: {kind} case {i} returned non-JSON value: {exc}")
        out.append({"args": args, "expected": expected})
    return out


def starter_from(signature):
    return f"{signature}\n    # your code here\n    pass\n"


def main():
    PUBLIC_OUT.mkdir(parents=True, exist_ok=True)
    refs = sorted(HERE.glob("*.reference.py"))
    if not refs:
        sys.exit("no *.reference.py files found")

    index = []
    for path in refs:
        mod = load(path)
        public = run_cases(mod, mod.PUBLIC_CASES, "public")
        hidden = run_cases(mod, mod.HIDDEN_CASES, "hidden")
        unordered = bool(getattr(mod, "UNORDERED", False))

        (PUBLIC_OUT / f"{mod.SLUG}.json").write_text(json.dumps({
            "slug": mod.SLUG,
            "title": mod.TITLE,
            "difficulty": mod.DIFFICULTY,
            "function": mod.FUNCTION,
            "signature": mod.SIGNATURE,
            "statement": mod.STATEMENT.strip(),
            "starter": starter_from(mod.SIGNATURE),
            "unordered": unordered,
            "sampleCases": public,
            "hiddenCaseCount": len(hidden),
        }, indent=2) + "\n")

        (PRIVATE_OUT / f"{mod.SLUG}.private.json").write_text(json.dumps({
            "slug": mod.SLUG,
            "unordered": unordered,
            "hiddenCases": hidden,
        }, indent=2) + "\n")

        index.append({
            "slug": mod.SLUG,
            "title": mod.TITLE,
            "difficulty": mod.DIFFICULTY,
            "unordered": unordered,
        })
        print(f"  {mod.SLUG:<26} {len(public)} public + {len(hidden)} hidden")

    index.sort(key=lambda p: (p["difficulty"], p["slug"]))
    (PUBLIC_OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n")
    print(f"\n{len(index)} problems -> {PUBLIC_OUT.relative_to(REPO)}/ and {PRIVATE_OUT.relative_to(REPO)}/")


if __name__ == "__main__":
    main()
