#!/usr/bin/env python3
"""Build the challenge bundles from content/challenges/.

    npm run content          (or: python3 content/build/build.py)

Every expected output is computed, never hand-typed:

  code/<slug>/reference.py     the source of truth (contract in content/README.md).
                               Its solve() produces every expected output.
  code/<slug>/reference.js     optional. If present it must agree with Python on
                               every case (JS number rule, ADR-0008).
  fix/<slug>/reference.py      like code, plus BUGGY_PY / BUGGY_JS: the code the player
                               repairs. The build checks the buggy code really fails.
  predict/<slug>.yaml          snippets per language; the build RUNS them to capture
                               the expected output.
  quiz/<bank>.yaml             questions with an answer index and an explanation.

Writes:
  packages/shared/src/content/challenges.gen.ts      public: shipped to the client
  apps/server/content/challenges.private.json        private: hidden expected outputs,
                                                     quiz answers, predict outputs
"""

import importlib.util
import json
import math
import pathlib
import re
import subprocess
import sys

import yaml

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent.parent
SRC = REPO / "content" / "challenges"
PUBLIC_OUT = REPO / "packages" / "shared" / "src" / "content" / "challenges.gen.ts"
PRIVATE_OUT = REPO / "apps" / "server" / "content" / "challenges.private.json"
RUN_JS = HERE / "run_js.mjs"
LANGS = ["python", "javascript"]
TOL = 1e-9

REQUIRED = ["SLUG", "TITLE", "DIFFICULTY", "FUNCTION", "SIGNATURE", "STATEMENT", "PUBLIC_CASES", "HIDDEN_CASES", "solve"]
errors = []


def fail(msg):
    errors.append(msg)


# ---- typed JSON: the browser's own harness, so 1 and 1.0 stay apart (comparator.ts) ----

HARNESS = REPO / "packages" / "shared" / "src" / "challenge" / "harness.py"
_spec = importlib.util.spec_from_file_location("harness", HARNESS)
harness = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(harness)
tag, untag = harness.tag, harness.untag


def num(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, dict) and list(v) == ["$float"]:
        f = v["$float"]
        return {"inf": math.inf, "-inf": -math.inf, "nan": math.nan}.get(f, f) if isinstance(f, str) else float(f)
    return None


def agree(e, a, lang, unordered=False):
    """The comparator's rules, for build-time checks (the runtime one is comparator.ts)."""
    if unordered and isinstance(e, list) and isinstance(a, list):
        canon = lambda x: json.dumps(x, sort_keys=True)
        return sorted(map(canon, e)) == sorted(map(canon, a))
    ne, na = num(e), num(a)
    if ne is not None or na is not None:
        if ne is None or na is None:
            return False
        if lang == "python" and isinstance(e, dict) != isinstance(a, dict):
            return False
        if math.isnan(ne) or math.isnan(na):
            return math.isnan(ne) and math.isnan(na)
        if math.isinf(ne) or math.isinf(na):
            return ne == na
        d = abs(ne - na)
        return d <= TOL or d <= TOL * max(abs(ne), abs(na))
    if isinstance(e, list) and isinstance(a, list):
        return len(e) == len(a) and all(agree(x, y, lang) for x, y in zip(e, a))
    if isinstance(e, dict) and isinstance(a, dict):
        return set(e) == set(a) and all(agree(e[k], a[k], lang) for k in e)
    return type(e) is type(a) and e == a


# ---- loading and running ----------------------------------------------------

def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run_python(fn, cases, where):
    """cases are typed JSON args; each case gets fresh copies, so one can't mutate the next."""
    out = []
    for i, args in enumerate(cases):
        try:
            out.append(tag(fn(*untag(json.loads(json.dumps(args))))))  # tag() rejects tuples and sets
        except Exception as exc:  # noqa: BLE001 - report and keep building
            out.append({"error": f"{type(exc).__name__}: {exc}"})
            if where:
                fail(f"{where}: case {i} raised {type(exc).__name__}: {exc}")
    return out


def run_js(source, fn, cases):
    proc = subprocess.run(["node", str(RUN_JS)], input=json.dumps({"source": source, "fn": fn, "cases": cases}),
                          capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "node failed")
    return json.loads(proc.stdout)


def camel(name):
    head, *rest = name.split("_")
    return head + "".join(w[:1].upper() + w[1:] for w in rest)


def params_of(signature):
    m = re.match(r"\s*def\s+\w+\((.*)\)\s*:", signature)
    if not m:
        raise ValueError(f"can't read parameters from {signature!r}")
    return [p.strip() for p in m.group(1).split(",") if p.strip()]


def camel_params(params):
    return ", ".join(camel(p) for p in params)


# ---- formats ------------------------------------------------------------------

def build_code(path, fmt):
    slug = path.parent.name
    mod = load_module(path, f"{fmt}_{slug.replace('-', '_')}")
    for field in REQUIRED + (["BUGGY_PY", "BUGGY_JS"] if fmt == "fix" else []):
        if not hasattr(mod, field):
            fail(f"{fmt}/{slug}: missing {field}")
            return None, None
    if mod.SLUG != slug:
        fail(f"{fmt}/{slug}: SLUG is {mod.SLUG!r}, but the folder is {slug!r}")
    languages = getattr(mod, "LANGUAGES", LANGS)
    unordered = bool(getattr(mod, "UNORDERED", False))
    params = params_of(mod.SIGNATURE)
    fn = {"python": mod.FUNCTION, "javascript": camel(mod.FUNCTION)}

    try:
        public_args = [tag(c) for c in mod.PUBLIC_CASES]
        hidden_args = [tag(c) for c in mod.HIDDEN_CASES]
    except TypeError as exc:
        fail(f"{fmt}/{slug}: case args {exc}")
        return None, None
    public = [{"args": c, "expected": e} for c, e in zip(public_args, run_python(mod.solve, public_args, f"{fmt}/{slug} public"))]
    hidden = [{"args": c, "expected": e} for c, e in zip(hidden_args, run_python(mod.solve, hidden_args, f"{fmt}/{slug} hidden"))]
    cases = public + hidden

    # The optional JS reference must agree on every case.
    js_ref = path.parent / "reference.js"
    if js_ref.exists() and "javascript" in languages:
        got = run_js(js_ref.read_text(), fn["javascript"], [c["args"] for c in cases])
        for i, (c, g) in enumerate(zip(cases, got)):
            if not agree(c["expected"], g, "javascript", unordered):
                fail(f"{fmt}/{slug}: reference.js disagrees on case {i}: expected {c['expected']!r}, got {g!r}")

    if fmt == "fix":
        starter = {"python": mod.BUGGY_PY.strip("\n") + "\n", "javascript": mod.BUGGY_JS.strip("\n") + "\n"}
        # A Fix challenge whose "buggy" code already passes would be free.
        ran = json.loads(harness.run(starter["python"], fn["python"], json.dumps([c["args"] for c in cases])))
        if "error" in ran:
            fail(f"fix/{slug}: BUGGY_PY doesn't load: {ran['error']}")
            return None, None
        got = [r["value"] if r["ok"] else {"error": r["error"]} for r in ran["results"]]
        if all(agree(c["expected"], g, "python", unordered) for c, g in zip(cases, got)):
            fail(f"fix/{slug}: BUGGY_PY passes every case; it has to fail at least one")
        got = run_js(starter["javascript"], fn["javascript"], [c["args"] for c in cases])
        if all(agree(c["expected"], g, "javascript", unordered) for c, g in zip(cases, got)):
            fail(f"fix/{slug}: BUGGY_JS passes every case; it has to fail at least one")
    else:
        starter = {
            "python": f"{mod.SIGNATURE}\n    # your code here\n    pass\n",
            "javascript": f"function {fn['javascript']}({camel_params(params)}) {{\n  // your code here\n}}\n",
        }

    public_entry = {
        "slug": slug, "format": fmt, "title": mod.TITLE, "difficulty": mod.DIFFICULTY,
        "topics": list(getattr(mod, "TOPICS", [])), "statement": mod.STATEMENT.strip(),
        "languages": languages, "function": fn, "starter": starter, "unordered": unordered,
        "publicCases": public, "hiddenCount": len(hidden),
    }
    return public_entry, {"hiddenCases": hidden}


def run_snippet(lang, code, where):
    cmd = ["python3", "-I", "-c", code] if lang == "python" else ["node", "--input-type=module", "-e", code]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
    if proc.returncode != 0:
        fail(f"{where} ({lang}) failed: {proc.stderr.strip()}")
        return ""
    lines = [l.rstrip() for l in proc.stdout.replace("\r\n", "\n").split("\n")]
    return "\n".join(lines).rstrip("\n")


def build_predict(path):
    slug = path.stem
    d = yaml.safe_load(path.read_text())
    snippet = {lang: d[lang].strip("\n") + "\n" for lang in LANGS if d.get(lang)}
    if not snippet:
        fail(f"predict/{slug}: no snippets")
    output = {lang: run_snippet(lang, code, f"predict/{slug}") for lang, code in snippet.items()}
    public = {"slug": slug, "format": "predict", "title": d["title"], "difficulty": d["difficulty"],
              "topics": d.get("topics", []), "prompt": d.get("prompt", "What does this print? Type the exact output."),
              "snippet": snippet}
    return public, {"output": output}


def build_quiz(path):
    out = []
    bank = path.stem
    for q in yaml.safe_load(path.read_text()):
        slug = f"{bank}-{q['id']}"
        opts = [str(o) for o in q["options"]]  # YAML reads `3` as a number; options are text
        if not (2 <= len(opts) <= 5) or not (0 <= q["answer"] < len(opts)):
            fail(f"quiz/{slug}: needs 2-5 options and a valid answer index")
        if len(set(opts)) != len(opts):
            fail(f"quiz/{slug}: duplicate options")
        public = {"slug": slug, "format": "quiz", "title": q.get("title", q["question"][:60]), "difficulty": q["difficulty"],
                  "topics": q.get("topics", []), "question": q["question"].strip(), "options": opts}
        out.append((public, {"answer": q["answer"], "explanation": q["explanation"].strip()}))
    return out


def main():
    public, private = [], {}

    def add(pub, priv):
        if pub is None:
            return
        if pub["slug"] in private:
            fail(f"duplicate slug {pub['slug']}")
        public.append(pub)
        private[pub["slug"]] = priv

    for fmt in ("code", "fix"):
        for path in sorted((SRC / fmt).glob("*/reference.py")):
            add(*build_code(path, fmt))
    for path in sorted((SRC / "predict").glob("*.yaml")):
        add(*build_predict(path))
    for path in sorted((SRC / "quiz").glob("*.yaml")):
        for pub, priv in build_quiz(path):
            add(pub, priv)

    if errors:
        print("content build FAILED:\n  " + "\n  ".join(errors), file=sys.stderr)
        sys.exit(1)

    PUBLIC_OUT.parent.mkdir(parents=True, exist_ok=True)
    PRIVATE_OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUT.write_text(
        "// Generated by content/build/build.py from content/challenges/. Do not edit: run `npm run content`.\n"
        "import type { PublicChallenge } from '../challenge/types.ts'\n\n"
        f"export const CHALLENGES: readonly PublicChallenge[] = {json.dumps(public, indent=2, ensure_ascii=False)}\n"
    )
    PRIVATE_OUT.write_text(json.dumps(private, indent=2, ensure_ascii=False) + "\n")
    counts = {f: sum(1 for p in public if p["format"] == f) for f in ("code", "fix", "predict", "quiz")}
    print(f"content: {len(public)} challenges {counts}")


if __name__ == "__main__":
    main()
