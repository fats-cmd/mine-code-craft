/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL?: string
}

/** MagicaVoxel models, inlined as base64 by the `vox` plugin in vite.config.ts. */
declare module "*.vox" {
    const base64: string
    export default base64
}
