import { describe, expect, it } from 'vitest'
import { CHALLENGES } from '../content/challenges.gen.ts'
import { TESTING_FLOOR_HENCHMEN, henchmanChallenge } from './testingFloor.ts'

// Henchmen name Challenges by slug; these catch a slug that was renamed or
// removed in content/challenges, which would leave a henchman unbeatable.
describe('henchman Tasks', () => {
  for (const h of TESTING_FLOOR_HENCHMEN) {
    it(`${h.name} draws real ${h.format} Challenges, with spares for retries`, () => {
      expect(h.pool.length).toBeGreaterThan(h.wins)
      expect(new Set(h.pool).size).toBe(h.pool.length)
      for (const slug of h.pool) {
        const c = CHALLENGES.find((x) => x.slug === slug)
        expect(c, slug).toBeDefined()
        expect(c!.format, slug).toBe(h.format)
      }
    })
  }

  it('a new question is never the one just asked', () => {
    for (const h of TESTING_FLOOR_HENCHMEN) {
      for (let n = 0; n < 10; n++) expect(henchmanChallenge(h, n + 1)).not.toBe(henchmanChallenge(h, n))
    }
    expect(henchmanChallenge(TESTING_FLOOR_HENCHMEN[0], 6)).toBe(TESTING_FLOOR_HENCHMEN[0].pool[0])
  })
})
