import { describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, MAX_PAINT_MARKS, NAME_MAX, PAINT_COLORS, checkName, decodePaint, encodePaint, nameKey, parseLook, uniqueName, type PaintMark } from './identity.ts'

describe('checkName', () => {
  it('accepts and tidies a normal name', () => {
    expect(checkName('  Ronald   O ')).toEqual({ ok: true, name: 'Ronald O' })
  })
  it('enforces length', () => {
    expect(checkName('ab').ok).toBe(false)
    expect(checkName('x'.repeat(NAME_MAX)).ok).toBe(true)
    expect(checkName('x'.repeat(NAME_MAX + 1)).ok).toBe(false)
  })
  it('rejects odd characters, markup and emoji', () => {
    expect(checkName('<b>hi</b>').ok).toBe(false)
    expect(checkName('Ron😀ald').ok).toBe(false)
    expect(checkName('a#2b').ok).toBe(false) // '#' is how duplicates get numbered
  })
  it('needs a letter or number', () => {
    expect(checkName('___').ok).toBe(false)
  })
  it('blocks reserved names however they are dressed up', () => {
    expect(checkName('Admin').ok).toBe(false)
    expect(checkName('a.d.m.i.n').ok).toBe(false)
    expect(checkName('Meta Legion').ok).toBe(false)
    expect(checkName('Adminton').ok).toBe(true)
  })
  it('rejects non-strings', () => {
    expect(checkName(42).ok).toBe(false)
    expect(checkName(undefined).ok).toBe(false)
  })
})

describe('uniqueName', () => {
  it('keeps a free name', () => {
    expect(uniqueName('Ronald', ['Ada'])).toBe('Ronald')
  })
  it('numbers clashes, ignoring case and punctuation', () => {
    expect(uniqueName('Ronald', ['ronald'])).toBe('Ronald#2')
    expect(uniqueName('Ron Ald', ['ron-ald', 'Ron Ald#2'])).toBe('Ron Ald#3')
  })
  it('nameKey folds case, spaces and punctuation', () => {
    expect(nameKey('Ron_Ald.')).toBe(nameKey('ronald'))
  })
})

describe('parseLook', () => {
  it('passes a valid look through, lowercasing colours', () => {
    const look = {
      ...DEFAULT_LOOK,
      body: '#AABBCC', skin: '#112233', accent: '#445566', hair: 'mohawk', headwear: 'crown', visor: 'shades',
      top: 'hoodie', bottoms: 'baggy', bottomsColor: '#101010', shoes: 'boots', shoesColor: '#202020', build: 'broad', idle: 'fighter',
    }
    expect(parseLook(look)).toEqual({ ...look, body: '#aabbcc' })
  })
  it('replaces each bad field with its default, keeping the good ones', () => {
    const look = parseLook({ body: 'red', skin: '#112233', hair: 'afro', headwear: 'crown', visor: 42 })
    expect(look.body).toBe(DEFAULT_LOOK.body)
    expect(look.skin).toBe('#112233')
    expect(look.hair).toBe(DEFAULT_LOOK.hair)
    expect(look.headwear).toBe('crown')
    expect(look.visor).toBe(DEFAULT_LOOK.visor)
  })
  it('anything else is the default look', () => {
    expect(parseLook(null)).toEqual(DEFAULT_LOOK)
    expect(parseLook('crown')).toEqual(DEFAULT_LOOK)
  })
  it('rejects colour strings that are not exactly #rrggbb', () => {
    expect(parseLook({ body: '#fff' }).body).toBe(DEFAULT_LOOK.body)
    expect(parseLook({ body: 'url(javascript:x)' }).body).toBe(DEFAULT_LOOK.body)
  })
})

describe('parseLook upgrades older saves', () => {
  it('a look saved before outfits existed gets default outfit fields', () => {
    const old = { body: '#4f7cff', skin: '#f1c27d', accent: '#1b1b1f', hair: 'spiky', headwear: 'none', visor: 'band' }
    expect(parseLook(old)).toEqual({ ...DEFAULT_LOOK, ...old })
  })
})

describe('paint codec', () => {
  const mark = (x: number, color = 2, part: PaintMark['part'] = 'torso'): PaintMark => ({ part, x, y: 9, z: 1, color })
  it('round-trips marks', () => {
    const marks = [mark(-3), mark(0, 0, 'head'), mark(31, 15, 'legR')]
    expect(decodePaint(encodePaint(marks))).toEqual(marks)
  })
  it('a later mark on the same voxel wins', () => {
    expect(decodePaint(encodePaint([mark(1, 2), mark(1, 5)]))).toEqual([mark(1, 5)])
  })
  it('drops out-of-range coordinates, unknown parts and colours', () => {
    const bad = [mark(40), mark(0, PAINT_COLORS.length), { ...mark(0), part: 'tail' } as unknown as PaintMark, mark(1.5)]
    expect(encodePaint(bad)).toBe('')
  })
  it('caps the number of marks', () => {
    const many = Array.from({ length: MAX_PAINT_MARKS + 50 }, (_, i) => ({ part: 'torso' as const, x: (i % 60) - 30, y: Math.floor(i / 60) - 30, z: 0, color: 1 }))
    expect(decodePaint(encodePaint(many))).toHaveLength(MAX_PAINT_MARKS)
  })
  it('never throws on junk', () => {
    expect(decodePaint('%%%not base64')).toEqual([])
    expect(decodePaint('x'.repeat(100_000))).toEqual([])
    expect(parseLook({ paint: 42 }).paint).toBe('')
  })
})
