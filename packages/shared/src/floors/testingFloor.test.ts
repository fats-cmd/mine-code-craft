import { describe, expect, it } from 'vitest'
import {
  MAX_INTEGRITY,
  SPAWN,
} from '../index.ts'
import {
  TESTING_FLOOR_BOSS,
  TESTING_FLOOR_BOUNDS,
  TESTING_FLOOR_HENCHMEN,
  TESTING_FLOOR_ROOMS,
  approachCleared,
  exitOpen,
  initialProgress,
  parseProgress,
  progressReducer,
  roomAt,
  type FloorAction,
  type FloorProgress,
} from './testingFloor.ts'

const run = (actions: FloorAction[], from: FloorProgress = initialProgress()) => actions.reduce(progressReducer, from)
const defeatAll = TESTING_FLOOR_HENCHMEN.map((h) => ({ type: 'defeat', id: h.id }) as const)

describe('layout', () => {
  it('rooms chain end to end with no gaps, in route order', () => {
    for (let i = 1; i < TESTING_FLOOR_ROOMS.length; i++) {
      expect(TESTING_FLOOR_ROOMS[i].zMax).toBe(TESTING_FLOOR_ROOMS[i - 1].zMin)
      expect(TESTING_FLOOR_ROOMS[i].zMin).toBeLessThan(TESTING_FLOOR_ROOMS[i].zMax)
    }
  })
  it('every henchman stands in a real room', () => {
    const ids = new Set(TESTING_FLOOR_ROOMS.map((r) => r.id))
    for (const h of TESTING_FLOOR_HENCHMEN) expect(ids.has(h.room)).toBe(true)
  })
  it('only the Hall is shared', () => {
    expect(TESTING_FLOOR_ROOMS.filter((r) => r.shared).map((r) => r.id)).toEqual(['hall'])
  })
  it('spawn is on the Arrival Platform and inside the bounds', () => {
    expect(roomAt(SPAWN.x, SPAWN.z)?.id).toBe('arrival')
    expect(SPAWN.z).toBeLessThanOrEqual(TESTING_FLOOR_BOUNDS.maxZ)
  })
  it('roomAt finds rooms by position and nothing outside them', () => {
    expect(roomAt(0, -30)?.id).toBe('loom')
    expect(roomAt(0, -150)?.id).toBe('hall')
    expect(roomAt(20, -30)).toBeNull() // beside the Loom Gallery, outside its walls
    expect(roomAt(0, 50)).toBeNull()
  })
})

describe('progressReducer', () => {
  it('defeating a henchman is recorded once, unknown ids are ignored', () => {
    const s = run([{ type: 'defeat', id: 'firstbug' }, { type: 'defeat', id: 'firstbug' }, { type: 'defeat', id: 'nope' }])
    expect(s.defeated).toEqual(['firstbug'])
  })

  it('exits open room by room as henchmen fall', () => {
    let s = initialProgress()
    expect(exitOpen(s, 'arrival')).toBe(true) // no henchmen
    expect(exitOpen(s, 'abacus')).toBe(true)
    expect(exitOpen(s, 'gears')).toBe(false)
    s = run([{ type: 'defeat', id: 'cogsnap-tick' }], s)
    expect(exitOpen(s, 'gears')).toBe(false) // both cogs needed
    s = run([{ type: 'defeat', id: 'cogsnap-tock' }], s)
    expect(exitOpen(s, 'gears')).toBe(true)
  })

  it('the boss cannot be fought before the Approach is cleared', () => {
    const s = run([{ type: 'phaseCleared' }])
    expect(s.bossPhase).toBe(0)
  })

  it('three phases beat the boss and open the Gate of Notes', () => {
    let s = run(defeatAll)
    expect(approachCleared(s)).toBe(true)
    expect(exitOpen(s, 'engine')).toBe(false)
    s = run([{ type: 'phaseCleared' }, { type: 'phaseCleared' }, { type: 'phaseCleared' }], s)
    expect(s.bossBeaten).toBe(true)
    expect(s.bossPhase).toBe(TESTING_FLOOR_BOSS.phases.length)
    expect(exitOpen(s, 'engine')).toBe(true)
    expect(run([{ type: 'phaseCleared' }], s)).toBe(s) // nothing past victory
  })

  it('hits cost Integrity; a knockout refills it and loses nothing else', () => {
    let s = run([...defeatAll, { type: 'phaseCleared' }])
    for (let i = 0; i < MAX_INTEGRITY - 1; i++) s = run([{ type: 'hit' }], s)
    expect(s.integrity).toBe(1)
    s = run([{ type: 'hit' }], s)
    expect(s.integrity).toBe(MAX_INTEGRITY)
    expect(s.knockouts).toBe(1)
    expect(s.bossPhase).toBe(1) // the checkpoint holds
    expect(s.defeated).toHaveLength(TESTING_FLOOR_HENCHMEN.length)
  })

  it('beating the last henchman refills Integrity before the boss', () => {
    const allButOne = defeatAll.slice(0, -1)
    const s = run([...allButOne, { type: 'hit' }, { type: 'hit' }])
    expect(s.integrity).toBe(MAX_INTEGRITY - 2)
    expect(run([defeatAll[defeatAll.length - 1]], s).integrity).toBe(MAX_INTEGRITY)
  })

  it('clearing a phase refills Integrity', () => {
    const s = run([...defeatAll, { type: 'hit' }, { type: 'hit' }, { type: 'phaseCleared' }])
    expect(s.integrity).toBe(MAX_INTEGRITY)
  })

  it('reset starts over', () => {
    expect(run([...defeatAll, { type: 'reset' }])).toEqual(initialProgress())
  })
})

describe('parseProgress', () => {
  it('round-trips real progress', () => {
    const s = run([...defeatAll, { type: 'phaseCleared' }, { type: 'hit' }])
    expect(parseProgress(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })
  it('drops unknown or duplicate henchmen and clamps numbers', () => {
    const s = parseProgress({ defeated: ['firstbug', 'firstbug', 'dragon', 7], bossPhase: 99, integrity: -3, knockouts: -1 })
    expect(s.defeated).toEqual(['firstbug'])
    expect(s.bossPhase).toBe(TESTING_FLOOR_BOSS.phases.length)
    expect(s.bossBeaten).toBe(true)
    expect(s.integrity).toBe(1)
    expect(s.knockouts).toBe(0)
  })
  it('saves from before the naming pass keep their progress', () => {
    const s = parseProgress({ defeated: ['shuttle-sprite', 'loose-cog-2', 'the-moth', 'firstbug'] })
    expect(s.defeated).toEqual(['weftdart', 'cogsnap-tock', 'firstbug'])
  })
  it('garbage is a fresh start', () => {
    expect(parseProgress(null)).toEqual(initialProgress())
    expect(parseProgress('x')).toEqual(initialProgress())
  })
})
