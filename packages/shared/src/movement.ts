// Pure movement math for the local Climber. No three.js, no Rapier, so it
// can be unit tested and later reused by the server for move sanity checks.

/**
 * Longest frame step we ever simulate, in seconds. 0.1 keeps real-time speed
 * down to 10 fps; anything slower runs in slow motion rather than jumping.
 */
export const MAX_DT = 0.1

/**
 * A backgrounded tab (every battle hides the Canvas) can hand back a frame
 * delta of several seconds. Integrating that in one go launches the avatar
 * across the map or deep into gravity, so cap it. Keep the cap well above a
 * normal frame: a low cap like 1/30 makes the game crawl on slow machines.
 */
export function clampDt(rawDt: number, max = MAX_DT): number {
  if (!Number.isFinite(rawDt) || rawDt <= 0) return 0
  return Math.min(rawDt, max)
}

export interface MoveInput {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
}

export interface Vec2 {
  x: number
  z: number
}

/**
 * Camera-relative walk direction on the ground plane, unit length or zero.
 * `yaw` follows three.js: 0 looks down -Z, positive turns left (towards -X).
 */
export function inputToDirection(input: MoveInput, yaw: number): Vec2 {
  const f = Number(input.forward) - Number(input.back)
  const r = Number(input.right) - Number(input.left)
  if (f === 0 && r === 0) return { x: 0, z: 0 }

  const sin = Math.sin(yaw)
  const cos = Math.cos(yaw)
  // forward = (-sin, -cos), right = (cos, -sin)
  const x = -sin * f + cos * r
  const z = -cos * f - sin * r
  const len = Math.hypot(x, z)
  return { x: x / len, z: z / len }
}

/** Signed angle from `from` to `to`, in (-PI, PI]. Never the long way round. */
export function shortestAngleDelta(from: number, to: number): number {
  const TAU = Math.PI * 2
  let d = (to - from) % TAU
  if (d <= -Math.PI) d += TAU
  else if (d > Math.PI) d -= TAU
  return d
}

/**
 * Frame-rate independent turn towards `target` along the shortest arc.
 * `lambda` is the response rate: higher snaps faster.
 */
export function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  const t = 1 - Math.exp(-lambda * dt)
  return current + shortestAngleDelta(current, target) * t
}

/** Walking and running speed on the ground, units/s. The server's move check uses RUN_SPEED. */
export const WALK_SPEED = 5
export const RUN_SPEED = 9

/** Climber capsule: a cylinder of 2*HALF_HEIGHT plus two hemispheres of RADIUS, 1.8 tall. */
export const CAPSULE_RADIUS = 0.35
export const CAPSULE_HALF_HEIGHT = 0.55
/** Positions on the wire are the capsule centre; feet are this far below it. */
export const CENTER_TO_FEET = CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS

/** The heading (rotation.y) a model facing +Z needs to face `dir`. */
export function headingOf(dir: Vec2): number {
  return Math.atan2(dir.x, dir.z)
}

export interface VerticalParams {
  gravity: number // positive, units/s^2
  jumpSpeed: number // units/s
  terminalSpeed: number // positive cap on falling speed
}

export const DEFAULT_VERTICAL: VerticalParams = {
  gravity: 24,
  jumpSpeed: 9,
  terminalSpeed: 40,
}

/** Next vertical velocity. Grounded and not jumping means stuck to the floor. */
export function stepVerticalVelocity(
  vy: number,
  grounded: boolean,
  jump: boolean,
  dt: number,
  p: VerticalParams = DEFAULT_VERTICAL,
): number {
  if (grounded && jump) return p.jumpSpeed
  if (grounded && vy <= 0) return 0
  return Math.max(vy - p.gravity * dt, -p.terminalSpeed)
}

/** Keep the orbit camera from flipping over the top or digging under the floor. */
export function clampPitch(pitch: number, min = -1.2, max = 0.35): number {
  return Math.min(max, Math.max(min, pitch))
}
