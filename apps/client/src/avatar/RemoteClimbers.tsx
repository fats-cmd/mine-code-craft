import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { Group } from "three"
import { CENTER_TO_FEET, RENDER_DELAY_MS, roomAt } from "@mcc/shared"
import { useFloor } from "../floor/FloorContext"
import VoxelAvatar, { type AvatarMotion } from "./VoxelAvatar"
import SpeechBubble from "../chat/SpeechBubble"
import { useBaseNet, type RosterEntry } from "../net/BaseNet"

function RemoteClimber({ entry }: { entry: RosterEntry }) {
    const { buffers, clock, lastSaid } = useBaseNet()
    const { playerPosRef } = useFloor()
    const said = lastSaid.get(entry.id)
    const group = useRef<Group>(null)
    // The Approach is solo: you only see someone while you're both in a shared room (the Hall).
    const [shown, setShown] = useState(false)
    const shownRef = useRef(false)
    // Walk animation input, derived from how far the interpolated pose moved this frame.
    const motion = useRef<AvatarMotion>({ speed: 0, airborne: false })
    const last = useRef<{ x: number; y: number; z: number } | null>(null)
    const vy = useRef(0)

    useFrame((_, dt) => {
        const g = group.current
        const pose = buffers.get(entry.id)?.sample(clock.serverNow(performance.now()) - RENDER_DELAY_MS)
        if (!g || !pose) return
        const me = playerPosRef.current
        const visible = !!roomAt(pose.x, pose.z)?.shared && !!me && !!roomAt(me.x, me.z)?.shared
        g.visible = visible
        // State only on change: one re-render when someone enters or leaves view, not one per frame.
        if (visible !== shownRef.current) {
            shownRef.current = visible
            setShown(visible)
        }
        g.position.set(pose.x, pose.y - CENTER_TO_FEET, pose.z)
        g.rotation.y = pose.rotY

        const p = last.current
        if (p && dt > 0) {
            const speed = Math.hypot(pose.x - p.x, pose.z - p.z) / dt
            const k = 1 - Math.exp(-12 * dt)
            motion.current.speed += (speed - motion.current.speed) * k
            vy.current += ((pose.y - p.y) / dt - vy.current) * k
            motion.current.airborne = Math.abs(vy.current) > 1.2
            p.x = pose.x
            p.y = pose.y
            p.z = pose.z
        } else last.current = { x: pose.x, y: pose.y, z: pose.z }
    })

    // Hidden until the first snapshot places it, so it never flashes at the origin.
    if (!shown) return <group ref={group} visible={false} />
    return (
        <group ref={group}>
            <VoxelAvatar look={entry.look} motion={motion} />
            {said && <SpeechBubble key={said.at} line={said} height={2.6} />}
            <Html position={[0, 2.2, 0]} center zIndexRange={[10, 0]}>
                <div className="pointer-events-none whitespace-nowrap rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
                    {entry.name}
                </div>
            </Html>
        </group>
    )
}

export default function RemoteClimbers() {
    const { others } = useBaseNet()
    return others.map((entry) => <RemoteClimber key={entry.id} entry={entry} />)
}
