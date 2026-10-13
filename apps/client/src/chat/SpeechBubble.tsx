import { useEffect, useState } from "react"
import { Html } from "@react-three/drei"
import type { ChatEntry } from "../net/BaseNet"

const SHOW_MS = 6000

/**
 * The speaker's latest line over their head for a few seconds. Give it
 * `key={line.at}` so each new line remounts it and restarts the timer.
 */
export default function SpeechBubble({ line, height }: { line: ChatEntry; height: number }) {
    const [visible, setVisible] = useState(() => Date.now() - line.at < SHOW_MS)

    useEffect(() => {
        const left = SHOW_MS - (Date.now() - line.at)
        if (left <= 0) return
        const id = setTimeout(() => setVisible(false), left)
        return () => clearTimeout(id)
    }, [line.at])

    if (!visible) return null
    return (
        <Html position={[0, height, 0]} center zIndexRange={[20, 10]}>
            <div className="pointer-events-none w-max max-w-56 break-words rounded-lg bg-white px-2.5 py-1.5 text-center text-xs text-slate-900 shadow">
                {line.text}
            </div>
        </Html>
    )
}
