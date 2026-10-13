import { describe, expect, it } from 'vitest'
import {
  MAX_DT,
  clampDt,
  clampPitch,
  dampAngle,
  headingOf,
  inputToDirection,
  shortestAngleDelta,
  stepVerticalVelocity,
  DEFAULT_VERTICAL,
} from './movement.ts'

const none = { forward: false, back: false, left: false, right: false }

describe('clampDt', () => {
  it('passes normal frames through', () => {
    expect(clampDt(1 / 60)).toBeCloseTo(1 / 60)
  })
  it('caps a multi-second frame from a backgrounded tab', () => {
    expect(clampDt(8)).toBe(MAX_DT)
  })
  it('treats garbage as no time passing', () => {
    expect(clampDt(-1)).toBe(0)
    expect(clampDt(Number.NaN)).toBe(0)
    expect(clampDt(Number.POSITIVE_INFINITY)).toBe(0)
  })
  it('a dt spike cannot move further than one capped frame', () => {
    const speed = 6
    expect(speed * clampDt(10)).toBeLessThanOrEqual(speed * MAX_DT)
  })
})

describe('inputToDirection', () => {
  it('no keys, no movement', () => {
    expect(inputToDirection(none, 1.3)).toEqual({ x: 0, z: 0 })
  })
  it('forward at yaw 0 is -Z', () => {
    const d = inputToDirection({ ...none, forward: true }, 0)
    expect(d.x).toBeCloseTo(0)
    expect(d.z).toBeCloseTo(-1)
  })
  it('right at yaw 0 is +X', () => {
    const d = inputToDirection({ ...none, right: true }, 0)
    expect(d.x).toBeCloseTo(1)
    expect(d.z).toBeCloseTo(0)
  })
  it('forward follows the camera: yaw +90deg looks down -X', () => {
    const d = inputToDirection({ ...none, forward: true }, Math.PI / 2)
    expect(d.x).toBeCloseTo(-1)
    expect(d.z).toBeCloseTo(0)
  })
  it('diagonals are not faster than straight lines', () => {
    const d = inputToDirection({ ...none, forward: true, right: true }, 0.4)
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1)
  })
  it('opposite keys cancel', () => {
    expect(inputToDirection({ forward: true, back: true, left: true, right: true }, 0)).toEqual({ x: 0, z: 0 })
  })
})

describe('shortestAngleDelta', () => {
  it('crosses +PI to -PI the short way', () => {
    expect(shortestAngleDelta(3.1, -3.1)).toBeCloseTo(2 * Math.PI - 6.2)
  })
  it('crosses -PI to +PI the short way', () => {
    expect(shortestAngleDelta(-3.1, 3.1)).toBeCloseTo(-(2 * Math.PI - 6.2))
  })
  it('ignores whole turns', () => {
    expect(shortestAngleDelta(0, 4 * Math.PI + 0.5)).toBeCloseTo(0.5)
  })
  it('stays within (-PI, PI]', () => {
    for (let a = -10; a <= 10; a += 0.37) {
      const d = shortestAngleDelta(0, a)
      expect(d).toBeGreaterThan(-Math.PI - 1e-12)
      expect(d).toBeLessThanOrEqual(Math.PI + 1e-12)
    }
  })
})

describe('dampAngle', () => {
  it('moves towards the target along the short arc', () => {
    const next = dampAngle(3.1, -3.1, 10, 1 / 60)
    expect(next).toBeGreaterThan(3.1) // through PI, not back through 0
  })
  it('zero dt does not move', () => {
    expect(dampAngle(1, 2, 10, 0)).toBe(1)
  })
})

describe('headingOf', () => {
  it('+Z is heading 0, +X is +90deg', () => {
    expect(headingOf({ x: 0, z: 1 })).toBeCloseTo(0)
    expect(headingOf({ x: 1, z: 0 })).toBeCloseTo(Math.PI / 2)
  })
})

describe('stepVerticalVelocity', () => {
  it('grounded and idle stays at zero', () => {
    expect(stepVerticalVelocity(0, true, false, 1 / 60)).toBe(0)
  })
  it('jumps only from the ground', () => {
    expect(stepVerticalVelocity(0, true, true, 1 / 60)).toBe(DEFAULT_VERTICAL.jumpSpeed)
    expect(stepVerticalVelocity(-2, false, true, 1 / 60)).toBeLessThan(-2)
  })
  it('falls under gravity and caps at terminal speed', () => {
    let vy = 0
    for (let i = 0; i < 1000; i++) vy = stepVerticalVelocity(vy, false, false, MAX_DT)
    expect(vy).toBe(-DEFAULT_VERTICAL.terminalSpeed)
  })
  it('keeps rising after leaving the ground mid-jump', () => {
    expect(stepVerticalVelocity(5, false, false, 0.1)).toBeCloseTo(5 - DEFAULT_VERTICAL.gravity * 0.1)
  })
})

describe('clampPitch', () => {
  it('clamps both ends', () => {
    expect(clampPitch(-5)).toBe(-1.2)
    expect(clampPitch(5)).toBe(0.35)
    expect(clampPitch(0)).toBe(0)
  })
})
