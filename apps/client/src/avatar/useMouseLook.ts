import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { clampPitch } from "@mcc/shared"

const SENSITIVITY = 0.0025

export interface Look {
    yaw: number
    pitch: number
}

/**
 * Orbit angles for the third-person camera. Click the canvas to capture the
 * mouse; Esc releases it (the browser handles that part).
 */
export function useMouseLook() {
    const look = useRef<Look>({ yaw: 0, pitch: -0.35 })
    const canvas = useThree((s) => s.gl.domElement)

    useEffect(() => {
        const lock = () => {
            if (document.pointerLockElement !== canvas) void canvas.requestPointerLock()
        }

    // custom key to remove the mouse lock on the canvas
        const unlock = (e: KeyboardEvent) => {
            if (e.code === "KeyF") {
                if (document.pointerLockElement === canvas) {
                    document.exitPointerLock()
                }
            }
            // console.log("Key pressed:", e.code)
        } 
        const move = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return
            look.current.yaw -= e.movementX * SENSITIVITY
            look.current.pitch = clampPitch(look.current.pitch - e.movementY * SENSITIVITY)
        }
        canvas.addEventListener("click", lock)
        document.addEventListener("mousemove", move)
        document.addEventListener("keydown", unlock)
        return () => {
            canvas.removeEventListener("click", lock)
            document.removeEventListener("keydown", unlock)
            document.removeEventListener("mousemove", move)
        }


    }, [canvas])

    return look
}
