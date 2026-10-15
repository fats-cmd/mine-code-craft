import { useEffect, useRef } from "react"
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"
import { CameraControls, CameraControlsImpl, ContactShadows } from "@react-three/drei"
import { NeutralToneMapping, Vector3, type Mesh, type Object3D } from "three"
import type { AvatarPart, Look } from "@mcc/shared"
import VoxelAvatar, { type PartTag } from "../avatar/VoxelAvatar"
import { VOXEL } from "../avatar/avatarVoxels"
import { FOCUS, type FocusId } from "./editorOptions"

const { ACTION } = CameraControlsImpl

/** A voxel on the avatar, in its part's own coordinates. */
export interface VoxelHit {
    part: AvatarPart
    x: number
    y: number
    z: number
}

/**
 * The voxel under the pointer: step half a voxel back into the surface that
 * was hit, then undo the part's mesh offset and scale.
 */
function voxelAt(e: ThreeEvent<PointerEvent>): { hit: VoxelHit; centre: Vector3 } | null {
    const tag = e.object.userData as Partial<PartTag>
    if (!tag.part || !tag.offset || !e.face) return null
    const local = e.object.worldToLocal(e.point.clone()).addScaledVector(e.face.normal, -VOXEL / 2)
    const [ox, oy, oz] = tag.offset
    const x = Math.floor(local.x / VOXEL - ox)
    const y = Math.floor(local.y / VOXEL - oy)
    const z = Math.floor(local.z / VOXEL - oz)
    const centre = e.object.localToWorld(new Vector3((x + ox + 0.5) * VOXEL, (y + oy + 0.5) * VOXEL, (z + oz + 0.5) * VOXEL))
    return { hit: { part: tag.part, x, y, z }, centre }
}

/**
 * The editor's 3D stage. Drag to turn, wheel to zoom; the toolbox moves the
 * camera between body regions. In paint mode the left button paints instead
 * and turning moves to the right button.
 */
export default function EditorStage({
    look,
    focus,
    spin,
    painting,
    turnRequest,
    onPaint,
    onStrokeStart,
}: {
    look: Look
    focus: FocusId
    spin: boolean
    painting: boolean
    /** Bump `n` to turn the camera by `angle` radians. */
    turnRequest: { n: number; angle: number }
    onPaint: (hit: VoxelHit) => void
    onStrokeStart: () => void
}) {
    return (
        <Canvas camera={{ position: [0, 1.3, 5.4], fov: 35 }} gl={{ toneMapping: NeutralToneMapping, alpha: true }} shadows="percentage" dpr={[1, 2]}>
            <hemisphereLight args={["#e6f4ff", "#3a4a7a", 1.3]} />
            <directionalLight position={[2.5, 4, 3]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-3, 2, -3]} intensity={0.8} color="#9fd2ff" />
            <Rig focus={focus} spin={spin && !painting} painting={painting} turnRequest={turnRequest} />
            <Avatar look={look} painting={painting} onPaint={onPaint} onStrokeStart={onStrokeStart} />
            {/* the pedestal */}
            <mesh position={[0, -0.06, 0]} receiveShadow>
                <cylinderGeometry args={[0.75, 0.8, 0.12, 40]} />
                <meshLambertMaterial color="#26336b" />
            </mesh>
            <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={2.4} blur={2.2} far={2} />
        </Canvas>
    )
}

function Rig({ focus, spin, painting, turnRequest }: { focus: FocusId; spin: boolean; painting: boolean; turnRequest: { n: number; angle: number } }) {
    const controls = useRef<CameraControlsImpl>(null)

    useEffect(() => {
        const c = controls.current
        if (!c) return
        // Keep the current viewing angle; move the target and distance together.
        const f = FOCUS[focus]
        const pos = new Vector3().setFromSphericalCoords(f.distance, c.polarAngle, c.azimuthAngle)
        void c.setLookAt(pos.x, f.y + pos.y, pos.z, 0, f.y, 0, true)
    }, [focus])

    useEffect(() => {
        if (turnRequest.n) void controls.current?.rotate(turnRequest.angle, 0, true)
    }, [turnRequest])

    useEffect(() => {
        const c = controls.current
        if (!c) return
        c.mouseButtons.left = painting ? ACTION.NONE : ACTION.ROTATE
        c.mouseButtons.right = painting ? ACTION.ROTATE : ACTION.TRUCK
    }, [painting])

    useFrame((_, dt) => {
        if (spin) void controls.current?.rotate(dt * 0.35, 0, false)
    })

    return (
        <CameraControls
            ref={controls}
            minDistance={0.8}
            maxDistance={7}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 + 0.15}
            smoothTime={0.35}
        />
    )
}

function Avatar({
    look,
    painting,
    onPaint,
    onStrokeStart,
}: {
    look: Look
    painting: boolean
    onPaint: (hit: VoxelHit) => void
    onStrokeStart: () => void
}) {
    const cursor = useRef<Mesh>(null)
    const stroking = useRef(false)

    useEffect(() => {
        const up = () => (stroking.current = false)
        window.addEventListener("pointerup", up)
        return () => window.removeEventListener("pointerup", up)
    }, [])

    const showCursor = (at: Vector3 | null, parent?: Object3D) => {
        const c = cursor.current
        if (!c) return
        c.visible = !!at
        if (at) c.position.copy(at)
        if (parent) c.quaternion.copy(parent.getWorldQuaternion(c.quaternion))
    }

    return (
        <group
            onPointerMove={(e) => {
                if (!painting) return
                e.stopPropagation()
                const v = voxelAt(e)
                showCursor(v?.centre ?? null, e.object)
                if (v && stroking.current) onPaint(v.hit)
            }}
            onPointerOut={() => showCursor(null)}
            onPointerDown={(e) => {
                if (!painting || e.button !== 0) return
                e.stopPropagation()
                const v = voxelAt(e)
                if (!v) return
                stroking.current = true
                onStrokeStart()
                onPaint(v.hit)
            }}
        >
            <VoxelAvatar look={look} />
            <mesh ref={cursor} visible={false} raycast={() => null}>
                <boxGeometry args={[VOXEL * 1.08, VOXEL * 1.08, VOXEL * 1.08]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthTest={false} />
            </mesh>
        </group>
    )
}
