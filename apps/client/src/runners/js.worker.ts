// Runs JavaScript: the player's code becomes a module (from a Blob URL) that
// exports their function, then the shared harness runs every case. The runner
// uses a fresh worker for every run, so nothing a player does to the globals
// carries over.
import { describeError, runCases, wrapSource } from '@mcc/shared'
import type { RunRequest, WorkerMessage } from './protocol.ts'

const post = (m: WorkerMessage) => postMessage(m)

onmessage = async (e: MessageEvent<RunRequest>) => {
  const { source, fn, cases } = e.data
  const url = URL.createObjectURL(new Blob([wrapSource(source, fn)], { type: 'text/javascript' }))
  try {
    const mod = (await import(/* @vite-ignore */ url)) as { __fn?: (...args: unknown[]) => unknown }
    if (!mod.__fn) post({ type: 'done', error: `no function named ${fn}` })
    else post({ type: 'done', results: runCases(mod.__fn, cases) })
  } catch (err) {
    post({ type: 'done', error: describeError(err) })
  } finally {
    URL.revokeObjectURL(url)
  }
}

post({ type: 'ready' })
