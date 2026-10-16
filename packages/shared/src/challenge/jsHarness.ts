// The JavaScript harness: runs a player's function on each case. Shared by the
// browser's JS worker (apps/client/src/runners) and the content build
// (content/build/run_js.mjs). Loading the module is the caller's job (a Blob
// URL in the browser, a data: URL in Node); this file holds what must match.

import type { TypedValue } from './comparator.ts'
import { fromTyped, toTyped } from './typed.ts'

export const STDOUT_LIMIT = 4000

export type CaseResult = { ok: true; value: TypedValue; stdout: string } | { ok: false; error: string; stdout: string }

/**
 * The player's source as an ES module exporting their function as `__fn`.
 * `typeof` keeps a missing name from throwing, so we can say what's missing.
 */
export function wrapSource(source: string, fn: string): string {
  return `${source}\n;export const __fn = typeof ${fn} === "function" ? ${fn} : undefined;\n`
}

/** The error a player reads: its kind and message, without our stack. */
export function describeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`
  return `threw ${typeof err === 'string' ? JSON.stringify(err) : String(err)}`
}

const format = (x: unknown) => (typeof x === 'string' ? x : (() => { try { return JSON.stringify(x) ?? String(x) } catch { return String(x) } })())

/** Run every case with fresh args, capturing console.log per case. */
export function runCases(fn: (...args: unknown[]) => unknown, cases: TypedValue[][]): CaseResult[] {
  // shared has no DOM or Node types; both runtimes have console.log
  const console = (globalThis as unknown as { console: { log: (...xs: unknown[]) => void } }).console
  const original = console.log
  let out = ''
  console.log = (...xs: unknown[]) => {
    if (out.length <= STDOUT_LIMIT) out += xs.map(format).join(' ') + '\n'
  }
  try {
    return cases.map((args) => {
      out = ''
      const stdout = () => (out.length <= STDOUT_LIMIT ? out : out.slice(0, STDOUT_LIMIT) + '\n…(cut)')
      try {
        const value = toTyped(fn(...(fromTyped(args) as unknown[])))
        return { ok: true, value, stdout: stdout() }
      } catch (err) {
        return { ok: false, error: describeError(err), stdout: stdout() }
      }
    })
  } finally {
    console.log = original
  }
}
