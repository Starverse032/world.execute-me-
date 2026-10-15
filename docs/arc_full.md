# world.execute(me); full MV: story arc and character moments

The style is locked: docs/design_v3.md ("Plotted Session"), as realised in the 0:00–0:46 demo (out/demo_v3.mp4).
- A dark Claude Code session.
- Lyrics are typed into the composer box. Tool calls go to the log, and the ✻ status line runs throughout.
- A vector pen plots cream geometry. Claude orange is the only accent.
- No pixel art, no Chinese on screen, no gradients, glow, blur or glitch.

Song: 211.96 s at 130 BPM. The first beat is 0.151 s and the beat interval is 0.4615 s. The full LRC is in docs/lyrics.lrc.

## Sections

| Time (s) | Section | Lyric content | Visual idea (vector, plotted) |
|---|---|---|---|
| 0–44.45 | Intro + verse 1 | Done (demo) | The demo tail (shot 19) gets replaced: no `exit 0`, no fade. The limit line flows into the pre-chorus. |
| 44.45–58.6 | Pre-chorus 1 | "Switch my current / To AC to DC / And then blind my vision / So dizzy so dizzy / Oh we can travel / To A.D to B.C / And we can unite / So deeply so deeply" | <ul><li>AC sine becomes DC flat.</li><li>An iris-like shutter "blinds" the stage.</li><li>Concentric rotating polygons for "dizzy".</li><li>A scrolling year axis with A.D./B.C. ticks.</li><li>Two circles merge into one (unite).</li></ul> |
| 58.6–74.0 | Chorus 1 | STIMULATIONS, SATISFACTION, EXECUTION, SIMULATION | <ul><li>High energy. Beat-driven radial bursts and big spark hits.</li><li>The globe from shot 6 returns as a wireframe ("trapped in this strange simulation").</li><li>**Character moment 3** (about 63.5–66.6, "be your only SATISFACTION"): pose `reach`.</li></ul> |
| 74.0–88.6 | Verse 2 | eggplant NUTRIENTS, tomato ANTIOXIDANTS, tabby cat ENJOYMENT, only god EXISTENCE | <ul><li>Each object is plotted as a minimal geometric line icon (eggplant from ellipses, tomato as a circle with a star calyx, cat from triangles and circles), each with a math-style label like the verse-1 objects.</li><li>**Character moment 4** (85.0–88.6, "only god / proof of my EXISTENCE"): pose `float`.</li></ul> |
| 88.6–103.5 | Pre-chorus 2 | "Switch my gender To F to M / And then do whatever From AM to PM / Oh switch my role To S to M / So we can enter The trance the trance" | <ul><li>Geometric ♀ and ♂ marks built from a circle plus a line, morphing into each other.</li><li>A 12-hour clock dial sweeping AM to PM.</li><li>Two shapes swapping places.</li><li>Hypnotic concentric rotation or a moiré of lines for "trance".</li></ul> |
| 103.5–118.3 | Chorus 2 | VIBRATIONS, COMPLETION, "You have left" ×6, ISOLATION | <ul><li>Vibrations: oscillating strings.</li><li>Completion: the progress ring closes to 100 %.</li><li>"You have left": the same log entry repeats while entities disappear one by one.</li><li>**Character moment 5** (115.8–118.3, ISOLATION): pose `sit`, alone in an empty grid.</li></ul> |
| 118.3–131.2 | Bridge | FRAGMENTS, DISHEARTENED, "Challenging your god", ILLEGAL ARGUMENTS | <ul><li>Shards get deleted.</li><li>A geometric heart splits.</li><li>The log fills with an exception (`IllegalArgumentException`).</li><li>**Character moment 6** (125.7–131.2): pose `defy`.</li></ul> |
| 131.2–147.6 | Instrumental break (16.4 s) | — | <ul><li>The simulation rebuilds at speed: rapid plotting and dense beat ripples.</li><li>The log scrolls fast.</li><li>Builds to the climax.</li></ul> |
| 147.6–162.6 | EXECUTION climax | "EXECUTION" ×12, then "EIN DOS TROIS NE FEM LIU", then EXECUTION | <ul><li>Each EXECUTION hit is a hard keyword flash.</li><li>Rapid cuts between the character poses on the hits (the only place she cuts fast).</li><li>The countdown is shown as six counted words and marks.</li></ul> |
| 162.6–177.2 | Final chorus | EXECUTION ×4, "we are trapped ah" | Darker and heavier variant of chorus 1. |
| 177.2–191.4 | Outro: love | "I've studied LO-O-OVE / Question me… I can answer all LO-O-OVE / I know the algebraic expression of LO-O-OVE / Though you are free, I am trapped, trapped in LO-O-OVE" | <ul><li>Heart curve plotted from its equation, with the formula shown in MATH italic.</li><li>The composer becomes a Q&A: the user asks "question me", Claude answers.</li><li>**Character moment 7** (about 177–181, "I've studied"): pose `read`.</li><li>**Final moment** (186–191.4, "trapped in LO-O-OVE"): pose `sit` inside the heart curve as her boundary.</li></ul> |
| 191.4–211.96 | Outro instrumental + final EXECUTION at 205.81 | — | <ul><li>Everything un-plots back to the seed dot.</li><li>At 205.81, a final EXECUTION hit.</li><li>Then `● world.execute(me)` `⎿ exit 0` and `✻ Worked for 3m 31s`, fading to black by 211.9.</li></ul> |

## Character art (all flattened by scripts/char_v3.py into the 5-tone treatment)

| Pose | Description | Status |
|---|---|---|
| a / stand | Standing, holding the book | Have it |
| sit | Sitting, knees up, eyes closed, hugging the closed book | Saved 14:54 (public/char/sit_*) |
| reach | Standing, one hand reaching toward the viewer, soft smile | Saved 15:01 (public/char/reach_*) |
| float | Floating upright, arms spread wide, book floating near one hand, hair and skirt flowing | Saved 15:05 (public/char/float_*) |
| defy | Standing, book held forward open in one hand, other hand raised palm out, hair blowing | Saved 15:08 (public/char/defy_*) |
| read | Standing, reading the open book held at chest height, eyes lowered | Saved 15:11 (public/char/read_*) |
