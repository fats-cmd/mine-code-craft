import type { PublicChallenge, TrialVerdict } from "@mcc/shared"
import { loadIdentity } from "../identity/storage"
import CodePanel from "./CodePanel"
import PredictPanel from "./PredictPanel"
import QuizPanel from "./QuizPanel"
import { useTrialRoom } from "./useTrialRoom"

/**
 * One Challenge in its own TrialRoom: the right panel for its Format, graded
 * on the server. Used by the /trial page and by floor encounters. Give it a
 * `key` per question so each one gets a fresh room.
 */
export default function ChallengePanel({ challenge: c, onVerdict }: { challenge: PublicChallenge; onVerdict?: (v: TrialVerdict) => void }) {
    const { status, start, submit } = useTrialRoom(c.slug, loadIdentity().name)
    return (
        <>
            {status !== "ready" && (
                <div className={`px-4 py-1 text-center text-xs ${status === "offline" ? "bg-red-500/20 text-red-200" : "bg-white/5 text-white/50"}`}>
                    {status === "offline" ? "The game server is offline: you can run code, but answers can't be graded." : "Connecting to the game server…"}
                </div>
            )}
            {c.format === "quiz" ? (
                <QuizPanel challenge={c} submit={submit} onVerdict={onVerdict} />
            ) : c.format === "predict" ? (
                <PredictPanel challenge={c} submit={submit} onVerdict={onVerdict} />
            ) : (
                <CodePanel challenge={c} start={start} submit={submit} onVerdict={onVerdict} />
            )}
        </>
    )
}
