import { describe, expect, it } from 'vitest'
import { CHALLENGES } from '../content/challenges.gen.ts'
import { TESTING_FLOOR_BOSS, TESTING_FLOOR_HENCHMEN, henchmanChallenge, henchmanSteps, type TaskStep } from './testingFloor.ts'

// Fights name Challenges by slug; these catch a slug that was renamed or
// removed in content/challenges, which would leave a fight unwinnable.

function checkStep(step: TaskStep, where: string) {
  const formats = step.pool.map((slug) => {
    const c = CHALLENGES.find((x) => x.slug === slug)
    expect(c, `${where}: ${slug}`).toBeDefined()
    return c!.format
  })
  expect(new Set(step.pool).size, where).toBe(step.pool.length)
  expect(step.wins, where).toBeGreaterThan(0)
  // Quiz and Predict are one try each: a retry needs a fresh question. Code
  // and Fix stay on screen to be edited, so one is enough.
  const oneTry = formats.some((f) => f === 'quiz' || f === 'predict')
  if (oneTry) expect(step.pool.length, `${where}: spares for retries`).toBeGreaterThan(step.wins)
  else expect(step.pool.length, where).toBeGreaterThanOrEqual(1)
  return formats
}

describe('henchman Tasks', () => {
  for (const h of TESTING_FLOOR_HENCHMEN) {
    it(`${h.name} draws real ${h.format} Challenges, with spares for retries`, () => {
      for (const step of henchmanSteps(h)) expect(new Set(checkStep(step, h.name))).toEqual(new Set([h.format]))
    })
  }

  it('a new question is never the one just asked', () => {
    for (const h of TESTING_FLOOR_HENCHMEN) {
      for (let n = 0; n < 10; n++) expect(henchmanChallenge(h, n + 1)).not.toBe(henchmanChallenge(h, n))
    }
    expect(henchmanChallenge(TESTING_FLOOR_HENCHMEN[0], 6)).toBe(TESTING_FLOOR_HENCHMEN[0].pool[0])
  })
})

describe("Babbage's phases", () => {
  it('has the three phases from the floor design, each with real Challenges', () => {
    expect(TESTING_FLOOR_BOSS.phases.map((p) => p.title)).toEqual(['The Difference Engine', 'The Mill and the Store', 'The Analytical Engine'])
    TESTING_FLOOR_BOSS.phases.forEach((p) => p.steps.forEach((s, i) => checkStep(s, `${p.title} step ${i + 1}`)))
  })

  it('jams three columns against a crank that speeds up', () => {
    const [crank] = TESTING_FLOOR_BOSS.phases
    expect(crank.steps).toHaveLength(3)
    const seconds = crank.steps.map((s: TaskStep) => s.seconds ?? Infinity)
    expect(seconds.every((t, i) => i === 0 || t < seconds[i - 1])).toBe(true)
  })

  it('ends on the Code Task, next_value', () => {
    const last = TESTING_FLOOR_BOSS.phases[2].steps.at(-1)!
    expect(CHALLENGES.find((c) => c.slug === last.pool[0])?.format).toBe('code')
  })
})
