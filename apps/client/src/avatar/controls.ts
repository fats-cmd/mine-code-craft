import type { KeyboardControlsEntry } from "@react-three/drei"

export type Control = "forward" | "back" | "left" | "right" | "jump" | "run"

export const controlMap: KeyboardControlsEntry<Control>[] = [
    { name: "forward", keys: ["KeyW", "ArrowUp"] },
    { name: "back", keys: ["KeyS", "ArrowDown"] },
    { name: "left", keys: ["KeyA", "ArrowLeft"] },
    { name: "right", keys: ["KeyD", "ArrowRight"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
]
