import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import {
    TESTING_FLOOR_HENCHMEN,
    TESTING_FLOOR_ROOMS,
    approachCleared,
    exitOpen,
    roomAt,
    type HenchmanDef,
    type Look,
} from "@mcc/shared"
import AvatarModel from "../avatar/AvatarModel"
import Block, { Prop } from "./Block"
import RoomShell from "./RoomShell"
import { useFloor, type Interactable } from "./FloorContext"
import {
    BABBAGE_POS,
    BOSS_PAD,
    EXAM_GATE,
    HENCHMAN_POS,
    INTERACT_RANGE,
    LOVELACE_POS,
    ROOM_STYLE,
    room,
    type V3,
} from "./layout"

// Floor 1 greybox (M4a): every room from docs/design/floors/01-testing-floor.md
// in flat-coloured boxes, walkable end to end. Blender models replace these
// pieces one at a time in M4d; the layout and colliders stay.

export default function TestingFloor() {
    const { progress } = useFloor()
    const open = (id: Parameters<typeof exitOpen>[1]) => exitOpen(progress, id)

    return (
        <group>
            <hemisphereLight args={["#cfe8ff", "#2a1d14", 0.6]} />
            <RoomLights />
            <RoomShell room={room("arrival")} exitOpen closedEntrance>
                <Prop at={[0, 0.06, 4]} size={[5, 0.1, 5]} color="#c9a227" emissive="#6b5212" />
            </RoomShell>
            <AbacusCourt />
            <RoomShell room={room("loom")} exitOpen={open("loom")}>
                <Loom />
            </RoomShell>
            <RoomShell room={room("archive")} exitOpen={open("archive")}>
                <CardShelves />
            </RoomShell>
            <RoomShell room={room("gears")} exitOpen={open("gears")}>
                <Cogs />
            </RoomShell>
            <RoomShell room={room("moth")} exitOpen={open("moth")}>
                <Block at={[-4.5, 1.5, -97]} size={[2, 3, 6]} color="#2b2f3a" />
                <Block at={[4.5, 1.5, -97]} size={[2, 3, 6]} color="#2b2f3a" />
            </RoomShell>
            <RoomShell room={room("engine")} exitOpen={open("engine")} doorColor="#19c3d6">
                <EngineRoom />
            </RoomShell>
            <RoomShell room={room("hall")} exitOpen closedExit>
                <TestingHall />
            </RoomShell>
            {TESTING_FLOOR_HENCHMEN.map((h) => (
                <Henchman key={h.id} def={h} />
            ))}
            <GuideOrb />
            <Tracker />
        </group>
    )
}

/** Room ①: cross a pit on abacus-bead pillars. Falling in costs nothing; the stairs lead back. */
function AbacusCourt() {
    const r = room("abacus")
    const wood = "#6b4a32"
    const beadColors = ["#e2483d", "#c9a227", "#19c3d6"]
    return (
        <RoomShell room={r} exitOpen floor={false}>
            {/* entrance and exit ledges, top at y = 0 */}
            <Block at={[0, -1.25, -5]} size={[r.width, 2.5, 6]} color={wood} />
            <Block at={[0, -1.25, -23]} size={[r.width, 2.5, 6]} color={wood} />
            {/* the pit floor */}
            <Block at={[0, -3, -14]} size={[r.width, 1, 12]} color="#3b2a1e" />
            {/* Bead pillars: 2.4 deep with 1.2 m gaps. Gaps must be clearly wider than the
                capsule (0.7 m) so a missed jump drops you into the pit instead of wedging you. */}
            {[-10.4, -14.0, -17.6].map((z, i) => (
                <Block key={z} at={[0, -1.25, z]} size={[4, 2.5, 2.4]} color={beadColors[i]} />
            ))}
            {/* stairs out of the pit, back to the entrance ledge */}
            {[1, 2, 3, 4, 5, 6].map((i) => {
                const h = i * (2.5 / 6)
                const zFar = -8 - 0.8 * (6 - i)
                return <Block key={i} at={[6, -2.5 + h / 2, zFar - 0.4]} size={[3, h, 0.8]} color="#5b4636" />
            })}
            {/* abacus rods overhead: decoration */}
            {[-10.4, -14.0, -17.6].map((z) => (
                <Prop key={z} at={[0, 5.4, z]} size={[r.width - 1, 0.1, 0.1]} color="#c9a227" />
            ))}
        </RoomShell>
    )
}

/** Room ②: a towering Jacquard loom with glowing threads. */
function Loom() {
    return (
        <group>
            <Block at={[-6, 2.75, -44]} size={[0.8, 5.5, 0.8]} color="#6b3e26" />
            <Block at={[6, 2.75, -44]} size={[0.8, 5.5, 0.8]} color="#6b3e26" />
            <Prop at={[0, 5.2, -44]} size={[12.8, 0.6, 0.8]} color="#6b3e26" />
            {Array.from({ length: 11 }, (_, i) => (
                <Prop key={i} at={[-5 + i, 3.4, -44]} size={[0.05, 3.2, 0.05]} color="#19c3d6" emissive="#19c3d6" />
            ))}
        </group>
    )
}

/** Room ③: walls of punched cards. */
function CardShelves() {
    return (
        <group>
            {[-62, -57, -52].map((z) =>
                [-6.6, 6.6].map((x) => (
                    <Block key={`${x}${z}`} at={[x, 2, z]} size={[1.2, 4, 3.5]} color="#f2e6c9" />
                )),
            )}
        </group>
    )
}

/** Room ④: giant cogs, some jammed. Decoration against the walls. */
function Cogs() {
    const cog = (at: V3, r: number, spin: number) => <Cog key={at.join()} at={at} radius={r} spin={spin} />
    return <group>{[cog([-7.4, 3, -74], 2.4, 0.2), cog([7.4, 2.5, -80], 2, -0.3), cog([-7.4, 2.2, -86], 1.6, 0)]}</group>
}

function Cog({ at, radius, spin }: { at: V3; radius: number; spin: number }) {
    const mesh = useRef<Mesh>(null)
    useFrame((_, dt) => {
        if (mesh.current) mesh.current.rotation.x += dt * spin
    })
    return (
        <mesh ref={mesh} position={at} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[radius, radius, 0.5, 12]} />
            <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.4} />
        </mesh>
    )
}

const BABBAGE_LOOK: Look = { body: "#2b2f3a", skin: "#f1c27d", accent: "#d9d9d9", hair: "none", headwear: "none", visor: "band" }
const LOVELACE_LOOK: Look = { body: "#6b2d5c", skin: "#f6d7b8", accent: "#3b2416", hair: "bun", headwear: "none", visor: "band" }

/** The boss arena: Difference Engine (left), Analytical Engine (centre), Ada's desk (right). */
function EngineRoom() {
    const { progress } = useFloor()
    const ready = approachCleared(progress) && !progress.bossBeaten
    return (
        <group>
            {/* Difference Engine: three columns of number wheels */}
            {[-13, -11.5, -10].map((x, col) =>
                Array.from({ length: 6 }, (_, i) => (
                    <Prop
                        key={`${col}-${i}`}
                        at={[x, 0.6 + i * 0.7, -118]}
                        size={[1, 0.5, 1]}
                        color={col < progress.bossPhase || progress.bossBeaten ? "#5a4a1a" : "#c9a227"}
                    />
                )),
            )}
            <Block at={[-11.5, 0.15, -118]} size={[5, 0.3, 2.4]} color="#2b2f3a" />
            {/* Analytical Engine: a wireframe that "boots" when the boss is beaten */}
            <mesh position={[0, 3.2, -131]}>
                <boxGeometry args={[10, 6, 3, 5, 3, 2]} />
                <meshBasicMaterial color="#19c3d6" wireframe transparent opacity={progress.bossBeaten ? 1 : 0.35} />
            </mesh>
            {/* Ada's desk and her Notes */}
            <Block at={[11.5, 0.6, -118]} size={[3, 1.2, 1.6]} color="#6b3e26" />
            {[0, 1, 2].map((i) => (
                <Prop key={i} at={[10.6 + i * 0.9, 2 + i * 0.3, -118.4]} size={[0.6, 0.8, 0.02]} color="#f2e6c9" emissive="#f2e6c9" />
            ))}
            {/* the Examiners */}
            <group position={BABBAGE_POS} rotation={[0, Math.PI * 0.85, 0]}>
                <AvatarModel look={BABBAGE_LOOK} />
            </group>
            <group position={LOVELACE_POS} rotation={[0, -Math.PI * 0.85, 0]}>
                <AvatarModel look={LOVELACE_LOOK} />
            </group>
            {/* the pad you stand on to face them */}
            <mesh position={[BOSS_PAD[0], 0.03, BOSS_PAD[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.6, 32]} />
                <meshStandardMaterial color="#19c3d6" emissive="#19c3d6" emissiveIntensity={ready ? 1.2 : 0.15} />
            </mesh>
        </group>
    )
}

/** Floor 1's Floor Hall: stations, duel pads and the Exam Gate. Shared with every Floor-1 Climber. */
function TestingHall() {
    return (
        <group>
            {[-148, -158, -168].map((z) =>
                [-19, 19].map((x) => (
                    <group key={`${x}${z}`}>
                        <Block at={[x, 1, z]} size={[1.6, 2, 1]} color="#2b2f3a" />
                        <Prop at={[x - Math.sign(x) * 0.81, 1.4, z]} size={[0.02, 0.8, 0.8]} color="#19c3d6" emissive="#19c3d6" />
                    </group>
                )),
            )}
            {[-8, 8].map((x) => (
                <mesh key={x} position={[x, 0.03, -158]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.6, 2, 32]} />
                    <meshStandardMaterial color="#ff7a59" emissive="#ff7a59" emissiveIntensity={0.6} />
                </mesh>
            ))}
            <Block at={[-14, 1.6, -141]} size={[4, 3.2, 0.4]} color="#6b3e26" />
            <mesh position={[EXAM_GATE[0], 3, EXAM_GATE[2]]}>
                <torusGeometry args={[2.6, 0.3, 12, 48]} />
                <meshStandardMaterial color="#c45bff" emissive="#c45bff" emissiveIntensity={1.2} />
            </mesh>
        </group>
    )
}

const HENCHMAN_COLOR: Record<string, string> = {
    "shuttle-sprite": "#19c3d6",
    "punched-card": "#f2e6c9",
    "loose-cog-1": "#c9a227",
    "loose-cog-2": "#e2a227",
    "the-moth": "#b9a7ff",
}

/** A greybox henchman: a bobbing, glowing shape. Gone once beaten. */
function Henchman({ def }: { def: HenchmanDef }) {
    const { progress } = useFloor()
    const g = useRef<Group>(null)
    const [x, , z] = HENCHMAN_POS[def.id]
    useFrame(({ clock }) => {
        if (!g.current) return
        const t = clock.elapsedTime + x
        g.current.position.y = 1.4 + Math.sin(t * 2) * 0.2
        g.current.rotation.y = t * 0.8
    })
    if (progress.defeated.includes(def.id)) return null
    const color = HENCHMAN_COLOR[def.id]
    return (
        <group ref={g} position={[x, 1.4, z]}>
            <mesh>
                {def.id === "shuttle-sprite" && <coneGeometry args={[0.35, 1.2, 6]} />}
                {def.id === "punched-card" && <boxGeometry args={[0.9, 1.2, 0.04]} />}
                {def.id.startsWith("loose-cog") && <torusGeometry args={[0.5, 0.18, 8, 12]} />}
                {def.id === "the-moth" && <octahedronGeometry args={[0.4]} />}
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
            </mesh>
        </group>
    )
}

/** The Guide (name and look to come): a small light that drifts beside the Climber. */
function GuideOrb() {
    const { playerPosRef } = useFloor()
    const m = useRef<Mesh>(null)
    useFrame(({ clock }, dt) => {
        const p = playerPosRef.current
        if (!m.current || !p) return
        const k = 1 - Math.exp(-3 * Math.min(dt, 0.1))
        m.current.position.x += (p.x + 0.9 - m.current.position.x) * k
        m.current.position.y += (p.y + 1.1 + Math.sin(clock.elapsedTime * 3) * 0.1 - m.current.position.y) * k
        m.current.position.z += (p.z + 0.4 - m.current.position.z) * k
        m.current.rotation.y += dt
    })
    return (
        <mesh ref={m} position={[0.9, 2, 4]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color="#ffe08a" emissive="#ffcf4a" emissiveIntensity={1.5} />
        </mesh>
    )
}

/**
 * A fixed pool of two point lights that follow you: one in your room, one in
 * the next. Eight always-on room lights cost ~4.7x the frame time in software
 * rendering (4 fps vs 19), and a constant light count means three.js never
 * recompiles shaders as you walk between rooms.
 */
function RoomLights() {
    const { room: here } = useFloor()
    const i = Math.max(0, TESTING_FLOOR_ROOMS.findIndex((r) => r.id === here))
    const lit = [TESTING_FLOOR_ROOMS[i], TESTING_FLOOR_ROOMS[Math.min(i + 1, TESTING_FLOOR_ROOMS.length - 1)]]
    return (
        <>
            {lit.map((r, k) => {
                const style = ROOM_STYLE[r.id]
                const length = r.zMax - r.zMin
                return (
                    <pointLight
                        key={k}
                        position={[0, 4.5, (r.zMax + r.zMin) / 2]}
                        color={style.light}
                        intensity={style.intensity}
                        distance={Math.max(length, r.width) * 1.4}
                        decay={1.6}
                    />
                )
            })}
        </>
    )
}

const near = (p: { x: number; z: number }, at: V3) => Math.hypot(p.x - at[0], p.z - at[2]) <= INTERACT_RANGE

/** Each frame: which room the Climber is in, and what E would interact with. */
function Tracker() {
    const { playerPosRef, progress, setRoom, setNearby } = useFloor()
    useFrame(() => {
        const p = playerPosRef.current
        if (!p) return
        setRoom(roomAt(p.x, p.z)?.id ?? null)
        let target: Interactable | null = null
        for (const h of TESTING_FLOOR_HENCHMEN) {
            if (!progress.defeated.includes(h.id) && near(p, HENCHMAN_POS[h.id])) target = { kind: "henchman", id: h.id }
        }
        if (!target && !progress.bossBeaten && approachCleared(progress) && near(p, BOSS_PAD)) target = { kind: "boss" }
        if (!target && near(p, EXAM_GATE)) target = { kind: "exam" }
        setNearby(target)
    })
    return null
}
