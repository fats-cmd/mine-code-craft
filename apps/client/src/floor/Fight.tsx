import { useEffect, useRef, useState, type ReactNode } from "react"
import {
    CHALLENGES,
    MAX_INTEGRITY,
    TESTING_FLOOR_BOSS,
    TESTING_FLOOR_HENCHMEN,
    henchmanSteps,
    stepChallenge,
    type TaskFormat,
    type TaskStep,
    type TrialVerdict,
} from "@mcc/shared"
import ChallengePanel from "../trial/ChallengePanel"
import { DEV_TOOLS } from "../dev/devTools"
import { useFloor } from "./FloorContext"

// A fight is a run of Tasks: real Challenges, graded by the server in a
// TrialRoom (M3). A henchman is one step; each of Babbage's phases is one to
// three. A pass lands a Move, a fail (or the clock running out) takes a
// Counter and costs 1 Integrity (GAME_DESIGN, Moves and Counters).
//
// Quiz and Predict are one try: the answer is shown, then the next question
// comes from the step's pool. Code and Fix stay on screen so you can keep
// editing. A knockout restores Integrity; in a boss phase it also sends you
// back to the start of the phase (Floor 1 design, section 4).

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

interface FightProps {
    /** Small caps line above the name, e.g. "Henchman" or "Phase 1 of 3 · Charles Babbage". */
    kicker: string
    name: string
    /** An italic line under the name: the henchman's flavour, the Examiner's intro. */
    flavor: string
    steps: readonly TaskStep[]
    /** What the progress pips stand for ("hits", "columns jammed"). */
    progressLabel: string
    /** Shown when a pass lands, e.g. "Weftdart staggers." */
    onPassText: string
    /** The Counter's name, e.g. "Weftdart counters!" or "The crank!" */
    counterText: string
    /** Boss phases restart from their first step on a knockout. */
    restartOnKnockout: boolean
    /** The Guide's advice, shown as the fight opens. */
    opening?: string
    onWon: () => void
    /** The screen once won. */
    won: ReactNode
    onDevSkip: () => void
}

export function Fight(p: FightProps) {
    const { progress, dispatch, closeEncounter } = useFloor()
    const [step, setStep] = useState(0)
    const [wins, setWins] = useState(0)
    // Questions are numbered across the whole fight (each gets a fresh room);
    // a step draws from its pool counting from its own first question.
    const [question, setQuestion] = useState(0)
    const [stepStart, setStepStart] = useState(0)
    const [answered, setAnswered] = useState(false)
    const [done, setDone] = useState(false)
    const [hit, setHit] = useState<Hit | null>(null)
    const [note, setNote] = useState<string | null>(p.opening ?? null)
    const hits = useRef(0)
    // The question on screen. A verdict or a timeout for any other question is stale.
    const asked = useRef(0)
    useEffect(() => {
        asked.current = question
    }, [question])

    const current = p.steps[step]
    const challenge = CHALLENGES.find((c) => c.slug === stepChallenge(current, question - stepStart))!
    const oneTry = challenge.format === "quiz" || challenge.format === "predict"
    const total = p.steps.reduce((n, s) => n + s.wins, 0)
    const landed = p.steps.slice(0, step).reduce((n, s) => n + s.wins, 0) + wins
    const clock = current.seconds && !answered && !done ? current.seconds : null

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

    const flash = (kind: Hit["kind"], text: string) => setHit({ kind, text, key: ++hits.current })

    /** The next question; moves to the next step once this one is won. */
    const next = (fromStep = step, fromWins = wins) => {
        if (fromWins >= p.steps[fromStep].wins) {
            setStep(fromStep + 1)
            setWins(0)
            setStepStart(question + 1)
        }
        setQuestion((q) => q + 1)
        setAnswered(false)
    }

    const fail = (why: string) => {
        const knockedOut = progress.integrity <= 1
        dispatch({ type: "hit" })
        flash("counter", p.counterText)
        if (knockedOut && p.restartOnKnockout) {
            setStep(0)
            setWins(0)
            setStepStart(question + 1)
            setNote("Integrity depleted. You regroup at full strength and start this phase again; nothing else is lost.")
            setQuestion((q) => q + 1)
            setAnswered(false)
            return
        }
        if (knockedOut) {
            setNote("Integrity depleted. You regroup at full strength; nothing is lost. Here's a fresh one.")
            if (!oneTry) next()
            else setAnswered(true)
            return
        }
        setNote(`${why} That cost 1 Integrity. ${oneTry ? "Try the next one." : "Fix it and submit again."}`)
        if (oneTry) setAnswered(true)
    }

    const onVerdict = (v: TrialVerdict, q: number) => {
        if (v.kind === "rejected" || q !== asked.current || done) return
        if (!v.passed) return fail("Wrong.")
        const nowWins = wins + 1
        setWins(nowWins)
        flash("move", MOVE[challenge.format])
        const stepDone = nowWins >= current.wins
        if (stepDone && step + 1 >= p.steps.length) {
            setDone(true)
            setNote(null)
            p.onWon()
            return
        }
        setNote(`${p.onPassText} ${total - landed - 1} to go.`)
        if (oneTry) setAnswered(true)
        else next(step, nowWins)
    }

    // The crank: a question with a clock is lost when it runs out.
    useEffect(() => {
        if (!clock) return
        const q = question
        const t = setTimeout(() => {
            if (asked.current !== q) return
            fail("Time! The crank came round before you answered.")
            // A timed question is never revealed: straight on to a fresh one.
            setQuestion((n) => n + 1)
            setAnswered(false)
        }, clock * 1000)
        return () => clearTimeout(t)
        // Re-armed per question; `fail` reads the latest Integrity when it fires.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clock, question, step])

    const big = !oneTry && !done
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div
                role="dialog"
                aria-label={p.name}
                className={`relative flex w-full flex-col overflow-hidden rounded-xl bg-slate-900 text-slate-100 ring-1 ring-amber-300/40 ${
                    big ? "h-full max-w-7xl" : "max-h-full max-w-4xl"
                } ${hit?.kind === "counter" ? "animate-[counter_0.45s_ease-out]" : ""}`}
            >
                <header className={`flex items-center gap-4 border-b border-white/10 px-5 py-3 ${hit?.kind === "move" ? "animate-[move_0.4s_ease-out]" : ""}`}>
                    <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300/80">
                            {p.kicker}
                            {!done && ` · ${FORMAT_NAME[challenge.format]}${oneTry ? "" : ` · ${challenge.title}`}`}
                        </div>
                        <h2 className="text-xl font-bold">{p.name}</h2>
                        <p className="line-clamp-2 text-xs italic text-slate-400">{p.flavor}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-5">
                        {total > 1 && (
                            <div className="text-center" aria-label={`${landed} of ${total} ${p.progressLabel}`}>
                                <div className="flex justify-center gap-1">
                                    {Array.from({ length: total }, (_, i) => (
                                        <span key={i} className={`h-3 w-3 rotate-45 ${i < landed ? "bg-amber-300" : "bg-white/15"}`} />
                                    ))}
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-slate-400">{p.progressLabel}</div>
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
                        {DEV_TOOLS && !done && (
                            <button
                                onClick={p.onDevSkip}
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

                {clock && (
                    <div className="h-2 bg-white/10" title="The crank">
                        <div key={question} className="h-full bg-amber-400" style={{ animation: `crank ${clock}s linear forwards` }} />
                    </div>
                )}

                {done ? (
                    p.won
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                        <ChallengePanel key={question} challenge={challenge} onVerdict={(v) => onVerdict(v, question)} />
                    </div>
                )}

                {!done && (note || answered) && (
                    <footer className="flex items-center gap-3 border-t border-white/10 px-5 py-3">
                        {note && <span className="text-sm text-amber-200">{note}</span>}
                        {answered && (
                            <button autoFocus onClick={() => next()} className="ml-auto shrink-0 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300">
                                {wins >= current.wins ? "Onward" : "Next question"}
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

function WonScreen({ title, line, button, onClick }: { title: string; line: ReactNode; button: string; onClick: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="text-3xl font-bold text-amber-300">{title}</div>
            <div className="max-w-xl text-slate-300">{line}</div>
            <button autoFocus onClick={onClick} className="mt-2 rounded-md bg-teal-400 px-5 py-2 font-bold text-slate-950 hover:bg-teal-300">
                {button}
            </button>
        </div>
    )
}

export function HenchmanFight({ id }: { id: string }) {
    const { dispatch, closeEncounter } = useFloor()
    const h = TESTING_FLOOR_HENCHMEN.find((x) => x.id === id)!
    return (
        <Fight
            kicker="Henchman"
            name={h.name}
            flavor={h.flavor}
            steps={henchmanSteps(h)}
            progressLabel="hits"
            onPassText={`${h.name} staggers.`}
            counterText={`${h.name} counters!`}
            restartOnKnockout={false}
            onWon={() => dispatch({ type: "defeat", id: h.id })}
            won={<WonScreen title={`${h.name} is beaten`} line="The way on is open." button="Continue" onClick={closeEncounter} />}
            onDevSkip={() => {
                dispatch({ type: "defeat", id: h.id })
                closeEncounter()
            }}
        />
    )
}

const BABBAGE_OPENING = "“You'll not reach her without passing through my Engines.”"
const BABBAGE_YIELDS = "“Hm. You'll do.”"

/**
 * Charles Babbage, phase by phase. Each cleared phase is a checkpoint
 * (Integrity refills, and leaving keeps it). `beaten` is shown instead if he
 * was already beaten when the encounter opened.
 */
export function BossFight({ beaten }: { beaten: ReactNode }) {
    const { progress, dispatch, closeEncounter } = useFloor()
    const [startedBeaten] = useState(progress.bossBeaten)
    const [phase, setPhase] = useState(progress.bossPhase)
    if (startedBeaten) return beaten

    const phases = TESTING_FLOOR_BOSS.phases
    const def = phases[phase]
    const last = phase + 1 >= phases.length
    return (
        <Fight
            key={phase}
            kicker={`Phase ${phase + 1} of ${phases.length} · ${def.examiner}`}
            name={def.title}
            flavor={def.intro}
            steps={def.steps}
            progressLabel={def.progress}
            onPassText="Babbage's guard cracks."
            counterText={`${def.attack}!`}
            restartOnKnockout
            opening={[phase === 0 ? `Babbage: ${BABBAGE_OPENING}` : null, def.guide ? `Guide: ${def.guide}` : null].filter(Boolean).join(" ") || undefined}
            onWon={() => dispatch({ type: "phaseCleared" })}
            won={
                last ? (
                    <WonScreen
                        title="The Analytical Engine runs"
                        line={<>The teal glow floods the room. Babbage steps back: <em>{BABBAGE_YIELDS}</em></>}
                        button="Continue"
                        onClick={closeEncounter}
                    />
                ) : (
                    <WonScreen
                        title={`${def.title}: cleared`}
                        line={`Checkpoint: Integrity restored. Next, ${phases[phase + 1].title}.`}
                        button="Next phase"
                        onClick={() => setPhase(phase + 1)}
                    />
                )
            }
            onDevSkip={() => {
                dispatch({ type: "phaseCleared" })
                if (last) closeEncounter()
                else setPhase(phase + 1)
            }}
        />
    )
}
