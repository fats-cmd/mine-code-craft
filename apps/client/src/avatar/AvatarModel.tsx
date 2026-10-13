import type { Ref } from "react"
import type { Group } from "three"

// Placeholder body built from boxes. Faces +Z; the visor shows which way.
// Total height 1.8, feet at y = 0 in local space.
export default function AvatarModel({ color = "#4f7cff", ref }: { color?: string; ref?: Ref<Group> }) {
    return (
        <group ref={ref}>
            <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[0.45, 0.9, 0.3]} />
                <meshStandardMaterial color="#2b2f3a" />
            </mesh>
            <mesh position={[0, 1.15, 0]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.35]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 1.6, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color="#f1c27d" />
            </mesh>
            <mesh position={[0, 1.62, 0.21]}>
                <boxGeometry args={[0.32, 0.1, 0.03]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    )
}
