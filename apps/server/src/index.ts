import { createServer } from './server.ts'

// `npm run dev` passes this; a flag rather than `DEV_TELEPORT=1 cmd` so it works on Windows too.
if (process.argv.includes('--dev-teleport')) process.env.DEV_TELEPORT = '1'

const port = Number(process.env.PORT) || 2567

const server = createServer()
await server.listen(port)
console.log(`game server listening on ws://localhost:${port}`)
