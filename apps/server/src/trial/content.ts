// The Challenge content the server grades against: the public bundle (shared)
// joined with the private one (apps/server/content, written by `npm run
// content`). Hidden expected outputs, Predict outputs and Quiz answers live
// only here (ADR-0002).
import { readFileSync } from 'node:fs'
import { CHALLENGES, type PrivateChallenge, type PublicChallenge } from '@mcc/shared'

const PRIVATE_PATH = new URL('../../content/challenges.private.json', import.meta.url)

export interface ServerChallenge {
  public: PublicChallenge
  private: PrivateChallenge
}

let cache: Map<string, ServerChallenge> | null = null

/** Every Challenge by slug. Fails loudly if the two bundles disagree: rerun `npm run content`. */
export function challenges(): Map<string, ServerChallenge> {
  if (cache) return cache
  const priv = JSON.parse(readFileSync(PRIVATE_PATH, 'utf8')) as Record<string, PrivateChallenge>
  cache = new Map()
  for (const c of CHALLENGES) {
    const p = priv[c.slug]
    if (!p) throw new Error(`content: no private half for ${c.slug}; run npm run content`)
    if ((c.format === 'code' || c.format === 'fix') && p.hiddenCases?.length !== c.hiddenCount) {
      throw new Error(`content: ${c.slug} hidden case count differs between bundles; run npm run content`)
    }
    cache.set(c.slug, { public: c, private: p })
  }
  return cache
}
