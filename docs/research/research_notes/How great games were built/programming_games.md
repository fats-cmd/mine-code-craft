# How Programming and Engineering Games Were Designed, and What Made Them Succeed

Scope: Zachtronics (SpaceChem, TIS-100, Shenzhen I/O, Opus Magnum, Exapunks), Turing Complete, Human Resource Machine / 7 Billion Humans, nandgame and Nand2Tetris, Factorio, Minecraft redstone, Screeps. Lessons for mine-codecraft: a browser 3D Tower of computing-history floors with Code / Fix / Predict / Quiz challenges and a possible "Build" (wire switches, gates and mechanisms) challenge.

Method note: direct page fetches were blocked by this session's egress proxy (gamedeveloper.com, pcgamer.com, wikipedia.org, store.steampowered.com all refused). Findings below come from web-search result summaries of the linked pages. Each URL is the page the summary came from. Exact quotes are reproduced only where the search summary gave them; a writer who needs verbatim quotes should check the linked page. Claims I know from background knowledge but could not source in this session are in the Gaps sections, not the findings.

## 1. How do these games make programming/engineering feel like play rather than homework?

### Takeaway
They hide the "lesson" inside a fictional job or world (alchemist, factory chemist, office drone, hardware engineer in Shenzhen), accept any working answer, then add optional optimisation goals and a persistent world or community that gives the work meaning. Explicitly "educational" framing was a commercial and creative trap for Zachtronics.

### Cited Findings
- Zachtronics was "best known for engineering-oriented puzzle video games and programming games"; in Opus Magnum the player builds machines for alchemy tasks, any working solution advances the player, and leaderboards reward shortest time, lowest cost, or smallest area — [Wikipedia: Zachtronics](https://en.wikipedia.org/wiki/Zachtronics); [Wikipedia: Opus Magnum](https://en.wikipedia.org/wiki/Opus_Magnum)
- Zachtronics' puzzles accept any working answer: as long as the required output is produced, the puzzle is solved and the next one unlocks — [PC Gamer: Perfectly solving Opus Magnum's puzzles is impossible, but that's OK](https://www.pcgamer.com/perfectly-solving-opus-magnums-puzzles-is-impossible-but-thats-ok/); [Punished Backlog: Opus Magnum, the gold standard of puzzle games](https://punishedbacklog.com/opus-magnum-the-gold-standard-of-puzzle-games/)
- TIS-100's world is told through its manual and machine: Barth argued that the manual's references imply things about the world, and the computer's features do too (interview headline: "Things we create tell people who we are") — [Game Developer: Designing Zachtronics' TIS-100](https://www.gamedeveloper.com/design/-things-we-create-tell-people-who-we-are-designing-zachtronics-i-tis-100-i-)
- Shenzhen I/O's setting came from Barth reading bunnie Huang's blogs about working in Shenzhen; narrative is woven into the manual — [Wikipedia: Shenzhen I/O](https://en.wikipedia.org/wiki/Shenzhen_I/O)
- When Zachtronics first made SpaceChem, Barth thought it could be sold to schools because it was "educational, kind of"; the studio later made educational mobile games with Amplify but found working within a narrow curriculum frustrating; Barth made the whole Zachtronics library free for schools — [PC Gamer: Why Last Call BBS is the last call for Zachtronics](https://www.pcgamer.com/why-last-call-bbs-is-the-last-call-for-indie-studio-zachtronics/)
- Barth felt SpaceChem's chemistry theme hurt sales: "a game that was nearly impossible to discover, try, and buy" — [Game Developer: Postmortem: Zachtronics Industries' SpaceChem](https://www.gamedeveloper.com/design/postmortem-zachtronics-industries-i-spacechem-i-) (mirror PDF: [gas2016.github.io](http://gas2016.github.io/postmortems/gamasutra.com-Postmortem_Zachtronics_Industries_SpaceChem.pdf))
- Human Resource Machine uses an office-worker metaphor: inboxes are inputs, outboxes outputs, floor tiles memory; the player drags-and-drops commands to a worker solving tasks the boss assigns — [Wikipedia: Human Resource Machine](https://en.wikipedia.org/wiki/Human_Resource_Machine); [Macworld: HRM can teach you coding whether you realize it or not](https://www.macworld.com/article/228439/human-resource-machine-can-teach-you-coding-whether-you-realize-it-or-not.html)
- Tomorrow Corporation pitched HRM as a "puzzle game for nerds" because it essentially teaches you to program; one review says it "removes the computer element of programming and breaks it down into simple verbs" — [Boing Boing](https://boingboing.net/2015/10/19/human-resource-machine-game.html/amp); [Kill Screen](https://www.killscreen.com/discover-computational-hell-corporate-work-human-resource-machine/)
- Screeps: players control units by writing JavaScript that runs 24/7 in one persistent shared world; GameSkinny (8/10) praised real programming over a pseudo-language — [GameSkinny review](https://www.gameskinny.com/reviews/screeps-the-javascript-programmers-mmo/); [Screeps: World on Steam](https://store.steampowered.com/app/464350/Screeps_World/)
- Minecraft redstone: players build working computers for the challenge, not because the game asks; CHUNGUS2 (sammyuri) is a 1 Hz CPU that took 7 months and runs Tetris/Snake; others include a 32-bit computer with 2 KB RAM and the 16-bit IRIS CPU playing "Bad Apple" — [80.lv: A 1Hz CPU made in Minecraft](https://80.lv/articles/a-1hz-cpu-made-in-minecraft); [PCWorld: 8-bit processor built in Minecraft](https://www.pcworld.com/article/559794/8-bit-computer-processor-built-in-minecraft-can-run-its-own-games.html); [Sportskeeda: Bad Apple redstone computer](https://www.sportskeeda.com/minecraft/minecraft-redstone-enthusiast-creates-in-game-computer-play-bad-apple); [Minecraft.net: Minecraftception](https://www.minecraft.net/en-us/article/-minecraftception)
- Zach Barth's 2009 Infiniminer is credited with starting the block-world genre ~2.5 years before Minecraft; Notch called Minecraft "an Infiniminer clone"; Barth said borrowing ideas is integral to the creative process — [AllThingsD: Zachary Barth on Infiniminer, Minecraft](https://allthingsd.com/20131105/qotd-the-game-that-changed-everything/); [Cascade PBS interview](https://www.cascadepbs.org/tech/2015/08/the-godfather-of-minecraft-a-conversation-with-indie-gamer-zachary-barth/)

### Inferences
- The "fiction first, curriculum invisible" pattern fits mine-codecraft's Tower: each floor's historical figure (Babbage, Lovelace, Boole, Turing) can be the employer/mentor whose problem you solve, the way HRM's boss or Shenzhen I/O's company frames the task. The history should drive the problem, not decorate a worksheet.
- Barth's experience suggests not marketing the game as "educational": framing as a game about history and building, and offering it free to schools separately, kept Zachtronics games playable as entertainment.
- Redstone computers show that some players will build far beyond what any level asks if the primitives are honest and composable. A sandbox / free-build mode for the Build challenge would serve that group.

### Gaps
- Could not read Barth's GDC 2019 "Open-Ended Puzzle Design at Zachtronics" talk content; only the session description was visible ([GDC Vault](https://gdcvault.com/play/1025715/Open-Ended-Puzzle-Design-at); [Game Developer video post](https://gamedeveloper.com/design/video-zachtronics-approach-to-open-ended-puzzle-design)). It reportedly covers designing from foundation to mechanics, integrating story, and shipping puzzles the designers had not solved themselves ([Game Wisdom](https://game-wisdom.com/?p=11532)).
- Exapunks' design (hacking fiction, printable zines as manual) could not be sourced in this session beyond its Wikipedia page existing ([Wikipedia: Exapunks](https://en.wikipedia.org/wiki/Exapunks)).

## 2. How do they let players build from first principles (NAND to computer) and reuse earlier creations?

### Takeaway
nandgame, Nand2Tetris and Turing Complete all use the same ladder: each level asks for one component to a spec, and the finished component becomes a black-box part in later levels, climbing from NAND to adders, memory, ALU, CPU, then assembly programming. This maps almost exactly onto a Tower of floors.

### Cited Findings
- nandgame (Olav Junker Kjær, web, released 12 July 2018): "In each level, you are tasked with building a component that behaves according to a specification. This component can then be used as a building block in the next level." — [Thinky Games: NandGame](https://thinkygames.com/games/nandgame/); [MobyGames](https://www.mobygames.com/game/227066/nandgame/)
- nandgame levels run Invert, AND, OR, XOR, half/full adder, multi-bit adder, subtraction, flip-flops, memory, ALU, control unit, computer; after the CPU, programming levels teach assembly, the stack and function calls — [GitHub: simsieg/nandgame-solutions](https://github.com/simsieg/nandgame-solutions); [GitHub: arasgungore/NandGame](https://github.com/arasgungore/NandGame); [GIGAZINE review](https://gigazine.net/gsc_news/en/20201204-nandgame/)
- nandgame requires no prior knowledge of architecture or software and no maths beyond addition and subtraction — [Thinky Games: NandGame](https://thinkygames.com/games/nandgame/)
- Nand2Tetris / *The Elements of Computing Systems* (Nisan and Schocken) builds a 16-bit von Neumann machine from only Nand gates; the 2nd edition has Part I Hardware and Part II Software, six projects each, and stresses separating abstraction from implementation — [Goodreads: The Elements of Computing Systems](https://www.goodreads.com/book/show/910789.The_Elements_Of_Computing_Systems); [Internet Archive: nand2tetris](https://archive.org/details/nand2tetris)
- The course aims to build a full computer from a NAND gate to an operating system in 12 weeks; the official site offers all lectures, project materials and tools free and open source for non-profit use — [GitHub course repo summary](https://github.com/jestuber/Nand2Tetris); [nand2tetris.org](https://www.nand2tetris.org/copy-of-talks)
- Turing Complete's Steam description: everything in a computer can be built from a NAND gate; puzzles lead "from NAND gates to arithmetic, memory and all the way to full CPU architectures"; Windows/macOS/Linux, $19.99 — [Thinky Games: Turing Complete](https://thinkygames.com/games/turing-complete/); [Steam store](https://store.steampowered.com/app/1444480/Turing_Complete/)
- Turing Complete players: "you make up your own ISA" while building a mini CPU; the components unlocked near the end "really make the sandbox fun"; a final level has you write the game's pseudo-assembly to navigate a maze — [Hacker News: Turing Complete is a game about computer science](https://news.ycombinator.com/item?id=38925307)
- Criticism: when building the second computer, Turing Complete "doesn't regression test", so adding opcodes can break earlier ones and the level still passes — [Hacker News](https://news.ycombinator.com/item?id=38925307)
- Turing Complete 2 (Steam patch notes, 14 July 2026) replaced Godot with an in-house engine and custom compiler; saves are incompatible; the store page says the game leaves Early Access in 2026 — [Notebookcheck](https://notebookcheck.net/Turing-Complete-2-0-swaps-Godot-for-a-custom-engine.1422915.0.html). Developer credited as LevelHead (Stefan Hoglund) only on a fan wiki, unverified — [fan wiki](https://www.shapes.inc/fandom/turing-complete)

### Inferences
- A Build challenge can follow the nandgame ladder floor by floor: Boole floor = gates from a NAND/switch primitive; later floors unlock the player's own earlier gates as parts (adder, latch, ALU). The Tower already gives the "next level uses this" structure.
- Storing each player's built components and letting them reuse them (rather than handing over a stock part) is what makes "I built this computer" feel true. Offer a stock fallback part if theirs fails, so one bug doesn't block progress.
- The Turing Complete regression-test complaint is a direct lesson: when a later Build level reuses an earlier component, re-run the earlier component's tests too.
- Abstraction/implementation separation (Nand2Tetris) suggests showing a built component as a sealed box with its pin spec once completed.

### Gaps
- No primary interview with the Turing Complete developer or nandgame's author was found.
- No sourced detail on nandgame's or Nand2Tetris's simulator UI (truth-table checks, step clock) in this session.
- Turing Complete review counts / Steam rating could not be fetched.

## 3. How do they handle open-ended solutions, optimisation and social comparison without discouraging beginners?

### Takeaway
Any working solution passes; optimisation is optional and measured on several axes (cycles, cost, area / instructions), shown as histograms of all players' results rather than a single ranked leaderboard, so almost every player sits somewhere they can feel good about and the best on all axes at once rarely exists.

### Cited Findings
- After solving an Opus Magnum puzzle, three histograms compare your solution's cost, cycles and area against every other player's; friends via the storefront are marked on them — [PC Gamer](https://www.pcgamer.com/perfectly-solving-opus-magnums-puzzles-is-impossible-but-thats-ok/); [Engadget: Building the perfect machine in Opus Magnum](https://www.engadget.com/2018-07-09-opus-magnum-zachtronics-irl.html)
- A critic argues solutions that top all three metrics "basically don't exist beyond trivial problems", so optimisation becomes personal style, and percentile histograms ensure players "will have something to feel good about with every solution" — [Punished Backlog](https://punishedbacklog.com/opus-magnum-the-gold-standard-of-puzzle-games/); [PC Gamer](https://www.pcgamer.com/perfectly-solving-opus-magnums-puzzles-is-impossible-but-thats-ok/)
- Players develop styles: "tall" (many devices in parallel, fast) versus "deep" (few devices, long programs) — [Stephen's Opinions: Opus Magnum](https://stephensopinions.com/2020/08/17/opus-magnum-2017/)
- Counterpoint: a forum player says the cost histogram is weak because part count is easy to minimise given unlimited space — [Quarter To Three forums](https://forum.quartertothree.com/t/opus-magnum-from-zachtronics-of-spacechem-infinifactory-fame/132014/35)
- Histograms "returned" in Infinifactory, per a podcast with Barth — [Game Wisdom](https://game-wisdom.com/?p=11532)
- Barth's GDC 2019 talk covers shipping puzzles the team had not solved (or not optimally), expecting players to find their own solutions — [GDC Vault](https://gdcvault.com/play/1025715/Open-Ended-Puzzle-Design-at); [Game Wisdom](https://game-wisdom.com/?p=11532)
- Human Resource Machine adds optional per-level size (fewer than X instructions) and speed (fewer than Y steps) challenges; often no single program meets both, which pushes re-optimisation — [Geeky Hobbies review](https://www.geekyhobbies.com/human-resource-machine-indie-game-review/); [Diabolical Plots review](https://www.diabolicalplots.com/game-review-human-resources-machine/)
- Opus Magnum supports Steam Workshop user-made puzzles — [Wikipedia: Opus Magnum](https://en.wikipedia.org/wiki/Opus_Magnum)
- Screeps criticism: buying more CPU limit feels pay-to-win, and the world moves slowly — [GameSkinny](https://www.gameskinny.com/reviews/screeps-the-javascript-programmers-mmo/)

### Inferences
- For mine-codecraft's PvP challenges and floors: grade pass/fail first, then show optional metrics (runtime steps, characters/lines, gate count for Build) as histograms against all Climbers, with friends or the current room highlighted. That gives an experienced player a reason to replay without making a beginner feel last.
- Pick metrics that trade off (gate count vs delay, code length vs speed) so no one solution wins every axis; avoid a metric that is trivially maxed (the cost-histogram complaint).
- Keep competition skill-based: the Screeps pay-for-CPU complaint is a warning against selling performance.

### Gaps
- No primary Barth quote on why histograms rather than ranked leaderboards; likely in the GDC 2018/2019 talks or Designer Notes podcast ([Designer Notes #84](https://www.designer-notes.com/designer-notes-84-zach-barth-part-1/); [Part 2](https://www.idlethumbs.net/designernotes/episodes/zach-barth-part-2/)), which could not be read.
- Opus Magnum's built-in GIF export of solutions (widely remembered as a sharing feature) could not be confirmed by any source found here.

## 4. How do they onboard non-programmers? What do players and critics say about difficulty walls?

### Takeaway
HRM starts with two commands and adds up to eleven, with a visible worker acting out each step; that works early but critics say later jumps are too large for beginners. SpaceChem is the cautionary tale: an "unusable" tutorial and a 40+ hour curve that 2% of players finished. Zachtronics later replaced tutorials with dense, in-fiction manuals, which suits a self-selected audience but not newcomers.

### Cited Findings
- HRM begins with two commands and slips more in, up to 11 — [Boing Boing](https://boingboing.net/2015/10/19/human-resource-machine-game.html/amp); [Cubed3](https://cubed3.com/news/24940/1/train-office-workers-in-human-resource-machine.html)
- A non-programmer reviewer found that "watching your little office drone walk back and forth through every step makes it much easier to understand" — [Macworld](https://www.macworld.com/article/228439/human-resource-machine-can-teach-you-coding-whether-you-realize-it-or-not.html)
- HRM's early levels are manageable for everyone, but difficulty ramps later where non-programmers may struggle; for them puzzles "could take hours" — [Geeky Hobbies](https://www.geekyhobbies.com/human-resource-machine-indie-game-review/); [Diabolical Plots](https://www.diabolicalplots.com/game-review-human-resources-machine/)
- Destructoid: HRM is at times too simple for experienced programmers and "often made leaps too large for beginners to overcome without obtuse outside research" — [Destructoid review](https://www.destructoid.com/reviews/review-human-resource-machine/)
- 7 Billion Humans (2018) moves to many workers running the same program at once (parallelism); 60+ levels; reviews split (Nintendo Life 7/10, Cubed3 disappointed); Metacritic 77, OpenCritic 72 — [Steam: 7 Billion Humans](https://store.steampowered.com/app/792100/7_Billion_Humans); [Nintendo Life](https://www.nintendolife.com/eshop/7_billion_humans); [Cubed3 review](https://www.cubed3.com/review/5342/1/7-billion-humans-nintendo-switch.html); [Deku Deals](https://dekudeals.com/items/7-billion-humans)
- SpaceChem postmortem: "our tutorial is awful, unusable; the game was really, really hard; and it's really, really long"; difficulty plus many required puzzles made a 40+ hour curve that only 2% of players finished; launch tutorial had 12 puzzles, two of them walkthroughs; their metrics mostly confirmed obvious things like the game being very hard — [Game Developer: SpaceChem postmortem](https://www.gamedeveloper.com/design/postmortem-zachtronics-industries-i-spacechem-i-); [GDC 2013 talk](https://gdcvault.com/play/1018235/Ahead-of-the-Curve-The); [YouTube](https://www.youtube.com/watch?v=lH7gL3ivgFA)
- Some SpaceChem players got the concept easily while others stayed baffled about the goal even with step-by-step instructions — [Wikipedia: SpaceChem](https://en.wikipedia.org/wiki/SpaceChem)
- TIS-100: the team wrote a 14-page manual, printed it, marked it up and scanned it back in; the tutorial effectively tells players to read it — [Game Developer: Designing TIS-100](https://www.gamedeveloper.com/design/-things-we-create-tell-people-who-we-are-designing-zachtronics-i-tis-100-i-)
- Shenzhen I/O: Zachtronics was reluctant to include a tutorial and used a dense manual with application notes and data sheets ("real electronics things") — [Wikipedia: Shenzhen I/O](https://en.wikipedia.org/wiki/Shenzhen_I/O); [Game Studies: Phipps on TIS-100](https://gamestudies.org/2401/articles/phipps)
- Turing Complete: "you have to be ready to try around and to RtFM"; the game "does not necessarily do a great job of fully explaining everything"; players point to the Discord — [Steam discussion: complete CS noob?](https://steamcommunity.com/app/1444480/discussions/0/5143704785434709480/)
- Factorio FFF #241: new players needed a 30-45 minute tutorial to reach automation, and the first tutorial gave the impression of a Minecraft clone through manual mining and hand crafting — [FFF #241](https://factorio.com/blog/post/fff-241)
- Factorio FFF #261: "if the first 15 minutes of a game feels shitty, there is big chance that the player will not play any further"; the old tutorial had ~22 message dialogs before free play; each fix introduced new drawbacks — [FFF #261](https://factorio.com/blog/post/fff-261)
- Factorio FFF #245 split a free combined tutorial/demo "New Player Experience" from a separate guided campaign — [FFF #245](https://www.factorio.com/blog/post/fff-245)
- Factorio FFF #160 describes dev playtests (one run took 46 hours) after changing science packs — [FFF #160 on Steam](https://store.steampowered.com/news/app/427520/view/5264101341769303703)
- Steam reviewers say Screeps is "not a game to learn coding in" — [Screeps on Steam](https://store.steampowered.com/app/464350/Screeps)

### Inferences
- mine-codecraft's audience is broader than Zachtronics'. Use HRM-style onboarding (very small verb set, visible step-by-step execution) on early floors, and keep manuals/reference sheets as optional depth, not the gate.
- Show the core loop's fun (an automation-equivalent "aha") in the first 15 minutes, per Factorio, and cut dialog-box tutorials.
- Guard against the SpaceChem wall: don't require every puzzle to reach the next floor; let a floor be cleared with a subset, keep extra puzzles optional, and instrument completion per room early, measuring drop-off rather than only confirming "it is hard".
- The Destructoid "leaps too large" critique argues for intermediate puzzles and hints between concept jumps, especially on Turing and later floors.

### Gaps
- No sourced HRM sales figures or data on how many non-programmers finish it.
- No primary Kyle Gabler / Tomorrow Corporation quotes on teaching design; the Nintendo Everything interview was not readable ([Nintendo Everything](https://nintendoeverything.com/interview-tomorrow-corporation-shares-more-on-human-resource-machine-and-its-wii-u-features/)).

## 5. What simulation/interface design choices matter (visual programming, limited instruction sets, step debuggers)?

### Takeaway
Small, invented instruction sets with physical metaphors (blocks carried by a worker, arms moving atoms, nodes on a grid) plus visible step-through execution let players see their program run. Real-language games (Screeps) trade that legibility for authenticity. Simplifying physical detail (timing) is accepted if it keeps the curve smooth.

### Cited Findings
- HRM: drag-and-drop commands; a reviewer calls it an assembly-language program directing an office worker to move blocks of data; seeing the worker act every step aids understanding — [Destructoid](https://www.destructoid.com/reviews/review-human-resource-machine/); [Macworld](https://www.macworld.com/article/228439/human-resource-machine-can-teach-you-coding-whether-you-realize-it-or-not.html)
- 7 Billion Humans: a new language that many workers execute simultaneously; workers must avoid knocking each other out of place — [Steam](https://store.steampowered.com/app/792100/7_Billion_Humans); [Cubed3](https://www.cubed3.com/review/5342/1/7-billion-humans-nintendo-switch.html)
- TIS-100's computer features and manual are deliberate constraints that imply a fictional world — [Game Developer](https://www.gamedeveloper.com/design/-things-we-create-tell-people-who-we-are-designing-zachtronics-i-tis-100-i-); academic reading of its origins in personal computing — [Game Studies](https://gamestudies.org/2401/articles/phipps)
- Turing Complete simplifies timing and hardware implementation; a Steam reviewer considers this worth it for the difficulty curve (search summary; exact review not opened) — [Steam Community: Turing Complete](https://steamcommunity.com/app/1444480)
- Redstone builds are very slow (CHUNGUS2 runs at 1 Hz) and some are artificially sped up to be usable — [80.lv](https://80.lv/articles/a-1hz-cpu-made-in-minecraft); [Hacker News](https://news.ycombinator.com/item?id=32901461)
- Screeps uses real JavaScript; a standalone open-source server exists — [GitHub: screeps/screeps](https://github.com/screeps/screeps); [GameSkinny](https://www.gameskinny.com/reviews/screeps-the-javascript-programmers-mmo/)
- A blog alleged a security issue in Screeps' console logging (running other players' content); the developer compared it to pasting untrusted code into a browser console; treat as contested — [outsidetheasylum.blog](https://outsidetheasylum.blog/screeps/)

### Inferences
- Build challenge: an abstract, idealised simulator (no propagation delay, or a single global clock tick) with step/play/fast-forward controls, live wire colouring, and a truth table checker is enough; physical realism costs more than it teaches.
- Predict challenges already are a step debugger in reverse; a visible trace (variables per step) after a wrong guess would teach in the HRM way.
- Real Python/JS (like Screeps) suits mine-codecraft's Code/Fix challenges, but beginners need the scaffolding Screeps lacks: small starter code, few APIs per floor.
- The Screeps logging dispute is relevant: any feature showing one Climber's code or output to another in the Base must be sandboxed and sanitised.

### Gaps
- No sourced description of Zachtronics' step/debug UI (pause, single-step, breakpoints) or of nandgame's simulator UI in this session.

## 6. Sales, reception and who plays them

### Takeaway
Factorio is the big commercial success (3.5M+ by end of 2022, no discounts). Zachtronics built a loyal niche over ~a decade but closed by choice, not stated financial failure. SpaceChem shows a hard, obscure theme limits reach. Data on player demographics is thin.

### Cited Findings
- Factorio passed 1 million copies (FFF #192, May 2017), including pre-Steam direct sales — [FFF #192 on Steam](https://store.steampowered.com/news/app/427520/view/5264101341769297589); [TechRaptor](https://techraptor.net/gaming/news/factorio-has-sold-over-1-million-copies)
- Factorio passed 3.5 million by Christmas 2022, with steady ~500,000/year sales Wube says validates its no-sale policy; Switch port sold 40,000+ with ~40% from Japan — [PC Gamer](https://www.pcgamer.com/factorio-has-sold-35-million-copies/); [TheGamer](https://www.thegamer.com/factorio-sales-milestone/)
- Factorio: Space Age DLC sold 400,000+ in under a week (Oct 2024) and set a player-count record — [GamingOnLinux](https://www.gamingonlinux.com/2024/10/factorio-space-age-sold-over-400000-copies-and-sets-a-new-player-count-record/)
- Friday Facts has run weekly for years as Wube's public development log — [Seven Years of Factorio Friday Facts](https://spieswl.github.io/blog/2020/seven-years-of-factorio-friday-facts)
- Zachtronics closed after Last Call BBS (2022); Barth said the team felt "locked into doing something we didn't feel like doing forever" and it was "time for a change"; reports say the closure was not due to external pressure — [PC Gamer](https://www.pcgamer.com/why-last-call-bbs-is-the-last-call-for-indie-studio-zachtronics/); [TechRaptor](https://techraptor.net/gaming/news/zachtronics-announces-its-final-game-last-call-bbs); [Hitmarker](https://hitmarker.net/news/zachtronics-to-cease-operations-894378)
- Barth was working as a high-school CS teacher while finishing Last Call BBS; afterwards he and others formed Coincidence, making card and educational games — [PC Gamer](https://www.pcgamer.com/why-last-call-bbs-is-the-last-call-for-indie-studio-zachtronics/); [Wikipedia: Zachtronics](https://en.wikipedia.org/wiki/Zachtronics)
- SpaceChem's GDC 2013 postmortem includes post-launch sales data (figures not visible in summaries) — [GDC Vault](https://gdcvault.com/play/1018235/Ahead-of-the-Curve-The)
- HRM launched 15 October 2015 on Windows, Mac and Wii U; reviewers say experienced programmers find it easy — [Boing Boing](https://boingboing.net/2015/10/19/human-resource-machine-game.html/amp); [Metacritic](https://www.metacritic.com/game/human-resource-machine/); [OpenCritic](https://opencritic.com/game/1969/human-resource-machine)
- Turing Complete has drawn strongly positive player discussion on Hacker News, including people who say its assembly levels made a matching college course more fun — [Hacker News](https://news.ycombinator.com/item?id=38925307)

### Inferences
- The audience for hard programming puzzles is real but niche; broad reach (Factorio, Minecraft) comes from a world players want to be in, with engineering depth for those who seek it. mine-codecraft's shared Base and PvP may play that "world" role.
- A public devlog like Friday Facts builds a community and trust over years; a cheap version (short weekly notes on floor progress) may help mine-codecraft.

### Gaps
- No sourced unit sales for SpaceChem, TIS-100, Shenzhen I/O, Opus Magnum, Exapunks, HRM, 7 Billion Humans, Turing Complete or Screeps.
- No sourced demographic data (age, profession, share of programmers) for any of these games.
