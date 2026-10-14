import { createContext, useContext, type Dispatch, type RefObject } from "react"
import type { FloorAction, FloorProgress, RoomId } from "@mcc/shared"
import type { V3 } from "./layout"

export type Interactable = { kind: "henchman"; id: string } | { kind: "boss" } | { kind: "exam" }

export interface FloorState {
    progress: FloorProgress
    dispatch: Dispatch<FloorAction>
    /** The room the local Climber is standing in (null in a doorway). */
    room: RoomId | null
    /** What E would interact with right now. */
    nearby: Interactable | null
    /** The encounter panel that's open, if any. While open, the avatar doesn't move. */
    encounter: Interactable | null
    openEncounter: (what: Interactable) => void
    closeEncounter: () => void
    /** Written by Player every frame; read by trackers and remote avatars. Never React state. */
    playerPosRef: RefObject<{ x: number; y: number; z: number }>
    /** Mirrors `encounter !== null` for per-frame reads. */
    inputBlockedRef: RefObject<boolean>
    /** Set to move the local Climber (dev teleports); Player consumes it. */
    teleportRef: RefObject<V3 | null>
    setRoom: (room: RoomId | null) => void
    setNearby: (what: Interactable | null) => void
}

export const FloorContext = createContext<FloorState | null>(null)

export function useFloor(): FloorState {
    const floor = useContext(FloorContext)
    if (!floor) throw new Error("useFloor must be used inside <FloorProvider>")
    return floor
}

export const sameInteractable = (a: Interactable | null, b: Interactable | null) =>
    a === b || (!!a && !!b && a.kind === b.kind && (a.kind !== "henchman" || a.id === (b as typeof a).id))
