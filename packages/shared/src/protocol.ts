// Everything the client and server must agree on about the Base room.

import type { Look } from './identity.ts'
import { CENTER_TO_FEET } from './movement.ts'
import { TESTING_FLOOR_BOUNDS } from './floors/testingFloor.ts'

export const BASE_ROOM = 'base'
/** Default Base Instance size. Override on the server with BASE_MAX_CLIENTS. */
export const BASE_MAX_CLIENTS = 50

/** Server state broadcast interval. Snapshots arrive this often. */
export const PATCH_RATE_MS = 50
/** Remote avatars are drawn this far in the past: 2x the patch interval. Don't lower it. */
export const RENDER_DELAY_MS = PATCH_RATE_MS * 2
/** How often the client reports its own position, at most. */
export const MOVE_SEND_HZ = 15

/** Walkable extent of the Base, which is Floor 1 (the Testing Floor) for now. */
export const BASE_BOUNDS = TESTING_FLOOR_BOUNDS
export const Y_MIN = -35
export const Y_MAX = 60

/** Capsule-centre spawn point. */
export const SPAWN = { x: 0, y: CENTER_TO_FEET + 0.5, z: 4 } as const
/** Joiners are spread on a ring this wide around SPAWN instead of stacking inside each other.
 * Keep it under half the doorway width (2 m) so holding W from spawn walks you through the first door. */
export const SPAWN_RING_RADIUS = 1.5

/** Spawn position for a joiner, from a value in [0, 1) (the server passes Math.random()). */
export function spawnPoint(u: number): { x: number; y: number; z: number } {
  const angle = u * Math.PI * 2
  return {
    x: SPAWN.x + Math.cos(angle) * SPAWN_RING_RADIUS,
    y: SPAWN.y,
    z: SPAWN.z + Math.sin(angle) * SPAWN_RING_RADIUS,
  }
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** client → server: where my capsule centre is and which way I face. */
export interface MoveMessage extends Vec3 {
  rotY: number
}

/** server → client: your last move was rejected; you are here instead. */
export type CorrectionMessage = Vec3

export const Msg = {
  move: 'move',
  respawn: 'respawn',
  correction: 'correction',
  chat: 'chat',
  /** Dev only: the server honours it only when started with DEV_TELEPORT=1. */
  teleport: 'teleport',
} as const

export type ClimberStatus = 'idle' | 'battling' | 'away'

/** What a Climber looks like in synced Base state, as seen from the client. */
export interface ClimberView {
  name: string
  look: Look
  x: number
  y: number
  z: number
  rotY: number
  status: ClimberStatus
}

/** Parse untrusted input into a MoveMessage, or null if it isn't one. */
export function parseMove(raw: unknown): MoveMessage | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { x, y, z, rotY } = raw as Record<string, unknown>
  for (const v of [x, y, z, rotY]) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return null
  }
  return { x: x as number, y: y as number, z: z as number, rotY: rotY as number }
}
