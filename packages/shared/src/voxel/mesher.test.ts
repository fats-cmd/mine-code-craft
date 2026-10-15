import { describe, expect, it } from 'vitest'
import { DEFAULT_AO, VoxelGrid, hash3, meshVoxels, shade, varied } from './mesher.ts'

const faces = (grid: VoxelGrid, merge = false) => meshVoxels(grid, { merge }).indices.length / 6

describe('VoxelGrid', () => {
  it('stores, reads and deletes voxels, including negative coordinates', () => {
    const g = new VoxelGrid().set(-3, 0, 511, 0xff0000).set(5, -512, 0, 0x00ff00)
    expect(g.get(-3, 0, 511)).toBe(0xff0000)
    expect(g.get(5, -512, 0)).toBe(0x00ff00)
    expect(g.has(0, 0, 0)).toBe(false)
    g.delete(-3, 0, 511)
    expect(g.size).toBe(1)
  })
  it('entries round-trip coordinates', () => {
    const g = new VoxelGrid().set(-7, 3, -100, 1)
    expect([...g.entries()]).toEqual([[-7, 3, -100, 1]])
  })
  it('box fills inclusive ranges in either order', () => {
    expect(new VoxelGrid().box(2, 0, 0, 0, 1, 1, 5).size).toBe(3 * 2 * 2)
  })
})

describe('meshVoxels', () => {
  it('a lone voxel has 6 faces', () => {
    const m = meshVoxels(new VoxelGrid().set(0, 0, 0, 0xffffff))
    expect(m.indices.length).toBe(36)
    expect(m.positions.length).toBe(24 * 3)
  })
  it('touching faces are culled: 2 voxels = 10 faces, a 3x3x3 cube = 54', () => {
    expect(faces(new VoxelGrid().set(0, 0, 0, 1).set(1, 0, 0, 1))).toBe(10)
    expect(faces(new VoxelGrid().box(0, 0, 0, 2, 2, 2, 1))).toBe(54)
  })
  it('merges flat, same-coloured faces: a 3x3x3 cube is 6 quads', () => {
    expect(faces(new VoxelGrid().box(0, 0, 0, 2, 2, 2, 1), true)).toBe(6)
    expect(faces(new VoxelGrid().set(0, 0, 0, 1).set(1, 0, 0, 1), true)).toBe(6)
  })
  it('does not merge across a colour change', () => {
    // two colours side by side: the top, bottom, front and back can't span both
    expect(faces(new VoxelGrid().set(0, 0, 0, 1).set(1, 0, 0, 2), true)).toBe(10)
  })
  it('a merged quad covers exactly the merged area', () => {
    const m = meshVoxels(new VoxelGrid().box(0, 0, 0, 3, 0, 1, 1))
    const xs = [...m.positions].filter((_, i) => i % 3 === 0)
    const zs = [...m.positions].filter((_, i) => i % 3 === 2)
    expect([Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]).toEqual([0, 4, 0, 2])
    expect(m.indices.length / 6).toBe(6)
  })
  it('keeps AO gradients: faces next to an occluder stay unmerged', () => {
    // a plate with one voxel on top: the plate's top can't be one quad
    const g = new VoxelGrid().box(-2, 0, -2, 2, 0, 2, 1).set(0, 1, 0, 1)
    const tops = (m: ReturnType<typeof meshVoxels>) => {
      let n = 0
      for (let i = 0; i < m.normals.length; i += 12) if (m.normals[i + 1] === 1) n++
      return n
    }
    const merged = tops(meshVoxels(g))
    expect(merged).toBeGreaterThan(1)
    expect(merged).toBeLessThan(tops(meshVoxels(g, { merge: false })))
  })
  it('can hide the underside of the ground', () => {
    const g = new VoxelGrid().box(0, -1, 0, 1, -1, 1, 1)
    expect(faces(g)).toBe(16) // 4 top, 4 bottom, 8 sides
    expect(meshVoxels(g, { merge: false, hideDownBelow: 0 }).indices.length / 6).toBe(12)
  })
  it('scale and offset place vertices', () => {
    const m = meshVoxels(new VoxelGrid().set(0, 0, 0, 1), { scale: 0.5, offset: [-1, 0, 0] })
    const xs = [...m.positions].filter((_, i) => i % 3 === 0)
    expect(Math.min(...xs)).toBe(-0.5)
    expect(Math.max(...xs)).toBe(0)
  })
  it('an open voxel is not darkened', () => {
    const m = meshVoxels(new VoxelGrid().set(0, 0, 0, 0xffffff))
    expect([...m.colors].every((c) => c === 1)).toBe(true)
  })
  it('a voxel sitting in a corner gets AO where it meets the walls', () => {
    // floor plate with a voxel on it: the bottom edges of the voxel's side faces touch the floor
    const g = new VoxelGrid().box(-2, 0, -2, 2, 0, 2, 0xffffff).set(0, 1, 0, 0xffffff)
    const m = meshVoxels(g)
    // the floor's top face corners next to the voxel are occluded by it
    const darkest = Math.min(...m.colors)
    expect(darkest).toBeLessThan(1)
    expect(darkest).toBeGreaterThanOrEqual(DEFAULT_AO[3])
  })
  it('a fully tucked-in corner uses the darkest level', () => {
    // an L of three voxels around an empty corner cell, seen from above
    const g = new VoxelGrid().set(0, 0, 0, 0xffffff).set(1, 1, 0, 0xffffff).set(0, 1, 1, 0xffffff)
    expect(Math.min(...meshVoxels(g).colors)).toBeCloseTo(DEFAULT_AO[3])
  })
  it('every triangle winds outward (its geometric normal matches the face normal), whichever diagonal AO picks', () => {
    const g = new VoxelGrid().box(-1, 0, -1, 1, 0, 1, 1).set(0, 1, 0, 1).set(1, 1, 1, 1)
    const m = meshVoxels(g)
    const p = (i: number) => [m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]]
    for (let t = 0; t < m.indices.length; t += 3) {
      const [a, b, c] = [p(m.indices[t]), p(m.indices[t + 1]), p(m.indices[t + 2])]
      const e1 = b.map((v, i) => v - a[i])
      const e2 = c.map((v, i) => v - a[i])
      const cross = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
      const n = [m.normals[m.indices[t] * 3], m.normals[m.indices[t] * 3 + 1], m.normals[m.indices[t] * 3 + 2]]
      expect(cross[0] * n[0] + cross[1] * n[1] + cross[2] * n[2]).toBeGreaterThan(0)
    }
  })

  it('colour is carried through per voxel', () => {
    const m = meshVoxels(new VoxelGrid().set(0, 0, 0, 0xff0000))
    expect([m.colors[0], m.colors[1], m.colors[2]]).toEqual([1, 0, 0])
  })
})

describe('colour helpers', () => {
  it('hash3 is deterministic and in 0..1', () => {
    expect(hash3(1, 2, 3)).toBe(hash3(1, 2, 3))
    expect(hash3(1, 2, 3)).not.toBe(hash3(3, 2, 1))
    for (let i = 0; i < 100; i++) {
      const h = hash3(i, -i, i * 7, 3)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(1)
    }
  })
  it('shade brightens and darkens, clamped', () => {
    expect(shade(0x808080, 0.5)).toBe(0xc0c0c0)
    expect(shade(0x808080, -1)).toBe(0)
    expect(shade(0xffffff, 1)).toBe(0xffffff)
  })
  it('varied stays within the spread', () => {
    const f = varied(0x808080, 0.1)
    for (let i = 0; i < 50; i++) {
      const c = (f(i, i * 3, -i) >> 16) & 255
      expect(c).toBeGreaterThanOrEqual(115)
      expect(c).toBeLessThanOrEqual(141)
    }
  })
})
