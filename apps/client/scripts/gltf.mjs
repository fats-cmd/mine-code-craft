#!/usr/bin/env node
// Blender export -> game-ready model + typed React component, in one step.
//
//   npm run model -- art/exports/babbage.glb                 (from the repo root)
//   npm run model -- art/exports/engine.glb --name DifferenceEngine
//
// 1. Runs gltfjsx --transform: Draco-compresses meshes, prunes, resizes
//    textures to WebP. Output goes to public/models/<name>.glb.
// 2. Writes src/world/models/<Name>.tsx, patched so it compiles here:
//    React 19 has no global JSX namespace, and verbatimModuleSyntax wants
//    type-only imports for types. Decoding uses our own Draco copy (./draco).
// Extra flags after the file are passed to gltfjsx (e.g. --shadows --instance).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const given = args.find((a) => !a.startsWith('-'))
// npm runs workspace scripts from apps/client; INIT_CWD is where you typed the command.
const input = given && resolve(process.env.INIT_CWD ?? process.cwd(), given)
if (!input || !existsSync(input)) {
  console.error('usage: npm run model -- <path/to/model.glb> [--name ComponentName] [gltfjsx flags]')
  process.exit(1)
}

const nameFlag = args.indexOf('--name')
const base = basename(input, extname(input))
const component =
  nameFlag >= 0 ? args[nameFlag + 1] : base.replace(/(^|[-_ ]+)(\w)/g, (_, __, c) => c.toUpperCase())
const fileSlug = component.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const passthrough = args.filter((a, i) => a !== given && (nameFlag < 0 || (i !== nameFlag && i !== nameFlag + 1)))

const modelsDir = join(root, 'public', 'models')
const outGlb = join(modelsDir, `${fileSlug}.glb`)
const outTsx = join(root, 'src', 'world', 'models', `${component}.tsx`)

const bin = join(root, '..', '..', 'node_modules', '.bin', 'gltfjsx')
execFileSync(bin, [resolve(input), '--transform', '--types', '--shadows', '-o', outTsx, ...passthrough], {
  cwd: dirname(resolve(input)),
  stdio: 'inherit',
})

// gltfjsx writes <name>-transformed.glb next to the component it generated.
const transformed = join(dirname(outTsx), `${base}-transformed.glb`)
renameSync(transformed, outGlb)

const url = `/models/${fileSlug}.glb`
let src = readFileSync(outTsx, 'utf8')
src = src
  .replace(/^import React(, \{[^}]*\})? from 'react'\n/m, (_, named) => (named ? `import ${named.slice(2)} from 'react'\n` : ''))
  .replace("import { GLTF } from 'three-stdlib'", "import type { GLTF } from 'three-stdlib'\nimport type { ThreeElements } from '@react-three/fiber'")
  .replaceAll("JSX.IntrinsicElements['group']", "ThreeElements['group']")
  .replace(/export function Model\(/, `export function ${component}(`)
  // Newer @types/three: a node map of Object3D no longer casts straight to Mesh.
  .replace(/\) as GLTFResult/g, ') as unknown as GLTFResult')
  .replace(/useGLTF(\.preload)?\('[^']*'\)/g, (_, pre) => `useGLTF${pre ?? ''}('${url}', DRACO)`)
  // Our own copy of the decoder (public/draco), never Google's CDN. Passed on
  // every call because preload() runs at import, before any global setup could.
  .replace("import { useGLTF } from '@react-three/drei'", "import { useGLTF } from '@react-three/drei'\nimport { DRACO } from './draco'")
// Only declared when the model has animations; otherwise make the field honest.
if (!/type GLTFAction\b/.test(src)) src = src.replace('animations: GLTFAction[]', 'animations: THREE.AnimationClip[]')
writeFileSync(outTsx, src)

console.log(`\n✔ ${outGlb.replace(root + '/', '')}\n✔ ${outTsx.replace(root + '/', '')}  →  import { ${component} } from "./models/${component}"`)
