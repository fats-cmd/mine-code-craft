import { useEffect, useMemo, useRef, type Ref, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import type { BufferGeometry, Group } from "three"
import { DEFAULT_LOOK, type Idle, type Look } from "@mcc/shared"
import { LIT, voxelGeometry } from "../voxel/geometry"
import { PARTS, VOXEL, buildAvatar, type AvatarPart, type NpcExtras } from "./avatarVoxels"
import { VOX_PARTS } from "./voxParts"

/** What the animation needs to know, written by whoever moves the avatar. */
export interface AvatarMotion {
    /** Horizontal speed, m/s. */
    speed: number
    airborne: boolean
}

/** What each mesh carries in userData, so the editor can turn a click into a voxel. */
export interface PartTag {
    part: AvatarPart
    offset: [number, number, number]
}

type Pose = Partial<Record<AvatarPart, [number, number, number]>>

/** Standing poses (part rotations, radians). Arms hang along -y: -x swings forward, ±z swings out. */
const IDLE_POSES: Record<Idle, Pose> = {
    relaxed: { armL: [0, 0, -0.06], armR: [0, 0, 0.06] },
    pockets: { armL: [0.3, 0, 0.12], armR: [0.3, 0, -0.12], head: [0.05, 0, 0] },
    fighter: { armL: [-1.2, 0, -0.35], armR: [-0.85, 0, 0.35], legL: [0.15, 0, -0.12], legR: [-0.2, 0, 0.12], head: [0.08, 0, 0] },
    proud: { armL: [0.15, 0, -0.55], armR: [0.15, 0, 0.55], head: [-0.12, 0, 0] },
}

/**
 * A voxel Climber (or NPC) with swinging limbs. Faces +Z, feet at y = 0.
 * Pass `motion` to animate; without it the avatar stands in its idle pose.
 */
export default function VoxelAvatar({
    look = DEFAULT_LOOK,
    npc,
    motion,
    ref,
}: {
    look?: Look
    npc?: NpcExtras
    motion?: RefObject<AvatarMotion>
    ref?: Ref<Group>
}) {
    const lookKey = JSON.stringify(look) + JSON.stringify(npc ?? {})
    const built = useMemo(() => {
        const { parts, rig } = buildAvatar(look, npc, VOX_PARTS)
        const geometries = Object.fromEntries(
            PARTS.map((p) => [p, voxelGeometry(parts[p], { scale: VOXEL, offset: rig.offsets[p] })]),
        ) as Record<AvatarPart, BufferGeometry>
        return { geometries, rig }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- lookKey captures look and npc by value
    }, [lookKey])
    useEffect(() => () => Object.values(built.geometries).forEach((g) => g.dispose()), [built])

    const groups = useRef<Partial<Record<AvatarPart, Group>>>({})
    const phase = useRef(0)
    const swing = useRef(0)
    const air = useRef(0)
    const still = useRef(1)
    const breath = useRef(0)
    const idle = IDLE_POSES[look.idle] ?? IDLE_POSES.relaxed

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt, 0.1)
        const m = motion?.current
        const speed = m?.speed ?? 0
        const airborne = m?.airborne ?? false
        // Stride frequency rises with speed; amplitude eases in and out so starts and stops don't snap.
        phase.current += dt * (4 + speed * 1.1)
        breath.current += dt * 2.2
        const targetSwing = airborne ? 0 : Math.min(speed / 5, 1.4) * 0.6
        swing.current += (targetSwing - swing.current) * (1 - Math.exp(-10 * dt))
        air.current += (Number(airborne) - air.current) * (1 - Math.exp(-12 * dt))
        // How much of the idle pose shows: all of it standing, none of it walking or jumping.
        const targetStill = speed < 0.3 && !airborne ? 1 : 0
        still.current += (targetStill - still.current) * (1 - Math.exp(-8 * dt))

        const s = Math.sin(phase.current) * swing.current
        const k = still.current
        const g = groups.current
        const pose = (p: AvatarPart, x: number) => {
            const part = g[p]
            if (!part) return
            const [ix, iy, iz] = idle[p] ?? [0, 0, 0]
            part.rotation.set(x + ix * k, iy * k, iz * k)
        }
        pose("legL", s - air.current * 0.5)
        pose("legR", -s + air.current * 0.3)
        pose("armL", -s * 0.9 - air.current * 0.9)
        pose("armR", s * 0.9 - air.current * 0.9)
        pose("head", 0)
        // a small bob on each step, and breathing when still
        const bob = Math.abs(Math.sin(phase.current)) * swing.current * 0.04 + Math.sin(breath.current) * 0.006 * k
        const headY = built.rig.pivots.head[1] * VOXEL
        if (g.torso) g.torso.position.y = bob
        if (g.head) g.head.position.y = headY + bob
        for (const arm of ["armL", "armR"] as const) {
            const a = g[arm]
            if (a) a.position.y = built.rig.pivots[arm][1] * VOXEL + bob
        }
    })

    return (
        <group ref={ref}>
            {PARTS.map((p) => {
                const [x, y, z] = built.rig.pivots[p]
                const tag: PartTag = { part: p, offset: built.rig.offsets[p] }
                return (
                    <group
                        key={p}
                        position={[x * VOXEL, y * VOXEL, z * VOXEL]}
                        ref={(el) => {
                            if (el) groups.current[p] = el
                        }}
                    >
                        <mesh geometry={built.geometries[p]} material={LIT} userData={tag} castShadow receiveShadow />
                    </group>
                )
            })}
        </group>
    )
}
