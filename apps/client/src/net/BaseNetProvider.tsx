import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Callbacks, Client, type Room } from "@colyseus/sdk"
import { BASE_ROOM, ClockSync, SnapshotBuffer, type ClimberView } from "@mcc/shared"
import { BaseNetContext, type BaseNet, type NetStatus, type RosterEntry, type SelfEntry } from "./BaseNet"

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:2567"

interface BaseStateView {
    serverTime: number
    climbers: Map<string, ClimberView>
}

/**
 * Joins a Base Instance and keeps per-Climber snapshot buffers fed. If the
 * server isn't reachable the game still runs, single-player.
 */
export function BaseNetProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<NetStatus>("connecting")
    const [room, setRoom] = useState<Room | null>(null)
    const [self, setSelf] = useState<SelfEntry | null>(null)
    const [others, setOthers] = useState<RosterEntry[]>([])
    const [clock] = useState(() => new ClockSync())
    const [buffers] = useState(() => new Map<string, SnapshotBuffer>())

    useEffect(() => {
        let cancelled = false
        let joined: Room | null = null

        new Client(SERVER_URL)
            .joinOrCreate(BASE_ROOM)
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
                    const entry = { id, name: c.name, color: c.color }
                    if (id === r.sessionId) {
                        setSelf({ ...entry, spawn: { x: c.x, y: c.y, z: c.z } })
                        return
                    }
                    buffers.set(id, new SnapshotBuffer())
                    setOthers((prev) => [...prev.filter((o) => o.id !== id), entry])
                })
                callbacks.onRemove("climbers", (_value, key) => {
                    const id = key as string
                    buffers.delete(id)
                    setOthers((prev) => prev.filter((o) => o.id !== id))
                })

                // One snapshot per Climber per patch, stamped with server time.
                r.onStateChange((state: BaseStateView) => {
                    const t = state.serverTime
                    if (!(t > 0)) return
                    clock.addSample(performance.now(), t)
                    state.climbers.forEach((c, id) => {
                        buffers.get(id)?.push({ t, x: c.x, y: c.y, z: c.z, rotY: c.rotY })
                    })
                })

                r.onLeave(() => {
                    setStatus("offline")
                    setRoom(null)
                    setOthers([])
                    buffers.clear()
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
    }, [clock, buffers])

    const value = useMemo<BaseNet>(
        () => ({ status, room, self, others, clock, buffers }),
        [status, room, self, others, clock, buffers],
    )
    return <BaseNetContext.Provider value={value}>{children}</BaseNetContext.Provider>
}
