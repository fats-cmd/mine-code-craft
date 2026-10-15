// Guest identity: the name and look a Climber picks before entering the Base.
// Shared so the creator screen and the server apply exactly the same rules.
// When sign-in arrives (M2 auth), the server takes these from the verified
// profile instead of join options; the rules themselves stay.

export const HAIR = ['none', 'spiky', 'bun', 'mohawk', 'messy', 'long', 'buzz', 'flame'] as const
export const HEADWEAR = ['none', 'cap', 'beanie', 'headband', 'crown'] as const
export const VISOR = ['eyes', 'band', 'goggles', 'shades'] as const
export const TOP = ['tee', 'long', 'hoodie', 'jacket', 'tank', 'bare'] as const
export const BOTTOMS = ['pants', 'shorts', 'baggy', 'skirt'] as const
export const SHOES = ['sneakers', 'boots', 'sandals'] as const
export const BUILD = ['slim', 'regular', 'broad'] as const
/** How a Climber stands when not moving. */
export const IDLE = ['relaxed', 'pockets', 'fighter', 'proud'] as const

export type Hair = (typeof HAIR)[number]
export type Headwear = (typeof HEADWEAR)[number]
export type Visor = (typeof VISOR)[number]
export type Top = (typeof TOP)[number]
export type Bottoms = (typeof BOTTOMS)[number]
export type Shoes = (typeof SHOES)[number]
export type Build = (typeof BUILD)[number]
export type Idle = (typeof IDLE)[number]

export interface Look {
  body: string // #rrggbb, the top's colour
  skin: string
  accent: string // hair and headwear
  hair: Hair
  headwear: Headwear
  visor: Visor
  top: Top
  bottoms: Bottoms
  bottomsColor: string
  shoes: Shoes
  shoesColor: string
  build: Build
  idle: Idle
  /** Painted voxels (markings, tattoos, logos), packed by encodePaint(). */
  paint: string
}

/** Swatches the creator offers. The server accepts any #rrggbb. */
export const BODY_COLORS = ['#4f7cff', '#ff7a59', '#2fbf71', '#c45bff', '#ffc53d', '#19c3d6', '#ff5c8a', '#9aa63a', '#e8e8e8', '#2b2f3a']
export const SKIN_COLORS = ['#f6d7b8', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21']
export const ACCENT_COLORS = ['#1b1b1f', '#6b3e26', '#d9a441', '#f2f2f2', '#e2483d', '#ff7aa8', '#3b82f6', '#a855f7', '#22c55e']
export const CLOTH_COLORS = ['#1b1b1f', '#2b2f3a', '#3b4a6b', '#6b3e26', '#9aa3ad', '#e8e8e8', '#e2483d', '#2fbf71', '#ffc53d', '#3b82f6']

export const DEFAULT_LOOK: Look = {
  body: BODY_COLORS[0],
  skin: SKIN_COLORS[1],
  accent: ACCENT_COLORS[0],
  hair: 'spiky',
  headwear: 'none',
  visor: 'eyes',
  top: 'tee',
  bottoms: 'pants',
  bottomsColor: '#2b2f3a',
  shoes: 'sneakers',
  shoesColor: '#3b2a20',
  build: 'regular',
  idle: 'relaxed',
  paint: '',
}

const HEX = /^#[0-9a-f]{6}$/i

/** Lenient: any bad or missing field falls back to the default rather than rejecting. */
export function parseLook(raw: unknown): Look {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const color = (v: unknown, d: string) => (typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : d)
  const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
    allowed.includes(v as T) ? (v as T) : d
  const d = DEFAULT_LOOK
  return {
    body: color(r.body, d.body),
    skin: color(r.skin, d.skin),
    accent: color(r.accent, d.accent),
    hair: pick(r.hair, HAIR, d.hair),
    headwear: pick(r.headwear, HEADWEAR, d.headwear),
    visor: pick(r.visor, VISOR, d.visor),
    top: pick(r.top, TOP, d.top),
    bottoms: pick(r.bottoms, BOTTOMS, d.bottoms),
    bottomsColor: color(r.bottomsColor, d.bottomsColor),
    shoes: pick(r.shoes, SHOES, d.shoes),
    shoesColor: color(r.shoesColor, d.shoesColor),
    build: pick(r.build, BUILD, d.build),
    idle: pick(r.idle, IDLE, d.idle),
    // Re-encode what decodes: drops junk and duplicates, enforces the cap.
    paint: typeof r.paint === 'string' ? encodePaint(decodePaint(r.paint)) : '',
  }
}

// ---- paint -----------------------------------------------------------------
// Paint recolours voxels the body parts already have; it never adds any. A
// mark is a part, a voxel in that part's own coordinates, and a colour from
// PAINT_COLORS. Packed 4 bytes per mark, base64: 512 marks is under 3 KB,
// small enough for join options and the room state.

export const AVATAR_PARTS = ['head', 'torso', 'armL', 'armR', 'legL', 'legR'] as const
export type AvatarPart = (typeof AVATAR_PARTS)[number]

export const PAINT_COLORS = [
  '#1b1b1f', '#f2f2f2', '#e2483d', '#7a1f2b', '#ff7a59', '#ffc53d', '#2fbf71', '#19c3d6',
  '#3b82f6', '#a855f7', '#ff5c8a', '#6b3e26', '#9aa3ad', '#f6d7b8', '#c68642', '#5c3a21',
] as const
export const MAX_PAINT_MARKS = 512

export interface PaintMark {
  part: AvatarPart
  x: number
  y: number
  z: number
  /** Index into PAINT_COLORS. */
  color: number
}

/** Voxel coordinates a mark can hold: -32..31 on each axis, far more than any part needs. */
// btoa/atob exist in browsers and Node 16+, but this package compiles without the DOM types.
const base64 = globalThis as unknown as { btoa(bin: string): string; atob(b64: string): string }

const inRange = (v: number) => Number.isInteger(v) && v >= -32 && v <= 31

export function encodePaint(marks: readonly PaintMark[]): string {
  const seen = new Map<string, PaintMark>()
  for (const m of marks) {
    const part = AVATAR_PARTS.indexOf(m.part)
    if (part < 0 || !inRange(m.x) || !inRange(m.y) || !inRange(m.z)) continue
    if (!Number.isInteger(m.color) || m.color < 0 || m.color >= PAINT_COLORS.length) continue
    const key = `${m.part}:${m.x}:${m.y}:${m.z}`
    seen.delete(key) // a later mark on the same voxel wins
    seen.set(key, m)
  }
  const kept = [...seen.values()].slice(-MAX_PAINT_MARKS)
  let bin = ''
  for (const m of kept) {
    bin += String.fromCharCode((AVATAR_PARTS.indexOf(m.part) << 4) | m.color, m.x + 32, m.y + 32, m.z + 32)
  }
  return bin ? base64.btoa(bin) : ''
}

/** Never throws: anything malformed decodes to fewer (or no) marks. */
export function decodePaint(packed: string): PaintMark[] {
  if (!packed || packed.length > 4 * Math.ceil((MAX_PAINT_MARKS * 4) / 3) + 4) return []
  let bin: string
  try {
    bin = base64.atob(packed)
  } catch {
    return []
  }
  const marks: PaintMark[] = []
  for (let i = 0; i + 3 < bin.length; i += 4) {
    const head = bin.charCodeAt(i)
    const part = AVATAR_PARTS[head >> 4]
    const color = head & 15
    const [x, y, z] = [1, 2, 3].map((k) => bin.charCodeAt(i + k) - 32)
    if (!part || color >= PAINT_COLORS.length || ![x, y, z].every(inRange)) continue
    marks.push({ part, x, y, z, color })
  }
  return marks
}

export const NAME_MIN = 3
export const NAME_MAX = 16
const NAME_CHARS = /^[A-Za-z0-9 _.-]+$/
/** Names nobody may take, compared case-insensitively with spaces and punctuation removed. */
const RESERVED = ['admin', 'administrator', 'server', 'system', 'moderator', 'mod', 'staff', 'support', 'zark', 'metalegion']

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string }

/** Trim, collapse inner whitespace, then check length, characters and reserved names. */
export function checkName(raw: unknown): NameCheck {
  if (typeof raw !== 'string') return { ok: false, reason: 'Pick a name.' }
  const name = raw.trim().replace(/\s+/g, ' ')
  if (name.length < NAME_MIN) return { ok: false, reason: `At least ${NAME_MIN} characters.` }
  if (name.length > NAME_MAX) return { ok: false, reason: `At most ${NAME_MAX} characters.` }
  if (!NAME_CHARS.test(name)) return { ok: false, reason: 'Letters, numbers, spaces, _ . - only.' }
  if (!/[A-Za-z0-9]/.test(name)) return { ok: false, reason: 'Needs at least one letter or number.' }
  if (RESERVED.includes(nameKey(name))) return { ok: false, reason: 'That name is reserved.' }
  return { ok: true, name }
}

/** Two names clash if they match ignoring case, spaces and punctuation. */
export function nameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** `name`, or `name#2`, `name#3`… if someone in `taken` already has it. */
export function uniqueName(name: string, taken: Iterable<string>): string {
  const keys = new Set([...taken].map(nameKey))
  if (!keys.has(nameKey(name))) return name
  for (let n = 2; ; n++) {
    const candidate = `${name}#${n}`
    if (!keys.has(nameKey(candidate))) return candidate
  }
}

/** What the client sends to joinOrCreate. Later this becomes `{ token }`. */
export interface JoinOptions {
  name: string
  look: Look
}
