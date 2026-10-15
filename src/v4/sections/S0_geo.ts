// Section 0 geometry and the orange dot's single continuous journey.
// Everything is in screen px (1920×1080) unless noted. The dot's position is a
// pure function of t built from contiguous segments; each segment starts where
// the previous one ended, so the dot never teleports.
import {beat, clamp01, ease, Ease, lerp, prog} from '../../v3/core';
import {circlePath, ngonPath, pathLen, pointAt, polyPath} from '../../v3/geo';
import type {P2} from '../shell/lib';
import {sendButtonPos} from '../shell/Composer';
import {COMP0, T} from './s0.data';

export const TAU = Math.PI * 2;
export const n2 = (v: number) => Math.round(v * 100) / 100;
export const lp = (a: P2, b: P2, p: number): P2 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
export const rotP = (p: P2, c: P2, deg: number): P2 => {
  const a = (deg * Math.PI) / 180, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
export const cubicAt = (p0: P2, p1: P2, p2: P2, p3: P2, u: number): P2 => {
  const v = 1 - u;
  return [
    v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
  ];
};
export const cubicPath = (p0: P2, p1: P2, p2: P2, p3: P2) => `M ${n2(p0[0])} ${n2(p0[1])} C ${n2(p1[0])} ${n2(p1[1])} ${n2(p2[0])} ${n2(p2[1])} ${n2(p3[0])} ${n2(p3[1])}`;
const F = (f: number) => f / 30;

// ================================================================== intro stage
export const SEND0 = sendButtonPos(COMP0.x, COMP0.y, COMP0.w); // (708, 932)
export const SOCKET = {cx: 1330, cy: 830, w: 76, h: 54};
export const PLUG: P2 = [1330, SOCKET.cy + SOCKET.h / 2 + 8]; // just below the socket
export const PLUG_IN: P2 = [1330, SOCKET.cy + SOCKET.h / 2];
export const CABLE_A: P2 = [-12, 1046];
// cable from the left edge to the dot (its free end)
export const cablePath = (d: P2) => cubicPath(CABLE_A, [CABLE_A[0] + 560, CABLE_A[1]], [d[0], Math.max(d[1] + 220, 1040)], d);
// the dot's route from the send button into the socket
const POWER_ROUTE: [P2, P2, P2, P2] = [SEND0, [770, 1012], [1330, 1034], PLUG];

export const HC: P2 = [1330, 470]; // shield centre
export const HEX_R = 170;
export const hexPath = (R: number, rot = 180) => ngonPath(HC[0], HC[1], R, 6, rot); // rot 180: starts at the bottom vertex
export const HEX_D = hexPath(HEX_R);
export const HEX_BOTTOM: P2 = [HC[0], HC[1] + HEX_R];

// the three pieces, in a row on the grid
export const PC = {c: [1080, 540] as P2, r: 56};
export const PT = {apex: [1320, 478] as P2, right: [1390, 602] as P2, left: [1250, 602] as P2};
export const PS = {x: 1504, y: 484, s: 112};
export const PIECE_T = {
  circ: [3.96, 4.28] as [number, number],
  tri: [4.42, 4.74] as [number, number],
  sq: [4.88, 5.2] as [number, number],
};
export const circPieceD = circlePath(PC.c[0], PC.c[1], PC.r, -90);
export const triPieceD = polyPath([PT.apex, PT.right, PT.left], true);
export const sqPieceD = polyPath([[PS.x, PS.y], [PS.x + PS.s, PS.y], [PS.x + PS.s, PS.y + PS.s], [PS.x, PS.y + PS.s]], true);

// Figure F built from the `stand` line art's own anchors (source px), so the
// object made here locks onto her construction in the verse.
export const STAND_ANCH = {
  head: {c: [490, 150] as P2, r: 100},
  dress: {apex: [490, 225] as P2, left: [105, 1330] as P2, right: [950, 1330] as P2},
  book: {c: [300, 635] as P2, w: 95, h: 118, rot: 12},
  heart: [515, 390] as P2,
};
export type FigGeo = {head: {c: P2; r: number}; tri: [P2, P2, P2]; book: {c: P2; w: number; h: number; rot: number}};
// map the anchors with (sx, sy) → (ox + (sx − ax)·k, oy + (sy − ay)·k)
export const figFrom = (map: (p: P2) => P2, k: number): FigGeo => {
  const A = STAND_ANCH;
  return {
    head: {c: map(A.head.c), r: A.head.r * k},
    tri: [map(A.dress.apex), map(A.dress.right), map(A.dress.left)],
    book: {c: map(A.book.c), w: A.book.w * k, h: A.book.h * k, rot: A.book.rot},
  };
};
const KF = 0.36;
export const F_OBJ = figFrom((p) => [1330 + (p[0] - 527) * KF, 236 + (p[1] - 50) * KF], KF);
export const F_PIECES: FigGeo = {
  head: {c: PC.c, r: PC.r},
  tri: [PT.apex, PT.right, PT.left],
  book: {c: [PS.x + PS.s / 2, PS.y + PS.s / 2], w: PS.s, h: PS.s, rot: 0},
};
export const shiftFig = (g: FigGeo, dx: number, dy: number, s = 1, about: P2 = [0, 0]): FigGeo => {
  const m = (p: P2): P2 => [about[0] + (p[0] - about[0]) * s + dx, about[1] + (p[1] - about[1]) * s + dy];
  return {head: {c: m(g.head.c), r: g.head.r * s}, tri: [m(g.tri[0]), m(g.tri[1]), m(g.tri[2])], book: {c: m(g.book.c), w: g.book.w * s, h: g.book.h * s, rot: g.book.rot}};
};
export const lerpFig = (a: FigGeo, b: FigGeo, p: number[]): FigGeo => ({
  head: {c: lp(a.head.c, b.head.c, p[0]), r: lerp(a.head.r, b.head.r, p[0])},
  tri: [lp(a.tri[0], b.tri[0], p[1]), lp(a.tri[1], b.tri[1], p[1]), lp(a.tri[2], b.tri[2], p[1])],
  book: {c: lp(a.book.c, b.book.c, p[2]), w: lerp(a.book.w, b.book.w, p[2]), h: lerp(a.book.h, b.book.h, p[2]), rot: lerp(a.book.rot, b.book.rot, p[2])},
});
export const bookCorners = (b: FigGeo['book']): P2[] =>
  ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as P2[]).map(([sx, sy]) => rotP([b.c[0] + (sx * b.w) / 2, b.c[1] + (sy * b.h) / 2], b.c, b.rot));
export const figBox = (g: FigGeo) => {
  const xs = [g.head.c[0] - g.head.r, g.head.c[0] + g.head.r, ...g.tri.map((p) => p[0]), ...bookCorners(g.book).map((p) => p[0])];
  const ys = [g.head.c[1] - g.head.r, g.head.c[1] + g.head.r, ...g.tri.map((p) => p[1]), ...bookCorners(g.book).map((p) => p[1])];
  return {x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys)};
};

// F over time (intro): pieces → F (glide, staggered), slide left, shrink onto the globe.
export const GLIDE = {t0: T.glide, dur: 0.62, stagger: F(2)};
export const SLIDE = {t0: 6.9, t1: 7.3, dx: -330};
export const SHRINK = {t0: 11.1, t1: 11.6, s: 0.2};
export const GLOBE = {c: [1330, 560] as P2, R: 210};
export const figAt = (t: number): FigGeo => {
  const ps = [0, 1, 2].map((i) => prog(t, GLIDE.t0 + i * GLIDE.stagger, GLIDE.t0 + i * GLIDE.stagger + GLIDE.dur, ease.inOutCubic));
  let g = lerpFig(F_PIECES, F_OBJ, ps);
  const sl = prog(t, SLIDE.t0, SLIDE.t1, ease.inOutCubic);
  g = shiftFig(g, SLIDE.dx * sl, 0);
  const sh = prog(t, SHRINK.t0, SHRINK.t1, ease.inOutCubic);
  if (sh > 0) {
    const feet: P2 = [(g.tri[1][0] + g.tri[2][0]) / 2, g.tri[1][1]];
    const dest: P2 = [GLOBE.c[0], GLOBE.c[1] - GLOBE.R];
    const s = lerp(1, SHRINK.s, sh);
    g = shiftFig(g, (dest[0] - feet[0]) * sh, (dest[1] - feet[1]) * sh, s, feet);
  }
  return g;
};

// params.json window
export const PW = {x: 1200, y: 290, w: 620, h: 400};
export const PW_C: P2 = [PW.x + PW.w / 2, PW.y + PW.h / 2];
export const PW_ROWS = ['{', '  "hair": "#D97757",', '  "ornament": "flower",', '  "ribbon": "black",', '  "book": true,', '  "heart": null', '}'];
export const PW_FIELDS = [
  {row: 1, col: 10, t: beat(17)},
  {row: 2, col: 14, t: beat(18)},
  {row: 3, col: 12, t: beat(19)},
  {row: 4, col: 10, t: beat(20)},
  {row: 5, col: 11, t: beat(20.5)},
];
export const PW_TYPE = 0.16; // seconds to type a value
export const PW_TXT = {x: 24 + 48, y: 20, lh: 32, size: 20, cw: 12}; // body coords
export const pwCaret = (row: number, col: number): P2 => [PW.x + PW_TXT.x + col * 12 + 9, PW.y + 34 + PW_TXT.y + row * 32 + 16];
export const PW_BAR = {x: 80, y: 293, cw: 30, gap: 8, h: 14, n: 12, t0: 8.805, step: 0.1154}; // body coords
export const pwCell = (k: number): P2 => [PW.x + PW_BAR.x + k * (PW_BAR.cw + PW_BAR.gap) + PW_BAR.cw / 2, PW.y + 34 + PW_BAR.y + PW_BAR.h / 2];
export const PW_CLOSE = 11.1;

// globe
export const GLOBE_T = {outline: [11.62, 12.15], eq: [12.15, 12.4], parN: [12.47, 12.64], parS: [12.71, 12.88], spin: 12.906};
const LAT = (35 * Math.PI) / 180;
export const PAR = {dy: GLOBE.R * Math.sin(LAT), rx: GLOBE.R * Math.cos(LAT), ry: 36 * Math.cos(LAT)};
// ellipse polyline starting at its left point, running through the front (bottom) first
export const ellLeft = (cx: number, cy: number, rx: number, ry: number, n = 96) => {
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI - (i / n) * TAU;
    pts.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]);
  }
  return polyPath(pts);
};
export const GLOBE_D = {
  outline: circlePath(GLOBE.c[0], GLOBE.c[1], GLOBE.R, 180),
  eq: ellLeft(GLOBE.c[0], GLOBE.c[1], GLOBE.R, 36),
  parN: ellLeft(GLOBE.c[0], GLOBE.c[1] - PAR.dy, PAR.rx, PAR.ry),
  parS: ellLeft(GLOBE.c[0], GLOBE.c[1] + PAR.dy, PAR.rx, PAR.ry),
};
export const GLOBE_LEFT: P2 = [GLOBE.c[0] - GLOBE.R, GLOBE.c[1]];
export const GLOBE_BOTTOM: P2 = [GLOBE.c[0], GLOBE.c[1] + GLOBE.R];
// meridian rotation λ(t) in degrees
export const spinDeg = (t: number) => {
  const t0 = GLOBE_T.spin;
  if (t < t0) return 0;
  const a = Math.min(t, T.SIM) - t0;
  let d = 40 * a;
  if (t > T.SIM) {
    const r = t - T.SIM, ramp = F(4);
    d += r < ramp ? 40 * r + (100 * r * r) / (2 * ramp) : 40 * ramp + 50 * ramp + 140 * (r - ramp);
  }
  return d;
};
export const ORBIT = {rx: 330, ry: 78, rot: -12, period: 4 * (60 / 130)};
export const orbitPt = (psiDeg: number): P2 => {
  const a = (psiDeg * Math.PI) / 180;
  return rotP([GLOBE.c[0] + ORBIT.rx * Math.cos(a), GLOBE.c[1] + ORBIT.ry * Math.sin(a)], GLOBE.c, ORBIT.rot);
};
export const orbitPsi = (t: number) => 90 + (360 * (t - T.SIM)) / ORBIT.period;

// title
export const TITLE = {x0: 312, base: 520, size: 120, text: 'world.execute(me)'};
export const SEMI_DOT: P2 = [TITLE.x0 + 17 * 72 + 36, TITLE.base - 58.2]; // ; upper dot centre
export const TITLE_TYPE: [number, number] = [14.95, 15.6];
export const DOT_HOVER: P2 = [SEMI_DOT[0], 352];

// ================================================================== instrumental
export const PARK: P2 = [1438, 344]; // future editor centre
export const EDITOR = {x: 980, y: 64, w: 916, h: 560};
export const TERM = {x: 980, y: 648, w: 916, h: 316};
export const EDITOR_DOT: P2 = [EDITOR.x + 18, EDITOR.y + 17];
export const TERM_C: P2 = [TERM.x + TERM.w / 2, TERM.y + TERM.h / 2];
export const TERM_DOT: P2 = [TERM.x + 18, TERM.y + 17];
// the boot windows close one after the other, each into its centre dot (Win's
// close grammar); the orange dot is waiting there, so the close dot merges into it
export const EDIT_CLOSE = beat(61); // 28.30
export const TERM_CLOSE = T.winsClose; // 28.764
const CLOSE_DOT = 9 / 30; // Win shows its close dot 9 frames after tClose
export const NB = {x: 980, y: 64, w: 916, h: 900};
export const NB_C: P2 = [NB.x + NB.w / 2, NB.y + NB.h / 2];
export const NB_BODY: P2 = [NB.x, NB.y + 34];
export const nb = (p: P2): P2 => [p[0] + NB_BODY[0], p[1] + NB_BODY[1]]; // body → screen

// ================================================================== verse (notebook body coords)
export const AX = {x0: 96, y0: 84, x1: 880, y1: 656};
export const CHAR = {h: 520, top: 110};
export const charK = CHAR.h / 1536;
export const CHAR_X = 458 - (1024 * charK) / 2;
export const charMap = (p: P2): P2 => [CHAR_X + p[0] * charK, CHAR.top + p[1] * charK]; // source → body
export const HEART_B = charMap(STAND_ANCH.heart);
export const F_CHAR = figFrom(charMap, charK);
export const FC_T = {head: [31.12, 31.42] as [number, number], tri: [31.5, 31.88] as [number, number], book: [31.94, 32.14] as [number, number]};
export const F_CHAR_D = {
  head: circlePath(F_CHAR.head.c[0], F_CHAR.head.c[1], F_CHAR.head.r, -90),
  tri: polyPath(F_CHAR.tri, true),
  book: polyPath(bookCorners(F_CHAR.book), true),
};
export const CIRC = {c: [458, 370] as P2, r: 180, plot: [33.6, 34.4] as [number, number]};
export const CIRC_D = circlePath(CIRC.c[0], CIRC.c[1], CIRC.r, -90);
export const ROLL = {glide: [34.65, 34.95] as [number, number], x0: 150, r: 100, cy: 460, base: 560, roll: [34.95, T.CIRC] as [number, number]};
export const ROLL_L = TAU * ROLL.r; // 628.3
export const WAVE = {x0: 150, w: ROLL_L, morph: [37.07, 37.6] as [number, number], yb: 380, A: 140, slide: [38.6, 40.6] as [number, number], u0: 0.04, u1: 0.96};
export const waveY = (x: number, yb: number, A: number) => yb - A * Math.sin((4 * Math.PI * (x - WAVE.x0)) / WAVE.w);
export const ZENO = {t0: beat(88.5) /* 40.994 */, step: 60 / 130 / 2, x1: 916, y: 380};
export const zenoX = (t: number) => ZENO.x1 - (ZENO.x1 - WAVE.x0) * Math.pow(2, -Math.max(0, t - ZENO.t0) / ZENO.step);
export const LIMC = {asy: 220, amp: 300, lam: 180, x0: 150, t0: 42.72, axisY: 600};
export const limY = (x: number) => LIMC.asy + LIMC.amp * Math.exp(-(x - LIMC.x0) / LIMC.lam);
export const limX = (t: number) => LIMC.x0 + (ZENO.x1 - LIMC.x0) * ease.outQuart(clamp01((t - LIMC.t0) / (T.LIM - LIMC.t0)));
// the slider on the wave
export const slideU = (t: number) => lerp(WAVE.u0, WAVE.u1, prog(t, WAVE.slide[0], WAVE.slide[1], ease.inOutSine));
export const wavePt = (u: number, yb = WAVE.yb, A = WAVE.A): P2 => {
  const x = WAVE.x0 + WAVE.w * u;
  return [x, waveY(x, yb, A)];
};

// ================================================================== the dot
type Seg = {t0: number; t1: number; at: (t: number) => P2};
const mv = (t0: number, t1: number, a: P2, b: P2, e: Ease = ease.inOutCubic, lift = 0): Seg => ({
  t0,
  t1,
  at: (t) => {
    const p = e(clamp01((t - t0) / (t1 - t0)));
    const q = lp(a, b, p);
    return lift ? [q[0], q[1] - lift * 4 * p * (1 - p)] : q;
  },
});
const ride = (t0: number, t1: number, d: string, e: Ease = ease.linear, p0 = 0, p1 = 1): Seg => ({
  t0,
  t1,
  at: (t) => {
    return ptAt(d, lerp(p0, p1, e(clamp01((t - t0) / (t1 - t0)))));
  },
});
const fn = (t0: number, t1: number, at: (t: number) => P2): Seg => ({t0, t1, at});

// orbit exit point
const ORBIT_OUT = orbitPt(orbitPsi(T.title0));

// parameter caret positions
const pwEnd = (i: number) => {
  const f = PW_FIELDS[i];
  const val = PW_ROWS[f.row].slice(f.col).length;
  return pwCaret(f.row, f.col + val);
};
const pwType = (i: number): Seg => {
  const f = PW_FIELDS[i];
  const len = PW_ROWS[f.row].slice(f.col).length;
  return fn(f.t, f.t + PW_TYPE, (t) => pwCaret(f.row, f.col + Math.min(len, Math.floor(((t - f.t) / PW_TYPE) * len + 1e-6))));
};

// verse helpers (screen)
const NBp = (p: P2): P2 => nb(p);
const fcHeadTop: P2 = [F_CHAR.head.c[0], F_CHAR.head.c[1] - F_CHAR.head.r];
const fcBook = bookCorners(F_CHAR.book);
const circTop: P2 = [CIRC.c[0], CIRC.c[1] - CIRC.r];
const rollContact = (t: number): P2 => {
  const p = prog(t, ROLL.roll[0], ROLL.roll[1], ease.inOutSine);
  return [ROLL.x0 + ROLL_L * p, ROLL.base];
};
const morphYb = (t: number) => lerp(ROLL.base, WAVE.yb, prog(t, WAVE.morph[0], WAVE.morph[1], ease.inOutCubic));
const morphA = (t: number) => lerp(0, WAVE.A, prog(t, WAVE.morph[0], WAVE.morph[1], ease.inOutCubic)) * (1 - prog(t, 40.71, 41.1, ease.inOutCubic));

const SEGS: Seg[] = [
  // 0.1–1.536: born from the send button, carries the power line into the socket
  fn(T.send0, 1.45, (t) => cubicAt(...POWER_ROUTE, ease.inOutCubic(clamp01((t - T.send0) / (1.45 - T.send0))))),
  mv(1.45, T.click, PLUG, PLUG_IN, ease.inCubic),
  // 1.74–2.92: rises from the socket and circles the shield into being
  mv(1.74, T.hex0, PLUG_IN, HEX_BOTTOM, ease.inOutCubic),
  ride(T.hex0, T.PROT, HEX_D),
  mv(T.PROT, 3.25, HEX_BOTTOM, HC, ease.outCubic),
  // 3.84–5.2: lays the three pieces
  mv(T.pieces, PIECE_T.circ[0], HC, [PC.c[0], PC.c[1] - PC.r], ease.inOutCubic, 30),
  ride(PIECE_T.circ[0], PIECE_T.circ[1], circPieceD, ease.inOutSine),
  mv(PIECE_T.circ[1], PIECE_T.tri[0], [PC.c[0], PC.c[1] - PC.r], PT.apex, ease.inOutCubic, 24),
  ride(PIECE_T.tri[0], PIECE_T.tri[1], triPieceD, ease.inOutSine),
  mv(PIECE_T.tri[1], PIECE_T.sq[0], PT.apex, [PS.x, PS.y], ease.inOutCubic, 24),
  ride(PIECE_T.sq[0], PIECE_T.sq[1], sqPieceD, ease.inOutSine),
  // 5.69–7.3: rides the book corner while the pieces become an object
  fn(GLIDE.t0, 7.1, (t) => bookCorners(figAt(t).book)[0]),
  // 7.1–10.07: opens params.json and fills it field by field
  fn(7.1, 7.44, (t) => lp(bookCorners(figAt(7.1).book)[0], PW_C, ease.inOutCubic(clamp01((t - 7.1) / 0.34)))),
  mv(7.92, PW_FIELDS[0].t, PW_C, pwCaret(PW_FIELDS[0].row, PW_FIELDS[0].col)),
  pwType(0),
  mv(PW_FIELDS[0].t + PW_TYPE + 0.01, PW_FIELDS[1].t, pwEnd(0), pwCaret(PW_FIELDS[1].row, PW_FIELDS[1].col), ease.inOutCubic, 10),
  pwType(1),
  mv(PW_FIELDS[1].t + PW_TYPE + 0.01, PW_FIELDS[2].t, pwEnd(1), pwCaret(PW_FIELDS[2].row, PW_FIELDS[2].col), ease.inOutCubic, 10),
  pwType(2),
  mv(PW_FIELDS[2].t + PW_TYPE + 0.01, PW_FIELDS[3].t, pwEnd(2), pwCaret(PW_FIELDS[3].row, PW_FIELDS[3].col), ease.inOutCubic, 10),
  pwType(3),
  mv(PW_FIELDS[3].t + PW_TYPE + 0.01, PW_FIELDS[4].t, pwEnd(3), pwCaret(PW_FIELDS[4].row, PW_FIELDS[4].col), ease.inOutCubic, 10),
  pwType(4),
  mv(9.86, 10.074, pwEnd(4), pwCell(PW_BAR.n - 1), ease.inOutCubic, 12),
  // 10.6–11.1: the window closes into the dot
  mv(10.6, 11.0, pwCell(PW_BAR.n - 1), PW_C),
  // 11.43–12.88: plots the wireframe globe
  mv(11.43, GLOBE_T.outline[0], PW_C, GLOBE_LEFT, ease.inOutCubic, 40),
  ride(GLOBE_T.outline[0], GLOBE_T.outline[1], GLOBE_D.outline, ease.inOutSine),
  ride(GLOBE_T.eq[0], GLOBE_T.eq[1], GLOBE_D.eq, ease.inOutSine),
  mv(GLOBE_T.eq[1], GLOBE_T.parN[0], GLOBE_LEFT, [GLOBE.c[0] - PAR.rx, GLOBE.c[1] - PAR.dy]),
  ride(GLOBE_T.parN[0], GLOBE_T.parN[1], GLOBE_D.parN, ease.inOutSine),
  mv(GLOBE_T.parN[1], GLOBE_T.parS[0], [GLOBE.c[0] - PAR.rx, GLOBE.c[1] - PAR.dy], [GLOBE.c[0] - PAR.rx, GLOBE.c[1] + PAR.dy]),
  ride(GLOBE_T.parS[0], GLOBE_T.parS[1], GLOBE_D.parS, ease.inOutSine),
  mv(GLOBE_T.parS[1], 13.2, [GLOBE.c[0] - PAR.rx, GLOBE.c[1] + PAR.dy], GLOBE_BOTTOM),
  // 13.4–14.92: becomes the satellite
  mv(13.45, T.SIM, GLOBE_BOTTOM, orbitPt(90), ease.inOutCubic),
  fn(T.SIM, T.title0, (t) => orbitPt(orbitPsi(t))),
  // 14.92–15.84: flies to the title and drops in as the ; dot
  mv(T.title0, 15.45, ORBIT_OUT, DOT_HOVER, ease.inOutCubic, 90),
  mv(15.7, T.drop, DOT_HOVER, SEMI_DOT, ease.inCubic),
  // 17.69: lifts out of the title and parks at the future editor centre
  mv(T.detach, 18.25, SEMI_DOT, PARK, ease.inOutCubic, 60),
  // 20.46: the editor opens around it; it docks in the title bar
  mv(20.95, 21.35, PARK, EDITOR_DOT, ease.inOutCubic),
  mv(23.75, T.test, EDITOR_DOT, TERM_C, ease.inOutCubic),
  mv(24.62, 25.0, TERM_C, TERM_DOT, ease.inOutCubic),
  mv(28.0, EDIT_CLOSE + CLOSE_DOT, TERM_DOT, PARK, ease.inOutCubic),
  mv(EDIT_CLOSE + CLOSE_DOT + 0.1, TERM_CLOSE + CLOSE_DOT, PARK, TERM_C, ease.inOutCubic),
  mv(TERM_CLOSE + CLOSE_DOT + 0.1, T.notebook + 0.2, TERM_C, NB_C, ease.inOutCubic),
  // verse: the notebook's pen
  mv(29.69, 29.95, NB_C, NBp(HEART_B), ease.inOutCubic),
  mv(31.0, FC_T.head[0], NBp(HEART_B), NBp(fcHeadTop), ease.inOutCubic),
  fn(FC_T.head[0], FC_T.head[1], (t) => {
    return NBp(ptAt(F_CHAR_D.head, prog(t, FC_T.head[0], FC_T.head[1], ease.inOutSine)));
  }),
  mv(FC_T.head[1], FC_T.tri[0], NBp(fcHeadTop), NBp(F_CHAR.tri[0])),
  fn(FC_T.tri[0], FC_T.tri[1], (t) => {
    return NBp(ptAt(F_CHAR_D.tri, prog(t, FC_T.tri[0], FC_T.tri[1], ease.inOutSine)));
  }),
  mv(FC_T.tri[1], FC_T.book[0], NBp(F_CHAR.tri[0]), NBp(fcBook[0])),
  fn(FC_T.book[0], FC_T.book[1], (t) => {
    return NBp(ptAt(F_CHAR_D.book, prog(t, FC_T.book[0], FC_T.book[1], ease.inOutSine)));
  }),
  mv(FC_T.book[1], 32.4, NBp(fcBook[0]), NBp(HEART_B)),
  // cell 2: circle, radius, roll
  mv(33.41, CIRC.plot[0], NBp(HEART_B), NBp(circTop)),
  fn(CIRC.plot[0], CIRC.plot[1], (t) => {
    return NBp(ptAt(CIRC_D, prog(t, CIRC.plot[0], CIRC.plot[1], ease.inOutSine)));
  }),
  mv(34.45, ROLL.roll[0], NBp(circTop), NBp([ROLL.x0, ROLL.base])),
  fn(ROLL.roll[0], ROLL.roll[1], (t) => NBp(rollContact(t))),
  // cell 3: wave, slider
  fn(WAVE.morph[0], WAVE.morph[1] + 0.05, (t) => NBp([WAVE.x0 + ROLL_L, waveY(WAVE.x0 + ROLL_L, morphYb(t), morphA(t))])),
  mv(37.9, WAVE.slide[0], NBp([WAVE.x0 + ROLL_L, WAVE.yb]), NBp(wavePt(WAVE.u0)), ease.inOutCubic, 40),
  fn(WAVE.slide[0], WAVE.slide[1], (t) => NBp(wavePt(slideU(t)))),
  // cell 4: back along the flattening wave, Zeno run to the edge, the limit curve
  fn(WAVE.slide[1], ZENO.t0, (t) => {
    const u = lerp(WAVE.u1, 0, prog(t, WAVE.slide[1], ZENO.t0, ease.inOutCubic));
    return NBp(wavePt(u, WAVE.yb, morphA(t)));
  }),
  fn(ZENO.t0, 42.3, (t) => NBp([zenoX(t), ZENO.y])),
  mv(42.3, LIMC.t0, NBp([zenoX(42.3), ZENO.y]), NBp([LIMC.x0, limY(LIMC.x0)]), ease.inOutCubic, 30),
  fn(LIMC.t0, T.LIM, (t) => NBp([limX(t), limY(limX(t))])),
];
// fill holds between segments
const sorted = [...SEGS].sort((a, b) => a.t0 - b.t0);

export const dotPos = (t: number): P2 => {
  if (t <= sorted[0].t0) return sorted[0].at(sorted[0].t0);
  let last = sorted[0];
  for (const s of sorted) {
    if (t < s.t0) break;
    last = s;
    if (t <= s.t1) return s.at(t);
  }
  return last.at(last.t1);
};

// dot radius: 7 normally, the ; dot size in the title, smaller when docked in a title bar
export const dotR = (t: number) => {
  if (t >= 15.7 && t < 18.25) return lerp(7, 10, prog(t, 15.7, T.drop)) - 3 * prog(t, T.detach, 18.25);
  if (t >= 20.95 && t < 29.3) {
    const dock = prog(t, 20.95, 21.35) * (1 - prog(t, 23.75, T.test)) + prog(t, 24.62, 25.0) * (1 - prog(t, 28.0, 28.3));
    return lerp(7, 3.5, dock);
  }
  return 7;
};
// segments are contiguous by construction; verify in dev (pure, cheap)
export const dotGaps = () => {
  const out: string[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1].at(sorted[i - 1].t1), b = sorted[i].at(sorted[i].t0);
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d > 1.5) out.push(`${sorted[i - 1].t1.toFixed(3)}→${sorted[i].t0.toFixed(3)}: ${d.toFixed(1)} px`);
  }
  return out;
};
export const pathLength = pathLen;
// point on a path at fraction p, as a tuple
export const ptAt = (d: string, p: number): P2 => {
  const q = pointAt(d, p);
  return q ? [q.x, q.y] : [0, 0];
};
