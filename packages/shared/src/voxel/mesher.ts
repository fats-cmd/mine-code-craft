// Voxels -> one triangle mesh, with hidden faces culled and ambient
// occlusion baked into vertex colours. This is what gives the clean
// "voxel diorama" look (soft darkening in creases and corners) without any
// textures and without a post-processing AO pass: the shading is free at
// render time. Pure data in, typed arrays out; three.js lives in the client.
//
// AO follows Mikola Lysenko, "Ambient occlusion for Minecraft-like worlds"
// (0fps.net, 2013): each face corner looks at its two edge neighbours and the
// diagonal one in front of the face.

/** A colour as 0xRRGGBB (sRGB). */
export type VoxelColor = number

export class VoxelGrid {
  private cells = new Map<number, VoxelColor>()

  static key(x: number, y: number, z: number): number {
    // 10 bits per axis, offset so -512..511 are valid. Plenty for one model or room.
    return ((x + 512) << 20) | ((y + 512) << 10) | (z + 512)
  }

  set(x: number, y: number, z: number, color: VoxelColor): this {
    this.cells.set(VoxelGrid.key(x, y, z), color)
    return this
  }

  delete(x: number, y: number, z: number): this {
    this.cells.delete(VoxelGrid.key(x, y, z))
    return this
  }

  get(x: number, y: number, z: number): VoxelColor | undefined {
    return this.cells.get(VoxelGrid.key(x, y, z))
  }

  has(x: number, y: number, z: number): boolean {
    return this.cells.has(VoxelGrid.key(x, y, z))
  }

  get size(): number {
    return this.cells.size
  }

  /** Fill an inclusive box. `color` may vary per voxel (for subtle noise). */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: VoxelColor | ((x: number, y: number, z: number) => VoxelColor)): this {
    const [ax, bx] = x0 <= x1 ? [x0, x1] : [x1, x0]
    const [ay, by] = y0 <= y1 ? [y0, y1] : [y1, y0]
    const [az, bz] = z0 <= z1 ? [z0, z1] : [z1, z0]
    for (let x = ax; x <= bx; x++)
      for (let y = ay; y <= by; y++)
        for (let z = az; z <= bz; z++) this.set(x, y, z, typeof color === 'function' ? color(x, y, z) : color)
    return this
  }

  *entries(): IterableIterator<[number, number, number, VoxelColor]> {
    for (const [k, c] of this.cells) yield [((k >> 20) & 1023) - 512, ((k >> 10) & 1023) - 512, (k & 1023) - 512, c]
  }
}

export interface VoxelMeshData {
  positions: Float32Array
  normals: Float32Array
  /** sRGB 0..1, already darkened by ambient occlusion. Convert to linear when uploading. */
  colors: Float32Array
  indices: Uint32Array
}

export interface MeshOptions {
  /** World size of one voxel. */
  scale?: number
  /** Shift applied to every voxel before scaling, e.g. to put a model's pivot at the origin. */
  offset?: [number, number, number]
  /** Brightness by number of occluders at a corner (0 = open). Index 3 = fully tucked in. */
  aoLevels?: [number, number, number, number]
  /** Merge matching, evenly lit neighbouring faces into larger quads. Default true. */
  merge?: boolean
  /** Skip downward faces of voxels below this y (voxel units): the underside of the ground. */
  hideDownBelow?: number
}

export const DEFAULT_AO: [number, number, number, number] = [1, 0.82, 0.68, 0.56]

// For each face: normal, then the 4 corners as offsets in the voxel cube,
// counter-clockwise when seen from outside.
const FACES: { n: [number, number, number]; c: [number, number, number][] }[] = [
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
]

/** Occluder count (0..3) for one face corner, per Lysenko: two sides and the diagonal. */
function cornerOcclusion(grid: VoxelGrid, x: number, y: number, z: number, n: [number, number, number], corner: [number, number, number]): number {
  // Step from the voxel into the cell in front of the face, then toward the corner along the two in-plane axes.
  const fx = x + n[0]
  const fy = y + n[1]
  const fz = z + n[2]
  const d = corner.map((c, i) => (n[i] !== 0 ? 0 : c === 1 ? 1 : -1)) as [number, number, number]
  const axes = [0, 1, 2].filter((i) => n[i] === 0)
  const s1 = [0, 0, 0]
  const s2 = [0, 0, 0]
  s1[axes[0]] = d[axes[0]]
  s2[axes[1]] = d[axes[1]]
  const side1 = grid.has(fx + s1[0], fy + s1[1], fz + s1[2])
  const side2 = grid.has(fx + s2[0], fy + s2[1], fz + s2[2])
  if (side1 && side2) return 3
  const diag = grid.has(fx + d[0], fy + d[1], fz + d[2])
  return Number(side1) + Number(side2) + Number(diag)
}

interface Face {
  x: number
  y: number
  z: number
  color: VoxelColor
  occ: [number, number, number, number]
  /** All four corners equally occluded: the face may merge with matching neighbours. */
  flat: boolean
  done: boolean
}

export function meshVoxels(grid: VoxelGrid, options: MeshOptions = {}): VoxelMeshData {
  const scale = options.scale ?? 1
  const [ox, oy, oz] = options.offset ?? [0, 0, 0]
  const ao = options.aoLevels ?? DEFAULT_AO
  const merge = options.merge ?? true
  const hideDownBelow = options.hideDownBelow ?? -Infinity
  const pos: number[] = []
  const nor: number[] = []
  const col: number[] = []
  const idx: number[] = []

  FACES.forEach((face, fi) => {
    const n = face.n
    const d = n.findIndex((v) => v !== 0)
    const u = (d + 1) % 3
    const v = (d + 2) % 3

    // Every visible face pointing this way.
    const faces = new Map<number, Face>()
    for (const [x, y, z, color] of grid.entries()) {
      if (grid.has(x + n[0], y + n[1], z + n[2])) continue // hidden behind a neighbour
      if (fi === 3 && y < hideDownBelow) continue // underside of the ground: never seen
      const occ = face.c.map((c) => cornerOcclusion(grid, x, y, z, n, c)) as Face['occ']
      const flat = occ[0] === occ[1] && occ[1] === occ[2] && occ[2] === occ[3]
      faces.set(VoxelGrid.key(x, y, z), { x, y, z, color, occ, flat, done: false })
    }

    // Greedy merge (Lysenko, "Meshing in a Minecraft game", 0fps 2012): grow each
    // flat face along u, then along v, while the neighbours match exactly. Faces
    // with an AO gradient stay single so the gradient survives.
    const order = [...faces.values()].sort((a, b) => {
      const pa = [a.x, a.y, a.z]
      const pb = [b.x, b.y, b.z]
      return pa[d] - pb[d] || pa[v] - pb[v] || pa[u] - pb[u]
    })
    const at = (f: Face, du: number, dv: number) => {
      const p = [f.x, f.y, f.z]
      p[u] += du
      p[v] += dv
      return faces.get(VoxelGrid.key(p[0], p[1], p[2]))
    }
    const same = (a: Face, b: Face | undefined) => !!b && !b.done && b.flat && b.color === a.color && b.occ[0] === a.occ[0]

    for (const f of order) {
      if (f.done) continue
      let w = 1
      let h = 1
      if (merge && f.flat) {
        while (same(f, at(f, w, 0))) w++
        grow: for (;;) {
          for (let i = 0; i < w; i++) if (!same(f, at(f, i, h))) break grow
          h++
        }
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) at(f, i, j)!.done = true
      }
      f.done = true

      const r = ((f.color >> 16) & 255) / 255
      const g = ((f.color >> 8) & 255) / 255
      const b = (f.color & 255) / 255
      const base = pos.length / 3
      const origin = [f.x, f.y, f.z]
      for (let k = 0; k < 4; k++) {
        const c = face.c[k]
        const p = [0, 1, 2].map((a) => origin[a] + c[a] * (a === u ? w : a === v ? h : 1))
        pos.push((p[0] + ox) * scale, (p[1] + oy) * scale, (p[2] + oz) * scale)
        nor.push(n[0], n[1], n[2])
        const lum = ao[f.occ[k]]
        col.push(r * lum, g * lum, b * lum)
      }
      // Split the quad along the diagonal that keeps the AO gradient symmetric.
      const o = f.occ
      if (o[0] + o[2] > o[1] + o[3]) idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base)
      else idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
  })

  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(nor),
    colors: new Float32Array(col),
    indices: new Uint32Array(idx),
  }
}

/** Deterministic 0..1 noise for a voxel coordinate: same input, same output, every time. */
export function hash3(x: number, y: number, z: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

/** Nudge a colour's brightness by up to ±amount, keeping hue: the subtle variation in the references. */
export function shade(color: VoxelColor, amount: number): VoxelColor {
  const f = 1 + amount
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)))
  return (c((color >> 16) & 255) << 16) | (c((color >> 8) & 255) << 8) | c(color & 255)
}

/** A fill function: `base` colour with deterministic brightness variation of ±spread. */
export function varied(base: VoxelColor, spread = 0.06, seed = 0) {
  return (x: number, y: number, z: number) => shade(base, (hash3(x, y, z, seed) * 2 - 1) * spread)
}
