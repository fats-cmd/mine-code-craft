import { createContext, useContext } from "react"
import type { Room } from "@colyseus/sdk"
import type { ChatLine, ClockSync, Look, SnapshotBuffer } from "@mcc/shared"

export type NetStatus = "connecting" | "online" | "offline"

export interface RosterEntry {
    id: string
    name: string
    look: Look
}

/** The local Climber: also where the server spawned it. */
export interface SelfEntry extends RosterEntry {
    spawn: { x: number; y: number; z: number }
}

/** A chat line, or a client-made notice such as "Ada joined" (`from: "system"`). */
export type ChatEntry = ChatLine

export interface BaseNet {
    status: NetStatus
    room: Room | null
    /** The local Climber as the server sees it (name may have gained a #2). */
    self: SelfEntry | null
    /** Everyone else in this Base Instance. */
    others: RosterEntry[]
    /** Recent chat, oldest first. */
    chat: ChatEntry[]
    /** Each Climber's latest line, for speech bubbles. */
    lastSaid: Map<string, ChatEntry>
    sendChat: (text: string) => void
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
