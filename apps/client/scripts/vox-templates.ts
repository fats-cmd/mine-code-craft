// Writes MagicaVoxel templates for hand-made avatar parts, and the sample
// "flame" hair. Run with `npm run vox:templates` (from apps/client).
//
//   art/templates/head.vox       sculpt hair and hats around the grey head
//   src/avatar/parts/hair-flame.vox   an example part, built here in code
//
// The grey reference voxels use palette slot 255, which the game ignores on
// import, so you can leave them in while you work. Paint parts that should
// follow the player's hair colour in greys (#c0c0c0 is exactly their colour).
// See docs/design/CHARACTERS.md.

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { TEMPLATE_INDEX, hash3, writeVox, type VoxVoxel } from "@mcc/shared"

const here = dirname(fileURLToPath(import.meta.url))
const out = (path: string, bytes: Uint8Array) => {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, bytes)
    console.log("wrote", path)
}

/** Head-space canvas: x and z -5..5 around the neck, y 0..13 up from it. */
const HEAD_CANVAS: [number, number, number] = [11, 14, 11]

const voxels = (): VoxVoxel[] & { add(x: number, y: number, z: number, color: number, index?: number): void } => {
    const list = [] as unknown as VoxVoxel[] & { add(x: number, y: number, z: number, color: number, index?: number): void }
    const seen = new Set<string>()
    list.add = (x, y, z, color, index = 0) => {
        const k = `${x},${y},${z}`
        if (seen.has(k)) return
        seen.add(k)
        list.push({ x, y, z, color, index })
    }
    return list
}

// ---- the reference head (5 x 5 x 5, face toward +z) -------------------------
const head = voxels()
for (let x = -2; x <= 2; x++) for (let y = 0; y <= 4; y++) for (let z = -2; z <= 2; z++) head.add(x, y, z, 0xd8dce2, TEMPLATE_INDEX)
out(resolve(here, "../../../art/templates/head.vox"), writeVox({ size: HEAD_CANVAS, voxels: head }))

// ---- sample part: flame hair, in tintable greys -----------------------------
const BASE = 0xc0c0c0
const LIGHT = 0xe0e0e0
const DARK = 0x8c8c8c
const flame = voxels()
const cap = (x: number, y: number, z: number) => flame.add(x, y, z, hash3(x, y, z, 3) > 0.7 ? LIGHT : BASE)
for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) cap(x, 5, z)
for (let x = -2; x <= 2; x++) for (let y = 2; y <= 4; y++) flame.add(x, y, -3, y === 2 ? DARK : BASE) // back
for (let z = -2; z <= 0; z++) {
    flame.add(-3, 4, z, BASE) // over the ears
    flame.add(3, 4, z, BASE)
}
// Flame tongues: columns that rise higher toward the back, leaning backward as they go.
const tongues: [number, number, number][] = [
    [-2, 1, 3], [0, 2, 4], [2, 1, 3], [-1, -1, 5], [1, -1, 5], [-3, -1, 3], [3, -1, 3], [0, -2, 6], [-2, -3, 4], [2, -3, 4], [0, 0, 5],
]
for (const [x, z, h] of tongues) {
    for (let i = 0; i < h; i++) {
        const lean = Math.floor(i / 2)
        const tip = i >= h - 2
        flame.add(x, 6 + i, z - lean, tip ? LIGHT : i === 0 ? DARK : BASE)
        if (i < h - 2) flame.add(x + (x >= 0 ? 1 : -1), 6 + i, z - lean, BASE) // thicker at the root
    }
}
// a ragged fringe over the forehead
for (const [x, y] of [[-2, 4], [-1, 5], [0, 4], [1, 5], [2, 4]] as const) flame.add(x, y, 3, BASE)
out(resolve(here, "../src/avatar/parts/hair-flame.vox"), writeVox({ size: HEAD_CANVAS, voxels: flame }))
