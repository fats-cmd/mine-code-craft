import { describe, expect, it } from 'vitest'
import { ClockSync, MAX_SNAPSHOTS, SnapshotBuffer, type Snapshot } from './interpolation.ts'

const snap = (t: number, x: number, rotY = 0): Snapshot => ({ t, x, y: 0, z: 0, rotY })

describe('SnapshotBuffer.sample', () => {
  it('is null with no snapshots', () => {
    expect(new SnapshotBuffer().sample(100)).toBeNull()
  })

  it('lerps at the exact midpoint', () => {
    const b = new SnapshotBuffer()
    b.push(snap(0, 0))
    b.push(snap(100, 10))
    expect(b.sample(50)?.x).toBeCloseTo(5)
  })

  it('holds the first pose before the buffer starts', () => {
    const b = new SnapshotBuffer()
    b.push(snap(100, 3))
    b.push(snap(150, 9))
    expect(b.sample(20)?.x).toBe(3)
  })

  it('holds the last pose when starved, never extrapolates', () => {
    const b = new SnapshotBuffer()
    b.push(snap(0, 0))
    b.push(snap(100, 10))
    expect(b.sample(500)?.x).toBe(10)
  })

  it('rotates the short way from +PI to -PI', () => {
    const b = new SnapshotBuffer()
    b.push(snap(0, 0, 3.0))
    b.push(snap(100, 0, -3.0))
    const r = b.sample(50)!.rotY
    // halfway along the short arc is PI (or -PI), not 0
    expect(Math.abs(Math.abs(r) - Math.PI)).toBeLessThan(1e-9)
  })

  it('rotates the short way from -PI to +PI', () => {
    const b = new SnapshotBuffer()
    b.push(snap(0, 0, -3.0))
    b.push(snap(100, 0, 3.0))
    const r = b.sample(25)!.rotY
    expect(r).toBeLessThan(-3.0) // moving away from 0, through -PI
  })

  it('orders out-of-order arrivals by server time', () => {
    const b = new SnapshotBuffer()
    b.push(snap(100, 10))
    b.push(snap(0, 0))
    b.push(snap(50, 5))
    expect(b.sample(75)?.x).toBeCloseTo(7.5)
  })

  it('a duplicate timestamp replaces rather than duplicates', () => {
    const b = new SnapshotBuffer()
    b.push(snap(0, 0))
    b.push(snap(100, 10))
    b.push(snap(100, 20))
    expect(b.size).toBe(2)
    expect(b.sample(50)?.x).toBeCloseTo(10)
  })

  it('a joiner with a single snapshot is drawn there', () => {
    const b = new SnapshotBuffer()
    b.push(snap(1000, 4))
    expect(b.sample(900)?.x).toBe(4)
    expect(b.sample(1100)?.x).toBe(4)
  })

  it('drops snapshots it has moved past', () => {
    const b = new SnapshotBuffer()
    for (let t = 0; t <= 500; t += 50) b.push(snap(t, t))
    b.sample(420)
    expect(b.size).toBe(3) // 400, 450, 500
  })

  it('never grows past MAX_SNAPSHOTS even if never sampled', () => {
    const b = new SnapshotBuffer()
    for (let i = 0; i < MAX_SNAPSHOTS * 3; i++) b.push(snap(i * 50, i))
    expect(b.size).toBe(MAX_SNAPSHOTS)
  })
})

describe('ClockSync', () => {
  it('passes local time through before any sample', () => {
    expect(new ClockSync().serverNow(1234)).toBe(1234)
  })

  it('uses the lowest-latency sample as the offset', () => {
    const c = new ClockSync()
    // server clock is 10_000 ms behind local; latency 80, 30, 120
    c.addSample(10_080, 0)
    c.addSample(10_080, 50)
    c.addSample(10_220, 100)
    expect(c.serverNow(20_000)).toBe(20_000 - 10_030)
  })

  it('forgets samples outside the window', () => {
    const c = new ClockSync(2)
    c.addSample(100, 100) // offset 0
    c.addSample(200, 150) // 50
    c.addSample(300, 240) // 60, evicts the 0
    expect(c.serverNow(1000)).toBe(950)
  })
})
