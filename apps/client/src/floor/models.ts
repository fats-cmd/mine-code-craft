import { hash3, shade, varied } from "@mcc/shared"
import { VoxelModel } from "../voxel/builder"

// Props and henchmen on finer voxel grids than the architecture, so they
// read as objects rather than walls. Each model is built once and cached;
// its origin is where it stands (or its centre, for spinning things).

const cache = new Map<string, VoxelModel>()
function cached(key: string, build: () => VoxelModel): VoxelModel {
    let m = cache.get(key)
    if (!m) cache.set(key, (m = build()))
    return m
}

/** A flat disc or ring lying on the floor, `r` metres across the outside. */
export const floorRing = (outer: number, inner: number, color: number, glow: boolean) =>
    cached(`ring:${outer}:${inner}:${color}:${glow}`, () => {
        const m = new VoxelModel(0.125)
        const ro = outer / 0.125
        const ri = inner / 0.125
        const n = Math.ceil(ro)
        for (let x = -n; x < n; x++)
            for (let z = -n; z < n; z++) {
                const d = Math.hypot(x + 0.5, z + 0.5)
                if (d <= ro && d >= ri) (glow ? m.glow : m.lit).set(x, 0, z, shade(color, d > ro - 1.5 ? 0.15 : 0))
            }
        return m
    })

/** A cog in the y-z plane (it faces along x), spun about x. */
export const cog = (radius: number, color = 0xe0a52e, thick = 2) =>
    cached(`cog:${radius}:${color}:${thick}`, () => {
        const m = new VoxelModel(0.25)
        const R = radius / 0.25
        const teeth = Math.max(6, Math.round(R * 1.1))
        const n = Math.ceil(R + 2)
        const c = varied(color, 0.06, Math.round(radius * 10))
        for (let y = -n; y < n; y++)
            for (let z = -n; z < n; z++) {
                const d = Math.hypot(y + 0.5, z + 0.5)
                const a = Math.atan2(y + 0.5, z + 0.5)
                const tooth = Math.cos(a * teeth) > 0.2
                const inside = d <= R - 0.3 || (tooth && d <= R + 1.2)
                if (!inside || d < R * 0.22) continue
                const spoke = d < R * 0.75 && d > R * 0.35 && Math.cos(a * 3) < 0.6 // cut-outs between three spokes
                if (spoke) continue
                for (let x = -thick / 2; x < thick / 2; x++) m.lit.set(x, y, z, d < R * 0.35 ? shade(color, -0.2) : c(x, y, z))
            }
        for (let x = -thick / 2 - 1; x < thick / 2 + 1; x++) m.lit.box(x, -1, -1, x, 0, 0, 0x5a4a1a) // axle
        return m
    })

/** A torus in the x-y plane: the Exam Gate. */
export const gateRing = () =>
    cached("gate", () => {
        const m = new VoxelModel(0.25)
        const R = 2.6 / 0.25
        const r = 0.35 / 0.25 + 0.5
        const n = Math.ceil(R + r)
        for (let x = -n; x < n; x++)
            for (let y = -n; y < n; y++)
                for (let z = -2; z < 2; z++) {
                    const ring = Math.hypot(x + 0.5, y + 0.5) - R
                    if (Math.hypot(ring, z + 0.5) <= r) m.glow.set(x, y, z, hash3(x, y, z, 3) > 0.5 ? 0xc45bff : 0xe2a8ff)
                }
        return m
    })

/** The loom's warp threads. */
export const threads = () =>
    cached("threads", () => {
        const m = new VoxelModel(0.125)
        for (let i = -14; i <= 14; i += 2) m.glow.box(i, 0, 0, i, 25, 0, i % 4 === 0 ? 0x3fe0e8 : 0x9ff6fa)
        return m
    })

/** A Difference Engine column: stacked number wheels on a shaft. */
export const diffColumn = (lit: boolean) =>
    cached(`diff:${lit}`, () => {
        const m = new VoxelModel(0.125)
        const brass = lit ? 0xe0b13a : 0x5a4a1a
        for (let w = 0; w < 6; w++) {
            const y0 = w * 5 + 1
            for (let x = -4; x < 4; x++)
                for (let z = -4; z < 4; z++) {
                    if (Math.hypot(x + 0.5, z + 0.5) > 4) continue
                    for (let y = y0; y < y0 + 4; y++) m.lit.set(x, y, z, shade(brass, y === y0 + 3 ? 0.12 : (hash3(x, y, z, w) * 2 - 1) * 0.06))
                }
            // digits: dark marks on the front of each wheel
            m.lit.set(-1, y0 + 1, 3, 0x1b1b1f).set(0, y0 + 2, 3, 0x1b1b1f).set(1, y0 + 1, 3, 0x1b1b1f)
        }
        m.lit.box(-1, 0, -1, 0, 31, 0, 0x2b2f3a)
        return m
    })

/** The Analytical Engine: a frame of rods that lights up when the Examiners are beaten. */
export const analyticalEngine = (booted: boolean) =>
    cached(`ae:${booted}`, () => {
        const m = new VoxelModel(0.25)
        const [hx, hy, hz] = [20, 12, 6] // half extents in voxels: 10 x 6 x 3 m
        const rod = booted ? 0x6fe9f5 : 0x3a5560
        const grid = booted ? m.glow : m.lit
        for (let x = -hx; x < hx; x++)
            for (let y = -hy; y < hy; y++)
                for (let z = -hz; z < hz; z++) {
                    const onX = x === -hx || x === hx - 1 || x % 5 === 0
                    const onY = y === -hy || y === hy - 1 || y % 6 === 0
                    const onZ = z === -hz || z === hz - 1
                    // edges of the cells: two of three axes on a grid line
                    if (Number(onX) + Number(onY) + Number(onZ) >= 2) grid.set(x, y, z, shade(rod, (hash3(x, y, z, 9) * 2 - 1) * 0.08))
                }
        return m
    })

/** A potted tree for the diorama corners. */
export const tree = (seed: number) =>
    cached(`tree:${seed}`, () => {
        const m = new VoxelModel(0.125)
        m.lit.box(-3, 0, -3, 2, 3, 2, varied(0xb5653d, 0.05, seed)) // pot
        m.lit.box(-3, 3, -3, 2, 3, 2, 0x5b3a22) // soil
        m.lit.box(-1, 4, -1, 0, 13, 0, 0x7a4a2a) // trunk
        const leaves = [0x5fbf4a, 0x4aa63a, 0x7bd35a]
        const blobs: [number, number, number, number][] = [
            [0, 16, 0, 5],
            [-3, 14, 2, 3.5],
            [3, 15, -2, 3.5],
            [1, 19, 1, 3],
        ]
        for (const [cx, cy, cz, r] of blobs) {
            const n = Math.ceil(r)
            for (let x = -n; x <= n; x++)
                for (let y = -n; y <= n; y++)
                    for (let z = -n; z <= n; z++) {
                        if (Math.hypot(x, y, z) > r + (hash3(x, y, z, seed) - 0.5)) continue
                        const top = y > r * 0.3 ? 0.08 : y < -r * 0.3 ? -0.1 : 0
                        m.lit.set(cx + x, cy + y, cz + z, shade(leaves[Math.floor(hash3(x, y, z, seed + 1) * 3)], top))
                    }
        }
        return m
    })

/** The Guide: for now a small glowing cube with a face. */
export const guide = () =>
    cached("guide", () => {
        const m = new VoxelModel(0.06)
        m.glow.box(-2, -2, -2, 1, 1, 1, varied(0xffd76a, 0.08, 4))
        m.lit.set(-1, 0, 2, 0x3b2a20).set(0, 0, 2, 0x3b2a20)
        return m
    })

// ---- henchmen (centred on their hover point) ------------------------------

const EYE = 0x1b1b1f

function eyes(m: VoxelModel, y: number, z: number, gap = 1) {
    m.lit.set(-gap - 1, y, z, EYE).set(gap, y, z, EYE)
}

export const henchman = (id: string) =>
    cached(`h:${id}`, () => {
        const m = new VoxelModel(0.1)
        if (id === "weftdart") {
            // a loom shuttle: a pointed spindle, cyan with a thread trailing
            for (let y = -6; y < 6; y++) {
                const r = 3.2 * Math.cos(((y + 0.5) / 6) * (Math.PI / 2))
                for (let x = -4; x < 4; x++)
                    for (let z = -4; z < 4; z++) if (Math.hypot(x + 0.5, z + 0.5) <= r) m.lit.set(x, y, z, Math.abs(y + 0.5) > 4 ? 0xf2f2f2 : 0x19c3d6)
            }
            eyes(m, 1, 2)
            m.glow.box(0, -9, 0, 0, -7, 0, 0x9ff6fa)
        } else if (id === "holloquy") {
            m.lit.box(-4, -6, 0, 4, 6, 0, (x, y) => (hash3(x, y, 0, 7) < 0.2 && Math.abs(y) < 5 && y !== 2 ? 0x8a6a3a : 0xf2e6c9))
            m.lit.delete(4, 6, 0).delete(3, 6, 0) // the clipped corner
            eyes(m, 2, 1)
        } else if (id.startsWith("cogsnap")) {
            const color = id.endsWith("tock") ? 0xe2a227 : 0xc9a227
            for (let x = -6; x < 6; x++)
                for (let y = -6; y < 6; y++) {
                    const d = Math.hypot(x + 0.5, y + 0.5)
                    const tooth = Math.cos(Math.atan2(y + 0.5, x + 0.5) * 8) > 0.2
                    if ((d <= 4.2 || (tooth && d <= 5.6)) && d > 1.5) m.lit.box(x, y, -1, x, y, 0, varied(color, 0.06, 5))
                }
            m.lit.set(-2, 2, 1, EYE).set(1, 2, 1, EYE)
        } else if (id === "firstbug") {
            m.lit.box(-1, -4, -1, 0, 3, 0, 0x5a4a3a) // body
            m.lit.box(-1, 2, 1, 0, 3, 1, 0x5a4a3a)
            eyes(m, 3, 1, 0)
            for (const side of [-1, 1]) {
                for (let x = 1; x <= 6; x++)
                    for (let y = -4; y <= 5; y++) {
                        if (Math.hypot(x - 2, y - 1.5) > 5) continue
                        const wx = side < 0 ? -x - 1 : x
                        const spot = Math.hypot(x - 3.5, y - 2) < 1.2
                        ;(spot ? m.glow : m.lit).set(wx, y, 0, spot ? 0xfff0b0 : shade(0xb9a7ff, (hash3(wx, y, 0, 3) * 2 - 1) * 0.08))
                    }
            }
            m.lit.set(-2, 5, 0, 0x5a4a3a).set(1, 5, 0, 0x5a4a3a).set(-3, 6, 0, 0x5a4a3a).set(2, 6, 0, 0x5a4a3a) // antennae
        }
        return m
    })
