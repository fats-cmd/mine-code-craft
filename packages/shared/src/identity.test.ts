import { describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, NAME_MAX, checkName, nameKey, parseLook, uniqueName } from './identity.ts'

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
    const look = { body: '#AABBCC', skin: '#112233', accent: '#445566', hair: 'mohawk', headwear: 'crown', visor: 'shades' }
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
