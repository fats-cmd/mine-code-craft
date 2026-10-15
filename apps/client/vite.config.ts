import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** `import data from './x.vox'` gives the file as base64, so hand-made voxel parts load synchronously. */
function vox(): Plugin {
  return {
    name: 'vox',
    load(id) {
      if (!id.endsWith('.vox')) return null
      this.addWatchFile(id)
      return `export default ${JSON.stringify(readFileSync(id).toString('base64'))}`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vox(), react(), tailwindcss()],
})
