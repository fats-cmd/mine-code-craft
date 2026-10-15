import { describe, expect, it } from 'vitest'
import { TEMPLATE_INDEX, parseVox, writeVox } from './vox.ts'

describe('.vox', () => {
  const model = {
    size: [5, 4, 3] as [number, number, number],
    voxels: [
      { x: -2, y: 0, z: -1, color: 0xff0000 },
      { x: 2, y: 3, z: 1, color: 0x00ff00 },
      { x: 0, y: 1, z: 0, color: 0xff0000 },
    ],
  }

  it('round-trips voxels, colours and canvas size', () => {
    const back = parseVox(writeVox(model))
    expect(back.size).toEqual(model.size)
    expect(back.voxels.map(({ x, y, z, color }) => ({ x, y, z, color }))).toEqual(model.voxels)
  })

  it('reuses palette slots for repeated colours', () => {
    const back = parseVox(writeVox(model))
    expect(back.voxels[0].index).toBe(back.voxels[2].index)
    expect(back.voxels[1].index).not.toBe(back.voxels[0].index)
  })

  it('skips template voxels on import', () => {
    const withTemplate = { ...model, voxels: [...model.voxels, { x: 0, y: 0, z: 0, color: 0, index: TEMPLATE_INDEX }] }
    expect(parseVox(writeVox(withTemplate)).voxels).toHaveLength(3)
  })

  it('maps MagicaVoxel axes to game axes: z-up becomes y-up, the front (-y) faces +z', () => {
    // A hand-built file: canvas 3 x 3 x 3, one voxel at MagicaVoxel (1, 0, 2): front row, top layer.
    const bytes = writeVox({ size: [3, 3, 3], voxels: [{ x: 0, y: 2, z: 1, color: 0x123456 }] })
    // find XYZI content and check the stored MagicaVoxel coordinates
    const text = String.fromCharCode(...bytes)
    const at = text.indexOf('XYZI') + 12 + 4
    expect([bytes[at], bytes[at + 1], bytes[at + 2]]).toEqual([1, 0, 2])
  })

  it('rejects files that are not .vox, and voxels outside the canvas', () => {
    expect(() => parseVox(new Uint8Array(40))).toThrow()
    expect(() => writeVox({ size: [3, 3, 3], voxels: [{ x: 5, y: 0, z: 0, color: 1 }] })).toThrow()
  })
})
