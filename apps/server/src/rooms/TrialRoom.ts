import { Room, type Client } from '@colyseus/core'
import {
  RateLimiter,
  SUBMIT_BURST,
  SUBMIT_REFILL_S,
  TrialMsg,
  checkName,
  parseSubmission,
  type TrialJoinOptions,
  type TrialStart,
  type TrialVerdict,
} from '@mcc/shared'
import { challenges, type ServerChallenge } from '../trial/content.ts'
import { allCases, grade } from '../trial/grade.ts'
import { logSubmission } from '../trial/submissions.ts'

/**
 * One Climber, one Challenge (ARCHITECTURE: Rooms). The client runs the code;
 * this room holds the answers and grades. Code and Fix can be resubmitted
 * (rate limited); Predict and Quiz are one try, since the verdict reveals the
 * answer. Later milestones add the clock, Integrity and phases (M4b).
 */
export class TrialRoom extends Room {
  maxClients = 1
  maxMessagesPerSecond = 10

  private challenge!: ServerChallenge
  private name = 'Climber'
  private limiter = new RateLimiter(SUBMIT_BURST, SUBMIT_REFILL_S)
  private done = false

  messages = {
    [TrialMsg.submit]: (client: Client, raw: unknown) => {
      const send = (v: TrialVerdict) => client.send(TrialMsg.verdict, v)
      if (this.done) return send({ kind: 'rejected', reason: 'this Trial is over' })
      if (!this.limiter.take(Date.now())) return send({ kind: 'rejected', reason: 'slow down: one submit every few seconds' })
      const parsed = parseSubmission(raw, this.challenge.public, allCases(this.challenge).length)
      if (!parsed.ok) return send({ kind: 'rejected', reason: parsed.reason })

      const s = parsed.submission
      const verdict = grade(this.challenge, s)
      if (s.kind !== 'code') this.done = true
      send(verdict)
      void logSubmission({
        at: new Date().toISOString(),
        slug: this.challenge.public.slug,
        format: this.challenge.public.format,
        name: this.name,
        sessionId: client.sessionId,
        passed: 'passed' in verdict && verdict.passed,
        ...(s.kind === 'quiz' ? { answer: s.choice } : { language: s.language }),
        ...(s.kind === 'predict' ? { answer: s.answer } : {}),
        ...(s.kind === 'code' ? { source: s.source, ...('failed' in s ? { failed: s.failed } : {}) } : {}),
        ...(verdict.kind === 'code' ? { score: [verdict.cases.filter((c) => c.ok).length, verdict.cases.length] as [number, number] } : {}),
      })
    },
  }

  onCreate(options?: unknown) {
    const slug = (options as Partial<TrialJoinOptions> | undefined)?.slug
    const c = typeof slug === 'string' ? challenges().get(slug) : undefined
    if (!c) throw new Error(`no Challenge called ${String(slug)}`)
    this.challenge = c
    void this.lock()
  }

  onJoin(client: Client, options?: unknown) {
    const checked = checkName((options as Partial<TrialJoinOptions> | undefined)?.name)
    this.name = checked.ok ? checked.name : `Climber-${client.sessionId.slice(0, 4)}`
    const start: TrialStart = {
      slug: this.challenge.public.slug,
      hiddenArgs: (this.challenge.private.hiddenCases ?? []).map((c) => c.args),
    }
    client.send(TrialMsg.start, start)
  }
}
