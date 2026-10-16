"""The Python harness: runs a player's function on each case and returns typed JSON.

Shared by the browser (the Pyodide worker in apps/client/src/runners) and the
content build (content/build/build.py), so both produce exactly the same values.
Floats are tagged {"$float": x} so 1 and 1.0 stay apart (comparator.ts).
"""

import contextlib
import io
import json
import math
import traceback

STDOUT_LIMIT = 4000
FILENAME = "<solution>"


def tag(v):
    if v is None or isinstance(v, (bool, str, int)):
        return v
    if isinstance(v, float):
        if math.isnan(v):
            return {"$float": "nan"}
        if math.isinf(v):
            return {"$float": "inf" if v > 0 else "-inf"}
        return {"$float": v}
    if isinstance(v, list):
        return [tag(x) for x in v]
    if isinstance(v, dict):
        if not all(isinstance(k, str) for k in v):
            raise TypeError("dict keys must be strings")
        return {k: tag(x) for k, x in v.items()}
    raise TypeError(f"returned a {type(v).__name__}; use a list or dict instead")


def untag(v):
    if isinstance(v, list):
        return [untag(x) for x in v]
    if isinstance(v, dict):
        if list(v) == ["$float"]:
            f = v["$float"]
            return float(f) if not isinstance(f, str) else {"inf": math.inf, "-inf": -math.inf, "nan": math.nan}[f]
        return {k: untag(x) for k, x in v.items()}
    return v


def describe(exc):
    """One line naming the error and, when it's in the player's code, the line."""
    line = None
    for frame in traceback.extract_tb(exc.__traceback__):
        if frame.filename == FILENAME:
            line = frame.lineno
    if isinstance(exc, SyntaxError) and exc.filename == FILENAME:
        line = exc.lineno
    msg = "".join(traceback.format_exception_only(type(exc), exc)).strip().splitlines()[-1]
    return f"{msg} (line {line})" if line else msg


def load(source, fn):
    """Compile the player's code and find the function. Raises with a readable message."""
    ns = {"__name__": "__solution__"}
    try:
        exec(compile(source, FILENAME, "exec"), ns)  # noqa: S102 - the player's own code, in their own browser
    except BaseException as exc:  # noqa: BLE001
        raise RuntimeError(describe(exc)) from None
    f = ns.get(fn)
    if not callable(f):
        raise RuntimeError(f"no function named {fn}")
    return f


def run(source, fn, cases_json):
    """Run every case. Returns JSON: {"error": msg} or {"results": [{ok, value|error, stdout}]}."""
    try:
        f = load(source, fn)
    except RuntimeError as exc:
        return json.dumps({"error": str(exc)})
    results = []
    for args in json.loads(cases_json):
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                value = f(*untag(args))  # fresh args per case: json.loads made them
            results.append({"ok": True, "value": tag(value)})
        except BaseException as exc:  # noqa: BLE001 - SystemExit and friends are the player's bug too
            results.append({"ok": False, "error": describe(exc)})
        out = buf.getvalue()
        results[-1]["stdout"] = out if len(out) <= STDOUT_LIMIT else out[:STDOUT_LIMIT] + "\n…(cut)"
    return json.dumps({"results": results})
