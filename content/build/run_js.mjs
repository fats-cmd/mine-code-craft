// Runs a JS function on every case for the content build: reads
// { source, fn, cases } as JSON on stdin, prints the outputs as typed JSON.
// The same harness as the browser's JS worker (apps/client/src/runners).

const input = JSON.parse(await new Promise((resolve) => {
    let s = ""
    process.stdin.on("data", (d) => (s += d))
    process.stdin.on("end", () => resolve(s))
}))

const tag = (v) => {
    if (v === undefined) return null
    if (typeof v === "number" && !Number.isFinite(v)) return { $float: Number.isNaN(v) ? "nan" : v > 0 ? "inf" : "-inf" }
    if (Array.isArray(v)) return v.map(tag)
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tag(x)]))
    return v
}

const wrapped = `${input.source}\nexport const __fn = typeof ${input.fn} === "function" ? ${input.fn} : undefined;\n`
const mod = await import("data:text/javascript;base64," + Buffer.from(wrapped).toString("base64"))
if (!mod.__fn) throw new Error(`no function named ${input.fn}`)
const out = input.cases.map((args) => {
    try {
        return tag(JSON.parse(JSON.stringify(mod.__fn(...structuredClone(args)) ?? null)))
    } catch (err) {
        return { error: String(err) }
    }
})
process.stdout.write(JSON.stringify(out))
