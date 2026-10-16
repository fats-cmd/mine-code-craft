import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, PerformanceMonitor, StatsGl } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import { NeutralToneMapping } from "three"
import { Leva } from "leva"
import type { JoinOptions } from "@mcc/shared"
import Player from "./avatar/Player"
import RemoteClimbers from "./avatar/RemoteClimbers"
import { controlMap } from "./avatar/controls"
import { BaseNetProvider } from "./net/BaseNetProvider"
import StatusBadge from "./net/StatusBadge"
import ChatPanel from "./chat/ChatPanel"
import CharacterEditor from "./identity/CharacterEditor"
import { loadIdentity, saveIdentity } from "./identity/storage"
import { DEV_TOOLS, useDevControls } from "./dev/devTools"
import { FloorProvider } from "./floor/FloorProvider"
import TestingFloor from "./floor/TestingFloor"
import { FOG_FAR, FOG_NEAR, SKY } from "./floor/Sun"
import FloorHud from "./floor/FloorHud"
import DevFloorControls, { DevPosition } from "./floor/DevFloorControls"
import TrialApp from "./trial/TrialApp"

export default function App() {
	// No router yet: /trial is the challenge engine's dev route (ROADMAP M3).
	const path = window.location.pathname
	if (path === "/trial" || path.startsWith("/trial/")) return <TrialApp path={path} />
	return <Game />
}

function Game() {
	const [identity, setIdentity] = useState<JoinOptions>(loadIdentity)
	const [inBase, setInBase] = useState(false)

	if (!inBase) {
		return (
			<CharacterEditor
				initial={identity}
				onEnter={(chosen) => {
					saveIdentity(chosen)
					setIdentity(chosen)
					setInBase(true)
				}}
			/>
		)
	}
	// Leaving the Base unmounts the provider, which leaves the room; entering again rejoins with the new look.
	return <Base identity={identity} onEditCharacter={() => setInBase(false)} />
}

function Base({ identity, onEditCharacter }: { identity: JoinOptions; onEditCharacter: () => void }) {
	const { physicsDebug, showPerf } = useDevControls()
	const [dpr, setDpr] = useState(1.5)
	const [shadows, setShadows] = useState(true)
	return (
		<BaseNetProvider join={identity}>
		<FloorProvider>
			<div className="relative w-full h-full">
				<KeyboardControls map={controlMap}>
					<Canvas
						shadows={shadows && "percentage"}
						dpr={[1, dpr]}
						camera={{ position: [0, 4, 10], fov: 60 }}
						// Neutral keeps the palette's saturation; the default ACES curve greys bright voxels out.
						gl={{ toneMapping: NeutralToneMapping }}
					>
						<color attach="background" args={[SKY]} />
						<fog attach="fog" args={[SKY, FOG_NEAR, FOG_FAR]} />
						{/* Slow frames: drop the resolution first, then shadows (they stay off; flapping would recompile shaders). */}
						<PerformanceMonitor
							onIncline={() => setDpr(1.5)}
							onDecline={() => (dpr > 1 ? setDpr(1) : setShadows(false))}
						/>
						{showPerf && <StatsGl className="dev-stats" />}
						<Suspense fallback={null}>
							<Physics debug={physicsDebug} timeStep="vary">
								<TestingFloor />
								<Player />
							</Physics>
							{/* Remote avatars are drawn, not simulated: no physics bodies. */}
							<RemoteClimbers />
						</Suspense>
					</Canvas>
				</KeyboardControls>
				<button
					onClick={onEditCharacter}
					className="absolute left-3 top-3 rounded bg-black/50 px-3 py-2 font-mono text-xs text-white hover:bg-black/70"
				>
					Edit character
				</button>
				<FloorHud />
				<ChatPanel />
				<div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-3 py-2 font-mono text-xs text-white">
					click to look · WASD move · Shift run · Space jump · Enter chat · Esc or F release mouse
				</div>
				<StatusBadge />
				<Leva hidden={!DEV_TOOLS} collapsed titleBar={{ title: "debug", position: { x: 0, y: 48 } }} />
				{DEV_TOOLS && <DevFloorControls />}
				{DEV_TOOLS && <DevPosition />}
			</div>
		</FloorProvider>
		</BaseNetProvider>
	);
}
