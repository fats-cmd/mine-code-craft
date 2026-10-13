import { describe, expect, it } from 'vitest'
import { CHAT_BURST, CHAT_MAX, CHAT_REFILL_S, RateLimiter, cleanChat } from './chat.ts'

describe('cleanChat', () => {
  it('trims and collapses whitespace', () => {
    expect(cleanChat('  hello    world  ')).toBe('hello world')
  })
  it('turns line breaks and control characters into spaces', () => {
    expect(cleanChat('a\nb\r\nc\u0007d\u2028e')).toBe('a b c d e')
  })
  it('caps length without splitting an emoji', () => {
    const out = cleanChat('😀'.repeat(CHAT_MAX + 50))!
    expect([...out].length).toBe(CHAT_MAX)
    expect(out.endsWith('😀')).toBe(true)
  })
  it('null for empty, blank or non-string', () => {
    expect(cleanChat('')).toBeNull()
    expect(cleanChat('   \n ')).toBeNull()
    expect(cleanChat(5)).toBeNull()
    expect(cleanChat({ text: 'hi' })).toBeNull()
  })
  it('leaves markup as text: escaping is the renderer\'s job', () => {
    expect(cleanChat('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>')
  })
})

describe('RateLimiter', () => {
  it('allows a burst, then refuses', () => {
    const r = new RateLimiter()
    for (let i = 0; i < CHAT_BURST; i++) expect(r.take(0)).toBe(true)
    expect(r.take(0)).toBe(false)
  })
  it('refills one token per interval', () => {
    const r = new RateLimiter()
    for (let i = 0; i < CHAT_BURST; i++) r.take(0)
    expect(r.take(CHAT_REFILL_S * 1000 - 1)).toBe(false)
    expect(r.take(CHAT_REFILL_S * 1000 + 1)).toBe(true)
  })
  it('never banks more than the burst', () => {
    const r = new RateLimiter()
    let ok = 0
    for (let i = 0; i < 20; i++) if (r.take(1e9)) ok++
    expect(ok).toBe(CHAT_BURST)
  })
  it('a clock going backwards does not mint tokens', () => {
    const r = new RateLimiter(1, 1, 1000)
    expect(r.take(1000)).toBe(true)
    expect(r.take(0)).toBe(false)
  })
})
