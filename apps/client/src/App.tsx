import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, Sky } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import type { JoinOptions } from "@mcc/shared"
import Earth from "./world/Earth"
import TestCourse from "./world/TestCourse"
import Player from "./avatar/Player"
import RemoteClimbers from "./avatar/RemoteClimbers"
import { controlMap } from "./avatar/controls"
import { BaseNetProvider } from "./net/BaseNetProvider"
import StatusBadge from "./net/StatusBadge"
import ChatPanel from "./chat/ChatPanel"
import CharacterCreator from "./identity/CharacterCreator"
import { loadIdentity, saveIdentity } from "./identity/storage"

// Add ?debug to the URL to draw every physics collider.
const physicsDebug = new URLSearchParams(window.location.search).has("debug")

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
	return (
		<BaseNetProvider join={identity}>
			<div className="relative w-full h-full">
				<KeyboardControls map={controlMap}>
					<Canvas shadows camera={{ position: [0, 4, 10], fov: 60 }}>
						<ambientLight intensity={0.6} />
						<directionalLight color={'red'} position={[5, 10, 5]} castShadow />
						<Sky sunPosition={[100, 100, 20]} />
						<Suspense fallback={null}>
							<Physics debug={physicsDebug}>
								<Earth />
								<TestCourse />
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
				<ChatPanel />
				<div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-3 py-2 font-mono text-xs text-white">
					click to look · WASD move · Shift run · Space jump · Enter chat · Esc release mouse	.	F to release mouse
				</div>
				<StatusBadge />
			</div>
		</BaseNetProvider>
	);
}
