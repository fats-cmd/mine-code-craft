import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, StatsGl } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import { Leva } from "leva"
import type { JoinOptions } from "@mcc/shared"
import Player from "./avatar/Player"
import RemoteClimbers from "./avatar/RemoteClimbers"
import { controlMap } from "./avatar/controls"
import { BaseNetProvider } from "./net/BaseNetProvider"
import StatusBadge from "./net/StatusBadge"
import ChatPanel from "./chat/ChatPanel"
import CharacterCreator from "./identity/CharacterCreator"
import { loadIdentity, saveIdentity } from "./identity/storage"
import { DEV_TOOLS, useDevControls } from "./dev/devTools"
import { FloorProvider } from "./floor/FloorProvider"
import TestingFloor from "./floor/TestingFloor"
import FloorHud from "./floor/FloorHud"
import DevFloorControls, { DevPosition } from "./floor/DevFloorControls"

export default function App() {
	const [identity, setIdentity] = useState<JoinOptions>(loadIdentity)
	const [inBase, setInBase] = useState(false)

	if (!inBase) {
		return (
			<CharacterCreator
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
	return (
		<BaseNetProvider join={identity}>
		<FloorProvider>
			<div className="relative w-full h-full">
				<KeyboardControls map={controlMap}>
					<Canvas shadows camera={{ position: [0, 4, 10], fov: 60 }}>
						{/* Inside the Tower: no sky. Each room lights itself (see floor/layout.ts). */}
						<color attach="background" args={["#0b0f14"]} />
						<fog attach="fog" args={["#0b0f14", 30, 90]} />
						<ambientLight intensity={0.35} />
						{showPerf && <StatsGl className="dev-stats" />}
						<Suspense fallback={null}>
							<Physics debug={physicsDebug}>
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
