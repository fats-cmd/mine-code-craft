import { CuboidCollider, RigidBody } from "@react-three/rapier"
import type { ThreeElements } from "@react-three/fiber"
import VoxelMesh from "./VoxelMesh"
import { CELL, type VoxelBuilder, type VoxelModel } from "./builder"

/** Architecture from a VoxelBuilder: one fixed body with its box colliders, one lit mesh, one glow mesh. */
export default function Voxels({ build }: { build: VoxelBuilder }) {
    return (
        <>
            {build.colliders.length > 0 && (
                <RigidBody type="fixed" colliders={false}>
                    {build.colliders.map((c, i) => (
                        <CuboidCollider key={i} position={c.at} args={c.half} />
                    ))}
                </RigidBody>
            )}
            {build.lit.size > 0 && <VoxelMesh grid={build.lit} scale={CELL} hideDownBelow={0} />}
            {build.glow.size > 0 && <VoxelMesh grid={build.glow} scale={CELL} glow hideDownBelow={0} />}
        </>
    )
}

/** A VoxelModel placed in the scene. */
export function Model({ model, shadows = true, ...props }: { model: VoxelModel; shadows?: boolean } & ThreeElements["group"]) {
    return (
        <group {...props}>
            {model.lit.size > 0 && <VoxelMesh grid={model.lit} scale={model.scale} shadows={shadows} />}
            {model.glow.size > 0 && <VoxelMesh grid={model.glow} scale={model.scale} glow />}
        </group>
    )
}
