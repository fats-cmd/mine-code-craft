import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, Sky } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import Earth from "./world/Earth"
import TestCourse from "./world/TestCourse"
import Player from "./avatar/Player"
import { controlMap } from "./avatar/controls"

// Add ?debug to the URL to draw every physics collider.
const physicsDebug = new URLSearchParams(window.location.search).has("debug")

export default function FirstScene() {
	return (
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
					</Suspense>
				</Canvas>
			</KeyboardControls>
			<div className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-3 py-2 font-mono text-xs text-white">
				click to look · WASD move · Shift run · Space jump · Esc release mouse
			</div>
		</div>
	);
}
