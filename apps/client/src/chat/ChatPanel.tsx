import { useEffect, useRef, useState } from "react"
import { CHAT_MAX } from "@mcc/shared"
import { useBaseNet } from "../net/BaseNet"
import { isTyping } from "./typing"

const VISIBLE_LINES = 8

/**
 * World chat. Enter opens the input (and frees the mouse), Enter sends,
 * Esc cancels. Text is rendered by React, which escapes it.
 */
export default function ChatPanel() {
    const { chat, sendChat, status } = useBaseNet()
    const [draft, setDraft] = useState("")
    const [open, setOpen] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    const online = status === "online"

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Enter" || isTyping() || !online) return
            e.preventDefault()
            if (document.pointerLockElement) document.exitPointerLock()
            setOpen(true)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [online])

    useEffect(() => {
        if (open) input.current?.focus()
    }, [open])

    const close = () => {
        setOpen(false)
        setDraft("")
        input.current?.blur()
    }

    const lines = chat.slice(-VISIBLE_LINES)

    return (
        <div className="absolute bottom-14 left-3 w-80 max-w-[calc(100vw-1.5rem)] font-mono text-xs">
            <ul className="pointer-events-none mb-1 space-y-0.5">
                {lines.map((line) => (
                    <li
                        key={`${line.at}-${line.from}`}
                        className="w-fit max-w-full break-words rounded bg-black/45 px-2 py-0.5 text-white"
                    >
                        {line.from === "system" ? (
                            <span className="italic text-slate-300">{line.text}</span>
                        ) : (
                            <>
                                <span className="font-semibold text-amber-300">{line.name}</span>: {line.text}
                            </>
                        )}
                    </li>
                ))}
            </ul>
            {open ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendChat(draft)
                        close()
                    }}
                >
                    <input
                        ref={input}
                        value={draft}
                        maxLength={CHAT_MAX}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") close()
                        }}
                        onBlur={close}
                        placeholder="Say something… (Enter to send, Esc to cancel)"
                        className="w-full rounded bg-black/70 px-2 py-1.5 text-white outline-none ring-1 ring-white/30 placeholder:text-slate-400 focus:ring-amber-300"
                    />
                </form>
            ) : (
                online && <div className="pointer-events-none text-[11px] text-white/70">Press Enter to chat</div>
            )}
        </div>
    )
}
