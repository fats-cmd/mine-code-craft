import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon"
import { PointerLockControls, Sky } from "@react-three/drei"
import Earth from "./world_components/Earth";
import Player from "./world_components/Player";


export default function FirstScene() {
	return (
		<div className="w-full h-full">
			<Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
				<ambientLight intensity={0.6} />
				<directionalLight color={'red'} position={[5, 10, 5]} />
				<Sky sunPosition={[100, 100, 20]} />
				<Physics>
					<Earth />
					<Player />
				</Physics>
				<PointerLockControls makeDefault />
			</Canvas>
		</div>
	);
}
