// Typed JSON on the JavaScript side (comparator.ts): turning case args into
// plain JS values, and a player's result back into typed JSON. Used by the
// browser's JS worker and by the content build (content/build/run_js.mjs), so
// both produce exactly the same values. The Python side is harness.py.

import type { TypedValue } from './comparator.ts'

const NON_FINITE: Record<string, number> = { inf: Infinity, '-inf': -Infinity, nan: NaN }

/** Typed JSON to a plain JS value: {"$float": x} becomes a number. */
export function fromTyped(v: TypedValue): unknown {
  if (Array.isArray(v)) return v.map(fromTyped)
  if (v !== null && typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length === 1 && keys[0] === '$float') {
      const f = (v as { $float: number | string }).$float
      return typeof f === 'string' ? NON_FINITE[f] : f
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fromTyped(x as TypedValue)]))
  }
  return v
}

/**
 * A player's JS result to typed JSON. Non-finite numbers are tagged; undefined
 * becomes null (as JSON would). Anything JSON can't carry (a Map, a Set, a
 * function, a class instance) throws, so the player hears about it.
 */
export function toTyped(v: unknown): TypedValue {
  if (v === undefined || v === null) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : { $float: Number.isNaN(v) ? 'nan' : v > 0 ? 'inf' : '-inf' }
  if (typeof v === 'boolean' || typeof v === 'string') return v
  if (Array.isArray(v)) return Array.from(v, toTyped)
  if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toTyped(x)]))
  }
  const name = typeof v === 'object' ? (v.constructor?.name ?? 'object') : typeof v
  throw new TypeError(`returned a ${name}; use an array or a plain object instead`)
}
