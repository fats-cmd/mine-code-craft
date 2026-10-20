# How Mainstream Studios Built Acclaimed Games (Nintendo, FromSoftware, Supergiant): Lessons for a Tower-Climbing CS Game

> **Method note (read first):** In this research session the network proxy blocked direct page fetches. WebFetch failed with DNS errors and curl got 403 CONNECT for gamedeveloper.com, zeldauniverse.net, geekdad.com, inlander.com and iwataasks.nintendo.com. So the findings below come from web-search result summaries of the linked pages, not from full reads. Quotes are marked as **quoted via search summary**, and a writer should check exact wording before printing anything as a direct quote. Primary developer statements (GDC/CEDEC talks, Iwata Asks, Ask the Developer, named interviews) are marked **[PRIMARY, via coverage]**. Fan wikis, forums and essays are marked **[SECONDARY]**.

## 1. How did each team prototype, find the core loop, and build vertical slices?

### Takeaway
Nintendo first proves one core *system* in a crude prototype, then builds content. BotW's physics/chemistry engine was shown in a top-down retro-Zelda prototype. Mario 3D Land started with a block standing in for Mario. TotK's Ultrahand was pitched by building vehicles out of BotW's existing parts. Supergiant made Early Access its very first decision, to test the idea fast and then grow it. All three studios validate the *verb* before they invest in content.

### Cited Findings
**Nintendo: BotW (GDC 2017 "Change and Constant: Breaking Conventions with The Legend of Zelda: Breath of the Wild": director Hidemaro Fujibayashi, technical director Takuhiro Dohta, art director Satoru Takizawa)**
- **[PRIMARY, via coverage]** The panel showed a prototype that looked like the original 2D Zelda. It was used to demonstrate the physics and "chemistry" engine with things like cutting down trees for lumber and setting fields on fire, ideas that became central to BotW. — [Zelda Universe](https://zeldauniverse.net/2017/03/09/zelda-team-discusses-breath-of-the-wilds-development-and-2d-zelda-prototype-at-gdc/); [Tom's Guide](https://www.tomsguide.com/uk/us/zelda-breath-wild-design,news-24586.html)
- **Correction to the popular story:** Nintendo of America's live tweets of the panel clarified that the "2D" prototype was actually 3D under the hood. It ran BotW's physics/chemistry engine behind a top-down retro presentation. — [Miketendo64 (NoA Twitter coverage)](https://miketendo64.com/2017/03/01/nintendo-of-americas-twitter-coverage-of-the-gdc-breath-of-the-wild-panel/)
- **[PRIMARY, via coverage]** Thesis of the panel: make the game "active" rather than "passive," using a combination of "physics and chemistry" to give players a high degree of freedom. Dohta described building from shared components: collision, movement and object states. — [Thumbsticks GDC17](https://www.thumbsticks.com/gdc-17-breath-of-the-wild-science-lies); [Perfectly Nintendo panel recording](https://www.perfectly-nintendo.com/?p=194934)
- **[PRIMARY, via coverage]** Fujibayashi described moving from "additive design" to "multiplicative design," in which objects react to the player's actions and to each other. He reportedly needed a proof of concept in a simple prototype before committing the team. — [Shacknews](https://www.shacknews.com/article/99265/how-breath-of-the-wild-challenged-conventions-in-zelda-games); [Thumbsticks](https://www.thumbsticks.com/gdc17-designing-zelda-breath-of-the-wild/)
- **[PRIMARY anecdote, via Kotaku]** An early demo had a small starting field with trees. Miyamoto spent about an hour just climbing trees, which convinced the team that climbing could be as fun as riding horses or fighting monsters. — [Kotaku](https://kotaku.com/when-miyamoto-first-played-zelda-breath-of-the-wild-h-1793017234)
- Aonuma talked about a "creating while playing" process on BotW (title only; the article could not be read). — [Zelda Universe](https://zeldauniverse.net/2017/04/26/aonuma-talks-about-creating-while-playing-breath-of-the-wild/)

**Nintendo: TotK (Ask the Developer, 2023)**
- **[PRIMARY]** Fujibayashi came up with "attaching" objects and demonstrated it by building vehicles "using only the mechanisms and parts available in the previous game." Aonuma said the attaching idea came up in the early stages of development. — [Nintendo Ask the Developer, TotK pt.4](https://www.nintendo.com/sg/interview/totk/04.html); [Nintendo Everything](https://nintendoeverything.com/zelda-tears-of-the-kingdom-director-used-breath-of-the-wild-to-demonstrate-links-new-abilities-during-early-development/)
- **[PRIMARY]** Dohta: designers and programmers put a lot of effort into tuning object-to-object combinations because there were so many variations. Putting "attaching" at the center serves both players who want elaborate builds and players who only want to progress. Fujibayashi said they were very conscious of finding that balance. — [Nintendo Ask the Developer](https://www.nintendo.com/sg/interview/totk/04.html); [Siliconera](https://www.siliconera.com/new-tears-of-the-kingdom-ask-the-developer-discusses-building-and-fusing/)
- **[PRIMARY]** Fujibayashi said players' Ultrahand creations went "beyond even the development team's imagination." — [GamesRadar](https://www.gamesradar.com/zelda-leads-were-blown-away-by-what-tears-of-the-kingdom-players-made-with-ultrahand-its-beyond-even-the-development-teams-imagination/)

**Nintendo: Super Mario 3D Land / 3D World (Koichi Hayashida)**
- **[PRIMARY, Iwata Asks via summary]** An early 3D Land prototype had landforms with some coins and blocks, and Mario was represented by a square block during early testing. Hayashida's keyword was to "reset" things and rethink the rules from the ground up. — [Iwata Asks: Super Mario 3D Land Vol.1](https://iwataasks.nintendo.com/interviews/3ds/super-mario-3d-land/0/3/); [Nintendo Everything summary](https://nintendoeverything.com/tons-of-super-mario-3d-land-details-from-the-latest-iwata-asks/)
- **[PRIMARY, Polygon 2013 via summary]** Hayashida: "the first thing we do is decide on a concept for a stage that really drives how a player will be experiencing it" (quoted via search summary). — [Game Developer: The secret to Mario level design](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design)

**Supergiant: Hades**
- **[PRIMARY]** Kasavin told RPG Site that Early Access was "the very first decision" on Hades, made before anything else. The team wanted to test the idea faster and, if people liked it, keep building the biggest and best version of it. Hades II was likewise "designed once again from the ground up with early access in mind." — [RPG Site](https://www.rpgsite.net/interview/20348-supergiant-games-interview-with-greg-kasavin-and-darren-korb-hades-ii-early-access-feedback-boss-themes-the-ending-coffee-and-the-future)
- **[PRIMARY, via coverage]** The studio moved internally to a monthly milestone cadence for Hades. Coverage calls it a "more mature, organized dev process" than Supergiant's earlier games. — [Game Developer](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process)
- Timeline: Early Access in December 2018, full release on September 17, 2020. — [Wikipedia: Hades](https://en.wikipedia.org/wiki/Hades_(video_game))

### Inferences
- For mine-codecraft, the "chemistry engine" equivalent is the challenge system: Code, Fix, Predict and Quiz, graded by real runners. Like BotW, the team should prove the challenge *verb* is fun in a greybox before building floor worlds. The BotW prototype was deliberately ugly but ran the real systems.
- TotK's method of building new features out of the previous game's parts suggests a rule for each new Floor: first try to express its mechanic with existing challenge types and floor props before writing new systems.
- Hayashida's "concept first" maps onto Floors: each Floor and each room should be built around one CS idea that drives the experience (for example, "the loop" or "the stack"), not around a theme alone.

### Gaps
- I could not read the GDC 2017 talk slides or video directly, so details of the team-wide playtest process are missing. Coverage claims the whole staff played the game for a week, but I found no source for this, so it is excluded.
- I did not find a source on FromSoftware's prototyping or vertical-slice process for Demon's Souls, Dark Souls or Elden Ring. Demon's Souls is often said to have been a troubled project that Miyazaki took over, but I did not verify that in this session.
- I could not confirm a GDC 2024 TotK talk.

## 2. How do these games teach mechanics without heavy tutorials?

### Takeaway
Nintendo teaches through safe, staged exposure. In World 1-1, the first enemy is a Goomba you can learn to jump over, and the mushroom moves toward you. Kishōtenketsu introduces an idea, develops it, twists it, then concludes. BotW's Great Plateau is a fenced-off sandbox where every system can be tried. The method underneath all of this is to watch testers play without explaining anything.

### Cited Findings
- **[PRIMARY, Eurogamer 2015 via coverage]** Miyamoto said World 1-1 was designed so players "gradually and naturally understand what they're doing." He described simulating player behaviour and watching testers play without explaining anything. — [Nintendo Insider](https://www.nintendo-insider.com/shigeru-miyamoto-shares-the-design-process-behind-world-1-1-in-super-mario-bros/); [HotHardware](https://hothardware.com/news/gaming-legend-shigeru-miyamoto-explains-design-philosophy-behind-super-mario-bros-world-1-1); [MCV/Develop video](https://mcvuk.com/development-news/video-miyamoto-shares-his-level-design-secrets/)
- **[PRIMARY, Iwata Asks via GoNintendo]** A first-time player will probably run into the first Goomba and lose a life, so designers built the opening around learning to jump over it. The Super Mushroom moves toward the player so they learn the power-up is good even though it looks like the "bad mushroom" Goomba. — [GoNintendo](https://www.gonintendo.com/s/100479-miyamoto-explains-how-the-player-is-taught-that-goombas-are-bad-and-mushrooms-are-good); [Wikipedia: World 1-1](https://en.wikipedia.org/wiki/World_1-1)
- **[SECONDARY]** One account says a Goomba was chosen over a Koopa Troopa because a jumping Koopa might kill players within five seconds and frustrate them. — [Wikipedia: Goomba](https://en.wikipedia.org/wiki/Goomba)
- **[PRIMARY, Gamasutra interview, via Game Developer]** Hayashida draws on **kishōtenketsu**, the four-part structure of Chinese four-line poems and Japanese four-panel comics:
  - *ki*: introduce an idea safely
  - *shō*: develop it
  - *ten*: a twist that changes everything
  - *ketsu*: conclude, or a final flourish or showcase

  In 3D Land, single-concept levels were applied rigorously. In 3D World, the "twist" often brings in a second mechanic. — [Game Developer: The secret to Mario level design](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design); [wnhub summary](https://wnhub.io/news/game-design/item-11856)
- **[PRIMARY, Iwata Asks]** Hayashida wanted 3D Land to be an "introduction" to 3D Mario: a 3D game "close to 2D so that anyone could play." The team dropped most jump aids because 3D made platform positions easier to see, but kept Tanooki Mario as a soft jump aid for newer players. — [Iwata Asks: Super Mario 3D Land](https://iwataasks.nintendo.com/interviews/3ds/super-mario-3d-land/0/2/); [Nintendo World Report](http://www.nintendoworldreport.com/news/28251/iwata-asks-super-mario-3d-land)
- **[SECONDARY]** The Great Plateau is BotW's opening area. Unlike earlier Zelda tutorials it is exploration-based, encourages experimentation and choosing your own path, and is widely called one of the best tutorial areas in games. — [Wikipedia: Great Plateau](https://en.wikipedia.org/wiki/Great_Plateau)
- **[PRIMARY, CEDEC 2017: Fujibayashi and lead artist Makoto Yonezu, translated by Matt Walker]** The "triangle rule": triangular landforms let players choose to go over or around, and they hide what lies beyond so designers can create surprise. Large triangles act as landmarks, medium ones block sightlines, and small ones set the tempo. Rectangles hide things completely. Towers were first placed in a way that forced linearity, which went against the design goals and didn't appeal to players, so they were moved to encourage exploring off the beaten path. — [CEDEC 2017 translation (GitHub gist)](https://gist.github.com/idbrii/e39fe96279aa1670319bfa521d907399); [80.lv](https://80.lv/articles/the-design-secrets-of-breath-of-the-wild); [Game Developer](https://www.gamedeveloper.com/design/enjoy-a-bit-of-fresh-insight-into-how-nintendo-built-i-breath-of-the-wild-i-)

### Inferences
- **Kishōtenketsu as a template for a Floor or room of CS challenges:**
  - *Ki*: a safe, ungraded Predict on one concept, e.g. what does this loop print?
  - *Shō*: a Fix on the same concept with one bug.
  - *Ten*: a twist such as an off-by-one, recursion instead of iteration, or a different language.
  - *Ketsu*: a Code challenge that combines them, ideally the boss.

  This fits the Code/Fix/Predict/Quiz types the project already has.
- **World 1-1 lesson:** the first failure on a Floor should be cheap and informative. Don't charge Integrity before the player has had one safe exposure to the concept, the way the Goomba is placed so a death teaches.
- **Great Plateau lesson:** a walled starting Floor (the Testing Floor) should let players try every challenge type, then grant the "paraglider" (the exit or ability) once they have shown they can use them.
- **Triangle rule for 3D Floor layouts:** use landmarks (the boss tower, the next floor's stair) that are visible from far away, plus mid-scale occluders that create reveals.

### Gaps
- I could not access the original Gamasutra Hayashida interview, so the exact kishōtenketsu quotes are paraphrases.
- I found no primary Fujibayashi or Aonuma quote specifically about how the Great Plateau was designed.
- Hyrule Historia is mainly lore and art. I found nothing citable on process in it during this session.

## 3. How do they make hard games feel fair and failure informative or motivating?

### Takeaway
Miyazaki aims for difficulty that is "high, but always achievable." He balances for fairness over raw difficulty and asks how to give death meaning beyond a mark of failure. Bonfires give a respite and a fixed restart point. Hades removes the sting of death by making every death advance story and permanent progression, so time is never wasted.

### Cited Findings
**FromSoftware**
- **[PRIMARY, New Yorker Feb 2022 "Hidetaka Miyazaki Sees Death as a Feature, Not a Bug," via coverage]** Miyazaki frames the design question as "If death is to be more than a mark of failure, how do I give it meaning?" He says "In life, death is a horrible thing. In play, it can be something else." He calls difficulty "our identity" and says he is "not a very skilled player… I die a lot." He feels apologetic toward players who find too much to overcome, and he draws a line at "impossible challenges." — [GamesRadar](https://www.gamesradar.com/elden-ring-creator-miyazaki-feels-apologetic-towards-players-defeated-by-his-games/); [NME](https://www.nme.com/news/gaming-news/elden-ring-creator-hidetaka-miyazaki-wants-to-make-dying-in-games-enjoyable-3170114); [mxdwn](https://games.mxdwn.com/news/hidetaka-miyazaki-on-elden-ring-in-life-death-is-a-horrible-thing-in-play-it-can-be-something-else/); [Between Drafts summary](https://betweendrafts.com/2022/03/17/new-yorker-interview-with-miyazaki-hidetaka/)
- **[PRIMARY, IGN, via blog quote: SECONDARY transmission]** "The main concept behind the death system is trial and error. The difficulty is high, but always achievable." — [Reviewing the Cults blog](https://reviewingthecults.wordpress.com/2015/03/27/cult-video-game-director-hidetaka-miyazaki/)
- **[SECONDARY: forum repost of an interview]** Miyazaki: "When I balance games, I always emphasize fairness over difficulty." Enemies are placed so deaths feel like the player's own mistakes and can be learned from. — [GameFAQs board](https://gamefaqs.gamespot.com/boards/168566-dark-souls-iii/73647265)
- **[SECONDARY]** Miyazaki has argued against separate difficulty levels because they would "segment and fragment the user base." He wants everyone to share the sense of achievement. — [Steam discussion](https://steamcommunity.com/app/814380/discussions/0/1815422173027344395/?l=schinese)
- **[SECONDARY, citing Famitsu and Miyazaki]** Bonfires are save points that also host levelling, repair and healing. Resting respawns most enemies, and dying returns you to the last bonfire. Miyazaki intended them to be utilitarian and also a place to relax in a harsh world. A 2011 Famitsu feature called them "mobile home bases" that players must explore to find. — [Wikipedia: Bonfire (Dark Souls)](https://en.wikipedia.org/wiki/Bonfire_(Dark_Souls))
- **[PRIMARY, via coverage]** Dark Souls was described as "less compartmentalised than Demon's Souls" but not truly open world. It is built from interconnected areas reached from a hub. In the Design Works interview: Firelink Shrine was one of the first places designed, "small… but connects to many different places." — [Wikipedia: Dark Souls](https://en.wikipedia.org/wiki/Dark_Souls_(video_game)); [Souls Lore: Design Works interview](https://soulslore.wikidot.com/das1-design-works)

**Supergiant**
- **[PRIMARY, Kasavin to Rock Paper Shotgun, via Game Developer]** Taking the pain out of dying and restarting was an explicit early goal. Players must be compelled to go further and feel "the time you spent wasn't a waste." The die-and-restart structure "seemed like a very compelling constraint on storytelling." — [Game Developer](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)
- **[PRIMARY, via Inlander]** The team's shorthand was to "reduce the sting of failure." Each death, and each victory, gives the player a little more narrative. Players also get stronger in a permanent way after setbacks that send them back to the House of Hades. — [Inlander](https://www.inlander.com/culture/hades-writer-greg-kasavin-on-how-he-made-video-game-deaths-drive-a-feel-good-story-22725237)

### Inferences
- **Integrity, and falling a floor, is a harsh penalty, comparable to losing souls.** To keep it fair, mine-codecraft should:
  - make failure informative: show the failing test case, the expected vs actual output, and the concept it targets;
  - guarantee the challenge is "high but always achievable": no trick questions or "impossible challenges";
  - give a nearby, fixed "bonfire" (a safe checkpoint room per Floor) where Integrity can be restored or reviewed.
- **Adopt Hades' rule that time spent is never wasted.** Even on failure or a fall, award something permanent: a codex entry, a Guide line, cosmetic progress, or knowledge of the boss's next phase. Then "falling a floor" becomes a story beat (an NPC reacts) and not only a loss.
- **Miyazaki's "fragmented player base" argument matters in a shared Base.** Shared difficulty helps players help each other. Optional difficulty should be a *voluntary* add-on, like Hades' Heat (see Q5), not a separate mode.

### Gaps
- I could not reach the original New Yorker, IGN or Eurogamer texts, so exact wording should be checked. The "fairness over difficulty" quote comes only from a forum repost.
- I found no primary source on how FromSoftware playtests difficulty.

## 4. How do they tell story through the world rather than exposition?

### Takeaway
FromSoftware puts key plot details in item descriptions and environmental cues and relies on player imagination. Hades delivers story in small, conditional, reactive dialogue lines that fire based on run state, so repetition becomes the narrative engine.

### Cited Findings
- **[PRIMARY, New Yorker via search summary]** In Miyazaki's games a crucial plot detail "is more likely to be found in the description of an item in your inventory than in dialogue." He uses this to spark player imagination, which he links to his childhood reading of fantasy books he only partly understood. — [Wikipedia: Hidetaka Miyazaki](https://en.wikipedia.org/wiki/Hidetaka_Miyazaki); [Between Drafts](https://betweendrafts.com/2022/03/17/new-yorker-interview-with-miyazaki-hidetaka/)
- **[PRIMARY, via coverage]** Hades' dialogue system checks the situation the player is in, for example meeting a character while Zagreus' health is below a threshold, and plays one of several pre-written events that fit it. Kasavin describes it as "the opposite of scripted." — [GeekDad](https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/); [GDC 2021 talk announcement](https://gdconf.com/news/dive-dialogue-hades-gdc-2021)
- **[PRIMARY]** GDC 2021 talk by Kasavin and Darren Korb on Hades' dialogue: how the very large script was optimised for audio production, and how Early Access was "a huge boon for the narrative" even though Early Access usually suits story-heavy games badly. — [Game Developer](https://www.gamedeveloper.com/audio/dive-into-the-dialogue-of-i-hades-i-at-gdc-2021); [GDC Vault](https://www.gdcvault.com/play/1026975/contactUs); [GDC Podcast ep. 16](https://gdconf.com/article/roguelikes-and-narrative-design-with-hades-creative-director-greg-kasavin-gdc-podcast-ep-16/)
- **[PRIMARY, via Game Developer]** Hades builds its narrative hooks on the same structure as the persistent upgrades that roguelikes carry over after death. — [Game Developer](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)

### Inferences
- Computing-history Floors map naturally onto FromSoftware's item-description lore. Pickups such as a punched card, a relay, a vacuum tube or a Lovelace note could each carry a 2–3 line description holding real history. Players who read them learn the history; players who don't still progress.
- Hades-style conditional dialogue fits the Guide and NPCs (e.g. Babbage and Ada): lines keyed on state such as "first death to this boss," "fell a floor," "low Integrity," "solved in Python vs JS," or "fifth attempt." A priority-ordered pool of one-time lines turns repeated attempts into story.

### Gaps
- I could not get the exact mechanics of Hades' dialogue priority or eligibility system from Supergiant. The GDC 2021 talk video would be the source.
- No primary source was found on Elden Ring's worldbuilding collaboration with George R.R. Martin, or on how environmental storytelling was authored at FromSoftware.

## 5. How do they handle progression, pacing, difficulty curves and optional challenge?

### Takeaway
Nintendo paces with one concept per stage and soft aids for new players. BotW shapes pacing spatially with triangles, towers and landmarks. FromSoftware uses interconnected areas and hubs with discoverable checkpoints. Hades layers permanent upgrades with opt-in difficulty (Heat), which only worked once it was rewarded, a change made during Early Access.

### Cited Findings
- **[PRIMARY, via summary]** Each Mario level introduces a concept, develops it, twists it and ends on a showcase. 3D Land enforced one concept per level, while 3D World layered a second mechanic in the twist. — [Game Developer](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design)
- **[PRIMARY, Iwata Asks]** 3D Land's post-game "special worlds" reuse normal stages with new mission types, a cheap way to add optional challenge. — [GoNintendo Iwata Asks summary](https://www.gonintendo.com/archives/164981-iwata-asks-super-mario-3d-land-new-details-post-game-content-and-more)
- **[PRIMARY, CEDEC 2017]** In BotW, small triangle landforms "set the tempo of play." Towers were moved because they enforced linearity. — [CEDEC translation gist](https://gist.github.com/idbrii/e39fe96279aa1670319bfa521d907399)
- **[PRIMARY, Ask the Developer]** TotK's central mechanic was tuned to serve both players who want elaborate builds and players who only want to progress. — [Nintendo Ask the Developer](https://www.nintendo.com/sg/interview/totk/04.html)
- **[SECONDARY]** Early Access versions of Hades gave no reward for raising Heat (opt-in difficulty), so it only interested players who had run out of content. Heat was later tied to bounties and the House Contractor and was widely seen as much improved. — [TheGamer: 10 biggest changes since Early Access](https://www.thegamer.com/hades-changes-early-access/)

### Inferences
- **Progression across Floors:** one CS concept per Floor or room, kishōtenketsu inside each Floor, and the boss as the *ketsu* that combines the Floor's concepts.
- **Optional challenge:** a Heat-like "Pact" for a Floor, such as a stricter time limit, a banned built-in, or a memory cap, which players opt into for cosmetic or currency bounties. It must be *rewarded*; Hades shows that an unrewarded hard mode is ignored.
- **Post-floor replay:** reuse Floors with new mission types, as 3D Land's special worlds do, e.g. "solve in the other language" or "golf it."

### Gaps
- No primary sources were found on Elden Ring's open-world pacing (Limgrave, optional dungeons, Spirit Ashes as an optional difficulty lever). This was not covered in this session.

## 6. What light-touch multiplayer/social features build community?

### Takeaway
FromSoftware's asynchronous systems came from Miyazaki's memory of anonymous strangers who helped push his car up a snowy hill and vanished before he could thank them. These include messages, bloodstains, ghost silhouettes at bonfires and summon signs. The design goal is "sharing experiences" and players helping each other through hard parts, with only fleeting contact.

### Cited Findings
- **[PRIMARY, via coverage of New Yorker and 2010 Eurogamer interviews]** Miyazaki's car stalled on a snowy hill. Strangers pushed it to the top and vanished, and he never got to thank them. He has said this inspired the summoning and co-op system. — [GamesRadar](https://www.gamesradar.com/elden-ring-and-dark-souls-summoning-system-was-inspired-by-miyazakis-car-breaking-down/); [TheGamer](https://www.thegamer.com/elden-ring-co-op-inspired-helpful-strangers/); [Neoseeker forum quoting 2010 Eurogamer: SECONDARY](https://www.neoseeker.com/forums/51620/t2270124-miyazaki-intended-cooperation/)
- **[PRIMARY, 4Gamer 2011 via Gematsu]** On Dark Souls multiplayer, Miyazaki spoke of "sharing of experiences." He wanted the feeling of players helping each other through difficult segments built into the game. — [Gematsu](https://www.gematsu.com/2011/02/dark-souls-miyazaki-on-dlc-multiplayer-demo-and-more)
- **[SECONDARY, citing Miyazaki]** At bonfires, players can see the vague shadows of other online players resting at the same bonfire. This was meant as emotional relief. — [Wikipedia: Bonfire (Dark Souls)](https://en.wikipedia.org/wiki/Bonfire_(Dark_Souls))
- **[SECONDARY]** Dark Souls' asynchronous multiplayer is credited with influencing Journey and PlayStation 4 development. — [Giant Bomb](https://www.giantbomb.com/wd/3030-32697)
- **[PRIMARY, IGN via TheGamer]** For Elden Ring, Miyazaki talked about how other games use players "as one of the resources for the gameplay" and cited Escape from Tarkov. — [TheGamer](https://www.thegamer.com/elden-ring-creator-hidetaka-miyazaki-multiplayer-games-inspiration/)
- **[PRIMARY]** TotK: players' shared Ultrahand creations went beyond what the developers imagined, showing that systemic tools generate community content. — [GamesRadar](https://www.gamesradar.com/zelda-leads-were-blown-away-by-what-tears-of-the-kingdom-players-made-with-ultrahand-its-beyond-even-the-development-teams-imagination/)
- **Supergiant, community feedback (not in-game social) [SECONDARY]:**
  - Supergiant gathered feedback through Discord, Twitter, Reddit and opt-in "Transmit Data" telemetry, and closed the Discord feedback channel after Early Access.
  - Edge said updates came "regularly and punctually" against a clear public roadmap.

  — [Wikipedia: Hades](https://en.wikipedia.org/wiki/Hades_(video_game)); [Edge via PressReader](https://www.pressreader.com/australia/edge/20200910/282759179066349)

### Inferences
- **Async features that fit a browser game with a shared Base:**
  - **Messages:** constrained-vocabulary hint notes left at a challenge, e.g. "Try: base case," "Beware: off-by-one." Constrained templates prevent spoilers and toxicity, as Souls messages do.
  - **Bloodstains:** replays or summaries of where other Climbers lost Integrity on this challenge, e.g. "37% of Climbers failed test 4."
  - **Ghosts:** silhouettes of other Climbers on the same Floor or checkpoint.
  - **Summon signs:** pairing or "rubber-duck" help in a challenge, where a helper earns a reward.
- **The "strangers who vanish" framing suits a Tower of God-style tower:** brief, anonymous help is lighter to build and moderate than persistent social graphs.
- **For live development,** Hades' combination of a regular update cadence, a public roadmap, opt-in telemetry and a feedback Discord is a ready-made model.

### Gaps
- No primary source was found specifically on the origin of Demon's Souls *messages and bloodstains*, as opposed to summoning. The snowy-hill story is usually linked to co-op and summoning in general.
- No data was found on how often Souls players used messages, or what effect they had.

## 7. What did developers themselves say? (Primary-source index)

### Takeaway
The most useful primary sources are listed below, grouped by studio. All were reached only through coverage in this session.

### Cited Findings
**Nintendo**
- **BotW GDC 2017 panel:** "active, not passive," physics × chemistry, multiplicative design, top-down prototype. — [Perfectly Nintendo recording](https://www.perfectly-nintendo.com/?p=194934)
- **BotW CEDEC 2017:** triangle rule, towers. — [Matt Walker translation](https://gist.github.com/idbrii/e39fe96279aa1670319bfa521d907399)
- **TotK Ask the Developer:** Ultrahand built from BotW parts. — [Nintendo](https://www.nintendo.com/sg/interview/totk/04.html)
- **Iwata Asks: Super Mario 3D Land:** block-Mario prototype, "reset," an introduction to 3D Mario. — [Iwata Asks](https://iwataasks.nintendo.com/interviews/3ds/super-mario-3d-land/0/2/)
- **Iwata Asks: Super Mario 3D World.** — [Iwata Asks pt.5](https://iwataasks.nintendo.com/interviews/wiiu/super-mario-3d-world/0/5)
- **Hayashida on kishōtenketsu.** — [Game Developer](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design)
- **Miyamoto on World 1-1 (Eurogamer 2015).** — [Nintendo Insider](https://www.nintendo-insider.com/shigeru-miyamoto-shares-the-design-process-behind-world-1-1-in-super-mario-bros/)

**FromSoftware**
- **Miyazaki, New Yorker 2022:** death with meaning, difficulty as identity. — [GamesRadar coverage](https://www.gamesradar.com/elden-ring-creator-miyazaki-feels-apologetic-towards-players-defeated-by-his-games/)
- **Miyazaki, 4Gamer 2011:** sharing experiences. — [Gematsu](https://www.gematsu.com/2011/02/dark-souls-miyazaki-on-dlc-multiplayer-demo-and-more)
- **Dark Souls Design Works interview:** Firelink. — [Souls Lore](https://soulslore.wikidot.com/das1-design-works)
- **Index of FromSoftware interviews.** — [Fextralife](https://darksouls.wiki.fextralife.com/Articles+&+Interviews); [GameBanshee Demon's Souls post-mortem interview](https://gamebanshee.com/ua9c)

**Supergiant**
- **Kasavin to RPG Site:** Early Access first. — [RPG Site](https://www.rpgsite.net/interview/20348-supergiant-games-interview-with-greg-kasavin-and-darren-korb-hades-ii-early-access-feedback-boss-themes-the-ending-coffee-and-the-future)
- **Kasavin to RPS:** take the pain out of dying. — [Game Developer](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)
- **GDC 2021 dialogue talk.** — [GDC](https://gdconf.com/news/dive-dialogue-hades-gdc-2021)
- **Kasavin video on Hades' development.** — [Game Developer](https://www.gamedeveloper.com/design/watch-greg-kasavin-discuss-the-development-of-supergiant-games-i-hades-i-)
- **Origin Story podcast with Kasavin.** — [Origin Story](https://www.originstory.show/episodes/greg-kasavin)

### Inferences
- Across all three studios the shared principle is: **prove one systemic verb, teach it through safe staged exposure, make failure cheap to retry and meaningful (story or progress), and let players help each other lightly and anonymously.**

### Gaps
- None of these primary sources were read in full because the proxy blocked page fetches. Verbatim quotes need checking before publication.
- The following were not covered: Hyrule Historia, Miyamoto's broader philosophy (e.g. "a delayed game is eventually good"), Elden Ring open-world design, and Hades' Early Access patch-by-patch changes from Supergiant's own patch notes.
