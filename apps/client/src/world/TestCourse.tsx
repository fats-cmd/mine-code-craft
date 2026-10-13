import { RigidBody } from "@react-three/rapier"
import type { ReactNode } from "react"

// Dev geometry for checking movement: a wall, steps, slopes and a ledge.
// Replace or delete it once the real Base has its own obstacles.

function Block({ position, size, rotation = [0, 0, 0], color, children }: {
    position: [number, number, number]
    size: [number, number, number]
    rotation?: [number, number, number]
    color: string
    children?: ReactNode
}) {
    return (
        <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} />
            </mesh>
            {children}
        </RigidBody>
    )
}

export default function TestCourse() {
    const stepRise = 0.3
    const steps = Array.from({ length: 6 }, (_, i) => i)

    return (
        <group position={[0, 0, -14]}>
            {/* Long wall: walk into it at an angle and you should slide along it. */}
            <Block position={[-8, 1.5, 0]} size={[0.6, 3, 16]} color="#8a8f98" />

            {/* Stairs: each riser is under the autostep height, so you walk up. */}
            {steps.map((i) => (
                <Block
                    key={i}
                    position={[0, (stepRise * (i + 1)) / 2, -i * 0.8]}
                    size={[3, stepRise * (i + 1), 0.8]}
                    color={i % 2 ? "#c8a46b" : "#b38d55"}
                />
            ))}

            {/* Gentle ramp (~25 deg): walkable. */}
            <Block position={[5, 0.9, -2]} size={[2.5, 0.3, 5]} rotation={[0.45, 0, 0]} color="#6b9ac8" />

            {/* Steep ramp (~60 deg): too steep to climb, you slide back. */}
            <Block position={[9, 1.6, -2]} size={[2.5, 0.3, 5]} rotation={[1.05, 0, 0]} color="#c86b6b" />

            {/* Ledge too tall to step onto: needs a jump. */}
            <Block position={[0, 0.6, 6]} size={[4, 1.2, 3]} color="#7cb87c" />
        </group>
    )
}
