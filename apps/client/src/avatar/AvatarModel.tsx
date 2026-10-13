import type { Ref } from "react"
import type { Group } from "three"
import { DEFAULT_LOOK, type Look } from "@mcc/shared"

// Placeholder body built from boxes. Faces +Z; the visor shows which way.
// Total height 1.8, feet at y = 0 in local space. The head is a 0.4 cube
// centred at y = 1.6, so its top is at 1.8 and its face at z = 0.2.

const HEAD_Y = 1.6
const TOP = 1.8
const FACE = 0.2
const PANTS = "#2b2f3a"
const DARK = "#111111"
const GOLD = "#f5c518"

export default function AvatarModel({ look = DEFAULT_LOOK, ref }: { look?: Look; ref?: Ref<Group> }) {
    // A cap or crown covers the top of the head, so tall hair would poke through.
    const hairVisible = look.headwear !== "cap" || look.hair === "bun"

    return (
        <group ref={ref}>
            <Box at={[0, 0.45, 0]} size={[0.45, 0.9, 0.3]} color={PANTS} />
            <Box at={[0, 1.15, 0]} size={[0.6, 0.6, 0.35]} color={look.body} />
            <Box at={[0, HEAD_Y, 0]} size={[0.4, 0.4, 0.4]} color={look.skin} />
            {hairVisible && <Hair kind={look.hair} color={look.accent} />}
            <Headwear kind={look.headwear} color={look.accent} />
            <Visor kind={look.visor} />
        </group>
    )
}

function Box({
    at,
    size,
    color,
    rotation = [0, 0, 0],
    emissive,
}: {
    at: [number, number, number]
    size: [number, number, number]
    color: string
    rotation?: [number, number, number]
    emissive?: string
}) {
    return (
        <mesh position={at} rotation={rotation} castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 0.6 : 0} />
        </mesh>
    )
}

function Spike({ at, tilt, color }: { at: [number, number, number]; tilt: [number, number, number]; color: string }) {
    return (
        <mesh position={at} rotation={tilt} castShadow>
            <coneGeometry args={[0.08, 0.24, 4]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Hair({ kind, color }: { kind: Look["hair"]; color: string }) {
    if (kind === "none") return null
    const cap = <Box at={[0, TOP - 0.02, -0.01]} size={[0.43, 0.08, 0.43]} color={color} />
    if (kind === "mohawk") {
        return <Box at={[0, TOP + 0.08, -0.02]} size={[0.09, 0.18, 0.44]} color={color} />
    }
    if (kind === "bun") {
        return (
            <group>
                {cap}
                <mesh position={[0, TOP - 0.02, -0.25]} castShadow>
                    <sphereGeometry args={[0.11, 12, 10]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        )
    }
    // spiky: the anime one. Cones fan out from the crown of the head.
    const y = TOP + 0.08
    return (
        <group>
            {cap}
            <Spike at={[0, y + 0.04, 0]} tilt={[0, 0, 0]} color={color} />
            <Spike at={[0.13, y, 0.05]} tilt={[0.3, 0, -0.6]} color={color} />
            <Spike at={[-0.13, y, 0.05]} tilt={[0.3, 0, 0.6]} color={color} />
            <Spike at={[0.12, y - 0.02, -0.12]} tilt={[-0.5, 0, -0.5]} color={color} />
            <Spike at={[-0.12, y - 0.02, -0.12]} tilt={[-0.5, 0, 0.5]} color={color} />
            <Spike at={[0, y - 0.02, -0.16]} tilt={[-0.8, 0, 0]} color={color} />
            <Spike at={[0, y - 0.04, 0.15]} tilt={[0.9, 0, 0]} color={color} />
        </group>
    )
}

function Headwear({ kind, color }: { kind: Look["headwear"]; color: string }) {
    switch (kind) {
        case "cap":
            return (
                <group>
                    <Box at={[0, TOP + 0.03, 0]} size={[0.44, 0.1, 0.44]} color={color} />
                    <Box at={[0, TOP - 0.01, FACE + 0.08]} size={[0.38, 0.03, 0.18]} color={color} />
                </group>
            )
        case "headband":
            return (
                <group>
                    <Box at={[0, HEAD_Y + 0.11, 0]} size={[0.43, 0.06, 0.43]} color={color} />
                    <Box at={[0.05, HEAD_Y + 0.02, -0.24]} size={[0.04, 0.18, 0.02]} rotation={[0.3, 0, -0.3]} color={color} />
                    <Box at={[-0.05, HEAD_Y + 0.02, -0.24]} size={[0.04, 0.18, 0.02]} rotation={[0.3, 0, 0.3]} color={color} />
                </group>
            )
        case "crown":
            return (
                <group>
                    <Box at={[0, TOP + 0.04, 0.2]} size={[0.42, 0.08, 0.04]} color={GOLD} />
                    <Box at={[0, TOP + 0.04, -0.2]} size={[0.42, 0.08, 0.04]} color={GOLD} />
                    <Box at={[0.2, TOP + 0.04, 0]} size={[0.04, 0.08, 0.42]} color={GOLD} />
                    <Box at={[-0.2, TOP + 0.04, 0]} size={[0.04, 0.08, 0.42]} color={GOLD} />
                    {[-0.13, 0, 0.13].map((x) => (
                        <Box key={x} at={[x, TOP + 0.11, 0.2]} size={[0.05, 0.07, 0.04]} color={GOLD} />
                    ))}
                    <Box at={[0, TOP + 0.05, 0.225]} size={[0.06, 0.05, 0.02]} color="#e2483d" emissive="#e2483d" />
                </group>
            )
        default:
            return null
    }
}

function Visor({ kind }: { kind: Look["visor"] }) {
    const y = HEAD_Y + 0.02
    switch (kind) {
        case "goggles":
            return (
                <group>
                    <Box at={[0, y, 0]} size={[0.42, 0.05, 0.42]} color={DARK} />
                    <Box at={[0.09, y, FACE + 0.02]} size={[0.13, 0.11, 0.05]} color="#7dd3fc" emissive="#38bdf8" />
                    <Box at={[-0.09, y, FACE + 0.02]} size={[0.13, 0.11, 0.05]} color="#7dd3fc" emissive="#38bdf8" />
                </group>
            )
        case "shades":
            return (
                <group>
                    <Box at={[0.09, y, FACE + 0.01]} size={[0.13, 0.08, 0.03]} color={DARK} />
                    <Box at={[-0.09, y, FACE + 0.01]} size={[0.13, 0.08, 0.03]} color={DARK} />
                    <Box at={[0, y + 0.02, FACE + 0.01]} size={[0.06, 0.02, 0.02]} color={DARK} />
                </group>
            )
        default:
            return <Box at={[0, y, FACE + 0.01]} size={[0.32, 0.1, 0.03]} color={DARK} />
    }
}
