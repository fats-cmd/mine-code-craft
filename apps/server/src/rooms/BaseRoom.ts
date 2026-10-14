import { Room, type Client } from '@colyseus/core'
import {
  BASE_MAX_CLIENTS,
  Msg,
  PATCH_RATE_MS,
  RateLimiter,
  SPAWN,
  checkName,
  clampToBase,
  cleanChat,
  parseLook,
  parseMove,
  spawnPoint,
  uniqueName,
  validateMove,
  type ChatLine,
  type CorrectionMessage,
  type Vec3,
} from '@mcc/shared'
import { BaseState, Climber, LookState } from './BaseState.ts'

/** One Base Instance: Climbers walking around the hub together. */
export class BaseRoom extends Room<{ state: BaseState }> {
  maxClients = Number(process.env.BASE_MAX_CLIENTS) || BASE_MAX_CLIENTS
  patchRate = PATCH_RATE_MS
  // MOVE_SEND_HZ plus room for chat and challenge messages later.
  maxMessagesPerSecond = 40
  state = new BaseState()

  /** Last accepted position and when it was accepted, per session. */
  private lastMove = new Map<string, { pos: Vec3; at: number }>()
  private chatLimit = new Map<string, RateLimiter>()

  messages = {
    [Msg.move]: (client: Client, raw: unknown) => {
      const move = parseMove(raw)
      const climber = this.state.climbers.get(client.sessionId)
      const last = this.lastMove.get(client.sessionId)
      if (!move || !climber || !last) return

      const now = Date.now()
      const verdict = validateMove(last.pos, move, (now - last.at) / 1000)
      if (!verdict.ok) {
        client.send(Msg.correction, verdict.pos satisfies CorrectionMessage)
        return
      }
      this.lastMove.set(client.sessionId, { pos: verdict.pos, at: now })
      climber.x = verdict.pos.x
      climber.y = verdict.pos.y
      climber.z = verdict.pos.z
      climber.rotY = move.rotY
    },

    // Falling off the world: the server moves you, so it is never a teleport.
    [Msg.respawn]: (client: Client) => {
      const climber = this.state.climbers.get(client.sessionId)
      if (!climber) return
      Object.assign(climber, SPAWN)
      this.lastMove.set(client.sessionId, { pos: { ...SPAWN }, at: Date.now() })
    },

    // Dev tool (?debug teleports). Off unless the server was started with DEV_TELEPORT=1,
    // which `npm run dev` does and production never should.
    [Msg.teleport]: (client: Client, raw: unknown) => {
      if (process.env.DEV_TELEPORT !== '1') return
      const to = parseMove({ rotY: 0, ...(raw as object) })
      const climber = this.state.climbers.get(client.sessionId)
      if (!to || !climber) return
      const pos = clampToBase(to)
      Object.assign(climber, pos)
      this.lastMove.set(client.sessionId, { pos, at: Date.now() })
    },

    // Ephemeral: broadcast and forget. Over the rate limit is dropped silently.
    [Msg.chat]: (client: Client, raw: unknown) => {
      const climber = this.state.climbers.get(client.sessionId)
      const text = cleanChat((raw as { text?: unknown } | null)?.text)
      const limiter = this.chatLimit.get(client.sessionId)
      if (!climber || !text || !limiter?.take(Date.now())) return
      const line: ChatLine = { from: client.sessionId, name: climber.name, text, at: Date.now() }
      this.broadcast(Msg.chat, line)
    },
  }

  /**
   * Guests choose their own name and look in join options. Nothing is
   * rejected: a bad name falls back to Climber-xxxx, a bad look field to its
   * default. With sign-in, these come from the verified profile instead.
   */
  onJoin(client: Client, options?: unknown) {
    const opts = (options ?? {}) as { name?: unknown; look?: unknown }
    const checked = checkName(opts.name)
    const wanted = checked.ok ? checked.name : `Climber-${client.sessionId.slice(0, 4)}`
    const taken = [...this.state.climbers.values()].map((c) => c.name)

    const climber = new Climber()
    climber.name = uniqueName(wanted, taken)
    climber.look = Object.assign(new LookState(), parseLook(opts.look))
    const spawn = spawnPoint(Math.random())
    Object.assign(climber, spawn)
    this.state.climbers.set(client.sessionId, climber)
    this.lastMove.set(client.sessionId, { pos: spawn, at: Date.now() })
    this.chatLimit.set(client.sessionId, new RateLimiter(undefined, undefined, Date.now()))
    // The joiner's first full state is sent before the next patch stamps a time.
    this.state.serverTime = Date.now()
  }

  onLeave(client: Client) {
    this.state.climbers.delete(client.sessionId)
    this.lastMove.delete(client.sessionId)
    this.chatLimit.delete(client.sessionId)
  }

  onBeforePatch(state: BaseState) {
    state.serverTime = Date.now()
  }
}
