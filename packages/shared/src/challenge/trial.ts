// The Trial protocol: one Climber, one Challenge, graded on the server
// (ADR-0002, ARCHITECTURE §5). The client runs the code; the server holds the
// answers and decides.
//
//   join "trial" { slug, name }  →  server sends TrialStart (hidden args, no expected)
//   client runs every case       →  sends a Submission
//   server compares              →  sends a TrialVerdict

import type { Language, TypedValue } from './comparator.ts'
import { LANGUAGES, type PublicChallenge } from './types.ts'

export const TRIAL_ROOM = 'trial'

export const TrialMsg = {
  start: 'trial:start',
  submit: 'trial:submit',
  verdict: 'trial:verdict',
} as const

/** Caps on what a client may send. */
export const SOURCE_MAX = 20_000
export const OUTPUT_MAX = 50_000
export const ANSWER_MAX = 2_000
/** A burst of submits, then one every few seconds. */
export const SUBMIT_BURST = 3
export const SUBMIT_REFILL_S = 3

export interface TrialJoinOptions {
  slug: string
  name?: string
}

export interface TrialStart {
  slug: string
  /** Code/Fix: the hidden cases' args, in order. Their expected outputs stay on the server. */
  hiddenArgs: TypedValue[][]
}

/** One case's output from the runner: the value, or the error it raised. */
export type CaseOutput = { value: TypedValue } | { error: string }

export type Submission =
  /** Code/Fix: outputs for the public cases then the hidden ones, in order. */
  | { kind: 'code'; language: Language; source: string; outputs: CaseOutput[] }
  /** The code didn't load or ran out of time: graded as a fail, logged. */
  | { kind: 'code'; language: Language; source: string; failed: string }
  | { kind: 'predict'; language: Language; answer: string }
  | { kind: 'quiz'; choice: number }

export interface CaseVerdict {
  ok: boolean
  hidden: boolean
  /** Public cases: why it failed (Verdict path and reason). Hidden cases say only what came back. */
  path?: string
  reason?: string
}

export type TrialVerdict =
  | { kind: 'code'; passed: boolean; cases: CaseVerdict[]; failed?: string }
  /** Predict and Quiz are one try: the verdict reveals the answer. */
  | { kind: 'predict'; passed: boolean; expected: string }
  | { kind: 'quiz'; passed: boolean; answer: number; explanation: string }
  | { kind: 'rejected'; reason: string }

const isLanguage = (x: unknown): x is Language => typeof x === 'string' && (LANGUAGES as readonly string[]).includes(x)

function isTyped(v: unknown, depth = 0): v is TypedValue {
  if (depth > 50) return false
  if (v === null || typeof v === 'boolean' || typeof v === 'string') return true
  if (typeof v === 'number') return Number.isFinite(v)
  if (Array.isArray(v)) return v.every((x) => isTyped(x, depth + 1))
  if (typeof v === 'object') {
    if (Object.getPrototypeOf(v) !== Object.prototype) return false
    return Object.values(v).every((x) => isTyped(x, depth + 1))
  }
  return false
}

/**
 * Parse an untrusted Submission for this Challenge, or say why not. Checks
 * the shape, the size caps, that the language is allowed, and that a Code
 * submission has exactly one output per case.
 */
export function parseSubmission(raw: unknown, challenge: PublicChallenge, caseCount: number): { ok: true; submission: Submission } | { ok: false; reason: string } {
  const no = (reason: string) => ({ ok: false as const, reason })
  if (typeof raw !== 'object' || raw === null) return no('not a submission')
  const r = raw as Record<string, unknown>
  const want = challenge.format === 'fix' ? 'code' : challenge.format
  if (r.kind !== want) return no(`this Challenge takes a ${want} submission`)

  if (r.kind === 'quiz') {
    const options = challenge.format === 'quiz' ? challenge.options.length : 0
    if (!Number.isInteger(r.choice) || (r.choice as number) < 0 || (r.choice as number) >= options) return no('no such option')
    return { ok: true, submission: { kind: 'quiz', choice: r.choice as number } }
  }

  if (!isLanguage(r.language)) return no('unknown language')
  if (r.kind === 'predict') {
    if (challenge.format !== 'predict' || !challenge.snippet[r.language]) return no('no snippet in that language')
    if (typeof r.answer !== 'string' || r.answer.length > ANSWER_MAX) return no('answer missing or too long')
    return { ok: true, submission: { kind: 'predict', language: r.language, answer: r.answer } }
  }

  if (challenge.format !== 'code' && challenge.format !== 'fix') return no('not a code Challenge')
  if (!challenge.languages.includes(r.language)) return no('language not offered here')
  if (typeof r.source !== 'string' || r.source.length > SOURCE_MAX) return no('source missing or too long')
  if (typeof r.failed === 'string') {
    return { ok: true, submission: { kind: 'code', language: r.language, source: r.source, failed: r.failed.slice(0, ANSWER_MAX) } }
  }
  if (!Array.isArray(r.outputs) || r.outputs.length !== caseCount) return no(`expected ${caseCount} outputs`)
  if (JSON.stringify(r.outputs).length > OUTPUT_MAX) return no('outputs too large')
  const outputs: CaseOutput[] = []
  for (const o of r.outputs as unknown[]) {
    if (typeof o !== 'object' || o === null) return no('bad output')
    const x = o as Record<string, unknown>
    if (typeof x.error === 'string') outputs.push({ error: x.error.slice(0, ANSWER_MAX) })
    else if ('value' in x && isTyped(x.value)) outputs.push({ value: x.value })
    else return no('bad output')
  }
  return { ok: true, submission: { kind: 'code', language: r.language, source: r.source, outputs } }
}
