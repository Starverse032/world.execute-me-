# Section C: 131.20–211.96 s ("Execute, Love, exit 0")

This section follows docs/design_v3.md. It uses the same tokens (§2.1), type (§2.2), line weights (§2.3), zones (§2.4), motion rules (§2.5), forbidden list (§2.6) and persistent UI (§3). Every time is in seconds and `f` = round(30·t). Beats are `b_n = 0.151 + 0.4615·n`, and a downbeat is n ≡ 0 (mod 4). Two stage centres are used:
- `C = (960, 390)` in the lyric layout.
- `D = (960, 430)` in the instrumental and climax layout. The composer is gone there, so the stage runs y 110–800.

Measured audio facts that this section is built around:
- The detected beats sit on the nominal grid at +24 to +43 ms throughout, so the grid holds.
- The 12 EXECUTION LRC stamps fall 0.0–0.3 s before the nearest even beat. Keywords stay on the LRC frames, as in the demo. Pulses stay on the beat grid.
- The outro instrumental (191.4–205.8) is bass-heavy and about 25 % quieter.
- **The audio stops hard at 207.08 (f6212).** It is digital silence from about 207.3.

---

## C.0 Section tables

### Persistent UI for 131.20–211.96 (`UiSeg` entries for sections/c.data.ts)

| from | composer | log anchor (latest call baseline) | status | grid ripple (centre, density) | hud (header right) | grid tone |
|---|---|---|---|---|---|---|
| 131.200 | shown (lyric) | (240, 772) | lyric (264, 852) | (960, 390), downbeats only | full | `gridHi` |
| 133.063 | hidden (5-frame fade) | (240, 916) | instr (240, 1000); slides over 5 frames, as at 15.842 | (960, 430), every beat | full | `gridHi` |
| 140.447 | hidden | (240, 916) | instr | (960, 430), every beat + off-beat eighths | full | `gridHi` |
| 147.660 | hidden | (240, 916) | instr | (960, 430), every beat + every keyword hit in 147.66–161.584 | full | `gridHi` |
| 162.250 | shown (slides up from +140 px, 0.3 s, easeOutCubic, as at 29.30) | (240, 772) | lyric (slides 0.3 s) | (960, 390), every beat | full | **`grid` (darker)** |
| 177.246 | shown | (240, 772) | lyric | (1240, 390), every 2 beats | **light** | `gridHi` |
| 188.300 | shown | **hidden** (6-frame fade) | lyric | (1240, 430), every 2 beats | light | `gridHi` |
| 193.981 | shown | (240, 772) | lyric | (960, 390), every 2 beats | light | `gridHi` |
| 200.442 | shown | (240, 772) | lyric | none (grid retracts, see C20) | light | `gridHi` |
| 201.365 | shown | (240, 772) | lyric | none (grid off) | full | n/a |
| 207.080 | shown | (240, 772) | lyric | none | light | n/a |

Header path: `~/world` (inherited) → `~/world/heart` at 187.665 → `~/world` at 193.981 → `~` at 201.365.

### Status verbs

| from | verb |
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
| 207.550 | Static `✻ Worked for 3m 31s`: creamDim, spark static, no counter |

### Log entries (call `t` → result `rt`; rt snapped to its frame)

| t | call | rt | result |
|---|---|---|---|
| 131.450 | `TodoWrite(rebuild world)` | 132.140 | `6 todos · 0 done` |
| 133.063 | `Write(pieces.ts)` | 134.909 | `Wrote 36 primitives` |
| 134.950 | `Edit(pieces.ts)` | 136.294 | `rotated 3 × 60°` |
| 136.755 | `Bash(mkdir -p world)` | 137.678 | `world/ ready · 32×18` |
| 138.140 | `Bash(simulate ./world --fast)` | 140.447 | `3 orbits · 540°/s` |
| 140.447 | `Bash(simulate --steps 1e9)` | 141.370 | `running` |
| 142.293 | `Read(world/you.json)` | 143.216 | `0 entities` |
| 144.139 | `Search(pattern: "you")` | 145.062 | `No matches found` |
| 145.985 | `Bash(chmod +x me)` | 146.447 | `ok` |
| 146.447 | `Bash(./world --dry-run)` | 146.908 | `12 targets` |
| 146.908 | `Task(execute ×12)` | 147.370 | `12 agents launched` |
| 147.660 | `Task(execute #01)` | 148.600 | `Done (0.9s)` |
| 148.600 | `Task(execute #02)` | 149.520 | `Done (0.9s)` |
| 149.520 | `Task(execute #03)` | 150.540 | `Done (1.0s)` |
| 150.540 | `Task(execute #04)` | 151.520 | `Done (1.0s)` |
| 151.520 | `Task(execute #05)` | 152.280 | `Done (0.8s)` |
| 152.280 | `Task(execute #06)` | 153.160 | `Done (0.9s)` |
| 153.160 | `Task(execute #07)` | 153.980 | `Done (0.8s)` |
| 153.980 | `Task(execute #08)` | 155.200 | `Done (1.2s)` |
| 155.200 | `Task(execute #09)` | 156.080 | `Done (0.9s)` |
| 156.080 | `Task(execute #10)` | 157.040 | `Done (1.0s)` |
| 157.040 | `Task(execute #11)` | 158.000 | `Done (1.0s)` |
| 158.000 | `Task(execute #12)` | 158.900 | `Done (0.9s)` |
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
| 183.646 | *assistant text*: `Every question reduces to two equations.` | 183.646 | none (no `⎿` line; see Build notes 1e) |
| 184.600 | `Plot(heart, t: 0..2π)` | 187.665 | `closed curve · 1 region` |
| 193.981 | `Bash(unrender me)` | 194.905 | `merged 1,210 points` |
| 195.827 | `Edit(params.json)` | 196.750 | `6 fields unset` |
| 197.700 | `Write(pieces.ts)` | 199.981 | `Removed 6 primitives` |
| 200.442 | `Bash(rmdir world)` | 201.365 | `world/ removed` |
| 203.211 | `Bash(sandbox --disable)` | 203.673 | `protection off` |
| 205.811 | `world.execute(me)` | 207.080 | `exit 0` |

### Line patches (keyed by the LRC start of the composer line, as built by `buildAuto`)

| key | line | patch |
|---|---|---|
| `'128.661'` | You have made some **ILLEGAL ARGUMENTS** (section B's line; its hit is in C) | `kwSize: 120`, `out: 132.90` |
| `'147.66'` … `'158'` (12 lines) | **EXECUTION** ×12 | `kwSize: 150`, `kwY: 430`, `kwX` per hit table in C6. Auto `kwOut` (next − 0.20) is kept. |
| `'158.9'` … `'161.124'` | EIN DOS TROIS NE FEM LIU | `kwX: 960`, `kwY: 430` (size auto = 200) |
| `'161.584'` | EXECUTION | `kwY: 430` (size 200) |
| `'177.246'` | I’ve studied **LO-O-OVE** | `text: 'I’ve studied'` (typographic apostrophe), `kwX: 560`, `kwY: 390`, `kwSize: 160` |
| `'180.857'` | Question me, question me I can answer all **LO-O-OVE** | `kwX: 1240`, `kwY: 390`, `kwSize: 170` |
| `'184.54'` | I know the algebraic expression of **LO-O-OVE** | `kwX: 560`, `kwY: 390`, `kwSize: 160` |
| `'190.801'` | Trapped in **LO-O-OVE** | `kwX: 560`, `kwY: 390`, `kwSize: 160` |
| `'205.811'` | **EXECUTION** | `out: 207.08`, `kwOut: 206.88` |

All other lines in the range use the auto values unchanged. Stage keyword geometry with overrides:
- Baseline = `kwY + 0.36·size`.
- Width = `0.6·size·chars`.
- Underline at baseline + 28.
- Fill-to-outline behaviour as §3.

---

## C.1 Shot list

### Shot C1: 131.20–133.063 (f3936–f3991) **ILLEGAL ARGUMENTS** hit 131.224 = f3937 (on b284, a downbeat), the crash

- **f3936:** hand-over state. The stage is empty except the pen dot at C. The composer shows "You have made some" with an idle caret.
- **f3937, the hit:**
  - Keyword `ILLEGAL ARGUMENTS`: size 120, width 1224, x 348–1572, baseline 433. Inline keyword in the composer. Send pulse.
  - Stage geometry appears complete on this frame: two "argument brackets", 2 px orange, round caps.
    - Left: quadratic `M 300 130 Q 140 390 300 650`.
    - Right: `M 1620 130 Q 1780 390 1620 650`.
  - The pen dot stays at C, under the keyword.
- **131.45:** log `● TodoWrite(rebuild world)`.
- **131.679 (b285): the arguments are struck out.** A 3 px orange line at y=390 draws left to right from x=348 to x=1572 over 6 frames (f3950–f3956), linear, with a pen head at the tip.
- **132.140 (b286):**
  - Log `⎿ 6 todos · 0 done`.
  - The brackets close on the keyword: each bracket's x is scaled toward x=960 (scaleX 1 → 0 about x=960), 132.140–132.550, easeInCubic.
  - The strike line shortens symmetrically into C over the same window.
- **132.424:** keyword exit (6 frames fade + 12 px rise; auto kwOut).
- **132.55–132.60:** brackets and strike are gone. A 1 px cream ring bursts from C: r 0 → 480 over 0.5 s, opacity 0.45 → 0, linear. The pen dot pulses (1 + 0.5·env).
- **132.90:** lyric lifts and fades over 5 frames (patched `out`).
- **133.063 (b288):**
  - The composer fades out over 5 frames.
  - The status line slides to (240, 1000) over 5 frames.
  - The log jumps to the instrumental anchor (240, 916).
  - The pen dot fades over 4 frames as Block A's pens start.
- **Beats:** downbeat ripple from C at b284. The pen dot pulses every beat.

### Shot C2: 133.063–136.755 (f3992–f4102) Rebuild 1, "pieces ×36" (instrumental layout)

**Lattice:** 9 columns × 4 rows.
- Column centres x = 240, 420, 600, 780, 960, 1140, 1320, 1500, 1680.
- Row centres y = 235, 365, 495, 625.

**Cell (c, r)** holds primitive type `(c + 2r) mod 6`, in the order circle, arc, mirrored arc, line, triangle, rect. These are shot 3's primitives at 0.55 scale:
- circle r=22
- arc 77 px tall
- mirrored arc 77 px tall
- 88 px horizontal line
- triangle base 77, height 88
- rect 31 × 37, radius 2

Stroke 1.5 px cream 70 %.

**133.063–134.909, plotting:** one column per eighth note. Column c starts at `133.063 + 0.2308·c` (c = 0–8; column 8 starts at b292 = 134.909). Each of the column's 4 primitives plots in 4 frames from its own start point, with a pen head, so 4 pen heads run at once.

**Orange chase on beats b288–b295:** on beat j (j = 0–7, counted from b288), every cell with `(c + r) mod 8 = j` draws 2 px orange for 6 frames, then returns to 1.5 px cream 70 %. A cell still being plotted takes the orange from its plot.

**Rotations at b292, b293, b294 (134.909, 135.371, 135.832):** all 36 primitives rotate +60° about their own centres over 6 frames, easeOutCubic. The total is 180°.

**Implosion, b295–b296 (136.294–136.755):** all 36 glide to D, easeInCubic, and scale to 0, landing exactly on f4103.

**Logs:**
- 133.063 `● Write(pieces.ts)`, result at 134.909 `⎿ Wrote 36 primitives`.
- 134.95 `● Edit(pieces.ts)`, result at 136.294 `⎿ rotated 3 × 60°`.

**Beats:** grid ripple every beat from D. The header beat counter runs.

### Shot C3: 136.755–140.447 (f4103–f4212) Rebuild 2, the world at speed

Globe at D, r=220. This is shot 6's globe recentred.

**Plotting:**

| time | element |
|---|---|
| f4103 (b296) | Outline circle blooms r 0 → 220 in 6 frames (easeOutExpo), 1.5 px cream 70 % |
| 136.986 | Equator ellipse, rx 220, ry 40 |
| 137.217 (b297) | Parallels at ±35°: centres y = 430 ∓ 126, rx 180, ry 32 |
| 137.447 | Meridian ellipses for λ = 30°, 60°, 120°, 150° (rx = 220·\|sin λ\|) plus the central vertical |

Each line takes 6 frames at 1 px cream 45 %.

**Meridian rotation:** 140°/s from b298 (137.678), easeInQuad up to 540°/s by b304 (140.447). Meridians with cos λ < 0 drop to 25 %.

**Orbits:** rx 400, ry 92, 1 px cream 45 %. Each is plotted in 8 frames with a pen head.

| beat | rotation |
|---|---|
| b298 (137.678) | −12° |
| b300 (138.601) | +48° |
| b302 (139.524) | −72° |

**Satellites:** each orbit gets an orange satellite (r=6) at 1 revolution per bar (1.846 s), phases 0°, 120°, 240°. Each has shot 7's three-piece trail (3 px arc pieces of 17° each at opacity 1 / 0.6 / 0.3).

**Logs:**
- 136.755 `● Bash(mkdir -p world)`, result at 137.678 `⎿ world/ ready · 32×18`.
- 138.14 `● Bash(simulate ./world --fast)`, result at 140.447 `⎿ 3 orbits · 540°/s`.

**Beats:** grid ripple every beat from D. On downbeats b296 and b300, a 1 px orange ring at 45 % expands from r 220 to 280 while fading, over 0.4 s.

### Shot C4: 140.447–144.139 (f4213–f4323) Rebuild 3, the point engine

**f4213 (b304):**
- Every visible globe and orbit stroke cross-fades over 3 frames into the N = 1210 point set.
- Points are sampled uniformly by arc length across all strokes on that frame. Satellites become orange points.
- Points are r = 1.8 circles. Orange points are those with `k % 11 = 0` plus the satellite samples; the rest are cream.

**140.447–141.70, flow into the spiral:** points flow into a phyllotaxis spiral centred at D.
- Point k sits at radius `310·√(k/N)`, angle `k·137.508°`.
- Assignment by distance rank from D, as in shot 10.
- Each point waits `0.25·k/N` s, then moves for 1.0 s, easeInOutCubic.

**Spiral rotation:** 20°/s, easeInQuad up to 180°/s by 144.139.

**Ripples:**
- Every beat, each point's radius is multiplied by `1 + 0.06·env(t − tb − r/1500)`.
- Every off-beat eighth adds 0.03.

**Loading spark at D** (shot 10 mechanics):
- Filled orange hub, R = 60, appears at f4213.
- Ray i (i = 0–11) grows over 4 frames at b(304 + i). Ray 11 lands at b315 (145.524).

**Logs:**
- 140.447 `● Bash(simulate --steps 1e9)`, result at 141.370 `⎿ running`.
- 142.293 `● Read(world/you.json)`, result at 143.216 `⎿ 0 entities`.

**Downbeats b304 and b308:** a 1 px orange ring at 45 % expands from r 310 to 360 while fading, over 0.4 s.

### Shot C5: 144.139–147.66 (f4324–f4429) Arming the dial

**144.139–144.600:** all points implode into the hub (easeInCubic). Ray 8 grows on b312.

**144.600–145.985, the spark becomes the dial:**
- The spark grows R 60 → 320 about D, easeInOutCubic. Rays 9, 10 and 11 still grow in on b313, b314 and b315.
- Fill opacity goes 1 → 0 over 144.60–145.00, while a 1.5 px orange outline (Spark `outline`) takes over.

**f4380 (b316):** the outline settles to 1 px cream 45 % over 6 frames. This is **the dial**: 12 empty rays plus the outline hub (r = 0.14·R = 45), unrotated. Ray i points at `−90° + 30°·i + jitter_i`, so ray 0 is at 12 o'clock and numbering runs clockwise.

**b316–b319 (145.985, 146.447, 146.908, 147.370):**
- Each beat sends a 1 px orange ring at 45 % from R 320 to 420 (0.4 s, fading).
- Grid ripples run every beat plus off-beats; this is the densest point of the build.
- The log scrolls once per beat:
  - 145.985 `Bash(chmod +x me)`, `⎿ ok` at 146.447.
  - 146.447 `Bash(./world --dry-run)`, `⎿ 12 targets` at 146.908.
  - 146.908 `Task(execute ×12)`, `⎿ 12 agents launched` at 147.370.
- Log results here appear on the same frame as the next call. This is intended: it is the fast scroll.

**Log:** 144.139 `● Search(pattern: "you")`, result at 145.062 `⎿ No matches found`.

**f4429:** the dial is alone on stage, with the instrumental UI.

### Shot C6: 147.66–158.90 (f4430–f4766) EXECUTION ×12, fast pose cuts (character climax window)

**Fixed for the whole shot:**
- The dial at D, R = 320.
- Grid ripple from D every beat, plus one on every hit frame.
- Instrumental UI.

**Panels** (1 px cream 45 % rect frames, sharp corners):
- **L:** x 300–780, y 120–800.
- **R:** x 1140–1620, y 120–800.

Only one panel exists at a time. The image is clipped to the panel rect.

**On every hit k (frame f_k):**
1. **Hard cut.** The previous pose, its panel and its readout disappear on f_k. The new panel frame and pose appear complete.
2. **Render pass, f_k to f_k+6.** A 2 px orange scan line runs across the panel width, from the panel top to the panel bottom, linear.
   - For a **flat** hit: `X_lines.png` shows below the line and `X_flat.png` above it.
   - For a **lines** hit: the pose's 1210 points (r 1.8, colour by cls, ink-class points cream at 50 %) show below the line and `X_lines.png` above it.
3. **Readout**, 16 px mono at (panel x + 12, 146): `exec 01/12 · stand`. The number is orange; the rest is creamDim.
4. **Dial:** ray k−1 is executed. It is filled orange for f_k to f_k+2, then a 2 px orange outline for the rest of the shot. Rays already executed stay 2 px orange outline. Pending rays stay 1 px cream 45 %.
5. A 1 px orange ring at 45 % expands from R 320 to 440 while fading, over 0.4 s.
6. **Keyword:** size 150, centred at (kwX, 430), on the side opposite the panel. Auto exit at next hit − 0.20.
7. **Log:** `● Task(execute #k)`. Its result is `⎿ Done (…)` on the next hit (table above).
8. **Slow push:** art scale 1.00 → 1.03 from f_k to the next hit, linear, about the face anchor. The panel frame does not move.

**Crops** (art box measured in its own image aspect: 938 × 1680 for `a`, 1120 × 1680 for the others):
- **full:** box height 660, top 130, centred on the panel centre x.
- **medium:** box height 1100, top 120.
- **close:** box height 1700, top 100.

For medium and close, the box is shifted horizontally so the pose's face anchor (nx measured by scripts/char_v3.py; estimate 0.50) sits on the panel centre x.

| # | t | f | pose | panel | crop | treatment | kwX |
|---|---|---|---|---|---|---|---|
| 1 | 147.660 | 4430 | stand (`a`) | L | full | flat | 1350 |
| 2 | 148.600 | 4458 | reach | R | full | flat | 570 |
| 3 | 149.520 | 4486 | float | L | full | flat | 1350 |
| 4 | 150.540 | 4516 | defy | R | full | flat | 570 |
| 5 | 151.520 | 4546 | read | L | medium | flat | 1350 |
| 6 | 152.280 | 4568 | sit | R | medium | lines | 570 |
| 7 | 153.160 | 4595 | float | L | medium | flat | 1350 |
| 8 | 153.980 | 4619 | defy | R | medium | lines | 570 |
| 9 | 155.200 | 4656 | reach | L | close | flat | 1350 |
| 10 | 156.080 | 4682 | stand (`a`) | R | close | lines | 570 |
| 11 | 157.040 | 4711 | float | L | close | flat | 1350 |
| 12 | 158.000 | 4740 | defy | R | close | flat | 570 |

- The keyword spans x 945–1755 (kwX 1350) or x 165–975 (kwX 570). It never overlaps the panel.
- The escalation runs full → medium → close: 4 hits each.
- The header beat counter and the status `Executing… (Ns · esc to interrupt)` keep running.

### Shot C7: 158.90–161.584 (f4767–f4847) EIN DOS TROIS NE FEM LIU, six counted words and marks

- **f4767 (EIN):**
  - Hard cut: pose, panel and readout are removed.
  - The dial (all 12 rays now 2 px orange outline) stays.
  - Log `● Bash(count --to 6)`.

**Count hexagon:** pointy-top, R = 260, centred at D. Vertices:
- v0 (960, 170)
- v1 (1185, 300)
- v2 (1185, 560)
- v3 (960, 690)
- v4 (735, 560)
- v5 (735, 300)

**Per word** (j = 0–5):

| j | word | t | f |
|---|---|---|---|
| 0 | EIN | 158.900 | 4767 |
| 1 | DOS | 159.321 | 4780 |
| 2 | TROIS | 159.657 | 4790 |
| 3 | NE | 160.244 | 4807 |
| 4 | FEM | 160.693 | 4821 |
| 5 | LIU | 161.124 | 4834 |

On word j's frame:
- An orange node (r = 5) appears at v_j, with a 16 px creamDim index `j+1` placed 18 px radially outside it.
- Edge v_j → v_{j+1} plots in 7 frames, 2 px cream, with a pen head. The edge from LIU closes the hexagon at v0.
- The word is the stage keyword at (960, 430), size 200, auto exit at next − 0.20. Each word is readable for about 4–9 frames: a deliberate rapid count.
- A grid ripple fires from D.

**Logs:**
- 161.124 `⎿ ein dos trois ne fem liu`. Lowercase Latin is fine.
- 161.20 `● Bash(execute --now)`.

### Shot C8: 161.584–162.632 (f4848–f4878) EXECUTION #13, the shockwave

- **f4848:**
  - Keyword `EXECUTION`, size 200, at (960, 430).
  - Log `⎿ executed`.
  - **The dial and the hexagon explode outward as one group:** scale 1 → 2.6 about D over 12 frames (easeOutExpo), opacity 1 → 0 (linear), strokes keep their widths.
  - A 1 px orange ring at 45 % expands from R 320 to 1400 over 0.6 s.
  - Grid ripple from D.
- **161.98:** the stage is empty. A pen dot fades in at D over 3 frames and glides to C over 162.00–162.30 (easeInOutCubic).
- **162.25–162.55:**
  - The composer slides up from +140 px and fades in, empty, with the caret on.
  - The status line slides to (264, 852). The log moves to the lyric anchor.
  - The grid tone drops to `grid` (darker) over 6 frames.

### Shot C9: 162.632–166.016 (f4879–f4979) "If I can, if I can give them all the EXECUTION", hit 165.166 = f4955

This is the dark chorus.
- Grid tone is `grid`, with ripples every beat from C.
- Main strokes are 2 px. The stage keeps no orange except on hits.
- Composer lyric types. The stutter `marks` are 162.632 and 163.315.

**Entities:** 24 "you" circles, r = 12, 1.5 px cream 70 %, on a ring of R = 230 around C, at angles `θ_k = −90° + 15°·k`. The ring itself is never drawn.

**Plotting the entities:**
- **162.632–162.90:** the pen dot rises from C to (960, 160), easeInOutCubic.
- **163.315–165.00:** the pen travels clockwise along the invisible ring (easeInOutCubic in angle). Circle k plots in 6 frames from its top as the pen reaches θ_k. Circle 0 plots at 163.315.

**Beat pulse:** every beat from 163.315, all plotted circles scale 1 + 0.3·env.

**f4955:**
- 24 spokes draw from r = 20 to r = 218 around C in 4 frames, 1 px cream 45 %.
- All circles fill cream 100 %.
- A filled orange spark (R = 40) blooms at C, rays growing over 4 frames.
- Keyword. Inline keyword. Send pulse. Log `⎿ 24/24 delivered`.

**Log:** 162.70 `● Bash(broadcast --all execute)`.

### Shot C10: 166.016–169.824 (f4980–f5094) "Then I can, then I can be your only EXECUTION", hit 168.911 = f5067

- Lyric types. Stutter marks at 166.016 and 167.022.
- **166.016–168.555: 23 of 24 are removed**, one group per eighth note, symmetric about the vertical axis.
  - Group g (g = 0–11) starts at `166.016 + 0.2308·g`.
  - Groups: g0 = {12}, g1 = {11, 13}, g2 = {10, 14}, … g11 = {1, 23}.
  - Each removal un-plots the spoke (reverse draw, 6 frames) and the circle (6 frames) together.
- The spark at C rotates in 15° steps on every beat (6 frames, easeOutCubic).
- **Remaining:** circle 0 at (960, 160) and its spoke.
- **f5067:**
  - Spoke 0 becomes 2 px orange.
  - Circle 0 becomes a 2 px orange outline (its fill drops).
  - An outer ring (r = 22, 1 px orange 45 %) plots around it in 6 frames.
  - Keyword. Inline keyword. Send pulse. Log `⎿ 23 stopped · 1 left`.
- **Log:** 166.10 `● Bash(pkill --all-but you)`.

### Shot C11: 169.824–171.868 (f5095–f5155) "If I can have you back"

- Lyric types. At 169.90, log `● Bash(git checkout HEAD~1 -- you)`.
- **169.824:** spoke 0 un-plots over 6 frames.
- **169.85–170.25:** a dashed return path plots from (960, 160) to C: quadratic with control point (1300, 300), 1 px cream 45 %, dash 6/6.
- **170.30–171.40:**
  - The "you" circle and its outer ring travel along the path to C, easeInOutCubic (path length about 470 px, under 600 px/s).
  - The path un-plots behind it: its visible start is trimmed to the circle's arc position.
  - The spark at C shrinks to 0 over the last 6 frames of the travel.
- **171.40:** log `⎿ Updated 1 path from HEAD~1`. The circle sits centred on C.
- **171.868:** send pulse (end of a line with no keyword).

### Shot C12: 171.868–173.643 (f5156–f5208) "I will run the EXECUTION", hit 172.712 = f5181

- Lead-in types. At 171.95, log `● Bash(simulate ./world --resume)`.
- **171.868 → f5181:** progress ring around C, r = 270, 2 px cream. Plotted from 12 o'clock, clockwise, easeInQuad, with a pen head. It closes exactly on f5181 (shot 5 mechanics).
- **f5181:**
  - The ring turns 2 px orange.
  - Globe lines plot in 6 frames inside it, 1 px cream 45 %: equator (rx 220, ry 40), central meridian, and meridians for λ = 30°, 60°, 120°, 150°.
  - The meridians rotate at 140°/s.
  - The "you" circle stays at C, inside the world.
  - Keyword. Inline keyword. Send pulse. Log `⎿ running`.

### Shot C13: 173.643–177.246 (f5209–f5316) "Though we are trapped" / "We are trapped ah"

- **173.643–173.94:**
  - The ring eases r 270 → 240 and changes to 1.5 px cream 70 % over 6 frames.
  - The globe scales by 240/270.
  - At 173.70, log `● Bash(ls /exit)`.

**The walls:** a square of side 520 centred on C (x 700–1220, y 130–650). Each side is 2 px cream with a pen head, plotted in 8 frames, clockwise:

| beat | side |
|---|---|
| b376 (173.675) | top, left to right |
| b377 (174.137) | right, top to bottom |
| b378 (174.598) | bottom, right to left |
| b379 (175.060) | left, bottom to top |

**Walls closing in:**
- **174.975:** "We are trapped ah" types. Log `⎿ No such file or directory`.
- **175.06–176.90:** the square shrinks from side 520 to 340 about C (easeInOutCubic, about 50 px/s per side). Ring, globe and you-circle scale with it (ring 240 → 157).
- **b380 (175.521):** a diamond (the square rotated 45°, same side length) plots in 8 frames, 1 px cream 45 %, and shrinks with the square.
- **Every beat:** wall opacity goes 70 % → 100 % on env.
- **Downbeats b376 and b380:** grid ripple at double weight.

**Log:** 175.10 `● Read(world/bounds.json)`, result at 176.00 `⎿ walls: 4 · doors: 0`.

**Exit:**
- **176.70–176.97:** walls, diamond, ring and globe un-plot (8 frames). The you-circle shrinks into a pen dot at C (4 frames).
- **176.75–177.30:** the dot glides to (1030, 110), the scan line's start, easeInOutCubic (about 530 px/s).

### Shot C14: 177.246–180.857 (f5317–f5425) "I’ve studied LO-O-OVE", hit 179.929 = f5398. **Character moment 7, pose `read`**

**Window:** illustration visible from 177.367 to 180.857. The point set continues to 182.10 as data.

**Placement:**
- Box height 560, top 110, centred x = 1240, so the box is x 1053–1427 and y 110–670.
- Screen position = `(1053.3 + nx·373.3, 110 + ny·560)`.
- Same flat 5-tone treatment as §5 (`read_flat.png`, `read_lines.png`).

**Timeline:**
- **177.246:** lyric types. At 177.30, log `● Read(love.md)`. The header switches to light (timecode only).
- **177.30:** floor axis plotted at y = 670, x 1000–1480, 1 px cream 45 %, ticks every 60 px (6 px), 8 frames.
- **177.367 (b384) → 177.829 (b385), scan down:**
  - A 2 px orange line (x 1030–1450) moves from y = 110 to 670, linear.
  - Above it, `read_lines.png` is visible (`clip-path: inset(0 0 (670 − y) 0)` on the box).
  - A 16 px creamDim readout `y 0412` rides at x = 1458.
- **177.829 → 178.290 (b386), scan up:** a second orange line moves from 670 to 110. Below it, `read_flat.png` appears under the line art.
- **Leaders, one per beat.** Labels are right-aligned at x = 990. Each types in 5 frames (key cream 70 %, `=` creamDim, value cream), then an orange check appears 4 frames later. Each leader runs 40 px horizontally, then straight to an orange node (r = 3.5) at the feature. Anchors are estimates; verify them on the cutout.

| beat | label | baseline y | anchor (nx, ny) |
|---|---|---|---|
| b386 178.290 | `book = open` | 190 | book centre (0.22, 0.24) |
| b387 178.752 | `eyes = lowered` | 250 | face (0.56, 0.10) |
| b388 179.213 | `subject = "love"` | 310 | open page (0.30, 0.27) |

- **Slow push:** 178.29–180.857, scale 1.00 → 1.02 about (1240, 390), linear.
- **f5398:**
  - Keyword `LO-O-OVE` at (560, 390), size 160 (x 176–944). Inline keyword. Send pulse. Log `⎿ Read 1,210 lines`.
  - Leaders and labels retract into their nodes over 8 frames.
  - **Foreshadow:** a small heart curve (the C16 equation at scale 1.0, 32 × 29 px), 1.5 px orange, plotted in 6 frames from its notch at the book anchor.
- **Exit at 180.857 (f5426):**
  - Flat fills cut out.
  - `read_lines` cross-fades into `read_points.json` over 3 frames (1210 points, r 1.8, orange for cls 1, cream otherwise, ink-class cream at 50 %).
  - The small heart fades over 5 frames. The floor axis un-plots (8 frames).

### Shot C15: 180.857–184.54 (f5426–f5535) "Question me, question me I can answer all LO-O-OVE", hit 183.646 = f5509

Lyric types, stutter marks at 180.857 and 181.901. The composer is the user's question. Claude answers in the log (see 183.646).

**Two function panels** on the left, x 180–780, with t ∈ [0, 2π] mapped to x = 180 + 600·t/2π:
- **Panel X:** `X(t) = 16 sin³t`. Centre line y = 230, 5.5 px per unit (y 142–318).
- **Panel Y:** `Y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t`. Centre line y = 480, 5 px per unit (y 420–565).

**Timeline:**
- **180.90:** log `● Search(pattern: "love")`.
- **180.95–181.30:** panel axes plot (8 frames each):
  - t-axis hairlines at y = 230 and y = 480, 1 px cream 25 %.
  - Ticks at x = 180, 480, 780 (6 px).
  - Tick labels `0 π 2π`, STIX italic 26 px, cream 70 %, at y = 345 and y = 600.
- **180.90–182.10, point release** (the same exception as 29.69):
  - Her 1210 points flow left. Rank by ny: the top 605 go to Panel X samples, the rest to Panel Y.
  - Within each half, rank by nx, mapped to sample index i, with `t_i = 2π·i/604`.
  - Each point waits `0.25·rank/605` s, then moves for 0.95 s, easeInOutCubic.
- **181.30:** function labels type over 6 frames, STIX italic 30 px, cream 70 %:
  - `x(t) = 16 sin³t`, left-aligned at (180, 128).
  - `y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t` at (180, 395).
- **181.901:** log `⎿ Found 2 functions`.
- **182.10–183.50:** two pens plot both curves (2 px cream, orange pen heads), t from 0 to 2π, easeInOutSine. Each point fades over 4 frames as its pen passes t_i.
- **182.10:** log `● Plot(x(t), y(t), 0..2π)`, result at 183.50 `⎿ ok`.
- **f5509:**
  - Both curves flash 3 px orange for 3 frames, then return to 2 px cream.
  - Keyword `LO-O-OVE` at (1240, 390), size 170 (x 781–1699; the heart area is still empty). Inline keyword. Send pulse.
  - Log: an assistant text entry, `● Every question reduces to two equations.` The bullet is cream and there is no `⎿` line.

### Shot C16: 184.54–188.483 (f5536–f5653) "I know the algebraic expression of LO-O-OVE", hit 187.665 = f5630

**Heart:** `H = (1240, 354)`, s = 18. Screen point = `(1240 + 18·X(t), 354 − 18·Y(t))`.
- Notch (t = 0) at (1240, 264).
- Lobe tops at y ≈ 139. Bottom tip at (1240, 660).
- x range 952–1528. Perimeter about 1839 px.

**Timeline:**
- **184.54:** lead-in types. At 184.60, log `● Plot(heart, t: 0..2π)`.
- **184.54 → f5630, plotting:** t runs from 0 to 2π, linear in time (about 588 px/s at the heart pen). Three pen heads move in sync:
  - Panel X pen at `(180 + 600·t/2π, 230 − 5.5·X(t))`.
  - Panel Y pen at `(180 + 600·t/2π, 480 − 5·Y(t))`.
  - Heart pen. The heart path draws behind it, 2 px cream.
  - Two leaders (1 px cream 45 %), from each panel pen to the heart pen, recomputed each frame.

  The heart closes exactly at the notch on f5630.
- **Beats:** pen heads pulse every beat. Grid ripple every 2 beats from (1240, 390).
- **f5630:**
  - Heart becomes 3 px orange.
  - Panels, curves, labels and leaders un-plot over 8 frames.
  - Keyword at (560, 390), size 160. Inline keyword. Send pulse. Log `⎿ closed curve · 1 region`.
  - Header path changes to `~/world/heart`.
- **187.70–188.30:** the heart's pen dot glides from the notch to the iris centre (1240, 430), easeInOutCubic.
- **188.30:** log zone fades out over 6 frames (emotional beat: HUD light).

### Shot C17: 188.483–191.40 (f5654–f5741) "Though you are free / I am trapped / Trapped in LO-O-OVE", hit 191.356 = f5741. **Final moment, pose `sit` inside the heart**

**Window:** the illustration is visible f5654–f5741.

**Placement:**
- Sit box height 300, width 200, top 282, centred x = 1240, so the box is x 1140–1340 and y 282–582.
- Screen position = `(1140 + nx·200, 282 + ny·300)`.
- She is clipped by the heart: everything outside the s = 18 heart is cut, deliberately. Her head clears the notch; the lower skirt is cut into the heart's V. She is held inside the boundary.

**Treatment:** `sit_flat.png` (§5 flat 5-tone).

**Timeline:**
- **188.483, heart iris:**
  - Clip = (heart path scaled by k about (1240, 430)) ∩ (heart at k = 1).
  - k goes 0 → 1 over 188.483–189.05, easeOutExpo, opening from the pen dot.
  - A matching 1.5 px cream 45 % heart outline at scale k grows with the clip and is hidden once k ≥ 0.98.
- **"you are free":**
  - At 188.483, a "you" circle (r = 12, 1.5 px cream) plots in 6 frames at (600, 330).
  - It then drifts freely on the empty left stage: `x = 600 + 140·sin(0.9τ)`, `y = 330 + 70·sin(1.4τ)`, with τ = t − 188.483 (under 150 px/s).
- **189.746 / b411 (189.828), "I am trapped":** an inner heart (scale 0.93 about (1240, 430)), 1 px orange 45 %, plots from its notch in 10 frames with a pen head. This is a double wall.
- **Heartbeat, from b413 (190.751):** on every beat, the heart group scales about (1240, 430):

  `1 + 0.03·env(t − tb) + 0.015·env(t − tb − 0.15)` (lub-dub)

  The heart group is: orange heart, inner heart, her clip and image, and her points later on.
- **f5741:**
  - Keyword `LO-O-OVE` at (560, 390), size 160. Inline keyword. Send pulse.
  - An extra heartbeat: amplitude 0.05 instead of 0.03.
- HUD stays light: no log. The status reads `Lingering…`.

### Shot C18: 191.40–193.981 (f5742–f5818) The heart beats on as data

- **f5742:** flat fills cut out. `sit_lines` cross-fades into `sit_points.json` over 3 frames (1210 points at her box). Points are clipped to the heart region, the same as the art.
- **Heartbeat:** the lub-dub continues on every beat at 0.04 / 0.02 amplitude. This is the visible beat pulse of this quiet passage.
- **192.135 (b416):**
  - The orange heart becomes 2 px cream over 6 frames.
  - The inner heart un-plots (8 frames).
- **192.556:** keyword exits.
- **193.058 (b418):** the you-circle un-plots (6 frames). You have left.
- **193.356:** lyric lifts and fades (auto `out`). The composer is empty, with the caret blinking on beats.

### Shot C19: 193.981–197.673 (f5819–f5929) Un-render: her points become the object again

- **193.981 (b420):**
  - The heart un-plots, reverse draw from the notch, 10 frames.
  - The log returns at (240, 772): `● Bash(unrender me)`, result at 194.905 `⎿ merged 1,210 points`.
  - Header path changes back to `~/world`.
- **193.981–195.23:** points flow onto figure F.
  - F is height 480, top 150, centred x = 960, using the FIG primitives (§5) on box x 826–1094 (pose `a` aspect).
  - 1210 samples are distributed along F's six paths in proportion to their length.
  - Assignment: points ranked by ny map to samples ranked by y.
  - Each point waits `0.25·rank/N` s, then moves for 1.0 s, easeInOutCubic.
- **195.25–195.65:** F's six strokes plot over the points (1.5 px cream, 6 frames each, 2-frame stagger, pen heads). Each point fades as its stroke's pen passes it.
- **195.827 (b424):**
  - Dashed bounding box (1 px cream 45 %, dash 6/6) snaps around F, with `object #0001` (16 px creamDim) at its top-left. This is shot 4's frame, in reverse.
  - Log `● Edit(params.json)`, result at 196.75 `⎿ 6 fields unset`.
- **196.75 (b426):**
  - The box un-plots over 6 frames.
  - F disassembles: primitives glide back to shot 3's positions (P1 circle r = 40 at (700, 280) … P6 rect at (1220, 500)), each 0.62 s easeInOutCubic with a 2-frame stagger, landing by 197.45.
  - On landing, each gets its "+" crosshair (12 px, 1 px cream 45 %) and its 16 px creamDim label, fading in over 5 frames.

### Shot C20: 197.673–201.365 (f5930–f6040) The pieces are picked up

- **197.70:** log `● Write(pieces.ts)`, result at 199.981 `⎿ Removed 6 primitives`.
- **One primitive un-plots per beat.** Each is a reverse draw with a pen head over 8 frames; its label and crosshair lift and fade over 5 frames.

| beat | primitive |
|---|---|
| b428 197.673 | P6 rect |
| b429 198.135 | P5 triangle |
| b430 198.596 | P4 line |
| b431 199.058 | P3 arc |
| b432 199.519 | P2 arc |
| b433 199.981 | P1 circle |

- The circle's pen ends at its 12 o'clock point (700, 240). That pen head stays as the dot.
- **200.25–200.75:** the dot glides to C, easeInOutCubic.
- **200.442 (b434):** log `● Bash(rmdir world)`.
- **200.442–201.365, grid retracts:** a dot is drawn only while its distance from C is ≤ `R(t) = 1300 − 1400·(t − 200.442)`, linear, so R reaches 0 at about 201.37. This is the reverse of the 1.536 wake.
- **201.365:** grid gone. Log `⎿ world/ removed`. Header path changes to `~`. HUD returns to full (beat counter).

### Shot C21: 201.365–205.811 (f6041–f6173) The seed

- The stage holds only the orange pen dot at C. It pulses every beat (scale 1 + 0.5·env).
- **Downbeat rings** at b436 (201.365), b440 (203.211) and b444 (205.057): a 1 px cream ring from the dot, r 9 → 600 over 1.2 s, opacity 0.45 → 0, linear.
- **203.211:** log `● Bash(sandbox --disable)`, result at 203.673 `⎿ protection off`. This is shot 2, reversed.
- **205.057–205.70:** a spark outline is plotted around the dot.
  - R = 56, 1 px cream 45 %, the dot as the hub.
  - Ray i starts at `205.057 + 0.05·i` and takes 4 frames to plot.
- The composer is empty, with the caret blinking on beats.

### Shot C22: 205.811–211.96 (f6174–f6358) Final EXECUTION, `exit 0`, the end

- **f6174:**
  - The spark fills orange (R = 56, filled variant).
  - Keyword `EXECUTION`, size 200, at (960, 390). The spark sits under the 3-frame fill, then shows through the outline.
  - Inline `EXECUTION` in the composer. Send pulse.
  - Log `● world.execute(me)`, typed at 5 chars/frame. The orange bullet pulses on beats while it runs.
  - Status: `Executing…`.
- **b446 (205.980), b447 (206.442), b448 (206.903):** the spark steps 15° (6 frames, easeOutCubic).
- **206.88:** keyword exit (6 frames). It is gone by f6212.
- **f6212 (207.08, the audio stops):**
  - Log `⎿ exit 0`. The bullet turns creamDim.
  - The composer's inline keyword has finished its 5-frame lift (patched `out`).
  - The spark stops stepping and rotates at 4°/s.
  - HUD goes light (the beat counter stops with the music; the timecode keeps running).
  - The caret keeps its idle blink on the nominal grid.
- **f6226 (207.55):** status becomes static `✻ Worked for 3m 31s`: creamDim, static spark R = 11.
- **207.55–210.00:** still frame. Background, header, empty composer with caret, log (`Bash(sandbox --disable)` dimmed at 40 %, `world.execute(me)` / `⎿ exit 0`), the Worked line, and the slowly rotating orange spark at C.
- **210.00–211.60 (f6300–f6348):** global linear fade to `bg` for everything except the spark.
- **211.00–211.90 (f6330–f6357):** the spark fades last.
- **f6357–f6358:** background only.

---

## C.2 Character moments in this section (summary)

The flat 5-tone treatment and the line-colour rules from §5 apply to every row. There is no halo, shadow or puppeting, and art is never shown outside these windows.

| Window | Pose(s) | Placement box | Arrives by | Leaves by |
|---|---|---|---|---|
| 147.66–158.90 (f4430–f4766), climax | stand `a`, reach, float, defy, read, sit (12 cuts, C6 table) | Panel L x 300–780 or R x 1140–1620, y 120–800. Crops: full h660 top130, medium h1100 top120, close h1700 top100 | Hard cut on each hit, plus a 6-frame orange scan pass (lines→flat, or points→lines) | Hard cut at EIN, f4767 |
| 177.367–180.857 (f5321–f5425), moment 7 | read | h560, top 110, centre x 1240 (x 1053–1427), floor axis y 670 | Scan down (lines), then scan up (flats), 3 leaders | Points at f5426, which become the function-panel samples |
| 188.483–191.40 (f5654–f5741), final moment | sit | h300, top 282, centre x 1240 (x 1140–1340), clipped to the s = 18 heart at (1240, 354) | Heart-shaped iris from the pen dot, k 0 → 1, easeOutExpo | Points at f5742, which become figure F |

---

## C.3 Build notes

### 1. Generalise the demo-only switches in ui.tsx before building C

All of these are data-driven through `UiSeg` and `SectionData`.

**a. Layout from `uiAt(t)`.**
- `logLayout`, `statusPos` and `composerShift` currently hard-code demo times. Drive them from the UI segments instead.
  - Composer transitions: 5-frame fade out, and a 0.3 s slide-up in.
  - Status transitions: 5-frame slide out, and a 0.3 s slide back plus a 5-frame landing.
- LogZone's `sectionStart` should be the `from` of the segment whose log anchor last changed.

**b. Keyword placement.**
- `StageKeyword` must use the KEYWORDS entry's `x`, `y` and `size`, with `baseY = y + 0.36·size`.
- Keep `.find`. The auto `kwOut` already guarantees no overlap, including the count words (DOS → TROIS is 10 frames: 4 visible plus 6 exit). Assert at build time that `kw[i].out + 6/30 ≤ kw[i+1].t`.

**c. Grid.**
- Ripple centre and density come from `UiSeg.ripple`.
- Add `hits?: number[]` for extra ripple onsets: the 12 EXECUTIONs, the 6 count words and 161.584.
- Add `gridTone: 'lo' | 'hi'`.
- Add a `retract` interval for 200.442–201.365. The radius formula is in C20.

**d. Header and status text.**
- Header path: drive it from a `{t, path}` list.
- `hud` already exists.
- StatusLine's `Worked for 46s` is hard-coded. Take the text from the matching `Status` entry: `verb: 'Worked for 3m 31s'` at 207.55, which `WORKED_AT` already finds.
- The demo's `Worked for 46s` at 44.455 is already superseded, because arc_full removes the demo's `exit 0` tail.

**e. Assistant-text log entries.** A `Log` with `res: ''` renders a cream bullet and the text at weight 400. It draws no Elbow and no result line.

**f. Lines with long gaps.** `buildAuto` exits a line 2 s after its last event when the gap is longer than 3.2 s. That already gives "Trapped in LO-O-OVE" `out = 193.356`. The other `out` values come from the patches table.

### 2. Shared section-C primitives (new file `sections/c.tsx`, using geo.tsx)

**Pen dot.** Use `PenHead` with `t` so it pulses on beats.

**Lattice (C2).**
- Six path builders: `circlePath`, arc via a quadratic `M…Q…`, `linePath`, `polyPath` for the triangle, `roundRectPath`.
- Each primitive is wrapped in `<g transform="rotate(a cx cy) translate/scale">` for the rotation and implosion steps.
- Use `Plot p=` for plotting. 36 `Plot`s is cheap.

**Globe (C3, C12).** Reuse the shot 6/7 code from Intro.tsx, recentred and parameterised by r.

**Point engine (C4, C14–C15, C18–C19).**
- Reuse the demo's single 1210-point canvas.
- Precompute per-point targets for each state:
  1. globe samples
  2. spiral
  3. hub
  4. read silhouette
  5. panel samples
  6. sit silhouette
  7. F samples
- Every pose JSON already has exactly 1210 `[nx, ny, cls]`, so one array index works throughout.
- Clip the canvas with `Path2D(heartPath)` during C18.

**Spark dial (C5–C8).** Extend `Spark` with:
- `rayStyle?: (i) => {fill?: string; stroke?: string; w?: number; opacity?: number}`, for the per-ray executed, pending and flash states.
- An `R` that can animate.

The shockwave in C8 is a `scale()` on the dial plus hexagon group.

**Heart.**
- `heartPath(Hx, Hy, s, k = 1, cx = 1240, cy = 430)`: 720 samples, starting at t = 0 (the notch), so p = 1 closes there.
- Build it with `polyPath` and cache it by key.
- The iris uses CSS `clip-path: path('…')` on a wrapper div. Chromium supports it, so it works in Remotion.
- Nest two wrappers for the k-scaled ∩ full-heart intersection.
- Never use SVG filters.

**Pose cut (C6): `<PoseCut pose crop panel treatment t0 />`.**
- Outer div: the panel rect with `overflow: hidden`.
- Inner `<Img>` elements: lines, flat, and a points canvas.
- Each has `clip-path: inset(…)` driven by the scan-line y.

**Character scans (C14).** Copy the moment A code path (inset clips plus readout) with the read box values.

### 3. Hard-cut discipline

Keyword frames and pose cuts all use `frame === round(30·t)`, with no pre-roll. Pose k is rendered only for `f_k ≤ frame < f_{k+1}`.

For the sync overlay, flash on:
- 3937
- 4430, 4458, 4486, 4516, 4546, 4568, 4595, 4619, 4656, 4682, 4711, 4740
- 4767, 4780, 4790, 4807, 4821, 4834, 4848
- 4955, 5067, 5181, 5398, 5509, 5630, 5741
- 6174, 6212

### 4. Speed-limit exceptions

All of these are deliberate and short:
- C2 implosion: one beat, easeInCubic.
- C15 point release to the panels.
- C8 shockwave: 12 frames.

Everything else stays under about 600 px/s. At most 2 groups move at once.

### 5. Orange budget

The riskiest frames are the C6 close-ups (hits 9, 11, 12: orange hair inside a 480 × 680 panel) together with the 2.5 px keyword outline and executed rays. Measure orange-family pixels on those frames: hue 10–25°, sat > 0.35, and include orangeDeep. If a frame is over 8 % outside the 3-frame keyword fill, switch hit 11 to `lines`.

### 6. Readability

Every keyword in C sits on empty stage or over hairlines:
- Climax keywords sit on the side opposite the panel.
- LOVE keywords sit to the left of her and the heart. The exception is 183.646, which sits right while the heart area is still empty.

`stageDim` (60 %) still applies to the dial, lattice and globe.

### 7. Assets

No new raster material is needed. All six poses (`a`, sit, reach, float, defy, read) exist in public/char as `_flat`, `_lines`, `_alpha` and `_points.json`, and the close crop (box height 1700) is about a 1:1 scale of the 1680 px sources.

Two cases would need new art:
- The face-anchor check shows a pose unusable at close crop.
- The client wants a cleaner `read` book angle.

In either case, generate a replacement pose with GPT image, matching the existing character sheet, then run scripts/char_v3.py to flatten it into the 5 tones. Never place generated art unprocessed.

Anchors to measure in char_v3.py:
- face nx for each pose (needed for the medium and close crops)
- `read`: book, face and page
- `sit`: head top (to confirm it clears the notch at y = 264)

### 8. No Chinese

The count words are Latin (`EIN … LIU`), and the log result spells them in lowercase Latin. The existing CJK regex assertion covers sections/c.data.ts and c.tsx.

### 9. Composition length

211.96 s = 6359 frames (f0–f6358). Audio ends at f6212. f6357–f6358 must be pure `bg`.

---

## C.4 Hand-over state

### At 131.20 (f3936, incoming from section B)

**Stage:** empty except one orange pen dot (r = 4 plus a 1 px ring r = 9 at 45 %) at (960, 390), pulsing on beats.

**Persistent UI**, in the lyric layout:
- Dot grid in `gridHi`.
- Header: `claude ~/world` and `02:11.2 · 130 bpm · beat 283`.
- Composer showing "You have made some" (Newsreader 52) with the caret idle.
- Log at the (240, 772) anchor with section B's last entries.
- Status at (264, 852) with B's verb.

**On the next frame:** ILLEGAL ARGUMENTS hits on f3937 and is drawn by C1. Section B must not draw anything for that hit.

### At 211.96 (f6358, end of film)

Background `#0E0D0C` only. No grid, header, UI, spark or text. The audio has been silent since 207.08.

The last frames with content:
- **f6329:** everything at about 18 % (faded).
- **f6356:** the orange spark at (960, 390), R = 56, at about 3 %.