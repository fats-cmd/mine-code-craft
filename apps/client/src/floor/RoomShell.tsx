import type { ReactNode } from "react"
import type { RoomDef } from "@mcc/shared"
import Block, { Prop } from "./Block"
import { DOOR_HEIGHT, DOOR_WIDTH, ROOM_STYLE, WALL_HEIGHT, WALL_THICKNESS } from "./layout"

/**
 * Floor, side walls and both end walls of one room. End walls have a
 * doorway in the middle; the exit doorway is blocked until `exitOpen`.
 * Walls sit just inside the room, so neighbours' end walls stand back to
 * back and doorways line up.
 */
export default function RoomShell({
    room,
    exitOpen,
    closedEntrance = false,
    closedExit = false,
    floor = true,
    doorColor = "#7a5a2a",
    children,
}: {
    room: RoomDef
    exitOpen: boolean
    closedEntrance?: boolean
    closedExit?: boolean
    floor?: boolean
    doorColor?: string
    children?: ReactNode
}) {
    const style = ROOM_STYLE[room.id]
    const length = room.zMax - room.zMin
    const midZ = (room.zMax + room.zMin) / 2
    const half = room.width / 2
    const t = WALL_THICKNESS

    return (
        <group>
            {floor && <Block at={[0, -0.5, midZ]} size={[room.width, 1, length]} color={style.floor} />}
            <Block at={[-half + t / 2, WALL_HEIGHT / 2, midZ]} size={[t, WALL_HEIGHT, length]} color={style.wall} />
            <Block at={[half - t / 2, WALL_HEIGHT / 2, midZ]} size={[t, WALL_HEIGHT, length]} color={style.wall} />
            <EndWall z={room.zMax - t / 2} width={room.width} color={style.wall} closed={closedEntrance} />
            <EndWall z={room.zMin + t / 2} width={room.width} color={style.wall} closed={closedExit} />
            {!exitOpen && !closedExit && (
                <Block at={[0, DOOR_HEIGHT / 2, room.zMin + t / 2]} size={[DOOR_WIDTH, DOOR_HEIGHT, t * 0.9]} color={doorColor} />
            )}
            {children}
        </group>
    )
}

function EndWall({ z, width, color, closed }: { z: number; width: number; color: string; closed: boolean }) {
    const t = WALL_THICKNESS
    if (closed) return <Block at={[0, WALL_HEIGHT / 2, z]} size={[width, WALL_HEIGHT, t]} color={color} />
    const side = (width - DOOR_WIDTH) / 2
    const sideX = DOOR_WIDTH / 2 + side / 2
    return (
        <group>
            <Block at={[-sideX, WALL_HEIGHT / 2, z]} size={[side, WALL_HEIGHT, t]} color={color} />
            <Block at={[sideX, WALL_HEIGHT / 2, z]} size={[side, WALL_HEIGHT, t]} color={color} />
            <Prop at={[0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, z]} size={[DOOR_WIDTH, WALL_HEIGHT - DOOR_HEIGHT, t]} color={color} />
        </group>
    )
}
