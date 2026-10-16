// Grading: pure, so it's tested without a room. The comparator is the shared one.
import { compare, normalizeOutput, show, type CaseVerdict, type Submission, type TrialVerdict } from '@mcc/shared'
import type { ServerChallenge } from './content.ts'

/** Code/Fix cases in submission order: public then hidden. */
export function allCases(c: ServerChallenge) {
  if (c.public.format !== 'code' && c.public.format !== 'fix') return []
  return [...c.public.publicCases.map((x) => ({ ...x, hidden: false })), ...(c.private.hiddenCases ?? []).map((x) => ({ ...x, hidden: true }))]
}

export function grade(c: ServerChallenge, s: Submission): TrialVerdict {
  const pub = c.public
  switch (s.kind) {
    case 'quiz': {
      const answer = c.private.answer ?? -1
      return { kind: 'quiz', passed: s.choice === answer, answer, explanation: c.private.explanation ?? '' }
    }
    case 'predict': {
      const expected = c.private.output?.[s.language] ?? ''
      return { kind: 'predict', passed: normalizeOutput(s.answer) === expected, expected }
    }
    case 'code': {
      const cases = allCases(c)
      if ('failed' in s) return { kind: 'code', passed: false, cases: cases.map((x) => ({ ok: false, hidden: x.hidden })), failed: s.failed }
      const unordered = pub.format !== 'quiz' && pub.format !== 'predict' && pub.unordered
      const verdicts: CaseVerdict[] = cases.map((x, i) => {
        const out = s.outputs[i]
        if ('error' in out) return { ok: false, hidden: x.hidden, reason: out.error }
        const v = compare(x.expected, out.value, { language: s.language, unordered })
        if (v.ok) return { ok: true, hidden: x.hidden }
        // A hidden case's reason would leak its expected output: say only what came back.
        return x.hidden ? { ok: false, hidden: true, reason: `got ${show(out.value, s.language)}` } : { ok: false, hidden: false, path: v.path, reason: v.reason }
      })
      return { kind: 'code', passed: verdicts.every((v) => v.ok), cases: verdicts }
    }
  }
}
