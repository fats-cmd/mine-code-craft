import {useTexture} from '@react-three/drei'
import {NearestFilter, RepeatWrapping, type Texture} from 'three'
import dryGrass from "../../assets/textures_img/dry_grass.png"


// Module scope keeps the identity stable, so drei's layout effect runs it once.
const configure = (texture: Texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(100, 100) 
    texture.magFilter = NearestFilter
}

const useEarthTexture = () => useTexture(dryGrass, configure)

export default useEarthTexture;
