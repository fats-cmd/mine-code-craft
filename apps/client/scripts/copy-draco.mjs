// Serve the Draco decoder ourselves instead of from Google's CDN: compressed
// models (npm run model) need it, and a public game shouldn't depend on a
// third-party script host at runtime. Copied from the installed three.js so
// the decoder always matches the loader version. Runs before dev and build.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// three's "exports" hides package.json, so resolve its entry file and walk up to the package root.
let three = dirname(createRequire(join(root, 'package.json')).resolve('three'))
while (!existsSync(join(three, 'package.json'))) three = dirname(three)
const from = join(three, 'examples', 'jsm', 'libs', 'draco', 'gltf')
const to = join(root, 'public', 'draco')
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
