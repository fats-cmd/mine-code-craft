import { PAINT_COLORS, VoxelGrid, decodePaint, varied, type AvatarPart, type Build, type Look, type VoxModel } from "@mcc/shared"

// A Climber as voxels, split into parts so limbs can swing. 1 voxel = 0.1 m,
// 18 voxels tall to the top of the head (1.8 m, matching the capsule). Each
// part is built around its own pivot (hips for legs, shoulders for arms, the
// neck for the head) so animation is a rotation of that part's group.
//
//      head  y 13..17  (5x5x5, face toward +z)
//      torso y  6..12  (5, 7 or 9 wide by build, 3 deep), arms hang from y 13
//      legs  y  0..6   (2 or 3 wide by build)
//
// Paint marks and hand-made .vox parts use each part's own voxel coordinates,
// so they stay put whatever the animation does.

export const VOXEL = 0.1

export type { AvatarPart }
export const PARTS: AvatarPart[] = ["head", "torso", "armL", "armR", "legL", "legR"]

/** Where each part sits and how it's centred, for one build. */
export interface Rig {
    /** Pivot of each part, in voxels, relative to the feet. */
    pivots: Record<AvatarPart, [number, number, number]>
    /** Shift applied when meshing: odd-width parts are built on whole voxels, so they move half a voxel to centre. */
    offsets: Record<AvatarPart, [number, number, number]>
    /** Torso half width (voxels each side of the centre column). */
    halfWidth: number
    armWidth: 2 | 3
    legWidth: 2 | 3
}

const BUILDS: Record<Build, { halfWidth: number; armWidth: 2 | 3; legWidth: 2 | 3; legX: number }> = {
    slim: { halfWidth: 2, armWidth: 2, legWidth: 2, legX: 1.5 },
    regular: { halfWidth: 3, armWidth: 2, legWidth: 3, legX: 2 },
    broad: { halfWidth: 4, armWidth: 3, legWidth: 3, legX: 2.5 },
}

const half = (w: number): [number, number, number] => (w % 2 ? [-0.5, 0, -0.5] : [0, 0, -0.5])

export function rigFor(build: Build): Rig {
    const b = BUILDS[build]
    const armX = b.halfWidth + 0.5 + b.armWidth / 2
    return {
        pivots: {
            head: [0, 13, 0],
            torso: [0, 0, 0],
            armL: [-armX, 13, 0],
            armR: [armX, 13, 0],
            legL: [-b.legX, 7, 0],
            legR: [b.legX, 7, 0],
        },
        offsets: {
            head: [-0.5, 0, -0.5],
            torso: [-0.5, 0, -0.5],
            armL: half(b.armWidth),
            armR: half(b.armWidth),
            legL: half(b.legWidth),
            legR: half(b.legWidth),
        },
        halfWidth: b.halfWidth,
        armWidth: b.armWidth,
        legWidth: b.legWidth,
    }
}

/** Extra pieces for the Examiners and other NPCs; Climbers never use these. */
export interface NpcExtras {
    topHat?: boolean
    sideburns?: string
}

/** Hand-made parts by name (`hair-flame`), from MagicaVoxel files. See docs/design/CHARACTERS.md. */
export type PartLibrary = Record<string, VoxModel>

const hex = (c: string) => parseInt(c.slice(1), 16)
const EYE = 0x1b1b1f
const GOLD = 0xf5c518
const LENS = 0x7dd3fc
const WHITE = 0xf2f2f2
const BELT = 0x1b1b1f

/** Span of an n-wide part built on whole voxels: [lo, hi] around 0. */
const span = (n: number): [number, number] => (n === 3 ? [-1, 1] : [-1, 0])

export function buildAvatar(look: Look, npc: NpcExtras = {}, library: PartLibrary = {}): { parts: Record<AvatarPart, VoxelGrid>; rig: Rig } {
    const rig = rigFor(look.build)
    const hw = rig.halfWidth
    const skin = hex(look.skin)
    const accent = hex(look.accent)
    const topColor = look.top === "bare" ? skin : hex(look.body)
    // bare skin stays one flat colour; cloth gets a slight weave
    const cloth = look.top === "bare" ? () => skin : varied(topColor, 0.04, 1)
    const pantsColor = hex(look.bottomsColor)
    const pants = varied(pantsColor, 0.04, 2)
    const shoeColor = hex(look.shoesColor)

    // ---- legs: pivot at the hip, voxels hang below it --------------------
    const leg = (outer: -1 | 1) => {
        const g = new VoxelGrid()
        const [x0, x1] = span(rig.legWidth)
        const xo = outer < 0 ? x0 : x1 // the side away from the other leg
        const bottomTo = { pants: -6, baggy: -6, shorts: -3, skirt: -2 }[look.bottoms]
        g.box(x0, -6, -1, x1, -2, 1, skin)
        g.box(x0, bottomTo, -1, x1, -2, 1, pants)
        if (look.bottoms === "baggy") {
            // wide cuffs: one voxel out to the side, front and back
            g.box(xo + outer, -6, -1, xo + outer, -4, 1, pants)
            g.box(x0, -6, -2, x1, -5, -2, pants).box(x0, -6, 2, x1, -5, 2, pants)
        }
        // shoes: the foot pokes forward a voxel
        if (look.shoes === "boots") g.box(x0, -7, -1, x1, -5, 2, varied(shoeColor, 0.04, 3)).box(x0, -5, -1, x1, -5, 1, shade(shoeColor, -0.15))
        else if (look.shoes === "sandals") g.box(x0, -7, -1, x1, -7, 2, skin).box(x0, -7, 1, x1, -7, 1, shoeColor).box(x0, -7, -1, x1, -7, -1, shoeColor)
        else g.box(x0, -7, -1, x1, -7, 2, shoeColor).box(x0, -7, 2, x1, -7, 2, WHITE) // sneakers: white toe cap
        return g
    }

    // ---- torso: no pivot offset, built in feet space ---------------------
    const torso = new VoxelGrid()
    torso.box(-hw, 7, -1, hw, 12, 1, cloth)
    torso.box(-hw, 6, -1, hw, 6, 1, pants) // hips, closes the gap between the legs
    torso.box(-hw, 7, -1, hw, 7, 1, BELT)
    if (look.top !== "bare") torso.box(-1, 12, 1, 1, 12, 1, skin) // collar opening
    if (look.top === "tank") torso.box(-hw, 12, -1, -hw + 1, 12, 1, skin).box(hw - 1, 12, -1, hw, 12, 1, skin)
    if (look.top === "hoodie") {
        torso.box(-hw + 1, 11, -2, hw - 1, 13, -2, cloth) // the hood, bunched behind the neck
        torso.box(-2, 8, 1, 2, 9, 1, shade(topColor, -0.12)) // front pocket
        torso.set(-1, 11, 1, WHITE).set(1, 11, 1, WHITE) // drawstrings
    }
    if (look.top === "jacket") {
        torso.box(0, 8, 1, 0, 12, 1, WHITE) // shirt down the open front
        torso.box(-1, 12, 1, -1, 12, 1, shade(topColor, 0.15)).box(1, 12, 1, 1, 12, 1, shade(topColor, 0.15)) // lapels
    }
    if (look.bottoms === "skirt") {
        // a flared skirt: wider rings toward the knees, over the legs
        const s = varied(pantsColor, 0.04, 3)
        for (let y = 2; y <= 6; y++) {
            const r = hw + 1 - Math.floor((y - 2) / 3)
            torso.box(-r, y, -2, r, y, 2, s)
        }
    }

    // ---- arms: pivot at the shoulder ------------------------------------
    const arm = () => {
        const g = new VoxelGrid()
        const [x0, x1] = span(rig.armWidth)
        g.box(x0, -7, -1, x1, -1, 0, skin)
        const sleeve = { tee: -3, long: -6, hoodie: -6, jacket: -6, tank: 0, bare: 0 }[look.top]
        if (sleeve < 0) g.box(x0, sleeve, -1, x1, -1, 0, cloth)
        if (look.top === "jacket") g.box(x0, -6, -1, x1, -6, 0, shade(topColor, -0.15)) // cuffs
        return g
    }

    // ---- head: pivot at the neck ----------------------------------------
    const head = new VoxelGrid()
    head.box(-2, 0, -2, 2, 4, 2, skin)
    // eyes on the face (z = 2), under any visor
    head.set(-1, 2, 2, EYE).set(1, 2, 2, EYE)
    head.set(0, 1, 2, shade(skin, -0.18)) // a hint of a nose shadow

    const part = library[`hair-${look.hair}`]
    if (part) for (const v of part.voxels) head.set(v.x, v.y, v.z, tint(v.color, accent))
    else hair(head, look.hair, accent)
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

    const parts: Record<AvatarPart, VoxelGrid> = { head, torso, armL: arm(), armR: arm(), legL: leg(-1), legR: leg(1) }

    // ---- paint: recolour voxels the parts already have -----------------
    for (const m of decodePaint(look.paint)) {
        const g = parts[m.part]
        if (g.has(m.x, m.y, m.z)) g.set(m.x, m.y, m.z, hex(PAINT_COLORS[m.color]))
    }
    return { parts, rig }
}

/**
 * Hand-made parts follow the player's colour: grey voxels are tinted with it,
 * #c0c0c0 being exactly that colour, lighter greys highlights, darker greys
 * shadows. Any other colour stays as painted (eyes, metal, gems).
 */
export function tint(color: number, by: number): number {
    const r = (color >> 16) & 255
    if (r !== ((color >> 8) & 255) || r !== (color & 255)) return color
    return shade(by, r / 192 - 1)
}

function shade(c: number, amount: number) {
    const f = 1 + amount
    const k = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)))
    return (k((c >> 16) & 255) << 16) | (k((c >> 8) & 255) << 8) | k(c & 255)
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
    if (kind === "buzz") {
        head.box(-2, 5, -2, 2, 5, 2, varied(shade(color, -0.1), 0.06, 7))
        return
    }
    // scalp cap and the back of the head
    head.box(-2, 5, -2, 2, 5, 2, c)
    head.box(-2, 2, -2, 2, 4, -2, c)
    head.box(-2, 4, -2, -2, 4, 2, c).box(2, 4, -2, 2, 4, 2, c)
    // spiky is the default, and "flame" falls back to it until its .vox part is present
    if (kind === "spiky" || kind === "flame") for (const [x, y, z] of SPIKES) head.set(x, y, z, c(x, y, z))
    if (kind === "bun") head.box(-1, 4, -4, 1, 6, -3, c)
    if (kind === "mohawk") {
        for (let x = -2; x <= 2; x += 4) for (let z = -2; z <= 2; z++) head.delete(x, 5, z) // shaved sides
        head.box(0, 5, -3, 0, 7, 2, c).box(0, 8, -1, 0, 8, 1, c)
    }
    if (kind === "messy") {
        // uneven tufts on top and a fringe over the forehead
        for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) if ((x * 7 + z * 13 + 20) % 3 !== 0) head.set(x, 6, z, c(x, 6, z))
        head.box(-2, 4, 2, 0, 4, 3, c).set(1, 4, 3, c(1, 4, 3))
        head.box(-3, 3, -1, -3, 5, 1, c).box(3, 3, -1, 3, 5, 1, c)
    }
    if (kind === "long") {
        head.box(-3, 0, -3, 3, 5, -3, c) // down the back
        head.box(-3, 1, -2, -3, 5, 1, c).box(3, 1, -2, 3, 5, 1, c) // over the ears
        head.box(-2, 4, 3, 2, 4, 3, c) // fringe
        head.box(-2, 6, -2, 2, 6, 1, c)
    }
}

function headwear(head: VoxelGrid, kind: Look["headwear"], color: number) {
    const c = varied(color, 0.05, 8)
    const flatten = () => {
        for (let x = -3; x <= 3; x++) for (let y = 6; y <= 8; y++) for (let z = -3; z <= 3; z++) head.delete(x, y, z)
    }
    if (kind === "cap") {
        flatten()
        head.box(-2, 5, -2, 2, 6, 2, c)
        head.box(-2, 5, 3, 2, 5, 4, c) // brim
    }
    if (kind === "beanie") {
        flatten()
        head.box(-2, 5, -2, 2, 6, 2, c)
        head.box(-3, 4, -3, 3, 4, 3, shade(color, -0.15)) // the folded band
        for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) head.delete(x, 4, z)
        head.set(0, 7, 0, WHITE) // pom-pom
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
