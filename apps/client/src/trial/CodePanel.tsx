import { useEffect, useRef, useState, type ReactNode } from "react"
import { compare, show, type CaseVerdict, type CodeChallenge, type Language, type TrialStart, type TrialVerdict, type TypedValue } from "@mcc/shared"
import { runCode, warmRunner, type RunResult } from "../runners/runner"
import CodeEditor from "./CodeEditor"
import Markdown from "./Markdown"
import { loadDraft, saveDraft } from "./drafts"

const LANGUAGE_NAME: Record<Language, string> = { python: "Python", javascript: "JavaScript" }

type Outcome =
    | { kind: "run"; language: Language; result: RunResult }
    | { kind: "submit"; language: Language; result: RunResult; verdict: TrialVerdict }

/** Code and Fix: statement, editor, Run (public cases, locally) and Submit (every case, graded by the server). */
export default function CodePanel({
    challenge: c,
    start,
    submit,
    onVerdict,
}: {
    challenge: CodeChallenge
    start: TrialStart | null
    submit: (body: unknown) => Promise<TrialVerdict>
    /** Every verdict from the server, e.g. for a henchman fight to count. */
    onVerdict?: (v: TrialVerdict) => void
}) {
    const [language, setLanguage] = useState<Language>(c.languages[0])
    // The code per language, seeded from the saved draft or the starter.
    const texts = useRef<Partial<Record<Language, string>>>({})
    const source = (l = language) => (texts.current[l] ??= loadDraft(c.slug, l) ?? c.starter[l])
    const [busy, setBusy] = useState<"run" | "submit" | null>(null)
    // Per language: "ready", or why it failed to start. Missing means still loading.
    const [runtimes, setRuntimes] = useState<Partial<Record<Language, string>>>({})
    const runtime = runtimes[language] ?? "loading"
    const [outcome, setOutcome] = useState<Outcome | null>(null)
    const [editorKey, setEditorKey] = useState(0)

    useEffect(() => {
        const set = (state: string) => setRuntimes((r) => ({ ...r, [language]: state }))
        warmRunner(language).then(
            () => set("ready"),
            (err: unknown) => set(err instanceof Error ? err.message : String(err)),
        )
    }, [language])

    const exec = (cases: TypedValue[][]) => runCode(language, { source: source(), fn: c.function[language], cases })

    const run = async () => {
        if (busy) return
        setBusy("run")
        const result = await exec(c.publicCases.map((x) => x.args))
        setOutcome({ kind: "run", language, result })
        setBusy(null)
    }

    const doSubmit = async () => {
        if (busy || !start) return
        setBusy("submit")
        const result = await exec([...c.publicCases.map((x) => x.args), ...start.hiddenArgs])
        const body =
            result.kind === "ran"
                ? { kind: "code", language, source: source(), outputs: result.results.map((r) => (r.ok ? { value: r.value } : { error: r.error })) }
                : { kind: "code", language, source: source(), failed: result.kind === "timeout" ? `stopped after ${result.seconds} s` : result.error }
        const verdict = await submit(body)
        setOutcome({ kind: "submit", language, result, verdict })
        setBusy(null)
        onVerdict?.(verdict)
    }

    const reset = () => {
        saveDraft(c.slug, language, null)
        delete texts.current[language]
        setEditorKey((k) => k + 1)
    }

    const loading = runtime === "loading"
    const broken = runtime !== "loading" && runtime !== "ready"

    return (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,2fr)_3fr] gap-4 p-4">
            <section className="min-h-0 overflow-y-auto pr-2">
                <Markdown text={c.statement} />
                <p className="mt-3 text-sm text-white/60">
                    Write <code className="text-amber-200">{c.function[language]}</code> in {LANGUAGE_NAME[language]}.{" "}
                    {c.publicCases.length} example case{c.publicCases.length === 1 ? "" : "s"}, {c.hiddenCount} hidden.
                </p>
                {outcome && <OutcomeView challenge={c} outcome={outcome} />}
            </section>

            <section className="flex min-h-0 flex-col gap-2">
                <div className="flex items-center gap-2">
                    {c.languages.map((l) => (
                        <button
                            key={l}
                            onClick={() => setLanguage(l)}
                            disabled={busy !== null}
                            className={`rounded px-3 py-1 text-sm ${l === language ? "bg-amber-400 text-black" : "bg-white/10 hover:bg-white/20"}`}
                        >
                            {LANGUAGE_NAME[l]}
                        </button>
                    ))}
                    <span className="ml-2 text-xs text-white/50">
                        {loading && (language === "python" ? "Loading Python…" : "Starting…")}
                        {broken && <span className="text-red-300">{runtime}</span>}
                    </span>
                    <button onClick={reset} disabled={busy !== null} className="ml-auto rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
                        Reset code
                    </button>
                </div>
                <div className="min-h-0 flex-1">
                    <CodeEditor
                        key={`${c.slug}:${language}:${editorKey}`}
                        initial={source()}
                        language={language}
                        onChange={(text) => {
                            texts.current[language] = text
                            saveDraft(c.slug, language, text)
                        }}
                        onRun={run}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={run} disabled={busy !== null || broken} className="rounded bg-white/15 px-4 py-2 text-sm hover:bg-white/25 disabled:opacity-50">
                        {busy === "run" ? "Running…" : "Run examples"}
                    </button>
                    <button onClick={doSubmit} disabled={busy !== null || broken || !start} className="rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50">
                        {busy === "submit" ? "Grading…" : "Submit"}
                    </button>
                    <span className="text-xs text-white/40">Ctrl+Enter runs the examples</span>
                </div>
            </section>
        </div>
    )
}

function OutcomeView({ challenge: c, outcome }: { challenge: CodeChallenge; outcome: Outcome }) {
    const { result, language } = outcome
    if (result.kind === "timeout") {
        return (
            <Box tone="bad" title={`Stopped after ${result.seconds} s`}>
                Your code was still running, so it was stopped. Is there a loop that never ends? The runner has restarted; fix it and try again.
            </Box>
        )
    }
    if (result.kind === "error") return <Box tone="bad" title="Your code didn't run">
        <pre className="whitespace-pre-wrap text-sm">{result.error}</pre>
    </Box>

    const verdict = outcome.kind === "submit" ? outcome.verdict : null
    if (verdict?.kind === "rejected") return <Box tone="bad" title="Not graded">{verdict.reason}</Box>
    const cases = verdict?.kind === "code" ? verdict.cases : null
    const passed = cases ? cases.filter((v) => v.ok).length : null

    return (
        <div className="mt-4 space-y-2">
            {cases && (
                <Box tone={verdict?.kind === "code" && verdict.passed ? "good" : "bad"} title={verdict?.kind === "code" && verdict.passed ? "Accepted: every case passes" : `${passed} of ${cases.length} cases pass`}>
                    <HiddenStrip cases={cases.filter((v) => v.hidden)} />
                </Box>
            )}
            {c.publicCases.map((pc, i) => {
                const r = result.results[i]
                const v = r.ok ? compare(pc.expected, r.value, { language, unordered: c.unordered }) : null
                const ok = v?.ok ?? false
                return (
                    <div key={i} className={`rounded border p-3 text-sm ${ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/40 bg-red-500/10"}`}>
                        <div className="font-mono">
                            {ok ? "✓" : "✗"} {c.function[language]}({pc.args.map((a) => show(a, language)).join(", ")})
                        </div>
                        {!ok && (
                            <div className="mt-1 space-y-0.5 font-mono text-xs">
                                <div>expected <span className="text-emerald-300">{show(pc.expected, language)}</span></div>
                                {r.ok ? <div>got <span className="text-red-300">{show(r.value, language)}</span></div> : <div className="text-red-300">{r.error}</div>}
                                {v && !v.ok && <div className="text-white/60">at {v.path}: {v.reason}</div>}
                            </div>
                        )}
                        {r.stdout && <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-xs text-white/70">{r.stdout}</pre>}
                    </div>
                )
            })}
        </div>
    )
}

function HiddenStrip({ cases }: { cases: CaseVerdict[] }) {
    if (!cases.length) return null
    const firstFail = cases.find((v) => !v.ok)
    return (
        <div>
            <div className="flex flex-wrap gap-1" aria-label="hidden cases">
                {cases.map((v, i) => (
                    <span key={i} className={`h-3 w-3 rounded-sm ${v.ok ? "bg-emerald-400" : "bg-red-400"}`} title={`hidden case ${i + 1}`} />
                ))}
            </div>
            {firstFail?.reason && <div className="mt-1 font-mono text-xs text-white/70">first failing hidden case: {firstFail.reason}</div>}
        </div>
    )
}

export function Box({ tone, title, children }: { tone: "good" | "bad" | "info"; title: string; children?: ReactNode }) {
    const colors = { good: "border-emerald-500/50 bg-emerald-500/10", bad: "border-red-500/50 bg-red-500/10", info: "border-white/20 bg-white/5" }[tone]
    return (
        <div className={`mt-4 rounded border p-3 ${colors}`}>
            <div className="font-semibold">{title}</div>
            {children && <div className="mt-1 text-sm">{children}</div>}
        </div>
    )
}
