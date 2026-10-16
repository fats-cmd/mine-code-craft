// Every graded submission, one JSON object per line. Postgres is deferred
// (ROADMAP M3), so this file is the record for now: append-only and easy to
// load into a table later. Set SUBMISSIONS_LOG to move it; tests point it at
// a temp file.
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface SubmissionRow {
  at: string
  slug: string
  format: string
  name: string
  sessionId: string
  language?: string
  passed: boolean
  /** Code/Fix: cases passed of total. */
  score?: [number, number]
  source?: string
  answer?: string | number
  failed?: string
}

const defaultPath = fileURLToPath(new URL('../../data/submissions.jsonl', import.meta.url))

let queue: Promise<unknown> = Promise.resolve()

/** Append a row. Writes are serialised so lines never interleave; a failed write is logged, not thrown. */
export function logSubmission(row: SubmissionRow, path = process.env.SUBMISSIONS_LOG || defaultPath): Promise<void> {
  const write = queue.then(async () => {
    await mkdir(dirname(path), { recursive: true })
    await appendFile(path, JSON.stringify(row) + '\n')
  })
  queue = write.catch((err) => console.error('submissions log:', err))
  return queue.then(() => undefined)
}
