import { useEffect, useRef, useState } from "react"
import {
    MAX_INTEGRITY,
    TESTING_FLOOR_BOSS,
    TESTING_FLOOR_HENCHMEN,
    TESTING_FLOOR_ROOMS,
    approachCleared,
    type FloorProgress,
    type RoomId,
    type TaskFormat,
} from "@mcc/shared"
import { isTyping } from "../chat/typing"
import { useFloor, type Interactable } from "./FloorContext"
import { ADA_NOTES, GUIDE_LINES } from "./layout"
import HenchmanFight from "./HenchmanFight"

const GUIDE_MS = 9000
const VICTORY_LINE = "“You may yet understand what I saw in it.”"


/** What to do next, from progress and where you are. */
function objective(p: FloorProgress, room: RoomId | null): string {
    const next = TESTING_FLOOR_HENCHMEN.find((h) => !p.defeated.includes(h.id))
    if (next) {
        // You think the goal is to catch Ada; the henchmen are just in the way (ADR-0013).
        if (p.defeated.length === 0 && (room === "arrival" || room === "abacus")) return "Follow Ada Lovelace · cross the Abacus Court"
        const where = TESTING_FLOOR_ROOMS.find((r) => r.id === next.room)!.name
        return `Follow Ada Lovelace · get past ${next.name} (${where})`
    }
    if (!p.bossBeaten) return `Face Charles Babbage · phase ${p.bossPhase + 1}/${TESTING_FLOOR_BOSS.phases.length}`
    if (room !== "hall") return "Go through the Gate of Notes"
    return "Floor 1 Exam: the gate at the far end"
}

function label(what: Interactable): string {
    if (what.kind === "henchman") return `face ${TESTING_FLOOR_HENCHMEN.find((h) => h.id === what.id)!.name}`
    if (what.kind === "boss") return "face Charles Babbage"
    return "approach the Exam Gate"
}

export default function FloorHud() {
    const { progress, room, nearby, encounter, openEncounter } = useFloor()
    const roomName = TESTING_FLOOR_ROOMS.find((r) => r.id === room)?.name ?? ""

    // E opens whatever is in range.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code !== "KeyE" || e.repeat || isTyping() || encounter || !nearby) return
            openEncounter(nearby)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [nearby, encounter, openEncounter])

    return (
        <>
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-center font-mono text-white">
                <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80">Floor 1 · {roomName || "…"}</div>
                <div className="mt-1 rounded bg-black/55 px-3 py-1.5 text-sm">{objective(progress, room)}</div>
                <Integrity value={progress.integrity} />
            </div>
            {nearby && !encounter && (
                <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 font-mono text-sm text-white ring-1 ring-amber-300/60">
                    <kbd className="mr-2 rounded bg-amber-300 px-1.5 font-bold text-slate-900">E</kbd>
                    {label(nearby)}
                </div>
            )}
            <GuideLine />
            {encounter?.kind === "henchman" && <HenchmanFight id={encounter.id} />}
            {encounter && encounter.kind !== "henchman" && <EncounterPanel what={encounter} />}
        </>
    )
}

function Integrity({ value }: { value: number }) {
    return (
        <div className="mt-1 flex justify-center gap-1" aria-label={`Integrity ${value} of ${MAX_INTEGRITY}`}>
            {Array.from({ length: MAX_INTEGRITY }, (_, i) => (
                <span key={i} className={`h-2 w-5 rounded-sm ${i < value ? "bg-teal-300" : "bg-white/15"}`} />
            ))}
        </div>
    )
}

interface Line {
    speaker: string
    text: string
    key: number
}

/**
 * The Guide speaks once per room per visit. Ada's Note for the room follows
 * it (she's always one room ahead), and she has the last word when Babbage falls.
 */
function GuideLine() {
    const { room, progress } = useFloor()
    const [line, setLine] = useState<Line | null>(null)
    const greeted = useRef(new Set<string>())
    const wasBeaten = useRef(progress.bossBeaten)

    useEffect(() => {
        const queue: Omit<Line, "key">[] = []
        if (progress.bossBeaten && !wasBeaten.current) queue.push({ speaker: "Ada Lovelace", text: VICTORY_LINE })
        else if (room && !greeted.current.has(room)) {
            queue.push({ speaker: "Guide", text: GUIDE_LINES[room] })
            const note = progress.bossBeaten ? undefined : ADA_NOTES[room]
            if (note) queue.push({ speaker: "Ada's Note", text: note })
        }
        wasBeaten.current = progress.bossBeaten
        if (room) greeted.current.add(room)
        if (!queue.length) return
        // Deferred so no state change is made synchronously inside the effect.
        const timers = queue.flatMap((l, i) => {
            const key = Date.now() + i
            return [
                setTimeout(() => setLine({ ...l, key }), i * GUIDE_MS),
                setTimeout(() => setLine((cur) => (cur?.key === key ? null : cur)), (i + 1) * GUIDE_MS),
            ]
        })
        return () => timers.forEach(clearTimeout)
    }, [room, progress.bossBeaten])

    if (!line) return null
    const ada = line.speaker !== "Guide"
    return (
        <div
            className={`pointer-events-none absolute bottom-40 left-1/2 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ${
                ada ? "bg-[#2a1630]/85 italic ring-fuchsia-300/40" : "bg-slate-950/80 ring-amber-200/30"
            }`}
        >
            <span className={`mr-2 font-mono text-xs font-bold not-italic uppercase tracking-wider ${ada ? "text-fuchsia-300" : "text-amber-300"}`}>
                {line.speaker}
            </span>
            {line.text}
        </div>
    )
}

const FORMAT_LABEL: Record<TaskFormat, string> = {
    quiz: "Quiz",
    predict: "Predict",
    fix: "Fix",
    code: "Code",
    movement: "Movement",
}

/**
 * The boss and the Exam Gate. Henchmen fight real Tasks (HenchmanFight); the
 * boss's phases still use Pass and Fail until they're wired the same way (M4b).
 */
function EncounterPanel({ what }: { what: Interactable }) {
    const { progress, dispatch, closeEncounter } = useFloor()
    const [note, setNote] = useState<string | null>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeEncounter()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [closeEncounter])

    let title: string
    let subtitle: string
    let format: TaskFormat | null = null
    let task: string

    if (what.kind === "boss") {
        const phase = TESTING_FLOOR_BOSS.phases[Math.min(progress.bossPhase, TESTING_FLOOR_BOSS.phases.length - 1)]
        title = progress.bossBeaten ? "Babbage is beaten" : phase.title
        subtitle = progress.bossBeaten
            ? TESTING_FLOOR_BOSS.name
            : `Phase ${progress.bossPhase + 1} of ${TESTING_FLOOR_BOSS.phases.length} · ${phase.examiner}`
        format = progress.bossBeaten ? null : phase.format
        task = progress.bossBeaten ? "The Gate of Notes is open." : phase.task
    } else {
        title = "The Floor 1 Exam"
        subtitle = "Exam Gate"
        task = approachCleared(progress) && progress.bossBeaten
            ? "Five mixed Tasks; pass four to climb to Floor 2. The Exam arrives with M7 (it needs sign-in to remember your floor)."
            : "Beat Charles Babbage first."
    }

    const fightable = what.kind === "boss" && !progress.bossBeaten

    const pass = () => {
        if (what.kind === "boss") {
            dispatch({ type: "phaseCleared" })
            if (progress.bossPhase + 1 >= TESTING_FLOOR_BOSS.phases.length) closeEncounter()
            else setNote("Phase cleared. Integrity restored.")
        }
    }
    const fail = () => {
        dispatch({ type: "hit" })
        setNote(
            progress.integrity <= 1
                ? "Integrity depleted. You regroup at full strength; nothing is lost. Try again."
                : "Wrong. That cost 1 Integrity. Try again.",
        )
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
            <div role="dialog" aria-label={title} className="w-full max-w-lg rounded-xl bg-slate-950 p-6 text-slate-100 ring-1 ring-amber-300/40">
                <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300/80">{subtitle}</div>
                <h2 className="mt-1 text-2xl font-bold">{title}</h2>
                <div className="mt-4 rounded-md bg-slate-900 p-3 text-sm">
                    {format && (
                        <span className="mr-2 rounded bg-teal-400/20 px-1.5 py-0.5 font-mono text-xs text-teal-200">{FORMAT_LABEL[format]}</span>
                    )}
                    {task}
                </div>
                {fightable && (
                    <>
                        <p className="mt-3 font-mono text-xs text-slate-500">
                            Greybox: Babbage's phases get real Tasks next (M4b). Pass or fail by hand for now.
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                            <Integrity value={progress.integrity} />
                            {note && <span className="text-xs text-amber-200">{note}</span>}
                        </div>
                    </>
                )}
                <div className="mt-5 flex gap-3">
                    {fightable && (
                        <>
                            <button onClick={pass} className="flex-1 rounded-md bg-teal-400 px-4 py-2 font-bold text-slate-950 hover:bg-teal-300">
                                Pass
                            </button>
                            <button onClick={fail} className="rounded-md px-4 py-2 font-semibold text-rose-300 ring-1 ring-rose-400/50 hover:bg-rose-950">
                                Fail
                            </button>
                        </>
                    )}
                    <button onClick={closeEncounter} className="rounded-md px-4 py-2 text-sm ring-1 ring-slate-700 hover:bg-slate-900">
                        Leave <span className="text-slate-500">(Esc)</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
