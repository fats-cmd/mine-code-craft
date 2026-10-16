// Runs Python in the browser: Pyodide (CPython on WebAssembly), served from
// /pyodide/ (scripts/copy-pyodide.mjs). The harness is the same file the
// content build uses, so a case means the same thing in both. Loading takes a
// few seconds, so the runner keeps this worker alive between runs and only
// replaces it when a run times out.
import harness from '@mcc/shared/harness.py?raw'
import type { RunRequest, WorkerMessage } from './protocol.ts'

type PyRun = (source: string, fn: string, casesJson: string) => string
interface Pyodide {
  runPython(code: string): unknown
  globals: { get(name: string): unknown }
}

const post = (m: WorkerMessage) => postMessage(m)

const run: Promise<PyRun> = (async () => {
  const base = new URL(`${import.meta.env.BASE_URL}pyodide/`, self.location.origin).href
  const { loadPyodide } = (await import(/* @vite-ignore */ `${base}pyodide.mjs`)) as {
    loadPyodide(o: { indexURL: string }): Promise<Pyodide>
  }
  const py = await loadPyodide({ indexURL: base })
  py.runPython(harness)
  return py.globals.get('run') as PyRun
})()

run.then(
  () => post({ type: 'ready' }),
  (err: unknown) => post({ type: 'load-error', error: `Python didn't load: ${String(err)}` }),
)

onmessage = async (e: MessageEvent<RunRequest>) => {
  const { source, fn, cases } = e.data
  const out = JSON.parse((await run)(source, fn, JSON.stringify(cases)))
  post({ type: 'done', ...out })
}
