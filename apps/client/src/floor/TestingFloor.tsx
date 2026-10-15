import { useRef, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import {
    TESTING_FLOOR_HENCHMEN,
    TESTING_FLOOR_ROOMS,
    approachCleared,
    exitOpen,
    roomAt,
    type HenchmanDef,
    type Look,
    DEFAULT_LOOK,
    type RoomId,
} from "@mcc/shared"
import VoxelAvatar from "../avatar/VoxelAvatar"
import type { NpcExtras } from "../avatar/avatarVoxels"
import Voxels, { Model } from "../voxel/Voxels"
import { useFloor, type Interactable } from "./FloorContext"
import { BABBAGE_POS, BOSS_PAD, EXAM_GATE, HENCHMAN_POS, INTERACT_RANGE, LOVELACE_POS, room, type V3 } from "./layout"
import { COGS, DIFF_COLUMNS, TREES, doorFor, floorArchitecture } from "./rooms"
import { analyticalEngine, cog, diffColumn, floorRing, gateRing, guide, henchman, threads, tree } from "./models"
import Sun, { FOG_FAR } from "./Sun"

// Floor 1 in voxels (see docs/design/floors/01-testing-floor.md). The
// architecture is static and built once (rooms.ts); this file adds what
// changes with progress: doors, henchmen, the Examiners' arena, the Guide.

/** Rooms whose exit door depends on progress (the rest are always open or walled). */
const GATED: RoomId[] = ["loom", "archive", "gears", "moth", "engine"]

export default function TestingFloor() {
    const { progress } = useFloor()
    const rooms = floorArchitecture()

    return (
        <group>
            <Sun />
            {TESTING_FLOOR_ROOMS.map((r) => (
                <Culled key={r.id} zMin={r.zMin} zMax={r.zMax}>
                    <Voxels build={rooms[r.id]} />
                </Culled>
            ))}
            {GATED.map((id) => (exitOpen(progress, id) ? null : <Voxels key={id} build={doorFor(room(id), id === "engine")} />))}
            <Decor />
            <EngineRoom />
            {TESTING_FLOOR_HENCHMEN.map((h) => (
                <Henchman key={h.id} def={h} />
            ))}
            <GuideOrb />
            <Tracker />
        </group>
    )
}

/**
 * Hides a room once it's further than the fog reaches. The floor is one long
 * corridor, so most rooms are always out of sight; drawing them anyway
 * (and their shadows) is most of a frame on weak GPUs. Colliders stay.
 */
function Culled({ zMin, zMax, children }: { zMin: number; zMax: number; children: ReactNode }) {
    const { playerPosRef } = useFloor()
    const g = useRef<Group>(null)
    useFrame(() => {
        const p = playerPosRef.current
        if (!g.current || !p) return
        const gap = p.z > zMax ? p.z - zMax : p.z < zMin ? zMin - p.z : 0
        g.current.visible = gap < FOG_FAR
    })
    return <group ref={g}>{children}</group>
}

/** Static props on finer grids: trees, the loom's threads, pads, the Exam Gate. */
function Decor() {
    return (
        <group>
            {TREES.map((at, i) => (
                <Model key={i} model={tree(i)} position={at} />
            ))}
            <Model model={threads()} position={[0, 1, -44]} />
            {COGS.map((c) => (
                <Cog key={c.at.join()} at={c.at} radius={c.radius} spin={c.spin} />
            ))}
            {[-8, 8].map((x) => (
                <Model key={x} model={floorRing(2, 1.6, 0xff7a59, true)} position={[x, -0.1, -158]} shadows={false} />
            ))}
            <Model model={gateRing()} position={[EXAM_GATE[0], 3, EXAM_GATE[2]]} />
        </group>
    )
}

function Cog({ at, radius, spin }: { at: V3; radius: number; spin: number }) {
    const g = useRef<Group>(null)
    useFrame((_, dt) => {
        if (g.current) g.current.rotation.x += dt * spin
    })
    return (
        <group ref={g} position={at}>
            <Model model={cog(radius)} />
        </group>
    )
}

const BABBAGE_LOOK: Look = {
    ...DEFAULT_LOOK,
    body: "#2b2f3a", skin: "#f1c27d", accent: "#d9d9d9", hair: "none", top: "jacket", bottomsColor: "#1e1e24", shoes: "boots", shoesColor: "#1b1b1f", idle: "proud",
}
const BABBAGE_EXTRAS: NpcExtras = { topHat: true, sideburns: "#c8c8c8" }
const LOVELACE_LOOK: Look = {
    ...DEFAULT_LOOK,
    body: "#6b2d5c", skin: "#f6d7b8", accent: "#3b2416", hair: "bun", top: "long", bottoms: "skirt", bottomsColor: "#5a2450", shoes: "boots", shoesColor: "#3b2416", build: "slim",
}

/** The boss arena: Difference Engine (left), Analytical Engine (centre), Ada's desk (right). */
function EngineRoom() {
    const { progress } = useFloor()
    const ready = approachCleared(progress) && !progress.bossBeaten
    return (
        <group>
            {/* Difference Engine: a column goes dark for each phase you clear */}
            {DIFF_COLUMNS.map((x, col) => (
                <Model key={x} model={diffColumn(!(col < progress.bossPhase || progress.bossBeaten))} position={[x, 0.5, -118]} />
            ))}
            {/* Analytical Engine: boots when the Examiners are beaten */}
            <Model model={analyticalEngine(progress.bossBeaten)} position={[0, 3.2, -131]} />
            {/* the Examiners */}
            <group position={BABBAGE_POS} rotation={[0, Math.PI * 0.85, 0]}>
                <VoxelAvatar look={BABBAGE_LOOK} npc={BABBAGE_EXTRAS} />
            </group>
            <group position={LOVELACE_POS} rotation={[0, -Math.PI * 0.85, 0]}>
                <VoxelAvatar look={LOVELACE_LOOK} />
            </group>
            {/* the pad you stand on to face them */}
            <Model model={floorRing(1.6, 0, ready ? 0x19c3d6 : 0x2f4a55, ready)} position={[BOSS_PAD[0], -0.1, BOSS_PAD[2]]} shadows={false} />
        </group>
    )
}

/** A henchman: a bobbing voxel creature. Gone once beaten. */
function Henchman({ def }: { def: HenchmanDef }) {
    const { progress } = useFloor()
    const g = useRef<Group>(null)
    const [x, , z] = HENCHMAN_POS[def.id]
    useFrame(({ clock }) => {
        if (!g.current) return
        const t = clock.elapsedTime + x
        g.current.position.y = 1.4 + Math.sin(t * 2) * 0.2
        // sway side to side, mostly facing the way you come in (+z)
        g.current.rotation.y = Math.sin(t * 0.8) * 0.6
    })
    if (progress.defeated.includes(def.id)) return null
    return (
        <group ref={g} position={[x, 1.4, z]}>
            <Model model={henchman(def.id)} />
        </group>
    )
}

/** The Guide (name and look to come): a small light that drifts beside the Climber. */
function GuideOrb() {
    const { playerPosRef } = useFloor()
    const g = useRef<Group>(null)
    useFrame(({ clock }, dt) => {
        const p = playerPosRef.current
        if (!g.current || !p) return
        const k = 1 - Math.exp(-3 * Math.min(dt, 0.1))
        g.current.position.x += (p.x + 0.9 - g.current.position.x) * k
        g.current.position.y += (p.y + 1.1 + Math.sin(clock.elapsedTime * 3) * 0.1 - g.current.position.y) * k
        g.current.position.z += (p.z + 0.4 - g.current.position.z) * k
        g.current.rotation.y = Math.sin(clock.elapsedTime) * 0.5
    })
    return (
        <group ref={g} position={[0.9, 2, 4]}>
            <Model model={guide()} shadows={false} />
        </group>
    )
}

const near = (p: { x: number; z: number }, at: V3) => Math.hypot(p.x - at[0], p.z - at[2]) <= INTERACT_RANGE

/** Each frame: which room the Climber is in, and what E would interact with. */
function Tracker() {
    const { playerPosRef, progress, setRoom, setNearby } = useFloor()
    // React state only changes when the answer does: no setState call per frame.
    const lastRoom = useRef<RoomId | null | undefined>(undefined)
    const lastTarget = useRef<string | undefined>(undefined)
    useFrame(() => {
        const p = playerPosRef.current
        if (!p) return
        const here = roomAt(p.x, p.z)?.id ?? null
        if (here !== lastRoom.current) {
            lastRoom.current = here
            setRoom(here)
        }
        let target: Interactable | null = null
        for (const h of TESTING_FLOOR_HENCHMEN) {
            if (!progress.defeated.includes(h.id) && near(p, HENCHMAN_POS[h.id])) target = { kind: "henchman", id: h.id }
        }
        if (!target && !progress.bossBeaten && approachCleared(progress) && near(p, BOSS_PAD)) target = { kind: "boss" }
        if (!target && near(p, EXAM_GATE)) target = { kind: "exam" }
        const key = target ? `${target.kind}:${"id" in target ? target.id : ""}` : ""
        if (key !== lastTarget.current) {
            lastTarget.current = key
            setNearby(target)
        }
    })
    return null
}
