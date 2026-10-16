// The comparator: is the player's output the expected output? ICPC/Kattis
// conventions (ARCHITECTURE §5, ADR-0008, content/README.md pins):
//
//  - structural, leaf by leaf; strings case-sensitive
//  - floats match within a relative OR absolute tolerance of 1e-9
//  - lists are ordered unless the Challenge says `unordered` (top-level list only)
//  - dicts/objects always compare by key, never by insertion order
//  - Python keeps int and float apart (1 vs 1.0 fails); JavaScript has one number type
//  - true is never 1, "1" is never 1, null is never []
//
// Values arrive as "typed JSON": Python floats are tagged {"$float": x} by the
// harness and the content build (JSON alone can't tell 1 from 1.0), and
// non-finite numbers are tagged in both languages ("inf", "-inf", "nan").
// Getting any of this wrong marks a correct solution wrong, the worst bug the
// game can have, so every branch is unit tested.

export type Language = 'python' | 'javascript'

export type TypedValue = null | boolean | number | string | { $float: number | 'inf' | '-inf' | 'nan' } | TypedValue[] | { [key: string]: TypedValue }

export interface CompareOptions {
  language: Language
  /** The top-level list is a multiset: order doesn't matter. Never combined with floats. */
  unordered?: boolean
}

export type Verdict = { ok: true } | { ok: false; path: string; reason: string }

export const FLOAT_TOLERANCE = 1e-9

function asNumber(v: unknown): number | null {
  if (typeof v === 'number') return v
  if (isFloatTag(v)) {
    const f = v.$float
    return f === 'inf' ? Infinity : f === '-inf' ? -Infinity : f === 'nan' ? NaN : Number(f)
  }
  return null
}

function isFloatTag(v: unknown): v is { $float: number | string } {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 1 && '$float' in v
}

/** Within tolerance: |a - b| <= 1e-9, or <= 1e-9 relative to the larger magnitude. */
export function closeEnough(a: number, b: number): boolean {
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.isNaN(a) && Number.isNaN(b)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b
  const diff = Math.abs(a - b)
  return diff <= FLOAT_TOLERANCE || diff <= FLOAT_TOLERANCE * Math.max(Math.abs(a), Math.abs(b))
}

function kind(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  if (asNumber(v) !== null) return 'number'
  if (Array.isArray(v)) return 'list'
  return typeof v === 'object' ? 'dict' : typeof v
}

function compareAt(expected: unknown, actual: unknown, language: Language, path: string): Verdict {
  const fail = (reason: string): Verdict => ({ ok: false, path: path || '(result)', reason })
  const ek = kind(expected)
  const ak = kind(actual)
  if (ek !== ak) return fail(`expected ${aOrAn(typeName(ek, expected, language))}, got ${aOrAn(typeName(ak, actual, language))}`)

  switch (ek) {
    case 'null':
      return { ok: true }
    case 'boolean':
    case 'string':
      return expected === actual ? { ok: true } : fail(`expected ${show(expected, language)}, got ${show(actual, language)}`)
    case 'number': {
      const e = asNumber(expected)!
      const a = asNumber(actual)!
      const ef = isFloatTag(expected)
      const af = isFloatTag(actual)
      if (language === 'python' && ef !== af) return fail(`expected ${ef ? 'a float' : 'an int'} (${show(expected, language)}), got ${show(actual, language)}`)
      // Python ints compare exactly; floats (and every JS number) within tolerance.
      const equal = language === 'python' && !ef ? e === a : closeEnough(e, a)
      return equal ? { ok: true } : fail(`expected ${show(expected, language)}, got ${show(actual, language)}`)
    }
    case 'list': {
      const e = expected as unknown[]
      const a = actual as unknown[]
      if (e.length !== a.length) return fail(`expected ${e.length} item${e.length === 1 ? '' : 's'}, got ${a.length}`)
      for (let i = 0; i < e.length; i++) {
        const v = compareAt(e[i], a[i], language, `${path}[${i}]`)
        if (!v.ok) return v
      }
      return { ok: true }
    }
    default: {
      const e = expected as Record<string, unknown>
      const a = actual as Record<string, unknown>
      const missing = Object.keys(e).filter((k) => !(k in a))
      if (missing.length) return fail(`missing key ${JSON.stringify(missing[0])}`)
      const extra = Object.keys(a).filter((k) => !(k in e))
      if (extra.length) return fail(`unexpected key ${JSON.stringify(extra[0])}`)
      for (const k of Object.keys(e).sort()) {
        const v = compareAt(e[k], a[k], language, `${path}[${JSON.stringify(k)}]`)
        if (!v.ok) return v
      }
      return { ok: true }
    }
  }
}

/** Canonical text of a value, for multiset comparison of unordered lists (exact, no floats). */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  if (typeof v === 'object' && v !== null && !isFloatTag(v)) {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(',')}}`
  }
  return JSON.stringify(v)
}

export function compare(expected: unknown, actual: unknown, options: CompareOptions): Verdict {
  if (options.unordered && Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) return { ok: false, path: '(result)', reason: `expected ${expected.length} items, got ${actual.length}` }
    const e = expected.map(canonical).sort()
    const a = actual.map(canonical).sort()
    for (let i = 0; i < e.length; i++) {
      if (e[i] !== a[i]) return { ok: false, path: '(result)', reason: 'the items differ (order doesn\'t matter here)' }
    }
    return { ok: true }
  }
  return compareAt(expected, actual, options.language, '')
}

const aOrAn = (word: string) => (/^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`)

// ---- display -----------------------------------------------------------------

function typeName(k: string, v: unknown, language: Language): string {
  if (k === 'number') return language === 'python' ? (isFloatTag(v) ? 'float' : 'int') : 'number'
  if (language === 'python') return { null: 'None', boolean: 'bool', string: 'str', list: 'list', dict: 'dict' }[k] ?? k
  return { null: 'null', boolean: 'boolean', string: 'string', list: 'array', dict: 'object' }[k] ?? k
}

/** A value as the player would write it in their language. */
export function show(v: unknown, language: Language): string {
  const py = language === 'python'
  if (v === null || v === undefined) return py ? 'None' : 'null'
  if (typeof v === 'boolean') return py ? (v ? 'True' : 'False') : String(v)
  if (typeof v === 'string') return py ? pyString(v) : JSON.stringify(v)
  if (isFloatTag(v)) {
    const f = v.$float
    if (typeof f === 'string') return py ? `float('${f}')` : f === 'nan' ? 'NaN' : f === 'inf' ? 'Infinity' : '-Infinity'
    return Number.isInteger(f) ? `${f}.0` : String(f)
  }
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return `[${v.map((x) => show(x, language)).join(', ')}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o).map((k) => `${py ? pyString(k) : JSON.stringify(k)}: ${show(o[k], language)}`).join(', ')}}`
}

function pyString(s: string): string {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'"
  return q + s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(new RegExp(q, 'g'), `\\${q}`) + q
}

/** Predict answers: trailing spaces on each line and trailing blank lines don't count; case does. */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}
