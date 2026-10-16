import { useEffect, useState } from "react"
import { button, useControls } from "leva"
import { TESTING_FLOOR_HENCHMEN, TESTING_FLOOR_ROOMS } from "@mcc/shared"
import { useFloor } from "./FloorContext"
import { HENCHMAN_POS, teleportTarget } from "./layout"

/**
 * ?debug only: jump to any room and fake progress, so a greybox room can
 * be checked without replaying the floor. Online, the server must run with
 * --dev-teleport (npm run dev does) or it will correct you back.
 */
export default function DevFloorControls() {
    const { teleportRef, dispatch } = useFloor()
    useControls(
        "Floor 1",
        () => ({
            ...Object.fromEntries(
                TESTING_FLOOR_ROOMS.map((r) => [`→ ${r.name}`, button(() => (teleportRef.current = teleportTarget(r)))]),
            ),
            // Just in front of each henchman, in E range.
            ...Object.fromEntries(
                TESTING_FLOOR_HENCHMEN.map((h) => {
                    const [x, , z] = HENCHMAN_POS[h.id]
                    return [`→ ${h.name}`, button(() => (teleportRef.current = [x, 2, z + 2]))]
                }),
            ),
            "beat all henchmen": button(() => TESTING_FLOOR_HENCHMEN.forEach((h) => dispatch({ type: "defeat", id: h.id }))),
            "reset progress": button(() => dispatch({ type: "reset" })),
        }),
        { collapsed: true },
    )
    return null
}

/** ?debug only: live position of the local Climber, handy when placing greybox pieces. */
export function DevPosition() {
    const { playerPosRef, room } = useFloor()
    const [text, setText] = useState("")
    useEffect(() => {
        const id = setInterval(() => {
            const p = playerPosRef.current
            if (p) setText(`x ${p.x.toFixed(1)}  y ${p.y.toFixed(1)}  z ${p.z.toFixed(1)}`)
        }, 200)
        return () => clearInterval(id)
    }, [playerPosRef])
    return (
        <div data-testid="dev-position" className="pointer-events-none absolute left-3 top-14 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-lime-300">
            {text} · {room ?? "—"}
        </div>
    )
}
