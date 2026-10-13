import { describe, expect, it } from 'vitest'
import { MAX_ELAPSED_S, MAX_SPEED, MOVE_SLACK, clampToBase, validateMove } from './moveValidation.ts'
import { BASE_HALF_SIZE, SPAWN, SPAWN_RING_RADIUS, Y_MAX, Y_MIN, parseMove, spawnPoint } from './protocol.ts'

const at = (x: number, y = 1, z = 0) => ({ x, y, z })

describe('validateMove', () => {
  it('accepts running speed', () => {
    expect(validateMove(at(0), at(9 / 15), 1 / 15).ok).toBe(true)
  })

  it('rejects a teleport and hands back the previous position', () => {
    const v = validateMove(at(0), at(30), 1 / 15)
    expect(v).toEqual({ ok: false, pos: at(0) })
  })

  it('caps elapsed time so a long silence is not a free teleport', () => {
    const reachable = MAX_SPEED * MAX_ELAPSED_S + MOVE_SLACK
    expect(validateMove(at(0), at(reachable - 0.01), 60).ok).toBe(true)
    expect(validateMove(at(0), at(reachable + 0.5), 60).ok).toBe(false)
  })

  it('only limits horizontal speed: falling fast is fine', () => {
    expect(validateMove(at(0, 20), at(0, 5), 1 / 15).ok).toBe(true)
  })

  it('rejects positions above the ceiling', () => {
    expect(validateMove(at(0, Y_MAX - 0.1), at(0, Y_MAX + 1), 1).ok).toBe(false)
  })

  it('clamps accepted moves into the Base', () => {
    const v = validateMove(at(BASE_HALF_SIZE - 0.1), at(BASE_HALF_SIZE + 0.4), 0.1)
    expect(v.ok).toBe(true)
    expect(v.pos.x).toBe(BASE_HALF_SIZE)
  })

  it('negative elapsed time counts as zero', () => {
    expect(validateMove(at(0), at(MOVE_SLACK + 0.1), -5).ok).toBe(false)
  })
})

describe('clampToBase', () => {
  it('clamps every axis', () => {
    expect(clampToBase({ x: 999, y: -999, z: -999 })).toEqual({ x: BASE_HALF_SIZE, y: Y_MIN, z: -BASE_HALF_SIZE })
  })
})

describe('spawnPoint', () => {
  it('lands on the ring around SPAWN, at spawn height', () => {
    for (const u of [0, 0.25, 0.5, 0.99]) {
      const p = spawnPoint(u)
      expect(Math.hypot(p.x - SPAWN.x, p.z - SPAWN.z)).toBeCloseTo(SPAWN_RING_RADIUS)
      expect(p.y).toBe(SPAWN.y)
    }
  })
  it('different draws give different spots', () => {
    expect(spawnPoint(0)).not.toEqual(spawnPoint(0.5))
  })
})

describe('parseMove', () => {
  it('accepts a well-formed move', () => {
    expect(parseMove({ x: 1, y: 2, z: 3, rotY: 0.5 })).toEqual({ x: 1, y: 2, z: 3, rotY: 0.5 })
  })
  it('drops extra fields', () => {
    expect(parseMove({ x: 1, y: 2, z: 3, rotY: 0, admin: true })).toEqual({ x: 1, y: 2, z: 3, rotY: 0 })
  })
  it('rejects junk', () => {
    expect(parseMove(null)).toBeNull()
    expect(parseMove('x')).toBeNull()
    expect(parseMove({ x: 1, y: 2, z: 3 })).toBeNull()
    expect(parseMove({ x: '1', y: 2, z: 3, rotY: 0 })).toBeNull()
    expect(parseMove({ x: Number.NaN, y: 2, z: 3, rotY: 0 })).toBeNull()
    expect(parseMove({ x: Number.POSITIVE_INFINITY, y: 2, z: 3, rotY: 0 })).toBeNull()
  })
})
