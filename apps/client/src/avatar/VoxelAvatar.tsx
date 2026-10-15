import { useEffect, useMemo, useRef, type Ref, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import type { BufferGeometry, Group } from "three"
import { DEFAULT_LOOK, type Look } from "@mcc/shared"
import { LIT, voxelGeometry } from "../voxel/geometry"
import { PIVOTS, VOXEL, buildAvatar, type AvatarPart, type NpcExtras } from "./avatarVoxels"

/** What the animation needs to know, written by whoever moves the avatar. */
export interface AvatarMotion {
    /** Horizontal speed, m/s. */
    speed: number
    airborne: boolean
}

const PARTS: AvatarPart[] = ["head", "torso", "armL", "armR", "legL", "legR"]
// Odd-width parts are built on integer voxel indices, so shift them half a voxel to centre them.
const CENTRE: Record<AvatarPart, [number, number, number]> = {
    head: [-0.5, 0, -0.5],
    torso: [-0.5, 0, -0.5],
    legL: [-0.5, 0, -0.5],
    legR: [-0.5, 0, -0.5],
    armL: [0, 0, 0],
    armR: [0, 0, 0],
}

/**
 * A voxel Climber (or NPC) with swinging limbs. Faces +Z, feet at y = 0.
 * Pass `motion` to animate; without it the avatar stands idle.
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
    const geometries = useMemo(() => {
        const parts = buildAvatar(look, npc)
        return Object.fromEntries(
            PARTS.map((p) => [p, voxelGeometry(parts[p], { scale: VOXEL, offset: CENTRE[p] })]),
        ) as Record<AvatarPart, BufferGeometry>
        // eslint-disable-next-line react-hooks/exhaustive-deps -- lookKey captures look and npc by value
    }, [lookKey])
    useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])

    const groups = useRef<Partial<Record<AvatarPart, Group>>>({})
    const phase = useRef(0)
    const swing = useRef(0)
    const air = useRef(0)

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt, 0.1)
        const m = motion?.current
        const speed = m?.speed ?? 0
        const airborne = m?.airborne ?? false
        // Stride frequency rises with speed; amplitude eases in and out so starts and stops don't snap.
        phase.current += dt * (4 + speed * 1.1)
        const targetSwing = airborne ? 0 : Math.min(speed / 5, 1.4) * 0.6
        swing.current += (targetSwing - swing.current) * (1 - Math.exp(-10 * dt))
        air.current += (Number(airborne) - air.current) * (1 - Math.exp(-12 * dt))
        const s = Math.sin(phase.current) * swing.current
        const g = groups.current
        if (g.legL) g.legL.rotation.x = s - air.current * 0.5
        if (g.legR) g.legR.rotation.x = -s + air.current * 0.3
        if (g.armL) g.armL.rotation.x = -s * 0.9 - air.current * 0.9
        if (g.armR) g.armR.rotation.x = s * 0.9 - air.current * 0.9
        // a small bob on each step
        if (g.torso) g.torso.position.y = Math.abs(Math.sin(phase.current)) * swing.current * 0.04
        if (g.head) g.head.position.y = PIVOTS.head[1] * VOXEL + Math.abs(Math.sin(phase.current)) * swing.current * 0.04
    })

    return (
        <group ref={ref}>
            {PARTS.map((p) => {
                const [x, y, z] = PIVOTS[p]
                return (
                    <group
                        key={p}
                        position={[x * VOXEL, y * VOXEL, z * VOXEL]}
                        ref={(el) => {
                            if (el) groups.current[p] = el
                        }}
                    >
                        <mesh geometry={geometries[p]} material={LIT} castShadow receiveShadow />
                    </group>
                )
            })}
        </group>
    )
}
