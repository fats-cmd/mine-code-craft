import { useState } from "react"
import { LANGUAGES, type Language, type PredictChallenge, type TrialVerdict } from "@mcc/shared"
import CodeEditor from "./CodeEditor"
import Markdown from "./Markdown"
import { Box } from "./CodePanel"

/** Predict: read the code, type exactly what it prints. One try; the verdict shows the real output. */
export default function PredictPanel({ challenge: c, submit, onVerdict }: { challenge: PredictChallenge; submit: (body: unknown) => Promise<TrialVerdict>; onVerdict?: (v: TrialVerdict) => void }) {
    const languages = LANGUAGES.filter((l) => c.snippet[l])
    const [language, setLanguage] = useState<Language>(languages[0])
    const [answer, setAnswer] = useState("")
    const [busy, setBusy] = useState(false)
    const [verdict, setVerdict] = useState<TrialVerdict | null>(null)
    const locked = verdict !== null && verdict.kind !== "rejected"

    const send = async () => {
        setBusy(true)
        const v = await submit({ kind: "predict", language, answer })
        setVerdict(v)
        setBusy(false)
        onVerdict?.(v)
    }

    return (
        <div className="mx-auto grid w-full max-w-5xl min-h-0 flex-1 grid-cols-2 gap-4 overflow-y-auto p-4">
            <section className="flex min-h-0 flex-col gap-2">
                <Markdown text={c.prompt} />
                <div className="flex gap-2">
                    {languages.map((l) => (
                        <button key={l} onClick={() => setLanguage(l)} disabled={locked} className={`rounded px-3 py-1 text-sm ${l === language ? "bg-amber-400 text-black" : "bg-white/10 hover:bg-white/20"}`}>
                            {l === "python" ? "Python" : "JavaScript"}
                        </button>
                    ))}
                </div>
                <div className="h-80">
                    <CodeEditor key={language} initial={c.snippet[language]!} language={language} readOnly />
                </div>
            </section>
            <section className="flex flex-col gap-2">
                <label className="text-sm text-white/70" htmlFor="predict-answer">Its exact output</label>
                <textarea
                    id="predict-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={locked}
                    spellCheck={false}
                    rows={8}
                    className="rounded border border-white/15 bg-black/40 p-3 font-mono text-sm outline-none focus:border-amber-400"
                />
                <button onClick={send} disabled={busy || locked || answer.trim() === ""} className="self-start rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50">
                    {busy ? "Checking…" : "Submit"}
                </button>
                {verdict?.kind === "rejected" && <Box tone="bad" title="Not graded">{verdict.reason}</Box>}
                {verdict?.kind === "predict" && (
                    <Box tone={verdict.passed ? "good" : "bad"} title={verdict.passed ? "Exactly right" : "Not quite"}>
                        {!verdict.passed && (
                            <>
                                It prints:
                                <pre className="mt-1 rounded bg-black/40 p-2 font-mono text-xs">{verdict.expected}</pre>
                            </>
                        )}
                    </Box>
                )}
            </section>
        </div>
    )
}
