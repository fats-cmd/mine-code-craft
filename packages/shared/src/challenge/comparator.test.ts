import { describe, expect, it } from 'vitest'
import { closeEnough, compare, normalizeOutput, show, type Language } from './comparator.ts'

const py = (e: unknown, a: unknown, unordered = false) => compare(e, a, { language: 'python', unordered }).ok
const js = (e: unknown, a: unknown, unordered = false) => compare(e, a, { language: 'javascript', unordered }).ok
const f = (x: number) => ({ $float: x })

describe('compare: the pins from content/README.md', () => {
  it('two-sum: an empty list is not "no result"', () => {
    expect(py([], [])).toBe(true)
    expect(py([], null)).toBe(false)
    expect(py([0, 1], [1, 0])).toBe(false) // ordered
  })
  it('balanced-brackets: True is not "true" and not 1', () => {
    expect(py(true, true)).toBe(true)
    expect(py(true, 'true')).toBe(false)
    expect(py(true, 1)).toBe(false)
    expect(js(true, 1)).toBe(false)
  })
  it('run-length-encode: exact, case-sensitive strings, including empty', () => {
    expect(py('a3b2', 'a3b2')).toBe(true)
    expect(py('a3b2', 'A3B2')).toBe(false)
    expect(py('', '')).toBe(true)
    expect(py('', null)).toBe(false)
  })
  it('word-frequency: dicts compare by key, never by insertion order', () => {
    expect(py({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
    expect(py({ a: 1 }, { a: 1, b: 0 })).toBe(false)
    expect(py({ a: 1, b: 2 }, { a: 1 })).toBe(false)
  })
  it('rotate-matrix: nested structure and shape', () => {
    expect(py([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true)
    expect(py([[1, 2], [3, 4]], [[1, 2, 3, 4]])).toBe(false)
    expect(py([[1, 'a']], [[1, 'a']])).toBe(true)
  })
  it('moving-average: relative OR absolute 1e-9 tolerance', () => {
    // the real hidden case: 0.25 apart, 2e-16 relative
    expect(py([f(1250825000000000.2)], [f(1250825000000000.0)])).toBe(true)
    expect(py([f(0.1 + 0.2)], [f(0.3)])).toBe(true) // absolute
    expect(py([f(1.5)], [f(1.5001)])).toBe(false)
  })
  it('group-anagrams: unordered top-level list', () => {
    expect(py([['ate', 'eat'], ['bat']], [['bat'], ['ate', 'eat']], true)).toBe(true)
    expect(py([['ate', 'eat'], ['bat']], [['bat'], ['eat', 'ate']], true)).toBe(false) // inner lists stay ordered
    expect(py([['a'], ['a']], [['a'], ['b']], true)).toBe(false) // multiset, not set
    expect(py([['a'], ['b']], [['b'], ['a']], false)).toBe(false) // ordered without the flag
  })
  it('longest-unique-substring: scalar ints are exact', () => {
    expect(py(3, 3)).toBe(true)
    expect(py(3, 4)).toBe(false)
  })
})

describe('compare: numbers by language (ADR-0008)', () => {
  it('Python keeps int and float apart', () => {
    expect(py(2, f(2))).toBe(false)
    expect(py(f(2), 2)).toBe(false)
    expect(py(f(2), f(2))).toBe(true)
  })
  it('JavaScript has one number type', () => {
    expect(js(2, 2)).toBe(true)
    expect(js(f(2), 2)).toBe(true)
    expect(js(f(0.3), 0.1 + 0.2)).toBe(true)
    expect(js('1', 1)).toBe(false)
    expect(js(null, [])).toBe(false)
  })
  it('non-finite floats', () => {
    expect(py({ $float: 'inf' }, { $float: 'inf' })).toBe(true)
    expect(py({ $float: 'inf' }, { $float: '-inf' })).toBe(false)
    expect(py({ $float: 'nan' }, { $float: 'nan' })).toBe(true)
    expect(closeEnough(Infinity, 1e308)).toBe(false)
  })
})

describe('compare: verdicts explain themselves', () => {
  it('points at the first difference', () => {
    const v = compare({ a: [1, 2, 3] }, { a: [1, 5, 3] }, { language: 'python' })
    expect(v).toEqual({ ok: false, path: '["a"][1]', reason: 'expected 2, got 5' })
  })
  it('names types in the player\'s language', () => {
    const l = (language: Language) => compare([1], 'x', { language })
    expect(l('python')).toMatchObject({ reason: 'expected a list, got a str' })
    expect(l('javascript')).toMatchObject({ reason: 'expected an array, got a string' })
  })
})

describe('show', () => {
  it('writes values as the player would', () => {
    expect(show([true, null, f(2), 'it\'s'], 'python')).toBe(`[True, None, 2.0, "it's"]`)
    expect(show([true, null, f(2), 'x'], 'javascript')).toBe('[true, null, 2.0, "x"]')
    expect(show({ a: 1 }, 'python')).toBe("{'a': 1}")
  })
})

describe('normalizeOutput (Predict)', () => {
  it('ignores trailing spaces and trailing newlines, keeps case and inner blank lines', () => {
    expect(normalizeOutput('1 \n2\t\n\n')).toBe('1\n2')
    expect(normalizeOutput('a\n\nb')).toBe('a\n\nb')
    expect(normalizeOutput('A')).not.toBe(normalizeOutput('a'))
    expect(normalizeOutput('1\r\n2\r\n')).toBe('1\n2')
  })
})
