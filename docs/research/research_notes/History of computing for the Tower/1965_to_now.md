# History of Computing, ~1965 to Now (excluding AI/ML), for the Tower

Method note for the report writer: in this session WebFetch could not resolve hosts and the egress proxy refused direct `curl` (for example, rfc-editor.org returned 403). Every finding below therefore comes from WebSearch result summaries plus the URLs those searches returned. I did not open and read primary documents (RFCs, the 1976 and 1970 papers and so on) directly. Where a search summary relied on a weak or secondary source, I say so. Items I could not source are listed under Gaps and are not stated as fact.

Design rule implied throughout: almost every person in this era is either living or died recently (see the living-status list under Gaps). The Tower should use homage characters, not depictions, for this whole stretch.

## What did each idea introduce, how did it work at a level a game could simulate, and what hands-on challenge fits?

### Takeaway
Each milestone below has a clear problem, a mechanism and a small, simulable core. Examples: hot-potato packet forwarding, a hierarchical name lookup, a shared-secret exchange, link-based ranking, three-way merge. A floor can be built around each. Entries are in chronological order.

### Cited Findings

#### 1. Packet switching: Baran (RAND, 1960–64) and Davies (NPL, mid-1960s). This comes just before the era but underpins it.
- Baran's work started as a RAND study of survivable communications. He briefed the Air Force in summer 1961 (B-265), then wrote paper P-2626, then an 11-part series, *On Distributed Communications* (1964). — [Internet Hall of Fame: Paul Baran](https://www.internethalloffame.org/2012/09/06/what-do-h-bomb-and-internet-have-common-paul-baran/); [NAE Memorial Tributes vol. 16](https://www.nationalacademies.org/read/13338/chapter/4)
- Baran's "hot-potato routing" was rapid store-and-forward. A node stores the packet, works out the best route and passes it to the next node. A 1964 RAND memo by Sharla Boehm (Part II of the series) simulated this in software. — [Internet Hall of Fame](https://internethalloffame.org/?p=271); [ibiblio Internet Pioneers: Baran](https://www.ibiblio.org/pioneers/baran.html)
- At NPL in Teddington, Donald Davies worked on the same ideas independently in the mid-1960s. He coined the term "packet switching" and built a one-node local network at NPL to prove it. — [nethistory.info: packets](https://nethistory.info/Archives/packets.html)
- Credit is disputed. One account says Larry Roberts drew up the initial ARPANET design before he learned of Baran's work. A 1967 ACM paper by Davies's team cited Baran, and Roger Scantlebury says that paper introduced Baran's work to Roberts. — [nethistory.info](https://nethistory.info/Archives/packets.html)
- Baran's ideas were "considered radical" and met resistance from people who favoured circuit switching. — [NAE Memorial Tributes](https://www.nationalacademies.org/read/13338/chapter/4)
- **Problem solved:** a centralised, circuit-switched network fails if one hub is lost. A distributed mesh of small packets survives.
- **Challenge:** split a message into numbered packets and forward each one hop by hop across a mesh. Mid-run, a node "goes dark", so the player re-routes around it and reassembles the packets in order at the far end. Compare this with a star network that dies when its hub fails.

#### 2. Douglas Engelbart's demo, 9 December 1968 ("Mother of All Demos")
- On 9 Dec 1968 in San Francisco, Engelbart showed the mouse, hypertext, video conferencing and collaborative editing. All of it ran on NLS (oN-Line System), on an SDS 940 at SRI about 30 miles away, and was shown on a large screen. — [Wikipedia: The Mother of All Demos](https://en.wikipedia.org/wiki/The_Mother_of_All_Demos); [Scientific American, "The computer mouse at 40"](https://www.scientificamerican.com/blog/news-blog/the-computer-mouse-at-40-rememberin-2008-12-10/)
- Bill English built the first mouse (from a block of wood) and directed the live video production. Accounts disagree on where he was during the demo. — [Scientific American](https://www.scientificamerican.com/blog/news-blog/the-computer-mouse-at-40-rememberin-2008-12-10/); [The Register, 2020](https://www.theregister.com/2020/08/03/the_inventor_of_the_mouse/)
- Engelbart filed the mouse patent in 1967, and it was granted about three years later. Sources date English's NASA-sponsored comparison of pointing devices (the mouse won) to either 1965 or about 1967. — [Scientific American](https://www.scientificamerican.com/blog/news-blog/the-computer-mouse-at-40-rememberin-2008-12-10/)
- Bill English died in 2020. — [Gizmodo: William English, co-creator of the mouse, dies](https://gizmodo.com/william-english-co-creator-of-the-computer-mouse-dies-1844591387)
- **Key idea:** computers as tools to augment human intellect, with pointing, linked text and shared live work.
- **Challenge:** the player uses a mouse-pointer to click linked text and build a "jump list" of linked notes (a hypertext graph), then co-edits one document with another Climber in real time. A small version: "follow the links to reach the target node in the fewest clicks".

#### 3. ARPANET, first message 29 October 1969
- The first host-to-host message went from UCLA to SRI on 29 Oct 1969 at about 22:30. It was meant to be "login", but the system crashed after "l" and "o", so the first message was "lo". Charley Kline sent it, and Bill Duvall received it at SRI. — [Kleinrock, "The first words on the Internet" (UCLA)](https://www.lk.cs.ucla.edu/internet_first_words.html); [Kleinrock on the ICANN blog](https://www.icann.org/news/blog/the-first-message-transmission)
- Leonard Kleinrock's UCLA team numbered about 40 people. — [UCLA Alumni history](https://alumni.ucla.edu/ucla-history-45/)
- **Challenge:** type "LOGIN" across a link whose remote IMP has a tiny buffer. If the player sends too fast, the receiver crashes after "LO". The player has to add acknowledgements or pacing (flow control) to get the full word through.

#### 4. Network email, 1971 (Ray Tomlinson, BBN), and the @ sign
- In 1971 Tomlinson of BBN wrote an email program that sent messages across a distributed network. He built it from SNDMSG (a single-machine mail program) and CPYNET (an experimental file transfer program). — [RFC 2235, Hobbes' Internet Timeline (IETF)](https://www.ietf.org/ietf-ftp/rfc/fyi/fyi32.html); [RFC Editor info page for RFC 2235](https://www.rfc-editor.org/info/rfc2235/)
- Sources differ on when the "@" addressing convention started (1971 or 1972). Treat the program as 1971 and the @ convention as about 1971–72. — [firstsiteguide timeline (secondary)](https://firstsiteguide.com/who-invented-internet-part-4/)
- **Challenge:** a message has to reach a mailbox on a different machine. The player writes the address as `user@host`, and the system splits it at "@" to choose the machine first and then the mailbox.

#### 5. Microprocessors: Intel 4004 (1971), then the 8080
- The 4004 launched on 15 Nov 1971. The first fully working chip went to Busicom in March 1971 for its 141-PF printing-calculator prototype. — [Wikipedia: Intel 4004](https://en.wikipedia.org/wiki/Intel_4004)
- Ted Hoff and Stanley Mazor proposed folding the calculator's planned chip set (about 12 chips) into a general-purpose design of four chips. Federico Faggin led the design from April 1970, helped by Masatoshi Shima (Busicom) on architecture and logic. Faggin's silicon-gate MOS process made the chip feasible. — [Wikipedia: Intel 4004](https://en.wikipedia.org/wiki/Intel_4004); [Wikipedia: Masatoshi Shima](https://en.wikipedia.org/wiki/Masatoshi_Shima)
- Guinness World Records lists the 4004 as the first microprocessor. — [Guinness: First microprocessor](https://www.guinnessworldrecords.com/world-records/first-microprocessor)
- Faggin and Shima went on to the 8080. Despite the similar names, the 8008 and 8080 are designs unrelated to the 4004. I did not confirm the 8080's exact release date (commonly given as 1974). — [DBpedia: Intel 4004](https://dbpedia.org/page/Intel_4004); [Guinness](https://www.guinnessworldrecords.com/world-records/first-microprocessor)
- **Key idea:** a programmable CPU on one chip replaces a custom chip for each product. The behaviour comes from software, not wiring.
- **Challenge:** the player is handed a "calculator" made of hard-wired logic gates. Then they get a tiny 4-bit CPU with about 8 instructions and write a short program so that the same chip becomes a calculator, then a traffic light. The point to land is that one chip can do many jobs.

#### 6. Video games as a driver: Spacewar! (1962), Odyssey (1972), Pong (1972)
- Steve Russell and other MIT hackers wrote Spacewar! as a demo program for DEC's PDP-1. It spread slowly through labs and inspired the first commercial arcade game, Computer Space (1971). — [Monnens & Goldberg, "Space Odyssey: The Long Journey of Spacewar!" (Kinephanos, 2015)](https://www.kinephanos.ca/Revue_files/2015_Monnens_Goldberg.pdf); [SF Encyclopedia: Spacewar](https://sf-encyclopedia.com/entry/spacewar)
- Ralph Baer invented the Magnavox Odyssey, the first commercial home video game console. — [Video Game History Wiki (secondary)](https://videogamehistory.fandom.com/wiki/SpaceWar!)
- Nolan Bushnell played the Odyssey's table tennis game at a Magnavox demo in May 1972. Allan Alcorn, who did not know about Baer's work, built Pong. The prototype went into Andy Capp's Tavern (Sunnyvale) in August 1972. In April 1974 Magnavox sued Atari and others for patent infringement. Atari and Magnavox later settled. — [Wikipedia: Pong](https://en.wikipedia.org/wiki/Pong); [The Register, Pong at 40 / Al Alcorn](https://www.theregister.com/2012/03/05/pong_anniversary_al_alcorn/?page=2); [BRG, "The Case of the Video Game Lawsuit Racket"](https://www.thinkbrg.com/thinkset/ts-case-of-the-video-game-lawsuit-racket/)
- **Challenge:** a fixed-timestep game loop. The player codes ball physics (reflect velocity on paddle and wall hits) in a tiny loop and keeps a score. A harder version uses Spacewar!-style gravity toward a central star.

#### 7. Xerox PARC: Alto (1973), GUI, Ethernet, Smalltalk
- Butler Lampson wrote the "Why Alto?" memo in late 1972. Work started that November, and a first unit was running by April 1973. The April 1973 date comes from a secondary blog. — [Wikipedia: Xerox Alto](https://en.wikipedia.org/wiki/Xerox_Alto); [TechEBlog](https://www.techeblog.com/xerox-alto-computer-specs-price-release/)
- Chuck Thacker led the hardware design. Alan Kay is credited with Smalltalk, an early full object-oriented language. Lampson wrote the first draft of the Alto's GUI operating system. — [MIT News, 2014](https://news.mit.edu/2014/mit-professor-made-much-of-our-world-possible-0218)
- Ethernet: Bob Metcalfe is often called its inventor, but the patent lists four names: Metcalfe, Thacker, Lampson and David Boggs. — [MIT News, 2014](https://news.mit.edu/2014/mit-professor-made-much-of-our-world-possible-0218)
- Thacker won the 2009 ACM Turing Award for the Alto. The 2004 Draper Prize went to Thacker, Kay, Lampson and Robert W. Taylor for the Alto. — [Wikipedia: Xerox Alto](https://en.wikipedia.org/wiki/Xerox_Alto)
- On 21 Oct 2014 the Computer History Museum released Alto source code and files. — [CHM Xerox Alto file system archive](https://xeroxalto.computerhistory.org/xerox_alto_file_system_archive.html)
- **Challenge, three options:** (a) Ethernet collisions: several Climbers share one wire, a collision garbles the frame, and the player sets random back-off delays until every frame gets through. (b) Objects and messages: send messages to Smalltalk-like objects (`circle grow: 2`). (c) Drag a window on a bitmap desktop.

#### 8. Relational databases: E. F. Codd (1970)
- Codd published "A Relational Model of Data for Large Shared Data Banks" in *Communications of the ACM* in June 1970. — [Oracle docs: History of SQL](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/History-of-SQL.html); [LearnSQL: Codd's article](https://learnsql.com/blog/codd-article-databases/)
- Core idea: represent all information as values in the rows and columns of tables, with no pointers between records. — [Britannica: Edgar Frank Codd](https://www.britannica.com/print/article/914158)
- In 1974 Chamberlin and Boyce described SEQUEL for IBM's System R prototype (San Jose). It was renamed SQL because of a trademark clash. In 1979 Relational Software, Inc. (later Oracle) shipped the first commercially available SQL. IBM followed with SQL/DS (1981) and DB2 (1983). — [Oracle docs](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/History-of-SQL.html); [Cambridge DB history notes](https://www.cl.cam.ac.uk/teaching/1415/Databases/KM-DB-history.pdf)
- **Problem solved:** in navigational databases, programs had to follow record pointers, so changing the storage broke the programs. Relational tables separate the query (what you want) from the storage (where it lives).
- **Challenge:** a level gives the player linked "pointer" records. They then rebuild the same data as tables and answer a question with a join (`SELECT ... FROM climbers JOIN floors ...`). The Tower already supports Python and JS, so this could be in-browser SQLite or a hand-written join.

#### 9. TCP/IP: Cerf & Kahn (1974), the 1 Jan 1983 switch
- In 1974 Vint Cerf and Bob Kahn published "A Protocol for Packet Network Intercommunication" (*IEEE Transactions on Communications*), which set out the Transmission Control Program in detail. — [RFC 2235 Hobbes' Internet Timeline (IETF)](https://www.ietf.org/ietf-ftp/rfc/fyi/fyi32.html); [Leiner et al., "A Brief History of the Internet" (PDF hosted at UCLA)](https://www.lk.cs.ucla.edu/data/files/Leiner/Past%20and%20Future%20History%20of%20the%20Internet.pdf)
- ARPANET switched from NCP to TCP/IP on 1 Jan 1983 (the "flag day"). Jon Postel's RFC 801 (Nov 1981), "NCP/TCP Transition Plan", laid out the plan. — [Wikipedia: Flag day (computing)](https://en.wikipedia.org/wiki/Flag_day_(computing))
- Mechanics, from a participant (Andrew Malis): the team added a per-host bit in the IMPs that allowed or denied the old host-host protocol. Most hosts were switched off on 1 Jan, with a pre-approved list of exceptions, and more exceptions were added as hosts called in. By the end of 1983 very few NCP-only hosts were left. — [Internet History list, "Memories of Flag Day?" (Aug 2023)](https://elists.isoc.org/pipermail/internet-history/2023-August/008772.html)
- **Key idea:** "internetworking". Many different networks join through gateways. IP carries best-effort datagrams, and TCP on top adds reliable, ordered delivery (sequence numbers, ACKs, retransmission).
- **Challenge:** packets arrive lost, duplicated or out of order across two joined networks. The player numbers them, ACKs them and retransmits until the message reassembles exactly. A Boss version is "Flag Day": migrate every host to the new protocol before midnight while keeping a list of exceptions.

#### 10. Public-key cryptography: Diffie–Hellman (1976), RSA (1977), GCHQ (classified)
- Diffie and Hellman, "New Directions in Cryptography", *IEEE Transactions on Information Theory* IT-22, Nov 1976, pp. 644–654. It introduced public-key cryptography and digital signatures, with a key-exchange method but no public-key encryption algorithm. — [Purdue (Wagstaff) notes on public-key history](https://www.cs.purdue.edu/homes/ssw/pk.pdf); [IEEE Milestone: Invention of Public-key Cryptography](https://ethw.org/Milestones:Invention_of_Public-key_Cryptography,_1969_-_1975)
- RSA: MIT Technical Memo 18, dated 4 April 1977. Martin Gardner's August 1977 *Scientific American* column made it public and included the RSA-129 challenge, which was factored in 1993–94. — [Purdue notes](https://www.cs.purdue.edu/homes/ssw/pk.pdf)
- At GCHQ, James Ellis proposed "non-secret encryption". Clifford Cocks found an RSA-like scheme (often dated 1973), and Malcolm Williamson found a Diffie–Hellman-like key exchange. The work stayed classified until Cocks's public talk on 18 Dec 1997. Ellis had died on 25 Nov 1997. — [Wikipedia: Clifford Cocks](https://en.wikipedia.org/wiki/Clifford_Cocks); [University of Bristol: Dr Clifford Cocks](https://www.bristol.ac.uk/alumni/our-alumni/honorary-degrees/honorary-graduates/2008/cocks.html); [IEEE Milestone](https://ethw.org/Milestones:Invention_of_Public-key_Cryptography,_1969_-_1975)
- **Problem solved:** with a symmetric cipher, both sides have to share a secret key in advance. Public-key methods let strangers agree a secret over an open channel.
- **Challenge:** run Diffie–Hellman with small numbers (p=23, g=5). Each player picks a secret, publishes g^a mod p, and both arrive at the same key, while an eavesdropper NPC who sees only the public values cannot. Follow-ups: RSA toy encryption with small primes, then signing a message.

#### 11. DNS: Paul Mockapetris (1983)
- Before DNS, the network depended on one HOSTS.TXT file that SRI maintained by hand. Mockapetris single-authored the DNS spec in RFCs 882 and 883 (1983) and wrote the first server, "Jeeves". RFCs 1034/1035 replaced those RFCs in 1987. — [ACM Software System Award 2019: Paul Mockapetris](https://awards.acm.org/award-recipients/mockapetris_3342151)
- DNS did not replace HOSTS.TXT overnight. Some hosts used DNS as their only naming source by 1985. — [Mockapetris & Dunlap, "Development of the Domain Name System" (SIGCOMM 1988)](https://www.cs.princeton.edu/courses/archive/fall08/cos561/papers/mockapetris88.pdf)
- **Challenge:** resolve `floor7.tower.example`. Start at root, which points to the `example` servers, which point to `tower`, which returns the address. Then make the single HOSTS.TXT "librarian" NPC overloaded to show why distribution is needed. Add caching with a TTL as a follow-up.

#### 12. Personal computers and the Homebrew Computer Club (1975–1981)
- The Altair 8800 was on the cover of *Popular Electronics* in January 1975, sold as a kit. Sources give different kit prices ($297 or $395). — [RF Cafe reproduction of the Popular Electronics Jan 1975 article](https://rfcafe.com/references/popular-electronics/altair-8800-minicomputer-popular-electronics-january-1975.htm)
- The Homebrew Computer Club first met in March 1975, partly to see a review unit of the Altair, and Steve Wozniak attended. Wozniak demonstrated his Apple I prototype to the club in 1976 and shared the schematics. The Apple I went on sale in July 1976 for $666.66, without a keyboard, power supply or case. — [Heinz Nixdorf MuseumsForum: The birth of the PC](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html); [Garbage Collection: The Altair 8800 (secondary)](https://garbagecollection.substack.com/p/the-altair-8800)
- 1977 brought the Apple II, Commodore PET and TRS-80. IBM released the PC 5150 in 1981. — [HNF](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html)
- **Challenge:** front-panel programming in the style of the Altair. The player toggles binary switches to enter a tiny program byte by byte, then "flips RUN" and reads the result on LEDs. A social follow-up: share a schematic at the "club" so another Climber can build it.

#### 13. Free software and open source (1983–1998), Linux (1991), Git (2005)
- On 27 Sept 1983 Richard Stallman posted "Free Unix!" to net.unix-wizards, announcing GNU, a complete Unix-compatible system to be given away. — [Network World, "Free Unix!" at 30](https://www.networkworld.com/article/680418/software-39-free-unix9the-world-changing-proclamation-made-30-years-ago-today.html); [Wikipedia: GNU Project](https://en.wikipedia.org/wiki/GNU_Project)
- On 25 Aug 1991 Linus Torvalds posted on comp.os.minix about a free OS he was writing as a hobby. Version 0.02 was announced on 5 Oct 1991. — [Wikipedia: History of Linux](https://en.wikipedia.org/wiki/History_of_Linux)
- Christine Peterson proposed the term "open source" in early February 1998. Accounts differ on the exact meeting dates (2, 3 or 5 Feb). The OSI was founded that year. — [OSI: History of the Open Source Initiative](https://opensource.org/20years); [Peterson, "How I coined the term 'open source'" (opensource.com)](https://opensource.com/article/18/2/coining-term-open-source-software); [Foresight Institute](https://foresight.org/1998-the-two-words-that-changedoftware/)
- Git: the Linux kernel had used the proprietary BitKeeper since 2002. In 2005 the free arrangement ended, and Torvalds began Git in April 2005. Its goals were speed, a simple design and strong support for non-linear development (thousands of parallel branches). — [Pro Git: A Short History of Git](https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git); [Britannica: Git](https://www.britannica.com/technology/Git)
- **Challenge:** two Climbers edit the same file on separate branches. The player merges them and resolves the conflict hunk by hand. The underlying idea is content-addressed commits, where changing one byte changes the hash.

#### 14. World Wide Web: Tim Berners-Lee at CERN (1989–1993)
- Berners-Lee wrote the first proposal in March 1989 and resubmitted a revised version in May 1990. With Robert Cailliau it became a formal management proposal in November 1990. By Christmas 1990 he had defined HTML, HTTP and URLs and had written the first browser/editor and server. — [CERN: A short history of the Web](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/)
- CERN put the WWW software in the public domain on 30 April 1993, then made the next release available under an open licence. — [CERN: A short history of the Web](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/); [CERN Archive: World Wide Web](https://library.cern/archives/CERN_archive/guide/IT/isawww)
- **Challenge:** "write the first HTML page". The player builds a page with a heading and a link, serves it, and follows a URL to another Climber's page. A follow-up has them send a raw `GET /` request and read the response.

#### 15. Python: Guido van Rossum (1989–1991)
- Van Rossum started Python at CWI (Netherlands) over Christmas 1989 as a successor to ABC, and named it after Monty Python. He posted version 0.9.0 to alt.sources in February 1991 (often dated 20 Feb). It already had classes with inheritance, exceptions, modules, list, dict and str. 1.0 came in January 1994, 2.0 in October 2000 and 3.0 in December 2008. All of these sources are secondary. — [LearnPython: History of Python](https://learnpython.com/blog/history-of-python/); [Exyte: Brief history of Python](https://exyte.com/blog/a-brief-history-of-python)
- **Challenge:** a "0.9.0 feature check". The player writes a short Python program using only features from the 1991 release (class, try/except, dict) in the existing Pyodide runner.

#### 16. Browsers: Mosaic (1993) and Netscape (1994)
- Marc Andreessen and Eric Bina built NCSA Mosaic. Andreessen announced alpha/beta 0.5 on 23 Jan 1993. — [Wikipedia: NCSA Mosaic](https://en.wikipedia.org/wiki/NCSA_Mosaic)
- Mosaic Communications Corp. (renamed Netscape to avoid trademark trouble with NCSA) released Netscape Navigator. Betas were free for non-commercial use from Nov 1994, and 1.0 shipped in Dec 1994. — [Wikipedia: NCSA Mosaic](https://en.wikipedia.org/wiki/NCSA_Mosaic); [History of Computing podcast: Netscape](https://thehistoryofcomputing.libsyn.com/netscape)
- **Challenge:** render inline images. Text and images sit on one page, and the player has to lay out an `<img>` inline (Mosaic's signature feature), not open it in a separate window.

#### 17. JavaScript: Brendan Eich (1995)
- Netscape hired Eich in 1995. The language had to look like Java. He wrote the prototype in about 10 days in May 1995. It went from "Mocha" to "LiveScript" (Navigator 2.0 betas, Sept 1995) to "JavaScript" (Dec 1995). These sources are secondary, and the 10-day claim traces to a 2012 IEEE *Computer* article. — [DEV Community: History of JavaScript](https://dev.to/devpedrofurquim/the-history-of-the-javascript-language-99b); [Medium: History of JavaScript](https://medium.com/@codemarch/history-of-javascript-6a90bcaa312a)
- **Challenge:** "10-day sprint". On a timer, the player adds interactivity to the static Floor-14 page, for example validating a form or reacting to a click, using the existing JS runner.

#### 18. Search: Brin & Page, PageRank (1998)
- "The Anatomy of a Large-Scale Hypertextual Web Search Engine", *Computer Networks* 30(1–7):107–117, 1998. — [Google Research publication page](https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/)
- The formula is PR(A) = (1−d) + d·Σ PR(Tᵢ)/C(Tᵢ), where C(T) is the number of outbound links of T and d is a damping factor usually set to 0.85. — [Copy of the paper, U. Ottawa course reading](https://www.site.uottawa.ca/~stan/csi5389/readings/google.pdf)
- **Problem solved:** keyword-only search was easy to game and ranked badly. Links act as votes, and a vote from an important page counts for more.
- **Challenge:** "rank pages by links". The player is given a 5-page link graph and iterates PageRank by hand or in code until it converges. Then a "link farm" boss adds spam pages, and the player sees how damping limits the damage.

#### 19. Cloud computing: AWS S3 and EC2 (2006)
- S3 launched on 14 March 2006 as the first generally available AWS service. The EC2 beta followed on 25 Aug 2006. — [AWS News Blog: The first five years](https://aws.amazon.com/blogs/aws/aws-blog-the-first-five-years/); [TechCrunch: How EC2 grew](https://techcrunch.com/2021/08/28/how-amazon-ec2-grew-from-a-notion-into-a-foundational-element-of-cloud-computing)
- **Challenge:** "scale out". A traffic spike hits the player's server. Instead of buying a bigger box, they call an API to spin up N rented instances behind a load balancer, then shut them down to save credits.

#### 20. Smartphones: iPhone (2007) and Android (2008)
- Apple announced the iPhone at Macworld San Francisco on 9 Jan 2007, and it went on sale on 29 June 2007. These dates come from a low-quality source and need confirming. — [ctdata page (weak source)](https://openpension.ctdata.org/release-date-of-the-first-iphone)
- Google formed the Open Handset Alliance with 33 other companies in Nov 2007. The first Android phone, the HTC Dream (sold as the T-Mobile G1), launched in the US on 22 Oct 2008 for $179 on contract. — [Galaxus: 15 years of Android](https://www.galaxus.de/en/page/15-years-of-android-time-for-a-throwback-29956); [PhoneArena](https://www.phonearena.com/news/The-Android-Revolution-started-3-years-ago-Friday-with-the-introduction-of-the-T-Mobile-G1_id22400)
- **Challenge:** an event-driven, touch-first UI with battery limits. The player handles tap and swipe events and must keep a background task inside a power budget.

#### 21. GPUs and parallel computing (1999 onward)
- NVIDIA marketed the GeForce 256 (1999) as the "first GPU", meaning a single chip with integrated transform, lighting and rendering. Critics say the term was mostly marketing. Its real step forward was hardware transform and lighting. — [Wikipedia: GeForce 256](https://en.wikipedia.org/wiki/GeForce_256); [Digital Trends](https://www.digitaltrends.com/computing/best-nvidia-gpu-of-all-time/)
- CUDA is NVIDIA's parallel computing platform for general-purpose GPU work. The source lists it under 2007. — [Analytics India Mag (secondary)](https://analyticsindiamag.com/nvidia-completes-29-years-a-lookback/)
- **Challenge:** "a thousand tiny workers". The player gets a big image to brighten. Doing it pixel by pixel in one loop is slow. Rewriting it as a function applied to every pixel at once (map, or a kernel over a grid) shows data parallelism. Use Web Workers or a vectorised array in the existing runners.

### Inferences
- The Tower floors split cleanly into themes: networking (packet switching, then ARPANET, email, TCP/IP and DNS), the human interface (Engelbart, then PARC, PCs and smartphones), data (Codd, then PageRank), trust (public-key crypto) and collaboration (GNU, Linux, Git). Each theme could be a wing or an arc of floors.
- The most simulable mechanics are deterministic, small-number algorithms: hot-potato routing, TCP sequence and ACK, DNS lookup chains, small-prime Diffie–Hellman and RSA, 5-node PageRank, three-way merge and Ethernet random back-off. All of these fit the game's Code, Fix, Predict and Quiz formats in Python and JS.
- Several challenges lend themselves to Predict-style questions, for example "what is the shared key?", "which page ranks highest?" and "what arrives after the crash?".

### Gaps
- I could not open primary documents (the RFC texts, Codd 1970, Diffie–Hellman 1976, Brin & Page 1998, the Engelbart Institute, ISOC's Brief History) because of network restrictions. Bibliographic details come from search summaries and secondary copies.
- Not verified: the Intel 8080's exact release date (commonly April 1974), the Apple II launch month, the IBM PC's exact launch date (commonly 12 Aug 1981), CUDA's announcement date (believed Nov 2006, with an SDK in 2007), and the Homebrew Computer Club's exact first-meeting date (commonly 5 March 1975).
- iPhone dates rest on a low-quality page and need confirming against Apple's press releases.
- The "Email" entry: the @ sign date (1971 or 1972) is unsettled across sources.

## What common myths should the game avoid?

### Takeaway
The main traps are: Gore "inventing" the internet, treating the internet and the Web as one thing, crediting Apple (or only Xerox) with inventing the GUI, crediting Metcalfe alone with Ethernet, treating Diffie–Hellman/RSA as the only discoverers of public-key crypto, saying the ARPANET was built to survive nuclear war, and taking NVIDIA's "first GPU" claim at face value.

### Cited Findings
- **"Al Gore invented the internet".** Gore's 1999 line was "During my service in the United States Congress I took the initiative in creating the Internet." In 2000 Kahn and Cerf wrote that no one person "invented" the Internet, that Gore did not mean to claim he had, and that he had championed high-speed networking since the 1970s. — [The Register, 2 Oct 2000](https://www.theregister.com/2000/10/02/net_builders_kahn_cerf_recognise/); [Cerf's post on nettime, 30 Sep 2000](https://nettime.org/Lists-Archives/nettime-l-0009/msg00311.html)
- **Internet vs Web.** The internet's TCP/IP switch was 1 Jan 1983. The Web (HTML, HTTP and URLs on top of the internet) came from CERN in 1989–91. They are different layers about eight years apart. — [Wikipedia: Flag day](https://en.wikipedia.org/wiki/Flag_day_(computing)); [CERN: short history of the Web](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/)
- **"Apple invented the GUI".** The mouse, linked text and windowed shared screens were shown by Engelbart's team in 1968. The Alto's GUI OS was drafted at PARC around 1973, before Apple's GUI machines. — [Wikipedia: Mother of All Demos](https://en.wikipedia.org/wiki/The_Mother_of_All_Demos); [MIT News, 2014](https://news.mit.edu/2014/mit-professor-made-much-of-our-world-possible-0218)
- **"Metcalfe alone invented Ethernet".** The patent lists Metcalfe, Thacker, Lampson and Boggs. — [MIT News, 2014](https://news.mit.edu/2014/mit-professor-made-much-of-our-world-possible-0218)
- **"Public-key crypto was invented first in 1976".** GCHQ (Ellis, Cocks, Williamson) got there first, in secret. That stayed unknown until Dec 1997, so Diffie–Hellman and RSA are rightly the first *public* inventions. — [Wikipedia: Clifford Cocks](https://en.wikipedia.org/wiki/Clifford_Cocks)
- **"Diffie–Hellman is an encryption algorithm".** The 1976 paper proposed key exchange and the idea of public-key encryption and signatures, but no encryption and decryption algorithm. RSA (1977) supplied one. — [Purdue notes](https://www.cs.purdue.edu/homes/ssw/pk.pdf)
- **"ARPANET was built to survive a nuclear war".** That was Baran's RAND motive. ARPANET's own design came partly independently (Roberts reportedly designed it before reading Baran), and Davies's NPL work fed in separately. — [nethistory.info](https://nethistory.info/Archives/packets.html); [Internet Hall of Fame: Baran](https://www.internethalloffame.org/2012/09/06/what-do-h-bomb-and-internet-have-common-paul-baran/)
- **"DNS replaced HOSTS.TXT on a flag day".** In fact the two coexisted for years. — [Mockapetris & Dunlap 1988](https://www.cs.princeton.edu/courses/archive/fall08/cos561/papers/mockapetris88.pdf)
- **"GeForce 256 was the first graphics chip".** "First GPU" was a marketing definition, and earlier graphics chips existed. — [Digital Trends](https://www.digitaltrends.com/computing/best-nvidia-gpu-of-all-time/)
- **"Pong was the first video game".** Spacewar! (1962) and Computer Space (1971) came before it, and the Odyssey's table tennis came before Pong, which Magnavox's lawsuit relied on. — [Monnens & Goldberg](https://www.kinephanos.ca/Revue_files/2015_Monnens_Goldberg.pdf); [Wikipedia: Pong](https://en.wikipedia.org/wiki/Pong)
- **"JavaScript is related to Java".** The name was a marketing choice. The language was required to look like Java and went through the names Mocha and LiveScript first. — [Medium (secondary)](https://medium.com/@codemarch/history-of-javascript-6a90bcaa312a)
- **"Python is named after the snake".** It is named after Monty Python. — [LearnPython](https://learnpython.com/blog/history-of-python/)
- **"Linux is the whole OS" and "free software = open source".** GNU (1983) supplied much of the userland. "Open source" was a 1998 rebranding chosen to set it apart from "free software". — [Wikipedia: GNU Project](https://en.wikipedia.org/wiki/GNU_Project); [OSI history](https://opensource.org/20years)

### Inferences
- Credit in this era is almost always shared or independent (Baran and Davies, GCHQ and Stanford/MIT, the four Ethernet patentees, Hoff, Mazor, Faggin and Shima). A Tower Guide line saying "many people, several places, often at once" would be both accurate and a running theme.

### Gaps
- I did not source the claim that Apple's Lisa and Macintosh team visited PARC in 1979. It is commonly told but unverified here, so leave it out or verify it.
- The "first email" myth (that Tomlinson invented email itself, rather than network email) was not checked. Mail inside a single time-sharing machine (SNDMSG) predates his work, per [RFC 2235](https://www.ietf.org/ietf-ftp/rfc/fyi/fyi32.html).

## What is the accurate ordering, and where do things overlap?

### Takeaway
The era runs: packet-switching theory (1960–65), Engelbart (1968), ARPANET (1969), then network email, the microprocessor, Pong and the Alto (1971–73) in parallel, Codd (1970). Then TCP (1974), Altair and Homebrew (1975), Diffie–Hellman and the Apple I (1976), RSA and the 1977 PCs, SQL (1979), the IBM PC (1981), TCP/IP and DNS and GNU (1983), the Web (1989–91) alongside Python and Linux (1991), Mosaic and Netscape (1993–94), JavaScript (1995), PageRank and "open source" (1998), the GPU (1999), Git (2005), the cloud (2006), the iPhone (2007), Android (2008) and CUDA (about 2007).

### Cited Findings
| Year | Event | Source |
|---|---|---|
| 1961–64 | Baran's RAND distributed-communications work; *On Distributed Communications* (1964) | [Internet Hall of Fame](https://www.internethalloffame.org/2012/09/06/what-do-h-bomb-and-internet-have-common-paul-baran/) |
| mid-1960s | Davies coins "packet switching" at NPL | [nethistory.info](https://nethistory.info/Archives/packets.html) |
| 1962 | Spacewar! on PDP-1 (just before the era) | [Monnens & Goldberg](https://www.kinephanos.ca/Revue_files/2015_Monnens_Goldberg.pdf) |
| 9 Dec 1968 | Engelbart demo | [Wikipedia](https://en.wikipedia.org/wiki/The_Mother_of_All_Demos) |
| 29 Oct 1969 | First ARPANET message, "lo" | [Kleinrock/UCLA](https://www.lk.cs.ucla.edu/internet_first_words.html) |
| Jun 1970 | Codd's relational model | [Oracle docs](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/History-of-SQL.html) |
| 1971 | Tomlinson's network email | [RFC 2235](https://www.ietf.org/ietf-ftp/rfc/fyi/fyi32.html) |
| 15 Nov 1971 | Intel 4004 launch | [Wikipedia](https://en.wikipedia.org/wiki/Intel_4004) |
| May–Aug 1972 | Odyssey demo seen by Bushnell; Pong prototype placed in a bar | [Wikipedia: Pong](https://en.wikipedia.org/wiki/Pong) |
| late 1972–Apr 1973 | Alto designed and first running | [Wikipedia: Alto](https://en.wikipedia.org/wiki/Xerox_Alto) |
| 1974 | Cerf & Kahn TCP paper; SEQUEL paper | [RFC 2235](https://www.ietf.org/ietf-ftp/rfc/fyi/fyi32.html); [Oracle docs](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/History-of-SQL.html) |
| Jan / Mar 1975 | Altair cover / Homebrew first meeting | [RF Cafe](https://rfcafe.com/references/popular-electronics/altair-8800-minicomputer-popular-electronics-january-1975.htm); [HNF](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html) |
| Jul 1976 | Apple I on sale | [HNF](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html) |
| Nov 1976 | Diffie–Hellman paper | [Purdue](https://www.cs.purdue.edu/homes/ssw/pk.pdf) |
| Apr / Aug 1977 | RSA memo / Gardner column; Apple II, PET, TRS-80 | [Purdue](https://www.cs.purdue.edu/homes/ssw/pk.pdf); [HNF](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html) |
| 1979 | First commercial SQL (Relational Software/Oracle) | [Oracle docs](https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/History-of-SQL.html) |
| 1981 | IBM PC 5150; RFC 801 transition plan (Nov) | [HNF](https://hnf.de/en/permanent-exhibition/exhibition-areas/computers-for-everyone-1980-to-2000/the-birth-of-the-pc-from-the-garage-to-the-big-wide-world.html); [Wikipedia: Flag day](https://en.wikipedia.org/wiki/Flag_day_(computing)) |
| 1 Jan 1983 | NCP to TCP/IP flag day | [Wikipedia: Flag day](https://en.wikipedia.org/wiki/Flag_day_(computing)) |
| 1983 | DNS RFCs 882/883 | [ACM](https://awards.acm.org/award-recipients/mockapetris_3342151) |
| 27 Sep 1983 | GNU announced | [Network World](https://www.networkworld.com/article/680418/software-39-free-unix9the-world-changing-proclamation-made-30-years-ago-today.html) |
| 1987 | DNS RFCs 1034/1035 | [ACM](https://awards.acm.org/award-recipients/mockapetris_3342151) |
| Mar 1989 / Nov 1990 / Xmas 1990 | Web proposal / Cailliau proposal / first browser and server | [CERN](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/) |
| Dec 1989 / Feb 1991 | Python begun / 0.9.0 | [LearnPython](https://learnpython.com/blog/history-of-python/) |
| 25 Aug 1991 | Linux announced | [Wikipedia: History of Linux](https://en.wikipedia.org/wiki/History_of_Linux) |
| 23 Jan 1993 | Mosaic 0.5 | [Wikipedia: Mosaic](https://en.wikipedia.org/wiki/NCSA_Mosaic) |
| 30 Apr 1993 | Web software placed in public domain | [CERN](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/) |
| Nov–Dec 1994 | Netscape Navigator beta / 1.0 | [Wikipedia: Mosaic](https://en.wikipedia.org/wiki/NCSA_Mosaic) |
| May–Dec 1995 | JavaScript prototype, then the name | [DEV](https://dev.to/devpedrofurquim/the-history-of-the-javascript-language-99b) |
| 18 Dec 1997 | GCHQ public-key history revealed | [Wikipedia: Cocks](https://en.wikipedia.org/wiki/Clifford_Cocks) |
| Feb 1998 / 1998 | "Open source" coined; PageRank paper | [OSI](https://opensource.org/20years); [Google Research](https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/) |
| 1999 | GeForce 256 "first GPU" | [Wikipedia](https://en.wikipedia.org/wiki/GeForce_256) |
| Apr 2005 | Git begun | [Pro Git](https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git) |
| Mar / Aug 2006 | S3 / EC2 beta | [AWS blog](https://aws.amazon.com/blogs/aws/aws-blog-the-first-five-years/) |
| 9 Jan / 29 Jun 2007 | iPhone announced / on sale | [weak source](https://openpension.ctdata.org/release-date-of-the-first-iphone) |
| ~2007 | CUDA | [Analytics India Mag](https://analyticsindiamag.com/nvidia-completes-29-years-a-lookback/) |
| Nov 2007 / 22 Oct 2008 | Open Handset Alliance / T-Mobile G1 | [Galaxus](https://www.galaxus.de/en/page/15-years-of-android-time-for-a-throwback-29956); [PhoneArena](https://www.phonearena.com/news/The-Android-Revolution-started-3-years-ago-Friday-with-the-introduction-of-the-T-Mobile-G1_id22400) |

### Inferences
- These events overlap in time:
  - 1971–73 has the network (email), the chip (4004), games (Pong) and PARC (Alto) all at once.
  - 1989–91 has the Web, Python and Linux in the same two years.
  - 1976–77 has public-key crypto and the Apple I/II together.
- A strictly linear Tower would split these clusters across floors. Boss Floors could cover a "year" that combines two strands, for example 1983's TCP/IP plus DNS plus GNU.
- The secret GCHQ work (around 1970–74) sits before Diffie–Hellman in time but was revealed only in 1997. A floor could use this as a "sealed vault" that unlocks later in the Tower.

### Gaps
- **Living status, from my own knowledge and NOT sourced in this session.** Treat all of these as "use homage characters" anyway, and verify before publishing any memorial text.
  - **Believed deceased:** Engelbart (2013), Bill English (2020, [sourced via Gizmodo](https://gizmodo.com/william-english-co-creator-of-the-computer-mouse-dies-1844591387)), Baran (2011), Davies (2000), Codd (2003), Tomlinson (2016), Postel (1998), Thacker (2017), Bob Taylor (2017), Larry Roberts (2018), Ed Roberts of MITS (2010), Steve Jobs (2011), Ralph Baer (2014), James Ellis (1997, [sourced](https://en.wikipedia.org/wiki/Clifford_Cocks)), Gordon Moore (2023), Larry Tesler (2020), David Boggs (2022).
  - **Believed living:** Kay, Lampson, Metcalfe, Hoff, Faggin, Shima, Wozniak, Cerf, Kahn, Kleinrock, Mockapetris, Berners-Lee, Cailliau, Andreessen, Bina, Eich, van Rossum, Stallman, Torvalds, Peterson, Diffie, Hellman, Merkle, Rivest, Shamir, Adleman, Cocks, Brin, Page, Bushnell, Alcorn, Steve Russell, Chamberlin, Jensen Huang.
- Mazor's and Hoff's exact roles in the 8080, and the 8080's date, were not confirmed.
- I found no sources for internet "firsts" between 1983 and 1989 (NSFNET), which may matter for floor ordering.
