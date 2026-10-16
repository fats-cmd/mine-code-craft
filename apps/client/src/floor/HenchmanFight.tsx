import { useEffect, useRef, useState } from "react"
import {
    CHALLENGES,
    MAX_INTEGRITY,
    TESTING_FLOOR_HENCHMEN,
    henchmanChallenge,
    type TaskFormat,
    type TrialVerdict,
} from "@mcc/shared"
import ChallengePanel from "../trial/ChallengePanel"
import { DEV_TOOLS } from "../dev/devTools"
import { useFloor } from "./FloorContext"

// A henchman fight: its Task is a real Challenge, graded by the server in a
// TrialRoom (M3). A pass lands a Move, a fail takes a Counter and costs 1
// Integrity (GAME_DESIGN, Moves and Counters). A new question comes from the
// henchman's pool after every Quiz or Predict answer; a Fix stays put so you
// can keep editing, until a knockout swaps in a different bug.

/** The Move a pass lands, by Format. Presentation only: it never changes grading. */
const MOVE: Record<TaskFormat, string> = {
    quiz: "Jab!",
    predict: "Kick!",
    fix: "Push!",
    code: "Combo finisher!",
    movement: "Vault!",
}

const FORMAT_NAME: Record<string, string> = { quiz: "Quiz", predict: "Predict", fix: "Fix", code: "Code" }

interface Hit {
    kind: "move" | "counter"
    text: string
    key: number
}

export default function HenchmanFight({ id }: { id: string }) {
    const { progress, dispatch, closeEncounter } = useFloor()
    const h = TESTING_FLOOR_HENCHMEN.find((x) => x.id === id)!
    const [question, setQuestion] = useState(0)
    const [wins, setWins] = useState(0)
    const [answered, setAnswered] = useState(false)
    const [hit, setHit] = useState<Hit | null>(null)
    const [note, setNote] = useState<string | null>(null)
    const hits = useRef(0)
    const beaten = wins >= h.wins
    const challenge = CHALLENGES.find((c) => c.slug === henchmanChallenge(h, question))!
    const oneTry = challenge.format === "quiz" || challenge.format === "predict"

    // Esc leaves (the fight resets; nothing is lost).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeEncounter()
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [closeEncounter])

    // The Move or Counter flash fades on its own.
    useEffect(() => {
        if (!hit) return
        const t = setTimeout(() => setHit((cur) => (cur?.key === hit.key ? null : cur)), 1100)
        return () => clearTimeout(t)
    }, [hit])

    const next = () => {
        setQuestion((q) => q + 1)
        setAnswered(false)
    }

    const onVerdict = (v: TrialVerdict) => {
        if (v.kind === "rejected") return
        if (v.passed) {
            const total = wins + 1
            setWins(total)
            setHit({ kind: "move", text: MOVE[h.format], key: ++hits.current })
            if (total >= h.wins) {
                dispatch({ type: "defeat", id: h.id })
                setNote(null)
            } else {
                setNote(`${h.name} staggers. ${h.wins - total} to go.`)
            }
            setAnswered(true)
            return
        }
        const knockedOut = progress.integrity <= 1
        dispatch({ type: "hit" })
        setHit({ kind: "counter", text: `${h.name} counters!`, key: ++hits.current })
        if (knockedOut) {
            setNote("Integrity depleted. You regroup at full strength; nothing is lost. Here's a fresh one.")
            if (!oneTry) next()
        } else {
            setNote(oneTry ? "That cost 1 Integrity. Try the next one." : "That cost 1 Integrity. Fix it and submit again.")
        }
        if (oneTry) setAnswered(true)
    }

    const big = !oneTry
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div
                role="dialog"
                aria-label={h.name}
                className={`relative flex w-full flex-col overflow-hidden rounded-xl bg-slate-900 text-slate-100 ring-1 ring-amber-300/40 ${
                    big ? "h-full max-w-7xl" : "max-h-full max-w-4xl"
                } ${hit?.kind === "counter" ? "animate-[counter_0.45s_ease-out]" : ""}`}
            >
                <header className={`flex items-center gap-4 border-b border-white/10 px-5 py-3 ${hit?.kind === "move" ? "animate-[move_0.4s_ease-out]" : ""}`}>
                    <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300/80">Henchman · {FORMAT_NAME[challenge.format]}{oneTry ? "" : ` · ${challenge.title}`}</div>
                        <h2 className="text-xl font-bold">{h.name}</h2>
                        <p className="truncate text-xs italic text-slate-400">{h.flavor}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-5">
                        {h.wins > 1 && (
                            <div className="text-center" aria-label={`${wins} of ${h.wins} hits landed`}>
                                <div className="flex gap-1">
                                    {Array.from({ length: h.wins }, (_, i) => (
                                        <span key={i} className={`h-3 w-3 rotate-45 ${i < wins ? "bg-amber-300" : "bg-white/15"}`} />
                                    ))}
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-slate-400">hits</div>
                            </div>
                        )}
                        <div className="text-center" aria-label={`Integrity ${progress.integrity} of ${MAX_INTEGRITY}`}>
                            <div className="flex gap-1">
                                {Array.from({ length: MAX_INTEGRITY }, (_, i) => (
                                    <span key={i} className={`h-2 w-5 rounded-sm ${i < progress.integrity ? "bg-teal-300" : "bg-white/15"}`} />
                                ))}
                            </div>
                            <div className="mt-1 font-mono text-[10px] text-slate-400">integrity</div>
                        </div>
                        {DEV_TOOLS && !beaten && (
                            <button
                                onClick={() => {
                                    dispatch({ type: "defeat", id: h.id })
                                    closeEncounter()
                                }}
                                className="rounded px-2 py-1 font-mono text-xs text-slate-400 ring-1 ring-slate-700 hover:bg-slate-800"
                                title="?debug only: skip the Task"
                            >
                                dev pass
                            </button>
                        )}
                        <button onClick={closeEncounter} className="rounded-md px-3 py-1.5 text-sm ring-1 ring-slate-700 hover:bg-slate-800">
                            Leave <span className="text-slate-500">(Esc)</span>
                        </button>
                    </div>
                </header>

                {beaten ? (
                    <div className="flex flex-col items-center gap-3 p-10 text-center">
                        <div className="text-3xl font-bold text-amber-300">{h.name} is beaten</div>
                        <p className="text-slate-300">The way on is open.</p>
                        <button autoFocus onClick={closeEncounter} className="mt-2 rounded-md bg-teal-400 px-5 py-2 font-bold text-slate-950 hover:bg-teal-300">
                            Continue
                        </button>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                        <ChallengePanel key={question} challenge={challenge} onVerdict={onVerdict} />
                    </div>
                )}

                {!beaten && (note || answered) && (
                    <footer className="flex items-center gap-3 border-t border-white/10 px-5 py-3">
                        {note && <span className="text-sm text-amber-200">{note}</span>}
                        {answered && (
                            <button autoFocus onClick={next} className="ml-auto rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300">
                                Next question
                            </button>
                        )}
                    </footer>
                )}

                {hit && (
                    <div
                        key={hit.key}
                        className={`pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-black tracking-tight drop-shadow-[0_4px_0_rgba(0,0,0,0.6)] animate-[pop_1.1s_ease-out_forwards] ${
                            hit.kind === "move" ? "text-amber-300" : "bg-red-600/15 text-red-400"
                        }`}
                    >
                        {hit.text}
                    </div>
                )}
            </div>
        </div>
    )
}
