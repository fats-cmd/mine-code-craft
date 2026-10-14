// Server-side sanity check for client-reported movement. The client is
// authoritative over its own avatar; the server only refuses the impossible.

import { RUN_SPEED } from './movement.ts'
import { BASE_BOUNDS, Y_MAX, Y_MIN, type Vec3 } from './protocol.ts'

/** Allowed horizontal speed, with headroom for jitter in message timing. */
export const MAX_SPEED = RUN_SPEED * 1.25
/** Flat allowance per move on top of speed x time, in units. */
export const MOVE_SLACK = 0.75
/**
 * Elapsed time counted per move is capped, so a client that went quiet for
 * ten seconds can't spend all of it on one long teleport.
 */
export const MAX_ELAPSED_S = 0.5

export type MoveVerdict = { ok: true; pos: Vec3 } | { ok: false; pos: Vec3 }

/**
 * Accept `next` if it is reachable from `prev` in `elapsedS` at MAX_SPEED.
 * Accepted positions are clamped into the Base bounds. Rejected moves return
 * `prev` so the server can send it back as a correction.
 */
export function validateMove(prev: Vec3, next: Vec3, elapsedS: number): MoveVerdict {
  const dt = Math.min(Math.max(elapsedS, 0), MAX_ELAPSED_S)
  const horizontal = Math.hypot(next.x - prev.x, next.z - prev.z)
  if (horizontal > MAX_SPEED * dt + MOVE_SLACK) return { ok: false, pos: prev }
  if (next.y > Y_MAX) return { ok: false, pos: prev }
  return { ok: true, pos: clampToBase(next) }
}

export function clampToBase(p: Vec3): Vec3 {
  const c = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  return {
    x: c(p.x, BASE_BOUNDS.minX, BASE_BOUNDS.maxX),
    y: c(p.y, Y_MIN, Y_MAX),
    z: c(p.z, BASE_BOUNDS.minZ, BASE_BOUNDS.maxZ),
  }
}
