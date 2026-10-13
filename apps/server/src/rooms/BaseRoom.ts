import { Room, type Client } from '@colyseus/core'
import {
  BASE_MAX_CLIENTS,
  Msg,
  PATCH_RATE_MS,
  SPAWN,
  parseMove,
  spawnPoint,
  validateMove,
  type CorrectionMessage,
  type Vec3,
} from '@mcc/shared'
import { BaseState, Climber } from './BaseState.ts'

const COLORS = ['#4f7cff', '#ff7a59', '#2fbf71', '#c45bff', '#ffc53d', '#19c3d6', '#ff5c8a', '#9aa63a']

/** One Base Instance: Climbers walking around the hub together. */
export class BaseRoom extends Room<{ state: BaseState }> {
  maxClients = Number(process.env.BASE_MAX_CLIENTS) || BASE_MAX_CLIENTS
  patchRate = PATCH_RATE_MS
  // MOVE_SEND_HZ plus room for chat and challenge messages later.
  maxMessagesPerSecond = 40
  state = new BaseState()

  /** Last accepted position and when it was accepted, per session. */
  private lastMove = new Map<string, { pos: Vec3; at: number }>()

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
  }

  onJoin(client: Client) {
    const climber = new Climber()
    climber.name = `Climber-${client.sessionId.slice(0, 4)}`
    climber.color = COLORS[this.state.climbers.size % COLORS.length]
    const spawn = spawnPoint(Math.random())
    Object.assign(climber, spawn)
    this.state.climbers.set(client.sessionId, climber)
    this.lastMove.set(client.sessionId, { pos: spawn, at: Date.now() })
    // The joiner's first full state is sent before the next patch stamps a time.
    this.state.serverTime = Date.now()
  }

  onLeave(client: Client) {
    this.state.climbers.delete(client.sessionId)
    this.lastMove.delete(client.sessionId)
  }

  onBeforePatch(state: BaseState) {
    state.serverTime = Date.now()
  }
}
