import { useKeyboardControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import {
    CapsuleCollider,
    RigidBody,
    useRapier,
    type RapierCollider,
    type RapierRigidBody,
} from "@react-three/rapier"
import { useEffect, useRef } from "react"
import { Vector3, type Group } from "three"
import {
    CAPSULE_HALF_HEIGHT,
    CAPSULE_RADIUS,
    CENTER_TO_FEET,
    MOVE_SEND_HZ,
    Msg,
    RUN_SPEED,
    SPAWN,
    WALK_SPEED,
    clampDt,
    dampAngle,
    headingOf,
    inputToDirection,
    stepVerticalVelocity,
    type CorrectionMessage,
    type MoveMessage,
    type Vec3,
} from "@mcc/shared"
import AvatarModel from "./AvatarModel"
import type { Control } from "./controls"
import { useMouseLook } from "./useMouseLook"
import { useBaseNet } from "../net/BaseNet"
import SpeechBubble from "../chat/SpeechBubble"
import { isTyping } from "../chat/typing"
import { useFloor } from "../floor/FloorContext"

const NO_KEYS = { forward: false, back: false, left: false, right: false, jump: false, run: false }

const TURN_RATE = 14
const FALL_LIMIT = -30
// Below these the server isn't told about a move: standing still sends nothing.
const SEND_EPSILON_POS = 0.01
const SEND_EPSILON_ROT = 0.01
// A small constant push into the floor keeps ground detection stable while idle.
const GROUND_STICK = 2

const CAMERA_DISTANCE = 6
const CAMERA_MIN_DISTANCE = 0.8
const CAMERA_WALL_GAP = 0.3 // stop this far in front of a wall so the near plane doesn't clip it
const CAMERA_TARGET_HEIGHT = 0.7 // above the capsule centre, roughly head height
const DEG = Math.PI / 180

export default function Player() {
    const { world, rapier } = useRapier()
    const { playerPosRef, inputBlockedRef, teleportRef } = useFloor()
    const [, getKeys] = useKeyboardControls<Control>()
    const look = useMouseLook()
    const { room, self, lastSaid } = useBaseNet()
    const said = self ? lastSaid.get(self.id) : undefined

    const body = useRef<RapierRigidBody>(null)
    const collider = useRef<RapierCollider>(null)
    const model = useRef<Group>(null)
    const controller = useRef<ReturnType<typeof world.createCharacterController>>(null)
    const vy = useRef(0)
    const grounded = useRef(false)
    const cameraTarget = useRef(new Vector3())
    const sinceSend = useRef(0)
    const lastSent = useRef<MoveMessage | null>(null)
    const correction = useRef<Vec3 | null>(null)

    // Joining puts you wherever the server spawned you.
    const spawn = self?.spawn
    useEffect(() => {
        if (spawn) correction.current = spawn
    }, [spawn])

    // The server refused a move (too fast, out of bounds): go where it says.
    useEffect(() => {
        if (!room) return
        lastSent.current = null
        return room.onMessage(Msg.correction, (pos: CorrectionMessage) => {
            correction.current = pos
        })
    }, [room])

    useEffect(() => {
        const c = world.createCharacterController(0.02)
        c.enableAutostep(0.5, 0.2, false)
        c.enableSnapToGround(0.4)
        c.setMaxSlopeClimbAngle(45 * DEG)
        c.setMinSlopeSlideAngle(35 * DEG)
        c.setSlideEnabled(true)
        controller.current = c
        return () => {
            world.removeCharacterController(c)
            controller.current = null
        }
    }, [world])

    useFrame(({ camera }, rawDt) => {
        // The character controller sweeps the capsule, so even a large step
        // can't tunnel; the clamp keeps gravity and jumps sane after a stall.
        const dt = clampDt(rawDt)
        const rb = body.current
        const col = collider.current
        const ctrl = controller.current
        if (!dt || !rb || !col || !ctrl) return

        // Typing "w" in chat, or answering a Task, must not walk you forward.
        const keys = isTyping() || inputBlockedRef.current ? NO_KEYS : getKeys()
        const dir = inputToDirection(keys, look.current.yaw)
        const speed = keys.run ? RUN_SPEED : WALK_SPEED

        vy.current = stepVerticalVelocity(vy.current, grounded.current, keys.jump, dt)
        const dy = grounded.current && vy.current === 0 ? -GROUND_STICK * dt : vy.current * dt
        const desired = { x: dir.x * speed * dt, y: dy, z: dir.z * speed * dt }

        ctrl.computeColliderMovement(col, desired)
        const moved = ctrl.computedMovement()
        grounded.current = ctrl.computedGrounded()
        // Hit a ceiling on the way up: stop rising instead of sticking to it.
        if (vy.current > 0 && moved.y < desired.y * 0.5) vy.current = 0

        const p = rb.translation()
        let next = { x: p.x + moved.x, y: p.y + moved.y, z: p.z + moved.z }
        const teleport = teleportRef.current
        if (teleport) {
            // Dev teleport (?debug). The server only honours it when run with --dev-teleport.
            next = { x: teleport[0], y: teleport[1], z: teleport[2] }
            teleportRef.current = null
            vy.current = 0
            room?.send(Msg.teleport, next)
            lastSent.current = { ...next, rotY: lastSent.current?.rotY ?? 0 }
        } else if (correction.current) {
            next = correction.current
            correction.current = null
            vy.current = 0
        } else if (next.y < FALL_LIMIT) {
            next = { ...SPAWN }
            vy.current = 0
            room?.send(Msg.respawn)
            lastSent.current = { ...SPAWN, rotY: lastSent.current?.rotY ?? 0 }
        }
        rb.setNextKinematicTranslation(next)
        playerPosRef.current = next

        if (model.current && (dir.x !== 0 || dir.z !== 0)) {
            model.current.rotation.y = dampAngle(model.current.rotation.y, headingOf(dir), TURN_RATE, dt)
        }

        sinceSend.current += dt
        if (room && sinceSend.current >= 1 / MOVE_SEND_HZ) {
            sinceSend.current = 0
            const move = { ...next, rotY: model.current?.rotation.y ?? 0 }
            if (hasMoved(lastSent.current, move)) {
                room.send(Msg.move, move)
                lastSent.current = move
            }
        }

        // Third-person orbit: sit behind the look direction, tilted by pitch.
        // Indoors, pull in when a wall is between the Climber and the camera.
        const { yaw, pitch } = look.current
        const target = cameraTarget.current.set(next.x, next.y + CAMERA_TARGET_HEIGHT, next.z)
        const back = { x: Math.sin(yaw) * Math.cos(pitch), y: -Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) }
        const hit = world.castRay(new rapier.Ray(target, back), CAMERA_DISTANCE, true, undefined, undefined, undefined, rb)
        const distance = hit ? Math.max(CAMERA_MIN_DISTANCE, hit.timeOfImpact - CAMERA_WALL_GAP) : CAMERA_DISTANCE
        camera.position.set(target.x + back.x * distance, target.y + back.y * distance, target.z + back.z * distance)
        camera.lookAt(target)
    })

    return (
        <RigidBody
            ref={body}
            type="kinematicPosition"
            colliders={false}
            position={[SPAWN.x, SPAWN.y, SPAWN.z]}
            enabledRotations={[false, false, false]}
        >
            <CapsuleCollider ref={collider} args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]} />
            <group position={[0, -CENTER_TO_FEET, 0]}>
                <AvatarModel ref={model} look={self?.look} />
            </group>
            {said && <SpeechBubble key={said.at} line={said} height={2.25 - CENTER_TO_FEET} />}
        </RigidBody>
    )
}

function hasMoved(prev: MoveMessage | null, next: MoveMessage): boolean {
    if (!prev) return true
    return (
        Math.abs(prev.x - next.x) > SEND_EPSILON_POS ||
        Math.abs(prev.y - next.y) > SEND_EPSILON_POS ||
        Math.abs(prev.z - next.z) > SEND_EPSILON_POS ||
        Math.abs(prev.rotY - next.rotY) > SEND_EPSILON_ROT
    )
}
