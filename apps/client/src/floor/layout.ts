import { TESTING_FLOOR_ROOMS, type RoomDef, type RoomId } from "@mcc/shared"

// Where things stand on Floor 1. Rooms (z ranges, widths) come from
// @mcc/shared; this file adds the client-only placement and presentation.

export const WALL_HEIGHT = 6
export const WALL_THICKNESS = 0.5
export const DOOR_WIDTH = 4
export const DOOR_HEIGHT = 4

export type V3 = [number, number, number]

export const room = (id: RoomId): RoomDef => TESTING_FLOOR_ROOMS.find((r) => r.id === id)!

/** Floor and accent colours per room: the walk goes from wood and gaslight to circuit board. */
export const ROOM_STYLE: Record<RoomId, { floor: string; wall: string; light: string; intensity: number }> = {
    arrival: { floor: "#5b4636", wall: "#3b2f2a", light: "#ffd9a0", intensity: 40 },
    abacus: { floor: "#6b4a32", wall: "#3e2f26", light: "#ffcf8a", intensity: 45 },
    loom: { floor: "#6b3e26", wall: "#3a2a22", light: "#ffc56e", intensity: 45 },
    archive: { floor: "#5e4a3a", wall: "#2f2a28", light: "#f2e6c9", intensity: 40 },
    gears: { floor: "#4a4038", wall: "#2b2f3a", light: "#c9a227", intensity: 50 },
    moth: { floor: "#22262e", wall: "#15181d", light: "#7d8cff", intensity: 12 },
    engine: { floor: "#1e2a30", wall: "#1b2228", light: "#19c3d6", intensity: 70 },
    hall: { floor: "#14313a", wall: "#1a2a33", light: "#9fe8f2", intensity: 90 },
}

/** Henchman stands, by id. */
export const HENCHMAN_POS: Record<string, V3> = {
    "shuttle-sprite": [0, 0, -40],
    "punched-card": [0, 0, -60],
    "loose-cog-1": [-4, 0, -77],
    "loose-cog-2": [4, 0, -84],
    "the-moth": [0, 0, -98],
}

export const BOSS_PAD: V3 = [0, 0, -118]
export const BABBAGE_POS: V3 = [-7, 0, -126]
export const LOVELACE_POS: V3 = [7, 0, -126]
export const EXAM_GATE: V3 = [0, 0, -176]

/** How close you must stand to something to press E. */
export const INTERACT_RANGE = 2.6

/** Where a dev teleport drops you in a room: just inside its entrance. */
export const teleportTarget = (r: RoomDef): V3 => [0, 2, r.id === "arrival" ? 4 : r.zMax - 3]

/** The Guide's line when you first enter each room. The Guide's real name and look come later. */
export const GUIDE_LINES: Record<RoomId, string> = {
    arrival: "Welcome to the Tower, Climber. This is Floor 1: the Testing Floor. Walk forward with WASD and look around with the mouse.",
    abacus: "The Abacus Court. Cross on the beads: Space to jump, Shift to run. Fall in and the stairs bring you back up.",
    loom: "The Jacquard loom wove patterns from punched cards, and that idea became programming. Its Shuttle Sprite wants a word. Walk up and press E.",
    archive: "Punched cards held programs. This one will show you some code. Tell it exactly what it prints.",
    gears: "Two Loose Cogs. Read the code, predict the numbers. Both have to fall before the door opens.",
    moth: "1947: a moth in a relay, the first actual bug. Fix the code and set it free.",
    engine: "The Examiners: Charles Babbage and Ada Lovelace. Step onto the glowing pad and press E when you're ready.",
    hall: "The Testing Hall. Everyone here is on Floor 1, just like you. The gate at the far end leads up.",
}
