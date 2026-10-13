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
    clampDt,
    dampAngle,
    headingOf,
    inputToDirection,
    stepVerticalVelocity,
} from "@mcc/shared"
import AvatarModel from "./AvatarModel"
import type { Control } from "./controls"
import { useMouseLook } from "./useMouseLook"

const WALK_SPEED = 5
const RUN_SPEED = 9
const TURN_RATE = 14

// Capsule = cylinder of 2*HALF_HEIGHT plus two hemispheres of RADIUS: 1.8 tall.
const RADIUS = 0.35
const HALF_HEIGHT = 0.55
const CENTER_TO_FEET = HALF_HEIGHT + RADIUS

const SPAWN = { x: 0, y: CENTER_TO_FEET + 0.5, z: 4 }
const FALL_LIMIT = -30
// A small constant push into the floor keeps ground detection stable while idle.
const GROUND_STICK = 2

const CAMERA_DISTANCE = 6
const CAMERA_TARGET_HEIGHT = 0.7 // above the capsule centre, roughly head height
const DEG = Math.PI / 180

export default function Player() {
    const { world } = useRapier()
    const [, getKeys] = useKeyboardControls<Control>()
    const look = useMouseLook()

    const body = useRef<RapierRigidBody>(null)
    const collider = useRef<RapierCollider>(null)
    const model = useRef<Group>(null)
    const controller = useRef<ReturnType<typeof world.createCharacterController>>(null)
    const vy = useRef(0)
    const grounded = useRef(false)
    const cameraTarget = useRef(new Vector3())

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

        const keys = getKeys()
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
        if (next.y < FALL_LIMIT) {
            next = { ...SPAWN }
            vy.current = 0
        }
        rb.setNextKinematicTranslation(next)

        if (model.current && (dir.x !== 0 || dir.z !== 0)) {
            model.current.rotation.y = dampAngle(model.current.rotation.y, headingOf(dir), TURN_RATE, dt)
        }

        // Third-person orbit: sit behind the look direction, tilted by pitch.
        const { yaw, pitch } = look.current
        const target = cameraTarget.current.set(next.x, next.y + CAMERA_TARGET_HEIGHT, next.z)
        const horizontal = Math.cos(pitch) * CAMERA_DISTANCE
        camera.position.set(
            target.x + Math.sin(yaw) * horizontal,
            target.y - Math.sin(pitch) * CAMERA_DISTANCE,
            target.z + Math.cos(yaw) * horizontal,
        )
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
            <CapsuleCollider ref={collider} args={[HALF_HEIGHT, RADIUS]} />
            <group position={[0, -CENTER_TO_FEET, 0]}>
                <AvatarModel ref={model} />
            </group>
        </RigidBody>
    )
}
