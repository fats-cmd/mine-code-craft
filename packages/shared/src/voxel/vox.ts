// MagicaVoxel .vox files: read hand-made models, write templates to sculpt on.
// Format: https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt
//
// Axes: MagicaVoxel is z-up and its front view looks at the model's -y side.
// The game is y-up with characters facing +z. So game (x, y, z) =
// (vx, vz, -vy), re-centred so x and z run around 0 and y starts at 0 (the
// floor of the canvas). That is a rotation, not a mirror: left stays left.

import type { VoxelColor } from './mesher.ts'

export interface VoxVoxel {
  x: number
  y: number
  z: number
  color: VoxelColor
  /** Palette slot 1..255, as MagicaVoxel shows it. */
  index: number
}

export interface VoxModel {
  /** Canvas size in game axes: [width (x), height (y), depth (z)]. */
  size: [number, number, number]
  voxels: VoxVoxel[]
}

/** Palette slot that templates use for the reference body. Voxels in it are never imported. */
export const TEMPLATE_INDEX = 255

const tag = (b: Uint8Array, o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])

/** Canvas size in MagicaVoxel axes -> offsets that centre x and z on 0. */
const centre = (sx: number, sy: number) => ({ ox: Math.floor(sx / 2), oz: Math.floor(sy / 2) })

/**
 * Reads the first model in a .vox file. Throws on a file that isn't .vox;
 * unknown chunks (scene graph, materials, layers) are skipped.
 */
export function parseVox(bytes: Uint8Array): VoxModel {
  if (bytes.length < 20 || tag(bytes, 0) !== 'VOX ') throw new Error('not a MagicaVoxel .vox file')
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let size: [number, number, number] | null = null
  let raw: { x: number; y: number; z: number; i: number }[] | null = null
  let palette: number[] | null = null

  // MAIN's children are a flat run of chunks; walk them all.
  let o = 8 + 12 // header, then MAIN's own chunk header (no content)
  while (o + 12 <= bytes.length) {
    const id = tag(bytes, o)
    const content = view.getInt32(o + 4, true)
    const children = view.getInt32(o + 8, true)
    const c = o + 12
    if (id === 'SIZE' && !size) size = [view.getInt32(c, true), view.getInt32(c + 4, true), view.getInt32(c + 8, true)]
    else if (id === 'XYZI' && !raw) {
      const n = view.getInt32(c, true)
      raw = []
      for (let k = 0; k < n; k++) {
        const p = c + 4 + k * 4
        raw.push({ x: bytes[p], y: bytes[p + 1], z: bytes[p + 2], i: bytes[p + 3] })
      }
    } else if (id === 'RGBA') {
      palette = []
      // Entry k holds the colour of palette slot k + 1.
      for (let k = 0; k < 255; k++) palette.push((bytes[c + k * 4] << 16) | (bytes[c + k * 4 + 1] << 8) | bytes[c + k * 4 + 2])
    }
    o = c + content + children
  }
  if (!size || !raw) throw new Error('.vox file has no model')

  const [sx, sy, sz] = size
  const { ox, oz } = centre(sx, sy)
  const voxels: VoxVoxel[] = []
  for (const v of raw) {
    if (v.i === 0 || v.i === TEMPLATE_INDEX) continue
    voxels.push({
      x: v.x - ox,
      y: v.z,
      z: sy - 1 - v.y - oz,
      // Files saved without a palette are rare; show them grey rather than fail.
      color: palette ? palette[v.i - 1] : 0x9aa3ad,
      index: v.i,
    })
  }
  return { size: [sx, sz, sy], voxels }
}

/**
 * Writes one model. `size` is [width, height, depth] in game axes and the
 * voxels use the same centred game coordinates parseVox returns. Colours
 * become palette slots in order of first use (at most 254; slot 255 is
 * reserved for templates and is written as a light grey).
 */
export function writeVox(model: { size: [number, number, number]; voxels: { x: number; y: number; z: number; color: VoxelColor; index?: number }[] }): Uint8Array {
  const [w, h, d] = model.size
  const sx = w
  const sy = d
  const sz = h
  const { ox, oz } = centre(sx, sy)
  const slots = new Map<number, number>()
  const xyzi: number[] = []
  for (const v of model.voxels) {
    let i = v.index === TEMPLATE_INDEX ? TEMPLATE_INDEX : slots.get(v.color)
    if (i === undefined) {
      if (slots.size >= 254) throw new Error('more than 254 colours')
      i = slots.size + 1
      slots.set(v.color, i)
    }
    const vx = v.x + ox
    const vy = sy - 1 - (v.z + oz)
    const vz = v.y
    if (vx < 0 || vy < 0 || vz < 0 || vx >= sx || vy >= sy || vz >= sz) throw new Error(`voxel ${v.x},${v.y},${v.z} is outside the canvas`)
    xyzi.push(vx, vy, vz, i)
  }

  const rgba = new Uint8Array(256 * 4)
  for (const [color, i] of slots) rgba.set([(color >> 16) & 255, (color >> 8) & 255, color & 255, 255], (i - 1) * 4)
  rgba.set([0xd8, 0xdc, 0xe2, 255], (TEMPLATE_INDEX - 1) * 4)

  const chunk = (id: string, content: Uint8Array) => {
    const out = new Uint8Array(12 + content.length)
    const dv = new DataView(out.buffer)
    for (let k = 0; k < 4; k++) out[k] = id.charCodeAt(k)
    dv.setInt32(4, content.length, true)
    dv.setInt32(8, 0, true)
    out.set(content, 12)
    return out
  }
  const ints = (...n: number[]) => {
    const b = new Uint8Array(n.length * 4)
    const dv = new DataView(b.buffer)
    n.forEach((v, k) => dv.setInt32(k * 4, v, true))
    return b
  }
  const xyziBytes = new Uint8Array(4 + xyzi.length)
  new DataView(xyziBytes.buffer).setInt32(0, xyzi.length / 4, true)
  xyziBytes.set(xyzi, 4)

  const children = [chunk('SIZE', ints(sx, sy, sz)), chunk('XYZI', xyziBytes), chunk('RGBA', rgba)]
  const childLen = children.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(8 + 12 + childLen)
  const dv = new DataView(out.buffer)
  out.set([0x56, 0x4f, 0x58, 0x20]) // "VOX "
  dv.setInt32(4, 150, true)
  out.set([0x4d, 0x41, 0x49, 0x4e], 8) // "MAIN"
  dv.setInt32(12, 0, true)
  dv.setInt32(16, childLen, true)
  let o = 20
  for (const c of children) {
    out.set(c, o)
    o += c.length
  }
  return out
}
