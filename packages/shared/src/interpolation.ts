// Entity interpolation for remote avatars (Gambetta, "Entity Interpolation").
// Remote Climbers are drawn RENDER_DELAY_MS in the past, between the two
// snapshots that straddle that moment. See docs/research §1.

import { shortestAngleDelta } from './movement.ts'

export interface Pose {
  x: number
  y: number
  z: number
  rotY: number
}

export interface Snapshot extends Pose {
  /** Server time in ms. */
  t: number
}

/** Snapshots kept per avatar: ~1.5 s at 20 Hz, far more than interpolation needs. */
export const MAX_SNAPSHOTS = 32

export class SnapshotBuffer {
  private snaps: Snapshot[] = []

  get size(): number {
    return this.snaps.length
  }

  /** Insert by server time, not arrival order. A repeated timestamp replaces the old one. */
  push(s: Snapshot): void {
    const arr = this.snaps
    let i = arr.length
    while (i > 0 && arr[i - 1].t > s.t) i--
    if (i > 0 && arr[i - 1].t === s.t) arr[i - 1] = s
    else arr.splice(i, 0, s)
    if (arr.length > MAX_SNAPSHOTS) arr.splice(0, arr.length - MAX_SNAPSHOTS)
  }

  /**
   * Pose at `renderTime`. Before the first snapshot or after the last one it
   * holds the nearest pose: never extrapolate, humanoids stop and turn instantly.
   * Snapshots older than the pair in use are dropped.
   */
  sample(renderTime: number): Pose | null {
    const arr = this.snaps
    if (arr.length === 0) return null

    while (arr.length >= 2 && arr[1].t <= renderTime) arr.shift()

    const a = arr[0]
    if (arr.length === 1 || renderTime <= a.t) return pose(a)

    const b = arr[1]
    const alpha = (renderTime - a.t) / (b.t - a.t)
    return {
      x: a.x + (b.x - a.x) * alpha,
      y: a.y + (b.y - a.y) * alpha,
      z: a.z + (b.z - a.z) * alpha,
      rotY: a.rotY + shortestAngleDelta(a.rotY, b.rotY) * alpha,
    }
  }
}

function pose(s: Snapshot): Pose {
  return { x: s.x, y: s.y, z: s.z, rotY: s.rotY }
}

/**
 * Maps local time onto server time. Each patch gives one sample of
 * (localArrival - serverSend) = clockOffset + latency. The smallest recent
 * sample has the least latency in it, so that is the offset estimate. The
 * window lets it follow clock drift and route changes.
 */
export class ClockSync {
  private samples: number[] = []
  private readonly window: number

  /** `window` is in samples: 60 at 20 Hz is the last 3 s. */
  constructor(window = 60) {
    this.window = window
  }

  get ready(): boolean {
    return this.samples.length > 0
  }

  addSample(localNow: number, serverTime: number): void {
    this.samples.push(localNow - serverTime)
    if (this.samples.length > this.window) this.samples.shift()
  }

  /** Estimated server time "now", lagging the true value by the minimum latency. */
  serverNow(localNow: number): number {
    if (this.samples.length === 0) return localNow
    return localNow - Math.min(...this.samples)
  }
}
