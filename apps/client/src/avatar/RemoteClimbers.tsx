import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { Group } from "three"
import { CENTER_TO_FEET, RENDER_DELAY_MS, roomAt } from "@mcc/shared"
import { useFloor } from "../floor/FloorContext"
import AvatarModel from "./AvatarModel"
import SpeechBubble from "../chat/SpeechBubble"
import { useBaseNet, type RosterEntry } from "../net/BaseNet"

function RemoteClimber({ entry }: { entry: RosterEntry }) {
    const { buffers, clock, lastSaid } = useBaseNet()
    const { playerPosRef } = useFloor()
    const said = lastSaid.get(entry.id)
    const group = useRef<Group>(null)
    // The Approach is solo: you only see someone while you're both in a shared room (the Hall).
    const [shown, setShown] = useState(false)

    useFrame(() => {
        const g = group.current
        const pose = buffers.get(entry.id)?.sample(clock.serverNow(performance.now()) - RENDER_DELAY_MS)
        if (!g || !pose) return
        const me = playerPosRef.current
        const visible = !!roomAt(pose.x, pose.z)?.shared && !!me && !!roomAt(me.x, me.z)?.shared
        g.visible = visible
        if (visible !== shown) setShown(visible)
        g.position.set(pose.x, pose.y - CENTER_TO_FEET, pose.z)
        g.rotation.y = pose.rotY
    })

    // Hidden until the first snapshot places it, so it never flashes at the origin.
    if (!shown) return <group ref={group} visible={false} />
    return (
        <group ref={group}>
            <AvatarModel look={entry.look} />
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
