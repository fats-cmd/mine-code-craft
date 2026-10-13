# 0002 — Code runs in the browser. The server grades it.

**Status:** accepted · 2026-10-13 · carries over decision 2 of the archived Voxel Arena plan

## Context
Players write Python and JavaScript. Running untrusted code on our servers (e.g. Judge0) is the hardest to cheat, but it costs money per run and needs real sandboxing work. The game aims at a large public audience.

## Decision
Code runs in Web Workers in the player's own browser (Pyodide for Python, a plain worker for JS). The server sends hidden case **arguments** but keeps the **expected outputs**. The client submits its actual outputs, and the server's comparator decides. Quiz answer keys and Predict outputs never reach the client either.

## Consequences
- Execution compute is free and scales with players.
- Forging a win needs the real answers. Outside help (an AI, a friend) can't be prevented, so Rank must never carry money or hiring weight.
- The grading interface is `outputs[] → verdict`, so a server-side runner could be added later for high-stakes modes without changing rooms.
