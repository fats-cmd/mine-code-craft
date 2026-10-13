import { useRef, useState, type ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Group } from "three"
import {
    ACCENT_COLORS,
    BODY_COLORS,
    HAIR,
    HEADWEAR,
    NAME_MAX,
    SKIN_COLORS,
    VISOR,
    checkName,
    type JoinOptions,
    type Look,
} from "@mcc/shared"
import AvatarModel from "../avatar/AvatarModel"

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]

function randomLook(): Look {
    return {
        body: pick(BODY_COLORS),
        skin: pick(SKIN_COLORS),
        accent: pick(ACCENT_COLORS),
        hair: pick(HAIR),
        headwear: pick(HEADWEAR),
        visor: pick(VISOR),
    }
}

function Turntable({ look }: { look: Look }) {
    const group = useRef<Group>(null)
    useFrame((_, dt) => {
        if (group.current) group.current.rotation.y += dt * 0.6
    })
    return (
        <group ref={group} position={[0, -0.95, 0]}>
            <AvatarModel look={look} />
        </group>
    )
}

/** Pick a name and a look, then enter the Base. Remembered for next visit by the caller. */
export default function CharacterCreator({
    initial,
    onEnter,
}: {
    initial: JoinOptions
    onEnter: (identity: JoinOptions) => void
}) {
    const [name, setName] = useState(initial.name)
    const [look, setLook] = useState<Look>(initial.look)
    const checked = checkName(name)
    const set = <K extends keyof Look>(key: K, value: Look[K]) => setLook((l) => ({ ...l, [key]: value }))

    const enter = () => {
        if (checked.ok) onEnter({ name: checked.name, look })
    }

    return (
        <div className="flex h-full w-full flex-col bg-slate-950 text-slate-100 md:flex-row">
            <div className="relative h-72 shrink-0 md:h-full md:flex-1">
                <Canvas camera={{ position: [0, 0.3, 4.6], fov: 35 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[3, 4, 5]} intensity={1.4} />
                    <Turntable look={look} />
                </Canvas>
                <h1 className="pointer-events-none absolute left-6 top-5 font-mono text-sm uppercase tracking-[0.3em] text-slate-400">
                    New Climber
                </h1>
            </div>

            <form
                className="flex w-full flex-col gap-5 overflow-y-auto border-slate-800 p-6 md:w-[26rem] md:border-l"
                onSubmit={(e) => {
                    e.preventDefault()
                    enter()
                }}
            >
                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Name</span>
                    <input
                        value={name}
                        maxLength={NAME_MAX + 4}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What should others call you?"
                        autoFocus
                        className="rounded-md bg-slate-900 px-3 py-2 text-base outline-none ring-1 ring-slate-700 focus:ring-amber-400"
                    />
                    <span className={`text-xs ${checked.ok || !name ? "text-slate-500" : "text-rose-400"}`}>
                        {checked.ok || !name ? `3–${NAME_MAX} characters: letters, numbers, spaces, _ . -` : checked.reason}
                    </span>
                </label>

                <Swatches label="Outfit" colors={BODY_COLORS} value={look.body} onChange={(c) => set("body", c)} />
                <Swatches label="Skin" colors={SKIN_COLORS} value={look.skin} onChange={(c) => set("skin", c)} />
                <Swatches label="Hair & headwear colour" colors={ACCENT_COLORS} value={look.accent} onChange={(c) => set("accent", c)} />

                <Choice label="Hair" options={HAIR} value={look.hair} onChange={(v) => set("hair", v)} />
                <Choice label="Headwear" options={HEADWEAR} value={look.headwear} onChange={(v) => set("headwear", v)} />
                <Choice label="Eyes" options={VISOR} value={look.visor} onChange={(v) => set("visor", v)} />

                <div className="mt-auto flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setLook(randomLook())}
                        className="rounded-md px-4 py-2.5 text-sm font-semibold ring-1 ring-slate-700 hover:bg-slate-900"
                    >
                        Randomize
                    </button>
                    <button
                        type="submit"
                        disabled={!checked.ok}
                        className="flex-1 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Enter the Base
                    </button>
                </div>
            </form>
        </div>
    )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</legend>
            {children}
        </fieldset>
    )
}

function Swatches({
    label,
    colors,
    value,
    onChange,
}: {
    label: string
    colors: readonly string[]
    value: string
    onChange: (c: string) => void
}) {
    return (
        <Field label={label}>
            <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        aria-label={c}
                        aria-pressed={c === value}
                        onClick={() => onChange(c)}
                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-slate-950 transition ${
                            c === value ? "ring-amber-400" : "ring-transparent hover:ring-slate-600"
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </Field>
    )
}

function Choice<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string
    options: readonly T[]
    value: T
    onChange: (v: T) => void
}) {
    return (
        <Field label={label}>
            <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                    <button
                        key={o}
                        type="button"
                        aria-pressed={o === value}
                        onClick={() => onChange(o)}
                        className={`rounded-md px-3 py-1.5 text-sm capitalize ring-1 transition ${
                            o === value ? "bg-amber-400 font-semibold text-slate-950 ring-amber-400" : "ring-slate-700 hover:bg-slate-900"
                        }`}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </Field>
    )
}
