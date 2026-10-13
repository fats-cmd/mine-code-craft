import { defineRoom, defineServer, type ServerOptions } from '@colyseus/core'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { BASE_ROOM } from '@mcc/shared'
import { BaseRoom } from './rooms/BaseRoom.ts'

export function createServer(options: Pick<ServerOptions, 'gracefullyShutdown'> = {}) {
  return defineServer({
    transport: new WebSocketTransport(),
    greet: false,
    ...options,
    rooms: {
      [BASE_ROOM]: defineRoom(BaseRoom),
    },
  })
}
