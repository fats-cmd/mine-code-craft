import { useCallback, useEffect, useRef, useState } from "react"
import { Client, type Room } from "@colyseus/sdk"
import { TRIAL_ROOM, TrialMsg, type TrialStart, type TrialVerdict } from "@mcc/shared"
import { SERVER_URL } from "../net/serverUrl"

export type TrialStatus = "connecting" | "ready" | "offline"

/** Opens a TrialRoom for one Challenge. `submit` resolves with the server's verdict. */
export function useTrialRoom(slug: string, name: string) {
    const [status, setStatus] = useState<TrialStatus>("connecting")
    const [start, setStart] = useState<TrialStart | null>(null)
    const room = useRef<Room | null>(null)
    const pending = useRef<((v: TrialVerdict) => void) | null>(null)

    useEffect(() => {
        let cancelled = false
        let joined: Room | null = null
        new Client(SERVER_URL)
            .create(TRIAL_ROOM, { slug, name })
            .then((r) => {
                if (cancelled) return void r.leave()
                joined = r
                room.current = r
                r.onMessage(TrialMsg.start, (s: TrialStart) => {
                    setStart(s)
                    setStatus("ready")
                })
                r.onMessage(TrialMsg.verdict, (v: TrialVerdict) => {
                    pending.current?.(v)
                    pending.current = null
                })
                r.onLeave(() => !cancelled && setStatus("offline"))
            })
            .catch(() => !cancelled && setStatus("offline"))
        return () => {
            cancelled = true
            room.current = null
            void joined?.leave()
        }
    }, [slug, name])

    const submit = useCallback((body: unknown): Promise<TrialVerdict> => {
        const r = room.current
        if (!r) return Promise.resolve({ kind: "rejected", reason: "not connected to the server" })
        return new Promise((resolve) => {
            pending.current = resolve
            r.send(TrialMsg.submit, body)
        })
    }, [])

    return { status, start, submit }
}
