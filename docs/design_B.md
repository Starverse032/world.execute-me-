# Section B: 88.60–131.20 s (f2658–f3936). Pre-chorus 2, chorus 2, bridge

This section follows the style bible `docs/design_v3.md` exactly. It reuses its palette tokens, fonts, line weights, easing table, forbidden list, layout zones, keyword rules, send-pulse rule, typing rule and log/status components. It adds nothing to the palette and introduces no new fonts. All on-screen strings are listed in the tables below, and every one is Latin or ASCII text.

Conventions: times are in seconds and `f` = round(30·t). `bN` = nominal beat N at `0.151 + 0.461538·N`. **D** marks a downbeat (N divisible by 4). C = (960, 390).

**Seed dot:** an orange pen head (r=4, plus a 1 px orange ring r=9 at 45 %) that sits at rest and pulses on every beat at 1 + 0.5·env. It is a separate element from the transient pen heads that `Plot` draws at stroke tips.

---

## B.0 Reference

### B.0.1 Downbeats in range

| Beat | Time | Frame | Lands in |
|---|---|---|---|
| b192 D | 88.766 | f2663 | ♀ plot starts |
| b196 D | 90.613 | f2718 | ♀ to ♂ morph starts |
| b200 D | 92.459 | f2774 | clock ticks |
| b204 D | 94.305 | f2829 | clock running |
| b208 D | 96.151 | f2885 | S / M labels |
| b212 D | 97.997 | f2940 | swap starts |
| b216 D | 99.843 | f2995 | trance ripples every beat |
| b220 D | 101.689 | f3051 | spiral B |
| b224 D | 103.536 | f3106 | strings |
| b228 D | 105.382 | f3161 | pluck 3 |
| b232 D | 107.228 | f3217 | strings un-plot |
| b236 D | 109.074 | f3272 | ring build |
| b240 D | 110.920 | f3328 | "you have left" begins |
| b244 D | 112.766 | f3383 | |
| b248 D | 114.613 | f3438 | |
| b252 D | 116.459 | f3494 | scan turns |
| b256 D | 118.305 | f3549 | shatter |
| b260 D | 120.151 | f3605 | select |
| b264 D | 121.997 | f3660 | heart plot |
| b268 D | 123.843 | f3715 | crack |
| b272 D | 125.689 | f3771 | moment 6 starts |
| b276 D | 127.536 | f3826 | third leader |
| b280 D | 129.382 | f3881 | ray loss |
| b284 D | 131.228 | f3937 | ILLEGAL ARGUMENTS (Section C) |

### B.0.2 Lyric lines (data for `LINES`)

Times are snapped as in `data.ts`.

| s | out | Lead-in (Newsreader) | Keyword | kwT (frame) | kwOut |
|---|---|---|---|---|---|
| 88.587 | 90.197 | Switch my gender | | | |
| 90.197 | 92.015 | To F to M | | | |
| 92.015 | 93.953 | And then do whatever | | | |
| 93.953 | 95.465 | From AM to PM | | | |
| 95.465 | 97.739 | Oh switch my role | | | |
| 97.739 | 99.349 | To S to M | | | |
| 99.349 | 101.474 | So we can enter | | | |
| 101.474 | 103.489 | The trance the trance | | | |
| 103.489 | 104.197 | If I can | | | |
| 104.197 | 107.220 | If I can feel your | VIBRATIONS | 106.3000 (f3189) | 107.020 |
| 107.220 | 107.903 | Then I can | | | |
| 107.903 | 110.900 | Then I can finally be | COMPLETION | 110.2333 (f3307) | 110.700 |
| 110.900 | 112.220 | Though you have left | | | |
| 112.220 | 113.100 | You have left | | | |
| 113.100 | 114.180 | You have left | | | |
| 114.180 | 114.920 | You have left | | | |
| 114.920 | 115.780 | You have left | | | |
| 115.780 | 118.333 | You have left me in | ISOLATION | 117.2667 (f3518) | 118.133 |
| 118.333 | 118.979 | If I can | | | |
| 118.979 | 121.728 | If I can erase all the pointless | FRAGMENTS | 120.8667 (f3626) | 121.528 |
| 121.728 | 122.714 | Then maybe | | | |
| 122.714 | 125.708 | Then maybe you won’t leave me so | DISHEARTENED | 124.9000 (f3747) | 125.508 |
| 125.708 | 128.661 | Challenging your god | | | |
| 128.661 | (Section C) | You have made some | ILLEGAL ARGUMENTS | 131.2333 (f3937), owned by Section C | |

- "To F to M", "From AM to PM" and "To S to M" are **not** keyword lines (they are not all caps). They type as normal serif lines and get the end-of-line send pulse.
- Their letters are visualised on stage as labels, never as the stage keyword.
- Stage keyword sizes from `min(200, floor(1500/(0.6·chars)))`:

| Keyword | Size | Glyph span x | Caps height |
|---|---|---|---|
| VIBRATIONS | 200 | 360–1560 | |
| COMPLETION | 200 | 360–1560 | |
| ISOLATION | 200 | 420–1500 | |
| FRAGMENTS | 200 | 420–1500 | |
| DISHEARTENED | 200 | 240–1680 | |
| ILLEGAL ARGUMENTS (C) | 147 | 210–1710 | |

  For all size-200 keywords the caps run y ≈ 316–462, the baseline is at 462 and the underline at y=490.
- Line-length check at 52 px: the longest composer string, "If I can erase all the pointless FRAGMENTS", ends at x ≈ 1310, clear of the send button at 1608.

### B.0.3 Log entries (data for `LOGS`)

All entries use lyric layout: x=240, call baseline 772, result baseline 806.

| # | Call t | Call | Result t (frame) | Result | Tie-in |
|---|---|---|---|---|---|
| 1 | 88.65 | `Edit(me.ts)` | 91.997 (f2760) | `Updated me.ts with 1 addition and 1 removal` | gender swap is one line swapped |
| 2 | 92.06 | `Write(crontab)` | 95.228 (f2857) | `0 0-12 * * * whatever` | "do whatever", every hour, 12 AM to 12 PM |
| 3 | 95.50 | `Bash(git mv roles/S roles/M)` | 98.920 (f2968) | `renamed: roles/S to roles/M` | role switch |
| 4 | 99.40 | `Bash(watch -n 0.4615 trance)` | 101.689 (f3051) | `Every 0.4615s: trance` | one beat at 130 bpm; `watch` repeats forever |
| 5 | 103.55 | `Bash(listen --to you)` | 106.300 (f3189) | `6 modes · in tune` | VIBRATIONS |
| 6 | 107.25 | `TodoWrite(6 items)` | 110.2333 (f3307) | `6/6 completed` | COMPLETION |
| 7 | 110.95 | `Search(pattern: "you")` | repeat mode, see B7 | `Found 5 matches` … `Found 0 matches` | callback to verse 1's `Found 1 match` (26.92) |
| 8 | 118.40 | `Glob(**/*.fragment)` | 118.766 (f3563) | `36 files` | |
| 9 | 119.00 | `Edit(me.ts)` | 120.8667 (f3626) | `Updated me.ts with 0 additions and 36 removals` | FRAGMENTS erased |
| 10 | 121.78 | `Draw(heart, r = 85)` | 122.920 (f3688) | `ok` | callback to `Draw(circle, r = 160)` |
| 11 | 123.00 | `Bash(git merge you)` | 124.900 (f3747) | `CONFLICT (content): merge conflict in heart` | DISHEARTENED |
| 12 | 125.75 | `Bash(sudo kill -9 1)` | 126.613 (f3798) | `me is not in the sudoers file. This incident will be reported.` | "challenging your god": PID 1 is init, the god process |
| 13 | 128.70 | `world.execute(me, god)` | Section C, f3937 | `IllegalArgumentException: god` | still running (orange bullet pulsing) at hand-over |

- The longest result is #12: 62 chars × 13.2 px = 818 px, so it runs x 274–1092.

### B.0.4 Status line verbs

The status line stays at lyric position (x=264, baseline 852). `N = floor(t − 13.89)`, so it reads 74 s at 88.60 and 117 s at 131.20.

| From | Verb |
|---|---|
| 88.587 | Switching… |
| 92.015 | Scheduling… |
| 95.465 | Swapping… |
| 99.349 | Entrancing… |
| 103.489 | Resonating… |
| 107.220 | Completing… |
| 110.900 | Searching… (whole line at 45 % opacity, see B.0.6) |
| 115.780 | Waiting… (still 45 %) |
| 118.333 | Erasing… (back to 100 % over 6 frames from 118.305) |
| 121.728 | Mending… |
| 125.708 | Challenging… |
| 128.661 | Validating… |

### B.0.5 Grid ripple schedule

Ripple formula and parameters are as in §2.5 unless noted.

| Window | Onsets | Centre |
|---|---|---|
| 88.60–99.80 | Even beats (b192, b194 … b214) | C |
| 99.843–103.536 | Every beat (b216–b224) | C |
| 103.536–110.92 | Every beat. Also off-beat eighths 105.382–106.30 and 109.074–110.233 (builds into the two keywords) | C |
| 110.92–117.20 | Downbeats only (b240, b244, b248, b252) | C |
| f3518 (ISOLATION) | One **slow ripple**: R = 900·Δt, width 90, decay exp(−Δt/1.0). Nothing else until 118.305 | (1640, 480) |
| 118.305 | b256: one normal ripple | (1640, 480) |
| 119.228–124.766 | Even beats b258–b270 | C |
| f3747 (DISHEARTENED) | One normal ripple; then none until 125.689 | (960, 410) |
| 125.689–128.459 | Even beats b272–b278 | (640, 390), the spark |
| 128.920–130.305 | Every beat b279–b282, plus off-beat eighths 129.613, 130.074 | (640, 390) |
| 130.306–131.20 | None (silence before the hit) | |

### B.0.6 Persistent UI over the whole section

| Element | State |
|---|---|
| Header | Visible throughout. Path `~/world`. Right side reads `01:28.6 · 130 bpm · beat 191` at the start and `02:11.2 · 130 bpm · beat 283` at the end. Header spark steps 15° every beat. |
| Composer | Visible throughout, lyric layout (x 240–1680, y 884–988). Lines type per §3 and send-pulse per §3. |
| Log zone | Lyric layout throughout. **Exception, 110.92–118.305:** the whole log zone is at 70 % opacity (6-frame fades at both ends), and the previous entry is hidden instead of sitting at 40 % (it fades out over 6 frames at 110.95). |
| Status line | Lyric layout throughout. **Exception, 110.90–118.305:** 45 % opacity (6-frame fades). |
| Stage keyword | Five windows: VIBRATIONS, COMPLETION, ISOLATION, FRAGMENTS, DISHEARTENED. |
| Stage dim | 60 % on keyword frames, per §2.5. **Exception:** the character layers in B8 are excluded, because she sits beside the keyword, not under it. |

---

## B.1 Shot list

### Shot B1: 88.60–92.015 (f2658–f2759) "Switch my gender" / "To F to M"

- **f2658 (88.60):** hand-over state. The seed dot is at C and the composer is empty with the caret solid. L1 types from 88.587. At 88.65, log #1 `● Edit(me.ts)`.
- **Venus geometry:** circle O = C, r=90. Stem from (960, 480) to (960, 600), 120 px. Crossbar centred on the stem at r=165 from O (y=555), half-length 45, so it runs x 915–1005. All strokes 1.5 px cream 100 %.
- **88.766 (b192 D, f2663) → 89.228 (b193, f2677):** the Venus circle is plotted clockwise from its bottom point (960, 480) with a pen head, at constant speed, closing on f2677.
- **89.228 → 89.459 (7 frames):** stem plotted downward from (960, 480).
- **89.459 → 89.689 (b194, f2691):** crossbar plotted from its centre (960, 555) outward both ways, with two pen heads.
- **89.689 (b194): label.**
  - A 1 px cream-45 % leader is plotted from the circle's left point (870, 390), 60 px left to (810, 390), over 4 frames.
  - The label `gender = F` types in 5 frames: JetBrains Mono 22 px, right-aligned at x=798, baseline 398. Key `gender` cream 70 %, `=` creamDim, value `F` cream.
- **Beat pulse, every beat from b193:** the circle radius pulses r·(1 + 0.05·env). The seed dot pulses as standard.
- **90.197:** L2 "To F to M" types.
- **90.613 (b196 D, f2718) → 91.997 (b199, f2760): the morph, easeInOutSine, one parameter q 0→1.**
  - Stem angle φ goes from 90° to −45°, rotating counter-clockwise on screen: down, then right, then up-right. The stem spans r 90–210 from O, so its length grows from 120 to 120 (unchanged) and its outer end moves to r=210.
  - Crossbar attach radius goes from 165 to 210 (the stem tip).
  - The crossbar halves' angle relative to the stem direction goes from ±90° to ±145°, and their length from 45 to 36. They become an open-V arrowhead at the tip.
  - Peak tip speed is about 560 px/s.
  - End state (Mars): stem from (1023.6, 326.4) to (1108.5, 241.5), with the arrowhead at the tip.
- **91.074 (b197, f2732):** the label value `F` backspaces and `M` types (1 frame each). `M` is orange for 6 frames, then cream.
- **91.997 (f2760):** the morph lands. Log #1 result `⎿ Updated me.ts with 1 addition and 1 removal`. The circle flashes 2 px for 3 frames.
- **Send pulses:** at 90.197 (end of L1) and 92.015 (end of L2), both automatic.
- **Ripples:** even beats from C.

### Shot B2: 92.015–95.465 (f2760–f2863) "And then do whatever" / "From AM to PM"

- **92.015:** L3 types. At 92.06, log #2 `● Write(crontab)`.
- **92.015–92.28 (8 frames):** the Mars stem and arrowhead un-plot from the tip back to the circle. The leader and label lift out (14 px, 5 frames).
- **92.06–92.459 (b200, f2774), easeInOutCubic:** the circle becomes the dial. Centre stays at C; r goes 90 → 200. The stroke stays 1.5 px cream.
- **Dial content, 92.459–92.69:**
  - **Ticks:** 12 hour ticks, plotted in a clockwise sweep from 12 o'clock, each 3 frames, staggered 0.5 frame.
    - Minor ticks: r 186–200, 1 px cream 70 %.
    - Major ticks at 12, 3, 6 and 9: r 176–200, 2 px cream.
  - **Numerals:** `12` `3` `6` `9`, JetBrains Mono 400 22 px, cream 70 %, centred on r=150. They type at 92.55.
  - **Hour hand:** from C to r=120 at 12 o'clock, 2 px cream, plotted outward in 4 frames from 92.459. The seed dot is the hub.
  - **Period label:** `AM`, JetBrains Mono 500 28 px, cream, centred at (960, 478). It types at 92.60.
- **The sweep, 12 hour steps on eighth notes:**
  - Step k (k = 1…12) starts at 92.690 + 0.23077·(k − 1): 92.690, 92.921, 93.151, 93.382, 93.613, 93.844, 94.074, 94.305, 94.536, 94.767, 94.997, 95.228.
  - Each step advances the hand 30°, easeInOutCubic over 6 frames.
  - On each landing, the hour tick it lands on flashes orange for 2 frames.
  - **Rim progress:** a 3 px orange arc on the dial from 12 o'clock to the hand's current angle, drawn as a draw-on of a circle path starting at −90°, tracking the hand exactly.
- **93.953:** L4 "From AM to PM" types.
- **95.228 (k=12, f2857):**
  - The rim is a full orange circle.
  - `AM` becomes `PM`: `A` backspaces and `P` types, 1 frame each; `PM` is orange for 6 frames, then cream.
  - Log #2 result `⎿ 0 0-12 * * * whatever`.
- **Beat pulse:** the seed hub pulses. Each eighth gives one visible tick step, so beat-sync is legible.
- **Ripples:** even beats from C.

### Shot B3: 95.465–99.349 (f2864–f2979) "Oh switch my role" / "To S to M"

- **95.465:** L5 types. At 95.50, log #3 `● Bash(git mv roles/S roles/M)`.
- **95.465–95.69 (6–8 frames):** clean-up of the clock.
  - Ticks, numerals, hand and `PM` un-plot or fade.
  - The orange rim returns to cream over 6 frames.
- **95.465–95.920, easeInOutCubic: the dial becomes shape S.** Centre glides C → (840, 390); r goes 200 → 60.
- **95.689 (b207, f2871):** square M is plotted (side 160, centre (1080, 390), so x 1000–1160, y 310–470), 1.5 px cream. It starts at the top-left corner and runs clockwise with a pen head over 16 frames.
- **96.151 (b208 D, f2885):** labels `S` and `M` type (JetBrains Mono 500 40 px, cream 70 %, centred in each shape).
- **96.613 (b209, f2898): swap hint.** Two arcs centred on C, r=230, 1 px cream 45 %, plotted in 8 frames.
  - Upper arc: from 205° to 335°, clockwise, arrowhead at the 335° end, at (1168, 293).
  - Lower arc: from 25° to 155°, arrowhead at the 155° end, at (752, 487).
  - Arrowheads use the drawn open-V `Arrow`, 10 px.
- **97.739:** L6 "To S to M" types.
- **97.997 (b212 D, f2940) → 98.920 (b214, f2968): the swap.**
  - Both shapes orbit C on radius 120 by +180°, easeInOutCubic: S passes over the top through (960, 270), M under the bottom through (960, 510).
  - The shapes translate only; they do not rotate. Labels ride with them.
  - Path length 377 px, peak speed about 610 px/s.
  - The hint arcs un-plot over the first 6 frames of the swap.
- **98.920 (f2968):** the shapes land (S at (1080, 390), M at (840, 390)) and flash 2 px for 3 frames. Log #3 result `⎿ renamed: roles/S to roles/M`.
- **Beat pulse:** both shapes scale 1 + 0.05·env about their centres. The seed dot at C is the pivot.

### Shot B4: 99.349–103.489 (f2980–f3104) "So we can enter" / "The trance the trance"

- **99.349:** L7 types. At 99.40, log #4 `● Bash(watch -n 0.4615 trance)`.
- **99.382 (b215, f2981):** S, M and their labels un-plot over 8 frames.
- **Spiral A**
  - **Geometry:** Archimedean spiral around C. `r(θ) = 12 + 248·θ/(12π)`, θ ∈ [0, 12π] (6 turns, spacing 41.3 px). Point = C + r·(cos(θ − 90° + ρA), sin(θ − 90° + ρA)). Sample 720 points as a polyline. 1.5 px cream 70 %.
  - **Plotting:** 99.382 → 100.766 (b218, f3023), from the centre outward, easeInOutSine, with a pen head.
  - **Rotation:** ρA = +45°·(t − 99.382). The outer edge moves at about 204 px/s.
- **101.474:** L8 types.
- **Spiral B**
  - **Geometry:** the mirror-handed spiral (angle −θ instead of θ), 1 px cream 45 %, sampled from the **outer end inward**.
  - **Plotting:** 101.689 (b220 D, f3051) → 102.613 (b222, f3078), with a pen head.
  - **Rotation:** ρB = −45°·(t − 101.689).
  - The two counter-rotating spirals produce the moiré rosette, which is the trance.
- **Beat pulse, every beat b216–b223:** both spirals scale 1 + 0.05·env about C. The seed dot pulses.
- **Trance rings at b220, b221, b222:** a 1 px orange ring at 45 % expands from C, r 0 → 280, over 0.4 s, linear, fading to 0.
- **101.689:** log #4 result `⎿ Every 0.4615s: trance`.
- **103.074 (b223, f3092) → 103.536 (b224, f3106):** both spirals un-plot from their outer ends inward (decreasing p on A; on B, because B is sampled outer-to-inner, it is a tail retract toward C), easeInCubic. Only the seed dot at C remains.

### Shot B5: 103.489–107.220 (f3105–f3216) "If I can" / "If I can feel your" / VIBRATIONS (hit 106.300 = f3189)

- **103.489:** L9 types. At 103.55, log #5 `● Bash(listen --to you)`.
- **103.536 (b224 D, f3106): posts.** Two posts, vertical 1.5 px cream 70 %, at x=360 and x=1560, y 210–570. Each is plotted from y=390 outward both ways over 8 frames.
- **Strings:** six strings at y = 240, 300, 360, 420, 480, 540 (index i=0…5 top to bottom), x 360–1560, 1 px cream 70%.
  - Each is plotted from x=960 outward both ways, with two pen heads, over 15 frames, easeInOutCubic.
  - Pairs start on eighth notes: y 360 and 420 at 103.536, y 300 and 480 at 103.767, y 240 and 540 at 103.997.
  - The seed dot stays at C between the two middle strings.
- **104.197:** L10 lead-in types.
- **Vibration model, per string:**
  - `d(x, t) = A(t)·sin(n·π·u)·sin(2π·5·(t − tp))`, with u = (x − 360)/1200.
  - Mode n = i + 1 (top string n=1 … bottom n=6).
  - A(t) = A0·exp(−(t − tp)/0.6), where tp is the last pluck.
  - Rebuild the path every frame with 200 samples. Peak point speed is about 565 px/s at A0=18.
  - While A > 4, the string draws 1.5 px cream 100 %.
- **Plucks.** At each pluck, an orange dot (r=4) appears at the first antinode x = 360 + 600/n on that string and fades over 8 frames.

| Beat | Strings (y) | A0 |
|---|---|---|
| b226 104.459 | 360 (n=3) | 14 |
| b227 104.920 | 420 (n=4) | 14 |
| b228 D 105.382 | 300 (n=2) and 480 (n=5) | 14 |
| b229 105.843 | 240 (n=1) and 540 (n=6) | 14 |

- **f3189 VIBRATIONS:**
  - All six strings are re-plucked with A0 = 18.
  - All strings stroke 2 px orange for 3 frames, then return to 1 px cream 70 % over 6 frames.
  - Keyword. Inline keyword. Send pulse. Log #5 result `⎿ 6 modes · in tune`.
  - **Readability:** from f3189 until the keyword has gone (107.02 + 6 frames), the four strings at y 300–480 draw at 45 % (on top of the 60 % stage dim).
- **b231 (106.766):** all six strings are re-plucked with A0 = 8, a visible beat pulse.
- **Ripples:** every beat, plus off-beat eighths 105.382–106.30.

### Shot B6: 107.220–110.900 (f3217–f3326) "Then I can" / "Then I can finally be" / COMPLETION (hit 110.2333 = f3307)

- **107.220:** L11 types. At 107.25, log #6 `● TodoWrite(6 items)`.
- **107.228 (b232 D) → 107.495 (8 frames):**
  - The strings damp: A goes to 0 with τ = 0.1.
  - The strings un-plot from both ends toward x=960. The posts un-plot toward y=390.
  - Only the seed dot at C remains.
- **107.689 (b233, f3231):** the hand, a 1 px cream-45 % radius line from C to (960, 160), plotted upward in 4 frames.
- **107.82 (f3235) → f3307: progress ring.**
  - Centre C, r=230, 1.5 px cream.
  - Plotted from 12 o'clock, clockwise, easeInQuad, with a pen head. It closes exactly on f3307.
  - The hand rotates with the pen head.
  - **Readout:** `NN%` (JetBrains Mono 16 px, creamDim, integer floor(100·p), zero-padded to 3 digits as `007%`) is centred at radius 258 on the pen angle.
- **107.903:** L12 types.
- **Beat ticks at b234 (108.151), b235 (108.613), b236 (109.074), b237 (109.536) and b238 (109.997):**
  - A tick is left on the ring at the pen's current angle: r 222–238, 1 px cream 70 %.
  - The pen head pulses 1 + 0.8·env for these beats.
- **f3307 COMPLETION:**
  - The ring strokes 2 px orange for 3 frames, then 1.5 px cream 70 % over 6 frames.
  - The readout shows `100%` in orange for 3 frames, then fades over 6.
  - The hand and the ticks un-plot (6 frames).
  - **Six "you" nodes** appear on the ring at angles θk = −90° + 60°·k (k = 0…5): circles r=12, 1.5 px cream, no fill, scale 0→1 over 6 frames, easeOutExpo. Positions: (960, 160), (1159.2, 275), (1159.2, 505), (960, 620), (760.8, 505), (760.8, 275).
  - **Spokes** from the seed to each node, 1 px cream 45 %, plotted outward over 6 frames.
  - Keyword. Inline keyword. Send pulse. Log #6 result `⎿ 6/6 completed`.
  - **Readability:** the nodes sit outside the caps band (y 316–490); only hairline spokes cross it.
- **b239 (110.459):** the nodes pulse r·(1 + 0.25·env).
- **Ripples:** every beat, plus off-beat eighths 109.074–110.233.

### Shot B7: 110.900–115.780 (f3327–f3472) "Though you have left" / "You have left" ×4

- **HUD light from here to 118.305** (see B.0.6): log zone at 70 % with the previous entry hidden, status line at 45 %.
- **110.920 (b240 D):** the ring returns to 1 px cream 45 % (over 6 frames). The wheel (ring, nodes and spokes) starts rotating about C at ψ = −6°·(t − 110.92). At 113.10 the angular velocity drops linearly to 0 by 113.40, and ψ freezes at −13.98°.
- **Ring segments:** the ring is drawn as six 60° arcs. Arc k runs from θk + ψ to θk + 60° + ψ, and is owned by node k.
- **Departures.** Each lasts 0.5 s from the line start. Over that window:
  - the node moves radially outward 120 px (easeInOutCubic, peak 360 px/s);
  - its circle un-plots;
  - its spoke un-plots from the node end toward the seed;
  - its ring arc un-plots toward the arc's start.

| Line start | Node | Base angle | Count after |
|---|---|---|---|
| 110.900 | k=4 | lower-left | 5 |
| 112.220 | k=1 | upper-right | 4 |
| 113.100 | k=5 | upper-left | 3 |
| 114.180 | k=2 | lower-right | 2 |
| 114.920 | k=3 | bottom | 1 |
| 115.780 | k=0 | top | 0 (in B8) |

- **Seed drift ("me" is left on her own):** 113.10 → 115.90, the seed moves from C to (1640, 300) along a straight line, easeInOutCubic (683 px, peak about 366 px/s).
  - Spokes are recomputed every frame from the seed's current position, so the remaining spokes visibly stretch.
  - The last spoke, to the top node, reaches about 740 px.
- **Groups moving at once:** never more than 2. Rotation stops at 113.40, and the drift is the only continuous motion after that.
- **Log #7, repeat mode.** There is a single entry and it never pushes.
  - **110.95:** `● Search(pattern: "you")` types at 5 chars/frame. Bullet orange and pulsing.
  - **Each later line start (112.22, 113.10, 114.18, 114.92, 115.78):**
    - The entry re-runs: the bullet turns orange and pulses again.
    - A creamDim suffix ` ×2`, ` ×3`, ` ×4`, ` ×5`, ` ×6` (JetBrains Mono 24 px; ` ×n` replaces the previous one instantly) follows the call.
    - The old result line fades out over 3 frames.
  - **Result at each departure end (+0.5 s):** `⎿ Found 5 matches` (111.40), `Found 4 matches` (112.72), `Found 3 matches` (113.60), `Found 2 matches` (114.68), `Found 1 match` (115.42). The bullet turns creamDim each time.
  - **The sixth run (115.78)** stays running until ISOLATION.
- **Beat pulse:** the seed pulses every beat; the remaining nodes pulse r·(1 + 0.25·env) on every beat.
- **Ripples:** downbeats only, from C.

### Shot B8: 115.780–118.305 (f3473–f3548) "You have left me in" / ISOLATION (hit 117.2667 = f3518). Character moment 5, pose `sit`

- **115.78:** L18 types. The last node (k=0) departs (115.78–116.28): circle, its long spoke and the last ring arc un-plot. Log #7 re-runs as ×6.
- **115.90:** the seed arrives at (1640, 300), the top-centre of her box.
- **Placement**
  - Art: `public/char/sit_flat.png` and `sit_lines.png`, 1120×1680, aspect 2:3.
  - Box: height 360, width 240, x 1520–1760, y 300–660. Screen = (1520 + nx·240, 300 + ny·360).
  - Her feet rest on grid row y=660 (the bottom of the stage).
  - She sits right of the ISOLATION glyphs (which end at x=1500) with a 20 px gap. Nothing of her is under the keyword.
- **115.997 (b251, f3480): scan down.**
  - The seed stretches into the scan line: a 2 px orange line grows both ways from (1640, 300) to x 1495–1785 in 4 frames.
  - The line then moves down to y=660 by 116.459 (b252, f3494), linear.
  - Above the line, `sit_lines.png` is visible (clip `inset(0 0 (660 − y) 0)` on the box).
  - **Readout:** `y 0300` … `y 0660` (16 px creamDim) right-aligned at x=1487, baseline at line y + 5.
- **116.459 → f3518: scan up.** The line moves 660 → 300, linear. Below it, `sit_flat.png` appears under the line art. The line reaches 300 exactly on f3518.
- **f3518 ISOLATION:**
  - The scan line shrinks into a dot at (1640, 300) over 4 frames. The dot then scales to 0 over 6 frames (gone by f3528). She is left alone in the empty grid.
  - Keyword. Inline keyword. Send pulse.
  - Log #7 result `⎿ Found 0 matches`; the bullet turns creamDim.
  - The one slow ripple from her centre (1640, 480).
  - She is **not** stage-dimmed.
- **117.27–118.305:** stillness. No leaders, no labels, no push. HUD stays light. This is the only near-hold in the section (about 1 s) and it is intentional.
- **Exit:**
  - **118.305 (b256 D, f3549):** her flat fills cut out, leaving line art only.
  - **f3549–f3552:** the line art cross-fades into the shard outlines (B9). Her art is fully gone by f3552 (118.40).
  - HUD returns to full opacity over 6 frames from 118.305.

### Shot B9: 118.305–121.728 (f3549–f3651) "If I can" / "If I can erase all the pointless" / FRAGMENTS (hit 120.8667 = f3626)

- **Shards (offline, `public/char/sit_shards.json`):**
  - About 36 triangles from a Delaunay triangulation of her alpha: 24 boundary samples plus 8 interior points, keeping triangles whose centroid is inside the alpha.
  - Each shard is tagged `orange` if most of its pixels are orange or orangeDeep, otherwise `cream`.
  - Cream shards: 1 px cream 70 % outlines. Orange shards: 1.5 px orange outlines. No fills.
  - The log strings assume N = 36; if the triangulation gives a different N, use that number everywhere.
- **118.333:** L19 types. At 118.40, log #8 `● Glob(**/*.fragment)`; result `⎿ 36 files` at 118.766 (b257).
- **118.40 → 120.30: scatter. All shards move as one group**, easeInOutCubic, no stagger.
  - Rank shards by centroid x (rank r = 0…N−1).
  - Target centroid: x = 760 + 940·r/(N − 1) + jx, y = 170 + 450·v + jy, where v is the shard's normalised y in her box and jx, jy are seeded ±24 px.
  - Each shard also rotates by a seeded angle in ±35° and scales ×1.5 about its own centroid.
  - Maximum travel is about 760 px, peak about 600 px/s.
  - After 120.30, each shard keeps drifting 8 px/s along its travel direction and rotates +4°/s.
- **118.979:** L20 types. At 119.00, log #9 `● Edit(me.ts)`.
- **119.689 (b259, f3591): selection marquee.**
  - Dashed rectangle x 700–1780, y 120–660, 1 px cream 45 %, dash 6/6. Plotted from top-left, clockwise, over 8 frames.
  - Label `36 selected` (16 px creamDim) at (712, 140).
- **120.151 (b260 D, f3605):** all cream shards re-stroke to 1 px orange (the "selected" state), left to right over 6 frames by rank.
- **f3626 FRAGMENTS:**
  - Keyword. Inline keyword. Send pulse. Log #9 result `⎿ Updated me.ts with 0 additions and 36 removals`.
  - **Deletion sweep:** shard r starts un-plotting (reverse draw, 6 frames) at f3626 + round(18·r/(N − 1)). The sweep runs left to right; all shards are gone by f3650.
  - By the keyword's outline phase (f3637), most shards under the glyphs are gone, so the keyword reads cleanly.
- **121.47–121.70:** the marquee un-plots (8 frames); its label fades.
- **Ripples:** b256 from (1640, 480); then even beats from C.

### Shot B10: 121.728–125.708 (f3652–f3770) "Then maybe" / "Then maybe you won’t leave me so" / DISHEARTENED (hit 124.900 = f3747)

- **121.536 (b263, f3646):** the seed dot sets down at C: scale 0→1 over 4 frames, easeOutExpo.
- **121.728:** L21 types. At 121.78, log #10 `● Draw(heart, r = 85)`.
- **Heart geometry.** It is built from a square of side 170 rotated 45° about (960, 410), plus two lobe circles of r=85.
  - Square vertices: notch T = (960, 289.79), left Lv = (839.79, 410), right Rv = (1080.21, 410), tip B = (960, 530.21).
  - Lobe centres: (899.90, 349.90) and (1020.10, 349.90).
  - Left half: T, the left lobe's outer semicircle to Lv, then a line to B. The right half mirrors it.
  - Sample each lobe as a 48-point polyline.
  - Bounding box x 815–1105, y 265–530. The seed at C sits inside, as the heart's core.
- **121.997 (b264 D, f3660) → 122.920 (b266, f3688):** both halves are plotted at once from T down to B, mirrored, with two pen heads, easeInOutCubic, 1.5 px cream. Each half is 437 px.
- **122.714:** L22 types.
- **122.920:** log #10 result `⎿ ok`. At 123.00, log #11 `● Bash(git merge you)`.
- **Heartbeat, every beat b266–b270:** the heart scales 1 + 0.06·env about (960, 410).
- **Crack:** a zigzag T → (946, 338) → (974, 386) → (946, 434) → (972, 482) → B, 1.5 px orange. One segment per eighth note, each plotted in 4 frames with a pen head, starting at 123.843 (b268), 124.074, 124.305, 124.535 and 124.766 (b270). The last segment ends exactly on f3747.
- **f3747 DISHEARTENED:**
  - **Split:**
    - Left half = left outline plus the crack, a closed shape. It rotates −10° about B and translates (−70, +30).
    - Right half mirrors it: +10° and (+70, +30).
    - 12 frames, easeOutCubic (peak about 570 px/s).
  - The crack copies on both halves turn from orange to cream 70 % over 6 frames.
  - The seed stays at C, alone between the halves.
  - Keyword. Inline keyword. Send pulse. Log #11 result `⎿ CONFLICT (content): merge conflict in heart`.
  - The heart lies under the letters H-E-A-R-T of the keyword; it is hairline-only, at 60 % dim, so the keyword stays readable.
  - One ripple from (960, 410). No ripples after this until 125.689.
- **125.10 → 125.46:** the halves fall a further 24 px (linear, 67 px/s).
- **125.46–125.69:** the halves un-plot (reverse draw, 7 frames).
- **125.508–125.689:** the seed scales to 0 (6 frames), and the keyword exits at the same time. At 125.689 the stage is empty.

### Shot B11: 125.708–128.661 (f3771–f3859) "Challenging your god". Character moment 6, pose `defy` (window 125.689–131.167)

- **Layout** (for art with the raised hand on the viewer's left; mirrored fallback in Build notes):
  - **Spark ("god", PID 1):** at (640, 390), R=100, filled orange.
  - **Her box:** fit height 540, width cap 360. With 2:3 art the box is x 1060–1420, y 120–660, centred x=1240. Screen = (1060 + nx·360, 120 + ny·540).
- **125.689 (b272 D, f3771):**
  - **Spark bloom:** rays grow from the hub with a 0.5-frame stagger over 8 frames (the title bloom from Shot 8). The spark then rotates at 8°/s plus a 15° step every beat (6 frames, easeOutCubic).
  - **`pid 1` label:** 16 px creamDim, centred at (640, 528), types at 125.80.
- **125.708:** L23 types. At 125.75, log #12 `● Bash(sudo kill -9 1)`.
- **Scan down, 125.689 → 126.151 (b273, f3785):**
  - The 2 px orange scan line (x 1035–1445) is first plotted left to right across y=120 in 3 frames, then moves down to y=660, linear.
  - `defy_lines.png` is visible above it.
  - The 16 px `y` readout rides at the right end, left-aligned at x=1453.
- **Scan up, 126.151 → 126.613 (b274, f3798):** the line moves up to y=120; `defy_flat.png` appears below it. The line vanishes at the top.
- **126.613:** log #12 result `⎿ me is not in the sudoers file. This incident will be reported.`
- **Push:** her art scales 1.000 → 1.030 from 126.613 to 130.766, linear, anchored at her feet (1240, 660).
- **Leaders, one per beat.** Format as in moment A: the label types in 5 frames; an orange check follows 4 frames later; the leader runs 40 px horizontal from the label, then straight to an orange node (r=3.5) at the feature; 1 px cream 45 %.

| Beat | Label | Position | Anchor (nx, ny), to verify |
|---|---|---|---|
| b274 126.613 | `book = open` | left-aligned x=1470, baseline 330 | open book (0.72, 0.38) |
| b275 127.074 | `hand = raised` | right-aligned x=1010, baseline 170 | raised hand (0.14, 0.10) |
| b276 D 127.536 | `obey = false` | left-aligned x=1470, baseline 200 | face (0.50, 0.13) |

  `book = open` is a deliberate callback to `book = closed` in moment A (21.38).
- **127.536 (b276) and 127.997 (b277):** the spark emits a 1 px orange ring at 45 %, r 100 → 300 over 0.4 s, fading.
- **127.997 (b277, f3840): challenge line.**
  - Dashed 1 px cream 45 % (dash 6/6), plotted in 8 frames from her raised-hand anchor (about (1110, 174)) toward the spark hub, stopping 116 px from the hub.
  - It passes below the `hand = raised` label.

### Shot B12: 128.661–131.200 (f3860–f3936) "You have made some" (the keyword lands at f3937 in Section C)

- **128.661:** L24 types. The leaders and labels retract into their nodes (8 frames); the checks un-plot. At 128.70, log #13 `● world.execute(me, god)`. It stays running, with an orange pulsing bullet, through the hand-over.
- **128.920 (b279):** the challenge line becomes solid 1.5 px cream 70 % (6 frames).
- **The god loses rays, one per eighth note.**
  - At 128.920, 129.151, 129.382, 129.612, 129.843, 130.074, 130.305 and 130.535, rays i = 0, 6, 3, 9, 1, 7, 4, 10 retract into the hub (6 frames, easeInCubic). This is the reverse of the demo's loading spark, which gained a ray per beat.
  - The rotation step continues.
  - Ripples run every beat plus two off-beats (B.0.5).
- **130.766 (b283, f3923): iris close onto the seed.**
  - The seed dot sets down at C (scale 0→1, 4 frames, easeOutExpo), drawn above everything.
  - A circular clip on the whole moment-6 container (her image layers, the spark, the challenge line, the `pid 1` label) shrinks from r=560 to r=0 around C over f3923–f3935 (12 frames), easeInCubic.
  - **Outline:** a matching 1.5 px cream-45 % circle, drawn only while r ≤ 300, with opacity ramping 0 → 1 over r 300 → 270. It never crosses the header or the composer.
  - The remaining rays 2, 5, 8 and 11 and the hub are clipped away as the circle passes x=740. She is gone once r < 100 (about f3933).
- **f3935 (131.167):** r = 0. Only the seed remains.
- **f3936 (131.200): hand-over** (see B.3).

---

## B.2 Character moments in this section

| | Moment 5 | Moment 6 |
|---|---|---|
| Lyric | "You have left me in ISOLATION" | "Challenging your god / You have made some…" |
| Window | 115.997 (scan starts) to 118.40 (line art gone). Fills shown 116.459–118.305 | 125.689 (scan starts) to 131.167 (iris closed) |
| Pose | `sit` (exists: `public/char/sit_*`, 1120×1680) | `defy` (to generate, see Build notes) |
| Box | x 1520–1760, y 300–660 (h 360, w 240), feet on grid row 660 | x 1060–1420, y 120–660 (h 540, w ≤ 360) |
| Arrives by | The seed, which drifted out of the wheel, becomes the scan line; scan down (lines), then scan up (fills) | Scan down, then scan up; leaders with checks |
| Treatment | Flat 5-tone + cream lines (char_v3.py). No leaders, no push, HUD at 45–70 % | Same, with 3 leaders, a 3 % push and the god spark opposite |
| Leaves as | Fills cut out, then line art becomes geometric shards (pure geometry, no art pixels) | An iris that closes onto the orange seed at C |
| Keyword overlap | None: she is right of ISOLATION (x ≤ 1500) | None: the keyword lands after she has gone |

---

## B.3 Hand-over states

### At 88.60 s (f2658): start

This is the contract Section A must deliver.

- **Stage:** empty except the seed dot at (960, 390) (orange r=4, plus a 1 px orange ring r=9 at 45 %), pulsing on beats.
- **Grid:** `gridHi` (#34312C), with ripples per A's schedule.
- **Header:** `claude ~/world` on the left; `01:28.6 · 130 bpm · beat 191` on the right.
- **Composer:** lyric layout, empty. A's last line (EXISTENCE) completed its 5-frame lift-out at f2653–f2658. The caret is solid, because "Switch my gender" starts typing from 88.587 and shows 0 chars on f2658.
- **Log zone:** lyric layout (call baseline 772, result 806). A's last entry is finished, with a creamDim bullet. B's first call (88.65) pushes it to 40 %.
- **Status line:** x=264, baseline 852, `Switching… (74s · esc to interrupt)`. The verb switches to Switching at 88.587, whatever A had.
- **No stage keyword visible.** Stage dim is 100 %.

### At 131.20 s (f3936): end

This is what Section C receives.

- **Stage:** empty except the seed dot at (960, 390), the same pen head as above. The iris closed onto it on f3935. No outline, spark, labels or art remain.
- **Grid:** `gridHi`. The last ripple onset was 130.305 (from (640, 390)); at 131.20 it is at R ≈ 1250 and weight 0.22, so effectively gone.
- **Header:** `02:11.2 · 130 bpm · beat 283`.
- **Composer:** shows "You have made some", fully typed (Newsreader 52 px), with the caret idle-blinking.
- **Log zone:** two entries.
  - Previous, at 40 %: `● Bash(sudo kill -9 1)` / `⎿ me is not in the sudoers file. This incident will be reported.`
  - Latest: `● world.execute(me, god)`, with an **orange bullet still pulsing** (running) and no result line yet.
- **Status line:** `Validating… (117s · esc to interrupt)`, 100 % opacity.
- **What Section C must do on f3937 (131.2333, b284):**
  - Append `ILLEGAL ARGUMENTS` inline in orange.
  - Show the stage keyword at 147 px (glyph span x 210–1710).
  - Send pulse.
  - Log #13 result `⎿ IllegalArgumentException: god`; the bullet turns creamDim.
  - Stage dim to 60 %.
  - The seed pulses on b284.
  - Keyword exit at hit + 1.10 = 132.333, unless C's next line is sooner.

---

## B.4 Build notes

### Files and data

- **Shot files:** `src/v3/shots/PreChorus2.tsx` (B1–B4), `Chorus2.tsx` (B5–B8) and `Bridge.tsx` (B9–B12). Mount them in the `Stage` group, gated by frame windows: 2658–2759, 2760–2863, 2864–2979, 2980–3104, 3105–3216, 3217–3326, 3327–3472, 3473–3548, 3549–3651, 3652–3770, 3771–3859, 3860–3935.
- **`data.ts` additions:**
  - The B.0.2 lines (typographic `’` in "won’t"). `kwT` is snapped by the existing `snap`.
  - The B.0.3 logs (`rt` snapped).
  - The B.0.4 status verbs.
  - `SEND` pulses: automatic from the `LINES` rule.
  - `KEYWORDS`: derived.
  - **Log #7:** add an optional `runs: {t, rt, res}[]` field to `Log`. `LogEntry` then renders the call once, a ` ×n` suffix from the second run, the bullet orange while `t` is in [run.t, run.rt), and the result of the latest finished run. The result fades out over 3 frames at each new run.
- **`ui.tsx` changes:**
  - **`logLayout`:** lyric layout across 88.60–131.20. Add an `o` multiplier (0.7 in 110.92–118.305, 6-frame ramps) and a `hidePrev` flag for the same window.
  - **`StatusLine`:** an opacity multiplier of 0.45 over 110.90–118.305 (6-frame ramps). `N` uses the existing formula.
  - **`rippleCenter` / `rippleOnsets`:** extend with the B.0.5 table. The ISOLATION ripple needs per-onset parameters (speed 900, τ 1.0), so carry `{tb, speed, tau, cx, cy}` per onset instead of a global centre.
  - **`stageDim`:** wrap the B8 character `<Img>` layers outside the dimmed container (or multiply them back by 1/dim).

### Reusing existing helpers

- **`Plot` + `circlePath` / `polyPath` / `ellipsePath`:** every draw-on and un-plot (pass a decreasing `p` for un-plot).
  - **Reverse-direction un-plots** (ring arcs toward their start, spokes toward the seed, spiral B): build the path in the direction the retraction should run.
  - **Two-pen strokes** (strings, Venus crossbar, heart halves): use two half-paths from the shared start.
- **Venus to Mars morph:** do not tween path strings. Compute stem and barb endpoints from q each frame (φ, attach radius, barb angle, barb length) and draw plain `<path>`s. `Plot` is only used for the initial plotting.
- **Clock rim:** `Plot d={circlePath(960, 390, 200, -90)} p={handAngle/360}` in orange, 3 px, `pen={false}`.
- **Strings:** `fnPath` with the displacement function, rebuilt every frame (6 × 200 samples is cheap). Do not cache lengths for these (`pathLen` cache churn); use `pen={false}` once fully plotted.
- **Spirals:** a 720-point `polyPath`, built once. Rotate with a `<g transform="rotate(ρ 960 390) scale(s)">`. Pen heads come from `Plot` during plotting only.
- **Progress ring:** like Shot 5's ring.
  - Pen angle = 360°·easeInQuad(prog(t, 107.82, 110.2333)).
  - The readout and hand use `pointAt`.
  - Ticks are stored as fixed angles computed from the beat times.
- **Heart:** precompute the two closed half polylines (outline plus crack). Draw them inside `<g>`s with the split transforms. The plotting phase uses open half-paths from T to B.
- **Spark ray loss:** export `RaySpark` from `Execute.tsx` (it already takes `grow(i)`) and pass per-ray retract factors. The bloom uses the same component. Rotation is `8·t + spark15-style step`.
- **Character scans:** copy moment A's `clip-path: inset(...)` logic from `Execute.tsx`, with the new box constants. Readouts as in moment A.
- **Iris close (B12):**
  - Put her two `<Img>` layers and an SVG (spark, challenge line, `pid 1`, leaders) inside one absolutely-positioned div with `clipPath: circle(${r}px at 960px 390px)`.
  - Draw the outline circle and the seed **outside** that div so they are not clipped.
  - No SVG filters.
- **Shards:** draw each as `Plot d={polyPath(tri, true)}` inside `<g transform="translate(...) rotate(... cx cy) scale(...)">` about its centroid.
  - The sweep start frame is `f3626 + round(18·r/(N−1))`.
  - The cross-fade from line art (f3549–f3552) is an opacity swap: art 1 → 0, shards 0 → 1.

### Offline assets

These must be generated, per the user's request to generate any needed assets with GPT.

1. **`defy` pose (missing). Generate with GPT image generation**, attaching the standing reference used for art `a` so she stays the same character.

   Prompt:

   > "Full-body anime girl, the same character as the reference: long red-orange hair with a sunburst flower ornament, white blouse, black corset with ribbons, layered white, orange and black skirt with a sun motif, lace-up boots. Standing, determined expression, looking forward. Her right hand (on the viewer's LEFT) is raised high, palm open. Her other hand holds an OPEN book forward at chest height on the viewer's right. Flat cel shading, clean ink lines, no text, no background objects, pure white background, no shadow on the ground, entire figure from hair top to boots in frame, portrait 2:3, at least 1120×1680."

   - Save as `assets/src/defy.png`.
   - Run `python3 scripts/char_v3.py assets/src/defy.png defy 1680 1210`, which produces `defy_flat.png`, `defy_lines.png`, `defy_alpha.png` and `defy_points.json`.
   - Add `defy` to `char_meta.json` with measured anchors for `hand`, `book` and `face`. The B11 table values are estimates.
   - If the generated hand is on the viewer's right, **do not mirror the art.** Use the mirrored layout instead:
     - spark at (1280, 390); box x 500–860;
     - `hand = raised` left-aligned at x=910;
     - `book = open` and `obey = false` right-aligned at x=450;
     - challenge line from the hand toward (1280, 390);
     - the iris still closes on C.
2. **`sit`:** already processed (`public/char/sit_*`, 1120×1680, bbox full width). No generation needed.
   - Note that `public/char/b_*` are older placeholder copies of `a_*` and are not used here.
3. **`sit_shards.json`:** a small Python step next to `char_v3.py`. It samples 24 alpha-boundary points and 8 interior points, runs Delaunay triangulation (scipy), keeps centroid-inside triangles, and stores `{tris: [[nx, ny] ×3], cls}`. Classify `cls` by the majority flat label.

### Trickiest parts and checks

1. **Keyword frames:** 3189, 3307, 3518, 3626, 3747. Add them to the debug overlay. Also check f2760 (morph landing), f2857 (PM flip), f3473 (last departure), f3935/f3936 (iris closed, hand-over) and f3937 (Section C hit).
2. **Speed limits (verified peaks):**

   | Motion | Peak |
   |---|---|
   | Morph tip | 560 px/s |
   | Swap | 610 px/s |
   | Seed drift | 366 px/s |
   | Shard scatter | 600 px/s |
   | Heart split | 570 px/s |
   | String vibration | 565 px/s |

   Do not shorten these windows.
3. **Readability overrides:** strings in the keyword band drop to 45 % (B5). The shard sweep clears before the outline phase (B9). She is placed outside the glyph span (B8). The keyword lands on an empty stage (C).
4. **Orange budget:**

   | Element | Share of frame |
   |---|---|
   | Spark R=100 | about 0.6 % |
   | Defy art hair | about 1.5 % |
   | Selected shards | about 0.5 % |
   | Clock rim | about 0.2 % |

   All are well under 8 %.
5. **No-CJK assertion:** all new strings are ASCII plus `’ · × …`, and `×` and `·` already appear in the demo. Keep `→ ∞ ≈` out of all text, including log strings: the role log uses "to", not an arrow.