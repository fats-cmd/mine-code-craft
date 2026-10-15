import { VoxelGrid, varied, type Look } from "@mcc/shared"

// A Climber as voxels, split into parts so limbs can swing. 1 voxel = 0.1 m,
// 18 voxels tall to the top of the head (1.8 m, matching the capsule). Each
// part is built around its own pivot (hips for legs, shoulders for arms, the
// neck for the head) so animation is a rotation of that part's group.
//
//      head  y 13..17  (5x5x5, face toward +z)
//      torso y  6..12  (7 wide, 3 deep), arms hang from y 13
//      legs  y  0..6   (3x3 each, x -3..-1 and 1..3)

export const VOXEL = 0.1

export type AvatarPart = "head" | "torso" | "armL" | "armR" | "legL" | "legR"

/** Where each part's pivot sits, in voxels, relative to the feet. */
export const PIVOTS: Record<AvatarPart, [number, number, number]> = {
    head: [0, 13, 0],
    torso: [0, 0, 0],
    armL: [-4.5, 13, 0],
    armR: [4.5, 13, 0],
    legL: [-2, 7, 0],
    legR: [2, 7, 0],
}

/** Extra pieces for the Examiners and other NPCs; Climbers never use these. */
export interface NpcExtras {
    topHat?: boolean
    sideburns?: string
    skirt?: string
}

const hex = (c: string) => parseInt(c.slice(1), 16)
const PANTS = 0x2b2f3a
const SHOES = 0x3b2a20
const EYE = 0x1b1b1f
const GOLD = 0xf5c518
const LENS = 0x7dd3fc

export function buildAvatar(look: Look, npc: NpcExtras = {}): Record<AvatarPart, VoxelGrid> {
    const body = hex(look.body)
    const skin = hex(look.skin)
    const accent = hex(look.accent)
    const cloth = varied(body, 0.05, 1)

    // ---- legs: pivot at the hip, voxels hang below it --------------------
    const leg = (seed: number) => {
        const g = new VoxelGrid()
        g.box(-1, -7, -1, 1, -2, 1, varied(npc.skirt ? hex(npc.skirt) : PANTS, 0.05, seed))
        g.box(-1, -7, -1, 1, -7, 2, SHOES) // feet poke forward a voxel
        return g
    }

    // ---- torso: no pivot offset, built in feet space ---------------------
    const torso = new VoxelGrid()
    torso.box(-3, 7, -1, 3, 12, 1, cloth)
    torso.box(-3, 6, -1, 3, 6, 1, PANTS) // hips, closes the gap between the legs
    torso.box(-3, 7, -1, 3, 7, 1, varied(0x1b1b1f, 0.04, 2)) // belt
    torso.box(-1, 12, 1, 1, 12, 1, skin) // collar opening
    if (npc.skirt) {
        // a flared skirt: wider rings toward the floor, over the legs
        const s = varied(hex(npc.skirt), 0.05, 3)
        for (let y = 0; y <= 6; y++) {
            const r = 4 - Math.floor(y / 3)
            torso.box(-r, y, -r + 1, r, y, r - 1, s)
        }
    }

    // ---- arms: pivot at the shoulder ------------------------------------
    const arm = (side: -1 | 1) => {
        const g = new VoxelGrid()
        const x0 = side < 0 ? -1 : 0
        g.box(x0, -7, -1, x0 + 1, -1, 0, skin)
        g.box(x0, -3, -1, x0 + 1, -1, 0, cloth) // sleeve
        return g
    }

    // ---- head: pivot at the neck ----------------------------------------
    const head = new VoxelGrid()
    head.box(-2, 0, -2, 2, 4, 2, skin)
    // eyes on the face (z = 2), under any visor
    head.set(-1, 2, 2, EYE).set(1, 2, 2, EYE)
    head.set(0, 1, 2, 0xd08a6a) // a hint of a mouth/nose shadow

    hair(head, look.hair, accent)
    headwear(head, look.headwear, accent)
    visor(head, look.visor)
    if (npc.sideburns) {
        const c = hex(npc.sideburns)
        head.box(-2, 1, 0, -2, 3, 1, c).box(2, 1, 0, 2, 3, 1, c)
    }
    if (npc.topHat) {
        const h = varied(0x1e1e24, 0.05, 9)
        for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) head.delete(x, 5, z)
        head.box(-3, 5, -3, 3, 5, 3, h) // brim
        head.box(-2, 6, -2, 2, 9, 2, h)
        head.box(-2, 6, -2, 2, 6, 2, 0x6b2d2d) // hat band
    }

    return { head, torso, armL: arm(-1), armR: arm(1), legL: leg(4), legR: leg(5) }
}

// Spike voxels for the anime hair, as [x, y, z] above the head (y 5 is the top of the scalp).
const SPIKES: [number, number, number][] = [
    [0, 6, 0], [0, 7, 0], [-1, 6, 1], [1, 6, -1], [1, 7, -1], [-2, 6, -1], [2, 6, 1],
    [-1, 6, -2], [-1, 7, -2], [1, 6, 2], [0, 6, -2], [2, 6, -2], [-2, 6, 2],
    [-3, 5, 0], [-3, 6, 0], [3, 5, 1], [3, 6, 1], [0, 5, -3], [1, 5, -3], [1, 6, -3], [-3, 4, -1], [3, 4, -1],
]

function hair(head: VoxelGrid, kind: Look["hair"], color: number) {
    if (kind === "none") return
    const c = varied(color, 0.08, 7)
    // scalp cap and the back of the head
    head.box(-2, 5, -2, 2, 5, 2, c)
    head.box(-2, 2, -2, 2, 4, -2, c)
    head.box(-2, 4, -2, -2, 4, 2, c).box(2, 4, -2, 2, 4, 2, c)
    if (kind === "spiky") for (const [x, y, z] of SPIKES) head.set(x, y, z, c(x, y, z))
    if (kind === "bun") head.box(-1, 4, -4, 1, 6, -3, c)
    if (kind === "mohawk") {
        for (let x = -2; x <= 2; x += 4) for (let z = -2; z <= 2; z++) head.delete(x, 5, z) // shaved sides
        head.box(0, 5, -3, 0, 7, 2, c).box(0, 8, -1, 0, 8, 1, c)
    }
}

function headwear(head: VoxelGrid, kind: Look["headwear"], color: number) {
    const c = varied(color, 0.05, 8)
    if (kind === "cap") {
        for (let x = -3; x <= 3; x++) for (let y = 6; y <= 8; y++) for (let z = -3; z <= 3; z++) head.delete(x, y, z) // flatten spikes under it
        head.box(-2, 5, -2, 2, 6, 2, c)
        head.box(-2, 5, 3, 2, 5, 4, c) // brim
    }
    if (kind === "headband") {
        for (let x = -2; x <= 2; x++) head.set(x, 3, 2, c(x, 3, 2)).set(x, 3, -2, c(x, 3, -2))
        for (let z = -2; z <= 2; z++) head.set(-2, 3, z, c(-2, 3, z)).set(2, 3, z, c(2, 3, z))
        head.set(-1, 3, -3, c(-1, 3, -3)).set(-1, 2, -4, c(-1, 2, -4)).set(1, 3, -3, c(1, 3, -3)).set(1, 2, -4, c(1, 2, -4))
    }
    if (kind === "crown") {
        for (let i = -2; i <= 2; i++) {
            head.set(i, 6, -2, GOLD).set(i, 6, 2, GOLD).set(-2, 6, i, GOLD).set(2, 6, i, GOLD)
        }
        for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2], [0, 2], [0, -2], [-2, 0], [2, 0]]) head.set(x, 7, z, GOLD)
        head.set(0, 6, 3, 0xe2483d)
    }
}

function visor(head: VoxelGrid, kind: Look["visor"]) {
    if (kind === "band") head.box(-2, 2, 3, 2, 2, 3, EYE).set(-3, 2, 2, EYE).set(3, 2, 2, EYE)
    if (kind === "goggles") {
        head.box(-2, 2, 3, 2, 2, 3, EYE)
        head.set(-1, 2, 3, LENS).set(1, 2, 3, LENS)
        for (let z = -2; z <= 2; z++) head.set(-2, 2, z, EYE).set(2, 2, z, EYE)
    }
    if (kind === "shades") head.set(-1, 2, 3, EYE).set(0, 2, 3, EYE).set(1, 2, 3, EYE)
}
