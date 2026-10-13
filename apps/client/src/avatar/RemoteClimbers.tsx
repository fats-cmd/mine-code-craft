import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { Group } from "three"
import { CENTER_TO_FEET, RENDER_DELAY_MS } from "@mcc/shared"
import AvatarModel from "./AvatarModel"
import { useBaseNet, type RosterEntry } from "../net/BaseNet"

function RemoteClimber({ entry }: { entry: RosterEntry }) {
    const { buffers, clock } = useBaseNet()
    const group = useRef<Group>(null)

    useFrame(() => {
        const g = group.current
        const pose = buffers.get(entry.id)?.sample(clock.serverNow(performance.now()) - RENDER_DELAY_MS)
        if (!g || !pose) return
        g.visible = true
        g.position.set(pose.x, pose.y - CENTER_TO_FEET, pose.z)
        g.rotation.y = pose.rotY
    })

    // Hidden until the first snapshot places it, so it never flashes at the origin.
    return (
        <group ref={group} visible={false}>
            <AvatarModel color={entry.color} />
            <Html position={[0, 2.15, 0]} center zIndexRange={[10, 0]}>
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
