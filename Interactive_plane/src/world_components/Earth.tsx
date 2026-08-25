import { usePlane} from "@react-three/cannon"
import useEarthTexture from "../custom_hooks/textures/EarthTexture.js"



export default function Earth(){
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0], position: [0,0,0]
    }));
    const texture = useEarthTexture();


    return (
        <mesh ref = {ref}>
            <planeGeometry attach='geometry' args={[100, 100]}/>
            <meshStandardMaterial attach = 'material' map={texture}/>
        </mesh>
    )
}
