// Runs a player's code on a set of cases, off the main thread, in either
// language (ADR-0002: code runs in the browser; the server grades). An
// infinite loop can't be interrupted from outside, so a run that overstays its
// time is stopped by terminating its worker, and a fresh one takes its place.
//
// Each language keeps one warm spare worker, so a run starts at once:
//  - Python (Pyodide) takes seconds to load, so its worker is reused between
//    runs and only replaced after a timeout.
//  - JavaScript workers start in milliseconds, so every run gets a fresh one
//    (clean globals) and the next spare is started straight away.

import type { CaseResult, Language } from '@mcc/shared'
import type { RunRequest, WorkerMessage } from './protocol.ts'

export type RunResult =
  | { kind: 'ran'; results: CaseResult[] }
  /** The code didn't load (syntax error, missing function) or the runtime failed to start. */
  | { kind: 'error'; error: string }
  | { kind: 'timeout'; seconds: number }

/** Wall-clock budget for one run of every case, after the runtime has loaded. */
export const TIMEOUT_MS: Record<Language, number> = { python: 8000, javascript: 4000 }

const spawn: Record<Language, () => Worker> = {
  python: () => new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module', name: 'python' }),
  javascript: () => new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module', name: 'javascript' }),
}

/** A started worker, resolved once it says it's ready. */
function start(language: Language): Promise<Worker> {
  const worker = spawn[language]()
  return new Promise((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'ready') resolve(worker)
      else if (e.data.type === 'load-error') reject(new Error(e.data.error))
    }
    worker.onerror = (e) => {
      e.preventDefault()
      reject(new Error(e.message || `the ${language} runner failed to start`))
    }
  })
}

class Lane {
  private spare: Promise<Worker> | null = null
  private queue: Promise<unknown> = Promise.resolve()
  private readonly language: Language
  private readonly reuse: boolean

  constructor(language: Language) {
    this.language = language
    this.reuse = language === 'python'
  }

  /** Start loading the runtime now, so the first run doesn't wait. Resolves when ready. */
  warm(): Promise<void> {
    if (!this.spare) {
      const s = start(this.language)
      s.catch(() => { if (this.spare === s) this.spare = null }) // try again next time
      this.spare = s
    }
    return this.spare.then(() => undefined)
  }

  run(req: RunRequest, timeoutMs: number): Promise<RunResult> {
    // One run at a time per language: a second click waits its turn.
    const next = this.queue.then(() => this.runNow(req, timeoutMs))
    this.queue = next.catch(() => undefined)
    return next
  }

  private async runNow(req: RunRequest, timeoutMs: number): Promise<RunResult> {
    this.warm().catch(() => undefined)
    let worker: Worker
    try {
      worker = await this.spare!
    } catch (err) {
      return { kind: 'error', error: err instanceof Error ? err.message : String(err) }
    }
    if (!this.reuse) {
      this.spare = null
      this.warm().catch(() => undefined) // the next run's worker starts now
    }

    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        worker.terminate()
        if (this.reuse) {
          this.spare = null
          this.warm().catch(() => undefined)
        }
        resolve({ kind: 'timeout', seconds: timeoutMs / 1000 })
      }, timeoutMs)
      const finish = (result: RunResult) => {
        clearTimeout(timer)
        if (!this.reuse) worker.terminate()
        resolve(result)
      }
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const m = e.data
        if (m.type !== 'done') return
        finish('error' in m ? { kind: 'error', error: m.error } : { kind: 'ran', results: m.results })
      }
      worker.onerror = (e) => {
        e.preventDefault()
        if (this.reuse) this.spare = null
        worker.terminate()
        finish({ kind: 'error', error: e.message || 'the runner crashed' })
      }
      worker.postMessage(req)
    })
  }
}

const lanes: Record<Language, Lane> = { python: new Lane('python'), javascript: new Lane('javascript') }

/** Start the runtime for a language early (e.g. when a Trial opens). */
export const warmRunner = (language: Language): Promise<void> => lanes[language].warm()

/** Run `req` in `language`; never rejects. */
export const runCode = (language: Language, req: RunRequest, timeoutMs = TIMEOUT_MS[language]): Promise<RunResult> =>
  lanes[language].run(req, timeoutMs)
