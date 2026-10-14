import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react"
import { initialProgress, parseProgress, progressReducer, type RoomId } from "@mcc/shared"
import { FloorContext, sameInteractable, type FloorState, type Interactable } from "./FloorContext"
import type { V3 } from "./layout"

const KEY = "mcc.floor1.progress.v1"

function loadProgress() {
    try {
        return parseProgress(JSON.parse(localStorage.getItem(KEY) ?? "null"))
    } catch {
        return initialProgress()
    }
}

/**
 * Floor 1's local game state. For guests, progress lives in this browser
 * (beaten henchmen and the boss stay beaten across visits). With sign-in it
 * moves to the server, which will also grade every Task (M4b).
 */
export function FloorProvider({ children }: { children: ReactNode }) {
    const [progress, dispatch] = useReducer(progressReducer, undefined, loadProgress)
    const [room, setRoomState] = useState<RoomId | null>(null)
    const [nearby, setNearbyState] = useState<Interactable | null>(null)
    const [encounter, setEncounter] = useState<Interactable | null>(null)
    const playerPosRef = useRef({ x: 0, y: 0, z: 0 })
    const inputBlockedRef = useRef(false)
    const teleportRef = useRef<V3 | null>(null)

    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(progress))
        } catch {
            // storage unavailable: progress lasts for this visit only
        }
    }, [progress])

    const openEncounter = useCallback((what: Interactable) => {
        inputBlockedRef.current = true
        if (document.pointerLockElement) document.exitPointerLock()
        setEncounter(what)
    }, [])
    const closeEncounter = useCallback(() => {
        inputBlockedRef.current = false
        setEncounter(null)
    }, [])
    // Called from per-frame trackers: only touch React state when the value really changes.
    const setRoom = useCallback((r: RoomId | null) => setRoomState((prev) => (prev === r ? prev : r)), [])
    const setNearby = useCallback(
        (what: Interactable | null) => setNearbyState((prev) => (sameInteractable(prev, what) ? prev : what)),
        [],
    )

    const value = useMemo<FloorState>(
        () => ({
            progress,
            dispatch,
            room,
            nearby,
            encounter,
            openEncounter,
            closeEncounter,
            playerPosRef,
            inputBlockedRef,
            teleportRef,
            setRoom,
            setNearby,
        }),
        [progress, room, nearby, encounter, openEncounter, closeEncounter, setRoom, setNearby],
    )
    return <FloorContext.Provider value={value}>{children}</FloorContext.Provider>
}
