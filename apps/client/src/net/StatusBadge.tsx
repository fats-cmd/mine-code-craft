import { useBaseNet } from "./BaseNet"

export default function StatusBadge() {
    const { status, room, others, self } = useBaseNet()
    const text =
        status === "online"
            ? `online · ${self?.name ?? "you"} · instance ${room?.roomId} · ${others.length + 1} here`
            : status === "connecting"
              ? "connecting to the Base…"
              : "offline · server not reachable, playing solo"
    const dot = status === "online" ? "bg-emerald-400" : status === "connecting" ? "bg-amber-400" : "bg-rose-500"

    return (
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded bg-black/50 px-3 py-2 font-mono text-xs text-white">
            <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
            {text}
        </div>
    )
}
