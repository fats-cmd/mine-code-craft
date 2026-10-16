import { TESTING_FLOOR_ROOMS, type RoomDef, type RoomId } from "@mcc/shared"

// Where things stand on Floor 1. Rooms (z ranges, widths) come from
// @mcc/shared; this file adds the client-only placement and presentation.

export const WALL_HEIGHT = 6
export const WALL_THICKNESS = 0.5
export const DOOR_WIDTH = 4
export const DOOR_HEIGHT = 4

export type V3 = [number, number, number]

export const room = (id: RoomId): RoomDef => TESTING_FLOOR_ROOMS.find((r) => r.id === id)!

/** Henchman stands, by id. */
export const HENCHMAN_POS: Record<string, V3> = {
    "weftdart": [0, 0, -40],
    "holloquy": [0, 0, -60],
    "cogsnap-tick": [-4, 0, -77],
    "cogsnap-tock": [4, 0, -84],
    "firstbug": [0, 0, -98],
}

export const BOSS_PAD: V3 = [0, 0, -118]
export const BABBAGE_POS: V3 = [0, 0, -124]
/** Ada watches the boss fight from here, behind glass (ADR-0013). */
export const ADA_BALCONY: V3 = [12, 3, -133]
export const EXAM_GATE: V3 = [0, 0, -176]

/** How close you must stand to something to press E. */
export const INTERACT_RANGE = 2.6

/** Where a dev teleport drops you in a room: just inside its entrance. */
export const teleportTarget = (r: RoomDef): V3 => [0, 2, r.id === "arrival" ? 4 : r.zMax - 3]

/** The Guide's line when you first enter each room. The Guide's real name and look come later. */
export const GUIDE_LINES: Record<RoomId, string> = {
    arrival: "Welcome to the Tower, Climber. This is Floor 1: the Testing Floor. That was Ada Lovelace. Follow her: WASD to walk, the mouse to look.",
    abacus: "The Abacus Court. Cross on the beads: Space to jump, Shift to run. Fall in and the stairs bring you back up.",
    loom: "The Jacquard loom wove patterns from punched cards, and that idea became programming. Its shuttle has come loose: Weftdart wants a word. Walk up and press E.",
    archive: "Punched cards held programs. This one will show you some code. Tell it exactly what it prints.",
    gears: "Cogsnap Tick and Cogsnap Tock. Read the code, predict the numbers. Both have to fall before the door opens.",
    moth: "1947: a moth in a relay, the first actual bug. Fix the code and set it free.",
    engine: "Charles Babbage, the Examiner of Floor 1, and these are his Engines. Ada is watching from the balcony. Step onto the glowing pad and press E when you're ready.",
    hall: "The Testing Hall. Everyone here is on Floor 1, just like you. The gate at the far end leads up.",
}

/**
 * The Note Ada leaves in each room as she slips away ahead of you: a hint
 * for the room's Task, in her voice. Only the Loom line is her own words
 * (Note A, 1843); the rest are the game's.
 */
export const ADA_NOTES: Partial<Record<RoomId, string>> = {
    arrival: "Follow, if you can. My friend's Engines will not make it easy.",
    abacus: "Count before you leap. The beads will hold you.",
    loom: "“The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.” Find the pattern.",
    archive: "A card says exactly what it means, no more. Read it as the Engine would: line by line.",
    gears: "Each turn of a cog is one step. Count the turns and you have the answer.",
    moth: "A fault in a program is no disgrace. Leaving it there is.",
}
