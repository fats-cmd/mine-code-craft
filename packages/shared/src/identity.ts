// Guest identity: the name and look a Climber picks before entering the Base.
// Shared so the creator screen and the server apply exactly the same rules.
// When sign-in arrives (M2 auth), the server takes these from the verified
// profile instead of join options; the rules themselves stay.

export const HAIR = ['none', 'spiky', 'bun', 'mohawk'] as const
export const HEADWEAR = ['none', 'cap', 'headband', 'crown'] as const
export const VISOR = ['eyes', 'band', 'goggles', 'shades'] as const

export type Hair = (typeof HAIR)[number]
export type Headwear = (typeof HEADWEAR)[number]
export type Visor = (typeof VISOR)[number]

export interface Look {
  body: string // #rrggbb
  skin: string
  accent: string // hair and headwear
  hair: Hair
  headwear: Headwear
  visor: Visor
}

/** Swatches the creator offers. The server accepts any #rrggbb. */
export const BODY_COLORS = ['#4f7cff', '#ff7a59', '#2fbf71', '#c45bff', '#ffc53d', '#19c3d6', '#ff5c8a', '#9aa63a', '#e8e8e8', '#2b2f3a']
export const SKIN_COLORS = ['#f6d7b8', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21']
export const ACCENT_COLORS = ['#1b1b1f', '#6b3e26', '#d9a441', '#f2f2f2', '#e2483d', '#3b82f6', '#a855f7', '#22c55e']

export const DEFAULT_LOOK: Look = {
  body: BODY_COLORS[0],
  skin: SKIN_COLORS[1],
  accent: ACCENT_COLORS[0],
  hair: 'spiky',
  headwear: 'none',
  visor: 'eyes',
}

const HEX = /^#[0-9a-f]{6}$/i

/** Lenient: any bad or missing field falls back to the default rather than rejecting. */
export function parseLook(raw: unknown): Look {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const color = (v: unknown, d: string) => (typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : d)
  const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
    allowed.includes(v as T) ? (v as T) : d
  return {
    body: color(r.body, DEFAULT_LOOK.body),
    skin: color(r.skin, DEFAULT_LOOK.skin),
    accent: color(r.accent, DEFAULT_LOOK.accent),
    hair: pick(r.hair, HAIR, DEFAULT_LOOK.hair),
    headwear: pick(r.headwear, HEADWEAR, DEFAULT_LOOK.headwear),
    visor: pick(r.visor, VISOR, DEFAULT_LOOK.visor),
  }
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
