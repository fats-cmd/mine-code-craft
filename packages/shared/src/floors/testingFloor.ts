// Floor 1, the Testing Floor, as data. The design lives in
// docs/design/floors/01-testing-floor.md; this file is what code reads.
// Pure and shared: the client draws it, and the server grades its Tasks.

export type TaskFormat = 'quiz' | 'predict' | 'fix' | 'code' | 'movement'

/** A room along the floor's route. The route runs toward -Z; a room spans zMax (entrance) to zMin (exit). */
export interface RoomDef {
  id: RoomId
  name: string
  zMax: number
  zMin: number
  width: number
  /** Shared rooms show other Climbers; every other room is the solo Approach. */
  shared: boolean
}

export interface HenchmanDef {
  id: string
  name: string
  room: RoomId
  format: TaskFormat
  /** The Task, in a sentence. */
  task: string
  flavor: string
  /**
   * Challenge slugs (content/challenges), in order. The fight starts on the
   * first; every new question takes the next, wrapping round, so a retry is
   * never the question you just saw.
   */
  pool: readonly string[]
  /** Passes needed to beat it. */
  wins: number
}

export interface BossPhaseDef {
  title: string
  examiner: string
  format: TaskFormat
  task: string
}

export type RoomId = 'arrival' | 'abacus' | 'loom' | 'archive' | 'gears' | 'moth' | 'engine' | 'hall'

export const TESTING_FLOOR_ROOMS: readonly RoomDef[] = [
  { id: 'arrival', name: 'Arrival Platform', zMax: 12, zMin: -2, width: 14, shared: false },
  { id: 'abacus', name: 'Abacus Court', zMax: -2, zMin: -26, width: 16, shared: false },
  { id: 'loom', name: 'Loom Gallery', zMax: -26, zMin: -48, width: 18, shared: false },
  { id: 'archive', name: 'Card Archive', zMax: -48, zMin: -68, width: 16, shared: false },
  { id: 'gears', name: 'Gear Works', zMax: -68, zMin: -90, width: 18, shared: false },
  { id: 'moth', name: 'The Moth Room', zMax: -90, zMin: -104, width: 12, shared: false },
  { id: 'engine', name: 'The Engine Room', zMax: -104, zMin: -136, width: 32, shared: false },
  { id: 'hall', name: 'The Testing Hall', zMax: -136, zMin: -180, width: 44, shared: true },
]

export const TESTING_FLOOR_HENCHMEN: readonly HenchmanDef[] = [
  {
    id: 'weftdart',
    name: 'Weftdart',
    room: 'loom',
    format: 'quiz',
    task: 'Quiz: 3 questions on what a program, an input and an output are.',
    flavor: 'A loom shuttle trailing its weft thread, darting faster than thought.',
    pool: ['floor-1-what-is-a-program', 'floor-1-what-is-input', 'floor-1-what-is-output', 'floor-1-same-input', 'floor-1-what-is-a-loop', 'floor-1-what-is-a-variable'],
    wins: 3,
  },
  {
    id: 'holloquy',
    name: 'Holloquy',
    room: 'archive',
    format: 'predict',
    task: 'Predict: the exact output of a 3-line loop.',
    flavor: 'A punched card that reads its own holes aloud, one row at a time.',
    pool: ['holloquy-loop', 'holloquy-countdown', 'holloquy-rows'],
    wins: 1,
  },
  {
    id: 'cogsnap-tick',
    name: 'Cogsnap Tick',
    room: 'gears',
    format: 'predict',
    task: 'Predict: the next value of a simple arithmetic sequence.',
    flavor: 'A cog that snapped loose from the Gear Works and wants a fight.',
    pool: ['cogsnap-sequence', 'cogsnap-doubling'],
    wins: 1,
  },
  {
    id: 'cogsnap-tock',
    name: 'Cogsnap Tock',
    room: 'gears',
    format: 'predict',
    task: 'Predict: the final value of a counter in a loop.',
    flavor: "Tick's twin. Slightly angrier.",
    pool: ['cogsnap-counter', 'cogsnap-total'],
    wins: 1,
  },
  {
    id: 'firstbug',
    name: 'Firstbug',
    room: 'moth',
    format: 'fix',
    task: 'Fix: an off-by-one in a loop that sums a list.',
    flavor: 'In 1947 a moth was taped into a logbook: "First actual case of bug being found."',
    pool: ['sum-list', 'largest'],
    wins: 1,
  },
]

/** The Challenge for a henchman's nth question (0-based), wrapping round its pool. */
export function henchmanChallenge(h: HenchmanDef, n: number): string {
  return h.pool[((n % h.pool.length) + h.pool.length) % h.pool.length]
}

/** Floor 1's boss: Charles Babbage alone. Ada watches from her balcony (ADR-0013). */
export const TESTING_FLOOR_BOSS = {
  name: 'The Examiner: Charles Babbage',
  phases: [
    {
      title: 'The Difference Engine',
      examiner: 'Charles Babbage',
      format: 'predict',
      task: 'Predict the next value of three difference tables before the crank completes.',
    },
    {
      title: 'The Mill and the Store',
      examiner: 'Charles Babbage',
      format: 'predict',
      task: 'Map the Store, Mill and cards to a modern computer, then trace what each Store column holds after the cards run.',
    },
    {
      title: 'The Analytical Engine',
      examiner: 'Charles Babbage',
      format: 'code',
      task: 'Code next_value(sequence): predict the next term using finite differences.',
    },
  ] satisfies BossPhaseDef[],
} as const

/** Hit points for the Approach and the boss. Wrong answers and timeouts cost 1. */
export const MAX_INTEGRITY = 5

/** The walkable extent of the whole floor; the server clamps positions to it. */
export const TESTING_FLOOR_BOUNDS = (() => {
  const halfWidth = Math.max(...TESTING_FLOOR_ROOMS.map((r) => r.width)) / 2
  return {
    minX: -halfWidth,
    maxX: halfWidth,
    minZ: Math.min(...TESTING_FLOOR_ROOMS.map((r) => r.zMin)),
    maxZ: Math.max(...TESTING_FLOOR_ROOMS.map((r) => r.zMax)),
  }
})()

export function roomAt(x: number, z: number): RoomDef | null {
  return TESTING_FLOOR_ROOMS.find((r) => z <= r.zMax && z > r.zMin && Math.abs(x) <= r.width / 2) ?? null
}

// ---- progress --------------------------------------------------------------

export interface FloorProgress {
  defeated: string[]
  /** Boss phases cleared so far, 0..3. */
  bossPhase: number
  bossBeaten: boolean
  integrity: number
  /** Times Integrity hit 0. Nothing is lost; it's a number for the end-of-floor summary. */
  knockouts: number
}

export type FloorAction =
  | { type: 'defeat'; id: string }
  | { type: 'phaseCleared' }
  | { type: 'hit' }
  | { type: 'reset' }

export function initialProgress(): FloorProgress {
  return { defeated: [], bossPhase: 0, bossBeaten: false, integrity: MAX_INTEGRITY, knockouts: 0 }
}

export function progressReducer(state: FloorProgress, action: FloorAction): FloorProgress {
  switch (action.type) {
    case 'defeat': {
      const known = TESTING_FLOOR_HENCHMEN.some((h) => h.id === action.id)
      if (!known || state.defeated.includes(action.id)) return state
      const next = { ...state, defeated: [...state.defeated, action.id] }
      // Clearing the Approach is a checkpoint: you face the Examiners at full Integrity.
      return approachCleared(next) ? { ...next, integrity: MAX_INTEGRITY } : next
    }
    case 'phaseCleared': {
      if (state.bossBeaten || !approachCleared(state)) return state
      const bossPhase = state.bossPhase + 1
      const bossBeaten = bossPhase >= TESTING_FLOOR_BOSS.phases.length
      // A cleared phase is a checkpoint: Integrity refills for the next one.
      return { ...state, bossPhase, bossBeaten, integrity: MAX_INTEGRITY }
    }
    case 'hit': {
      if (state.integrity > 1) return { ...state, integrity: state.integrity - 1 }
      // Knocked out: back to full and retry the same encounter or phase. Progress is never lost.
      return { ...state, integrity: MAX_INTEGRITY, knockouts: state.knockouts + 1 }
    }
    case 'reset':
      return initialProgress()
  }
}

export function approachCleared(state: FloorProgress): boolean {
  return TESTING_FLOOR_HENCHMEN.every((h) => state.defeated.includes(h.id))
}

/** A room's exit door opens once its henchmen are beaten; the Engine Room's is the Gate of Notes. */
export function exitOpen(state: FloorProgress, room: RoomId): boolean {
  if (room === 'engine') return state.bossBeaten
  return TESTING_FLOOR_HENCHMEN.filter((h) => h.room === room).every((h) => state.defeated.includes(h.id))
}

/** Parse saved progress leniently: anything malformed starts fresh rather than crashing. */
/** Henchman ids from before the naming pass (GAME_DESIGN, Naming), so old saves keep their progress. */
const RENAMED_HENCHMEN: Record<string, string> = {
  'shuttle-sprite': 'weftdart',
  'punched-card': 'holloquy',
  'loose-cog-1': 'cogsnap-tick',
  'loose-cog-2': 'cogsnap-tock',
  'the-moth': 'firstbug',
}

export function parseProgress(raw: unknown): FloorProgress {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const ids = new Set(TESTING_FLOOR_HENCHMEN.map((h) => h.id))
  const renamed = (d: unknown) => (typeof d === 'string' ? (RENAMED_HENCHMEN[d] ?? d) : d)
  const defeated = Array.isArray(r.defeated) ? [...new Set(r.defeated.map(renamed).filter((d): d is string => ids.has(d as string)))] : []
  const phases = TESTING_FLOOR_BOSS.phases.length
  const bossPhase = Number.isInteger(r.bossPhase) ? Math.min(Math.max(r.bossPhase as number, 0), phases) : 0
  const integrity = Number.isInteger(r.integrity) ? Math.min(Math.max(r.integrity as number, 1), MAX_INTEGRITY) : MAX_INTEGRITY
  const knockouts = Number.isInteger(r.knockouts) && (r.knockouts as number) >= 0 ? (r.knockouts as number) : 0
  return { defeated, bossPhase, bossBeaten: bossPhase >= phases, integrity, knockouts }
}
