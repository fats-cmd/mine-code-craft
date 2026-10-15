import { parseVox, type VoxModel } from "@mcc/shared"
import type { PartLibrary } from "./avatarVoxels"

// Hand-made avatar parts: every `parts/<slot>-<name>.vox` file is picked up at
// build time, e.g. `parts/hair-flame.vox` is the "flame" hair. The name must
// also be in the slot's list in packages/shared/src/identity.ts, or the server
// won't accept it. How to make one: docs/design/CHARACTERS.md.

const files = import.meta.glob<string>("./parts/*.vox", { eager: true, import: "default" })

function decode(base64: string): Uint8Array {
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
}

export const VOX_PARTS: PartLibrary = {}
for (const [path, base64] of Object.entries(files)) {
    const name = path.match(/([\w-]+)\.vox$/)?.[1]
    if (!name) continue
    try {
        VOX_PARTS[name] = parseVox(decode(base64)) satisfies VoxModel
    } catch (err) {
        // A broken file shouldn't take the game down: that part falls back to its code-built version.
        console.warn(`Skipping avatar part ${path}:`, err)
    }
}
