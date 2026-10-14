import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Object3D, Vector3, type DirectionalLight } from "three"
import { useFloor } from "./FloorContext"

/** Sky colour and fog (set on the scene in App): beyond FOG_FAR nothing shows, so rooms further than that aren't drawn. */
export const SKY = "#bfe3f2"
export const FOG_NEAR = 25
export const FOG_FAR = 80

/** Where the sunlight comes from: high and to one side, so walls cast short, readable shadows. */
const SUN_DIR = new Vector3(0.45, 1, 0.3).normalize()
const SUN_DISTANCE = 40
/** Half the width of the shadowed area around the Climber, metres. */
const SHADOW_EXTENT = 24
const SHADOW_MAP = 2048
const TEXEL = (2 * SHADOW_EXTENT) / SHADOW_MAP

// The light's own axes, for snapping its position to whole shadow-map texels.
// Without the snap, shadow edges crawl as you walk; with it they hold still.
const AXIS_Z = SUN_DIR.clone()
const AXIS_X = new Vector3(0, 1, 0).cross(AXIS_Z).normalize()
const AXIS_Y = AXIS_Z.clone().cross(AXIS_X)

/**
 * One directional light with shadows, plus sky fill. The shadow camera
 * follows the Climber, so the area near them always has crisp shadows at a
 * fixed cost however big the floor is.
 */
export default function Sun() {
    const { playerPosRef } = useFloor()
    const light = useRef<DirectionalLight>(null)
    const [target] = useState(() => new Object3D())
    const centre = useRef(new Vector3())

    useFrame(() => {
        const l = light.current
        const p = playerPosRef.current
        if (!l || !p) return
        const c = centre.current.set(p.x, p.y, p.z)
        const u = Math.round(c.dot(AXIS_X) / TEXEL) * TEXEL
        const v = Math.round(c.dot(AXIS_Y) / TEXEL) * TEXEL
        const w = c.dot(AXIS_Z)
        c.copy(AXIS_X).multiplyScalar(u).addScaledVector(AXIS_Y, v).addScaledVector(AXIS_Z, w)
        target.position.copy(c)
        target.updateMatrixWorld()
        l.position.copy(c).addScaledVector(SUN_DIR, SUN_DISTANCE)
    })

    return (
        <>
            <hemisphereLight args={["#e6f4ff", "#c9a27a", 1.1]} />
            <directionalLight
                ref={light}
                target={target}
                color="#fff3dc"
                intensity={2.2}
                castShadow
                shadow-mapSize={[SHADOW_MAP, SHADOW_MAP]}
                shadow-camera-left={-SHADOW_EXTENT}
                shadow-camera-right={SHADOW_EXTENT}
                shadow-camera-top={SHADOW_EXTENT}
                shadow-camera-bottom={-SHADOW_EXTENT}
                shadow-camera-near={1}
                shadow-camera-far={SUN_DISTANCE * 2}
                shadow-bias={-0.0004}
                shadow-normalBias={0.03}
            />
        </>
    )
}
