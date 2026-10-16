import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
    ACCENT_COLORS,
    BODY_COLORS,
    BOTTOMS,
    BUILD,
    CLOTH_COLORS,
    HAIR,
    HEADWEAR,
    IDLE,
    MAX_PAINT_MARKS,
    NAME_MAX,
    PAINT_COLORS,
    SHOES,
    SKIN_COLORS,
    TOP,
    VISOR,
    checkName,
    decodePaint,
    encodePaint,
    type JoinOptions,
    type Look,
    type PaintMark,
} from "@mcc/shared"
import EditorStage, { type VoxelHit } from "./EditorStage"
import { TABS, label, markKey, mirrorMark, randomLook, type FocusId, type TabId } from "./editorOptions"

/**
 * The locker: build your Climber on a turntable before entering the Base.
 * Slots on the right (body, hair, face and hats, top, bottoms, shoes), paint
 * for markings, the camera follows whichever slot you're on.
 */
export default function CharacterEditor({ initial, onEnter }: { initial: JoinOptions; onEnter: (identity: JoinOptions) => void }) {
    const [name, setName] = useState(initial.name)
    // The outfit is everything but paint; paint lives in `marks` and is packed into the look on the way out.
    const [outfit, setOutfit] = useState<Look>(initial.look)
    const [tab, setTab] = useState<TabId>("body")
    const [focus, setFocus] = useState<FocusId>("full")
    const [spin, setSpin] = useState(true)
    const [turn, setTurn] = useState({ n: 0, angle: 0 })
    const checked = checkName(name)
    const set = <K extends keyof Look>(key: K, value: Look[K]) => setOutfit((l) => ({ ...l, [key]: value }))

    // ---- paint state: marks, plus undo/redo of whole strokes ----------------
    const [marks, setMarks] = useState<PaintMark[]>(() => decodePaint(initial.look.paint))
    const [history, setHistory] = useState<{ undo: PaintMark[][]; redo: PaintMark[][] }>({ undo: [], redo: [] })
    const [color, setColor] = useState(0)
    const [eraser, setEraser] = useState(false)
    const [mirror, setMirror] = useState(true)
    const look = useMemo<Look>(() => ({ ...outfit, paint: encodePaint(marks) }), [outfit, marks])

    const strokeStart = useCallback(() => {
        setHistory((h) => ({ undo: [...h.undo, marks].slice(-50), redo: [] }))
    }, [marks])
    const paint = useCallback(
        (hit: VoxelHit) => {
            const targets = [{ ...hit, color }]
            if (mirror) targets.push(mirrorMark(targets[0], outfit))
            const keys = new Set(targets.map(markKey))
            // An updater, so a fast stroke with several hits between renders keeps them all.
            setMarks((prev) => {
                const rest = prev.filter((m) => !keys.has(markKey(m)))
                if (eraser) return rest.length === prev.length ? prev : rest
                return [...rest, ...targets].slice(-MAX_PAINT_MARKS)
            })
        },
        [color, eraser, mirror, outfit],
    )
    const undo = useCallback(() => {
        const last = history.undo.at(-1)
        if (!last) return
        setHistory({ undo: history.undo.slice(0, -1), redo: [...history.redo, marks] })
        setMarks(last)
    }, [history, marks])
    const redo = useCallback(() => {
        const next = history.redo.at(-1)
        if (!next) return
        setHistory({ undo: [...history.undo, marks], redo: history.redo.slice(0, -1) })
        setMarks(next)
    }, [history, marks])

    // Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) while painting.
    useEffect(() => {
        if (tab !== "paint") return
        const onKey = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || (e.target as HTMLElement).tagName === "INPUT") return
            const k = e.key.toLowerCase()
            if (k === "z" && !e.shiftKey) undo()
            else if (k === "y" || (k === "z" && e.shiftKey)) redo()
            else return
            e.preventDefault()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [tab, undo, redo])

    const openTab = (id: TabId) => {
        setTab(id)
        setFocus(TABS.find((t) => t.id === id)!.focus)
    }
    const enter = () => {
        if (checked.ok) onEnter({ name: checked.name, look })
    }
    const painting = tab === "paint"

    return (
        <div className="flex h-full w-full bg-[#0b1230] text-slate-100">
            {/* ---- stage ---------------------------------------------------- */}
            <div className="relative min-w-0 flex-1 bg-[radial-gradient(ellipse_at_center,#6ec3ff_0%,#3f7ff0_45%,#23308f_100%)]">
                <EditorStage
                    look={look}
                    focus={focus}
                    spin={spin}
                    painting={painting}
                    turnRequest={turn}
                    onPaint={paint}
                    onStrokeStart={strokeStart}
                />
                <div className="pointer-events-none absolute left-6 top-5">
                    <h1 className="text-3xl font-black italic uppercase tracking-tight text-white drop-shadow">Locker</h1>
                    <p className="font-mono text-xs text-white/80">
                        {painting ? "Left-click to paint · right-drag to turn · wheel to zoom" : "Drag to turn · wheel to zoom · right-drag to pan"}
                    </p>
                </div>
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0b1230]/70 p-1 backdrop-blur">
                    <IconButton title="Turn left" onClick={() => setTurn((t) => ({ n: t.n + 1, angle: -Math.PI / 4 }))}>⟲</IconButton>
                    {(["full", "head", "body", "legs", "feet"] as FocusId[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFocus(f)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                                focus === f ? "bg-yellow-300 text-slate-950" : "text-white/80 hover:bg-white/10"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <IconButton title="Turn right" onClick={() => setTurn((t) => ({ n: t.n + 1, angle: Math.PI / 4 }))}>⟳</IconButton>
                    <button
                        onClick={() => setSpin((s) => !s)}
                        aria-pressed={spin}
                        className={`ml-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase ${spin ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10"}`}
                    >
                        Spin
                    </button>
                </div>
            </div>

            {/* ---- toolbox -------------------------------------------------- */}
            <aside className="flex w-120 shrink-0 border-l border-white/10">
                <nav className="flex w-24 flex-col gap-2 border-r border-white/10 bg-black/20 p-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => openTab(t.id)}
                            aria-pressed={tab === t.id}
                            className={`rounded-lg px-2 py-3 text-xs font-bold uppercase leading-tight tracking-wide transition ${
                                tab === t.id ? "bg-yellow-300 text-slate-950 shadow-[0_0_0_2px_#fde047]" : "text-slate-300 hover:bg-white/10"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex-1 space-y-6 overflow-y-auto p-5">
                        {tab === "body" && (
                            <>
                                <Colors title="Skin" colors={SKIN_COLORS} value={look.skin} onChange={(c) => set("skin", c)} />
                                <Options title="Build" options={BUILD} value={look.build} onChange={(v) => set("build", v)} />
                                <Options title="Stance" options={IDLE} value={look.idle} onChange={(v) => set("idle", v)} />
                            </>
                        )}
                        {tab === "hair" && (
                            <>
                                <Options title="Style" options={HAIR} value={look.hair} onChange={(v) => set("hair", v)} />
                                <Colors title="Color (hair and hats)" colors={ACCENT_COLORS} value={look.accent} onChange={(c) => set("accent", c)} />
                            </>
                        )}
                        {tab === "head" && (
                            <>
                                <Options title="Headwear" options={HEADWEAR} value={look.headwear} onChange={(v) => set("headwear", v)} />
                                <Options title="Eyes" options={VISOR} value={look.visor} onChange={(v) => set("visor", v)} />
                                <Colors title="Hat colour (shared with hair)" colors={ACCENT_COLORS} value={look.accent} onChange={(c) => set("accent", c)} />
                            </>
                        )}
                        {tab === "top" && (
                            <>
                                <Options title="Style" slot="top" options={TOP} value={look.top} onChange={(v) => set("top", v)} />
                                <Colors title="Colour" colors={BODY_COLORS} value={look.body} onChange={(c) => set("body", c)} />
                            </>
                        )}
                        {tab === "bottoms" && (
                            <>
                                <Options title="Style" options={BOTTOMS} value={look.bottoms} onChange={(v) => set("bottoms", v)} />
                                <Colors title="Colour" colors={CLOTH_COLORS} value={look.bottomsColor} onChange={(c) => set("bottomsColor", c)} />
                            </>
                        )}
                        {tab === "shoes" && (
                            <>
                                <Options title="Style" options={SHOES} value={look.shoes} onChange={(v) => set("shoes", v)} />
                                <Colors title="Colour" colors={CLOTH_COLORS} value={look.shoesColor} onChange={(c) => set("shoesColor", c)} />
                            </>
                        )}
                        {tab === "paint" && (
                            <PaintTools
                                color={color}
                                setColor={(c) => {
                                    setColor(c)
                                    setEraser(false)
                                }}
                                eraser={eraser}
                                setEraser={setEraser}
                                mirror={mirror}
                                setMirror={setMirror}
                                count={marks.length}
                                canUndo={history.undo.length > 0}
                                canRedo={history.redo.length > 0}
                                onUndo={undo}
                                onRedo={redo}
                                onClear={() => {
                                    strokeStart()
                                    setMarks([])
                                }}
                            />
                        )}
                    </div>

                    <form
                        className="space-y-3 border-t border-white/10 bg-black/20 p-5"
                        onSubmit={(e) => {
                            e.preventDefault()
                            enter()
                        }}
                    >
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</span>
                            <input
                                value={name}
                                maxLength={NAME_MAX + 4}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="What should others call you?"
                                className="rounded-md bg-white/5 px-3 py-2 text-base outline-none ring-1 ring-white/15 focus:ring-yellow-300"
                            />
                            <span className={`text-xs ${checked.ok || !name ? "text-slate-500" : "text-rose-400"}`}>
                                {checked.ok || !name ? `3–${NAME_MAX} characters: letters, numbers, spaces, _ . -` : checked.reason}
                            </span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setOutfit((l) => randomLook(l))}
                                className="rounded-md px-4 py-2.5 text-sm font-bold uppercase ring-1 ring-white/20 hover:bg-white/10"
                            >
                                Randomize
                            </button>
                            <button
                                type="submit"
                                disabled={!checked.ok}
                                className="flex-1 rounded-md bg-yellow-300 px-4 py-2.5 text-sm font-black uppercase italic tracking-wide text-slate-950 hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Enter the Base
                            </button>
                        </div>
                    </form>
                </div>
            </aside>
        </div>
    )
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
    return (
        <button title={title} aria-label={title} onClick={onClick} className="h-8 w-8 rounded-full text-lg text-white/80 hover:bg-white/10">
            {children}
        </button>
    )
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
    return (
        <section>
            <div className="mb-2.5 flex items-baseline justify-between">
                <h2 className="text-sm font-black uppercase italic tracking-wide text-white">{title}</h2>
                {aside}
            </div>
            {children}
        </section>
    )
}

function Options<T extends string>({
    title,
    options,
    value,
    onChange,
    slot,
}: {
    title: string
    options: readonly T[]
    value: T
    onChange: (v: T) => void
    slot?: string
}) {
    return (
        <Section title={title}>
            <div className="grid grid-cols-3 gap-2">
                {options.map((o) => (
                    <button
                        key={o}
                        type="button"
                        aria-pressed={o === value}
                        onClick={() => onChange(o)}
                        className={`min-h-14 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition ${
                            o === value
                                ? "border-yellow-300 bg-gradient-to-b from-sky-500/40 to-indigo-600/40 text-white"
                                : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                        }`}
                    >
                        {label(o, slot)}
                    </button>
                ))}
            </div>
        </Section>
    )
}

function Colors({ title, colors, value, onChange }: { title: string; colors: readonly string[]; value: string; onChange: (c: string) => void }) {
    const custom = !colors.includes(value)
    return (
        <Section
            title={title}
            aside={<span className="font-mono text-xs uppercase text-slate-400">{value}</span>}
        >
            <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        aria-label={c}
                        aria-pressed={c === value}
                        onClick={() => onChange(c)}
                        className={`h-9 w-9 rounded-md ring-2 ring-offset-2 ring-offset-[#0b1230] transition ${
                            c === value ? "ring-yellow-300" : "ring-transparent hover:ring-white/30"
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                {/* any colour: the server accepts every #rrggbb */}
                <label
                    title="Custom colour"
                    className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] ring-2 ring-offset-2 ring-offset-[#0b1230] ${
                        custom ? "ring-yellow-300" : "ring-transparent hover:ring-white/30"
                    }`}
                >
                    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
            </div>
        </Section>
    )
}

function PaintTools(props: {
    color: number
    setColor: (c: number) => void
    eraser: boolean
    setEraser: (e: boolean) => void
    mirror: boolean
    setMirror: (m: boolean) => void
    count: number
    canUndo: boolean
    canRedo: boolean
    onUndo: () => void
    onRedo: () => void
    onClear: () => void
}) {
    const tool = (active: boolean) =>
        `rounded-lg border-2 px-3 py-2 text-sm font-bold uppercase transition disabled:opacity-30 ${
            active ? "border-yellow-300 bg-yellow-300 text-slate-950" : "border-white/10 bg-white/5 hover:border-white/30"
        }`
    const palette = useMemo(() => PAINT_COLORS.map((c, i) => ({ c, i })), [])
    return (
        <>
            <Section title="Colour">
                <div className="grid grid-cols-8 gap-2">
                    {palette.map(({ c, i }) => (
                        <button
                            key={c}
                            aria-label={`paint ${c}`}
                            aria-pressed={!props.eraser && props.color === i}
                            onClick={() => props.setColor(i)}
                            className={`aspect-square rounded-md ring-2 ring-offset-2 ring-offset-[#0b1230] ${
                                !props.eraser && props.color === i ? "ring-yellow-300" : "ring-transparent hover:ring-white/30"
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </Section>
            <Section title="Tools">
                <div className="flex flex-wrap gap-2">
                    <button className={tool(!props.eraser)} onClick={() => props.setEraser(false)}>Brush</button>
                    <button className={tool(props.eraser)} onClick={() => props.setEraser(true)}>Eraser</button>
                    <button className={tool(props.mirror)} aria-pressed={props.mirror} onClick={() => props.setMirror(!props.mirror)}>Mirror</button>
                </div>
            </Section>
            <Section title="History" aside={<span className="font-mono text-xs text-slate-400">{props.count} / {MAX_PAINT_MARKS} voxels</span>}>
                <div className="flex flex-wrap gap-2">
                    <button className={tool(false)} disabled={!props.canUndo} onClick={props.onUndo}>Undo</button>
                    <button className={tool(false)} disabled={!props.canRedo} onClick={props.onRedo}>Redo</button>
                    <button className={tool(false)} disabled={props.count === 0} onClick={props.onClear}>Clear all</button>
                </div>
            </Section>
            <p className="text-sm leading-relaxed text-slate-400">
                Paint recolours the voxels your Climber already has: tattoos, face paint, logos, stripes. Mirror paints both sides at once.
                Ctrl+Z undoes a stroke.
            </p>
        </>
    )
}
