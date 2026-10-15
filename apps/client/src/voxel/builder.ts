import { VoxelGrid, hash3, shade, varied, type VoxelColor } from "@mcc/shared"

// Architecture on a 0.5 m voxel grid. `solid()` adds a box collider and fills
// the same box with voxels, so what you see is exactly what you bump into.
// Coordinates are metres; boxes must sit on the 0.5 m grid.

export const CELL = 0.5

export type V3 = [number, number, number]
/** A colour, or one per voxel (cell indices in, 0xRRGGBB out). */
export type Paint = VoxelColor | ((x: number, y: number, z: number) => VoxelColor)

export interface BoxCollider {
    /** Centre, metres. */
    at: V3
    /** Half extents, metres. */
    half: V3
}

const lo = (m: number) => Math.round(m / CELL)
const hi = (m: number) => Math.round(m / CELL) - 1

export class VoxelBuilder {
    readonly lit = new VoxelGrid()
    /** Unlit voxels: they read as light sources (threads, screens, gates). */
    readonly glow = new VoxelGrid()
    readonly colliders: BoxCollider[] = []

    /** A box you can stand on and bump into. */
    solid(min: V3, max: V3, paint: Paint): this {
        this.collider(min, max)
        return this.deco(min, max, paint)
    }

    /** An invisible collider (for props drawn by a finer model). */
    collider(min: V3, max: V3): this {
        const a = min.map((v, i) => Math.min(v, max[i])) as V3
        const b = min.map((v, i) => Math.max(v, max[i])) as V3
        this.colliders.push({
            at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
            half: [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2, (b[2] - a[2]) / 2],
        })
        return this
    }

    /** Voxels only: walk-through decoration. */
    deco(min: V3, max: V3, paint: Paint, glow = false): this {
        this.cells(min, max, (x, y, z) => {
            const c = typeof paint === "function" ? paint(x, y, z) : paint
            ;(glow ? this.glow : this.lit).set(x, y, z, c)
            ;(glow ? this.lit : this.glow).delete(x, y, z)
        })
        return this
    }

    /** Remove voxels (not colliders): doorways, windows, inlays. */
    clear(min: V3, max: V3): this {
        this.cells(min, max, (x, y, z) => {
            this.lit.delete(x, y, z)
            this.glow.delete(x, y, z)
        })
        return this
    }

    private cells(min: V3, max: V3, fn: (x: number, y: number, z: number) => void) {
        const x0 = lo(Math.min(min[0], max[0])), x1 = hi(Math.max(min[0], max[0]))
        const y0 = lo(Math.min(min[1], max[1])), y1 = hi(Math.max(min[1], max[1]))
        const z0 = lo(Math.min(min[2], max[2])), z1 = hi(Math.max(min[2], max[2]))
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) fn(x, y, z)
    }
}

/** A small voxel model (props, henchmen) on its own, finer grid. Drawn only, never collided with. */
export class VoxelModel {
    readonly lit = new VoxelGrid()
    readonly glow = new VoxelGrid()
    readonly scale: number
    constructor(scale: number) {
        this.scale = scale
    }
}

// ---- paints -------------------------------------------------------------

// Variation is per tile, plank or brick, never per voxel: whole tiles then
// mesh as single quads (see meshVoxels' merge), which keeps big floors cheap.

/** 1 m floor tiles in two tones, each tile a touch different. */
export const tiles = (a: VoxelColor, b: VoxelColor, seed = 0) => (x: number, y: number, z: number) => {
    const tx = Math.floor(x / 2)
    const tz = Math.floor(z / 2)
    return shade((tx + tz) & 1 ? a : b, (hash3(tx, y, tz, seed) * 2 - 1) * 0.04)
}

/** Planks running along z: every 0.5 m strip its own shade, with joints every 3 m. */
export const planks = (base: VoxelColor, seed = 0) => (x: number, y: number, z: number) => {
    const plank = hash3(x, y, Math.floor((z + x * 3) / 6), seed)
    return shade(base, (plank * 2 - 1) * 0.08)
}

/** Running-bond bricks (1 m x 0.5 m), darker toward the floor like the references' walls. */
export const bricks = (base: VoxelColor, seed = 0) => (x: number, y: number, z: number) => {
    const off = y & 1
    const brick = hash3(Math.floor((x + off) / 2), y, Math.floor((z + off) / 2), seed)
    const ground = Math.max(0, 3 - y) * 0.04
    return shade(base, (brick * 2 - 1) * 0.06 - ground)
}

export { varied }
