/**
 * Where compressed models find their Draco decoder: our own copy in
 * public/draco (scripts/copy-draco.mjs), not Google's CDN. Every generated
 * model passes this to useGLTF; see scripts/gltf.mjs.
 */
export const DRACO = "/draco/"
