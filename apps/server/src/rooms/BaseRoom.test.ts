import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Client, type Room } from '@colyseus/sdk'
import {
  BASE_ROOM,
  CHAT_BURST,
  CHAT_MAX,
  DEFAULT_LOOK,
  Msg,
  SPAWN,
  SPAWN_RING_RADIUS,
  type ChatLine,
  type ClimberView,
  type CorrectionMessage,
  type JoinOptions,
} from '@mcc/shared'
import { createServer } from '../server.ts'

// End to end over real WebSockets: the server as `npm run dev` runs it,
// driven by the same SDK the browser uses.

const PORT = 2600 + Math.floor(Math.random() * 300)
// No SIGINT/uncaught-exception hooks: they would call process.exit inside the test runner.
const server = createServer({ gracefullyShutdown: false })
const url = `http://localhost:${PORT}`

interface StateView {
  serverTime: number
  climbers: Map<string, ClimberView>
}

beforeAll(async () => {
  await server.listen(PORT)
})
afterAll(async () => {
  await server.gracefullyShutdown(false)
})

function nextPatch(room: Room): Promise<StateView> {
  return new Promise((resolve) => room.onStateChange.once(resolve))
}

async function until<T>(room: Room, pick: (s: StateView) => T | undefined, ms = 2000): Promise<T> {
  const deadline = Date.now() + ms
  while (Date.now() < deadline) {
    const state = room.state as StateView | undefined
    const v = state?.climbers ? pick(state) : undefined
    if (v !== undefined) return v
    await nextPatch(room)
  }
  throw new Error('timed out waiting for state')
}

describe('BaseRoom', () => {
  it('two Climbers see each other, and a move reaches the other side', async () => {
    const a = await new Client(url).joinOrCreate(BASE_ROOM)
    const b = await new Client(url).joinOrCreate(BASE_ROOM)
    expect(b.roomId).toBe(a.roomId)

    const seen = await until(b, (s) => s.climbers.get(a.sessionId))
    expect(Math.hypot(seen.x - SPAWN.x, seen.z - SPAWN.z)).toBeCloseTo(SPAWN_RING_RADIUS, 3)
    const start = { x: seen.x, z: seen.z }

    a.send(Msg.move, { x: start.x + 0.5, y: SPAWN.y, z: start.z, rotY: 1 })
    const moved = await until(b, (s) => {
      const c = s.climbers.get(a.sessionId)
      return c && c.x > start.x + 0.4 ? c : undefined
    })
    expect(moved.rotY).toBeCloseTo(1)

    await a.leave()
    await until(b, (s) => (s.climbers.has(a.sessionId) ? undefined : true))
    await b.leave()
  })

  it('stamps every patch with server time', async () => {
    const a = await new Client(url).joinOrCreate(BASE_ROOM)
    const first = (await nextPatch(a)).serverTime
    expect(first).toBeGreaterThan(0) // even the initial full state carries a time
    const second = (await nextPatch(a)).serverTime
    const third = (await nextPatch(a)).serverTime
    expect(third).toBeGreaterThan(second)
    expect(Math.abs(Date.now() - second)).toBeLessThan(1000)
    await a.leave()
  })

  it('refuses a teleport and sends a correction', async () => {
    const a = await new Client(url).joinOrCreate(BASE_ROOM)
    const start = await until(a, (s) => s.climbers.get(a.sessionId))
    const correction = new Promise<CorrectionMessage>((resolve) => a.onMessage(Msg.correction, resolve))
    a.send(Msg.move, { x: 40, y: SPAWN.y, z: 40, rotY: 0 })
    const pos = await correction
    expect(pos.x).toBeCloseTo(start.x)
    expect(pos.z).toBeCloseTo(start.z)
    const me = await until(a, (s) => s.climbers.get(a.sessionId))
    expect(me.x).toBeCloseTo(start.x)
    await a.leave()
  })

  it('ignores malformed moves', async () => {
    const a = await new Client(url).joinOrCreate(BASE_ROOM)
    const start = await until(a, (s) => s.climbers.get(a.sessionId))
    const startX = start.x
    a.send(Msg.move, { x: 'nope' })
    a.send(Msg.move, null)
    await nextPatch(a)
    await nextPatch(a)
    const me = await until(a, (s) => s.climbers.get(a.sessionId))
    expect(me.x).toBe(startX)
    await a.leave()
  })

  describe('identity', () => {
    const look = { body: '#112233', skin: '#445566', accent: '#778899', hair: 'mohawk', headwear: 'crown', visor: 'goggles' }
    // Decoded schema instances carry internal keys, so compare the fields themselves.
    const fields = (l: ClimberView['look']) => ({
      body: l.body, skin: l.skin, accent: l.accent, hair: l.hair, headwear: l.headwear, visor: l.visor,
    })
    const join = (opts: Partial<JoinOptions> | Record<string, unknown>) => new Client(url).joinOrCreate(BASE_ROOM, opts)

    it('others see the chosen name and look', async () => {
      const a = await join({ name: 'Ronald', look })
      const b = await join({ name: 'Ada', look: DEFAULT_LOOK })
      const seen = await until(b, (s) => s.climbers.get(a.sessionId))
      expect(seen.name).toBe('Ronald')
      expect(fields(seen.look)).toEqual(look)
      await a.leave()
      await b.leave()
    })

    it('a clashing name gets numbered', async () => {
      const a = await join({ name: 'Twin', look })
      const b = await join({ name: 'twin', look })
      const named = await until(b, (s) => s.climbers.get(b.sessionId))
      expect(named.name).toBe('twin#2')
      await a.leave()
      await b.leave()
    })

    it('a bad name falls back, a bad look field falls back, the join still works', async () => {
      const a = await join({ name: 'admin', look: { ...look, hair: 'afro', body: 'javascript:' } })
      const me = await until(a, (s) => s.climbers.get(a.sessionId))
      expect(me.name).toMatch(/^Climber-/)
      expect(me.look.hair).toBe(DEFAULT_LOOK.hair)
      expect(me.look.body).toBe(DEFAULT_LOOK.body)
      expect(me.look.headwear).toBe('crown')
      await a.leave()
    })

    it('no options at all still joins', async () => {
      const a = await new Client(url).joinOrCreate(BASE_ROOM)
      const me = await until(a, (s) => s.climbers.get(a.sessionId))
      expect(me.name).toMatch(/^Climber-/)
      expect(fields(me.look)).toEqual(DEFAULT_LOOK)
      await a.leave()
    })
  })

  describe('chat', () => {
    function collect(room: Room): ChatLine[] {
      const lines: ChatLine[] = []
      room.onMessage(Msg.chat, (l: ChatLine) => lines.push(l))
      return lines
    }
    const settle = (room: Room) => nextPatch(room).then(() => nextPatch(room)).then(() => nextPatch(room))

    it('reaches everyone, with the sender name and cleaned text', async () => {
      const a = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Talker' })
      const b = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Listener' })
      const heardByB = collect(b)
      const heardByA = collect(a)
      a.send(Msg.chat, { text: '  hello\n  there  ' })
      await settle(b)
      expect(heardByB).toHaveLength(1)
      expect(heardByB[0]).toMatchObject({ from: a.sessionId, name: 'Talker', text: 'hello there' })
      expect(heardByA).toHaveLength(1) // the sender sees their own line come back
      await a.leave()
      await b.leave()
    })

    it('drops empty and junk messages, truncates long ones', async () => {
      const a = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Spammer' })
      const heard = collect(a)
      a.send(Msg.chat, { text: '   ' })
      a.send(Msg.chat, null)
      a.send(Msg.chat, { text: 42 })
      a.send(Msg.chat, { text: 'x'.repeat(CHAT_MAX * 3) })
      await settle(a)
      expect(heard).toHaveLength(1)
      expect(heard[0].text).toHaveLength(CHAT_MAX)
      await a.leave()
    })

    it('rate-limits a flood to the burst size', async () => {
      const a = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Flooder' })
      const heard = collect(a)
      for (let i = 0; i < CHAT_BURST + 10; i++) a.send(Msg.chat, { text: `msg ${i}` })
      await settle(a)
      expect(heard).toHaveLength(CHAT_BURST)
      await a.leave()
    })
  })

  describe('dev teleport', () => {
    const far = { x: 0, y: SPAWN.y, z: -150 }

    it('is ignored unless DEV_TELEPORT=1', async () => {
      delete process.env.DEV_TELEPORT
      const a = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Walker' })
      const start = await until(a, (s) => s.climbers.get(a.sessionId))
      const startZ = start.z
      a.send(Msg.teleport, far)
      await nextPatch(a)
      await nextPatch(a)
      expect((a.state as StateView).climbers.get(a.sessionId)!.z).toBe(startZ)
      await a.leave()
    })

    it('moves you anywhere on the floor when enabled, clamped to the bounds', async () => {
      process.env.DEV_TELEPORT = '1'
      try {
        const a = await new Client(url).joinOrCreate(BASE_ROOM, { name: 'Jumper' })
        await until(a, (s) => s.climbers.get(a.sessionId))
        a.send(Msg.teleport, far)
        const there = await until(a, (s) => {
          const c = s.climbers.get(a.sessionId)
          return c && c.z < -100 ? c : undefined
        })
        expect(there.z).toBeCloseTo(far.z)
        // and the next normal move from there is accepted, not corrected back
        a.send(Msg.move, { x: 0.3, y: SPAWN.y, z: far.z, rotY: 0 })
        const moved = await until(a, (s) => {
          const c = s.climbers.get(a.sessionId)
          return c && c.x > 0.2 ? c : undefined
        })
        expect(moved.z).toBeCloseTo(far.z)
        await a.leave()
      } finally {
        delete process.env.DEV_TELEPORT
      }
    })
  })
})
