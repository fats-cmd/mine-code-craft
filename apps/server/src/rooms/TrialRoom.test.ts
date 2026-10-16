import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Client, type Room } from '@colyseus/sdk'
import { TRIAL_ROOM, TrialMsg, type CaseOutput, type TrialStart, type TrialVerdict } from '@mcc/shared'
import { createServer } from '../server.ts'
import { challenges } from '../trial/content.ts'
import { allCases } from '../trial/grade.ts'

// End to end over real WebSockets, against the real content bundles.

const log = join(mkdtempSync(join(tmpdir(), 'mcc-trial-')), 'submissions.jsonl')
process.env.SUBMISSIONS_LOG = log
const PORT = 2900 + Math.floor(Math.random() * 300)
const server = createServer({ gracefullyShutdown: false })
const url = `http://localhost:${PORT}`

beforeAll(async () => {
  await server.listen(PORT)
})
afterAll(async () => {
  await server.gracefullyShutdown(false)
})

async function open(slug: string): Promise<{ room: Room; start: TrialStart }> {
  const client = new Client(url)
  let resolveStart: (s: TrialStart) => void = () => {}
  const started = new Promise<TrialStart>((r) => (resolveStart = r))
  const room = await client.create(TRIAL_ROOM, { slug, name: 'Ada' })
  room.onMessage(TrialMsg.start, resolveStart)
  room.onMessage(TrialMsg.verdict, () => {}) // replaced per submit below
  return { room, start: await started }
}

function submit(room: Room, body: unknown): Promise<TrialVerdict> {
  return new Promise((resolve) => {
    room.onMessage(TrialMsg.verdict, resolve)
    room.send(TrialMsg.submit, body)
  })
}

/** What a perfect runner would produce. */
const perfect = (slug: string): CaseOutput[] => allCases(challenges().get(slug)!).map((c) => ({ value: c.expected }))

const rows = () => readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l))

describe('TrialRoom', () => {
  it('sends hidden args but never hidden expected outputs', async () => {
    const { room, start } = await open('two-sum')
    expect(start.slug).toBe('two-sum')
    expect(start.hiddenArgs.length).toBe(challenges().get('two-sum')!.private.hiddenCases!.length)
    expect(JSON.stringify(start)).not.toContain('expected')
    await room.leave()
  })

  it('passes a correct Code submission and logs it', async () => {
    const { room } = await open('two-sum')
    const v = await submit(room, { kind: 'code', language: 'python', source: 'def two_sum(nums, target): ...', outputs: perfect('two-sum') })
    expect(v).toMatchObject({ kind: 'code', passed: true })
    await room.leave()
    await new Promise((r) => setTimeout(r, 50))
    const row = rows().find((r) => r.slug === 'two-sum' && r.passed)
    expect(row).toMatchObject({ name: 'Ada', format: 'code', language: 'python' })
    expect(row.score[0]).toBe(row.score[1])
  })

  it('a wrong public case explains itself; a wrong hidden case does not leak its answer', async () => {
    const { room } = await open('longest-unique-substring')
    const outputs = perfect('longest-unique-substring')
    const pub = (challenges().get('longest-unique-substring')!.public as { publicCases: unknown[] }).publicCases.length
    outputs[0] = { value: 999 }
    outputs[pub] = { value: 12345 }
    outputs[pub + 1] = { error: 'ZeroDivisionError: division by zero (line 3)' }
    const v = await submit(room, { kind: 'code', language: 'python', source: 'x', outputs })
    if (v.kind !== 'code') throw new Error('expected a code verdict')
    expect(v.passed).toBe(false)
    expect(v.cases[0]).toMatchObject({ ok: false, hidden: false, reason: expect.stringContaining('got 999') })
    expect(v.cases[pub]).toEqual({ ok: false, hidden: true, reason: 'got 12345' })
    expect(v.cases[pub + 1]).toMatchObject({ ok: false, reason: expect.stringContaining('ZeroDivisionError') })
    await room.leave()
  })

  it('applies the JS number rule: Python 1 is not 1.0, JavaScript has one number', async () => {
    const untagged = perfect('moving-average').map((o) => ({ value: JSON.parse(JSON.stringify('value' in o ? o.value : null).replace(/\{"\$float":([^}]+)\}/g, '$1')) }))
    const py = await open('moving-average')
    const vp = await submit(py.room, { kind: 'code', language: 'python', source: 'x', outputs: untagged })
    expect(vp).toMatchObject({ passed: false })
    await py.room.leave()
    const js = await open('moving-average')
    const vj = await submit(js.room, { kind: 'code', language: 'javascript', source: 'x', outputs: untagged })
    expect(vj).toMatchObject({ passed: true })
    await js.room.leave()
  })

  it('logs a run that timed out as a fail', async () => {
    const { room } = await open('two-sum')
    const v = await submit(room, { kind: 'code', language: 'javascript', source: 'for(;;){}', failed: 'timed out after 4 s' })
    expect(v).toMatchObject({ kind: 'code', passed: false, failed: 'timed out after 4 s' })
    await room.leave()
  })

  it('grades a Quiz once and reveals the answer', async () => {
    const slug = 'floor-1-store-is'
    const answer = challenges().get(slug)!.private.answer!
    const { room } = await open(slug)
    const v = await submit(room, { kind: 'quiz', choice: answer })
    expect(v).toMatchObject({ kind: 'quiz', passed: true, answer })
    expect(await submit(room, { kind: 'quiz', choice: answer })).toEqual({ kind: 'rejected', reason: 'this Trial is over' })
    await room.leave()
  })

  it('grades Predict with trailing whitespace ignored and case kept', async () => {
    const { room } = await open('store-and-mill')
    expect(await submit(room, { kind: 'predict', language: 'python', answer: '8 5 6  \n\n' })).toEqual({ kind: 'predict', passed: true, expected: '8 5 6' })
    await room.leave()
  })

  it('rejects malformed submissions and too many submits', async () => {
    const { room } = await open('two-sum')
    expect(await submit(room, { kind: 'code', language: 'python', source: 'x', outputs: [] })).toMatchObject({ kind: 'rejected' })
    expect(await submit(room, { kind: 'code', language: 'ruby', source: 'x', outputs: perfect('two-sum') })).toMatchObject({ kind: 'rejected', reason: 'unknown language' })
    expect(await submit(room, { kind: 'quiz', choice: 0 })).toMatchObject({ kind: 'rejected' })
    // the burst is spent
    expect(await submit(room, { kind: 'code', language: 'python', source: 'x', outputs: perfect('two-sum') })).toMatchObject({ kind: 'rejected', reason: expect.stringContaining('slow down') })
    await room.leave()
  })

  it('refuses a Challenge that does not exist', async () => {
    await expect(new Client(url).create(TRIAL_ROOM, { slug: 'nope' })).rejects.toThrow()
  })
})
