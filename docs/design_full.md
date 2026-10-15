# world.execute(me); full MV, 0:44.452–3:31.96: consolidated shot spec ("Plotted Session")

This document continues `docs/design_v3.md` (the style bible and the 0:00–0:46 demo spec) and replaces `docs/design_A.md`, `docs/design_B.md` and the section-C draft. It is the single source of truth for 44.452–211.96 s.

All of these carry over unchanged from design_v3:
- tokens §2.1, type §2.2, line weights §2.3, zones §2.4, motion rules §2.5, forbidden list §2.6;
- the persistent-UI components §3 (composer, typing rule, send pulse, stage keyword, log zone, status line, header).

Nothing in this document adds a colour, a font, a glyph typed as text, or an effect.

## 0. Conventions and global data

### 0.1 Conventions

- **Times and beats**
  - Times are in seconds, and `f` = round(30·t).
  - Beat n is at `b_n = 0.151 + 0.4615·n` (exactly `0.151 + 60/130·n`). `*` or **D** marks a downbeat (n % 4 = 0).
- **Stage centres**
  - `C = (960, 390)`: the stage centre in the lyric layout.
  - `D = (960, 430)`: the stage centre in the instrumental and climax layout (no composer; stage y 110–800).
- **Drawing verbs**
  - **Plot**: dash-offset draw-on with a pen head at the tip.
  - **Un-plot**: reverse draw.
  - **Lift-fade**: rise 14 px and fade over 5 frames.
- **Pen dots**
  - The **seed / pen dot** is an orange pen head (r 4 filled, plus a 1 px orange ring r 9 at 45 %) that pulses `1 + 0.5·env` on every beat.
  - Transient pen heads drawn by `Plot` at stroke tips are separate elements.
- **env**: `env(x) = exp(−x/0.12)`.
- **Speed**: every move stays at or under about 600 px/s, unless it is listed in Build notes §G.4.

### 0.2 Merge log: what changed relative to the three drafts

| # | Issue | Resolution |
|---|---|---|
| 1 | The drafts disagreed on assets. A asked to generate `reach` and `float`, B asked to generate `defy`, and C said they all exist. | All six poses already exist, processed by `scripts/char_v3.py` in `public/char/` (`a` 938×1680; `sit`, `reach`, `float`, `defy`, `read` 1120×1680; each has `_flat`, `_lines`, `_alpha` and `_points.json`). **No generation is needed for this spec.** GPT image generation is kept only as the fallback when a pose fails QA (Build plan §P.5). |
| 2 | `defy` orientation | The art has the open book on the viewer's left and the raised open palm on the viewer's right. B's "mirrored" layout is therefore **the** layout: spark at (1280, 390), her box x 500–860. This matches `b.data.ts`. |
| 3 | Moment 3 (`reach`) fit rule | A's rule put head-top at 130 and waist at 690, which pushes the palm (ny ≈ 0.33) below the frame. The new rule is head-top → y 130 and palm → y 560. The art reveal also starts one beat later (b137, 63.382), which matches arc_full's "about 63.5". |
| 4 | EXISTENCE (KW-low, baseline 790) collided with the log zone returning at 88.305 | EXISTENCE `kwOut` = 88.220, so it is gone by f2653. The log fades back in over f2653–f2658. Log #A19 moves from 88.305 to 88.433. |
| 5 | Status verb at the 88.60 hand-over | `Switching…` (B's verb starts at 88.587), not `Existing…`. |
| 6 | `cont` field (A) vs separate short lines (B) | Continuation is already implemented by `buildAuto` as `marks`. A short line extended by the next LRC line within 1.2 s does not clear; typing resumes after the prefix, with one send at the end. The 10 merged pairs are listed in §0.3. In B8, "You have left me in" continues the 114.920 line. |
| 7 | ILLEGAL ARGUMENTS size | C's version: 120 px between the argument brackets (B's 147 px is dropped). `kwOut` is 132.333 (auto), not 132.424. |
| 8 | Demo tail | `FullMV` unmounts `Verse` from `AUTO_FROM` = 44.452. Section A therefore redraws the shot-18 end state itself on f1334, and `Verse.tsx` needs no edits. The demo's `exit 0` log, `Worked for 46s` and global fade are already gone in `FullMV`. |
| 9 | C log jumped anchors mid-display at 133.063 | The log zone hides with the composer at 133.063 and fades back in at the instrumental anchor at 133.300. `Write(pieces.ts)` moves to 133.300. The same pattern is used at 162.25 / 162.632. |
| 10 | C18 kept her point silhouette to 193.98, past the listed final moment (ends 191.4) | From 191.40 her points flow into a uniform heart fill (done 192.135). After that they read as "love" data, not as her. |
| 11 | C keyword exits | Recomputed with the code rule `kwOut = max(kwT + 4f, min(out − 0.20, kwT + 1.10))`. "Trapped in LO-O-OVE" exits at 192.467, not 192.556. |
| 12 | Final fade numbers | The fade runs 210.00–211.60 linear and the spark fades 211.00–211.90. At f6330 the remainder is about 37 % (C's 18 % is dropped). |
| 13 | Missing coverage | "Trapped in" (190.801) typing was not specified; it is added to C17. Every LRC line from 44.452 on is indexed in §0.3. |
| 14 | Overlap of the stage keyword with the persistent UI | KW-low (baseline 790) is only used while the log zone is hidden: 62.920–66.613 and 85.074–88.420. |
| 15 | Character windows | Each is checked against arc_full in §D. Derived point clouds count as the character and stay inside the windows (fix 10). |

### 0.3 Lyric index, 44.452–211.96 (every LRC line, its composer line, its keyword frame and its shot)

- **Composer line rule.** One composer line per LRC line. Lines joined with `+` are one composer line (continuation `marks`). An ALL-CAPS entry is the keyword of the line before it.
- **Exits.**
  - `out` = the next line's start, or last event + 2.0 s when the gap is longer than 3.2 s.
  - `kwOut` = `max(kwT + 4f, min(out − 0.20, kwT + 1.10))`, unless patched.
- **Stage keyword** visible from kwT to kwOut + 6 f. Keyword `kwT` is snapped to the frame.
- **Style**: blank = standard (§3 of design_v3: centred at C, size `min(200, floor(1500/(0.6·chars)))`).
  - `spark` = KW-spark (§0.4).
  - `low`, `low-spark` = KW-low (§0.4).
  - `x/y/size` are patches.

| LRC t | Composer line | Keyword (frame) | kwOut | Style / patch | Shot |
|---|---|---|---|---|---|
| 44.452 | Switch my current | | | | A19 |
| 45.850 | To AC to DC | | | | A20 |
| 47.672 | And then blind my vision | | | | A21 |
| 49.534 | So dizzy so dizzy | | | | A22 |
| 51.363 | Oh we can travel | | | | A23 |
| 53.225 | To A.D to B.C | | | | A23 |
| 55.083 | And we can unite | | | | A24 |
| 56.916 | So deeply so deeply | | | | A24 |
| 59.223 + 59.687 | If I can + If I can give you all the | STIMULATIONS f1859 | 62.389 | `spark` | A25 |
| 62.589 + 63.535 | Then I can + Then I can be your only | SATISFACTION f1962 | 66.401 | `low-spark` | A26 (moment 3) |
| 66.601 | If I can make you happy | | | | A27 |
| 68.252 | I will run the | EXECUTION f2078 | 69.884 | `spark` | A27 |
| 70.084 | Though we are trapped | | | | A28 |
| 71.764 | In this strange strange | SIMULATION f2195 | 73.845 | `spark` | A28 |
| 74.045 | If I’m an eggplant | | | | A29 |
| 75.422 | Then I will give you my | NUTRIENTS f2309 | 77.376 | | A29 |
| 77.576 | If I’m a tomato | | | | A30 |
| 79.226 | Then I will give you | ANTIOXIDANTS f2419 | 81.151 | | A30 |
| 81.351 | If I’m a tabby cat | | | | A31 |
| 82.833 | Then I will purr for your | ENJOYMENT f2528 | 84.878 | | A31 |
| 85.078 | If I’m the only god | | | | A32 (moment 4) |
| 86.538 | Then you’re the proof of my | EXISTENCE f2638 | **88.220** | `low`, patch kwOut | A32 (moment 4) |
| 88.587 | Switch my gender | | | | B1 |
| 90.197 | To F to M | | | | B1 |
| 92.015 | And then do whatever | | | | B2 |
| 93.953 | From AM to PM | | | | B2 |
| 95.465 | Oh switch my role | | | | B3 |
| 97.739 | To S to M | | | | B3 |
| 99.349 | So we can enter | | | | B4 |
| 101.474 | The trance the trance | | | | B4 |
| 103.489 + 104.197 | If I can + If I can feel your | VIBRATIONS f3189 | 107.020 | | B5 |
| 107.220 + 107.903 | Then I can + Then I can finally be | COMPLETION f3307 | 110.700 | | B6 |
| 110.900 | Though you have left | | | | B7 |
| 112.220 | You have left | | | | B7 |
| 113.100 | You have left | | | | B7 |
| 114.180 | You have left | | | | B7 |
| 114.920 + 115.780 | You have left + You have left me in | ISOLATION f3518 | 118.133 | | B7–B8 (moment 5) |
| 118.333 + 118.979 | If I can + If I can erase all the pointless | FRAGMENTS f3626 | 121.528 | | B9 |
| 121.728 + 122.714 | Then maybe + Then maybe you won’t leave me so | DISHEARTENED f3747 | 125.508 | | B10 |
| 125.708 | Challenging your god | | | | B11 (moment 6) |
| 128.661 | You have made some | ILLEGAL ARGUMENTS f3937 | 132.333 | size 120, out 132.90 | B12 / C1 |
| 147.660 … 158.000 | (keyword-only lines) | EXECUTION ×12: f4430 4458 4486 4516 4546 4568 4595 4619 4656 4682 4711 4740 | next − 0.20 | size 150, y 430, x per C6 | C6 (climax) |
| 158.900 … 161.124 | (keyword-only) | EIN f4767 · DOS f4780 · TROIS f4790 · NE f4807 · FEM f4821 · LIU f4834 | 159.121 · 159.467 · 160.044 · 160.493 · 160.924 · 161.384 | x 960, y 430 | C7 |
| 161.584 | (keyword-only) | EXECUTION f4848 | 162.432 | y 430 | C8 |
| 162.632 + 163.315 | If I can + If I can give them all the | EXECUTION f4955 | 165.816 | | C9 |
| 166.016 + 167.022 | Then I can + Then I can be your only | EXECUTION f5067 | 169.624 | | C10 |
| 169.824 | If I can have you back | | | | C11 |
| 171.868 | I will run the | EXECUTION f5181 | 173.443 | | C12 |
| 173.643 | Though we are trapped | | | | C13 |
| 174.975 | We are trapped ah | | | | C13 |
| 177.246 | I’ve studied | LO-O-OVE f5398 | 180.657 | x 560, size 160 | C14 (moment 7) |
| 180.857 + 181.901 | Question me + Question me I can answer all | LO-O-OVE f5509 | 184.340 | x 1240, size 170 | C15 |
| 184.540 | I know the algebraic expression of | LO-O-OVE f5630 | 188.283 | x 560, size 160 | C16 |
| 188.483 | Though you are free | | | | C17 (final moment) |
| 189.746 | I am trapped | | | | C17 |
| 190.801 | Trapped in | LO-O-OVE f5741 | 192.467 | x 560, size 160; line out 193.356 (auto gap rule) | C17–C18 |
| 205.811 | (keyword-only) | EXECUTION f6174 | 206.880 | patch out 207.08, kwOut 206.88 | C22 |

**Sync-test frames** (debug overlay flashes on these):
- Keyword frames: 1859, 1962, 2078, 2195, 2309, 2419, 2528, 2638, 3189, 3307, 3518, 3626, 3747, 3937, 4430, 4458, 4486, 4516, 4546, 4568, 4595, 4619, 4656, 4682, 4711, 4740, 4767, 4780, 4790, 4807, 4821, 4834, 4848, 4955, 5067, 5181, 5398, 5509, 5630, 5741, 6174.
- Events: f1472 (shutter closed), f1625 (B.C hop), f2760 (Mars lands), f2857 (PM), f3473 (last node leaves), f3935 (iris closed), f6212 (audio stops, `exit 0`).

### 0.4 Stage keyword variants (shared by all sections)

The variants are implemented in `ui.tsx` (`kwStyle`):

- **Standard**: §3 of design_v3.
  - Centred at (x, y) = (kwX ?? 960, kwY ?? 390), size from the patch or the auto rule.
  - Baseline at `y + 0.36·size`; underline 3 px at baseline + 28·size/200.
  - A `bg` knockout stroke behind the glyphs keeps the word readable.
  - Stage geometry dims to 60 % (`stageDim`). Character layers are never dimmed: they live in `SectionXChar`, outside the dimmed Stage group.
- **KW-spark** (chorus 1: STIMULATIONS, EXECUTION f2078, SIMULATION): reads `✻ KEYWORD`, a rhyme with the status line.
  - Size 200. A filled orange spark, R 84, sits left of the word with a 36 px gap. The group is centred on x 960, so the spark centre is at `x = 942 − w/2`, where `w = 120·chars`.
  - Spark centres: STIMULATIONS (222, 390), word 342–1782; EXECUTION (402, 390), word 522–1602; SIMULATION (342, 390), word 462–1662.
  - The spark blooms on f0 (rays grow from the hub, 0.5-frame stagger, easeOutExpo). It stays filled while the word goes to outline. It rotates 8°/s plus a 15° step each beat, and exits with the word.
  - Hit extras: a double grid ripple from C (f0 and f0 + 3), added automatically for `spark` keywords.
- **KW-low** (character moments: SATISFACTION as `low-spark`, EXISTENCE as `low`):
  - Size 120, baseline y 790, underline at 807. It sits in the log band, which is hidden during both moments; cap top ≈ 702.
  - EXISTENCE: centred x 960 (636–1284).
  - SATISFACTION: spark R 50 at (517, 747), gap 22, word centred x 1021 (589–1453).

---

# Section A: 44.452–88.60 s (f1334–f2657). Pre-chorus 1, chorus 1, verse 2

## A.0 Section data (`sections/a.data.ts`)

### A.0.1 Downbeats

| Downbeat | t | Frame |
|---|---|---|
| b96 | 44.459 | f1334 |
| b100 | 46.305 | f1389 |
| b104 | 48.151 | f1445 |
| b108 | 49.997 | f1500 |
| b112 | 51.843 | f1555 |
| b116 | 53.689 | f1611 |
| b120 | 55.536 | f1666 |
| b124 | 57.382 | f1721 |
| b128 | 59.228 | f1777 |
| b132 | 61.074 | f1832 |
| b136 | 62.920 | f1888 |
| b140 | 64.766 | f1943 |
| b144 | 66.613 | f1998 |
| b148 | 68.459 | f2054 |
| b152 | 70.305 | f2109 |
| b156 | 72.151 | f2165 |
| b160 | 73.997 | f2220 |
| b164 | 75.843 | f2275 |
| b168 | 77.689 | f2331 |
| b172 | 79.536 | f2386 |
| b176 | 81.382 | f2441 |
| b180 | 83.228 | f2497 |
| b184 | 85.074 | f2552 |
| b188 | 86.920 | f2608 |

The next downbeat is b192 at 88.766 (Section B).

### A.0.2 Line patches

| Key | Patch |
|---|---|
| `'59.223'` | `kwStyle: 'spark'` |
| `'62.589'` | `kwStyle: 'low-spark'` |
| `'68.252'` | `kwStyle: 'spark'` |
| `'71.764'` | `kwStyle: 'spark'` |
| `'86.538'` | `kwStyle: 'low', kwOut: 88.220` |

**Send pulses** (automatic):
- On every keyword hit.
- At the end of every non-keyword composer line: 45.850, 47.672, 49.534, 51.363, 53.225, 55.083, 56.916, 59.223, 68.252, 71.764, 75.422, 79.226, 82.833, 86.538.
- Continuations send once, at the end.

### A.0.3 Log entries

The call types at `t` and the result appears at `rt` (snapped).

| # | t | Call | rt | Result |
|---|---|---|---|---|
| A1 | 44.470 | `Bash(git switch current)` | 45.382 | `Switched to branch 'current'` |
| A2 | 45.900 | `Bash(rectify --full-wave)` | 47.228 | `DC · ripple 0%` |
| A3 | 47.700 | `Edit(eyes.css)` | 49.074 | `visibility: hidden` |
| A4 | 49.560 | `Bash(watch -n 0.1 spin)` | 50.459 | `dizzy, dizzy` |
| A5 | 51.400 | `Bash(travel --to "1 B.C")` | 54.151 | `no year 0 · skipped` |
| A6 | 55.100 | `Bash(git merge you)` | 56.920 | `Merged · 0 conflicts` (paid off by B11's `CONFLICT`) |
| A7 | 56.950 | `Bash(cd deeper/deeper/deeper)` | 58.766 | `depth 6` |
| A8 | 59.700 | `Bash(send stimuli/* --to you)` | 61.958 | `16 sent · 16 received` |
| — | | *Log zone hidden 62.920–66.613 (moment 3)* | | |
| A9 | 66.650 | `Bash(if happy(you); then ./run.sh; fi)` | 67.997 | `true` |
| A10 | 68.270 | `Bash(./run.sh --execution)` | 69.259 | `running · pid 1` |
| A11 | 70.100 | `Bash(exit)` | 71.228 | `exit: not permitted in simulation` |
| A12 | 71.780 | `Bash(simulate ./world)` | 73.169 | `running · 2 entities` |
| A13 | 74.070 | `Write(eggplant.svg)` | 75.382 | `2 ellipses · 1 star` |
| A14 | 75.450 | `Read(usda/eggplant.json)` | 76.959 | `25 kcal · 3 fields` |
| A15 | 77.600 | `Bash(mv eggplant.svg tomato.svg)` | 78.151 | `renamed · r = 130` |
| A16 | 79.250 | `Search(pattern: "free radical")` | 80.620 | `Found 12 · 12 neutralized` |
| A17 | 81.370 | `Write(cat.svg)` | 82.766 | `3 triangles · 1 circle · 1 M` |
| A18 | 82.850 | `Bash(purr --freq 25Hz)` | 84.268 | `purring for you` |
| — | | *Log zone hidden 85.074–88.420 (moment 4)* | | |
| A19 | **88.433** | `Bash(assert exists(me))` | 88.536 | `passed · 1 witness` |

### A.0.4 Status verbs

`N = floor(t − 13.89)`, which runs from 30 s to 74 s.

| From | Verb |
|---|---|
| 44.452 | Switching… |
| 45.850 | Alternating… |
| 47.672 | Blinking… |
| 49.534 | Spinning… |
| 51.363 | Traveling… |
| 55.083 | Merging… |
| 59.223 | Stimulating… |
| 62.589 | Reaching… |
| 66.601 | Pleasing… |
| 68.252 | Executing… |
| 70.084 | Simulating… |
| 74.045 | Cooking… |
| 77.576 | Ripening… |
| 81.351 | Purring… |
| 85.078 | Existing… |

### A.0.5 UI segments

Every segment uses the lyric layout: composer shown; log at (240, 772) unless noted; status `lyric`; HUD full. All ripple centres are C. A segment's `from` must be at or before the first beat it includes.

| from | Log | Ripple | Note |
|---|---|---|---|
| 44.452 | shown | every 2 beats | b96, b98 … b110 |
| 51.370 | shown | every beat | |
| 56.900 | shown | every beat + off-beat eighths (`half`) | Spark keywords add a double ripple automatically |
| 62.900 | **null** (lift-fade f1888–f1892) | every 4 beats | b136, b140 |
| 66.600 | shown (6-frame fade-in, shows A8 as current, A9 pushes at 66.650) | every beat + half | |
| 73.980 | shown | every 2 beats | |
| 85.060 | **null** (lift-fade f2552–f2556) | every 4 beats | b184, b188 |
| 88.420 | shown (fades in f2653–f2658, A18 as the previous entry at 40 %; A19 pushes at 88.433) | every 4 beats | No beat falls before 88.60 |

**Beat-pulse rule.** The seed or pen head always pulses `1 + 0.5·env`. Each shot also names one **beat accent** of its own, so the beat is always visible on stage.

---

## A.1 Shot list

### Shot A19: 44.452–45.850 (f1334–f1375) "Switch my current"

The limit reaches its limit, and that limit becomes the shot-1 power line.

**f1334, state redrawn by Section A** (Verse is unmounted from here):
- Axis y 620, x 360–1560, 1 px cream 45 %, with a 10 px arrowhead at 1560.
- Asymptote y 220, x 360–1560, solid 2 px orange.
- Limit curve, 2 px cream, from (360, 620) to (1368, 226).
- `L` (STIX italic 40) right-aligned at (340, 234).
- `limit = L` (creamDim 22) right-aligned at (1560, 200).
- Pen head at (1368, 226).
- Stage dim recovering 60 → 100 % over f1334–f1342 (LIMITATIONS left at f1333).

**f1334 onward:**
- The lyric types. 44.470: log A1.
- The labels lift-fade.
- The axis un-plots from its arrow end leftwards (8 frames, easeInOutCubic); its arrowhead fades over 4 frames.

**44.459 (b96) → 44.920 (b97), the curve reaches its limit:**
- `y(x) = 220 + 400·e^(−(x−360)/240)·(1 − m)`, m 0 → 1, easeInOutCubic. The pen rides the tip (1368, 226) → (1368, 220).
- 44.80–44.92: the cream curve, now lying on the line, fades out linearly.
- Over the same window the orange line extends both ends to x 120 and x 1800 (easeInOutCubic), with temporary pen heads at both ends.

**44.920 (b97) → 45.382 (b98):**
- The line glides y 220 → 390 (easeInOutCubic, average 368 px/s).
- It cross-fades from 2 px orange to 1.5 px cream 70 %: this is shot 1's power line.
- The pen rides to (1368, 390).

**Knife switch:**
- From 44.920, segment x 1248–1368 becomes a 2 px cream lever hinged at (1248, y_line). It rotates 0° → −30° (upward) over 6 frames, easeOutExpo.
- Hinge contact: circle r 5, 1.5 px cream. The pen head is the right contact at (1368, 390).

**45.382 (b98):** the lever snaps −30° → 0° in 4 frames (easeInCubic), landing on f1365. It flashes 3 px orange for 3 frames. Log A1 result.

**f1365–45.843, current:** 3 px orange dashes (dash 24, gap 96) flow left to right along the whole line at 240 px/s, as a dash-offset over the cream line.

**Beat accent:** the hinge contact pulses r 5 → 5 + 2.5·env.

### Shot A20: 45.850–47.672 (f1376–f1429) "To AC to DC"

- **45.843 (b99):**
  - The lever and hinge un-plot into the line (6 frames). The dashes fade over 6 frames.
  - 45.850: the lyric types. 45.900: log A2.
- **46.305 (b100*) → 46.766, AC:**
  - `y = 390 − A·cos(2π((x − 1368)/240 − (t − 46.305)/0.4615))`, sampled every 4 px over x 120–1800.
  - A ramps 0 → 90, easeInOutCubic.
  - Phase velocity is 520 px/s, so a crest passes the probe on **every beat**. This is the beat accent.
- **Probe:**
  - The pen stays at x 1368 and rides `y(1368, t)`.
  - Readout `V = +0.81` (16 px creamDim) at (1388, pen.y − 18). V = (390 − y)/90, signed, 2 decimals.
- **Labels at 46.305:**
  - `AC`: mono 22, cream 70 %, left-aligned at (120, 250), types in 3 frames.
  - `V = A cos ωt`: STIX italic 30, cream 70 %, right-aligned at (1800, 250), types in 5 frames.
- **46.766 (b101, f1403), full-wave rectify:**
  - `y = 390 − A·lerp(c, |c|, m)`, m 0 → 1 over 6 frames, easeInOutCubic.
  - The math label retypes to `V = A |cos ωt|`.
- **47.228 (b102, f1417), DC:**
  - `y = 390 − A·lerp(|c|, 2/π, s)`, s 0 → 1 over 8 frames, easeInOutCubic. The result is flat at y 332.7.
  - `AC` retypes to `DC`. The math label retypes to `V = 2A/π`.
  - Dashed reference line at y 390: 1 px cream 45 %, dash 6/6, x 120–1800.
  - Dimension marker at x 1500: a 1 px cream 45 % vertical from 390 to 333 with 8 px end ticks.
  - The readout settles at `V = +0.64`. Log A2 result.

### Shot A21: 47.672–49.534 (f1430–f1485) "And then blind my vision"

- **47.672:** the lyric types. 47.700: log A3.
- **47.689 (b103) → 48.151:**
  - Labels lift-fade. The reference line and marker un-plot (6 frames).
  - The DC line glides y 332.7 → 390 and contracts to x 640–1280 (easeInOutCubic). The pen rides its right end to (1280, 390).
- **48.151 (b104*, f1445), the eye opens:**
  - Two quadratic lids, `M 640 390 Q 960 (390 ∓ 2h) 1280 390`.
  - h 0 → 110 over 8 frames, easeInOutCubic. 1.5 px cream.
- **48.381 (f1451):** iris circle r 80 at C, plotted from 12 o'clock in 6 frames, 1.5 px cream.
- **48.613 (b105, f1458):**
  - Pupil: an orange filled circle r 26, scaling in over 4 frames (easeOutExpo).
  - A 1 px cream 45 % ring at r 40.
  - The pupil pulses `r·(1 + 0.15·env)`.
- **48.843 (f1465):** housing circle R 150 at C, 1 px cream 45 %, plotted in 6 frames. Six blades appear fully open (ρ = 150).
- **48.843 → 49.074 (b106, f1472), shutter:**
  - ρ 150 → 0, easeInCubic, reaching exactly 0 on f1472.
  - Hexagon vertex: `V_i = C + ρ(cos a_i, sin a_i)`, `a_i = −90° + 60°i + 40°(1 − ρ/150)`.
  - Blade i: a 1.5 px cream line from V_i at angle `a_i + 120°`, out to the housing circle.
  - Mask: housing disc minus the hexagon, filled `bg`, even-odd rule. It sits above the eye and below the blades.
  - Log A3 result.
- **49.074 → 49.536:** the lids close (h 110 → 0, easeInCubic) into a flat line.
- **Beat accent:** the pupil pulse on b104 and b105; the shutter lands on b106 and the lids on b107.

### Shot A22: 49.534–51.363 (f1486–f1540) "So dizzy so dizzy"

- **49.536 (b107):**
  - The flat line un-plots from both ends into C (8 frames).
  - The housing, blades and mask fade over 6 frames.
  - 49.534: the lyric types. 49.560: log A4.
- **Five concentric pointy-top polygons around C.** Each is plotted from its top vertex clockwise in 6 frames, one per eighth note.

| k | Shape | R | Stroke | Plot start |
|---|---|---|---|---|
| 0 | triangle | 60 | 2 px orange | 49.536 (f1486) |
| 1 | square | 110 | 1.5 px cream | 49.767 |
| 2 | pentagon | 160 | 1.5 px cream 70 % | 49.997 |
| 3 | hexagon | 210 | 1.5 px cream 70 % | 50.228 |
| 4 | heptagon | 260 | 1.5 px cream 45 % | 50.459 |

- **Rotation:**
  - `θ_k = (−1)^k·[ω_k·(t − t_k) + 15°·(beat steps since 49.536, each eased 6 frames, easeOutCubic)]`, with ω_k = 24 + 12k °/s.
  - Even k turn clockwise, odd k anticlockwise.
- **50.459 (b109), wobble:**
  - The centre of polygon k orbits: `C + a·(cos ψ_k, sin ψ_k)`, `ψ_k = 2π(t − 50.459)/0.923 − 0.35k`.
  - a ramps 0 → 16 px over 4 frames. Geometry only; there is no camera move.
  - Log A4 result.
- **Beat accent:** the 15° steps, plus the triangle at 3 px for 3 frames on every beat.
- **51.150 → 51.382 (b111):**
  - All polygons scale to 0 toward their centres (easeInCubic, 1-frame stagger from the outside in), and a → 0.
  - On f1541 only the pen head at C remains.

### Shot A23: 51.363–55.083 (f1541–f1651) "Oh we can travel / To A.D to B.C"

**Year axis**
- **Mapping:**
  - Signed year u: A.D > 0, B.C < 0, with no year 0.
  - Display offset `v(u) = 0.24·u + 60·sign(u)`; screen `x = 960 + v(u) − v_cur(t)`, y 390.
- **Axis line:**
  - 1 px cream 45 %, in two segments: B.C from 120 to x_b − 60, and A.D from x_b + 60 to 1800, where `x_b = 960 − v_cur`.
  - Gap ends: 2 px orange ticks, 24 px (y 378–402).
  - `no year 0` (mono 16, creamDim) centred at (x_b, 396).
  - `B.C` right-aligned at x_b − 70 and `A.D` left-aligned at x_b + 70 (mono 20, creamDim, y 360).
- **Ticks:**
  - Minor every 100 years: 1 px cream 45 %, 8 px.
  - Major every 500 years: 1 px cream 70 %, 16 px, with a label at baseline 436 (mono 20, creamDim, centred), e.g. `1500 A.D`, `500 B.C`.
  - No label at the boundary.
- **Cursor:**
  - A 2 px orange tick at x 960 (y 370–410), with the pen head at (960, 390).
  - Readout centred at (960, 340), mono 22: `year = ` in cream 70 %, the value in cream.
  - Year formula:
    - v_cur ≥ 60 → `max(1, round((v_cur − 60)/0.24 + 0.5)) A.D`.
    - v_cur ≤ −60 → the same with −v_cur, in B.C.
    - Inside the gap → `1 A.D` if v_cur > 0, else `1 B.C`.

**Timeline**
- **51.382 (b111, f1541):**
  - A clip x ∈ [960 − 840p, 960 + 840p] opens over 8 frames (easeInOutCubic), with pen heads at both clip edges on the axis.
  - v_cur = 546.1, so the readout shows `2026 A.D` and the boundary sits at x 414.
  - 51.400: log A5.
- **51.843 (b112*) → 53.228 (b115):** v_cur 546.1 → 60.12, easeInOutSine (peak 551 px/s). Everything scrolls right; the readout counts down to `1 A.D`.
- **53.228 → 53.689:** hold, while "To A.D to B.C" types at 53.225.
- **53.689 (b116*) → 54.151 (b117, f1625), the hop:**
  - v_cur 60.12 → −60.12, easeInOutSine.
  - The cursor pen hops: `y = 390 − 40·sin(πp)`.
  - On f1625: both gap ticks flash 3 px for 3 frames, the readout shows `1 B.C`, and log A5 result appears.
- **54.151 → 55.074 (b119):** v_cur → −179.9, easeInOutSine. The readout settles at `500 B.C`.
- **Beat accent:** every beat the cursor tick extends to 56 px (y 362–418) and returns over 6 frames.

### Shot A24: 55.083–59.223 (f1652–f1776) "And we can unite / So deeply so deeply"

- **55.074 (b119) → 55.30:**
  - Ticks, labels and readout lift-fade.
  - The axis un-plots into the cursor (the reverse clip, 8 frames), and the cursor tick fades. The pen stays at C.
  - 55.083: the lyric types. 55.100: log A6.
- **55.536 (b120*, f1666), two circles:**
  - The pen splits into two pen heads that glide to (880, 390) and (1040, 390) in 4 frames.
  - They plot circle **A** (centre (760, 390), r 120, from 3 o'clock, clockwise) and circle **B** (centre (1160, 390), r 120, from 9 o'clock, anticlockwise). 10 frames each, 1.5 px cream.
  - `A` and `B` (STIX italic 32, cream 70 %) are centred over each circle at baseline 246.
  - Dimension line at y 560 between the centres: 1 px cream 45 %, with 8 px end ticks.
  - `d = 400` (STIX italic 28, creamDim) centred at (960, 592).
- **Approach:**
  - d = 300 at b121 (55.997), 180 at b122 (56.459), 0 at b123 (56.920, f1708).
  - Each step takes 8 frames, easeInOutCubic. Centres sit at `960 ∓ d/2`, and the `d =` label updates at each step.
- **Lens:** while d < 240, the intersection lens is drawn as a 2 px orange outline: the inner arcs between `(960, 390 ± √(120² − (d/2)²))`.
- **f1708 (d = 0):**
  - A single 2 px orange circle r 120 at C.
  - `A` and `B` lift-fade; `A = B` types, centred at (960, 246).
  - `d = 0` turns orange, and the dimension line collapses to its centre (6 frames).
  - Log A6 result. 56.950: log A7.
- **"So deeply", 57.382 (b124*) → 58.536:** six inner rings `r_k = 120·0.72^k` (86, 62, 45, 32, 23, 17), 1 px cream 70 %, each plotted in 4 frames. They start on eighth notes: 57.382, 57.613, 57.843, 58.074, 58.305, 58.536.
- **58.305 (b126), tunnel zoom:**
  - `r_k(t) = 120·0.72^(k − z)` with `z = (t − 58.305)/0.2308` (one ring per eighth note, seamless loop).
  - Draw rings with 12 ≤ r ≤ 560. Fade in over r 12 → 20 and out over r 400 → 560. Ring k = 0 stays orange.
  - The `A = B` and `d = 0` labels lift-fade.
  - 58.766: log A7 result.
- **Beat accent:** the ring stepping is the eighth-note pulse, plus the grid ripples.

### Shot A25: 59.223–62.589 (f1777–f1877) "If I can, if I can give you all the STIMULATIONS", hit f1859

- **59.223:** "If I can" types. At 59.687 it continues " give you all the" (marks, no clear). 59.700: log A8.
- **59.228 (b128*, f1777), chorus downbeat:**
  - Over 8 frames the tunnel's z jumps +3 (easeOutExpo) while all rings fade linearly to 0.
  - At the same moment 16 spokes shoot from r 40 to r 260 at `−90° + 22.5°·i`: 1 px cream 45 %, 6 frames, easeOutExpo.
  - Hub: 1 px cream 45 % circle r 40, with the pen at C.
  - Spoke-end nodes: r 4, 1 px cream 70 % outline.
- **Impulses:**
  - Each is a 3 px orange 36 px segment travelling r 40 → 260 in 12 frames, linear.
  - On arrival the node fills orange, and a 1 px orange 45 % ring grows r 4 → 24 while fading over 9 frames.
  - Order P = [0, 9, 4, 13, 2, 11, 6, 15, 1, 8, 5, 12, 3, 10, 7, 14].
  - Two launch per beat: b129 59.689 (P0, P1), b130 60.151 (P2, P3), b131 60.613 (P4, P5), b132* 61.074 (P6, P7).
  - The remaining eight launch together at f1847 and arrive exactly on f1859.
- **Counter:** `sent = n / 16`, mono 22 (key cream 70 %, value cream), right-aligned at (1800, 170). It types at 59.689 and updates on arrivals: 2, 4, 6, 8, then 16 on f1859.
- **f1859:**
  - All 16 nodes are orange.
  - KW-spark STIMULATIONS, inline keyword, send pulse, double ripple, stage dim.
  - Log A8 result.
- **62.459 (b135):**
  - The spokes un-plot inward (8 frames). The nodes fade (6 frames), the counter lift-fades and the hub un-plots.
  - The pen stays at C.
- **Beat accent:** the hub circle pulses `r 40·(1 + 0.25·env)`; launches land on beats.

### Shot A26: 62.589–66.613 (f1878–f1997) "Then I can, then I can be your only SATISFACTION", hit f1962. Character moment 3, `reach`

The full timeline is in §A.2 (moment 3). In outline:
- 62.589: "Then I can" types; 63.535 continues " be your only".
- 62.920 (b136): the log hides, and the pen dot stretches into a line.
- 63.382 → 63.843: two-way scan open.
- 63.843 → 64.305: scan up (fills).
- 64.766 (b140): palm node and reticle.
- f1962: touch, KW-low + spark SATISFACTION.
- 66.613 → 66.843: the scan closes into the pen dot at C.
- **Beat accent:** downbeat ripples only; the orange line pulses 2 → 3 px on b136–b137, and the palm node pulses on b140–b143.

### Shot A27: 66.601–70.084 (f1998–f2102) "If I can make you happy / I will run the EXECUTION", hit f2078

- **66.601:** the lyric types. The log returns (6-frame fade). 66.650: log A9.
- **66.843 → 67.074:** the pen glides C → (960, 470).
- **67.074 (b145, f2012), smile:** `y = 470 − 0.0025·(x − 960)²` for x 760–1160, 2 px cream, plotted from the middle outward by two pen heads, 8 frames.
- **67.536 (b146, f2026):**
  - Eyes: filled cream dots r 7 at (880, 320) and (1040, 320), scaling in over 4 frames (easeOutExpo).
  - Face circle r 230 at C: 1 px cream 45 %, plotted from 12 o'clock over 14 frames.
  - `happy(x) = x²` (STIX italic 30, cream 70 %) left-aligned at (1230, 520).
- **67.997 (b147, f2040):**
  - The smile flashes 3 px orange for 3 frames, then returns to 2 px cream over 6 frames.
  - The eyes morph into closed happy arcs: polyline (−14, 6), (0, −6), (14, 6), 2 px cream, 4 frames.
  - Log A9 result `true`.
- **68.459 (b148*, f2054):**
  - The face, eyes, smile and label un-plot or fade (6 frames).
  - Play triangle: circumradius 120 around C, vertices (900, 286.1), (1080, 390), (900, 493.9). Plotted clockwise from (900, 286.1), 1.5 px cream, easeInQuad, 24 frames, **closing exactly on f2078**.
  - `./run.sh` (mono 22, creamDim) left-aligned at (900, 548).
  - 68.270: log A10.
- **f2078:**
  - The triangle fills solid orange for 3 frames, then becomes a 2 px orange outline.
  - Radial burst: 24 rays at 15° steps, 1 px cream. Inner end r 150 → 480 and outer end r 170 → 520 over 10 frames (easeOutExpo); opacity 0.7 → 0 over f+4 to f+14. Clipped to the stage rect.
  - KW-spark EXECUTION, inline keyword, send pulse, double ripple, stage dim.
  - Log A10 result.
- **Beat accent:** the eyes pulse `r 7·(1 + 0.4·env)`, plus ripples on every beat and eighth.

### Shot A28: 70.084–74.045 (f2103–f2220) "Though we are trapped / In this strange strange SIMULATION", hit f2195

- **70.084:** the lyric types. 70.100: log A11.
- **70.305 (b152*, f2109):** the triangle and label un-plot (6 frames). The globe outline (r 200 at C, 1.5 px cream 70 %) plots from 12 o'clock in 8 frames.
- **Globe lines**, 8 frames each, 1 px cream 45 %:
  - b153 70.766: equator (rx 200, ry 36).
  - b154 71.228: parallels at ±35° (centres y = 390 ∓ 114.7, rx 163.8, ry 29.5). Log A11 result.
  - b155 71.689: meridians λ = 30°, 60°, 120°, 150° (rx = 200·|sin λ|), plus the central vertical. λ += 40°/s from 71.764. Back-facing meridians (cos λ < 0) drop to 25 %.
- **"We", from 70.766 (billiards):**
  - "me": orange filled r 5, starting at (930, 390), velocity (160, −110) px/s.
  - "you": 1.5 px cream outline r 6, starting at (990, 390), velocity (−130, 150) px/s.
  - Both reflect specularly off the inner circle r 186. They do not collide with each other.
  - On each wall hit, a 10 px radial tick (1 px cream) appears outside r 200 and fades over 8 frames.
  - Both dots pulse `1 + 0.5·env`.
- **71.764:** the lyric types. 71.780: log A12.
- **Tilts:** the globe group rotates about C, each 8 frames easeInOutCubic: −15° on b156 (72.151*), +15° on b157, 0° on b158 (73.074). The dots are not rotated.
- **f2195:**
  - Meridian speed ramps 40 → 140 °/s over 4 frames.
  - The orbit ellipse (rx 400, ry 92, rot −12°, 1 px cream 45 %) snaps in, with its back half hidden behind the disc.
  - An orange satellite r 6 orbits once per bar, with the three-piece trail.
  - KW-spark SIMULATION, inline keyword, send pulse, double ripple, stage dim.
  - Log A12 result.
- **73.845:** the billiards stop. Both dots glide to C (easeInOutCubic, 0.385 s). "you" fades as it arrives; "me" becomes the pen head.
- **73.997 (b160*):** the globe lines un-plot (8 frames). The orbit and satellite fade over 6 frames.
- **Beat accent:** the dot pulses and wall ticks; the tilts on b156–b158.

### Shot A29: 74.045–77.576 (f2221–f2326) "If I’m an eggplant / Then I will give you my NUTRIENTS", hit f2309

**Specimen.** Two ellipses, rotated −20° about (800, 400). All strokes 1.5 px cream.

| Part | Geometry |
|---|---|
| E1 body | centre (818.8, 451.7), rx 100, ry 125, rot −20° |
| E2 neck | centre (774.4, 329.5), rx 62, ry 85, rot −20° |
| Calyx | 5-point star, outer 46, inner 20, centred (750.4, 263.7), rot −20° |
| Stem | 2 px line from (750.4, 263.7) to (731.6, 212.1) |

**Timeline**
- **74.045:** the lyric types. 74.070: log A13.
- **74.230 → 74.459:** the pen glides C → (912.8, 417.5).
- **74.459 (b161):** E1 plotted clockwise from there (16 frames).
- **74.920 (b162):** E2 plotted from (832.7, 308.3) (12 frames).
- **75.382 (b163, f2261):**
  - The calyx is plotted from its top point (6 frames), then the stem (4 frames).
  - The arcs of each ellipse that lie inside the other fade to 25 % over 6 frames, so the union outline reads as the eggplant.
  - A dashed box (1 px cream 45 %, dash 6/6) snaps in at x 680–950, y 188–598, with `object #0002` (16 px creamDim) at baseline (680, 180). This is a callback to `object #0001`.
  - Log A13 result.
- **75.422:** the lyric types. 75.450: log A14.
- **75.843 (b164*):** labels type in 5 frames:
  - `x²/a² + y²/b² = 1` (STIX italic 30, cream 70 %) at (1000, 240).
  - `a = 100 · b = 125` (mono 20, creamDim) at (1000, 278).
- **f2309:**
  - The eggplant strokes flash 2 px orange for 3 frames, then return over 6 frames.
  - Three leaders, each 6 frames with a 2-frame stagger. Each runs from an orange node r 3.5, horizontally to x 960, then diagonally to (990, baseline − 8).
  - Labels are mono 22 at x 1000 (key cream 70 %, `=` creamDim, value cream). Each types in 5 frames. Values are USDA per 100 g, raw.

    | Node | Label | Baseline |
    |---|---|---|
    | (868.4, 412.4) | `kcal = 25` | 560 |
    | (898.3, 465.4) | `fiber = 3.0 g` | 600 |
    | (887.2, 522.6) | `K = 229 mg` | 640 |

  - Standard keyword NUTRIENTS. The labels sit above and below the keyword band. Send pulse. Log A14 result.
- **Beat accent for all three specimen boxes (A29–A31):** the dash offset steps 6 px every beat ("marching ants", 3-frame ease), plus even-beat ripples.

### Shot A30: 77.576–81.351 (f2327–f2440) "If I’m a tomato / Then I will give you ANTIOXIDANTS", hit f2419

- **77.576:**
  - The lyric types. 77.600: log A15.
  - Leaders retract into their nodes (6 frames), labels lift-fade, and the box un-plots.
- **77.689 (b168*) → 78.613 (b170), morph:**
  - Both ellipses interpolate to one circle: centre (1120, 410), r 130, rot 0 (easeInOutCubic, about 350 px/s). E2 fades out over the last 6 frames.
  - The calyx moves to (1120, 280): rot −20° → 36°, outer 46 → 52, inner 20 → 22.
  - The stem becomes (1120, 280) → (1120, 250).
- **78.151 (b169):**
  - Rib ellipses (centre (1120, 410), ry 130, rx 45 and rx 95, 1 px cream 25 %), plotted in 8 frames.
  - `x² + y² = r²` (STIX italic 30, cream 70 %) right-aligned at (900, 240).
  - `r = 130` (mono 20, creamDim) right-aligned at (900, 278).
  - Log A15 result.
- **78.613:** the box snaps in at x 960–1280, y 200–570, with `object #0003` at (960, 190).
- **79.226:** the lyric types. 79.250: log A16.
- **Free radicals:**
  - 12 dots at angle `30°·j + jitter_j` (seeded, ±10°) and radius 200–250 (seeded) around (1120, 410).
  - Each is an orange r 3 dot with a 1 px orange 45 % ring r 8. They drift clockwise at 10°/s.
  - Four appear per beat on b172* (79.536), b173 and b174, each scaling in over 3 frames.
- **f2419:**
  - The tomato flashes orange for 3 frames.
  - Neutralising wave: a 1.5 px cream circle, r 130 → 320 over 12 frames, linear, opacity 1 → 0.
  - When the wave passes a radical, its dot turns cream, its ring vanishes, and a second cream r 3 dot appears 6 px beside it (the paired electron).
  - `C40H56` (mono 22, cream; 40 and 56 as 15 px subscripts with a +5 px baseline shift) right-aligned at (900, 600). `lycopene` (16 px creamDim) at (900, 628).
  - Standard keyword ANTIOXIDANTS. Send pulse. Log A16 result.
- **Beat accent:** the radicals pulse `r 3·(1 + 0.5·env)`, plus the marching ants.

### Shot A31: 81.351–85.078 (f2441–f2551) "If I’m a tabby cat / Then I will purr for your ENJOYMENT", hit f2528

- **81.351:** the lyric types. 81.370: log A17.
- **81.382 (b176*):**
  - Radicals fade (6 frames). Ribs, box, calyx and stem un-plot (6 frames). Labels lift-fade.
  - The circle glides from (1120, 410) r 130 to (960, 380) r 120, easeInOutCubic, landing on b177.
- **Cat head** (H = (960, 380), r 120). All strokes 1.5 px cream unless stated.
  - **81.843 (b177):** ears, plotted together in 6 frames from their outer base vertex.
    - Left: (856.1, 320), (843.0, 230.3), (919.0, 267.2).
    - Right: (1063.9, 320), (1077.0, 230.3), (1001.0, 267.2).
  - **82.074:** eyes in 6 frames.
    - Almonds centred at (915, 380) and (1005, 380), 44 wide, lid control ±24.
    - Pupils: 2 px orange vertical slits, 18 px, scaling in.
  - **82.305 (b178):**
    - Nose: triangle (952, 406), (968, 406), (960, 416).
    - Mouth: quadratics from (960, 416) to (946, 426) and to (974, 426).
    - Whiskers, 1 px cream 70 %, drawn outward with a 1-frame stagger: left (905, 410)→(800, 396), (905, 418)→(796, 418), (905, 426)→(800, 440); mirrored about x 960.
  - **82.766 (b179):**
    - Tabby "M": polyline (926, 330), (938, 296), (960, 318), (982, 296), (994, 330), 1.5 px orange, 5 frames.
    - Cheek stripes, 1 px cream 70 %: (850, 370)→(876, 374) and (852, 388)→(878, 388), mirrored.
    - Box at x 770–1150, y 200–530, with `object #0004` at (770, 190).
    - Log A17 result.
- **82.833:** the lyric types. 82.850: log A18. Labels:
  - `purr(t) = A sin(2πft)` (STIX italic 30, cream 70 %) at (1200, 240).
  - `f = 25 Hz` (mono 20, creamDim) at (1200, 278).
- **83.228 (b180*), purr wave:**
  - A sine line at y 600, x 760–1160, λ 40, 1 px cream 70 %, plotted left to right in 8 frames.
  - The phase moves one λ per eighth note.
  - `A = 4 + 8·env(t − last beat)`. This is the beat accent.
- **f2528:**
  - The eyes swap to closed arcs: (−22, 4), control (0, −10), (22, 4).
  - The head flashes 2 px orange for 3 frames.
  - Purr A jumps to 16 and decays with τ 0.4 s.
  - Sound arcs: three per side, radii 180/200/220 about H, ±20° around 0° and 180°, 1 px cream 70 %. They grow +20 px and fade over 10 frames, and repeat on b183 (84.613).
  - Standard keyword ENJOYMENT. Send pulse. Log A18 result.

### Shot A32: 85.078–88.60 (f2552–f2657) "If I’m the only god / Then you’re the proof of my EXISTENCE", hit f2638. Character moment 4, `float`

- **84.878 → 85.074:**
  - Cat features, box, labels and purr wave un-plot (6 frames).
  - The head circle glides to C and contracts r 120 → 0 (easeInCubic), leaving the pen head at C on f2552.
- **85.074 (b184*):** the log hides. 85.078: the lyric types.
- **Moment 4** is in §A.2: iris opens 85.074–85.536, z-axis b185, leaders b186–b187, release 86.459–86.920, box b188, EXISTENCE f2638, close 88.305–88.536.
- **86.538:** the lyric types.
- **88.220:** EXISTENCE starts its exit; it is gone by f2653.
- **88.420 → 88.587:** the lyric lift-fades. From f2653 the log fades in. 88.433: log A19 (result at 88.536).
- **88.587:** Section B's "Switch my gender" starts typing.

---

## A.2 Character moments in Section A

### Moment 3: 63.382–66.843 (art visible), `reach`, "be your only SATISFACTION"

**Placement** (anchors in normalised art coordinates; estimates to be verified in `char_meta.json`):

| Anchor | (nx, ny) |
|---|---|
| headTop | (0.47, 0.01) |
| face | (0.46, 0.09) |
| palm | (0.36, 0.33) |
| waist | (0.50, 0.30) |

- **Viewport frame:** x 640–1280, y 110–690.
  - The vertical edges are 1 px cream 45 %. The top and bottom edges are the scan lines settling to 1 px cream 45 % (orange → cream over 4 frames).
  - 16 px corner L-marks, 1.5 px cream 70 %.
  - Label `me.reach(you)` (16 px creamDim) at baseline (640, 100).
- **Fit rule:**
  - Scale s so headTop lands at y 130 and palm at y 560: art height = 430 / (palm.ny − headTop.ny). With the estimates this is 1344 (width 896).
  - Horizontal: `(face.x + palm.x)/2 = 960`. With the estimates the art left edge is 593 and the palm sits at about (916, 560).
  - The frame clips at the hips: `clip-path: inset(110px 640px 390px 640px)`.

**Timeline**

| t | Event |
|---|---|
| 62.920 (b136*, f1888) | The log hides. The pen dot stretches into a 2 px orange line, x 620–1300 at y 390 (4 frames, easeOutExpo from the centre). The four corner marks plot (4 frames each) and `me.reach(you)` types (63.05). The line pulses 2 → 3 px on b136 and b137 |
| 63.382 (b137, f1901) → 63.843 | The line splits: the upper copy goes 390 → 110 and the lower 390 → 690, linear. `reach_lines` is visible between them (inset clip intersected with the frame). Readouts `y 0263` (16 px creamDim) ride at x 1308 on each line. The vertical frame edges grow with the lines |
| 63.535 | " be your only" continues typing |
| 63.843 (b138) → 64.305 (b139) | Scan up: one orange line 690 → 110. `reach_flat` appears below it, under the lines. The top line settles into the frame edge |
| 64.305 → 66.40 | Slow push: art scale 1.000 → 1.035, linear, transform-origin at the palm. The frame stays fixed |
| 64.766 (b140, f1943) | Orange palm node, r 3.5. Reticle: 1 px cream 45 % circle with four 8 px ticks (N/E/S/W), r 48 → 24 linear by f1962. The node pulses on b140–b143 |
| f1962 | Touch: a 3 px orange ring grows r 0 → 160 over 10 frames (easeOutExpo), opacity 1 → 0 over f+4 to f+12. A second ring (1 px orange 45 %) starts at f+3 and reaches r 260. The reticle is 2 px orange for 3 frames, then cream. A filled spark R 22 blooms on the palm and steps 15° per beat. KW-low-spark SATISFACTION. She is not dimmed |
| 66.613 (b144, f1998) → 66.843 | Exit: two orange lines run 110 → 390 and 690 → 390 (7 frames), and art is visible only between them. The frame's vertical edges and corner marks shrink with them; `me.reach(you)` lift-fades. The palm spark scales to 0 as the band passes the palm. At 390 the line contracts into the pen dot at C |

### Moment 4: 85.074–88.536, `float`, "only god / proof of my EXISTENCE"

**Anchors** (estimates; verify):

| Anchor | (nx, ny) |
|---|---|
| hairTop | (0.50, 0.03) |
| ribbon / chest | (0.47, 0.23) |
| handL | (0.15, 0.17) |
| handR | (0.85, 0.15) |
| floating book | (0.17, 0.10) |
| bbox | `char_meta.float.bbox` |

**Placement:**
- The bbox (ny 0.022–0.95) is scaled to height 560 with its top at y 110, centred x 960. The art is 603 × 402, so x 759–1161. Width cap 760.
- Drift: translateY 0 → −18 px, linear, over 85.074–88.305. Her nodes and box move with her.
- Art: `float_flat.png` inside `clip-path: circle(r at 960px 390px)`.

**Timeline**

| t | Event |
|---|---|
| 85.074 (b184*) → 85.536 | The iris opens r 0 → 300 (easeOutExpo), with a 1.5 px cream 45 % outline. Hair beyond r 300 is deliberately clipped |
| 85.536 (b185) | z-axis behind her (stage layer): (960, 690) → (960, 100), 1 px cream 45 %, 10 frames, open-V arrowhead. `z` (STIX italic 26, cream 70 %) at (976, 112) |
| 85.997 (b186) | Leader 1 (moment-A mechanics: the label types in 5 frames, the orange check follows 4 frames later, the leader runs 40 px horizontal and then to an orange node). `gravity = 0`, left-aligned at (1320, 200), to hairTop |
| 86.459 (b187) | Leader 2: `instances = 1`, right-aligned at (600, 420), to the ribbon/chest anchor |
| 86.459 → 86.920 | Release: the iris grows r 300 → 640 (easeInOutCubic). The outline fades over r 420 → 640 |
| 86.920 (b188*) | Dashed bbox + 12 px pad (1 px cream 45 %, dash 6/6), with `object #0001` (16 px creamDim) above its top-left. Marching ants per beat |
| f2638 | The box flashes 2 px orange for 3 frames. An orange check (14 × 10, 2 px) is drawn after `object #0001`. The leader nodes pulse. KW-low EXISTENCE. Stage dim applies to the axis, leaders and box only |
| 88.220 | The keyword starts its exit; it is gone by f2653 |
| 88.305 (b191) → 88.536 (f2656) | Leaders retract (8 frames), the box un-plots (6) and the axis un-plots top-down (8). The iris closes r 640 → 0 (easeInCubic) around (960, 390); the outline returns at 45 % once r ≤ 420 |
| f2656–f2658 | The pen head scales 0 → 1 at (960, 390) |

---

# Section B: 88.60–131.20 s (f2658–f3936). Pre-chorus 2, chorus 2, bridge

## B.0 Section data (`sections/b.data.ts`, already entered; keep as is)

### B.0.1 Downbeats

| Downbeat | t | Frame | Event |
|---|---|---|---|
| b192 | 88.766 | f2663 | Venus plot |
| b196 | 90.613 | f2718 | morph |
| b200 | 92.459 | f2774 | dial |
| b204 | 94.305 | f2829 | |
| b208 | 96.151 | f2885 | S / M labels |
| b212 | 97.997 | f2940 | swap |
| b216 | 99.843 | f2995 | |
| b220 | 101.689 | f3051 | spiral B |
| b224 | 103.536 | f3106 | strings |
| b228 | 105.382 | f3161 | |
| b232 | 107.228 | f3217 | strings out |
| b236 | 109.074 | f3272 | |
| b240 | 110.920 | f3328 | wheel |
| b244 | 112.766 | f3383 | |
| b248 | 114.613 | f3438 | |
| b252 | 116.459 | f3494 | scan turns |
| b256 | 118.305 | f3549 | shatter |
| b260 | 120.151 | f3605 | select |
| b264 | 121.997 | f3660 | heart |
| b268 | 123.843 | f3715 | crack |
| b272 | 125.689 | f3771 | moment 6 |
| b276 | 127.536 | f3826 | |
| b280 | 129.382 | f3881 | |
| b284 | 131.228 | f3937 | ILLEGAL ARGUMENTS (Section C) |

### B.0.2 Lines

See §0.3. Notes:
- "To F to M", "From AM to PM" and "To S to M" are not keyword lines. Their letters are visualised only as stage labels.
- Continuations: 103.489 + 104.197, 107.220 + 107.903, 114.920 + 115.780, 118.333 + 118.979, and 121.728 + 122.714. Each types its prefix, resumes without a clear, and sends once.
- Stage keyword sizes are all 200. Glyph spans:

| Keyword | x span |
|---|---|
| VIBRATIONS | 360–1560 |
| COMPLETION | 360–1560 |
| ISOLATION | 420–1500 |
| FRAGMENTS | 420–1500 |
| DISHEARTENED | 240–1680 |

  Caps run y ≈ 316–462, baseline 462, underline 490.
- The longest composer string is "If I can erase all the pointless FRAGMENTS", which ends at x ≈ 1310, clear of the send button at 1608.

### B.0.3 Log entries

All entries use the lyric layout.

| # | t | Call | rt | Result | Tie-in |
|---|---|---|---|---|---|
| B1 | 88.650 | `Edit(me.ts)` | 91.997 | `Updated me.ts with 1 addition and 1 removal` | the swap is one line |
| B2 | 92.060 | `Write(crontab)` | 95.228 | `0 0-12 * * * whatever` | every hour, AM to PM |
| B3 | 95.500 | `Bash(git mv roles/S roles/M)` | 98.920 | `renamed: roles/S to roles/M` | |
| B4 | 99.400 | `Bash(watch -n 0.4615 trance)` | 101.689 | `Every 0.4615s: trance` | one beat at 130 bpm |
| B5 | 103.550 | `Bash(listen --to you)` | 106.300 | `6 modes · in tune` | VIBRATIONS |
| B6 | 107.250 | `TodoWrite(6 items)` | 110.2333 | `6/6 completed` | COMPLETION |
| B7 | 110.950 | `Search(pattern: "you")` | repeat runs, see B7 | `Found 5 matches` … `Found 0 matches` | callback to the demo's `Found 1 match` |
| B8 | 118.400 | `Glob(**/*.fragment)` | 118.766 | `36 files` | N = shard count |
| B9 | 119.000 | `Edit(me.ts)` | 120.8667 | `Updated me.ts with 0 additions and 36 removals` | |
| B10 | 121.780 | `Draw(heart, r = 85)` | 122.920 | `ok` | callback to `Draw(circle, r = 160)` |
| B11 | 123.000 | `Bash(git merge you)` | 124.900 | `CONFLICT (content): merge conflict in heart` | pays off A6 |
| B12 | 125.750 | `Bash(sudo kill -9 1)` | 126.613 | `me is not in the sudoers file. This incident will be reported.` | PID 1 is the god process |
| B13 | 128.700 | `world.execute(me, god)` | 131.2333 (f3937, drawn by C1) | `IllegalArgumentException: god` | |

### B.0.4 Status verbs

`N` runs from 74 s to 117 s.

| From | Verb |
|---|---|
| 88.587 | Switching… |
| 92.015 | Scheduling… |
| 95.465 | Swapping… |
| 99.349 | Entrancing… |
| 103.489 | Resonating… |
| 107.220 | Completing… |
| 110.900 | Searching… (line at 45 %) |
| 115.780 | Waiting… (45 %) |
| 118.333 | Erasing… (100 % from 118.305) |
| 121.728 | Mending… |
| 125.708 | Challenging… |
| 128.661 | Validating… |

### B.0.5 UI segments and ripples

All segments: lyric layout, composer shown, log (240, 772), status lyric, HUD full.

| from | Ripples | Centre | Extra |
|---|---|---|---|
| 88.60 | every 2 | C | |
| 99.80 | every beat | C | |
| 105.37 | every beat + half | C | |
| 106.31 | every beat | C | |
| 109.06 | every beat + half | C | |
| 110.30 | every beat | C | |
| 110.90 | every 4 | C | status 45 % |
| 110.92 | every 4 | C | log 70 %, previous entry hidden (fades over 6 frames at 110.95) |
| 117.20 | none | | |
| 118.305 | none | | HUD back to 100 % (6 frames) |
| 118.50 | every 2 | C | |
| 124.80 | none | | |
| 125.68 | every 2 | (1280, 390), the god spark | |
| 128.90 | every beat | (1280, 390) | |
| 129.40 | every beat + half | (1280, 390) | |
| 130.20 | every beat | (1280, 390) | |
| 130.40 | none | | silence before the hit |

**One-off ripples:**
- ISOLATION f3518 from (1640, 480): v 900, τ 1.0.
- b256 (118.305) from (1640, 480).
- DISHEARTENED f3747 from (960, 410).

---

## B.1 Shot list

### Shot B1: 88.60–92.015 (f2658–f2759) "Switch my gender / To F to M"

- **f2658:** the hand-over state (§H.2). L "Switch my gender" is typing. 88.650: log B1.
- **Venus geometry** (all strokes 1.5 px cream):
  - Circle centre C, r 90.
  - Stem (960, 480) → (960, 600).
  - Crossbar centred on the stem at y 555, x 915–1005.
- **Plotting:**
  - **88.766 (b192*, f2663) → 89.228 (b193, f2677):** the circle is plotted clockwise from its bottom point (960, 480), constant speed.
  - **89.228 → 89.459:** stem plotted downward.
  - **89.459 → 89.689 (b194):** crossbar plotted from its centre outward, with two pen heads.
- **89.689, label:**
  - Leader: 1 px cream 45 %, from (870, 390) to (810, 390), 4 frames.
  - `gender = F` (mono 22: key cream 70 %, `=` creamDim, value cream) right-aligned at x 798, baseline 398, types in 5 frames.
- **90.197:** "To F to M" types.
- **90.613 (b196*) → 91.997 (b199, f2760), morph** (one parameter q, easeInOutSine):
  - Stem angle φ 90° → −45° (counter-clockwise on screen). The stem spans r 90–210 from O.
  - The crossbar attach radius goes 165 → 210.
  - The bar halves go from ±90° to ±145° relative to the stem, and length 45 → 36, ending as an open-V arrowhead.
  - Peak tip speed is about 560 px/s.
  - End state: stem (1023.6, 326.4) → (1108.5, 241.5).
- **91.074 (b197, f2732):** the label value `F` backspaces and `M` types (1 frame each). `M` is orange for 6 frames, then cream.
- **f2760:** the morph lands; the circle flashes 2 px for 3 frames. Log B1 result.
- **Beat accent:** the circle pulses `r·(1 + 0.05·env)` from b193.

### Shot B2: 92.015–95.465 (f2760–f2863) "And then do whatever / From AM to PM"

- **92.015:**
  - The lyric types. 92.060: log B2.
  - 92.015–92.28: the Mars stem and arrowhead un-plot from the tip into the circle. The leader and label lift-fade.
- **92.06 → 92.459 (b200*, f2774):** the circle grows r 90 → 200 about C (easeInOutCubic) and becomes the dial.
- **Dial, 92.459–92.69:**
  - **Ticks:** 12 hour ticks, swept clockwise from 12 o'clock, 3 frames each with a 0.5-frame stagger.
    - Minor: r 186–200, 1 px cream 70 %.
    - Major (12, 3, 6, 9): r 176–200, 2 px cream.
  - **Numerals:** `12 3 6 9` (mono 22, cream 70 %) on r 150, typed at 92.55.
  - **Hour hand:** C → r 120 at 12 o'clock, 2 px cream, 4 frames. The seed is the hub.
  - **Period label:** `AM` (mono 500, 28 px, cream) centred at (960, 478), typed at 92.60.
- **Sweep:** 12 hour steps, one per eighth note. Step k starts at `92.690 + 0.23077·(k − 1)`.
  - Each step advances the hand +30° over 6 frames, easeInOutCubic.
  - On each landing the hour tick flashes orange for 2 frames.
  - Rim progress: a 3 px orange arc from 12 o'clock to the hand, tracking it exactly.
- **93.953:** "From AM to PM" types.
- **95.228 (k = 12, f2857):**
  - The rim is a full orange circle.
  - `A` backspaces and `P` types (1 frame each); `PM` is orange for 6 frames, then cream.
  - Log B2 result.
- **Beat accent:** each eighth note is a visible tick step; the hub pulses.

### Shot B3: 95.465–99.349 (f2864–f2979) "Oh switch my role / To S to M"

- **95.465:**
  - The lyric types. 95.500: log B3.
  - Over 6–8 frames the ticks, numerals, hand and `PM` un-plot or fade, and the rim returns to cream.
- **95.465 → 95.920:** the dial becomes circle **S**: centre C → (840, 390), r 200 → 60 (easeInOutCubic).
- **95.689 (b207):** square **M** is plotted: side 160, centre (1080, 390), from its top-left corner clockwise, 16 frames, 1.5 px cream.
- **96.151 (b208*):** `S` and `M` (mono 500, 40 px, cream 70 %) type centred in each shape.
- **96.613 (b209), swap hint:** two arcs about C, r 230, 1 px cream 45 %, 8 frames.
  - Upper: 205° → 335°, with an arrowhead at (1168, 293).
  - Lower: 25° → 155°, with an arrowhead at (752, 487).
  - Arrowheads are the drawn open-V `Arrow`, 10 px.
- **97.739:** "To S to M" types.
- **97.997 (b212*) → 98.920 (b214, f2968), swap:**
  - Both shapes orbit C on radius 120 by +180° (easeInOutCubic). S passes over the top through (960, 270); M passes under the bottom through (960, 510).
  - The shapes translate only, and their labels ride with them.
  - Peak speed is about 610 px/s.
  - The hint arcs un-plot over the first 6 frames.
- **f2968:** the shapes land (S at (1080, 390), M at (840, 390)) and flash 2 px for 3 frames. Log B3 result.
- **Beat accent:** both shapes scale `1 + 0.05·env`.

### Shot B4: 99.349–103.489 (f2980–f3104) "So we can enter / The trance the trance"

- **99.349:** the lyric types. 99.400: log B4.
- **99.382 (b215):** S, M and the labels un-plot (8 frames).
- **Spiral A:**
  - `r(θ) = 12 + 248·θ/(12π)` for θ ∈ [0, 12π], rotated by ρA. 720 samples, 1.5 px cream 70 %.
  - Plotted from the centre outward, 99.382 → 100.766 (b218), easeInOutSine.
  - Rotation `ρA = +45°·(t − 99.382)`.
- **101.474:** the lyric types.
- **Spiral B:**
  - The mirror-handed spiral, 1 px cream 45 %, sampled from its outer end inward.
  - Plotted 101.689 (b220*) → 102.613 (b222).
  - Rotation `ρB = −45°·(t − 101.689)`.
  - The two counter-rotating spirals make a moiré rosette.
- **101.689:** log B4 result.
- **Trance rings at b220, b221 and b222:** 1 px orange 45 %, r 0 → 280 over 0.4 s, fading.
- **Beat accent:** both spirals scale `1 + 0.05·env` about C on b216–b223.
- **103.074 (b223) → 103.536 (b224):** both spirals un-plot toward C (easeInCubic). Only the seed remains.

### Shot B5: 103.489–107.220 (f3105–f3216) "If I can, if I can feel your VIBRATIONS", hit f3189

- **103.489:** "If I can" types; at 104.197 it continues " feel your". 103.550: log B5.
- **103.536 (b224*):** posts, 1.5 px cream 70 %, at x 360 and x 1560, y 210–570, each plotted from y 390 outward (8 frames).
- **Strings:**
  - Six strings at y = 240, 300, 360, 420, 480, 540 (i = 0–5), x 360–1560, 1 px cream 70 %.
  - Each is plotted from x 960 outward with two pen heads, over 15 frames.
  - Pairs start on eighth notes: 360 and 420 at 103.536; 300 and 480 at 103.767; 240 and 540 at 103.997.
- **Vibration model:**
  - `d(x, t) = A(t)·sin(nπu)·sin(2π·5·(t − tp))`, with u = (x − 360)/1200, n = i + 1, and `A = A0·e^(−(t − tp)/0.6)`.
  - 200 samples per frame. While A > 4 the string draws 1.5 px cream.
- **Plucks:** at each pluck an orange dot r 4 appears at x = 360 + 600/n and fades over 8 frames.

| Beat | Strings | A0 |
|---|---|---|
| b226 104.459 | n 3 (y 360) | 14 |
| b227 104.920 | n 4 (y 420) | 14 |
| b228* 105.382 | n 2 and n 5 | 14 |
| b229 105.843 | n 1 and n 6 | 14 |

- **f3189:**
  - All six strings are re-plucked with A0 18. They stroke 2 px orange for 3 frames, then return to 1 px cream 70 % over 6 frames.
  - Keyword VIBRATIONS, inline keyword, send pulse. Log B5 result.
  - Readability: until the keyword has gone (107.22), the strings at y 300–480 draw at 45 %.
- **b231 (106.766):** all six re-plucked with A0 8.
- **Beat accent:** the plucks.

### Shot B6: 107.220–110.900 (f3217–f3326) "Then I can, then I can finally be COMPLETION", hit f3307

- **107.220:** "Then I can" types; at 107.903 it continues " finally be". 107.250: log B6.
- **107.228 (b232*) → 107.495:**
  - The strings damp (τ 0.1) and un-plot toward x 960. The posts un-plot toward y 390.
  - Only the seed remains.
- **107.689 (b233):** the hand, a 1 px cream 45 % line C → (960, 160), plotted in 4 frames.
- **107.82 → f3307, progress ring:**
  - Centre C, r 230, 1.5 px cream. Plotted clockwise from 12 o'clock, easeInQuad, with a pen head; it closes exactly on f3307.
  - The hand rotates with the pen head.
  - Readout `NNN%` (mono 16, creamDim, `floor(100p)` zero-padded, e.g. `007%`) on r 258 at the pen angle.
- **Beat ticks** on b234–b238 (108.151, 108.613, 109.074, 109.536, 109.997): a tick at the pen angle, r 222–238, 1 px cream 70 %. The pen pulses `1 + 0.8·env`.
- **f3307:**
  - The ring strokes 2 px orange for 3 frames, then 1.5 px cream 70 % over 6 frames.
  - `100%` shows orange for 3 frames, then fades over 6.
  - The hand and ticks un-plot (6 frames).
  - **Six "you" nodes** on the ring at `θk = −90° + 60°k`: r 12, 1.5 px cream outline, scaling in over 6 frames (easeOutExpo). Positions: (960, 160), (1159.2, 275), (1159.2, 505), (960, 620), (760.8, 505), (760.8, 275).
  - Spokes from the seed to each node, 1 px cream 45 %, 6 frames.
  - Keyword COMPLETION, inline keyword, send pulse. Log B6 result.
- **b239 (110.459):** the nodes pulse `r·(1 + 0.25·env)`.

### Shot B7: 110.900–115.780 (f3327–f3472) "Though you have left / You have left ×4"

- **HUD light 110.90–118.305:** log 70 % with the previous entry hidden; status line 45 %.
- **110.920 (b240*):**
  - The ring goes to 1 px cream 45 % (6 frames).
  - The wheel (ring, nodes and spokes) rotates `ψ = −6°·(t − 110.92)`. From 113.10 the speed falls linearly to 0 by 113.40, and ψ freezes at −13.98°.
- **Ring segments:** the ring is six 60° arcs; arc k (θk + ψ to θk + 60° + ψ) belongs to node k.
- **Departures.** Each lasts 0.5 s from its line start. The node moves 120 px radially outward (easeInOutCubic) while its circle un-plots, its spoke un-plots toward the seed, and its arc un-plots toward its start.

| Line start | Node | Count after |
|---|---|---|
| 110.900 | k 4 (lower-left) | 5 |
| 112.220 | k 1 (upper-right) | 4 |
| 113.100 | k 5 (upper-left) | 3 |
| 114.180 | k 2 (lower-right) | 2 |
| 114.920 | k 3 (bottom) | 1 |
| 115.780 | k 0 (top) | 0 (in B8) |

- **Seed drift, 113.10 → 115.90:**
  - The seed moves C → (1640, 300) (easeInOutCubic, peak 366 px/s).
  - Spokes are recomputed every frame from the seed, so they visibly stretch (the last one reaches about 740 px).
- **Log B7, repeat mode** (`runs`):
  - 110.95: the call types.
  - At 112.22, 113.10, 114.18, 114.92 and 115.78 it re-runs. The bullet turns orange again, and the suffix ` ×2` … ` ×6` (mono 24, creamDim) replaces the previous one. The old result fades over 3 frames.
  - Results 0.5 s after each line start: `Found 5 matches` (111.40), `4` (112.72), `3` (113.60), `2` (114.68), `Found 1 match` (115.42).
  - The sixth run stays running until ISOLATION.
- **Beat accent:** the remaining nodes pulse `r·(1 + 0.25·env)`, and the seed pulses.

### Shot B8: 115.780–118.305 (f3473–f3548) "You have left me in ISOLATION", hit f3518. Character moment 5, `sit`

- **115.78:**
  - " me in" continues typing on the 114.920 line.
  - Node k 0 departs (115.78–116.28): its circle, its long spoke and the last arc un-plot.
  - Log B7 re-runs ×6.
- **115.90:** the seed arrives at (1640, 300), the top-centre of her box.
- **Placement:**
  - `sit_flat.png` and `sit_lines.png` (1120 × 1680).
  - Box x 1520–1760, y 300–660 (h 360, w 240). Screen = (1520 + nx·240, 300 + ny·360).
  - Her feet are on y 660. She sits 20 px right of the ISOLATION glyphs, which end at 1500.
- **115.997 (b251, f3480), scan down:**
  - The seed stretches into a 2 px orange line, x 1495–1785, in 4 frames.
  - The line moves down to y 660 by 116.459 (b252), linear, with `sit_lines` visible above it.
  - Readout `y 0300 … y 0660` (16 px creamDim) right-aligned at x 1487, at line y + 5.
- **116.459 → f3518, scan up:** the line moves 660 → 300, revealing `sit_flat` under the lines. It reaches 300 on f3518.
- **f3518:**
  - The line shrinks into a dot at (1640, 300) over 4 frames, then the dot scales to 0 (gone by f3528).
  - Keyword ISOLATION, inline keyword, send pulse.
  - Log B7 result `Found 0 matches`; the bullet turns creamDim.
  - The slow ripple from (1640, 480).
  - She is not dimmed.
- **117.27–118.305:** stillness, about 1 s. This is the only intended near-hold in the film.
- **Exit:**
  - 118.305 (b256*): her flat fills cut out.
  - f3549–f3552: the line art cross-fades into the shard outlines (B9).
  - The HUD returns to 100 %.

### Shot B9: 118.305–121.728 (f3549–f3651) "If I can, if I can erase all the pointless FRAGMENTS", hit f3626

- **Shards:** `B_shards.ts` (exists) holds a Delaunay triangulation of her alpha, classed `orange` or `cream`.
  - Cream shards: 1 px cream 70 % outlines. Orange shards: 1.5 px orange. No fills.
  - N is the shard count; the log strings use N.
- **118.333:** "If I can" types; at 118.979 it continues. 118.400: log B8, result at 118.766.
- **118.40 → 120.30, scatter** (all shards as one group, easeInOutCubic):
  - Rank shards r by centroid x.
  - Target centroid: `x = 760 + 940·r/(N − 1) + jx`, `y = 170 + 450·v + jy`, where v is the normalised y in her box and jx, jy are seeded ±24.
  - Each shard rotates by a seeded angle in ±35° and scales ×1.5 about its centroid. Peak speed about 600 px/s.
  - After 120.30, each shard keeps drifting 8 px/s and rotates +4°/s.
- **119.000:** log B9.
- **119.689 (b259), marquee:** a dashed rect x 700–1780, y 120–660 (1 px cream 45 %, dash 6/6), plotted clockwise from top-left in 8 frames. `N selected` (16 px creamDim) at (712, 140).
- **120.151 (b260*):** the cream shards re-stroke to 1 px orange, left to right over 6 frames.
- **f3626:**
  - Keyword FRAGMENTS, inline keyword, send pulse. Log B9 result.
  - Deletion sweep: shard r un-plots (6 frames) from `f3626 + round(18·r/(N − 1))`. All are gone by f3650, and most of those under the glyphs are gone by the outline phase (f3637).
- **121.47–121.70:** the marquee un-plots and its label fades.
- **Beat accent:** marching ants on the marquee from b259; even-beat ripples from C.

### Shot B10: 121.728–125.708 (f3652–f3770) "Then maybe, then maybe you won’t leave me so DISHEARTENED", hit f3747

- **121.536 (b263):** the seed sets down at C (scale 0 → 1, 4 frames, easeOutExpo).
- **121.728:** "Then maybe" types; at 122.714 it continues. 121.780: log B10.
- **Heart:**
  - Built from a 170 px square rotated 45° about (960, 410), plus two lobe circles r 85.
  - Vertices: T (960, 289.79), Lv (839.79, 410), Rv (1080.21, 410), B (960, 530.21).
  - Lobe centres: (899.90, 349.90) and (1020.10, 349.90).
  - Each half runs T → outer lobe semicircle → side vertex → B. Lobes are 48-point polylines.
- **121.997 (b264*) → 122.920 (b266):** both halves are plotted from T to B together, with two pen heads, easeInOutCubic, 1.5 px cream.
- **122.920:** log B10 result. 123.000: log B11.
- **Heartbeat:** on b266–b270 the heart scales `1 + 0.06·env` about (960, 410).
- **Crack:**
  - Zigzag T → (946, 338) → (974, 386) → (946, 434) → (972, 482) → B, 1.5 px orange.
  - One segment per eighth note, each 4 frames with a pen head, starting at 123.843, 124.074, 124.305, 124.535 and 124.766. The last ends on f3747.
- **f3747:**
  - The halves split: left rotates −10° about B and moves (−70, +30); right rotates +10° and moves (+70, +30). 12 frames, easeOutCubic.
  - The crack copies turn cream 70 % over 6 frames.
  - Keyword DISHEARTENED, inline keyword, send pulse. Log B11 result. One ripple from (960, 410).
- **125.10 → 125.46:** the halves fall 24 px.
- **125.46 → 125.69:** the halves un-plot.
- **125.508 → 125.689:** the seed scales to 0 as the keyword exits. The stage is empty at 125.689.

### Shot B11: 125.708–128.661 (f3771–f3859) "Challenging your god". Character moment 6, `defy` (window 125.689–131.167)

**Layout** (the art has the raised palm on the viewer's right and the open book on the left):
- **God spark** (PID 1): filled orange, R 100, at (1280, 390).
- **Her box:** h 540, w 360, x 500–860, y 120–660. Screen = (500 + nx·360, 120 + ny·540).

| Anchor (estimate; verify) | (nx, ny) | Screen |
|---|---|---|
| hand (raised palm) | (0.72, 0.14) | (759, 196) |
| book (open) | (0.36, 0.21) | (630, 233) |
| face | (0.50, 0.08) | (680, 163) |
| feet | (0.50, 1.00) | (680, 660) |

**Timeline**
- **125.689 (b272*):**
  - The spark blooms (rays grow from the hub, 0.5-frame stagger, 8 frames), then rotates 8°/s plus a 15° step per beat.
  - `pid 1` (16 px creamDim) centred at (1280, 528), types at 125.80.
- **125.708:** the lyric types. 125.750: log B12.
- **125.689 → 126.151 (b273), scan down:**
  - The 2 px orange line (x 475–885) is first plotted across y 120 in 3 frames, then moves to y 660, linear.
  - `defy_lines` is visible above it. The `y` readout is right-aligned at x 467.
- **126.151 → 126.613 (b274), scan up:** `defy_flat` appears below the line, which vanishes at the top.
- **126.613:** log B12 result.
- **Push:** 1.000 → 1.030, 126.613 → 130.766, anchored at her feet (680, 660).
- **Leaders, one per beat.** Moment-A mechanics: the label types in 5 frames, the orange check follows 4 frames later, the leader runs 40 px horizontal and then to an orange node r 3.5. 1 px cream 45 %.

| Beat | Label | Position | To |
|---|---|---|---|
| b274 126.613 | `book = open` | right-aligned x 450, baseline 300 | book |
| b275 127.074 | `hand = raised` | left-aligned x 910, baseline 170 | hand |
| b276* 127.536 | `obey = false` | right-aligned x 450, baseline 170 | face |

  `book = open` answers the demo's `book = closed`.
- **127.536 (b276) and 127.997 (b277):** the spark emits a 1 px orange 45 % ring, r 100 → 300 over 0.4 s.
- **127.997 (b277, f3840):** challenge line, dashed 1 px cream 45 % (dash 6/6), plotted in 8 frames from the hand (759, 196) toward the hub, stopping 116 px short. It passes below `hand = raised`.

### Shot B12: 128.661–131.200 (f3860–f3936) "You have made some"

- **128.661:**
  - The lyric types. Leaders and labels retract into their nodes (8 frames); the checks un-plot.
  - 128.700: log B13, running (orange pulsing bullet) through the hand-over.
- **128.920 (b279):** the challenge line becomes solid 1.5 px cream 70 % (6 frames).
- **The god loses one ray per eighth note:** at 128.920, 129.151, 129.382, 129.612, 129.843, 130.074, 130.305 and 130.535, rays 0, 6, 3, 9, 1, 7, 4, 10 retract into the hub (6 frames, easeInCubic). This reverses the demo's loading spark. Rotation steps continue.
- **130.766 (b283, f3923), iris close onto the seed:**
  - The seed sets down at C (scale 0 → 1, 4 frames), drawn above everything.
  - A circular clip on the whole moment-6 container (her image layers, spark, challenge line, `pid 1`) shrinks r 560 → 0 around C over f3923–f3935, easeInCubic.
  - A matching 1.5 px cream 45 % outline is drawn only while r ≤ 300 (opacity 0 → 1 over r 300 → 270), so it never touches the header or the composer.
  - The remaining rays 2, 5, 8 and 11 and the hub are clipped as the circle passes x 1180. She is gone once r < 100.
- **f3935:** r = 0. Only the seed remains.

---

# Section C: 131.20–211.96 s (f3936–f6358). Crash, instrumental rebuild, EXECUTION climax, final chorus, love, exit 0

**Measured audio facts:**
- Detected beats sit on the nominal grid at +24 to +43 ms, so the grid holds.
- The 12 EXECUTION LRC stamps fall 0.0–0.3 s before the nearest even beat. Keywords stay on the LRC frames; pulses stay on the beat grid.
- The outro instrumental (191.4–205.8) is bass-heavy and about 25 % quieter.
- **The audio stops hard at 207.08 (f6212)** and is digital silence from about 207.3.

## C.0 Section data (`sections/c.data.ts`)

### C.0.1 UI segments

| from | Composer | Log anchor | Status | Ripple (centre, density) | HUD | Grid tone |
|---|---|---|---|---|---|---|
| 131.200 | shown | (240, 772) | lyric | C, every 4 | full | hi |
| 133.063 | **hidden** (5-frame fade) | **null** (lift-fade) | instr (240, 1000), 5-frame slide | D, every beat | full | hi |
| 133.300 | hidden | (240, 916), fades in over 6 frames | instr | D, every beat | full | hi |
| 140.440 | hidden | (240, 916) | instr | D, every beat + half | full | hi |
| 147.650 | hidden | (240, 916) | instr | D, every beat (+ one-offs on the 19 hit frames 147.66–161.584) | full | hi |
| 162.250 | **shown** (slides up from +140 px, 0.3 s, easeOutCubic) | **null** | lyric (0.3 s slide) | C, every beat | full | **lo** (`grid` #2A2824, 6-frame ramp) |
| 162.632 | shown | (240, 772), fades in | lyric | C, every beat | full | lo |
| 177.240 | shown | (240, 772) | lyric | (1240, 390), every 2 | **light** | hi (6-frame ramp) |
| 188.300 | shown | **null** (6-frame fade) | lyric | (1240, 430), every 2 | light | hi |
| 193.975 | shown | (240, 772), fades in | lyric | C, every 2 | light | hi |
| 200.440 | shown | (240, 772) | lyric | none; the grid retracts (C20) | light | hi |
| 201.365 | shown | (240, 772) | lyric | none (grid off) | full | off |
| 207.080 | shown | (240, 772) | lyric | none | light | off |

**One-off ripples:**
- From D on each climax hit and count word: f4430 … f4848 (the 19 frames in §0.3).
- Double weight on b376 and b380, from C.
- From (1240, 390) on f5509.

**Header path:**

| From | Path |
|---|---|
| inherited | `~/world` |
| 187.665 | `~/world/heart` |
| 193.981 | `~/world` |
| 201.365 | `~` |

### C.0.2 Status verbs

| From | Verb |
|---|---|
| 131.224 | Recovering… |
| 133.063 | Reticulating… |
| 136.755 | Forging… |
| 140.447 | Synthesizing… |
| 144.139 | Coalescing… |
| 147.660 | Executing… |
| 158.900 | Counting… |
| 161.584 | Executing… |
| 177.246 | Pondering… |
| 180.857 | Musing… |
| 184.540 | Manifesting… |
| 188.483 | Lingering… |
| 191.400 | Unwinding… |
| 205.811 | Executing… |
| 207.550 | `Worked for 3m 31s` (static, creamDim, spark static R 11, no counter) |

### C.0.3 Log entries

| t | Call | rt | Result |
|---|---|---|---|
| (B13 resolves at 131.2333) | | | `IllegalArgumentException: god` |
| 131.450 | `TodoWrite(rebuild world)` | 132.140 | `6 todos · 0 done` |
| **133.300** | `Write(pieces.ts)` | 134.909 | `Wrote 36 primitives` |
| 134.950 | `Edit(pieces.ts)` | 136.294 | `rotated 3 × 60°` |
| 136.755 | `Bash(mkdir -p world)` | 137.678 | `world/ ready · 32×18` |
| 138.140 | `Bash(simulate ./world --fast)` | 140.447 | `3 orbits · 540°/s` |
| 140.447 | `Bash(simulate --steps 1e9)` | 141.370 | `running` |
| 142.293 | `Read(world/you.json)` | 143.216 | `0 entities` |
| 144.139 | `Search(pattern: "you")` | 145.062 | `No matches found` |
| 145.985 | `Bash(chmod +x me)` | 146.447 | `ok` |
| 146.447 | `Bash(./world --dry-run)` | 146.908 | `12 targets` |
| 146.908 | `Task(execute ×12)` | 147.370 | `12 agents launched` |
| hit k (147.660 … 158.000) | `Task(execute #01)` … `#12` | next hit | `Done (0.9s)`, `(0.9s)`, `(1.0s)`, `(1.0s)`, `(0.8s)`, `(0.9s)`, `(0.8s)`, `(1.2s)`, `(0.9s)`, `(1.0s)`, `(1.0s)`, `(0.9s)` |
| 158.900 | `Bash(count --to 6)` | 161.124 | `ein dos trois ne fem liu` |
| 161.200 | `Bash(execute --now)` | 161.584 | `executed` |
| 162.700 | `Bash(broadcast --all execute)` | 165.166 | `24/24 delivered` |
| 166.100 | `Bash(pkill --all-but you)` | 168.911 | `23 stopped · 1 left` |
| 169.900 | `Bash(git checkout HEAD~1 -- you)` | 171.400 | `Updated 1 path from HEAD~1` |
| 171.950 | `Bash(simulate ./world --resume)` | 172.712 | `running` |
| 173.700 | `Bash(ls /exit)` | 174.975 | `No such file or directory` |
| 175.100 | `Read(world/bounds.json)` | 176.000 | `walls: 4 · doors: 0` |
| 177.300 | `Read(love.md)` | 179.929 | `Read 1,210 lines` |
| 180.900 | `Search(pattern: "love")` | 181.901 | `Found 2 functions` |
| 182.100 | `Plot(x(t), y(t), 0..2π)` | 183.500 | `ok` |
| 183.646 | assistant text: `Every question reduces to two equations.` | — | (no `⎿` line; cream bullet) |
| 184.600 | `Plot(heart, t: 0..2π)` | 187.665 | `closed curve · 1 region` |
| 193.981 | `Bash(unrender me)` | 194.905 | `merged 1,210 points` |
| 195.827 | `Edit(params.json)` | 196.750 | `6 fields unset` |
| 197.700 | `Write(pieces.ts)` | 199.981 | `Removed 6 primitives` |
| 200.442 | `Bash(rmdir world)` | 201.365 | `world/ removed` |
| 203.211 | `Bash(sandbox --disable)` | 203.673 | `protection off` |
| 205.811 | `world.execute(me)` | 207.080 | `exit 0` |

### C.0.4 Line patches

| Key | Patch |
|---|---|
| `'128.661'` | `kwSize: 120, out: 132.90` |
| `'147.66'`, `'148.6'`, `'149.52'`, `'150.54'`, `'151.52'`, `'152.28'`, `'153.16'`, `'153.98'`, `'155.2'`, `'156.08'`, `'157.04'`, `'158'` | `kwSize: 150, kwY: 430, kwX` from the C6 table |
| `'158.9'` … `'161.124'` | `kwX: 960, kwY: 430` |
| `'161.584'` | `kwY: 430` |
| `'177.246'` | `kwX: 560, kwSize: 160` |
| `'180.857'` | `kwX: 1240, kwSize: 170` |
| `'184.54'` | `kwX: 560, kwSize: 160` |
| `'190.801'` | `kwX: 560, kwSize: 160` |
| `'205.811'` | `out: 207.08, kwOut: 206.88` |

---

## C.1 Shot list

### Shot C1: 131.20–133.063 (f3936–f3991) ILLEGAL ARGUMENTS, hit f3937 (b284*): the crash

- **f3936:** the hand-over state (§H.3).
- **f3937:**
  - Keyword `ILLEGAL ARGUMENTS`: size 120, x 348–1572, baseline 433. Inline keyword. Send pulse.
  - Log B13 result; the bullet turns creamDim.
  - Two argument brackets appear complete, 2 px orange, round caps: left `M 300 130 Q 140 390 300 650`, right `M 1620 130 Q 1780 390 1620 650`.
  - Downbeat ripple from C. The pen dot stays at C.
- **131.450:** log `TodoWrite(rebuild world)`.
- **131.679 (b285):** a 3 px orange strike line draws at y 390 from x 348 to 1572 over 6 frames, linear, with a pen head.
- **132.140 (b286):**
  - Log result.
  - The brackets close on the word: scaleX 1 → 0 about x 960, 132.140–132.550, easeInCubic. The strike line shortens symmetrically into C over the same window.
- **132.333:** keyword exit (6 frames).
- **132.55:** a 1 px cream ring bursts from C: r 0 → 480 over 0.5 s, opacity 0.45 → 0.
- **132.90:** the lyric lift-fades.
- **133.063 (b288):**
  - The composer fades out (5 frames). The log lift-fades out. The status slides to (240, 1000).
  - The pen dot fades over 4 frames as the lattice pens start.
- **Beat accent:** the pen dot pulse; the strike line lands on b285.

### Shot C2: 133.063–136.755 (f3992–f4102) Rebuild 1, "pieces ×36"

- **Lattice:** 9 × 4 cells.
  - Column centres x = 240, 420 … 1680 (step 180). Row centres y = 235, 365, 495, 625.
  - Cell (c, r) holds primitive type `(c + 2r) mod 6`: circle r 22, arc 77 px tall, mirrored arc, 88 px line, triangle (base 77, height 88), rect 31 × 37 (radius 2).
  - 1.5 px cream 70 %.
- **Plotting:** column c starts at `133.063 + 0.2308c`. Its four primitives plot in 4 frames each, so four pen heads run at once.
- **Orange chase**, beats b288–b295 (j = 0–7): cells with `(c + r) mod 8 = j` draw 2 px orange for 6 frames, then return.
- **Rotations:** b292, b293, b294 (134.909, 135.371, 135.832). All primitives rotate +60° about their own centres over 6 frames, easeOutCubic.
- **Implosion:** b295 → b296 (136.294 → 136.755). All glide to D and scale to 0 (easeInCubic), landing on f4103.
- **Logs:**
  - 133.300 `Write(pieces.ts)` → 134.909.
  - 134.950 `Edit(pieces.ts)` → 136.294.

### Shot C3: 136.755–140.447 (f4103–f4212) Rebuild 2, the world at speed

- **Globe at D, r 220:**
  - f4103: the outline blooms r 0 → 220 (6 frames, easeOutExpo), 1.5 px cream 70 %.
  - 136.986: equator (rx 220, ry 40).
  - b297 137.217: parallels (y = 430 ∓ 126, rx 180, ry 32).
  - 137.447: meridians λ = 30°, 60°, 120°, 150°, plus the central vertical.
  - Each takes 6 frames, 1 px cream 45 %.
- **Meridian rotation:** 140°/s from b298, easeInQuad up to 540°/s by b304. Back-facing meridians at 25 %.
- **Orbits:** rx 400, ry 92, 1 px cream 45 %, each plotted in 8 frames: −12° at b298 (137.678), +48° at b300 (138.601), −72° at b302 (139.524).
  - Each carries an orange satellite r 6 at 1 rev per bar, phases 0°, 120°, 240°, with the three-piece trail.
- **Logs:** 136.755 `mkdir`; 138.140 `simulate --fast`.
- **Beat accent:** on b296 and b300 a 1 px orange 45 % ring r 220 → 280 over 0.4 s, fading.

### Shot C4: 140.447–144.139 (f4213–f4323) Rebuild 3, the point engine

- **f4213 (b304):** all globe and orbit strokes cross-fade (3 frames) into N = 1210 points, sampled uniformly by arc length.
  - Points are r 1.8 circles. Orange: `k % 11 = 0` plus the satellite samples; the rest cream.
- **140.447–141.70:** the points flow into a phyllotaxis spiral at D: radius `310·√(k/N)`, angle `k·137.508°`.
  - Assignment by distance rank from D.
  - Each point waits `0.25·k/N` s, then moves for 1.0 s, easeInOutCubic.
- **Spiral rotation:** 20°/s, easeInQuad up to 180°/s by 144.139.
- **Per-beat ripple:** radius × `1 + 0.06·env(t − tb − r/1500)`; off-beat eighths add 0.03.
- **Loading spark at D:** a filled orange hub R 60 appears at f4213. Ray i grows over 4 frames at b(304 + i).
- **Logs:** 140.447 `simulate --steps 1e9`; 142.293 `Read(world/you.json)` → `0 entities`.
- **Beat accent:** on b304 and b308 a 1 px orange 45 % ring r 310 → 360.

### Shot C5: 144.139–147.660 (f4324–f4429) Arming the dial

- **144.139 → 144.600:** all points implode into the hub (easeInCubic). Ray 8 grows on b312.
- **144.600 → 145.985:**
  - The spark grows R 60 → 320 about D (easeInOutCubic). Rays 9, 10 and 11 still grow on b313, b314 and b315.
  - The fill fades 1 → 0 over 144.60–145.00 while a 1.5 px orange outline takes over.
- **f4380 (b316):** the outline settles to 1 px cream 45 % (6 frames). This is **the dial**: 12 empty rays plus the hub outline (r 45), unrotated, ray 0 at 12 o'clock, numbered clockwise.
- **b316–b319:**
  - Each beat sends a 1 px orange 45 % ring R 320 → 420.
  - Ripples run every beat plus half.
  - The log scrolls once per beat: `chmod`, `dry-run`, `Task(execute ×12)`. Each result lands on the same frame as the next call.
- **144.139:** log `Search(pattern: "you")` → 145.062 `No matches found`.
- **f4429:** the dial is alone on stage.

### Shot C6: 147.660–158.900 (f4430–f4766) EXECUTION ×12, pose cuts (climax character window)

These are the only hard cuts after f480. arc_full approves them for the climax.

**Fixed for the whole shot:**
- Dial at D, R 320. Instrumental UI.
- Ripples from D every beat, plus one on every hit.
- **Panels:** 1 px cream 45 % rects with sharp corners. L: x 300–780, y 120–800. R: x 1140–1620, y 120–800. Only one exists at a time; the image is clipped to it.

**On every hit k (frame f_k):**
1. **Hard cut.** The previous pose, panel and readout vanish; the new panel and pose appear complete.
2. **Render pass, f_k → f_k + 6.** A 2 px orange scan line crosses the panel top → bottom.
   - **flat** hits: `X_lines` below the line, `X_flat` above it.
   - **lines** hits: the pose's 1210 points below the line (r 1.8; ink-class points cream 50 %), `X_lines` above.
3. **Readout** (mono 16) at (panel x + 12, 146): `exec 01/12 · stand`. The number is orange, the rest creamDim.
4. **Dial:** ray k − 1 fills orange for f_k to f_k + 2, then stays a 2 px orange outline. Pending rays stay 1 px cream 45 %.
5. A 1 px orange 45 % ring R 320 → 440 over 0.4 s.
6. **Keyword** EXECUTION, size 150, at (kwX, 430), on the side opposite the panel.
7. **Log:** `Task(execute #k)`.
8. **Push:** art scale 1.00 → 1.03 until the next hit, about the face anchor.

**Crops:** the art box is in its own aspect, 938 × 1680 for `a` and 1120 × 1680 for the rest.
- **full:** h 660, top 130, centred on the panel.
- **medium:** h 1100, top 120.
- **close:** h 1700, top 100.
- For medium and close, shift horizontally so the face anchor sits on the panel centre x. Face nx: a 0.50, reach 0.46, float 0.47, defy 0.50, read 0.55, sit 0.62 (verify).

| # | t | f | Pose | Panel | Crop | Treatment | kwX |
|---|---|---|---|---|---|---|---|
| 1 | 147.660 | 4430 | stand `a` | L | full | flat | 1350 |
| 2 | 148.600 | 4458 | reach | R | full | flat | 570 |
| 3 | 149.520 | 4486 | float | L | full | flat | 1350 |
| 4 | 150.540 | 4516 | defy | R | full | flat | 570 |
| 5 | 151.520 | 4546 | read | L | medium | flat | 1350 |
| 6 | 152.280 | 4568 | sit | R | medium | lines | 570 |
| 7 | 153.160 | 4595 | float | L | medium | flat | 1350 |
| 8 | 153.980 | 4619 | defy | R | medium | lines | 570 |
| 9 | 155.200 | 4656 | reach | L | close | flat | 1350 |
| 10 | 156.080 | 4682 | stand `a` | R | close | lines | 570 |
| 11 | 157.040 | 4711 | float | L | close | flat (switch to `lines` if over the orange budget) | 1350 |
| 12 | 158.000 | 4740 | defy | R | close | flat | 570 |

- Keyword spans: x 945–1755 (kwX 1350) or 165–975 (kwX 570). It never overlaps the panel; it crosses only dial hairlines (dimmed 60 %, with a `bg` knockout).

### Shot C7: 158.900–161.584 (f4767–f4847) EIN DOS TROIS NE FEM LIU

- **f4767:**
  - Hard cut: pose, panel and readout removed. The dial (all 12 rays orange outline) stays.
  - Log `Bash(count --to 6)`.
- **Count hexagon:** pointy-top, R 260, centred on D. Vertices v0 (960, 170), v1 (1185, 300), v2 (1185, 560), v3 (960, 690), v4 (735, 560), v5 (735, 300).
- **On word j** (frames 4767, 4780, 4790, 4807, 4821, 4834):
  - An orange node r 5 appears at v_j, with a 16 px creamDim index `j+1` 18 px radially outside it.
  - Edge v_j → v_{j+1} plots in 7 frames, 2 px cream. LIU closes to v0.
  - The word is the stage keyword at (960, 430), size 200, auto exit.
  - Ripple from D.
- **161.124:** log result. 161.200: log `Bash(execute --now)`.

### Shot C8: 161.584–162.632 (f4848–f4878) EXECUTION #13, shockwave

- **f4848:**
  - Keyword EXECUTION (200) at (960, 430). Log `executed`.
  - The dial and hexagon group scales 1 → 2.6 about D over 12 frames (easeOutExpo), opacity 1 → 0, stroke widths kept.
  - A 1 px orange 45 % ring R 320 → 1400 over 0.6 s. Ripple from D.
- **161.98:** a pen dot fades in at D (3 frames) and glides to C, 162.00–162.30 (easeInOutCubic).
- **162.25–162.55:** the composer slides up, empty, with the caret. The status slides to (264, 852). The grid tone drops to `grid`.

### Shot C9: 162.632–166.016 (f4879–f4979) "If I can, if I can give them all the EXECUTION", hit f4955 (dark chorus)

- Grid tone `lo`; ripples every beat from C. Main strokes 2 px; no orange except on hits and the pen.
- **162.632:** "If I can" types; at 163.315 it continues. The log fades in at (240, 772). 162.700: log `broadcast`.
- **Entities:** 24 "you" circles, r 12, 1.5 px cream 70 %, on an invisible ring R 230 about C at `θ_k = −90° + 15°k`.
- **162.632 → 162.90:** the pen rises C → (960, 160).
- **163.315 → 165.00:** the pen travels clockwise along the ring (easeInOutCubic in angle). Circle k plots in 6 frames as the pen reaches θ_k.
- **Beat accent:** from 163.315 the plotted circles scale `1 + 0.3·env`.
- **f4955:**
  - 24 spokes from r 20 to r 218, 4 frames, 1 px cream 45 %.
  - All circles fill cream.
  - A filled orange spark R 40 blooms at C.
  - Keyword, inline keyword, send pulse. Log result.

### Shot C10: 166.016–169.824 (f4980–f5094) "Then I can, then I can be your only EXECUTION", hit f5067

- **166.016:** "Then I can" types; at 167.022 it continues. 166.100: log `pkill`.
- **166.016 → 168.555:** 23 of 24 are removed, one group per eighth note, symmetric about the vertical.
  - Group g starts at `166.016 + 0.2308g`: g0 = {12}, g1 = {11, 13}, … g11 = {1, 23}.
  - Each removal un-plots the spoke and the circle (6 frames each).
- **Beat accent:** the spark at C steps 15° per beat.
- **f5067:**
  - Spoke 0 becomes 2 px orange. Circle 0 becomes a 2 px orange outline (fill dropped).
  - An outer ring r 22 (1 px orange 45 %) plots around it in 6 frames.
  - Keyword, inline keyword, send pulse. Log result.

### Shot C11: 169.824–171.868 (f5095–f5155) "If I can have you back"

- **169.824:** the lyric types. Spoke 0 un-plots (6 frames). 169.900: log `git checkout`.
- **169.85 → 170.25:** a dashed return path plots from (960, 160) to C: quadratic with control (1300, 300), 1 px cream 45 %, dash 6/6.
- **170.30 → 171.40:**
  - The "you" circle and its ring travel along the path to C (easeInOutCubic, about 470 px of path).
  - The path un-plots behind it.
  - The spark shrinks to 0 over the last 6 frames.
- **171.40:** log result. The circle sits on C.
- **171.868:** send pulse.
- **Beat accent:** the travelling circle pulses `1 + 0.3·env`.

### Shot C12: 171.868–173.643 (f5156–f5208) "I will run the EXECUTION", hit f5181

- **171.868:** the lyric types. 171.950: log `simulate --resume`.
- **Progress ring:** r 270 at C, 2 px cream, plotted clockwise from 12 o'clock, easeInQuad, closing on f5181.
- **f5181:**
  - The ring turns 2 px orange.
  - Globe lines plot inside it in 6 frames (equator rx 220 / ry 40, the central meridian and λ meridians), 1 px cream 45 %, rotating at 140°/s.
  - The "you" circle stays at C.
  - Keyword, inline keyword, send pulse. Log result.

### Shot C13: 173.643–177.246 (f5209–f5316) "Though we are trapped / We are trapped ah"

- **173.643 → 173.94:** the ring eases r 270 → 240 and becomes 1.5 px cream 70 %; the globe scales with it. 173.700: log `ls /exit`.
- **Walls:** a square of side 520 at C (x 700–1220, y 130–650). Each side is 2 px cream, plotted in 8 frames with a pen head:
  - b376 173.675: top, left to right.
  - b377 174.137: right, top to bottom.
  - b378 174.598: bottom, right to left.
  - b379 175.060: left, bottom to top.
- **174.975:** "We are trapped ah" types. Log result.
- **175.06 → 176.90:** the square shrinks to side 340 about C (easeInOutCubic). The ring, globe and circle scale with it.
- **b380 (175.521):** a diamond (the square rotated 45°), 1 px cream 45 %, plots in 8 frames and shrinks with the square.
- **Beat accent:** wall opacity 70 % → 100 % on env; double-weight ripples on b376 and b380.
- **175.100:** log `Read(world/bounds.json)` → 176.000.
- **Exit:**
  - 176.70 → 176.97: everything un-plots; the circle shrinks into a pen dot at C.
  - 176.75 → 177.30: the dot glides to (1030, 110), the scan start (about 530 px/s).

### Shot C14: 177.246–180.857 (f5317–f5425) "I’ve studied LO-O-OVE", hit f5398. Character moment 7, `read`

- **Placement:** box h 560, top 110, centred x 1240 (x 1053.3–1426.7). Screen = (1053.3 + nx·373.3, 110 + ny·560).
- **177.246:** the lyric types; the HUD goes light. 177.300: log `Read(love.md)`.
- **177.30:** floor axis at y 670, x 1000–1480, 1 px cream 45 %, ticks every 60 px (6 px), 8 frames.
- **177.367 (b384) → 177.829, scan down:**
  - A 2 px orange line (x 1030–1450) moves 110 → 670, with `read_lines` above it.
  - Readout `y 0412` (16 px creamDim) at x 1458.
- **177.829 → 178.290 (b386), scan up:** `read_flat` is revealed below the line.
- **Leaders, one per beat.** Labels are right-aligned at x 990; same mechanics as moment A, with checks.

| Beat | Label | Baseline | Anchor (verify) |
|---|---|---|---|
| b386 178.290 | `book = open` | 190 | book centre (0.27, 0.22) |
| b387 178.752 | `eyes = lowered` | 250 | face (0.55, 0.09) |
| b388 179.213 | `subject = "love"` | 310 | open page (0.22, 0.20) |

- **Push:** 1.00 → 1.02 about (1240, 390), 178.29 → 180.857.
- **f5398:**
  - Keyword LO-O-OVE at (560, 390), size 160 (x 176–944). Inline keyword, send pulse. Log result.
  - Leaders retract (8 frames).
  - A small heart (the C16 curve at s = 1, 32 × 29 px), 1.5 px orange, plots from its notch at the book anchor in 6 frames.
- **180.857 (f5426):**
  - The fills cut out.
  - `read_lines` cross-fades into `read_points.json` (3 frames; 1210 points, orange for cls 1).
  - The small heart fades (5 frames). The floor axis un-plots (8 frames).

### Shot C15: 180.857–184.540 (f5426–f5535) "Question me, question me I can answer all LO-O-OVE", hit f5509

The composer is the user's question; Claude answers in the log.

- **Panels:** t ∈ [0, 2π] maps to x = 180 + 600·t/2π.
  - **X:** `X(t) = 16 sin³t`, centre line y 230, 5.5 px per unit.
  - **Y:** `Y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t`, centre line y 480, 5 px per unit.
- **180.857:** "Question me" types; at 181.901 it continues. 180.900: log `Search`.
- **180.95 → 181.30:** panel axes plot.
  - Hairlines at y 230 and y 480 (1 px cream 25 %).
  - Ticks at x 180, 480, 780.
  - Labels `0 π 2π` (STIX italic 26, cream 70 %) at y 345 and y 600.
- **180.90 → 182.10, point release** (speed exception, as at 29.69):
  - The top 605 points by ny go to Panel X samples, the rest to Panel Y. Within each half, rank by nx to give sample i, with `t_i = 2π·i/604`.
  - Each point waits `0.25·rank/605` s, then moves for 0.95 s, easeInOutCubic.
- **181.30:** function labels (STIX italic 30, cream 70 %): `x(t) = 16 sin³t` at (180, 128), and `y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t` at (180, 395).
- **181.901:** log result.
- **182.10 → 183.50:** two pens plot both curves (2 px cream, orange pen heads) with easeInOutSine. Each point fades as its pen passes it. 182.100: log `Plot` → 183.500.
- **f5509:**
  - Both curves flash 3 px orange for 3 frames.
  - Keyword at (1240, 390), size 170 (x 832–1648), over the still-empty heart area. Inline keyword, send pulse. Ripple from (1240, 390).
  - Log assistant text.
- **Beat accent:** the pens pulse; grid ripple every beat.

### Shot C16: 184.540–188.483 (f5536–f5653) "I know the algebraic expression of LO-O-OVE", hit f5630

- **Heart:** H = (1240, 354), s 18. Point = `(1240 + 18X, 354 − 18Y)`.
  - Notch (1240, 264), lobe tops ≈ 139, tip (1240, 660), x 952–1528. Perimeter about 1839.
- **184.540:** the lyric types. 184.600: log `Plot(heart …)`.
- **184.54 → f5630:** t runs 0 → 2π linearly (about 588 px/s at the heart pen). Three pens move in sync:
  - Panel X pen, panel Y pen and the heart pen (2 px cream path behind it).
  - Two leaders (1 px cream 45 %) from each panel pen to the heart pen, recomputed per frame.
  - The heart closes at the notch on f5630.
- **Beat accent:** the pens pulse; ripples every 2 beats from (1240, 390).
- **f5630:**
  - The heart becomes 3 px orange.
  - Panels, curves, labels and leaders un-plot over 6 frames.
  - Keyword at (560, 390), size 160. Inline keyword, send pulse. Log result.
  - Header path `~/world/heart`.
- **187.70 → 188.30:** the heart's pen dot glides notch → (1240, 430).
- **188.30:** the log zone fades out.

### Shot C17: 188.483–191.400 (f5654–f5741) "Though you are free / I am trapped / Trapped in LO-O-OVE", hit f5741. Final moment, `sit` in the heart

- **Placement:** sit box h 300, w 200, top 282, x 1140–1340. Screen = (1140 + nx·200, 282 + ny·300).
  - Clipped to the s = 18 heart: the head clears the notch; the skirt is cut into the V.
  - Treatment: `sit_flat`.
- **188.483:** the lyric types.
  - **Heart iris:** clip = (heart scaled k about (1240, 430)) ∩ (heart at k = 1). k 0 → 1 over 188.483–189.05, easeOutExpo. A matching 1.5 px cream 45 % outline is hidden once k ≥ 0.98.
  - **"you are free":** a "you" circle (r 12, 1.5 px cream) plots at (600, 330) and drifts `x = 600 + 140 sin 0.9τ`, `y = 330 + 70 sin 1.4τ`.
- **189.746:** "I am trapped" types. The inner heart (scale 0.93 about (1240, 430), 1 px orange 45 %) plots from its notch in 10 frames.
- **190.751 (b413) on:** the heart group (orange heart, inner heart, clip and art) beats about (1240, 430): `1 + 0.03·env(t − tb) + 0.015·env(t − tb − 0.15)` (lub-dub).
- **190.801:** "Trapped in" types (new line).
- **f5741:** keyword at (560, 390), size 160. Inline keyword, send pulse. An extra beat at 0.05.
- No log; status `Lingering…`.

### Shot C18: 191.400–193.981 (f5742–f5818) The heart beats on as data

- **f5742:** the fills cut out. `sit_lines` cross-fades (3 frames) into `sit_points.json` at her box, clipped to the heart.
- **191.40 → 192.135 (b416):** the points flow (easeInOutCubic, 0.25 s rank stagger) to a uniform heart fill. The targets are a seeded jittered 1210-point grid inside the heart scaled 0.85 about (1240, 430). From 192.135 she is no longer a silhouette.
- **Beat accent:** the lub-dub continues at 0.04 / 0.02 and moves the points with the heart.
- **192.135:** the orange heart goes 2 px cream (6 frames); the inner heart un-plots (8 frames).
- **192.467:** the keyword exits.
- **193.058 (b418):** the "you" circle un-plots.
- **193.356:** the lyric lift-fades. The composer is empty with the caret blinking.

### Shot C19: 193.981–197.673 (f5819–f5929) Un-render

- **193.981 (b420):**
  - The heart un-plots from the notch (10 frames).
  - The log returns. Log `unrender me` → 194.905.
  - Header path `~/world`.
- **193.981 → 195.23:** points flow onto figure F (height 480, top 150, centred x 960, FIG primitives on box x 826–1094).
  - Samples are proportional to path length; assignment is y-rank to y-rank.
  - Each point waits `0.25·rank/N`, then moves 1.0 s, easeInOutCubic.
- **195.25 → 195.65:** F's six strokes plot over the points (1.5 px cream, 6 frames each, 2-frame stagger); points fade as the pens pass.
- **195.827 (b424):** a dashed bbox snaps around F with `object #0001`. Log `Edit(params.json)` → 196.75.
- **196.75 (b426):**
  - The box un-plots.
  - F's primitives glide back to shot 3's positions (P1 … P6), 0.62 s each, 2-frame stagger, landing by 197.45.
  - Each gets its crosshair and label (5-frame fade).
- **Beat accent:** the pen pulse; ripples every 2 beats.

### Shot C20: 197.673–201.365 (f5930–f6040) The pieces are picked up

- **197.700:** log `Write(pieces.ts)` → 199.981.
- **One primitive un-plots per beat** (8 frames with a pen head; labels and crosshairs lift-fade):

| Beat | t | Primitive |
|---|---|---|
| b428 | 197.673 | P6 |
| b429 | 198.135 | P5 |
| b430 | 198.596 | P4 |
| b431 | 199.058 | P3 |
| b432 | 199.519 | P2 |
| b433 | 199.981 | P1 |

  P1's pen ends at (700, 240) and stays as the dot.
- **200.25 → 200.75:** the dot glides to C.
- **200.442 (b434):** log `rmdir world`.
- **200.442 → 201.365:** the grid retracts. A dot is drawn only while its distance from C ≤ `1300 − 1400·(t − 200.442)`.
- **201.365:** the grid is gone. Log result. Header path `~`; HUD full.

### Shot C21: 201.365–205.811 (f6041–f6173) The seed

- The orange pen dot at C pulses every beat.
- **Downbeat rings** at b436 (201.365), b440 (203.211) and b444 (205.057): 1 px cream, r 9 → 600 over 1.2 s, opacity 0.45 → 0.
- **203.211:** log `sandbox --disable` → 203.673 `protection off` (shot 2 reversed).
- **205.057 → 205.70:** a spark outline plots around the dot: R 56, 1 px cream 45 %, ray i starting at `205.057 + 0.05i`, 4 frames each.
- The composer is empty with the caret blinking on beats.

### Shot C22: 205.811–211.96 (f6174–f6358) Final EXECUTION, exit 0

- **f6174:**
  - The spark fills orange (R 56). Keyword EXECUTION (200) at C. Inline keyword, send pulse.
  - Log `world.execute(me)`; the bullet pulses while it runs.
  - Status `Executing…`.
- **b446, b447, b448:** the spark steps 15°.
- **206.880:** keyword exit; gone by f6212.
- **f6212 (207.08, the audio stops):**
  - Log `exit 0`; the bullet turns creamDim.
  - The lyric has lifted out.
  - The spark rotates 4°/s.
  - HUD light (timecode only).
- **f6226 (207.55):** `✻ Worked for 3m 31s`.
- **207.55 → 210.00:** still. On screen: header, empty composer with caret, log (`Bash(sandbox --disable)` at 40 %, current `world.execute(me)` / `exit 0`), the Worked line, and the rotating spark.
- **210.00 → 211.60 (f6300–f6348):** global linear fade to `bg` for everything except the spark (remainder 37 % at f6330, 0 at f6348).
- **211.00 → 211.90 (f6330–f6357):** the spark fades.
- **f6357–f6358:** `bg` only.

---

# D. Character appearances: complete list for the film

These are the only windows in which art pixels, or a point or shard set still shaped like her, may be on screen. Every one uses the design_v3 §5 offline flat 5-tone treatment (`char_v3.py`): no halo, no shadow, no warp or puppeting. Every one arrives and leaves through plotting mechanics.

| # | Window (art or silhouette visible) | arc_full listing | Pose | Box | Arrives by | Leaves by |
|---|---|---|---|---|---|---|
| 1 | 19.07–23.23 (demo) | moment 1 | `a` | x 1025–1495, y 140–980 | scans | points |
| 2 | 29.69–31.80 (demo) | moment 2 | points of `a` | h 480 | point burst | projection |
| 3 | 63.382–66.843 | about 63.5–66.6 | `reach` | viewport x 640–1280, y 110–690 | two-way scan from the pen line, then scan up | two-way scan closing to the pen dot |
| 4 | 85.074–88.536 | 85.0–88.6 | `float` | x 759–1161, y 110–670 (iris at C) | iris from the pen dot | iris closing to the pen dot |
| 5 | 115.997–118.40 | 115.8–118.3 | `sit` | x 1520–1760, y 300–660 | the seed becomes the scan line | fills cut out, lines become shards (scattered from 118.40) |
| 6 | 125.689–131.167 | 125.7–131.2 | `defy` | x 500–860, y 120–660 | scans | iris closing to the seed at C |
| climax | 147.66–158.90 | 147.6–162.6 | a, reach, float, defy, read, sit | panel L / R | hard cut plus a 6-frame scan | hard cut at EIN |
| 7 | 177.367–182.10 (art to 180.857, then points flowing out) | about 177–181 | `read` | x 1053–1427, y 110–670 | scans | points become the function samples |
| final | 188.483–192.135 (art to 191.40, then points to a heart fill) | 186–191.4 | `sit` in the heart | x 1140–1340, y 282–582, heart-clipped | heart iris | points dissolve into a heart fill |

- **Anchors** (all estimates measured on a 10 % grid of the processed art) must be confirmed and stored in `src/v3/char_meta.json` before the moment files are finalised:
  - `reach`: headTop, face, palm, waist.
  - `float`: hairTop, ribbon, handL, handR, book.
  - `defy`: hand, book, face, feet.
  - `read`: book, face, page.
  - `sit`: headTop, face.
  - All six: the face nx for the climax crops.
- **Stage dim:** character layers never dim. They render in `SectionXChar`, outside the dimmed Stage group.

---

# E. Hand-over states

### H.1 At 44.452 (f1334): demo → Section A

**Stage**
- Axis y 620, x 360–1560, with an arrow.
- Orange asymptote at y 220.
- Limit curve to (1368, 226), with the pen head there.
- `L` and `limit = L` labels.
- Stage dim recovering. No keyword.

**UI** (lyric layout)
- Header: `claude ~/world`, `00:44.4 · 130 bpm · beat 096` (b96 lands at 44.459, before this frame at 44.467).
- Log: current `● Bash(limit --x inf)` / `⎿ converges to L`; previous `● Bash(seq 1 inf)` / `⎿ still running…` at 40 %.
- Status: `✻ Plotting… (30s · esc to interrupt)`. "Switching…" takes over at 44.452.
- Composer: empty, caret solid as "Switch my current" starts typing.
- Grid: `gridHi`.

### H.2 At 88.60 (f2658): Section A → Section B (contract)

**Stage:** empty except the orange pen dot at (960, 390), pulsing on beats. EXISTENCE was gone by f2653; the iris, box, leaders and axis were gone by f2656.

**UI** (lyric layout, all at 100 %)
- Header: `claude ~/world`, `01:28.6 · 130 bpm · beat 191`.
- Log at 772/806:
  - Current: `● Bash(assert exists(me))` / `⎿ passed · 1 witness` (creamDim bullet).
  - Previous: `● Bash(purr --freq 25Hz)` / `⎿ purring for you` at 40 %.
- Status: `✻ Switching… (74s · esc to interrupt)` at (264, 852).
- Composer: x 240–1680, y 884–988, with the caret solid at x 304 as "Switch my gender" (88.587) starts typing (0 characters visible).
- Grid: `gridHi`. No ripple is active (the next one is b192 at 88.766).

### H.3 At 131.20 (f3936): Section B → Section C (contract)

**Stage:** empty except the seed at (960, 390). The iris closed on f3935, and no outline, spark, label or art remains.

**UI** (lyric layout)
- Header: `02:11.2 · 130 bpm · beat 283`.
- Composer: "You have made some", fully typed, with the caret idle-blinking.
- Log:
  - Previous at 40 %: `● Bash(sudo kill -9 1)` / `⎿ me is not in the sudoers file. This incident will be reported.`
  - Current: `● world.execute(me, god)` with the orange bullet pulsing (running) and no result yet.
- Status: `✻ Validating… (117s · esc to interrupt)` at 100 %.
- Grid: `gridHi`. The last ripple (130.305) has decayed.

**On f3937** Section C draws:
- the keyword (size 120);
- the brackets;
- B13's result;
- the send pulse;
- the stage dim.

Section B draws nothing for this hit.

### H.4 At 211.96 (f6358): end

`bg #0E0D0C` only, with no grid, header, UI or spark. The audio has been silent since 207.08.

---

# F. Persistent UI timeline, 0–211.96 s

| From | Composer | Log zone | Status line | Header (path · right side) | Grid | Ripples (centre · density) | Notes |
|---|---|---|---|---|---|---|---|
| 0.00 | plotted 0–0.30 | hidden | none | hidden | off | none | seed at C |
| 0.30 | lyric | lyric (240, 772) | none | hidden | off | none | |
| 1.536 | lyric | lyric | none | `~` · full | wakes radially from C, `grid` | C · every 4 | header fades in |
| 12.612 | lyric | lyric | none | `~/world` · full | `gridHi` | C · every 4 | |
| 13.40 | lyric | lyric | lyric (264, 852) | `~/world` · full | hi | C · every 4 | |
| 15.842 | fades out (5 frames) | lyric | slides to instr (240, 1000) | full | hi | C · every 4 | title flight |
| 16.00 | hidden | hidden | instr | full | hi | (960, 540) · every 2 | the hard cut |
| 18.611 | hidden | hidden | instr | full | hi | (1260, 560) · every 2 | moment 1 |
| 19.073 | hidden | instr (240, 916) | instr | full | hi | (1260, 560) · every 2 | |
| 22.76 | hidden | instr | instr | full | hi | (1260, 560), then (960, 500) from 23.226 · every beat; + eighths from 27.841 | |
| 29.30 | slides up | hidden | lyric | full | hi | (960, 500) | |
| 29.709 | lyric | lyric | lyric | full | hi | (960, 400) · every 2 | verse 1 |
| 44.452 | lyric | lyric | lyric | full | hi | C · every 2 | Section A |
| 51.370 | lyric | lyric | lyric | full | hi | C · every beat | |
| 56.900 | lyric | lyric | lyric | full | hi | C · every beat + eighths | |
| 62.900 | lyric | **hidden** | lyric | full | hi | C · every 4 | moment 3, KW-low |
| 66.600 | lyric | lyric | lyric | full | hi | C · every beat + eighths | |
| 73.980 | lyric | lyric | lyric | full | hi | C · every 2 | |
| 85.060 | lyric | **hidden** | lyric | full | hi | C · every 4 | moment 4, KW-low |
| 88.420 | lyric | lyric (fades in f2653–f2658) | lyric | full | hi | C · every 4 | |
| 88.60 | lyric | lyric | lyric | full | hi | C · every 2 | Section B |
| 99.80 | lyric | lyric | lyric | full | hi | C · every beat (+ eighths 105.37–106.31 and 109.06–110.30) | |
| 110.90 | lyric | lyric **70 %, previous hidden** (from 110.92) | lyric **45 %** | full | hi | C · every 4 | "you have left", moment 5 |
| 117.20 | lyric | 70 % | 45 % | full | hi | one slow ripple from (1640, 480) at f3518 | |
| 118.305 | lyric | lyric 100 % | lyric 100 % | full | hi | one-off from (1640, 480); every 2 from C from 118.50 | |
| 124.80 | lyric | lyric | lyric | full | hi | one-off from (960, 410) at f3747 | |
| 125.68 | lyric | lyric | lyric | full | hi | (1280, 390) · every 2, then every beat from 128.90 (+ eighths 129.40–130.20) | moment 6 |
| 130.40 | lyric | lyric | lyric | full | hi | none | |
| 131.20 | lyric | lyric | lyric | full | hi | C · every 4 | Section C, crash |
| 133.063 | **hidden** | hidden | instr | full | hi | D · every beat | instrumental |
| 133.300 | hidden | instr (240, 916) | instr | full | hi | D · every beat | |
| 140.440 | hidden | instr | instr | full | hi | D · every beat + eighths | |
| 147.650 | hidden | instr | instr | full | hi | D · every beat + 19 hit one-offs | **climax state**: panels, dial, keyword at y 430 (size 150 / 200) |
| 162.250 | slides up | hidden | lyric | full | **lo (`grid`)** | C · every beat | dark chorus |
| 162.632 | lyric | lyric | lyric | full | lo | C · every beat | |
| 177.240 | lyric | lyric | lyric | **light** (timecode only) | hi | (1240, 390) · every 2 | love |
| 187.665 | lyric | lyric | lyric | `~/world/heart` · light | hi | (1240, 390) · every 2 | |
| 188.300 | lyric | **hidden** | lyric | light | hi | (1240, 430) · every 2 | final moment |
| 193.975 | lyric | lyric | lyric | `~/world` (193.981) · light | hi | C · every 2 | |
| 200.440 | lyric | lyric | lyric | light | **retracting** to 0 at 201.365 | none | |
| 201.365 | lyric | lyric | lyric | `~` · full | off | none | the seed |
| 207.080 | lyric (caret idle) | lyric | lyric | light | off | none | the audio stops |
| 207.550 | lyric | lyric | `✻ Worked for 3m 31s` (static, creamDim) | light | off | none | |
| 210.00 | | | | | | | global fade to `bg` (to 211.60). The spark is exempt and fades 211.00–211.90 |

**Stage keyword positions by state:**

| State | Keyword |
|---|---|
| Lyric | centre C (standard), or KW-spark centred on x 960 |
| Character moments 3 and 4 | KW-low at baseline 790 |
| Instrumental | none |
| Climax | y 430, kwX 1350 / 570 / 960 |
| Love | x 560, or 1240 at f5509 |

---

# G. Build notes (consolidated)

### G.1 What already exists and is reused

**Infrastructure** (already in the repo, keep using it):
- `FullMV.tsx`: layer order; Verse gated by `AUTO_FROM`; `SectionX`, `SectionXChar` and `SectionXTop` mounts.
- `tl.ts`:
  - `Log.runs` (B7 repeat mode).
  - `UiSeg` with `log`, `status`, `ripple{cx, cy, every, half}`, `hud`, `logO`, `logPrev`, `statusO`.
  - `Ripple` one-offs.
  - `LinePatch` with `kwStyle` `'spark' | 'low' | 'low-spark'`.
- `data.ts` `buildAuto`: lines from the LRC, continuations as `marks`, auto `out` and `kwOut`, patches keyed by line start.
- `ui.tsx`:
  - `StageKeyword` (kwStyle, x/y/size, `bg` knockout).
  - Double ripple on spark keywords.
  - `LogZone` with `runs`.
  - `StatusLine` with the "Worked for" text.

**Drawing helpers:**
- `geo.tsx`: `Plot`, `PenHead`, `circlePath(a0)`, `ellipsePath(rot)`, `ngonPath`, `polyPath`, `fnPath`, `pointAt`, `Spark`, `Check`, `Arrow`, `Elbow`, `Bullet`.
- `core.ts`: `beat`, `beatIndex`, `env`, `pulse`, `ease`, `prog`, `rng`.
- `sections/A_lib.tsx`: `beatSteps`, `antsOffset`, `Txt`, `Retype`, `kv`, `LeaderLabel`, `arcPath`.
- `sections/B_util.tsx`: `Stroke`, `Seg`, `ArcStroke`, `KV`, `typed`, `RaySpark`, `beatEnv`, `subPoly`.
- `sections/B_shards.ts`.
- `sections/B_pre.tsx`: B1–B4 in progress.
- `shots/Execute.tsx`: the moment A scan and leader code. `shots/Points.tsx`: the point canvas. `shots/Intro.tsx`: globe, orbit, satellite.

### G.2 Shared changes needed before the parallel build (owner E0)

1. **`tl.ts` / `ui.tsx` grid:**
   - `UiSeg.gridTone?: 'hi' | 'lo' | 'off'`, with a 6-frame colour ramp between `grid` and `gridHi`.
   - `UiSeg.retract?: {t0, t1, cx, cy}` to draw dots only within `R(t) = 1300·(1 − (t − t0)/(t1 − t0))`.
   - `off` hides the grid.
2. **Header path list:** `PATHS = [{t: 0, '~'}, {12.612, '~/world'}, {187.665, '~/world/heart'}, {193.981, '~/world'}, {201.365, '~'}]`. This replaces the hard-coded `t ≥ 12.612`.
3. **Assistant-text log entry:** a `Log` with `res: ''` renders a cream bullet and the text at weight 400, with no elbow and no result line.
4. **End of film:**
   - `GlobalFade from={210.0} to={211.6}`.
   - Add a `SectionCEnd` layer mounted **after** `GlobalFade` that draws only the final spark (C22), with its own fade 211.00–211.90.
5. **Keyword sanity assertion** at build time: for consecutive keywords, `out + 6/30 ≤ next.t + 1/30` (the latest keyword wins on shared frames). Also extend the no-CJK regex assertion to `sections/*.ts(x)`.
6. **Data files:**
   - Fill `sections/a.data.ts` from §A.0 and `sections/c.data.ts` from §C.0.
   - `b.data.ts` is already correct (mirrored spark at (1280, 390)).
7. **Shared character helpers.** New `sections/char.tsx`, lifted from `Execute.tsx` and `A_lib.tsx`:
   - `ArtLayer {pose, box, push, origin, clip}`: places `X_flat` / `X_lines` by box and anchors, never dimmed.
   - `ScanReveal {box, yLinesFrom/To, yFlatFrom/To, lineX0/X1, readoutX}`: two inset clips, an orange 2 px line and a 4-digit readout.
   - `TwoWayScan` (moment 3).
   - `IrisClip {r, cx, cy}` and `PathIris {d}` (heart): CSS `clip-path` circle or path.
   - `Leader {label, side, x, baseline, node, t0}`: 5-frame typing, check at +4 frames, a 40 px horizontal and then a diagonal to the node, retract.
   - `anchor(pose, name)`, which reads `char_meta.json`.
8. **`geo.tsx` Spark:** move `RaySpark` in from `B_util`, with `grow(i)`, `rayStyle(i) → {fill, stroke, w, opacity}`, and animatable R and `outline`. It is used by the god spark (B11/B12), the loading spark and dial (C4–C8) and the final spark (C21/C22).
9. **Point canvas:** export a generic `<PointCanvas xy: Float32Array, cls: Uint8Array, r, clipPath?>` from `shots/Points.tsx`. Each section file computes its own positions as pure functions of t.
10. **Anchors:** measure and store the anchors listed in §D.

### G.3 Trickiest parts and how to build them

1. **A20 travelling wave / rectify:** one `fnPath` (420 samples) per frame with the blended formula; the probe is the same function at x 1368.
2. **A21 aperture:**
   - Blade angle `a_i + 120°`: do not use V_{i+1} − V_i, which is degenerate at ρ 0.
   - Ray-circle intersection for blade ends.
   - Even-odd `bg` mask above the eye and below the blades.
3. **A23 year axis:** animate `v_cur` only. Ticks for `u = 100m` (skipping m = 0) with |x − 960| ≤ 860. The reveal is a clipPath rect.
4. **A24:** the Venn lens is two inner arcs, with `circlePath` at d = 0. The tunnel draws k from `ceil(z − 7)` to `floor(z + 6)`, with opacity from radius.
5. **A28 billiards:** precompute at module load with dt 1/120 from 70.766 to 73.845, reflecting `v −= 2(v·n)n` at |p − C| ≥ 186. Store positions and hit times.
6. **A29/A30 eggplant union:** sample each ellipse (160 points) and classify each point as inside or outside the other ellipse. Emit outside runs at 100 % and inside runs at 25 %. The same code drives the tomato morph.
7. **Moment 3 two-way scan:**
   - Nested clips: the outer is the frame inset; the inner are the `lines` band `inset(yTop … (1080 − yBot) …)` and the `flat` band `inset(yScan … 0 …)`.
   - The push is a `scale` with transform-origin at the palm.
8. **B1 morph:** compute stem and barb endpoints from q per frame and draw plain paths. `Plot` is only for the initial draw.
9. **B5 strings:** rebuild `fnPath` every frame (6 × 200 samples) and use `pen={false}` after plotting, to avoid `pathLen` cache churn.
10. **B7 wheel:** six owned arcs; spokes recomputed from the drifting seed each frame.
11. **B9 shards:** each shard is drawn in `<g transform="translate rotate scale">` about its centroid. The sweep start is `f3626 + round(18r/(N − 1))`.
12. **B12 / A32 / C17 irises:**
    - Put the art plus the clipped SVG in one div with `clip-path: circle()` (or `path()` for the heart).
    - Draw the outline and the seed outside that div.
    - Never use SVG filters.
13. **C2:** 36 primitives in `<g rotate translate scale>`.
14. **C3/C12:** the globe from `Intro.tsx`, parameterised by centre and r.
15. **C4 / C14–C19:** one 1210-point array per file. Precompute targets per state (globe samples, spiral, hub; read silhouette, panel samples; sit silhouette, heart fill, F samples). Every `_points.json` has exactly 1210 `[nx, ny, cls]`.
16. **C6 `PoseCut`:**
    - A panel div with `overflow: hidden`, holding `X_lines`, `X_flat` and a points canvas, each with an inset clip driven by the scan y.
    - Render pose k only for `f_k ≤ frame < f_{k+1}`, with no pre-roll.
17. **C16 heart:**
    - `heartPath(s, k, cx, cy)`: 720 samples starting at the notch (t = 0), cached.
    - The iris is the intersection of two nested `clip-path: path()` wrappers.
18. **C20 grid retract:** see the `UiSeg.retract` note in §G.2 item 1.

### G.4 Speed-limit exceptions

All of these are deliberate and short:
- Scans, plots, clips and implosions (design_v3 precedent).
- A19 temporary end pens.
- C2 implosion (one beat).
- C8 shockwave (12 frames).
- The C15 point release.
- B3 swap (610 px/s peak).

Everything else is ≤ 600 px/s, with at most 2 groups moving at once.

### G.5 Orange-budget frames to measure

Limit: 8 % outside the 3-frame keyword fill. Pixels counted: hue 10–25°, sat > 0.35, including orangeDeep.

| Frames | Content |
|---|---|
| f1859 | 16 nodes, impulses, spark |
| f2078 | triangle fill, spark |
| f3307 | ring |
| f3626 | selected shards |
| f4656, f4711, f4740 | climax close-ups. If over budget, switch hit 11 to `lines` first, then hit 9 |
| f5630 | 3 px heart |

### G.6 Readability rules (checked)

- Every keyword sits on an empty stage or over hairlines dimmed to 60 %, with the `bg` knockout.
- Spark keywords are centred as groups.
- KW-low is used only while the log is hidden.
- Exceptions handled in their shots:
  - B5 dims the strings to 45 %.
  - B8 places her outside the glyphs.
  - B9 sweeps the shards away before the outline phase.
  - In C6 the panel is always opposite the keyword.
  - In C16 the panels un-plot as the keyword lands.

### G.7 Client-rule and forbidden-list check

**Geometry and effects**
- No pixel looks or stepped reveals (the scans are continuous inset clips).
- No gradients, glow, blur, shadow, glitch or shake. The C8 shockwave is a scale of line art, not a camera move.

**Colour**
- No second accent: no green checks and no red errors. CONFLICT and Exception are plain creamDim text.

**Text**
- All on-screen strings are Latin or ASCII, plus `’ · × … ° ² ³ π ω` (the Greek subsets are loaded).
- No `→ ∞ ≈` typed. Arrows are drawn `Arrow`s.
- `♀` and `♂` are never typed: they are built from a circle plus lines.
- The count words are Latin.
- No CJK anywhere, including `lyrics_zh.json`, which must never be imported.

**Claude elements throughout**
- Composer, log and status are on screen at every moment of 44.452–207.55 except the instrumental and the hidden-log windows. Even then the status line and header remain.
- The spark appears in the KW-spark keywords, the palm spark, the god spark, the loading spark and dial, the C9–C10 spark and the final spark.

**Character**
- She is only in the §D windows. Her point and shard derivatives are confined to those windows (fix 10).
- The hard cuts after f480 are only the climax pose cuts approved in arc_full, plus EIN (f4767).

### G.8 Static-hold audit

The longest stretch with no new element entering is B8's 117.27–118.305 (1.0 s), which is intentional.

Every other window of 4 s or more has a new composition:
- A23: the scrolling axis plus a hop.
- C6: a cut every 0.8–1.2 s.
- C21: a ring every bar, then the spark at 205.06.

The only longer still image is the end card, 207.55–210.00 (2.45 s, the spark rotating), followed by the fade.

---

# H. Build plan

### P.1 Phase 0: prerequisites (lead engineer **E0**, day 1)

E0 does every item in §G.2:
- `tl.ts`, `ui.tsx` (grid tone, retract, header paths, assistant text, end fade).
- `geo.tsx` (`RaySpark` with `rayStyle`).
- `shots/Points.tsx` (export `PointCanvas`).
- New `sections/char.tsx`.
- `a.data.ts` and `c.data.ts` filled.
- `char_meta.json` anchors.
- `FullMV.tsx` (`SectionCEnd` after `GlobalFade`).
- The debug sync overlay with all frames in §0.3.

**Interface freeze.** The component signatures in `char.tsx` and the `RaySpark` props are agreed on the morning of day 1, so E1–E6 can start against them immediately.

### P.2 Phase 1: shot files, one owner each, built in parallel

Each file exports `Stage`, `Char` and `Top` (React.FC). `sections/A.tsx`, `B.tsx` and `C.tsx` just compose their two files.

Each file renders only its own elements. Outgoing tails (un-plots of 10 frames or fewer) are drawn by the file that created them, even past its boundary. The incoming file draws the seed or pen dot from its first frame.

| Owner | File | Shots | Time range | Frames | Character moments | Main reused helpers |
|---|---|---|---|---|---|---|
| E1 | `sections/A_pre.tsx` | A19–A25 | 44.452–62.589 | f1334–f1877 | none | `Plot`, `fnPath`, `ngonPath`, `circlePath`, `A_lib` |
| E2 | `sections/A_post.tsx` | A26–A32 | 62.589–88.60 | f1878–f2657 | 3 `reach`, 4 `float` | `char.tsx` (`TwoWayScan`, `IrisClip`, `Leader`), Intro globe, `ellipsePath` |
| E3 | `sections/B_pre.tsx` (exists; extend) | B1–B6 | 88.60–110.90 | f2658–f3326 | none | `B_util`, `fnPath`, `Spark` |
| E4 | `sections/B_post.tsx` | B7–B12 | 110.90–131.20 | f3327–f3935 | 5 `sit`, 6 `defy` | `char.tsx` (`ScanReveal`, `Leader`, `IrisClip`), `B_shards`, `RaySpark` |
| E5 | `sections/C_instr.tsx` | C1–C10 | 131.20–169.824 | f3936–f5094 | climax (12 pose cuts) | `PointCanvas`, `RaySpark` dial, Intro globe, `PoseCut` (local) |
| E6 | `sections/C_outro.tsx` (+ `SectionCEnd`) | C11–C22 | 169.824–211.96 | f5095–f6358 | 7 `read`, final `sit` | `char.tsx` (`ScanReveal`, `Leader`, `PathIris`), `PointCanvas`, `heartPath` (local) |

### P.3 Internal hand-overs between files

| Boundary | State | Owner |
|---|---|---|
| **62.589 (E1 → E2)** | Pen dot at C. STIMULATIONS gone. Spokes, nodes and counter un-plotting until f1882. Log A8 is current. | E1 draws the tails; E2 draws the pen dot from f1878. |
| **88.60 (E2 → E3)** | H.2 | |
| **110.90 (E3 → E4)** | Ring r 230 at C, 1.5 px cream 70 % (flash recovered). Six "you" nodes at θk, r 12. Six spokes, 1 px cream 45 %. Seed at C. COMPLETION gone at f3327. | E4 draws all of these from f3327 (E3 stops at f3326). |
| **131.20 (E4 → E5)** | H.3 | |
| **169.824 (E5 → E6)** | Circle 0 at (960, 160), r 12, 2 px orange outline, with ring r 22 (1 px orange 45 %). Spoke 0 (2 px orange, r 20–218). Spark R 40 filled orange at C (15° beat steps). Grid tone `lo`. EXECUTION gone at f5095. | E6 draws all of these from f5095. Spoke 0 un-plots in C11. |

### P.4 Integration and QA (E0, end of the build)

1. Scrub every sync frame in §0.3 against the waveform.
2. Check that the four contract frames (f1334, f2658, f3936, f6358) match §E pixel-for-pixel in structure.
3. Run the orange-budget script on the §G.5 frames.
4. Run the no-CJK assertion.
5. Do a speed audit: the maximum per-frame displacement of every pen and group, flagging anything over 20 px/frame outside §G.4.
6. Do a full render, and review it at 25 % speed on the four character moments for halos or white fringes.

### P.5 Assets and the GPT fallback

All raster material for this spec exists in `public/char` (six poses × flat, lines, alpha and points). **No generation is required.**

As the user asked, any material that does turn out to be needed is generated with GPT image generation. This applies only if a pose fails QA: an anchor that is unusable at the climax close crop, an orange budget that cannot be met, or a defect after flattening.

**Request:**
- Attach the existing `a` art as the character reference.
- Canvas: 2:3 portrait, at least 1120 × 1680.
- Plain pure-white background, the whole figure in frame with margin, no text, no ground shadow, clean cel shading with crisp dark outlines.

**Shared description:**
> "the same girl as the reference: very long straight orange hair to the knees, orange sunburst flower ornament with black ribbon on the right of her head, amber eyes, pale skin, white blouse with ruffled high collar and black cravat, white capelet with an orange sun emblem, black corset belt with gold buttons, long layered skirt with white pleated centre, orange and black side panels with gold trim, orange sunburst flowers and black bows, white frilled hem, white lace-up boots"

Append the pose line from arc_full's table.

**Processing:**
1. Run `python3 scripts/char_v3.py <png> <pose>`.
2. Hand-correct the face label map.
3. Re-measure the anchors.
4. Reject any result with colours outside the five tokens after flattening, or with a cropped figure.

Generated art is never placed unprocessed.
