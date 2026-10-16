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
import VoxelAvatar, { type AvatarMotion } from "../avatar/VoxelAvatar"
import type { NpcExtras } from "../avatar/avatarVoxels"
import Voxels, { Model } from "../voxel/Voxels"
import { useFloor, type Interactable } from "./FloorContext"
import { ADA_BALCONY, BABBAGE_POS, BOSS_PAD, EXAM_GATE, HENCHMAN_POS, INTERACT_RANGE, room, type V3 } from "./layout"
import { COGS, DIFF_COLUMNS, TREES, doorFor, floorArchitecture } from "./rooms"
import { analyticalEngine, cog, diffColumn, floorRing, gateRing, guide, henchman, threads, tree } from "./models"
import Sun, { FOG_FAR } from "./Sun"

// Floor 1 in voxels (see docs/design/floors/01-testing-floor.md). The
// architecture is static and built once (rooms.ts); this file adds what
// changes with progress: doors, henchmen, Babbage's arena, Ada, the Guide.

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
            <AdaLovelace />
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

/** The boss arena: Difference Engine (left), Analytical Engine (centre), Ada's desk and balcony (right). */
function EngineRoom() {
    const { progress } = useFloor()
    const ready = approachCleared(progress) && !progress.bossBeaten
    return (
        <group>
            {/* Difference Engine: a column goes dark for each phase you clear */}
            {DIFF_COLUMNS.map((x, col) => (
                <Model key={x} model={diffColumn(!(col < progress.bossPhase || progress.bossBeaten))} position={[x, 0.5, -118]} />
            ))}
            {/* Analytical Engine: boots when Babbage is beaten */}
            <Model model={analyticalEngine(progress.bossBeaten)} position={[0, 3.2, -131]} />
            {/* the Examiner, in front of his Engine */}
            <group position={BABBAGE_POS}>
                <VoxelAvatar look={BABBAGE_LOOK} npc={BABBAGE_EXTRAS} />
            </group>
            {/* the pad you stand on to face him */}
            <Model model={floorRing(1.6, 0, ready ? 0x19c3d6 : 0x2f4a55, ready)} position={[BOSS_PAD[0], -0.1, BOSS_PAD[2]]} shadows={false} />
        </group>
    )
}

interface AdaSpot {
    at: V3
    /** Seconds she stays after you first see her. */
    linger: number
    /** Leave only once you come close (else as soon as `linger` is up). */
    whenNear: boolean
    /** Direction she walks off in (x, z). */
    exit: [number, number]
}

const AHEAD = (z: number): AdaSpot => ({ at: [1.5, 0, z], linger: 0.5, whenNear: true, exit: [0, -1] })

/** Where Ada waits in each room of the Walk: by the exit, always a room ahead of you. */
const ADA_SPOTS: Partial<Record<RoomId, AdaSpot>> = {
    arrival: { at: [0, 0, -0.5], linger: 2.5, whenNear: false, exit: [0, -1] },
    abacus: AHEAD(-22.5),
    loom: AHEAD(-46),
    archive: AHEAD(-66),
    gears: AHEAD(-88),
    moth: AHEAD(-102.5),
}
const ON_BALCONY: AdaSpot = { at: ADA_BALCONY, linger: Infinity, whenNear: false, exit: [0, 0] }
const AFTER_VICTORY: AdaSpot = { at: ADA_BALCONY, linger: 5, whenNear: false, exit: [-1, 0] }
const NEAR = 6.5
const WALK_AWAY_S = 1.8

/**
 * Ada Lovelace on Floor 1: never a fight, always one room ahead (ADR-0013).
 * She looks back at you, slips off through the next door as you close in,
 * watches Babbage's fight from her balcony, and leaves for Floor 2 when he falls.
 */
function AdaLovelace() {
    const { room: here, progress, playerPosRef } = useFloor()
    const g = useRef<Group>(null)
    const motion = useRef<AvatarMotion>({ speed: 0, airborne: false })
    const gone = useRef(new Set<string>())
    const state = useRef<{ key: string | null; t: number; leaving: number }>({ key: null, t: 0, leaving: -1 })

    let key: string | null = null
    let spot: AdaSpot | null = null
    if (here === "engine") {
        // Seen beaten on arrival (a reload after victory): she has already gone.
        key = progress.bossBeaten ? "victory" : "balcony"
        spot = progress.bossBeaten ? AFTER_VICTORY : ON_BALCONY
    } else if (here && !progress.bossBeaten && ADA_SPOTS[here]) {
        key = here
        spot = ADA_SPOTS[here]!
    }

    useFrame((_, rawDt) => {
        const group = g.current
        if (!group) return
        const dt = Math.min(rawDt, 0.1)
        const s = state.current
        if (key !== s.key) {
            // A victory seen without the balcony first (e.g. after a reload) means she left long ago.
            if (key === "victory" && s.key !== "balcony") gone.current.add("victory")
            s.key = key
            s.t = 0
            s.leaving = -1
            if (spot) group.position.set(...spot.at)
        }
        if (!spot || !key || gone.current.has(key)) {
            group.visible = false
            return
        }
        group.visible = true
        s.t += dt
        const p = playerPosRef.current
        const [x, , z] = spot.at
        if (s.leaving < 0) {
            motion.current.speed = 0
            if (p) group.rotation.y = Math.atan2(p.x - group.position.x, p.z - group.position.z) // she looks at you
            const near = !!p && Math.hypot(p.x - x, p.z - z) < NEAR
            if (s.t > spot.linger && (!spot.whenNear || near)) s.leaving = 0
            return
        }
        s.leaving += dt
        const [ex, ez] = spot.exit
        group.rotation.y = Math.atan2(ex, ez)
        group.position.x += ex * 2.2 * dt
        group.position.z += ez * 2.2 * dt
        motion.current.speed = 2.2
        if (s.leaving > WALK_AWAY_S) gone.current.add(key)
    })

    return (
        <group ref={g} visible={false}>
            <VoxelAvatar look={LOVELACE_LOOK} motion={motion} />
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
