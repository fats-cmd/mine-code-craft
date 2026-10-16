import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei"
import { Box3, NeutralToneMapping, Vector3, type Group, type Material, type Mesh, type Object3D, type Texture } from "three"
import { VoxelGrid, parseVox, type VoxModel } from "@mcc/shared"
import { DRACO } from "../world/models/draco"
import VoxelMesh from "../voxel/VoxelMesh"
import { Model } from "../voxel/Voxels"
import VoxelAvatar from "../avatar/VoxelAvatar"
import { henchman } from "../floor/models"
import { FOG_FAR, FOG_NEAR, SKY } from "../floor/Sun"

// The art-direction test bench (/art-test): the same character as a Blender
// .glb and as a MagicaVoxel .vox, side by side under the game's own light,
// with a Climber for scale. Drop a file on either side, or put
// firstbug.glb / firstbug.vox in apps/client/public/art-test/ to load them
// on open. Dev only; nothing in the game depends on it.

type Source =
    | { kind: "glb"; url: string; name: string; bytes: number }
    | { kind: "vox"; model: VoxModel; name: string; bytes: number }
    | { kind: "builtin"; name: string }
    | { kind: "empty" }

interface Stats {
    triangles: number
    meshes: number
    materials: number
    textures: number
    animations: string[]
    height: number
}

/** Size of one .vox voxel, in metres: the same as the code-built henchmen. */
const VOX_CELL = 0.1
const SLOT_X = 1.3

const CAMERAS = {
    game: { position: [0, 2.2, 6.5], target: [0, 0.8, 0], label: "Game distance" },
    close: { position: [0, 1.2, 3], target: [0, 0.7, 0], label: "Close-up" },
    top: { position: [0, 5, 2.5], target: [0, 0.5, 0], label: "From above" },
} as const
type CameraKey = keyof typeof CAMERAS

export default function ArtTest() {
    const [left, setLeft] = useState<Source>({ kind: "empty" })
    const [right, setRight] = useState<Source>({ kind: "builtin", name: "code-built Firstbug (today's in-game model)" })
    const [stats, setStats] = useState<{ left?: Stats; right?: Stats }>({})
    const [fit, setFit] = useState(true)
    const [fitHeight, setFitHeight] = useState(1.0)
    const [spin, setSpin] = useState(false)
    const [camera, setCamera] = useState<CameraKey>("game")
    const [climber, setClimber] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pick up committed test files, if any. Vite answers a missing file with index.html, so check the type.
    useEffect(() => {
        const tryLoad = async (path: string, set: (s: Source) => void) => {
            try {
                const res = await fetch(path)
                if (!res.ok || (res.headers.get("content-type") ?? "").includes("text/html")) return
                set(await toSource(new File([await res.blob()], path.split("/").pop()!)))
            } catch {
                // not there: the slot keeps its default
            }
        }
        void tryLoad("/art-test/firstbug.glb", setLeft)
        void tryLoad("/art-test/firstbug.vox", setRight)
    }, [])

    const load = async (file: File, set: (s: Source) => void) => {
        setError(null)
        try {
            set(await toSource(file))
        } catch (e) {
            setError(`${file.name}: ${e instanceof Error ? e.message : String(e)}`)
        }
    }

    return (
        <div
            className="relative h-full bg-slate-900 text-white"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (!file) return
                // Drop on the left half for the .glb side, the right half for .vox, or let the extension decide.
                const glb = /\.glb$/i.test(file.name)
                const vox = /\.vox$/i.test(file.name)
                const onLeft = e.clientX < window.innerWidth / 2
                void load(file, glb || (!vox && onLeft) ? setLeft : setRight)
            }}
        >
            <Canvas shadows="percentage" camera={{ fov: 45 }} gl={{ toneMapping: NeutralToneMapping }}>
                <color attach="background" args={[SKY]} />
                <fog attach="fog" args={[SKY, FOG_NEAR, FOG_FAR]} />
                <Lights />
                <CameraRig which={camera} />
                <Ground />
                <Slot x={-SLOT_X} source={left} fit={fit} fitHeight={fitHeight} spin={spin} onStats={(s) => setStats((p) => ({ ...p, left: s }))} />
                <Slot x={SLOT_X} source={right} fit={fit} fitHeight={fitHeight} spin={spin} onStats={(s) => setStats((p) => ({ ...p, right: s }))} />
                {climber && (
                    <group position={[0, 0, -0.8]}>
                        <VoxelAvatar />
                    </group>
                )}
            </Canvas>

            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-4 p-4">
                <Panel title="Blender (.glb)" source={left} stats={stats.left} accept=".glb" onFile={(f) => load(f, setLeft)} />
                <Panel title="MagicaVoxel (.vox)" source={right} stats={stats.right} accept=".vox" onFile={(f) => load(f, setRight)} />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 bg-black/50 p-3 text-sm">
                {(Object.keys(CAMERAS) as CameraKey[]).map((k) => (
                    <button key={k} onClick={() => setCamera(k)} className={`rounded px-3 py-1 ${k === camera ? "bg-amber-400 text-black" : "bg-white/10 hover:bg-white/20"}`}>
                        {CAMERAS[k].label}
                    </button>
                ))}
                <Toggle on={spin} set={setSpin}>Turntable</Toggle>
                <Toggle on={climber} set={setClimber}>Climber for scale</Toggle>
                <Toggle on={fit} set={setFit}>Same height</Toggle>
                {fit && (
                    <label className="flex items-center gap-2">
                        <input type="range" min={0.4} max={2.5} step={0.1} value={fitHeight} onChange={(e) => setFitHeight(Number(e.target.value))} />
                        <span className="w-12 font-mono">{fitHeight.toFixed(1)} m</span>
                    </label>
                )}
                <span className="text-white/50">Drag to orbit · scroll to zoom · drop a .glb or .vox anywhere</span>
            </div>
            {error && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded bg-red-600/90 px-4 py-2">{error}</div>}
        </div>
    )
}

async function toSource(file: File): Promise<Source> {
    if (/\.glb$/i.test(file.name)) return { kind: "glb", url: URL.createObjectURL(file), name: file.name, bytes: file.size }
    if (/\.vox$/i.test(file.name)) return { kind: "vox", model: parseVox(new Uint8Array(await file.arrayBuffer())), name: file.name, bytes: file.size }
    throw new Error("expected a .glb (export from Blender as glTF Binary) or a .vox (MagicaVoxel)")
}

function Toggle({ on, set, children }: { on: boolean; set: (v: boolean) => void; children: ReactNode }) {
    return (
        <button onClick={() => set(!on)} className={`rounded px-3 py-1 ${on ? "bg-teal-400 text-black" : "bg-white/10 hover:bg-white/20"}`}>
            {children}
        </button>
    )
}

function Panel({ title, source, stats, accept, onFile }: { title: string; source: Source; stats?: Stats; accept: string; onFile: (f: File) => void }) {
    return (
        <div className="pointer-events-auto w-80 rounded-lg bg-black/60 p-3 text-sm">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-amber-300">{title}</h2>
                <label className="cursor-pointer rounded bg-white/10 px-2 py-0.5 text-xs hover:bg-white/20">
                    Load…
                    <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                </label>
            </div>
            <div className="mt-1 truncate text-white/70">{source.kind === "empty" ? "Nothing loaded: drop a file here" : source.name}</div>
            {source.kind !== "empty" && stats && (
                <dl className="mt-2 grid grid-cols-2 gap-x-3 font-mono text-xs text-white/80">
                    <dt>triangles</dt><dd>{stats.triangles.toLocaleString()}</dd>
                    <dt>meshes (≈ draw calls)</dt><dd>{stats.meshes}</dd>
                    <dt>materials</dt><dd>{stats.materials}</dd>
                    <dt>textures</dt><dd>{stats.textures}</dd>
                    <dt>file size</dt><dd>{"bytes" in source ? `${(source.bytes / 1024).toFixed(0)} KB` : "in code"}</dd>
                    <dt>own height</dt><dd>{stats.height.toFixed(2)} m</dd>
                    <dt>animations</dt><dd className="truncate" title={stats.animations.join(", ")}>{stats.animations.length ? stats.animations.join(", ") : "none"}</dd>
                </dl>
            )}
        </div>
    )
}

/** The game's light (floor/Sun.tsx), fixed in place. */
function Lights() {
    return (
        <>
            <hemisphereLight args={["#e6f4ff", "#c9a27a", 1.1]} />
            <directionalLight
                position={[4.5, 10, 3]}
                color="#fff3dc"
                intensity={2.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={5}
                shadow-camera-bottom={-5}
                shadow-bias={-0.0004}
                shadow-normalBias={0.03}
            />
        </>
    )
}

function Ground() {
    const grid = useMemo(() => {
        const g = new VoxelGrid()
        for (let x = -10; x < 10; x++) for (let z = -6; z < 6; z++) g.set(x, -1, z, (x + z) & 1 ? 0x6b5a48 : 0x5f4f3f)
        return g
    }, [])
    return <VoxelMesh grid={grid} scale={0.5} />
}

function CameraRig({ which }: { which: CameraKey }) {
    const { camera } = useThree()
    const controls = useRef<{ target: Vector3; update: () => void } | null>(null)
    useEffect(() => {
        const c = CAMERAS[which]
        camera.position.set(...(c.position as unknown as [number, number, number]))
        controls.current?.target.set(...(c.target as unknown as [number, number, number]))
        controls.current?.update()
    }, [which, camera])
    return <OrbitControls ref={controls as never} makeDefault target={[0, 0.8, 0]} />
}

/** One side of the bench: loads its source, scales it to stand on the ground, and reports stats. */
function Slot({ x, source, fit, fitHeight, spin, onStats }: { x: number; source: Source; fit: boolean; fitHeight: number; spin: boolean; onStats: (s: Stats) => void }) {
    const turn = useRef<Group>(null)
    useFrame((_, dt) => {
        if (turn.current) turn.current.rotation.y = spin ? turn.current.rotation.y + dt * 0.6 : 0
    })
    if (source.kind === "empty") return null
    return (
        <group position={[x, 0, 0]}>
            <group ref={turn}>
                <Suspense fallback={null}>
                    <Fit key={sourceKey(source)} enabled={fit} height={fitHeight} onStats={onStats} animations={source.kind === "glb" ? undefined : []}>
                        {source.kind === "glb" ? <Glb key={source.url} url={source.url} /> : source.kind === "vox" ? <Vox model={source.model} /> : <Model model={henchman("firstbug")} />}
                    </Fit>
                </Suspense>
            </group>
        </group>
    )
}

/** Remount (and re-measure) when the source changes. */
const sourceKey = (s: Source) => (s.kind === "glb" ? s.url : s.kind === "vox" ? `${s.name}:${s.bytes}:${s.model.voxels.length}` : s.kind)

function Glb({ url }: { url: string }) {
    const gltf = useGLTF(url, DRACO)
    const root = useRef<Group>(null)
    const { actions, names } = useAnimations(gltf.animations, root)
    useEffect(() => {
        gltf.scene.traverse((o) => {
            if ((o as Mesh).isMesh) o.castShadow = o.receiveShadow = true
        })
        root.current!.userData.animations = names
        const first = names.length ? actions[names[0]] : null
        first?.reset().play()
        return () => void first?.stop()
    }, [gltf, actions, names])
    return (
        <group ref={root}>
            <primitive object={gltf.scene} />
        </group>
    )
}

function Vox({ model }: { model: VoxModel }) {
    const grid = useMemo(() => {
        const g = new VoxelGrid()
        for (const v of model.voxels) g.set(v.x, v.y, v.z, v.color)
        return g
    }, [model])
    return <VoxelMesh grid={grid} scale={VOX_CELL} />
}

/** Scales its child to `height` (when enabled), stands it on y = 0, centres it, and measures it. */
function Fit({ enabled, height, onStats, animations, children }: { enabled: boolean; height: number; onStats: (s: Stats) => void; animations?: string[]; children: ReactNode }) {
    const outer = useRef<Group>(null)
    const inner = useRef<Group>(null)
    const report = useRef(onStats)
    useLayoutEffect(() => {
        report.current = onStats
    })
    const [natural, setNatural] = useState<Box3 | null>(null)

    // Measure once the model is in (and again if it changes).
    useFrame(() => {
        if (natural || !inner.current || inner.current.children.length === 0) return
        inner.current.updateWorldMatrix(true, true)
        // Measured in world space, then brought back into the outer group's own space (its scale and offset undone).
        const box = new Box3().setFromObject(inner.current, true).applyMatrix4(outer.current!.matrixWorld.clone().invert())
        if (box.isEmpty()) return
        setNatural(box)
        report.current(measure(inner.current, box, animations))
    })

    const size = natural ? natural.getSize(new Vector3()) : null
    const scale = enabled && size && size.y > 0 ? height / size.y : 1
    const centre = natural ? natural.getCenter(new Vector3()) : new Vector3()
    return (
        <group ref={outer} scale={scale} position={natural ? [-centre.x * scale, -natural.min.y * scale, -centre.z * scale] : [0, 0, 0]}>
            <group ref={inner}>{children}</group>
        </group>
    )
}

function measure(root: Object3D, box: Box3, animations?: string[]): Stats {
    let triangles = 0
    let meshes = 0
    const materials = new Set<Material>()
    const textures = new Set<Texture>()
    let clips: string[] = animations ?? []
    root.traverse((o) => {
        if (o.userData.animations) clips = o.userData.animations as string[]
        const m = o as Mesh
        if (!m.isMesh) return
        meshes++
        const g = m.geometry
        triangles += (g.index ? g.index.count : g.attributes.position.count) / 3
        for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
            materials.add(mat)
            for (const v of Object.values(mat)) if (v && (v as Texture).isTexture) textures.add(v as Texture)
        }
    })
    return { triangles: Math.round(triangles), meshes, materials: materials.size, textures: textures.size, animations: clips, height: box.getSize(new Vector3()).y }
}
