import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Callbacks, Client, type Room } from "@colyseus/sdk"
import {
    BASE_ROOM,
    ClockSync,
    Msg,
    SnapshotBuffer,
    parseLook,
    type ChatLine,
    type ChatSend,
    type ClimberView,
    type JoinOptions,
} from "@mcc/shared"
import {
    BaseNetContext,
    type BaseNet,
    type ChatEntry,
    type NetStatus,
    type RosterEntry,
    type SelfEntry,
} from "./BaseNet"
import { SERVER_URL } from "./serverUrl"


/** Chat lines kept on the client. Older ones scroll away for good. */
const CHAT_KEEP = 50

interface BaseStateView {
    serverTime: number
    climbers: Map<string, ClimberView>
}

/**
 * Joins a Base Instance and keeps per-Climber snapshot buffers fed. If the
 * server isn't reachable the game still runs, single-player.
 */
export function BaseNetProvider({ join, children }: { join: JoinOptions; children: ReactNode }) {
    const [status, setStatus] = useState<NetStatus>("connecting")
    const [room, setRoom] = useState<Room | null>(null)
    const [self, setSelf] = useState<SelfEntry | null>(null)
    const [others, setOthers] = useState<RosterEntry[]>([])
    const [chat, setChat] = useState<ChatEntry[]>([])
    const [clock] = useState(() => new ClockSync())
    const [buffers] = useState(() => new Map<string, SnapshotBuffer>())

    useEffect(() => {
        let cancelled = false
        let joined: Room | null = null

        const addLine = (line: ChatEntry) => setChat((prev) => [...prev, line].slice(-CHAT_KEEP))
        const notice = (text: string) => addLine({ from: "system", name: "", text, at: Date.now() })
        // onAdd also fires for everyone already here when we join: only announce later arrivals.
        let settled = false

        new Client(SERVER_URL)
            .joinOrCreate(BASE_ROOM, join)
            .then((r) => {
                // StrictMode mounts twice in dev; the first join just leaves.
                if (cancelled) {
                    void r.leave()
                    return
                }
                joined = r
                const callbacks = Callbacks.get(r)

                callbacks.onAdd("climbers", (value, key) => {
                    const c = value as ClimberView
                    const id = key as string
                    // Copy out of the schema instance: React state must not alias live synced objects.
                    const entry = { id, name: c.name, look: parseLook({ ...c.look }) }
                    if (id === r.sessionId) {
                        setSelf({ ...entry, spawn: { x: c.x, y: c.y, z: c.z } })
                        return
                    }
                    buffers.set(id, new SnapshotBuffer())
                    setOthers((prev) => [...prev.filter((o) => o.id !== id), entry])
                    if (settled) notice(`${c.name} joined`)
                })
                callbacks.onRemove("climbers", (value, key) => {
                    const id = key as string
                    buffers.delete(id)
                    setOthers((prev) => prev.filter((o) => o.id !== id))
                    notice(`${(value as ClimberView).name} left`)
                })

                r.onMessage(Msg.chat, (line: ChatLine) => addLine(line))

                // One snapshot per accepted move, stamped with the server time it was accepted.
                // Stamping with the patch time instead would pair 20 Hz patches with
                // 20 Hz moves that drift against them: some patches carry no new pose,
                // and the avatar stutters.
                const lastT = new Map<string, number>()
                r.onStateChange((state: BaseStateView) => {
                    const now = state.serverTime
                    if (!(now > 0)) return
                    clock.addSample(performance.now(), now)
                    settled = true
                    state.climbers.forEach((c, id) => {
                        const buffer = buffers.get(id)
                        if (!buffer || !(c.t > 0) || lastT.get(id) === c.t) return
                        lastT.set(id, c.t)
                        buffer.push({ t: c.t, x: c.x, y: c.y, z: c.z, rotY: c.rotY })
                    })
                })

                r.onLeave(() => {
                    setStatus("offline")
                    setRoom(null)
                    setOthers([])
                    buffers.clear()
                    notice("Disconnected from the Base.")
                })

                setRoom(r)
                setStatus("online")
            })
            .catch((err: unknown) => {
                if (cancelled) return
                console.warn("Base server unreachable, playing offline:", err)
                setStatus("offline")
            })

        return () => {
            cancelled = true
            void joined?.leave()
        }
    }, [clock, buffers, join])

    const sendChat = useCallback(
        (text: string) => {
            if (room && text.trim()) room.send(Msg.chat, { text } satisfies ChatSend)
        },
        [room],
    )

    const lastSaid = useMemo(() => {
        const latest = new Map<string, ChatEntry>()
        for (const line of chat) if (line.from !== "system") latest.set(line.from, line)
        return latest
    }, [chat])

    const value = useMemo<BaseNet>(
        () => ({ status, room, self, others, chat, lastSaid, sendChat, clock, buffers }),
        [status, room, self, others, chat, lastSaid, sendChat, clock, buffers],
    )
    return <BaseNetContext.Provider value={value}>{children}</BaseNetContext.Provider>
}
