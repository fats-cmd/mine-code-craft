// Serve Pyodide (CPython compiled to WebAssembly) ourselves, like the Draco
// decoder: the Python runner loads it from /pyodide/ at runtime, so the game
// doesn't depend on a third-party CDN. Copied from the installed package so
// the runtime always matches the version in package.json. Runs before dev and build.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let pkg = dirname(createRequire(join(root, 'package.json')).resolve('pyodide'))
while (!existsSync(join(pkg, 'package.json'))) pkg = dirname(pkg)
const to = join(root, 'public', 'pyodide')
mkdirSync(to, { recursive: true })
for (const file of ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  copyFileSync(join(pkg, file), join(to, file))
}
