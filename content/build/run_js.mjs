// Runs a JS function on every case for the content build: reads
// { source, fn, cases } as JSON on stdin, prints the outputs as typed JSON
// ({error} for a case that throws). It uses the browser's own harness
// (packages/shared/src/challenge/jsHarness.ts), so both agree by construction.

import { runCases, wrapSource } from "../../packages/shared/src/challenge/jsHarness.ts"

const input = JSON.parse(await new Promise((resolve) => {
    let s = ""
    process.stdin.on("data", (d) => (s += d))
    process.stdin.on("end", () => resolve(s))
}))

const mod = await import("data:text/javascript;base64," + Buffer.from(wrapSource(input.source, input.fn)).toString("base64"))
if (!mod.__fn) throw new Error(`no function named ${input.fn}`)
const out = runCases(mod.__fn, input.cases).map((r) => (r.ok ? r.value : { error: r.error }))
process.stdout.write(JSON.stringify(out))
