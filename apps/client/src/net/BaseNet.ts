import { createContext, useContext } from "react"
import type { Room } from "@colyseus/sdk"
import type { ClockSync, SnapshotBuffer } from "@mcc/shared"

export type NetStatus = "connecting" | "online" | "offline"

export interface RosterEntry {
    id: string
    name: string
    color: string
}

/** The local Climber: also where the server spawned it. */
export interface SelfEntry extends RosterEntry {
    spawn: { x: number; y: number; z: number }
}

export interface BaseNet {
    status: NetStatus
    room: Room | null
    /** The local Climber as the server sees it (name, colour). */
    self: SelfEntry | null
    /** Everyone else in this Base Instance. */
    others: RosterEntry[]
    /** Mutable, read every frame: never put these in React state. */
    clock: ClockSync
    buffers: Map<string, SnapshotBuffer>
}

export const BaseNetContext = createContext<BaseNet | null>(null)

export function useBaseNet(): BaseNet {
    const net = useContext(BaseNetContext)
    if (!net) throw new Error("useBaseNet must be used inside <BaseNetProvider>")
    return net
}
