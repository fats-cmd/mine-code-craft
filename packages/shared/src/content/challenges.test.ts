import { describe, expect, it } from 'vitest'
import { CHALLENGES } from './challenges.gen.ts'

// The generated bundle is the public half only (ADR-0002); these catch a build
// that leaks the private half or drifts from the types.
describe('the public challenge bundle', () => {
  it('has unique slugs', () => {
    const slugs = CHALLENGES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('never carries hidden cases, predict outputs or quiz answers', () => {
    for (const c of CHALLENGES) {
      for (const key of ['hiddenCases', 'output', 'answer', 'explanation']) expect(c, c.slug).not.toHaveProperty(key)
    }
  })

  it('gives every Code and Fix challenge a starter that names its function', () => {
    for (const c of CHALLENGES) {
      if (c.format !== 'code' && c.format !== 'fix') continue
      expect(c.publicCases.length, c.slug).toBeGreaterThan(0)
      expect(c.hiddenCount, c.slug).toBeGreaterThan(0)
      for (const lang of c.languages) expect(c.starter[lang], `${c.slug} ${lang}`).toContain(c.function[lang])
    }
  })
})
