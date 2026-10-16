// What a Challenge looks like on each side of the wire (CONTEXT: Challenge,
// Format). The content build (content/build/build.py) writes the public half
// into the client bundle and the private half for the server only
// (ADR-0002): hidden expected outputs, quiz answers and predict outputs never
// reach the client.

import type { Language, TypedValue } from './comparator.ts'

export type Format = 'code' | 'fix' | 'predict' | 'quiz'
export const LANGUAGES: readonly Language[] = ['python', 'javascript']

export interface ChallengeBase {
  slug: string
  format: Format
  title: string
  /** 1 (gentle) to 5 (hard). */
  difficulty: number
  topics: string[]
}

export interface Case {
  args: TypedValue[]
  expected: TypedValue
}

/** Code: write a function. Fix: make the given buggy function pass. Same grading. */
export interface CodeChallenge extends ChallengeBase {
  format: 'code' | 'fix'
  statement: string
  languages: Language[]
  /** The function the harness calls, per language (snake_case in Python, camelCase in JS). */
  function: Record<Language, string>
  /** Code: an empty function. Fix: the buggy code to repair. */
  starter: Record<Language, string>
  unordered: boolean
  /** Shown to the player with expected outputs; "Run" checks these locally. */
  publicCases: Case[]
  hiddenCount: number
}

export interface PredictChallenge extends ChallengeBase {
  format: 'predict'
  prompt: string
  snippet: Partial<Record<Language, string>>
}

export interface QuizChallenge extends ChallengeBase {
  format: 'quiz'
  question: string
  options: string[]
}

export type PublicChallenge = CodeChallenge | PredictChallenge | QuizChallenge

/** The server-only half, keyed by slug. */
export interface PrivateChallenge {
  /** Code/Fix: every hidden case. The server sends only the args. */
  hiddenCases?: Case[]
  /** Predict: the exact output per language (normalised). */
  output?: Partial<Record<Language, string>>
  /** Quiz: the correct option index, and why. */
  answer?: number
  explanation?: string
}
