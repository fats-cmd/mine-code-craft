import { schema, t, type SchemaType } from '@colyseus/schema'

export const Climber = schema({
  name: t.string(),
  color: t.string(),
  // Capsule centre, world units.
  x: t.float32(),
  y: t.float32(),
  z: t.float32(),
  rotY: t.float32(),
  status: t.string().default('idle'),
}, 'Climber')
export type Climber = SchemaType<typeof Climber>

export const BaseState = schema({
  // Stamped just before every patch, so clients can order snapshots by
  // server time rather than arrival time.
  serverTime: t.float64().default(0),
  climbers: t.map(Climber),
}, 'BaseState')
export type BaseState = SchemaType<typeof BaseState>
