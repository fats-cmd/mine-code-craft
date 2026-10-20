# Educational games, beginner onboarding to programming, and social retention

Scope: evidence and practitioner lessons for a browser 3D multiplayer game that teaches CS through its history (a Tower of floors in the style of Tower of God, boss fights solved with real Python/JS challenges, a shared Hall per floor, duels, falling a floor on failure).

Evidence-strength key used below: **[STRONG]** = meta-analysis or multiple controlled studies; **[MODERATE]** = single controlled/quasi-experimental study or large observational dataset; **[WEAK]** = company self-report, practitioner opinion, press, or fan sources.

Method note: findings were gathered through web search result summaries and abstract pages, not full-text reads. Where a figure could only be found in secondary sources, it is flagged.

---

## 1. Why many educational games fail, and what successful ones do

### Takeaway
The best controlled evidence (Habgood & Ainsworth 2011) supports *intrinsic integration*: the learning content must BE the core game mechanic, not a quiz gate in front of a reward ("chocolate-covered broccoli"). Games as a whole beat conventional instruction only modestly (d≈0.29), and are NOT reliably more motivating; they work best with supplementary instruction, multiple sessions and group play. Engagement inside a game also does not guarantee transfer to standard notation (DragonBox).

### Cited Findings
- **[MODERATE]** Habgood & Ainsworth (2011), "Motivating Children to Learn Effectively: Exploring the Value of Intrinsic Integration in Educational Games," *Journal of the Learning Sciences* 20(2):169–206, DOI 10.1080/10508406.2010.508029. They argue educational software has usually treated games as an add-on reward for learning content. Using a maths game, *Zombie Division* (ages 7–11), Study 1 (n=58, 2 hours, intrinsic vs extrinsic vs control versions) found more learning from the intrinsic version under fixed time. In Study 2 (n=16, free choice) children spent **~7× longer** playing the intrinsic version. — [Nottingham repository](https://nottingham-repository.worktribe.com/output/23577510/motivating-children-to-learn-effectively-exploring-the-value-of-intrinsic-integration-in-educational-games)
- **[Theory, highly cited]** Malone (1981), "Toward a theory of intrinsically motivating instruction," *Cognitive Science* (pp. 333–369; volume given as 4 or 5(4) depending on the source, so check before citing). Three categories: **challenge** (goals with uncertain outcomes, produced by variable difficulty, multi-level goals, hidden information, randomness), **fantasy** (with a distinction between *extrinsic* fantasies that depend only weakly on the skill and *intrinsic* fantasies "intimately related to the use of the skill"), and **curiosity** (sensory and cognitive; cognitive curiosity is aroused by making learners believe their knowledge is "incomplete, inconsistent, or unparsimonious"). — [UCSB record](https://cdgr.ucsb.edu/node/768); [Karl Kapp summary](https://karlkapp.com/using-fantasy-in-instructional-games/)
- **[STRONG]** Wouters, van Nimwegen, van Oostendorp & van der Spek (2013), *Journal of Educational Psychology* 105(2):249–265. Meta-analysis: serious games beat conventional instruction for **learning d=0.29** (k=77, N=5,547) and **retention d=0.36**, but were **not more motivating** (d=0.26, k=31, N=2,216; reported as non-significant; some copies print the p-value inconsistently). Games did better when **supplemented with other instruction**, when there were **multiple sessions**, and when **players worked in groups**. — [Utrecht research portal](https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/); [e-teaching.org abstract](https://www.e-teaching.org/materialien/literatur/wouters-van-nimwegen-van-ooostendorp-van-der-spek-2013)
- **[MODERATE]** DragonBox (algebra): in Long & Aleven's comparison with the Lynnette tutor at Carnegie Mellon, DragonBox players solved many more problems and enjoyed it more, but Lynnette students did significantly better on the post-test. Aleven: "The game provides too much 'scaffolding'," and the game never asks players to write their own equations. The CMU report found it "ineffective in helping students acquire skills in solving algebra equations, as measured by a typical test of equation solving." — [CMU "Fun and Games"](https://www.cmu.edu/homepage/computing/2014/spring/fun-and-games.shtml); [EdSurge](https://edsurge.com/news/2016-03-13-enter-the-dragonbox-can-a-game-really-teach-third-graders-algebra)
- **[MODERATE, conflicting]** Later studies are more positive for DragonBox 12+: an RCT with >3,600 Grade 7 students reported higher posttest scores than an active control (DOI 10.1177/23328584231165919, *AERA Open*, 2023; found only via a proxy mirror, so verify on SAGE). A small quasi-experiment (≈30 per group) also found gains. — [DOI link](https://doi.org/10.1177/23328584231165919); [eJMT paper](https://ejmt.mathandtech.org/Contents\eJMT_v10n1p1.pdf)
- **[MODERATE]** Hanus & Fox (2015), *Computers & Education* 80:152–161: a longitudinal classroom study where the gamified course (badges, leaderboards) showed **lower intrinsic motivation and lower final exam scores** than the non-gamified class, with motivation mediating the exam effect. A corrigendum was published in 2018; its contents were not checked. — [Michael Hanus profile summary](https://osu.academia.edu/MichaelHanus); [peeref record](https://www.peeref.com/works/355703)

### Inferences
- For this game, the code challenge must be the boss fight itself: the boss's behaviour should be *governed by* the player's code or prediction (for example, the code literally controls a mechanism, or a Predict answer decides where the boss strikes). A multiple-choice quiz that unlocks a sword swing is the extrinsic, "chocolate-covered broccoli" pattern that Habgood & Ainsworth found inferior.
- The DragonBox case is a direct warning for a block/visual metaphor: if floors teach CS through 3D puzzles, the game must eventually require **real Python/JS in standard syntax**, or the learning may not transfer. The project's decision to use real code is supported.
- Wouters' moderators (multiple sessions, group play, supplementary instruction) suggest designing for repeated short sessions, co-op in the Hall, and in-game explanations (Guide lines, history codex) rather than relying on play alone.
- Do not assume the game will be "more motivating" just because it is a game; the meta-analysis says it usually is not. Motivation must be designed through mechanics (see Section 3).

### Gaps
- No sources were retrieved on Oregon Trail, the Math Blaster critique, Kerbal Space Program, CodeCombat, CodinGame or Khan Academy, so claims about them are not included. (The term "chocolate-covered broccoli" is widely attributed to Brenda Laurel / Amy Bruckman, but this was not verified in this session.)
- Full texts of Habgood & Ainsworth and Hanus & Fox were not read; effect sizes from them are not quoted.
- No rigorous outcome studies of commercial coding games (CodeCombat, CodinGame, Screeps, TIS-100 style games) were found in this session.

---

## 2. Learning science: productive failure, worked examples, spacing, desirable difficulties, feedback

### Takeaway
There is a real tension: **worked examples** help true novices most (and lose value as skill grows: "expertise reversal"), while **productive failure** (struggle first, then instruction) helps conceptual understanding when designed carefully. **Desirable difficulties** (spacing, interleaving, retrieval) improve long-term retention, but learners misjudge them as worse. A game can use all three by sequencing them: example, then fading, then challenge that is followed by explanation.

### Cited Findings
- **[STRONG]** Sinha & Kapur (2021), "When Problem Solving Followed by Instruction Works: Evidence for Productive Failure," *Review of Educational Research*, DOI 10.3102/00346543211019105. Meta-analysis of **53 studies / 166 comparisons** (mostly school and university students; math, physics, chemistry, biology, medicine). Problem solving *before* instruction outperformed instruction-first; the authors say the effect was about twice that of a year of good teaching, and up to three times when designed "with high fidelity to principles of productive failure." Fidelity to PF design moderated the effect. — [DOI](https://doi.org/10.3102/00346543211019105); [Futurity coverage](https://futurity.org/?p=2629782); [Tech & Learning](https://techlearning.com/news/study-productive-failure-a-success-in-education)
- **[STRONG]** Worked-example effect and expertise reversal (Sweller, Kalyuga): studying worked examples is better than problem solving for inexperienced learners early in skill acquisition, and this advantage **disappears as expertise grows**; researchers recommend **fading** worked steps out over time. — [Wikipedia: Worked-example effect](https://en.wikipedia.org/wiki/Worked-example_effect); [Renkl/Atkinson-style fading paper (ASU)](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf); [CS Ed summary of Expertise Reversal (2003)](https://csed.substack.com/p/the-expertise-reversal-effect-2003)
- **[STRONG, secondary sources]** Bjork & Bjork's "desirable difficulties" (term coined 1994): conditions that slow acquisition (spacing, interleaving, retrieval practice/testing, generation, varied practice) often **improve long-term retention and transfer**. Learners who studied in blocks predicted they would do better than interleaved learners, but did worse: "What we can observe is performance, but what we have to infer is learning." The Bjorks' theory separates storage strength (only goes up) from retrieval strength (fluctuates). — [APS Observer, "Desirable Difficulties"](https://www.psychologicalscience.org/observer/desirable-difficulties); [Wikipedia](https://en.wikipedia.org/wiki/Desirable_difficulty)
- **[Theory]** Malone: challenge requires *uncertain outcomes*, and cognitive curiosity comes from exposing gaps or inconsistencies in what the learner knows, which lines up with "struggle first, explain after." — [UCSB record](https://cdgr.ucsb.edu/node/768)
- **[WEAK but relevant, moderation research]** Feedback speed matters for behaviour change: Riot found that punishment feedback with clear explanations and evidence (chat logs) raised reform from ~50% to ~65–70%, and feedback within minutes instead of a week helped. That concerns behaviour, not learning, but the pattern of *fast, specific, evidence-backed feedback* is consistent. — [MIT Technology Review](https://www.technologyreview.com/2015/09/14/166255/a-video-game-algorithm-to-solve-online-abuse/)

### Inferences
- **Sequencing per floor:** early floors and new concepts should open with a worked example (the Guide or the historical figure demonstrates), then a faded version (Fix or Parsons-style), then a full Code challenge. Boss fights can be "productive failure" moments *only if* a clear explanation follows the failure (the post-fight debrief is the "instruction" half of PF; without it, failure is just failure).
- **Falling a floor on failure** is a desirable difficulty only if it produces *retrieval* (re-solving earlier material) rather than pure punishment. Making the fall land the player on content that revisits prerequisite concepts turns it into spaced, interleaved practice.
- **Interleaving:** mixing old concepts into new floors' trials (e.g., a Floor 5 boss requiring a Floor 2 loop) is supported by spacing/interleaving evidence, but players will feel it is harder and may rate it lower; this is expected.
- **Expertise reversal** argues for skipping or collapsing worked examples for experienced players (e.g., a "test out" path), so experts are not bored.

### Gaps
- The exact pooled effect size (Cohen's d / Hedges' g) from Sinha & Kapur 2021 was not retrieved; the "twice a year of good teaching" claim comes from press releases.
- Known critiques of productive failure (e.g., explicit-instruction-first findings for high element-interactivity material, from the cognitive-load camp) were not retrieved and should be checked before relying on PF for novices.
- No study was found that tests productive failure or worked examples *inside a game* specifically, or that tests a "lose a level on failure" mechanic for learning.
- Primary Bjork papers were not read; the summary is from secondary sources (APS, Wikipedia).

---

## 3. Self-determination theory and flow in game design

### Takeaway
Ryan, Rigby & Przybylski's SDT studies are the strongest evidence that game enjoyment and continued play come from **autonomy, competence and relatedness**; in an online multiplayer community all three independently predicted enjoyment and future play. Flow-based design (Jenova Chen) argues for letting players choose their own difficulty rather than forcing it.

### Cited Findings
- **[MODERATE–STRONG, foundational]** Ryan, Rigby & Przybylski (2006), "The Motivational Pull of Video Games: A Self-Determination Theory Approach," *Motivation and Emotion* 30, DOI 10.1007/s11031-006-9051-8. Four studies. Studies 1–3: perceived in-game **autonomy and competence** were associated with enjoyment, preferences and pre-to-post-play changes in well-being; competence and autonomy also related to **intuitive controls** and to presence/immersion. Study 4 (an online multiplayer community): **autonomy, competence and relatedness independently predicted enjoyment and future play**. The paper led to the PENS (Player Experience of Need Satisfaction) measure. — [ACU research bank](https://acuresearchbank.acu.edu.au/item/8q128/the-motivational-pull-of-video-games-a-self-determination-theory-approach); [Rochester PDF](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf); [ScienceDaily (2006)](https://www.sciencedaily.com/releases/2006/12/061226134706.htm); [SDT.org on PENS](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)
- **[MODERATE]** Hanus & Fox (2015): extrinsic gamification (badges, leaderboards, coins) in a class reduced intrinsic motivation and exam scores, consistent with SDT's prediction that controlling rewards can undermine intrinsic motivation. — [Hanus profile](https://osu.academia.edu/MichaelHanus)
- **[Practitioner / thesis]** Jenova Chen's MFA thesis "Flow in Games" (USC) and the game *flOw*: based on Csikszentmihalyi's flow (skill matched to challenge), he proposed player-driven "active" dynamic difficulty adjustment, where players choose when to take on harder content (in *flOw*, by eating smaller organisms before engaging larger ones). The PS3 release was the most downloaded PSN game of 2007 and won Best Downloadable Game at the 2008 GDC Awards (commercial, not learning, outcome). — [Wikipedia: flOw](https://en.wikipedia.org/wiki/Flow_(video_game)); [Wikipedia: Jenova Chen](https://en.wikipedia.org/wiki/Jenova_Chen); [Game Developer interview](https://gamedeveloper.com/design/go-with-the-i-fl0w-i-jenova-chen-on-console-independence)
- **[Theory]** Malone's challenge factor ("variable difficulty level, multiple level goals") parallels flow's challenge–skill balance. — [UCSB record](https://cdgr.ucsb.edu/node/768)

### Inferences
- **Autonomy:** let Climbers choose language (Python vs JS), choose which side trials or duels to attempt, and choose when to face the boss (Chen's "eat small things until ready"). Avoid forced linear quiz chains.
- **Competence:** clear, immediate test feedback; visible mastery; intuitive controls (the SDT paper links intuitive controls to competence). Losing a floor threatens competence; framing and a quick, clear path back matter.
- **Relatedness:** the shared Hall, helping others and duels are the relatedness lever; Study 4 suggests it independently predicts future play in online games.
- Rewards (XP, badges, rank) should be *informational* (signal mastery) rather than *controlling* (required to proceed), given Hanus & Fox.

### Gaps
- Csikszentmihalyi's primary work and empirical flow studies in learning games were not retrieved here.
- PENS validation statistics and effect sizes were not retrieved.
- Koster's *A Theory of Fun* ("fun is learning/pattern mastery") and Schell's *The Art of Game Design* were not retrieved in this session; they are opinion/practitioner texts and should be cited as such if used.

---

## 4. Onboarding true beginners to programming

### Takeaway
CS-education research supports **reading/tracing before writing**, teaching an explicit **notional machine** (a mental model of how code executes), **Parsons problems** as a faster equal-learning alternative to writing code, and **blocks-first** environments for interest and early gains, with no lasting penalty after moving to text. These map naturally onto the game's Predict, Fix, and Code trial types.

### Cited Findings
- **[MODERATE–STRONG]** Parsons problems (rearranging given lines of code): Ericson's dissertation (Georgia Tech, 2018) found students solved them **significantly faster** than fixing or writing equivalent code with **the same pretest-to-posttest learning gains**; adaptive Parsons problems helped more learners succeed. A follow-up (Hou, Ericson & Wang, ITiCSE 2023, n=89) found Parsons problems offered as *help during code writing* raised practice performance and efficiency with equal posttest scores. A multi-institutional working group summarises the evidence as "faster than writing code, with equivalent learning gains." — [Georgia Tech dissertation record](https://hg.gatech.edu/node/603172); [ITiCSE 2023 working group PDF](https://strathprints.strath.ac.uk/86100/1/Ericson_etal_ITiCSE_2023_Conducting_multi_institutional_studies_of_Parsons_problems.pdf); [NSF PAR author list](https://par.nsf.gov/search/author:%22Ericson,%20Barbara%20Jane%22)
- **[MODERATE]** Weintrop & Wilensky, block vs text (5-week quasi-experiment, high school, same teacher, isomorphic environments; *ACM TOCE* 2017): both groups improved; the **blocks group had larger learning gains and more interest in future computing courses**; the text group saw their work as more authentic/professional; confidence and enjoyment did not differ. After transitioning to Java, there was **no difference** in performance or practice (*Computers & Education* 2019). Their 2015 ICER study found performance and misconception frequency differed by modality. Students view blocks as easier but "less authentic and less powerful." — [TOCE paper PDF](https://ccl.northwestern.edu/2017/a3_weintrop_wilensky.pdf); [C&E 2019 PDF](https://www.terpconnect.umd.edu/~weintrop/papers/Weintrop&Wilensky_2019_C&E.pdf); [ICER 2015 PDF](https://terpconnect.umd.edu/~weintrop/papers/Weintrop_Wilensky_ICER_2015.pdf)
- **[MODERATE, synthesis]** Reading/tracing before writing: Raspberry Pi Foundation's pedagogy summary states code tracing is "an effective precursor to code writing" and novices "should be competent in code tracing before they can confidently write programs," citing Lister et al. (2004), "A multi-national study of reading and tracing skills in novice programmers." — [Raspberry Pi / Teach Computing Quick Read: Code tracing](https://static.raspberrypi.org/files/curriculum/quickreads/14-Pedagogy_Summary_Code_Tracing_V4_2023.pdf)
- **[Theory + emerging evidence]** Notional machines (Sorva 2013, *ACM TOCE*, "Notional Machines and Introductory Programming Education"): an abstract model of program execution; novices' mental models are often inaccurate. Recent work argues teaching the notional machine should be an explicit objective, and ICER 2023 compared concrete vs abstract notional machine visualisations for teaching tracing. — [arXiv 2510.16594](https://arxiv.org/html/2510.16594v1); [ICER 2023 paper page](https://icer2023.acm.org/details/icer-2023-papers/23/Evaluating-the-Utility-of-Notional-Machine-Representations-to-Help-Novices-Learn-to-C)
- **[MODERATE, large observational]** Scratch: Dasgupta, Hale, Monroy-Hernández & Hill (CSCW 2016), 2.4M projects / >1M users: users who **remix** more have larger repertoires of programming commands, even controlling for amount shared, and exposure to concepts via remixing is associated with later use of those concepts (associative, not causal). Roughly 30% of Scratch projects are remixes. — [Microsoft Research PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/remixing.pdf); [Community Data Science blog](https://blog.communitydata.science/studying-the-relationship-between-remixing-learning/)

### Inferences
- A natural beginner ladder for a floor: **Predict** (trace: "what does this print?") → **Parsons / Fix** (rearrange or repair) → **Code** (write). This matches reading-before-writing and Parsons efficiency, and the game already has Predict and Fix types.
- A **visible notional machine** fits a 3D game well: show variables as physical boxes/crates, the call stack as a stack of platforms, loops as a moving conveyor, so that tracing is literally watching the world. This supports intrinsic integration (Section 1) at the same time.
- Blocks are optional: evidence says blocks help interest/early gains without hurting later text work, but players see them as "less authentic." Since this game targets real Python/JS, Parsons problems (real code lines, drag to order) give much of the blocks benefit while staying authentic.
- Remixing evidence suggests letting players view, copy and adapt other Climbers' accepted solutions *after* they pass (to avoid spoilers) could be a learning mechanic in the Hall.

### Gaps
- Lister et al. 2004 and Sorva 2013 primary texts were not read; claims come from secondary summaries.
- No study was found on onboarding adults with zero programming experience inside a 3D game specifically.
- Evidence on Python vs JavaScript as a first language was not gathered.

---

## 5. Social and multiplayer retention: guilds, help, competition vs cooperation, leaderboards, toxicity

### Takeaway
Most MMO players are "alone together" (playing near but not with others), and play regularly with only a few guild members, so small groups matter more than big social structures. Leaderboards and extrinsic competition can demotivate low-ranked and beginner players; Duolingo's success suggests that **commitment devices (streaks)** and **bracketed, small-cohort leagues** with promotion/demotion retain users, though most of its numbers are company-reported. Learning platforms without social/commitment design (MOOCs) have very low completion. Toxicity is concentrated in a small share of players and responds to fast, explained sanctions.

### Cited Findings
- **[MODERATE, large dataset]** Ducheneaut & Yee (WoW; "Alone Together?" CHI 2006; "Collective solitude" 2008), >300,000 characters: social networks are often **sparse**; most players experience **"collective solitude"**, playing surrounded by but not with others; players regularly play with only a fraction of their guild; most guilds are small; the most successful groups resemble small, organic, team-based work groups. — [SRI publication page](https://www.sri.com/publication/fcd-publications/collective-solitude-and-social-networks-in-world-of-warcraft/); [IRMA chapter](https://www.irma-international.org/chapter/collective-solitude-social-networks-world/29217/); [Pitt News interview](https://pittnews.com/article/17564/archives/gamers-find-social-niche)
- **[MODERATE]** A longitudinal study of 509 WoW guilds found guild membership did not significantly aid character levelling (summary via search; primary source not opened). — [AAAI ICWSM paper](https://ojs.aaai.org/index.php/ICWSM/article/download/14660/14509/18178)
- **[MODERATE]** Ryan et al. Study 4: **relatedness** independently predicted enjoyment and future play in an online multiplayer community. — [ACU research bank](https://acuresearchbank.acu.edu.au/item/8q128/the-motivational-pull-of-video-games-a-self-determination-theory-approach)
- **[STRONG for moderators]** Wouters et al. 2013: learning gains from serious games were larger when **players worked in groups**. — [Utrecht research portal](https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/)
- **[MODERATE]** Leaderboards: Hanus & Fox (2015) found gamification with leaderboards lowered intrinsic motivation and exam scores; Domínguez et al. (2013, cited by later reviews) reported that high-rank positions help motivation while **low-rank positions harm it**; a mapping study links leaderboards to many reported negative effects. — [Hanus profile](https://osu.academia.edu/MichaelHanus); [Emerald INTR 2021 review citing these](https://www.emerald.com/insight/content/doi/10.1108/intr-12-2021-0897/full/html); [Springer "Dark side of gamification"](https://www.springerprofessional.de/en/the-dark-side-of-gamification-an-overview-of-negative-effects-of/16000882)
- **[STRONG, large dataset]** MOOCs: Reich & Ruipérez-Valiente (2019), "The MOOC Pivot," *Science* 363:130–131, DOI 10.1126/science.aav7958. Harvard/MIT edX data (565 course runs, ~5.6M learners): completion **did not improve over six years and fell** 2013–14 to 2017–18, including among those who intended to complete and paid learners; overall completion reported around 3% (snippet truncated); more than half of registrants never opened the courseware. — [MIT TSL](https://tsl.mit.edu/research/the-mooc-pivot/); [Inside Higher Ed](https://www.insidehighered.com/node/7744); [Times Higher Education](https://www.timeshighereducation.com/news/online-university-courses-masses-fail-materialise)
- **[WEAK–MODERATE, company self-report]** Duolingo: its engineering blog reports a "Streak Wager" raised retention, largest at **Day-7 (+14%)**, and frames streaks as making learning "a marathon, not a sprint"; Friend Streak launched with a cap of five invites, with the team warning that scaling a social feature is not always desirable. — [making.duolingo.com on streaks](https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals); [Duolingo blog: Friend Streak lessons](https://blog.duolingo.com/product-lessons-friend-streak/)
- **[WEAK, secondary]** Leagues (weekly cohorts with promotion/demotion) are credited in a LinkedIn post relaying ex-CPO Jorge Mazal with a **17% increase in learning time**; the retention team reports running 600+ streak experiments (Lenny's Podcast). Churn figures (e.g., 47%→28%) circulating on blogs are unverified and inconsistent. Q2 2026 DAU of 58.7M (+23% YoY) is reported by Pulse2. — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth); [Lenny's Newsletter: Duolingo streaks](https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks); [Pulse2](https://pulse2.com/duolingo-daily-active-users-reach-58-7-million-as-retention-hits-record-84-and-social-accounts-top-1-billion-organic-impressions/); [StriveCloud (unverified churn)](https://www.strivecloud.io/blog/blog-gamification-examples-boost-user-retention-duolingo)
- **[WEAK–MODERATE, company research reported in press]** Riot Games (Jeffrey Lin): ~92% of players caught using abusive language did not reoffend; adding explanations and chat-log evidence to penalties raised reform from ~50% to ~65–70%; automated feedback within minutes rather than a week; Riot claimed a 40% drop in verbal toxicity in ranked games; priming messages had small, short-lived effects (e.g., −6.2% verbal abuse); Lin estimated ~1% of players are persistently toxic. — [MIT Technology Review](https://www.technologyreview.com/2015/09/14/166255/a-video-game-algorithm-to-solve-online-abuse/); [Scientific American](https://www.scientificamerican.com/article/can-a-video-game-company-tame-toxic-behavior/); [Game Developer (GDC)](https://www.gamedeveloper.com/design/gdc-riot-experimentally-investigates-online-toxicity)
- **[MODERATE]** Scratch participation shows distinct "project creators" and "social participators," suggesting different social needs among learners. — [Reichman University PDF](https://runi.ac.il/media/ri3pn41q/childrens-participation-patterns-in-online-communities-an-analysis-of-israeli-learners-in-the-scratch-online-community.pdf)

### Inferences
- **Hall design:** Ducheneaut's "alone together" suggests ambient co-presence has value by itself (seeing other Climbers on your floor), but retention ties come from *small* groups. Favour small teams (2–4, like Tower of God teams) over large guilds; give lightweight reasons to interact (help requests, co-op side tests).
- **Asynchronous help:** given Scratch remixing and Wouters' group-play moderator, allow hints/notes left by players who cleared a floor, gated to avoid giving full answers.
- **Leaderboards:** avoid a single global leaderboard visible to beginners. Prefer floor-local or small-cohort brackets (Duolingo-style leagues with ~30 peers), personal-best boards, and "friends only" views. Duels should be skill-matched; beginners losing duels to experts is the low-rank harm described above.
- **Commitment devices:** streaks with a forgiveness mechanism (streak freeze / wager) appear effective at the Day-7 horizon, but they are extrinsic; pair them with intrinsic integration so the streak is not the only reason to return.
- **Falling a floor** is a public status loss in a shared Hall. That raises the competence/relatedness cost; consider making falls private, temporary, or reframed (e.g., a "retest" rather than demotion), and protecting brand-new players.
- **Toxicity:** duels and chat invite it. Fast, explained penalties with evidence and attention to the small persistent minority are better supported than priming messages alone.
- MOOC data shows content alone does not retain learners; the social and commitment layer is not optional.

### Gaps
- No peer-reviewed retention numbers for MMOs (D1/D7/D30) were found; these are proprietary. GDC talks on onboarding/retention were not retrieved.
- No independent verification of Duolingo league effects; most figures are company or secondary.
- No study was found comparing competitive vs cooperative modes in *coding* games specifically.
- Hanus & Fox full text and corrigendum details were not checked; Domínguez et al. 2013 primary text was not read.

---

## 6. Lessons from Tower of God's structure

### Takeaway
No formal game-design analysis of Tower of God was found; only fan wikis and forums. The structure (floors whose rulers set the tests, staff administering them, teams, Rankers who reach the top floor, an Irregular test path) is a ready-made progression frame, but any "lessons" are design inference, not evidence.

### Cited Findings
- **[WEAK, fan sources]** The inner Tower has 135 floors; each floor's Ruler decides its tests, which staff carry out; a Guardian can override the Ruler's choice. Regulars who reach the 134th floor become **Rankers** and may travel between floors. Irregulars take a separate "Administrator's Test." Estimates of Ranker numbers (~100,000) are speculative. — [Tower of God wiki: Floors (BreezeWiki mirror)](https://breezewiki.discard.no/towerofgod/wiki/Floors); [r/TowerofGod FAQ mirror](https://redlib.groet-infra.nl/r/TowerofGod/wiki/faq)
- **[WEAK, press explainer]** Anime News Network explainer on the series' premise and Tower structure. — [Anime News Network](https://www.animenewsnetwork.com/cms/.161404)

### Inferences
- "Each floor has its own Ruler who sets the test" maps well to "each floor is a historical figure/era of computing with its own trial style," and gives narrative reasons for varied mechanics (supports Malone's curiosity and variable challenge).
- Tower of God tests are often **team-based** and allow **multiple solution routes**; this fits Wouters' group-play moderator and SDT autonomy (inference from the source material, not from a design study).
- "Rankers" as an aspirational, rare status could be a long-term goal for experts, but should not be the only visible status in the Hall (see leaderboard risks).

### Gaps
- No design essay, GDC talk, or interview with SIU (the author) on the test design was found.
- No existing game adaptations' (e.g., Tower of God mobile games) retention or design data were retrieved.
