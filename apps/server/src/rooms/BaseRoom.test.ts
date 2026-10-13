import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Client, type Room } from '@colyseus/sdk'
import { BASE_ROOM, Msg, SPAWN, SPAWN_RING_RADIUS, type ClimberView, type CorrectionMessage } from '@mcc/shared'
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
})
