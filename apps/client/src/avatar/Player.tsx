import { useKeyboardControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import {
    CapsuleCollider,
    RigidBody,
    useAfterPhysicsStep,
    useBeforePhysicsStep,
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
    verticalMove,
    type CorrectionMessage,
    type MoveMessage,
    type Vec3,
} from "@mcc/shared"
import VoxelAvatar, { type AvatarMotion } from "./VoxelAvatar"
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
// Highest ledge you walk up without jumping. Floor stairs use 0.5 m risers, so a little above that.
const STEP_HEIGHT = 0.55

const CAMERA_DISTANCE = 6
const CAMERA_MIN_DISTANCE = 0.8
const CAMERA_WALL_GAP = 0.3 // stop this far in front of a wall so the near plane doesn't clip it
const CAMERA_TARGET_HEIGHT = 0.7 // above the capsule centre, roughly head height
const DEG = Math.PI / 180

export default function Player() {
    const { world, rapier } = useRapier()
    const camera = useThree((st) => st.camera)
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
    const sinceSend = useRef(0)
    const lastSent = useRef<MoveMessage | null>(null)
    const correction = useRef<Vec3 | null>(null)
    const motion = useRef<AvatarMotion>({ speed: 0, airborne: false })

    // Per-step scratch, reused so the game loop allocates nothing (no GC hitches mid-jump).
    const lastStepAt = useRef(0)
    const stepDt = useRef(0)
    const heading = useRef({ x: 0, z: 0 })
    const desired = useRef({ x: 0, y: 0, z: 0 })
    const target = useRef({ x: 0, y: 0, z: 0 })
    const prevPos = useRef<{ x: number; y: number; z: number }>({ x: SPAWN.x, y: SPAWN.y, z: SPAWN.z })
    const camTarget = useRef(new Vector3())
    const camDistance = useRef(CAMERA_DISTANCE)
    const ray = useRef<InstanceType<typeof rapier.Ray> | null>(null)

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
        c.enableAutostep(STEP_HEIGHT, 0.2, false)
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

    // 1) Before the physics step: read input, sweep the capsule, set where the body goes this step.
    //    Running inside Rapier's step (not a separate useFrame) means every step moves the body
    //    exactly once, whatever the monitor's refresh rate: no dropped or doubled movement.
    useBeforePhysicsStep(() => {
        const rb = body.current
        const col = collider.current
        const ctrl = controller.current
        const now = performance.now()
        // The character controller sweeps the capsule, so even a large step can't tunnel;
        // the clamp keeps gravity and jumps sane after a stall (e.g. a backgrounded tab).
        const dt = lastStepAt.current ? clampDt((now - lastStepAt.current) / 1000) : 0
        lastStepAt.current = now
        stepDt.current = dt
        if (!dt || !rb || !col || !ctrl) return

        // Typing "w" in chat, or answering a Task, must not walk you forward.
        const keys = isTyping() || inputBlockedRef.current ? NO_KEYS : getKeys()
        const dir = inputToDirection(keys, look.current.yaw)
        heading.current.x = dir.x
        heading.current.z = dir.z
        const speed = keys.run ? RUN_SPEED : WALK_SPEED

        const vertical = verticalMove(vy.current, grounded.current, keys.jump, dt)
        vy.current = vertical.vy
        const d = desired.current
        d.x = dir.x * speed * dt
        d.y = grounded.current && vertical.vy === 0 && vertical.dy === 0 ? -GROUND_STICK * dt : vertical.dy
        d.z = dir.z * speed * dt

        ctrl.computeColliderMovement(col, d)
        const moved = ctrl.computedMovement()
        grounded.current = ctrl.computedGrounded()
        // Hit a ceiling on the way up: stop rising instead of sticking to it.
        if (vy.current > 0 && moved.y < d.y * 0.5) vy.current = 0

        const p = rb.translation()
        const t = target.current
        t.x = p.x + moved.x
        t.y = p.y + moved.y
        t.z = p.z + moved.z
        const teleport = teleportRef.current
        if (teleport) {
            // Dev teleport (?debug). The server only honours it when run with --dev-teleport.
            t.x = teleport[0]
            t.y = teleport[1]
            t.z = teleport[2]
            teleportRef.current = null
            vy.current = 0
            room?.send(Msg.teleport, { x: t.x, y: t.y, z: t.z })
            lastSent.current = { x: t.x, y: t.y, z: t.z, rotY: lastSent.current?.rotY ?? 0 }
        } else if (correction.current) {
            t.x = correction.current.x
            t.y = correction.current.y
            t.z = correction.current.z
            correction.current = null
            vy.current = 0
        } else if (t.y < FALL_LIMIT) {
            t.x = SPAWN.x
            t.y = SPAWN.y
            t.z = SPAWN.z
            vy.current = 0
            room?.send(Msg.respawn)
            lastSent.current = { ...SPAWN, rotY: lastSent.current?.rotY ?? 0 }
        }
        rb.setNextKinematicTranslation(t)
    })

    // 2) After the step: the body is where it will be drawn this frame. Camera, facing,
    //    animation and networking all read that one position, so nothing can drift apart.
    useAfterPhysicsStep(() => {
        const rb = body.current
        const dt = stepDt.current
        if (!rb || !dt) return
        const p = rb.translation()

        const prev = prevPos.current
        motion.current.speed = Math.hypot(p.x - prev.x, p.z - prev.z) / dt
        motion.current.airborne = !grounded.current
        prev.x = p.x
        prev.y = p.y
        prev.z = p.z
        // Everyone else reads this same object; it is never replaced, so nothing allocates.
        playerPosRef.current = prev

        const h = heading.current
        if (model.current && (h.x !== 0 || h.z !== 0)) {
            model.current.rotation.y = dampAngle(model.current.rotation.y, headingOf(h), TURN_RATE, dt)
        }

        sinceSend.current += dt
        if (room && sinceSend.current >= 1 / MOVE_SEND_HZ) {
            sinceSend.current = 0
            const rotY = model.current?.rotation.y ?? 0
            const last = lastSent.current
            if (
                !last ||
                Math.abs(last.x - p.x) > SEND_EPSILON_POS ||
                Math.abs(last.y - p.y) > SEND_EPSILON_POS ||
                Math.abs(last.z - p.z) > SEND_EPSILON_POS ||
                Math.abs(last.rotY - rotY) > SEND_EPSILON_ROT
            ) {
                const move: MoveMessage = { x: p.x, y: p.y, z: p.z, rotY }
                room.send(Msg.move, move)
                lastSent.current = move
            }
        }

        // Third-person orbit: sit behind the look direction, tilted by pitch. Indoors, pull in at
        // once when a wall gets between you and the camera, and ease back out so it never pops.
        const { yaw, pitch } = look.current
        const focus = camTarget.current.set(p.x, p.y + CAMERA_TARGET_HEIGHT, p.z)
        const bx = Math.sin(yaw) * Math.cos(pitch)
        const by = -Math.sin(pitch)
        const bz = Math.cos(yaw) * Math.cos(pitch)
        const r = ray.current ?? (ray.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }))
        r.origin.x = focus.x
        r.origin.y = focus.y
        r.origin.z = focus.z
        r.dir.x = bx
        r.dir.y = by
        r.dir.z = bz
        const hit = world.castRay(r, CAMERA_DISTANCE, true, undefined, undefined, undefined, rb)
        const allowed = hit ? Math.max(CAMERA_MIN_DISTANCE, hit.timeOfImpact - CAMERA_WALL_GAP) : CAMERA_DISTANCE
        camDistance.current =
            allowed < camDistance.current ? allowed : camDistance.current + (allowed - camDistance.current) * (1 - Math.exp(-6 * dt))
        const dist = camDistance.current
        camera.position.set(focus.x + bx * dist, focus.y + by * dist, focus.z + bz * dist)
        camera.lookAt(focus)
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
                <VoxelAvatar ref={model} look={self?.look} motion={motion} />
            </group>
            {said && <SpeechBubble key={said.at} line={said} height={2.25 - CENTER_TO_FEET} />}
        </RigidBody>
    )
}
