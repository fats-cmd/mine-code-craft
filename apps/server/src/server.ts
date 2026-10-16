import { defineRoom, defineServer, type ServerOptions } from '@colyseus/core'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { BASE_ROOM, TRIAL_ROOM } from '@mcc/shared'
import { BaseRoom } from './rooms/BaseRoom.ts'
import { TrialRoom } from './rooms/TrialRoom.ts'

export function createServer(options: Pick<ServerOptions, 'gracefullyShutdown'> = {}) {
  return defineServer({
    transport: new WebSocketTransport(),
    greet: false,
    ...options,
    rooms: {
      [BASE_ROOM]: defineRoom(BaseRoom),
      // Always a fresh room: client.create(TRIAL_ROOM, { slug }).
      [TRIAL_ROOM]: defineRoom(TrialRoom),
    },
  })
}
