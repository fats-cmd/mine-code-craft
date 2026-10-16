import { hash3, shade, type RoomDef, type RoomId } from "@mcc/shared"
import { VoxelBuilder, bricks, planks, tiles, type Paint, type V3 } from "../voxel/builder"
import { DOOR_HEIGHT, DOOR_WIDTH, WALL_HEIGHT, WALL_THICKNESS, room } from "./layout"

// Floor 1 in voxels: each room's architecture, built once at load. Every
// `solid()` is both what you see and what you collide with, so art passes
// can't drift from the colliders. Look: bright diorama palette, soft baked
// AO, per-voxel colour variation (docs/design/ART_DIRECTION.md).

interface RoomStyle {
    floor: Paint
    wall: number
    /** Skirting, door frames and pillars. */
    trim: number
    /** Wall tops. */
    cap: number
    /** Lanterns on the pillars. */
    lamp: number
}

export const STYLE: Record<RoomId, RoomStyle> = {
    arrival: { floor: tiles(0xe8d2a6, 0xdcc293, 1), wall: 0xf0e2c4, trim: 0xb98b5e, cap: 0xfaf1dc, lamp: 0xffd27a },
    abacus: { floor: planks(0xc58f5c, 2), wall: 0xeed8b0, trim: 0xa8774c, cap: 0xf8ead0, lamp: 0xffcf7a },
    loom: { floor: planks(0xb8774a, 3), wall: 0xe9cfa4, trim: 0x9b5f3a, cap: 0xf6e4c4, lamp: 0xffc56e },
    archive: { floor: tiles(0xdcc79c, 0xcfb98c, 4), wall: 0xf2e6cb, trim: 0x8f6b4a, cap: 0xfbf4e2, lamp: 0xfff0c8 },
    gears: { floor: tiles(0xa89d8c, 0x9a8f7e, 5), wall: 0xcfc4b0, trim: 0x7c6a52, cap: 0xe6dccb, lamp: 0xf5c518 },
    moth: { floor: tiles(0x4a5060, 0x434958, 6), wall: 0x5c6378, trim: 0x3a3f4c, cap: 0x737b92, lamp: 0x8f9cff },
    engine: { floor: tiles(0x3d6170, 0x355664, 7), wall: 0x5a8494, trim: 0x2f4a55, cap: 0x8fb8c4, lamp: 0x6fe9f5 },
    hall: { floor: tiles(0xcfdde3, 0xc0cfd7, 8), wall: 0xaec4ce, trim: 0x6f8a96, cap: 0xe2edf2, lamp: 0x6fe9f5 },
}

const T = WALL_THICKNESS
const DH = DOOR_WIDTH / 2

/** Floor, side walls with pillars and lanterns, and both end walls with framed doorways. */
function shell(
    b: VoxelBuilder,
    r: RoomDef,
    { floor = true, closedEntrance = false, closedExit = false, bottom = 0 } = {},
): VoxelBuilder {
    const s = STYLE[r.id]
    const half = r.width / 2
    const { zMin, zMax } = r
    if (floor) b.solid([-half, -1, zMin], [half, 0, zMax], s.floor)

    for (const side of [-1, 1]) {
        const x0 = side < 0 ? -half : half - T
        b.solid([x0, bottom, zMin], [x0 + T, WALL_HEIGHT, zMax], bricks(s.wall, side))
        b.deco([x0, 0, zMin], [x0 + T, 0.5, zMax], s.trim)
        b.deco([x0, WALL_HEIGHT - 0.5, zMin], [x0 + T, WALL_HEIGHT, zMax], s.cap)
        // A cornice and pillars on the inside face.
        const xi = side < 0 ? -half + T : half - 2 * T
        b.deco([xi, WALL_HEIGHT - 0.5, zMin + T], [xi + T, WALL_HEIGHT, zMax - T], s.cap)
        for (let z = zMax - 4; z > zMin + 2; z -= 4) {
            b.solid([xi, bottom, z - T], [xi + T, WALL_HEIGHT - 0.5, z], s.trim)
            b.deco([xi, 3, z - T], [xi + T, 3.5, z], s.lamp, true)
        }
    }
    endWall(b, zMax - T, half, closedEntrance, s)
    endWall(b, zMin, half, closedExit, s)
    return b
}

function endWall(b: VoxelBuilder, z0: number, half: number, closed: boolean, s: RoomStyle) {
    const z1 = z0 + T
    const paint = bricks(s.wall, 9)
    if (closed) b.solid([-half, 0, z0], [half, WALL_HEIGHT, z1], paint)
    else {
        b.solid([-half, 0, z0], [-DH, WALL_HEIGHT, z1], paint)
        b.solid([DH, 0, z0], [half, WALL_HEIGHT, z1], paint)
        b.solid([-DH, DOOR_HEIGHT, z0], [DH, WALL_HEIGHT, z1], paint)
        // door frame
        b.deco([-DH - T, 0, z0], [-DH, DOOR_HEIGHT + T, z1], s.trim)
        b.deco([DH, 0, z0], [DH + T, DOOR_HEIGHT + T, z1], s.trim)
        b.deco([-DH, DOOR_HEIGHT, z0], [DH, DOOR_HEIGHT + T, z1], s.trim)
    }
    b.deco([-half, 0, z0], [closed ? half : -DH - T, 0.5, z1], s.trim)
    if (!closed) b.deco([DH + T, 0, z0], [half, 0.5, z1], s.trim)
    b.deco([-half, WALL_HEIGHT - 0.5, z0], [half, WALL_HEIGHT, z1], s.cap)
}

// ---- rooms ----------------------------------------------------------------

/** Potted trees (drawn in models.ts); each pot gets a collider here. */
export const TREES: V3[] = [
    [-5.5, 0, 9.5],
    [5.5, 0, 9.5],
    [-5.5, 0, -0.5],
    [5.5, 0, -0.5],
    [-20, 0, -138.5],
    [20, 0, -138.5],
    [-20, 0, -178],
    [20, 0, -178],
]

function pots(b: VoxelBuilder, r: RoomDef) {
    for (const [x, , z] of TREES) if (z <= r.zMax && z > r.zMin) b.collider([x - 0.5, 0, z - 0.5], [x + 0.5, 1.5, z + 0.5])
}

function arrival() {
    const b = shell(new VoxelBuilder(), room("arrival"), { closedEntrance: true })
    pots(b, room("arrival"))
    // the gold arrival pad, inlaid flush with the floor
    b.deco([-2.5, -0.5, 1.5], [2.5, 0, 6.5], (x, _y, z) => (x === -5 || x === 4 || z === 3 || z === 12 ? 0xf5c518 : 0xffe08a))
    return b
}

/** Bead pillars: 2 m deep with 1.5 m gaps, clearly wider than the capsule (0.7 m) so a miss drops you in. */
export const BEADS: [number, number][] = [
    [-11.5, -9.5],
    [-15, -13],
    [-18.5, -16.5],
]
const BEAD_COLORS = [0xe2483d, 0xf5b82e, 0x2ec4c9]

function abacus() {
    const r = room("abacus")
    const half = r.width / 2
    const b = shell(new VoxelBuilder(), r, { floor: false, bottom: -3.5 })
    const wood = planks(0xc58f5c, 2)
    // entrance and exit ledges, top at y = 0
    b.solid([-half, -2.5, -8], [half, 0, -2], wood)
    b.solid([-half, -2.5, -26], [half, 0, -20], wood)
    b.deco([-half, -0.5, -8], [half, 0, -7.5], 0x8a5a36) // ledge edges
    b.deco([-half, -0.5, -20.5], [half, 0, -20], 0x8a5a36)
    // the pit
    b.solid([-half, -3.5, -20], [half, -2.5, -8], tiles(0x7a5236, 0x6e4a30, 12))
    BEADS.forEach(([z0, z1], i) => {
        const c = BEAD_COLORS[i]
        b.solid([-2, -2.5, z0], [2, 0, z1], (x, y, z) => shade(c, y === -1 ? 0.12 : (hash3(x, y, z, i) * 2 - 1) * 0.05 - 0.04))
    })
    // stairs out of the pit, back up to the entrance ledge: 5 steps, 0.5 m rise
    for (let i = 1; i <= 5; i++) {
        const z0 = -13 + (i - 1)
        b.solid([4, -2.5, z0], [7, -2.5 + 0.5 * i, z0 + 1], planks(0xb07a4a, 20 + i))
    }
    // abacus rods overhead, with beads strung on them
    for (const z of [-11, -14, -18]) {
        b.deco([-half + 1, 4.5, z], [half - 1, 5, z + 0.5], (x) => (Math.abs(x) % 3 === 0 ? BEAD_COLORS[(x + 30) % 3] : 0xd9a520))
    }
    return b
}

function loom() {
    const b = shell(new VoxelBuilder(), room("loom"))
    const wood = planks(0x8a5532, 30)
    b.solid([-5, 0, -44.5], [-4, 5.5, -43.5], wood)
    b.solid([4, 0, -44.5], [5, 5.5, -43.5], wood)
    b.deco([-5.5, 5, -45], [5.5, 6, -43], wood)
    // the woven cloth, a Jacquard pattern in the weave
    const weave = [0xe2483d, 0xf5c518, 0x3b82f6, 0xf2e6c9]
    b.solid([-4, 0, -44.5], [4, 1, -43.5], (x, y, z) => weave[(Math.abs(x) + y * 2 + Math.abs(z)) % weave.length])
    return b
}

function archive() {
    const b = shell(new VoxelBuilder(), room("archive"))
    const card = (x: number, y: number, z: number) =>
        hash3(x, y, z, 40) < 0.22 ? 0x4a3b2a : shade(0xfbf3df, (hash3(x, y, z, 41) * 2 - 1) * 0.04)
    for (const [z0, z1] of [[-63.5, -60.5], [-58.5, -55.5], [-53.5, -50.5]]) {
        for (const [x0, x1] of [[-7.5, -6], [6, 7.5]]) {
            b.solid([x0, 0, z0], [x1, 4, z1], card)
            b.deco([x0, 4, z0], [x1, 4.5, z1], 0x8f6b4a) // shelf top
        }
    }
    return b
}

/** Cogs hang on the walls; this is the slab of wall they'd hit. */
export const COGS: { at: V3; radius: number; spin: number }[] = [
    { at: [-7.75, 3, -74], radius: 2.4, spin: 0.2 },
    { at: [7.75, 2.5, -80], radius: 2, spin: -0.3 },
    { at: [-7.75, 2.2, -86], radius: 1.6, spin: 0 },
]

function gears() {
    const b = shell(new VoxelBuilder(), room("gears"))
    for (const c of COGS) {
        const x0 = c.at[0] < 0 ? -8.5 : 7.5
        b.collider([x0, 0, Math.floor(c.at[2] - c.radius)], [x0 + 1, 5.5, Math.ceil(c.at[2] + c.radius)])
    }
    return b
}

function moth() {
    const b = shell(new VoxelBuilder(), room("moth"))
    const lamps = [0xff5c5c, 0xffc53d, 0x5cff9d]
    for (const side of [-1, 1]) {
        const [x0, x1] = side < 0 ? [-5.5, -3.5] : [3.5, 5.5]
        b.solid([x0, 0, -100], [x1, 3, -94], tiles(0x2b2f3a, 0x323745, 50))
        // relay lamps on the face toward the aisle
        const face = side < 0 ? x1 - T : x0
        for (let z = -99.5; z < -94; z += 1) {
            b.deco([face, 2, z], [face + T, 2.5, z + 0.5], lamps[Math.abs(Math.round(z * 2)) % 3], true)
        }
    }
    return b
}

/** Difference Engine columns (x centres); the model draws the wheels. */
export const DIFF_COLUMNS = [-13, -11.5, -10]

function engine() {
    const b = shell(new VoxelBuilder(), room("engine"))
    // Difference Engine plinth and its columns' colliders
    b.solid([-14.5, 0, -119.5], [-8.5, 0.5, -116.5], 0x2b2f3a)
    for (const x of DIFF_COLUMNS) b.collider([x - 0.5, 0.5, -118.5], [x + 0.5, 4.5, -117.5])
    // Ada's desk, her Notes floating above it
    b.solid([10, 0, -119], [13, 1, -117], planks(0x6b3e26, 60))
    for (let i = 0; i < 3; i++) b.deco([10.5 + i, 2 + i * 0.5, -118.5], [11 + i, 2.5 + i * 0.5, -118], 0xf2e6c9, true)
    // Ada's balcony: she watches the fight from here, behind glass (ADR-0013)
    const oak = planks(0x6b3e26, 61)
    b.solid([9, 2.5, -135.5], [15, 3, -130.5], oak)
    b.solid([9, 0, -131], [9.5, 2.5, -130.5], 0x4a2c1a).solid([14.5, 0, -131], [15, 2.5, -130.5], 0x4a2c1a)
    b.deco([9, 3, -130.5], [15, 4.5, -130], (x, y) => (y === 6 || x % 4 === 0 ? 0x8fb8c4 : 0xd8f4ff), true)
    return b
}

export const STATIONS: V3[] = [-148, -158, -168].flatMap((z) => [-19, 19].map((x) => [x, 0, z] as V3))

function hall() {
    const b = shell(new VoxelBuilder(), room("hall"), { closedExit: true })
    pots(b, room("hall"))
    for (const [x, , z] of STATIONS) {
        b.solid([x - 1, 0, z - 0.5], [x + 1, 2, z + 0.5], 0x2b2f3a)
        const face = x > 0 ? x - 1 : x + 1 - T
        b.deco([face, 1, z - 0.5], [face + T, 2, z + 0.5], 0x19c3d6, true)
    }
    // notice board with pinned notes
    b.solid([-16, 0, -141.5], [-12, 3, -141], planks(0x6b3e26, 70))
    b.deco([-15.5, 1, -141.5], [-12.5, 2.5, -141], (x, y) => ((x + y) % 2 === 0 ? 0xf2e6c9 : 0x6b3e26))
    b.deco([-16.5, 0, -141.5], [-11.5, 0.5, -141], 0x4a2c1a)
    // the Exam Gate's pillars
    for (const x of [-4, 3]) b.solid([x, 0, -176.5], [x + 1, 6, -175.5], bricks(0xd7c8f5, 71))
    b.deco([-4, 6, -176.5], [4, 6.5, -175.5], 0xb497f0)
    return b
}

/** Every room's architecture, keyed by room. Built on first use. */
let built: Record<RoomId, VoxelBuilder> | null = null
export function floorArchitecture(): Record<RoomId, VoxelBuilder> {
    built ??= { arrival: arrival(), abacus: abacus(), loom: loom(), archive: archive(), gears: gears(), moth: moth(), engine: engine(), hall: hall() }
    return built
}

/** A closed door filling a room's exit doorway. */
const doors = new Map<string, VoxelBuilder>()
export function doorFor(r: RoomDef, glow: boolean): VoxelBuilder {
    const key = `${r.id}:${glow}`
    let d = doors.get(key)
    if (!d) {
        d = new VoxelBuilder()
        if (glow) d.collider([-DH, 0, r.zMin], [DH, DOOR_HEIGHT, r.zMin + T]).deco([-DH, 0, r.zMin], [DH, DOOR_HEIGHT, r.zMin + T], (x, y) => ((x + y) % 2 ? 0x19c3d6 : 0x7df0ff), true)
        else d.solid([-DH, 0, r.zMin], [DH, DOOR_HEIGHT, r.zMin + T], (x, y, z) => shade(0x7a5a2a, (hash3(x, 0, z, 80) * 2 - 1) * 0.1 - (y % 4 === 0 ? 0.12 : 0)))
        doors.set(key, d)
    }
    return d
}
