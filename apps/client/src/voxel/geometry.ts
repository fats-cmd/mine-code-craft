import { BufferAttribute, BufferGeometry, Color, MeshBasicMaterial, MeshLambertMaterial, SRGBColorSpace } from "three"
import { meshVoxels, type MeshOptions, type VoxelGrid } from "@mcc/shared"

/** Lit voxels: Lambert is cheap per light and all a flat-coloured voxel needs. */
export const LIT = new MeshLambertMaterial({ vertexColors: true })
/** Glowing voxels (threads, gates, pads): unlit, so they read as light sources. */
export const GLOW = new MeshBasicMaterial({ vertexColors: true, toneMapped: false })

const tmp = new Color()

/** Mesher output -> BufferGeometry. Colours are sRGB from the mesher; three.js wants linear. */
export function voxelGeometry(grid: VoxelGrid, options?: MeshOptions): BufferGeometry {
    const data = meshVoxels(grid, options)
    const colors = new Float32Array(data.colors.length)
    for (let i = 0; i < colors.length; i += 3) {
        tmp.setRGB(data.colors[i], data.colors[i + 1], data.colors[i + 2], SRGBColorSpace)
        colors[i] = tmp.r
        colors[i + 1] = tmp.g
        colors[i + 2] = tmp.b
    }
    const g = new BufferGeometry()
    g.setAttribute("position", new BufferAttribute(data.positions, 3))
    g.setAttribute("normal", new BufferAttribute(data.normals, 3))
    g.setAttribute("color", new BufferAttribute(colors, 3))
    g.setIndex(new BufferAttribute(data.indices, 1))
    g.computeBoundingSphere()
    return g
}
