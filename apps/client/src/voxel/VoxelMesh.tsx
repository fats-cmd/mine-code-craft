import { useEffect, useMemo } from "react"
import type { VoxelGrid } from "@mcc/shared"
import type { ThreeElements } from "@react-three/fiber"
import { GLOW, LIT, voxelGeometry } from "./geometry"

/**
 * One merged mesh for a whole voxel model: one draw call however many voxels.
 * Re-meshes when `grid` changes identity, so build it once (module scope or useMemo).
 */
export default function VoxelMesh({
    grid,
    scale = 1,
    offset,
    glow = false,
    shadows = true,
    hideDownBelow,
    ...props
}: {
    grid: VoxelGrid
    scale?: number
    offset?: [number, number, number]
    glow?: boolean
    shadows?: boolean
    /** See MeshOptions.hideDownBelow. */
    hideDownBelow?: number
} & Omit<ThreeElements["mesh"], "geometry" | "material">) {
    const [ox, oy, oz] = offset ?? [0, 0, 0]
    const geometry = useMemo(
        () => voxelGeometry(grid, { scale, offset: [ox, oy, oz], hideDownBelow }),
        [grid, scale, ox, oy, oz, hideDownBelow],
    )
    useEffect(() => () => geometry.dispose(), [geometry])
    return <mesh geometry={geometry} material={glow ? GLOW : LIT} castShadow={shadows && !glow} receiveShadow={!glow} {...props} />
}
