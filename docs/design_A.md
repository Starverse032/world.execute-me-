# Section A: 44.452–88.60 s — "Pre-chorus 1, Chorus 1, Verse 2"

This section continues docs/design_v3.md. All of these carry over unchanged: tokens (§2.1), type (§2.2), line weights (§2.3), zones (§2.4), motion rules (§2.5), the forbidden list (§2.6) and the persistent-UI behaviour (§3).

- Times are in seconds. `f` = frame at 30 fps.
- Beat n is at `t_n = 0.151 + 0.4615·n`. `*` marks a downbeat (n % 4 = 0).
- `C` = (960, 390).
- "Plot" means a dash-offset draw with a pen head at the tip. "Un-plot" is the reverse.
- "Lift-fade" means rise 14 px and fade over 5 frames.

---

## A.0 Section data

### A.0.1 Beat grid for this range

| Bar | Beats (t / frame) |
|---|---|
| b96* 44.459 f1334 | b97 44.920 f1348 · b98 45.382 f1361 · b99 45.843 f1375 |
| b100* 46.305 f1389 | b101 46.766 f1403 · b102 47.228 f1417 · b103 47.689 f1431 |
| b104* 48.151 f1445 | b105 48.613 f1458 · b106 49.074 f1472 · b107 49.536 f1486 |
| b108* 49.997 f1500 | b109 50.459 f1514 · b110 50.920 f1528 · b111 51.382 f1541 |
| b112* 51.843 f1555 | b113 52.305 f1569 · b114 52.766 f1583 · b115 53.228 f1597 |
| b116* 53.689 f1611 | b117 54.151 f1625 · b118 54.613 f1638 · b119 55.074 f1652 |
| b120* 55.536 f1666 | b121 55.997 f1680 · b122 56.459 f1694 · b123 56.920 f1708 |
| b124* 57.382 f1721 | b125 57.843 f1735 · b126 58.305 f1749 · b127 58.766 f1763 |
| b128* 59.228 f1777 | b129 59.689 f1791 · b130 60.151 f1805 · b131 60.613 f1818 |
| b132* 61.074 f1832 | b133 61.536 f1846 · b134 61.997 f1860 · b135 62.459 f1874 |
| b136* 62.920 f1888 | b137 63.382 f1901 · b138 63.843 f1915 · b139 64.305 f1929 |
| b140* 64.766 f1943 | b141 65.228 f1957 · b142 65.689 f1971 · b143 66.151 f1985 |
| b144* 66.613 f1998 | b145 67.074 f2012 · b146 67.536 f2026 · b147 67.997 f2040 |
| b148* 68.459 f2054 | b149 68.920 f2068 · b150 69.382 f2081 · b151 69.843 f2095 |
| b152* 70.305 f2109 | b153 70.766 f2123 · b154 71.228 f2137 · b155 71.689 f2151 |
| b156* 72.151 f2165 | b157 72.613 f2178 · b158 73.074 f2192 · b159 73.536 f2206 |
| b160* 73.997 f2220 | b161 74.459 f2234 · b162 74.920 f2248 · b163 75.382 f2261 |
| b164* 75.843 f2275 | b165 76.305 f2289 · b166 76.766 f2303 · b167 77.228 f2317 |
| b168* 77.689 f2331 | b169 78.151 f2345 · b170 78.613 f2358 · b171 79.074 f2372 |
| b172* 79.536 f2386 | b173 79.997 f2400 · b174 80.459 f2414 · b175 80.920 f2428 |
| b176* 81.382 f2441 | b177 81.843 f2455 · b178 82.305 f2469 · b179 82.766 f2483 |
| b180* 83.228 f2497 | b181 83.689 f2511 · b182 84.151 f2525 · b183 84.613 f2538 |
| b184* 85.074 f2552 | b185 85.536 f2566 · b186 85.997 f2580 · b187 86.459 f2594 |
| b188* 86.920 f2608 | b189 87.382 f2621 · b190 87.843 f2635 · b191 88.305 f2649 |

### A.0.2 Lyric lines

Add these to `LINES`. Use typographic apostrophes `’`.

- **New field `cont: true` (continuation lines):**
  - The line has **no exit** and **no send pulse**.
  - The next line starts with the same text, so typing resumes from the current character count with no clear.
  - Typing rate for the next line = `max(40, fullLen / 0.4)` chars/s, counted from the already-typed prefix.
- **New field `kwStyle`:**
  - `spark`: the chorus variant.
  - `low`: the character-moment variant.
  - Omitted: the standard verse-1 display.
  - Both variants are defined in A.0.3.

| s (frame) | out | text | kw | kwT (frame) | kwOut | kwStyle |
|---|---|---|---|---|---|---|
| 44.452 (f1334) | 45.850 | Switch my current | | | | |
| 45.850 (f1376) | 47.672 | To AC to DC | | | | |
| 47.672 (f1430) | 49.534 | And then blind my vision | | | | |
| 49.534 (f1486) | 51.363 | So dizzy so dizzy | | | | |
| 51.363 (f1541) | 53.225 | Oh we can travel | | | | |
| 53.225 (f1597) | 55.083 | To A.D to B.C | | | | |
| 55.083 (f1652) | 56.916 | And we can unite | | | | |
| 56.916 (f1707) | 59.223 | So deeply so deeply | | | | |
| 59.223 (f1777) | cont | If I can | | | | |
| 59.687 (f1791) | 62.589 | If I can give you all the | STIMULATIONS | 61.958 (f1859) | 62.389 | spark |
| 62.589 (f1878) | cont | Then I can | | | | |
| 63.535 (f1906) | 66.601 | Then I can be your only | SATISFACTION | 65.397 (f1962) | 66.401 | low + spark |
| 66.601 (f1998) | 68.252 | If I can make you happy | | | | |
| 68.252 (f2048) | 70.084 | I will run the | EXECUTION | 69.259 (f2078) | 69.884 | spark |
| 70.084 (f2103) | 71.764 | Though we are trapped | | | | |
| 71.764 (f2153) | 74.045 | In this strange strange | SIMULATION | 73.169 (f2195) | 73.845 | spark |
| 74.045 (f2221) | 75.422 | If I’m an eggplant | | | | |
| 75.422 (f2263) | 77.576 | Then I will give you my | NUTRIENTS | 76.959 (f2309) | 77.376 | |
| 77.576 (f2327) | 79.226 | If I’m a tomato | | | | |
| 79.226 (f2377) | 81.351 | Then I will give you | ANTIOXIDANTS | 80.620 (f2419) | 81.151 | |
| 81.351 (f2441) | 82.833 | If I’m a tabby cat | | | | |
| 82.833 (f2485) | 85.078 | Then I will purr for your | ENJOYMENT | 84.268 (f2528) | 84.878 | |
| 85.078 (f2552) | 86.538 | If I’m the only god | | | | |
| 86.538 (f2596) | 88.587 | Then you’re the proof of my | EXISTENCE | 87.922 (f2638) | 88.387 | low |

- **Keyword exit:** `kwOut` = `min(next line start − 0.20, hit + 1.10)`.
- **Keywords visible** (hit to kwOut + 6 frames): STIMULATIONS f1859–1877, SATISFACTION f1962–1997, EXECUTION f2078–2102, SIMULATION f2195–2220, NUTRIENTS f2309–2326, ANTIOXIDANTS f2419–2440, ENJOYMENT f2528–2551, EXISTENCE f2638–2657.
- **Sync-test frames** (add to the debug overlay): 1859, 1962, 2078, 2195, 2309, 2419, 2528, 2638.

### A.0.3 Stage keyword variants

**Standard** (verse 2: NUTRIENTS, ANTIOXIDANTS, ENJOYMENT)
- Exactly §3: centred (960, 390), size 200, baseline 462, underline at 490.
- Stage dim to 60 %.

**KW-spark** (chorus: STIMULATIONS, EXECUTION, SIMULATION). This reads as `✻ KEYWORD`, a rhyme with the status line.
- **Layout:** size 200. Let `w = 0.6 × 200 × chars`.
  - A filled orange spark, R = 84, sits left of the word with a 36 px gap.
  - The group is centred on x = 960, so the word is centred at x = 1062 and the spark centre is at `x = 942 − w/2`, y = 390.
- **Positions:**

| Keyword | Spark centre | Word x-range |
|---|---|---|
| STIMULATIONS | (222, 390) | 342–1782 |
| EXECUTION | (402, 390) | 522–1602 |
| SIMULATION | (342, 390) | 462–1662 |

- **Underline:** under the word only.
- **Spark:**
  - Blooms on f0: rays grow from the hub, 0.5-frame stagger, 4 frames, easeOutExpo.
  - Stays filled while the word goes outline-only at f+3..f+11.
  - Rotates 8°/s, plus a 15° step on every beat (6 frames, easeOutCubic).
  - Exits with the word: 6-frame fade plus 12 px rise.
- **Hit-frame extras:** send pulse and a *double* grid ripple (rings at f0 and f0+3, both from C). Stage dim to 60 %.

**KW-low** (character moments: SATISFACTION, EXISTENCE). This keeps her undimmed and the word readable.
- **Size and position:** 120 px, baseline y = 790, underline 3 px at y = 807, width `0.6 × 120 × chars`.
  - The word sits in the log band, which is hidden during both moments (A.0.5).
  - Cap top ≈ 702, so it clears her frame (bottom 690) and the status line (cap top 836).
- **EXISTENCE:** centred x 960 (636–1284), no spark.
- **SATISFACTION:** low + spark.
  - Spark R = 50 at (517, 747); 22 px gap.
  - Word centred at x = 1021 (589–1453).
- **No stage dim on character layers.** The dim applies only to stage geometry (construction lines, leaders, boxes).

### A.0.4 Log entries

Add these to `LOGS`. The `t` row types `● Tool(args)`; the result `⎿` appears at `rt`.

| # | t | call | rt | result |
|---|---|---|---|---|
| 1 | 44.470 | `Bash(git switch current)` | 45.382 | `Switched to branch 'current'` |
| 2 | 45.900 | `Bash(rectify --full-wave)` | 47.228 | `DC · ripple 0%` |
| 3 | 47.700 | `Edit(eyes.css)` | 49.074 | `visibility: hidden` |
| 4 | 49.560 | `Bash(watch -n 0.1 spin)` | 50.459 | `dizzy, dizzy` |
| 5 | 51.400 | `Bash(travel --to "1 B.C")` | 54.151 | `no year 0 · skipped` |
| 6 | 55.100 | `Bash(git merge you)` | 56.920 | `Merged · 0 conflicts` |
| 7 | 56.950 | `Bash(cd deeper/deeper/deeper)` | 58.766 | `depth 6` |
| 8 | 59.700 | `Bash(send stimuli/* --to you)` | 61.958 | `16 sent · 16 received` |
| | | *(log hidden 62.920–66.613, moment 3)* | | |
| 9 | 66.650 | `Bash(if happy(you); then ./run.sh; fi)` | 67.997 | `true` |
| 10 | 68.270 | `Bash(./run.sh --execution)` | 69.259 | `running · pid 1` |
| 11 | 70.100 | `Bash(exit)` | 71.228 | `exit: not permitted in simulation` |
| 12 | 71.780 | `Bash(simulate ./world)` | 73.169 | `running · 2 entities` |
| 13 | 74.070 | `Write(eggplant.svg)` | 75.382 | `2 ellipses · 1 star` |
| 14 | 75.450 | `Read(usda/eggplant.json)` | 76.959 | `25 kcal · 3 fields` |
| 15 | 77.600 | `Bash(mv eggplant.svg tomato.svg)` | 78.151 | `renamed · r = 130` |
| 16 | 79.250 | `Search(pattern: "free radical")` | 80.620 | `Found 12 · 12 neutralized` |
| 17 | 81.370 | `Write(cat.svg)` | 82.766 | `3 triangles · 1 circle · 1 M` |
| 18 | 82.850 | `Bash(purr --freq 25Hz)` | 84.268 | `purring for you` |
| | | *(log hidden 85.074–88.305, moment 4)* | | |
| 19 | 88.305 | `Bash(assert exists(me))` | 88.536 | `passed · 1 witness` |

- Snap `rt` to frames as before.
- **Remove** the demo's last entry: `world.execute(me)` / `exit 0` at 44.455.

### A.0.5 Persistent UI visibility, 44.452–88.60

| Element | State |
|---|---|
| Background, dot grid (`#34312C`) | Always |
| Header | Always. `claude ~/world`; right side `mm:ss.s · 130 bpm · beat nnn` keeps running |
| Composer + lyric | Always, lyric layout (x 240–1680, y 884–988) |
| Log zone | Lyric layout: latest entry at 772/806, previous at 696/730 (40 %). **Hidden** 62.920–66.613 and 85.074–88.305 (see the bullets below this table) |
| Status line | Always at x 264, baseline 852. Format `✻ Verb… (Ns · esc to interrupt)`, N = floor(t − 13.89): 30 at 44.452, 74 at 88.60. The `✻ Worked for 46s` swap at 44.455 is **removed** |
| Stage keyword | 8 windows (A.0.2) |
| Global fade | **Removed** from this range |

- **Log hide:** lift-fade on b136 (f1888–f1892) and on b184 (f2552–f2556).
- **Log return:** the whole zone fades in over 6 frames.
  - On b144 (f1998) it shows entry 8 as current. Entry 9 pushes it up at 66.650.
  - On b191 (f2649) entry 19 pushes in at once, with entry 18 as the 40 % previous entry.
- **Status verbs:**

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

- **Send pulses:** every keyword hit, and the `out` of every non-keyword line except the `cont` lines. That gives sends at 45.850, 47.672, 49.534, 51.363, 53.225, 55.083, 56.916, 59.223 (the end of "So deeply…") and 68.252, 71.764, 75.422, 79.226, 82.833, 86.538.

### A.0.6 Grid ripple density (centre always C)

| Window | Ripples |
|---|---|
| 44.452–51.363 | Even beats (b96, b98 … b110) |
| 51.382–56.920 | Every beat |
| 56.920–59.228 | Every beat + off-beat eighths |
| 59.228–62.920 | Every beat + off-beat eighths; double ripple on the STIMULATIONS hit |
| 62.920–66.613 | Downbeats only (b136, b140) |
| 66.613–73.997 | Every beat + off-beat eighths; double ripple on hits |
| 73.997–85.074 | Even beats |
| 85.074–88.60 | Downbeats only (b184, b188) |

The pen head always pulses `1 + 0.5·env`. Each shot below also names a **beat accent** of its own, so beats always read clearly.

---

## A.1 Shot list

### Shot 19 (replaces the demo tail): 44.452–45.850 (f1334–f1375) "Switch my current"

The limit curve reaches its limit, and that limit becomes the power line from shot 1.

- **f1334:**
  - Lyric types.
  - The labels `L` and `limit = L` lift-fade.
  - The axis (y = 620) un-plots from its arrow end leftwards (8 frames, easeInOutCubic). Its arrowhead fades over 4 frames.
  - 44.470: log #1.
- **44.459 (b96) → 44.920 (b97), reaching the limit:**
  - The curve morphs onto the asymptote: `y(x) = 220 + 400·e^(−(x−360)/240)·(1 − m)`, m 0→1, easeInOutCubic.
  - The pen head stays on the curve tip, moving (1368, 226) → (1368, 220).
  - 44.80–44.92: the cream curve, now lying on the line, fades out linearly, leaving the 2 px orange line.
  - Over the same window the orange line extends both ends to x = 120 and x = 1800 (easeInOutCubic), with temporary pen heads at both ends that are removed on arrival.
- **44.920 (b97) → 45.382 (b98):**
  - The line glides from y = 220 to y = 390 (easeInOutCubic, 368 px/s).
  - It cross-fades from 2 px orange to 1.5 px cream 70 %; this is the shot-1 power line.
  - The pen rides it to (1368, 390).
- **Knife switch:**
  - From 44.920, the segment x 1248–1368 becomes a 2 px cream lever hinged at (1248, y_line).
  - It rotates 0° → −30° (opening upward) over 6 frames, easeOutExpo.
  - Hinge contact: circle r = 5, 1.5 px cream. The pen head is the right-hand contact at (1368, 390).
- **45.382 (b98):**
  - The lever snaps −30° → 0° in 4 frames (easeInCubic), landing on f1365.
  - On landing, the lever flashes 3 px orange for 3 frames.
  - Log #1 result.
- **f1365–45.843, current:** 3 px orange dashes (dash 24, gap 96) flow left to right along the whole line at 240 px/s, as a dash-offset over the cream line.
- **Beat accent:** grid ripple on b96 and b98; the hinge contact pulses r 5 → 7.5·env.

### Shot 20: 45.850–47.672 (f1376–f1429) "To AC to DC"

- **45.850:**
  - Lyric types. 45.900: log #2.
  - On b99 (45.843), the lever and hinge un-plot into the line (6 frames), so the line is continuous. The current dashes fade over 6 frames.
- **46.305 (b100*) → 46.766 (b101), AC:**
  - The line becomes a travelling cosine: `y = 390 − A·cos(2π((x − 1368)/240 − (t − 46.305)/0.4615))`, sampled every 4 px over x 120–1800.
  - A grows 0 → 90, easeInOutCubic.
  - The phase velocity is 520 px/s, so a crest passes the probe at x = 1368 on **every beat**. This is the beat accent.
- **Probe:**
  - The pen head stays at x = 1368 and rides `y(1368, t)`.
  - A readout `V = +0.81` (16 px creamDim) sits at (1388, pen.y − 18). V = (390 − y)/90, signed, 2 decimals.
- **Labels at 46.305:**
  - `AC`: mono 22, cream 70 %, left-aligned at (120, 250), types in 3 frames.
  - `V = A cos ωt`: STIX italic 30, cream 70 %, right-aligned at (1800, 250), types in 5 frames.
- **46.766 (b101, f1403), full-wave rectify:**
  - `y = 390 − A·lerp(c, |c|, m)`, m 0→1 over 6 frames (easeInOutCubic), where c is the cosine term. The negative lobes flip up.
  - The math label retypes to `V = A |cos ωt|`.
- **47.228 (b102, f1417), DC:**
  - `y = 390 − A·lerp(|c|, 2/π, s)`, s 0→1 over 8 frames (easeInOutCubic). The result is a flat line at y = 332.7.
  - `AC` retypes to `DC`. The math label retypes to `V = 2A/π`.
  - A dashed reference line appears at y = 390 (1 px cream 45 %, dash 6/6, x 120–1800).
  - A dimension marker is drawn at x = 1500: a vertical 1 px cream 45 % line from 390 to 333, with 8 px end ticks.
  - The probe readout settles at `V = +0.64`.
  - Log #2 result.

### Shot 21: 47.672–49.534 (f1430–f1485) "And then blind my vision"

- **47.672:** lyric types. 47.700: log #3.
- **47.689 (b103) → 48.151:**
  - Labels lift-fade. The reference line and marker un-plot (6 frames).
  - The DC line glides from y = 332.7 to 390 and contracts to x 640–1280 (easeInOutCubic).
  - The pen rides its right end to (1280, 390).
- **48.151 (b104*, f1445), eye opens:**
  - The line splits into two quadratic lids: `M 640 390 Q 960 (390 ∓ 2h) 1280 390`.
  - h goes 0 → 110 over 8 frames, easeInOutCubic. The almond is 640 × 220. 1.5 px cream.
- **48.381 (eighth, f1451):** iris circle r = 80 at C, plotted from 12 o'clock in 6 frames, 1.5 px cream.
- **48.613 (b105, f1458):**
  - Pupil: an orange filled circle r = 26 at C, scaling in over 4 frames (easeOutExpo).
  - A 1 px cream 45 % ring at r = 40.
  - The pupil pulses r × (1 + 0.15·env) on beats.
- **48.843 (f1465):** aperture housing: circle R = 150 at C, 1 px cream 45 %, plotted in 6 frames. Six blades appear fully open (ρ = 150).
- **48.843 → 49.074 (b106, f1472), shutter closes:**
  - ρ goes 150 → 0, easeInCubic, reaching exactly 0 on f1472.
  - Hexagon vertex: `V_i = C + ρ(cos a_i, sin a_i)` with `a_i = −90° + 60°i + 40°(1 − ρ/150)`.
  - Blade i is a 1.5 px cream line from V_i at angle `a_i + 120°`, out to the housing circle.
  - The mask is circle R150 minus hexagon V_0..V_5, filled `bg` with the even-odd rule. It hides the iris and pupil as the blades close.
  - At ρ = 0 the shutter reads as a disc with 6 radii. Log #3 result.
- **49.074 → 49.536:** the lids close (h 110 → 0, easeInCubic) into a flat line under the closed shutter.
- **Beat accent:** pupil pulse (b104, b105); the shutter close lands on b106; the lid close lands on b107.

### Shot 22: 49.534–51.363 (f1486–f1540) "So dizzy so dizzy"

- **49.534:** lyric types. 49.560: log #4.
- **49.536 (b107):**
  - The flat line un-plots from both ends into C (8 frames).
  - The housing, blades and mask fade over 6 frames.
- **Five concentric polygons around C:** pointy-top, plotted from the top vertex clockwise in 6 frames each, one per eighth note.

| k | Shape | R | Stroke | Plot starts |
|---|---|---|---|---|
| 0 | triangle | 60 | 2 px orange | 49.536 (f1486) |
| 1 | square | 110 | 1.5 px cream 100 % | 49.767 (f1493) |
| 2 | pentagon | 160 | 1.5 px cream 70 % | 49.997 (f1500) |
| 3 | hexagon | 210 | 1.5 px cream 70 % | 50.228 (f1507) |
| 4 | heptagon | 260 | 1.5 px cream 45 % | 50.459 (f1514) |

- **Rotation:**
  - `θ_k = (−1)^k · [ω_k·(t − t_k) + 15°·(beat steps since 49.536, each eased 6 frames, easeOutCubic)]`, with ω_k = 24 + 12k °/s.
  - Even k turn clockwise, odd k anticlockwise.
- **50.459 (b109, the second "so dizzy"), wobble:**
  - The centre of polygon k orbits: `C + a·(cos ψ_k, sin ψ_k)`, `ψ_k = 2π(t − 50.459)/0.923 − 0.35k`.
  - a ramps 0 → 16 px over 4 frames.
  - This gives a lagging spiral. It is geometry only; there is no camera move.
  - Log #4 result.
- **Beat accent:** the 15° steps, plus the triangle stroke at 3 px for 3 frames on every beat.
- **51.150 → 51.382 (b111):**
  - All polygons scale to 0 toward their centres (easeInCubic, staggered from the outside in by 1 frame).
  - a → 0.
  - At f1541 only the pen head at C remains.

### Shot 23: 51.363–55.083 (f1541–f1651) "Oh we can travel / To A.D to B.C"

**Year axis.**
- **Coordinates:**
  - Signed year u: A.D years are positive and B.C years negative; the boundary is u = 0 and there is no year 0.
  - Display offset: `v(u) = 0.24·u + 60·sign(u)` px (0.24 px per year, plus a 120 px gap at the boundary).
  - Screen position: `x = 960 + v(u) − v_cur(t)`, on y = 390.
- **Axis line:**
  - 1 px cream 45 %, drawn as two segments: the B.C side from 120 to `x_b − 60` and the A.D side from `x_b + 60` to 1800, where `x_b = 960 − v_cur`.
  - Gap ends: 2 px orange ticks, 24 px tall (y 378–402).
  - Inside the gap: `no year 0`, mono 16 creamDim, centred at (x_b, 396).
  - Above the gap: `B.C` right-aligned at x_b − 70 and `A.D` left-aligned at x_b + 70, mono 20 creamDim, y = 360.
- **Ticks:**
  - Minor every 100 years: 1 px cream 45 %, 8 px.
  - Major every 500 years: 1 px cream 70 %, 16 px, with a label at baseline 436 (mono 20 creamDim, centred), for example `1500 A.D` or `500 B.C`.
  - No label at the boundary.
- **Cursor:**
  - A 2 px orange vertical tick at x = 960 (y 370–410), with the pen head at (960, 390).
  - Readout centred at (960, 340), mono 22: `year = ` in cream 70 %, then the value in cream, for example `2026 A.D`.
  - The year is derived from v_cur (formula in A.3). While v_cur is inside the gap, it shows `1 A.D` when v_cur > 0 and `1 B.C` otherwise.

**Timeline**
- **51.382 (b111, f1541):**
  - The axis reveals from the cursor outwards. A clip x ∈ [960 − 840p, 960 + 840p] opens over 8 frames (easeInOutCubic), with pen heads at both clip edges on the axis.
  - Ticks and labels are revealed by the same clip.
  - v_cur = v(2025.5) = 546.1, so the readout shows `2026 A.D` and the boundary sits at x = 414.
  - 51.400: log #5.
- **51.843 (b112*) → 53.228 (b115):**
  - v_cur 546.1 → 60.12 (u = 0.5), easeInOutSine. Peak 551 px/s.
  - Everything scrolls right: we travel back. The readout counts down to `1 A.D`.
- **53.228 → 53.689:** hold. Lyric "To A.D to B.C" types at 53.225.
- **53.689 (b116*) → 54.151 (b117, f1625), the hop:**
  - v_cur 60.12 → −60.12, easeInOutSine. The gap slides under the cursor.
  - The cursor pen hops in an arc: `y = 390 − 40·sin(π·p)`.
  - On landing (f1625): both gap ticks flash 3 px for 3 frames, the readout shows `1 B.C`, and log #5 result appears.
- **54.151 → 55.074 (b119):** v_cur −60.12 → −179.9 (u = −499.5), easeInOutSine. The readout settles at `500 B.C`.
- **Beat accent:** every beat the cursor tick extends to 56 px (y 362–418) and returns over 6 frames; plus grid ripple every beat.

### Shot 24: 55.083–59.223 (f1652–f1776) "And we can unite / So deeply so deeply"

- **55.074 (b119) → 55.30:**
  - Ticks, labels and readout lift-fade.
  - The axis un-plots into the cursor using the reverse of the 8-frame clip.
  - The cursor tick fades. The pen head stays at C.
  - 55.083: lyric types. 55.100: log #6.
- **55.536 (b120*, f1666), two circles:**
  - The pen splits into two pen heads that glide to (880, 390) and (1040, 390) in 4 frames.
  - They then plot circle **A** (centre (760, 390), r = 120, starting at 3 o'clock, clockwise) and circle **B** (centre (1160, 390), r = 120, starting at 9 o'clock, anticlockwise), 10 frames each, 1.5 px cream.
  - Labels `A` and `B` (STIX italic 32, cream 70 %) are centred on each circle at baseline 246.
  - Dimension line between the centres at y = 560: 1 px cream 45 %, with 8 px end ticks.
  - `d = 400` (STIX italic 28, creamDim) centred at (960, 592).
- **Approach on beats:**
  - d = 300 at b121 (55.997), d = 180 at b122 (56.459), d = 0 at b123 (56.920, f1708).
  - Each step is eased over 8 frames (easeInOutCubic). Centres are at `960 ∓ d/2`.
  - The `d =` label updates at each step.
- **Lens:** while d < 240, the intersection lens (two arcs between `(960, 390 ± √(120² − (d/2)²))`) is drawn as a 2 px orange outline.
- **f1708 (d = 0):**
  - The lens becomes the full circle: a single 2 px orange circle r = 120 at C.
  - `A` and `B` lift-fade; `A = B` types, centred at (960, 246).
  - The label `d = 0` turns orange, and the dimension line collapses into its centre (6 frames).
  - Log #6 result. 56.950: log #7.
- **"So deeply", 57.382 (b124*) → 58.536:** six inner rings `r_k = 120·0.72^k` (86, 62, 45, 32, 23, 17), 1 px cream 70 %, each plotted in 4 frames. Each starts on an eighth note: 57.382, 57.613, 57.843, 58.074, 58.305, 58.536.
- **58.305 (b126), tunnel zoom:**
  - The ring radii become `r_k(t) = 120·0.72^(k − z)` with `z = (t − 58.305)/0.2308`. That is one ring step per eighth note, so it loops seamlessly.
  - Draw rings with 12 ≤ r ≤ 560. Fade in over r 12 → 20; fade out over r 400 → 560.
  - Ring k = 0 (the united circle) stays orange.
  - Growth at r = 400 is 569 px/s.
  - The `A = B` and `d = 0` labels lift-fade at 58.305.
  - 58.766 (b127): log #7 result.
- **Beat accent:** every beat and eighth, ripples; the pen head at C pulses.

### Shot 25: 59.223–62.589 (f1777–f1877) "If I can / If I can give you all the STIMULATIONS", hit 61.958 = f1859

- **59.223:** "If I can" types (cont). At 59.687 it continues typing " give you all the" with no clear. 59.700: log #8.
- **59.228 (b128*, f1777), chorus downbeat:**
  - Over 8 frames the tunnel's z jumps by +3 (easeOutExpo) while every ring fades linearly to 0.
  - At the same moment, 16 spokes shoot out from r = 40 to r = 260 at angles `−90° + 22.5°·i`: 1 px cream 45 %, drawn outward over 6 frames, easeOutExpo.
  - Hub: 1 px cream 45 % circle r = 40, with the pen head at C.
  - Spoke-end nodes: r = 4, 1 px cream 70 % outline, appear on arrival.
- **Impulses:**
  - Each impulse is a 3 px orange 36 px segment that travels r 40 → 260 in 12 frames, linear (550 px/s).
  - On arrival, the node fills orange and a 1 px orange 45 % ring grows r 4 → 24 while fading over 9 frames.
  - Spoke order P = [0, 9, 4, 13, 2, 11, 6, 15, 1, 8, 5, 12, 3, 10, 7, 14].
  - Two spokes launch per beat: b129 59.689 (P0, P1), b130 60.151 (P2, P3), b131 60.613 (P4, P5), b132* 61.074 (P6, P7).
  - The remaining eight launch together at f1847 and arrive exactly on f1859.
- **Counter:**
  - `sent = n / 16` (mono 22: key cream 70 %, value cream), right-aligned at (1800, 170), types at 59.689.
  - n updates on arrivals: 2, 4, 6, 8, then 16 on f1859.
- **f1859:**
  - All 16 nodes are orange.
  - KW-spark STIMULATIONS (spark at (222, 390), word x 342–1782).
  - Inline keyword, send pulse, double ripple, stage dim.
  - Log #8 result.
- **62.459 (b135):**
  - The spokes un-plot inward (8 frames). Nodes fade (6 frames); the counter lift-fades; the hub un-plots.
  - The pen stays at C.
- **Beat accent:** the hub circle pulses r 40 × (1 + 0.25·env); impulse launches land on beats.

### Shot 26: 62.589–66.613 (f1878–f1997) "Then I can / Then I can be your only SATISFACTION", hit 65.397 = f1962. Character moment 3, pose `reach`

The full spec is in A.2. In outline:

- **62.589:** "Then I can" types (cont). At 63.535 it continues with " be your only".
- **62.920 (b136*, f1888):** the log hides.
- **Two-way scan open:**
  - The pen dot stretches into a 2 px orange line, x 620–1300, over 4 frames.
  - The line splits: one half to y = 110, the other to y = 690, linear, landing at 63.382 (f1901).
  - Her line art is revealed between the two lines, inside the frame x 640–1280.
- **63.382 → 63.843:** a single scan rises 690 → 110, revealing her flat fills.
- **64.305 (b139):** palm node and reticle.
- **f1962:** touch ripple, palm spark, KW-low + spark SATISFACTION.
- **66.613 (b144, f1998):** the two-way scan closes back to y = 390 in 7 frames and contracts into the pen dot at C by 66.843.
- **Beat accent:** downbeat ripples only; the palm node pulses on b139–b143.

### Shot 27: 66.601–70.084 (f1998–f2102) "If I can make you happy / I will run the EXECUTION", hit 69.259 = f2078

- **66.601:** lyric types. The log returns (A.0.5). 66.650: log #9.
- **66.843 → 67.074:** the pen glides from C to (960, 470).
- **67.074 (b145, f2012), smile:**
  - `y = 470 − 0.0025·(x − 960)²` for x 760–1160 (ends at y = 370), 2 px cream.
  - Plotted from the middle outward by two pen heads, 8 frames.
- **67.536 (b146, f2026):**
  - Eyes: filled cream dots r = 7 at (880, 320) and (1040, 320), scaling in over 4 frames (easeOutExpo).
  - Face circle r = 230 at C: 1 px cream 45 %, plotted from 12 o'clock over 14 frames with a pen head.
  - `happy(x) = x²` (STIX italic 30, cream 70 %, superscript by baseline shift) left-aligned at (1230, 520), types in 5 frames.
- **67.997 (b147, f2040):**
  - The smile flashes 3 px orange for 3 frames, then returns to 2 px cream over 6 frames.
  - The eyes morph into closed happy arcs: polyline (−14, 6), (0, −6), (14, 6) relative to each eye, 2 px cream, over 4 frames.
  - Log #9 result `true`.
- **68.459 (b148*, f2054):**
  - The face, eyes, smile and label un-plot or fade over 6 frames.
  - A play triangle ▶ (circumradius 120 around C, vertices (900, 286.1), (1080, 390), (900, 493.9)) is plotted clockwise from (900, 286.1), 1.5 px cream.
  - It runs 24 frames with easeInQuad and **closes exactly on f2078**.
  - Label `./run.sh` (mono 22, creamDim) left-aligned at (900, 548).
  - 68.270: log #10.
- **f2078:**
  - The triangle fill is solid orange for 3 frames, then a 2 px orange outline.
  - **Radial burst:** 24 rays at 15° steps, 1 px cream. Inner end r 150 → 480, outer end r 170 → 520 over 10 frames (easeOutExpo). Opacity 0.7 → 0 over f+4..f+14. Clipped to the stage rect (x 120–1800, y 110–660).
  - KW-spark EXECUTION (spark at (402, 390)), inline keyword, send pulse, double ripple, stage dim.
  - Log #10 result.
- **Beat accent:** ripples on every beat and eighth; the eyes pulse r 7 × (1 + 0.4·env).

### Shot 28: 70.084–74.045 (f2103–f2220) "Though we are trapped / In this strange strange SIMULATION", hit 73.169 = f2195

The globe from shot 6 returns.

- **70.084:** lyric types. 70.100: log #11 (`Bash(exit)`).
- **70.305 (b152*, f2109):**
  - The triangle and label un-plot (6 frames).
  - The globe outline (circle r = 200 at C, 1.5 px cream 70 %) is plotted from 12 o'clock in 8 frames.
- **Globe lines,** each plotted in 8 frames, 1 px cream 45 %:
  - b153 70.766: equator, rx 200, ry 36.
  - b154 71.228: parallels at ±35°: centres y = 390 ∓ 114.7, rx 163.8, ry 29.5. Log #11 result `exit: not permitted in simulation`.
  - b155 71.689: meridians λ = 30°, 60°, 120°, 150° (rx = 200·|sin λ|, ry = 200) plus the central vertical. Rotation λ += 40°/s from 71.764. Meridians with cos λ < 0 drop to 25 % (as in shot 7).
- **"We", from 70.766 (b153):**
  - "me": orange filled r = 5, starting at (930, 390), velocity (160, −110) px/s.
  - "you": cream 1.5 px outline r = 6, starting at (990, 390), velocity (−130, 150) px/s.
  - Both bounce off the inner circle r = 186 (specular reflection). They do not collide with each other.
  - On each wall hit, a 10 px radial tick (1 px cream) appears on the globe outline outside r = 200 and fades over 8 frames.
  - Both dots pulse on beats (1 + 0.5·env).
- **71.764:** "In this strange strange" types. 71.780: log #12.
- **Tilts:** the whole globe group rotates about C: −15° on b156 (72.151*), +15° on b157 (72.613), 0° on b158 (73.074). Each 8 frames, easeInOutCubic. The dots are not rotated.
- **f2195:**
  - Meridian rotation ramps 40 → 140 °/s over 4 frames.
  - An orbit ellipse (rx 400, ry 92, rotated −12°, 1 px cream 45 %) snaps in. Its back half behind the globe disc is hidden (Intro.tsx logic).
  - An orange satellite (r = 6) orbits once per bar (1.846 s), with the three-piece trail (17° each, 3 px, opacity 1 / 0.6 / 0.3).
  - KW-spark SIMULATION (spark at (342, 390)), inline keyword, send pulse, double ripple, stage dim.
  - Log #12 result.
- **73.845:** the billiards stop. Both dots glide to C (easeInOutCubic, 0.385 s). "you" fades as it arrives; "me" becomes the pen head.
- **73.997 (b160*):** the globe lines un-plot (8 frames, reverse). The orbit and satellite fade over 6 frames.

### Shot 29: 74.045–77.576 (f2221–f2326) "If I’m an eggplant / Then I will give you my NUTRIENTS", hit 76.959 = f2309

**Specimen layout.**
- The eggplant is built from two ellipses, rotated −20° (SVG rotate(−20)) about (800, 400).
- Post-rotation geometry:

| Part | Geometry |
|---|---|
| E1 body | centre (818.8, 451.7), rx 100, ry 125, rot −20° |
| E2 neck | centre (774.4, 329.5), rx 62, ry 85, rot −20° |
| Calyx | 5-point star, outer 46, inner 20, centred (750.4, 263.7), rot −20° |
| Stem | 2 px line from (750.4, 263.7) to (731.6, 212.1) |

- All strokes are 1.5 px cream.

**Timeline**
- **74.045:** lyric types. 74.070: log #13.
- **74.230 → 74.459:** the pen glides from C to E1's local 3 o'clock, (912.8, 417.5).
- **74.459 (b161):** E1 is plotted clockwise from there (16 frames).
- **74.920 (b162):** E2 is plotted from its local 3 o'clock, (832.7, 308.3) (12 frames).
- **75.382 (b163, f2261):**
  - The calyx star is plotted from its top point (6 frames); the stem follows (4 frames).
  - The arcs of each ellipse that lie inside the other fade to 25 % over 6 frames, so the union outline reads as the eggplant and the rest as construction.
  - A dashed box (1 px cream 45 %, dash 6/6) snaps in at x 680–950, y 188–598, with `object #0002` (16 px creamDim) at baseline (680, 180). This is a callback to `object #0001`.
  - Log #13 result.
- **75.422:** lyric types. 75.450: log #14.
- **75.843 (b164*):** labels type in 5 frames:
  - `x²/a² + y²/b² = 1` (STIX italic 30, cream 70 %, superscripts by baseline shift) at (1000, 240).
  - `a = 100 · b = 125` (mono 20, creamDim) at (1000, 278).
- **Beat accent (all specimen boxes in this verse):** the dashed box's dash offset steps 6 px on every beat ("marching ants", 3-frame ease), plus even-beat ripples.
- **f2309:**
  - The eggplant strokes flash 2 px orange for 3 frames, then return to cream over 6 frames.
  - Three leaders draw over 6 frames with a 2-frame stagger. Each runs from an orange node (r = 3.5) horizontally to x = 960, then diagonally to (990, label baseline − 8).

| Node | Label (at x = 1000) | Baseline |
|---|---|---|
| (868.4, 412.4) | `kcal = 25` | 560 |
| (898.3, 465.4) | `fiber = 3.0 g` | 600 |
| (887.2, 522.6) | `K = 229 mg` | 640 |

  - Labels are mono 22: key in cream 70 %, `=` in creamDim, value in cream. Each types in 5 frames. These are USDA values per 100 g, raw.
  - Standard keyword NUTRIENTS. The labels sit above (240/278) and below (560–640) the keyword band, so they stay readable.
  - Send pulse. Log #14 result.

### Shot 30: 77.576–81.351 (f2327–f2440) "If I’m a tomato / Then I will give you ANTIOXIDANTS", hit 80.620 = f2419

- **77.576:**
  - Lyric types. 77.600: log #15.
  - The leaders retract into their nodes (6 frames). Labels lift-fade; the box un-plots.
- **77.689 (b168*) → 78.613 (b170), morph:**
  - Both ellipses interpolate to one circle: centre (1120, 410), r = 130, rot 0. easeInOutCubic; average speed about 350 px/s.
  - E2 fades out over the last 6 frames.
  - The calyx moves to centre (1120, 280): rotation −20° → 36° (one point down), outer 46 → 52, inner 20 → 22.
  - The stem becomes (1120, 280) → (1120, 250).
- **78.151 (b169):**
  - Rib ellipses (centre (1120, 410), ry 130, rx 45 and rx 95, 1 px cream 25 %) are plotted in 8 frames.
  - `x² + y² = r²` (STIX italic 30, cream 70 %) right-aligned at (900, 240); `r = 130` (mono 20, creamDim) at (900, 278).
  - Log #15 result.
- **78.613:** box snaps in at x 960–1280, y 200–570, with `object #0003` at (960, 190).
- **79.226:** lyric types. 79.250: log #16.
- **Free radicals:**
  - 12 dots. Angle `30°·j + jitter_j` (seeded, ±10°), radius 200–250 (seeded), around (1120, 410).
  - Each is an orange filled r = 3 dot with a 1 px orange 45 % ring r = 8.
  - They drift clockwise around the tomato at 10°/s.
  - They appear 4 per beat on b172* (79.536), b173 (79.997) and b174 (80.459), each scaling in over 3 frames.
  - Beat accent: radicals pulse r 3 × (1 + 0.5·env), plus marching ants.
- **f2419:**
  - The tomato outline flashes orange for 3 frames.
  - A neutralising wave expands: 1.5 px cream circle, r 130 → 320 over 12 frames, linear, opacity 1 → 0.
  - When the wave passes a radical: its dot turns cream, its ring vanishes, and a second cream r = 3 dot appears 6 px beside it (the electron, now paired).
  - `C40H56` (mono 22, cream, with "40" and "56" as subscripts at 15 px, +5 px baseline shift) right-aligned at (900, 600), with `lycopene` (16 px creamDim) at (900, 628).
  - Standard keyword ANTIOXIDANTS. Send pulse. Log #16 result.

### Shot 31: 81.351–85.078 (f2441–f2551) "If I’m a tabby cat / Then I will purr for your ENJOYMENT", hit 84.268 = f2528

- **81.351:** lyric types. 81.370: log #17.
- **81.382 (b176*):**
  - Radicals fade over 6 frames. The ribs, box, calyx and stem un-plot (6 frames). Labels lift-fade.
  - The circle glides (1120, 410) r 130 → (960, 380) r 120, easeInOutCubic, landing on b177.
- **Cat head (centre H = (960, 380), r = 120), 1.5 px cream unless stated:**
  - **81.843 (b177):** ears, plotted simultaneously in 6 frames from their outer base vertex.
    - Left ear: (856.1, 320), (843.0, 230.3), (919.0, 267.2).
    - Right ear: (1063.9, 320), (1077.0, 230.3), (1001.0, 267.2).
  - **82.074 (f2462):** eyes, 6 frames. Almonds centred (915, 380) and (1005, 380), 44 wide, lid control ±24.
    - Pupils: 2 px orange vertical slits, 18 px, centred in each eye; they scale in.
  - **82.305 (b178):**
    - Nose: triangle (952, 406), (968, 406), (960, 416), 4 frames.
    - Mouth: two quadratics from (960, 416) to (946, 426) and to (974, 426).
    - Whiskers, 1 px cream 70 %, drawn outward with a 1-frame stagger: left (905, 410)→(800, 396), (905, 418)→(796, 418), (905, 426)→(800, 440); mirrored about x = 960 on the right.
  - **82.766 (b179):**
    - Tabby "M": polyline (926, 330), (938, 296), (960, 318), (982, 296), (994, 330), 1.5 px orange, 5 frames.
    - Cheek stripes, 1 px cream 70 %: (850, 370)→(876, 374) and (852, 388)→(878, 388), mirrored.
    - Box snaps in at x 770–1150, y 200–530, with `object #0004` at (770, 190).
    - Log #17 result.
- **82.833:**
  - Lyric types. 82.850: log #18.
  - `purr(t) = A sin(2πft)` (STIX italic 30, cream 70 %) at (1200, 240); `f = 25 Hz` (mono 20, creamDim) at (1200, 278).
- **83.228 (b180*), purr wave:**
  - A sine line under the cat: x 760–1160, y = 600, λ = 40 px, 1 px cream 70 %, plotted left to right in 8 frames.
  - Its phase moves one λ per eighth note (173 px/s).
  - Amplitude `A = 4 + 8·env(t − last beat)`. This is the beat accent.
- **f2528:**
  - The eyes swap instantly to closed content arcs: (−22, 4), control (0, −10), (22, 4).
  - The head outline flashes 2 px orange for 3 frames.
  - The purr amplitude jumps to 16 and decays back to the beat value (τ = 0.4 s).
  - Sound arcs: three per side, radii 180/200/220 about H, ±20° around 0° and 180°, 1 px cream 70 %. Each grows +20 px and fades over 10 frames. They repeat on b183 (84.613).
  - Standard keyword ENJOYMENT. Send pulse. Log #18 result.

### Shot 32: 85.078–88.60 (f2552–f2657, hand-over f2658) "If I’m the only god / Then you’re the proof of my EXISTENCE", hit 87.922 = f2638. Character moment 4, pose `float`

- **84.878 → 85.074:**
  - All cat features, the box, labels and purr wave un-plot (6 frames).
  - The head circle glides to C and contracts r 120 → 0 (easeInCubic), leaving the pen head at C on f2552.
- **85.074 (b184*):** the log hides. 85.078: lyric types.
- **Then moment 4 (A.2):**
  - Iris opens 85.074–85.536.
  - z-axis at b185.
  - Leaders at b186 and b187.
  - Boundary release 86.459–86.920.
  - `object #0001` box at b188.
  - KW-low EXISTENCE at f2638.
  - Iris closes 88.305–88.536 into the pen dot at C.
- **86.538:** lyric types.
- **88.305 (b191):** log #19 pushes in as the log returns; result at 88.536.
- **88.387:** keyword exit (gone at f2658). 88.42–88.587: the lyric lift-fades. 88.587: Section B's "Switch my gender" begins.

---

## A.2 Character moments

### Moment 3: 62.920–66.843, pose `reach`, "be your only SATISFACTION"

**Placement (close-up crop)**
- **Frame (viewport):** x 640–1280, y 110–690.
  - Vertical edges: 1 px cream 45 %, drawn by the opening scan.
  - Top and bottom edges: the scan lines settle into them, orange → 1 px cream 45 % over 4 frames.
  - Corner marks: 16 px L-marks, 1.5 px cream 70 %, at 63.382.
  - Label `me.reach(you)` (16 px creamDim) at baseline (640, 100).
- **Art fit rule:**
  - Scale so the head-top anchor is at y = 130 and the waist anchor at y = 690. She shows from head to waist and the rest is cropped by the frame.
  - Horizontal: `(face.x + palm.x)/2 = 960`. If the palm lands beyond x = 1240, shift left until it is at 1240.
  - Clip: `inset(110px 640px 390px 640px)`.
- **Treatment:** the §5 offline process: `reach_lines.png`, `reach_flat.png`, `reach_alpha.png`.

**Timeline**

| t | Event |
|---|---|
| 62.920 (b136*) | The pen dot stretches into a 2 px orange line, x 620–1300, at y = 390 (4 frames, easeOutExpo from the centre) |
| 63.053–63.382 (b137) | The line splits. The upper line goes 390 → 110 and the lower 390 → 690, linear. `reach_lines` is visible between them (clip `inset(yTop … (1080 − yBot) …)` intersected with the frame). Readouts `y 0263` (16 px creamDim, 4-digit current y) ride at x = 1308 on each line |
| 63.382–63.843 (b138) | Scan-up: one orange line 690 → 110. `reach_flat` appears below it, under the lines |
| 63.843 → 66.40 | Slow push: the art scales 1.000 → 1.040, linear, with the transform origin at the palm anchor. The frame stays fixed |
| 64.305 (b139) | Orange palm node r = 3.5. Reticle: 1 px cream 45 % circle with four 8 px ticks (N/E/S/W), r 48 → 24 linear by 65.228. The node pulses on b139–b143 |
| f1962 | Touch: a 3 px orange ring grows r 0 → 160 over 10 frames (easeOutExpo), opacity 1 → 0 over f+4..f+12. A second 1 px orange 45 % ring starts at f+3 and reaches r = 260. The reticle is 2 px orange for 3 frames, then cream. A filled spark R = 22 blooms on the palm and rotates 15° per beat (rhymes with the hair-flower overlay in moment A). KW-low SATISFACTION with spark. No dim on her |
| 66.613–66.843 (b144) | Exit: two orange lines run from 110 → 390 and from 690 → 390. Art is visible only between them. The frame's vertical edges shrink with them. The palm spark scales to 0 when the band passes the palm's y. At 390 the line contracts into the pen dot at C |

### Moment 4: 85.074–88.536, pose `float`, "only god / proof of my EXISTENCE"

**Placement**
- Scale the figure's bbox (from char_meta) to height 560, top at y = 110, centred at x = 960.
- Cap the width at 760 (x 580–1340).
- Drift: translateY 0 → −18 px, linear, over 85.074–88.305. All attached construction (nodes, box) moves with her.
- The art is `float_flat.png`, shown inside an iris clip `circle(r at 960px 390px)`, as in moment C.

**Timeline**

| t | Event |
|---|---|
| 85.074–85.536 (b184*→b185) | Iris opens r 0 → 300, easeOutExpo. A 1.5 px cream 45 % outline grows with it. Hair or hands outside r = 300 are deliberately clipped |
| 85.536 (b185) | z-axis plotted behind her (stage layer): (960, 690) → (960, 100), 1 px cream 45 %, 10 frames, open-V arrowhead. `z` (STIX italic 26, cream 70 %) at (976, 112) |
| 85.997 (b186) | Leader 1 (moment-A mechanics: 40 px horizontal then straight to an orange node; label types in 5 frames, orange check 4 frames later). `gravity = 0`, left-aligned at (1320, 200), to the hair-top anchor |
| 86.459 (b187) | Leader 2: `instances = 1`, right-aligned at (600, 420), to the ribbon/chest anchor |
| 86.459–86.920 | Boundary release: the iris grows r 300 → 640 (easeInOutCubic) so she is unclipped. The outline fades as r goes 420 → 640 |
| 86.920 (b188*) | Box snaps in: dashed bbox + 12 px pad (1 px cream 45 %, dash 6/6), with `object #0001` (16 px creamDim) above its top-left. Marching ants per beat |
| f2638 | The box flashes 2 px orange for 3 frames. An orange check (14 × 10, 2 px) is drawn after `object #0001` over 4 frames. Leader nodes pulse. KW-low EXISTENCE. Stage dim applies to the axis, leaders and box only |
| 88.305 (b191) → 88.536 (f2656) | Leaders retract into their nodes (8 frames); the box un-plots (6); the axis un-plots top-down (8). The iris closes r 640 → 0 (easeInCubic) around (960, 390); its 1.5 px cream outline returns at 45 % once r ≤ 420 |
| f2656–f2658 | The pen head scales 0 → 1 at (960, 390) |

---

## A.3 Build notes

### Removing the demo tail

- **Verse.tsx:**
  - Delete `S19` behaviour, `PEN_GLIDE_*`, `IrisArt`, `IrisLines` and `VerseTop`.
  - In `Limit`, after f1305, replace the floor morph with Shot 19's collapse: `y = 220 + 400·e^(−(x−360)/240)·(1 − m)`, then extend to 120–1800 and glide to y = 390.
  - Keep the pen on the curve tip until 44.459.
- **ui.tsx:**
  - Remove the `WORKED_AT` branch and `GlobalFade` (move it to the end of the film).
  - Raise `END`. Change the `logLayout` and `rippleOnsets` tables to A.0.5 and A.0.6.
- **Data and audio:** remove the last LOGS entry, and remove the audio volume fade at 46 s.

### Persistent UI changes

- **Composer:** add `cont` handling.
  - Skip the 5-frame exit and the send pulse.
  - The next line's typed count starts at the shared-prefix length.
- **StageKeyword:** add a `kwStyle` switch.
  - `spark`: the `Spark` from geo.tsx, filled, R 84 (or 50).
  - `low`: size 120, baseline 790.
  - Exit times come from `kwOut`.
- **stageDim:** in moments 3 and 4, wrap the character layers outside the dimmed `<AbsoluteFill>`.
- **Log hidden windows:** `logLayout` returns opacity 0 with a lift-fade. On return, show the last two entries before the new one, as listed in A.0.5.

### Proposed new files

`shots/PreChorus1.tsx` (19–24), `shots/Chorus1.tsx` (25–28), `shots/Verse2.tsx` (29–32), `shots/MomentReach.tsx`, `shots/MomentFloat.tsx`. Everything stays a pure function of t; seeded randomness comes from `rng`.

### Helpers to reuse

- `Plot`/`PenHead` for every draw.
- `circlePath` (pass a0 to choose the start angle), `ellipsePath` (pass `rot`), `ngonPath` for the polygons, `polyPath`/`fnPath` for the waves and smile.
- `Spark` for the keyword sparks and the palm spark.
- `Arrow`, `Check`, `pulse`, `env`, `prog`, `ease`.

### The trickiest parts

1. **Travelling wave and rectify (Shot 20):** one `fnPath` per frame (420 samples) with the A.1 formula, blended via `m` and `s`. The probe y is the same function at x = 1368.
2. **Aperture (Shot 21):**
   - Compute V_i from ρ. Use blade angle `a_i + 120°`; do **not** derive it from V_{i+1} − V_i, which is degenerate at ρ = 0.
   - Intersect each blade's ray with the housing circle.
   - Mask: `<path d="circle + hexagon" fill={bg} fillRule="evenodd">` placed above the eye and below the blades.
3. **Year axis (Shot 23):**
   - Animate `v_cur` only.
   - Generate ticks for `u = 100m` with `|x − 960| ≤ 860`. Skip m = 0.
   - Readout: if `v_cur ≥ 60`, show `max(1, round((v_cur − 60)/0.24 + 0.5)) A.D`. If `v_cur ≤ −60`, show `max(1, round((−v_cur − 60)/0.24 + 0.5)) B.C`. In the gap, use the sign rule.
   - Reveal and un-reveal use a `<clipPath>` rect x ∈ [960 − 840p, 960 + 840p].
4. **Venn lens:** two SVG arcs between `(960, 390 ± √(r² − (d/2)²))`. Use the inner (sweep-facing) arcs of each circle. When d = 0, draw `circlePath` instead.
5. **Tunnel:** k from `ceil(z − 7)` to `floor(z + 6)`; r_k from A.1; opacity from radius. One function covers both the static phase (z = 0) and the zoom phase.
6. **Billiards (Shot 28):**
   - Precompute at module load: step dt = 1/120 s from 70.766 to 73.845 with reflection `v −= 2(v·n)n` on |p − C| ≥ 186.
   - Store per-frame positions and the hit times. This keeps rendering pure and deterministic.
7. **Eggplant union outline:**
   - Sample each ellipse (`ellipsePath` points, 160 samples).
   - Classify each sample as inside or outside the other ellipse (implicit test in that ellipse's local frame).
   - Emit runs as two polylines: outside at 100 %, inside at 25 % after 75.382.
   - The same code runs during the tomato morph; fade E2 at the end.
8. **Two-way scan reveal (moment 3):**
   - Nest two divs. The outer one is the frame clip `inset(110px 640px 390px 640px)`. The inner ones hold `reach_lines` with `inset(yTop px 0 (1080 − yBot) px 0)` and `reach_flat` with `inset(yScan px 0 0 0)`.
   - Apply the push as `transform: scale(s)` with `transform-origin` at the palm (px).
9. **Iris (moment 4):** reuse the moment-C pattern (`clip-path: circle(...)`). The radius is a piecewise function of t: open, release, close.
10. **Speeds:** every move here averages ≤ 600 px/s. Long glides use easeInOutSine where an easeInOutCubic peak would exceed the limit (shot 23 travel). Scans, plots, clips and implosions follow the demo precedent and are exempt.

### Assets to generate (per the client: generate the needed material with GPT)

Generate two poses with GPT image generation, attaching `ref/claude_char.png` as the character reference. Both need: portrait canvas 9:16 (at least 1024 × 1792), plain pure-white background, full figure in frame with margin, no text, no ground shadow, clean cel shading with crisp dark outlines.

**Shared description:**
> "the same girl as the reference: very long straight orange hair to the knees, orange sunburst flower ornament with black ribbon on the right of her head, amber eyes, pale skin, white blouse with ruffled high collar and black cravat, white capelet with an orange sun emblem, black corset belt with gold buttons, long layered skirt with white pleated centre, orange and black side panels with gold trim, orange sunburst flowers and black bows, white frilled hem, white lace-up boots"

**`reach`:**
> "standing facing the viewer, right arm extended straight toward the viewer with an open palm, slightly foreshortened, left hand holding the closed brown book against her chest, soft gentle smile, eyes open looking at the viewer"

**`float`:**
> "floating upright in mid-air, toes pointing down, both arms spread wide at shoulder height with open palms, calm open eyes, hair and skirt flowing upward and outward as in zero gravity"

**Processing:**
1. Run `python3 scripts/char_v3.py <png> reach` and `python3 scripts/char_v3.py <png> float`. Outputs go to `public/char/{reach,float}_{flat,lines,alpha}.png` plus points and meta.
2. Hand-correct the face label map (per the §7 risk table).
3. Record normalised anchors in `char_meta.json`:
   - reach: `headTop`, `face`, `palm`, `waist`.
   - float: `hairTop`, `ribbon`, `handL`, `handR`, and the bbox.
4. The placement rules in A.2 are written against these anchors, so they hold whatever exact pose comes back.
5. Reject any generation that adds colours outside the five tokens after flattening, or that has a cropped figure.

### Checks

- Extend the no-CJK assertion to the new strings.
- Scrub the sync overlay on f1859, 1962, 2078, 2195, 2309, 2419, 2528 and 2638. Also confirm the f1472 shutter close and the f1625 hop landing.
- Orange budget: check at f1859 (16 nodes, impulses and spark) and f2078 (triangle fill and spark). Each should be under 8 % apart from the 3-frame keyword fill.

---

## A.4 Hand-over state

### At 44.452 (f1334): start, from the demo's shot 18

- **Stage:**
  - Axis y = 620, x 360–1560, 1 px cream 45 %, with a 10 px arrowhead at 1560.
  - Asymptote y = 220, x 360–1560, solid 2 px orange.
  - Limit curve, 2 px cream, from (360, 620) to (1368, 226.0).
  - `L` (STIX italic 40) right-aligned at (340, 234); `limit = L` (creamDim) right-aligned at (1560, 200).
  - Pen head on the curve tip at (1368, 226).
  - Stage dim recovering from 60 % to 100 % over f1334–f1342.
  - No keyword (LIMITATIONS ended at f1333).
- **UI:**
  - Header `claude ~/world`, `00:44.4 · 130 bpm · beat 096`.
  - Log: current `● Bash(limit --x inf)` / `⎿ converges to L` at 772/806. Previous `● Bash(seq 1 inf)` / `⎿ still running…` at 696/730, 40 %.
  - Status `✻ Plotting… (30s · esc to interrupt)`.
  - Composer empty (the previous line finished its lift-fade at f1333); the caret is solid as "Switch my current" starts typing.
  - Dot grid `#34312C`.

### At 88.60 (f2658): end, the contract state

- **Stage:** empty except one orange pen head at (960, 390) (r = 4 dot plus r = 9 ring at 45 %, pulsing on beats). Iris, box, leaders, axis and keyword are all gone; EXISTENCE finished at f2657.
- **UI (lyric-section layout):**
  - Header `claude ~/world`, `01:28.6 · 130 bpm · beat 191`.
  - Log: current `● Bash(assert exists(me))` / `⎿ passed · 1 witness` (creamDim bullet) at 772/806. Previous `● Bash(purr --freq 25Hz)` / `⎿ purring for you` at 696/730, 40 %.
  - Status `✻ Existing… (74s · esc to interrupt)` at (264, 852). Section B swaps the verb.
  - Composer at x 240–1680, y 884–988, with no lyric text. The previous line ended its lift-fade at f2657 and the caret is solid at x = 308 because "Switch my gender" (88.587) starts typing on this frame.
  - Dot grid `#34312C`. No ripple active (the next downbeat is b192 at 88.766).