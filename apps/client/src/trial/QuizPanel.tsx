import { useState } from "react"
import type { QuizChallenge, TrialVerdict } from "@mcc/shared"
import Markdown from "./Markdown"
import { Box } from "./CodePanel"

/** Quiz: pick one. One try; the verdict marks the right answer and explains it. */
export default function QuizPanel({ challenge: c, submit }: { challenge: QuizChallenge; submit: (body: unknown) => Promise<TrialVerdict> }) {
    const [chosen, setChosen] = useState<number | null>(null)
    const [verdict, setVerdict] = useState<TrialVerdict | null>(null)

    const pick = async (i: number) => {
        if (chosen !== null) return
        setChosen(i)
        const v = await submit({ kind: "quiz", choice: i })
        setVerdict(v)
        if (v.kind === "rejected") setChosen(null)
    }
    const answer = verdict?.kind === "quiz" ? verdict.answer : null

    return (
        <div className="mx-auto w-full max-w-2xl overflow-y-auto p-6">
            <div className="text-lg">
                <Markdown text={c.question} />
            </div>
            <div className="mt-4 flex flex-col gap-2">
                {c.options.map((o, i) => {
                    const tone =
                        answer === null ? (chosen === i ? "border-amber-400" : "border-white/15 hover:border-white/40")
                            : i === answer ? "border-emerald-400 bg-emerald-500/15"
                                : i === chosen ? "border-red-400 bg-red-500/15" : "border-white/10 opacity-60"
                    return (
                        <button key={i} onClick={() => pick(i)} disabled={chosen !== null} className={`flex gap-3 rounded border p-3 text-left ${tone}`}>
                            <span className="font-mono text-white/50">{"ABCDE"[i]}</span>
                            <Markdown text={o} />
                        </button>
                    )
                })}
            </div>
            {verdict?.kind === "rejected" && <Box tone="bad" title="Not graded">{verdict.reason}</Box>}
            {verdict?.kind === "quiz" && (
                <Box tone={verdict.passed ? "good" : "bad"} title={verdict.passed ? "Right" : "Not this time"}>
                    <Markdown text={verdict.explanation} />
                </Box>
            )}
        </div>
    )
}
