import { CHALLENGES, type Format, type PublicChallenge } from "@mcc/shared"
import ChallengePanel from "./ChallengePanel"

// The dev route for the challenge engine (ROADMAP M3): /trial lists every
// Challenge, /trial/<slug> runs one in a TrialRoom. M4b puts these same panels
// inside the floor's encounters.

const FORMAT_NAME: Record<Format, string> = { code: "Code", fix: "Fix", predict: "Predict", quiz: "Quiz" }

export default function TrialApp({ path }: { path: string }) {
    const slug = decodeURIComponent(path.replace(/^\/trial\/?/, "").replace(/\/$/, ""))
    const challenge = CHALLENGES.find((c) => c.slug === slug)
    return (
        <div className="flex h-full flex-col bg-slate-900 text-white">
            {slug && challenge ? <Trial challenge={challenge} /> : <TrialList missing={slug || null} />}
        </div>
    )
}

function TrialList({ missing }: { missing: string | null }) {
    return (
        <div className="overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-semibold">Trials</h1>
                <p className="mt-1 text-sm text-white/60">Every Challenge in the game, one at a time, graded by the server. <a className="underline" href="/">Back to the Base</a></p>
                {missing && <p className="mt-3 rounded bg-red-500/15 p-2 text-sm">No Challenge called “{missing}”.</p>}
                {(Object.keys(FORMAT_NAME) as Format[]).map((f) => {
                    const list = CHALLENGES.filter((c) => c.format === f)
                    if (!list.length) return null
                    return (
                        <section key={f} className="mt-6">
                            <h2 className="text-lg font-semibold text-amber-300">{FORMAT_NAME[f]}</h2>
                            <ul className="mt-2 divide-y divide-white/10">
                                {list.map((c) => (
                                    <li key={c.slug}>
                                        <a href={`/trial/${c.slug}`} className="flex items-baseline gap-3 py-2 hover:bg-white/5">
                                            <span className="flex-1">{c.title}</span>
                                            <span className="text-xs text-white/40">{c.topics.join(" · ")}</span>
                                            <Difficulty n={c.difficulty} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

function Trial({ challenge: c }: { challenge: PublicChallenge }) {
    return (
        <>
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2">
                <a href="/trial" className="text-sm text-white/60 hover:text-white">← Trials</a>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide">{FORMAT_NAME[c.format]}</span>
                <h1 className="font-semibold">{c.title}</h1>
                <Difficulty n={c.difficulty} />
            </header>
            <ChallengePanel key={c.slug} challenge={c} />
        </>
    )
}

function Difficulty({ n }: { n: number }) {
    return <span className="font-mono text-xs text-amber-300" title={`difficulty ${n} of 5`}>{"●".repeat(n)}<span className="text-white/20">{"●".repeat(Math.max(0, 5 - n))}</span></span>
}
