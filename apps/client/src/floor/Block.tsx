// Greybox pieces use Lambert shading: far cheaper per light than PBR (standard)
// materials, and a greybox needs no physically based look. Blender models bring their own.
import { RigidBody } from "@react-three/rapier"
import type { V3 } from "./layout"

/** A solid greybox box: a fixed collider plus a flat-colour mesh. Position is the box centre. */
export default function Block({
    at,
    size,
    color,
    rotation,
    emissive,
}: {
    at: V3
    size: V3
    color: string
    rotation?: V3
    emissive?: string
}) {
    return (
        <RigidBody type="fixed" colliders="cuboid" position={at} rotation={rotation}>
            <mesh receiveShadow castShadow>
                <boxGeometry args={size} />
                <meshLambertMaterial color={color} emissive={emissive ?? "#000"} emissiveIntensity={emissive ? 0.8 : 0} />
            </mesh>
        </RigidBody>
    )
}

/** Decoration only: drawn, never collided with. */
export function Prop({ at, size, color, rotation, emissive }: Parameters<typeof Block>[0]) {
    return (
        <mesh position={at} rotation={rotation}>
            <boxGeometry args={size} />
            <meshLambertMaterial color={color} emissive={emissive ?? "#000"} emissiveIntensity={emissive ? 0.8 : 0} />
        </mesh>
    )
}
