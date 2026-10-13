// World chat rules. Chat is ephemeral: room messages only, never stored.

export const CHAT_MAX = 200

/** Messages a Climber can send in a burst, then one per CHAT_REFILL_S seconds. */
export const CHAT_BURST = 5
export const CHAT_REFILL_S = 1.5

/** client → server */
export interface ChatSend {
  text: string
}

/** server → everyone in the Base Instance */
export interface ChatLine {
  from: string // sessionId
  name: string
  text: string
  at: number // server time, ms
}

/**
 * Plain text, one line, at most CHAT_MAX characters. Control characters are
 * stripped (they could fake line breaks or confuse terminals in logs). Returns
 * null for anything that ends up empty. Rendering must still escape: React
 * does, as long as nobody reaches for dangerouslySetInnerHTML.
 */
export function cleanChat(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const text = raw.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return null
  return [...text].slice(0, CHAT_MAX).join('')
}

/** Token bucket. Pure: the caller passes the clock, so it is trivially testable. */
export class RateLimiter {
  private tokens: number
  private last: number
  private readonly capacity: number
  private readonly refillPerMs: number

  constructor(capacity = CHAT_BURST, refillSeconds = CHAT_REFILL_S, now = 0) {
    this.capacity = capacity
    this.refillPerMs = 1 / (refillSeconds * 1000)
    this.tokens = capacity
    this.last = now
  }

  /** Spend one token if there is one. */
  take(now: number): boolean {
    const elapsed = Math.max(0, now - this.last)
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerMs)
    this.last = now
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }
}
