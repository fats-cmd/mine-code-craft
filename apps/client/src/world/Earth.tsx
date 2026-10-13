import { CuboidCollider, RigidBody } from "@react-three/rapier"
import useEarthTexture from "./useEarthTexture"

const HALF_SIZE = 50

export default function Earth() {
    const texture = useEarthTexture()

    return (
        <RigidBody type="fixed" colliders={false}>
            {/* A thick slab rather than a flat plane: nothing can slip under a box. */}
            <CuboidCollider args={[HALF_SIZE, 0.5, HALF_SIZE]} position={[0, -0.5, 0]} />
            <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[HALF_SIZE * 2, HALF_SIZE * 2]} />
                <meshStandardMaterial map={texture} />
            </mesh>
        </RigidBody>
    )
}
