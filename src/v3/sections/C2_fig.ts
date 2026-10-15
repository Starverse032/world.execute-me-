// Figure F and the six loose pieces (shots 3–4 geometry, copied from
// shots/Intro.tsx so F here is exactly the object built in the intro), plus the
// 1210 point targets sampled along F's six strokes (C19).
import {FIG} from '../figure';
import {pathLen, pointAt, circlePath, linePath, polyPath, roundRectPath} from '../geo';
import {lerp} from '../core';
import meta from '../char_meta.json';

export type P2 = [number, number];
const n2 = (v: number) => Math.round(v * 100) / 100;
const AR = meta.a.w / meta.a.h;

const quadPath = (q: P2[]) => `M ${n2(q[0][0])} ${n2(q[0][1])} Q ${n2(q[1][0])} ${n2(q[1][1])} ${n2(q[2][0])} ${n2(q[2][1])}`;
const quadAt = (q: P2[], u: number): P2 => [
  (1 - u) * (1 - u) * q[0][0] + 2 * u * (1 - u) * q[1][0] + u * u * q[2][0],
  (1 - u) * (1 - u) * q[0][1] + 2 * u * (1 - u) * q[1][1] + u * u * q[2][1],
];
const lp = (a: P2, b: P2, p: number): P2 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
export const rotP = (p: P2, c: P2, deg: number): P2 => {
  const a = (deg * Math.PI) / 180, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};

// ------------------------------------------------------------------ figure F
type Box = {x: number; y: number; h: number};
const bw = (b: Box) => b.h * AR;
const mp = (b: Box, nx: number, ny: number): P2 => [b.x + nx * bw(b), b.y + ny * b.h];
const FCX = 0.5375; // horizontal centre of F's extent (dress 0.09–0.985)
const FEET = 0.954; // hem
// Shot 4's box: height 480, top 150, F centred on x 960.
export const FBOX: Box = {x: 960 - FCX * 480 * AR, y: 150, h: 480};

export type Geo = {
  head: {c: P2; r: number};
  hairL: P2[];
  hairR: P2[];
  sh: P2[];
  dress: P2[]; // apex, right, left (clockwise from apex)
  book: {c: P2; w: number; h: number; rot: number; rad: number};
};

const figGeo = (b: Box): Geo => {
  const s = b.h / 480;
  const hl = FIG.hairL, hr = FIG.hairR, d = FIG.dress, bk = FIG.book;
  return {
    head: {c: mp(b, FIG.head.cx, FIG.head.cy), r: FIG.head.r * bw(b)},
    hairL: [mp(b, hl.from[0], hl.from[1]), mp(b, hl.ctrl[0], hl.ctrl[1]), mp(b, hl.to[0], hl.to[1])],
    hairR: [mp(b, hr.from[0], hr.from[1]), mp(b, hr.ctrl[0], hr.ctrl[1]), mp(b, hr.to[0], hr.to[1])],
    sh: [mp(b, FIG.shoulders.from[0], FIG.shoulders.from[1]), mp(b, FIG.shoulders.to[0], FIG.shoulders.to[1])],
    dress: [mp(b, d.apex[0], d.apex[1]), mp(b, d.right[0], d.right[1]), mp(b, d.left[0], d.left[1])],
    book: {c: mp(b, bk.cx, bk.cy), w: bk.w * bw(b), h: bk.h * b.h, rot: bk.rot, rad: 4 * s},
  };
};
export const FGEO = figGeo(FBOX);

// The six loose pieces of shot 3 (F's own shapes, re-sized per the piece table).
const quadBox = (q: P2[]) => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i <= 64; i++) {
    const [x, y] = quadAt(q, i / 64);
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return {cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, h: y1 - y0};
};
const fitQuad = (q: P2[], to: P2, height: number): P2[] => {
  const bb = quadBox(q), s = height / bb.h;
  return q.map(([x, y]) => [to[0] + (x - bb.cx) * s, to[1] + (y - bb.cy) * s] as P2);
};
export const PIECES: Geo = {
  head: {c: [700, 280], r: 40},
  hairL: fitQuad(FGEO.hairL, [960, 280], 140),
  hairR: fitQuad(FGEO.hairR, [1220, 280], 140),
  sh: [
    [620, 500],
    [780, 500],
  ],
  dress: [
    [960, 420],
    [1030, 580],
    [890, 580],
  ],
  book: {c: [1220, 500], w: 56, h: 68, rot: 0, rad: 4},
};
export const PIECE_C: P2[] = [
  [700, 280],
  [960, 280],
  [1220, 280],
  [700, 500],
  [960, 500],
  [1220, 500],
];
export const PIECE_LABEL = ['circle', 'arc', 'arc', 'line', 'triangle', 'rect'];
export const PIECE_LABEL_Y = [382, 382, 382, 612, 612, 612];

// Per-part interpolation between two geometries (p[i] per part).
export const glideGeo = (a: Geo, b: Geo, p: number[]): Geo => ({
  head: {c: lp(a.head.c, b.head.c, p[0]), r: lerp(a.head.r, b.head.r, p[0])},
  hairL: a.hairL.map((v, i) => lp(v, b.hairL[i], p[1])),
  hairR: a.hairR.map((v, i) => lp(v, b.hairR[i], p[2])),
  sh: a.sh.map((v, i) => lp(v, b.sh[i], p[3])),
  dress: a.dress.map((v, i) => lp(v, b.dress[i], p[4])),
  book: {
    c: lp(a.book.c, b.book.c, p[5]),
    w: lerp(a.book.w, b.book.w, p[5]),
    h: lerp(a.book.h, b.book.h, p[5]),
    rot: lerp(a.book.rot, b.book.rot, p[5]),
    rad: lerp(a.book.rad, b.book.rad, p[5]),
  },
});

export type Part = {d: string; rot?: {a: number; c: P2}};
export const figParts = (g: Geo): Part[] => [
  {d: circlePath(g.head.c[0], g.head.c[1], g.head.r)},
  {d: quadPath(g.hairL)},
  {d: quadPath(g.hairR)},
  {d: linePath(g.sh[0][0], g.sh[0][1], g.sh[1][0], g.sh[1][1])},
  {d: polyPath(g.dress, true)},
  {
    d: roundRectPath(g.book.c[0] - g.book.w / 2, g.book.c[1] - g.book.h / 2, g.book.w, g.book.h, g.book.rad),
    rot: {a: g.book.rot, c: g.book.c},
  },
];
export const F_PARTS = figParts(FGEO);

// Dashed bounding box around F (12 px padding), snapped to half pixels.
export const F_BBOX = (() => {
  const g = FGEO;
  const snap = (v: number) => Math.round(v) + 0.5;
  return {
    x0: snap(mp(FBOX, 0.09, 0)[0] - 12),
    x1: snap(mp(FBOX, 0.985, 0)[0] + 12),
    y0: snap(Math.min(g.head.c[1] - g.head.r, g.hairL[0][1], g.hairR[0][1]) - 12),
    y1: snap(mp(FBOX, 0, FEET)[1] + 12),
  };
})();

// ------------------------------------------------------------------ F samples (C19)
// 1210 samples along F's six strokes in proportion to their lengths; each has
// its stroke index and its fraction along the stroke (for the pen-pass fade).
export const FS_N = 1210;
export const FS = (() => {
  const L = F_PARTS.map((p) => pathLen(p.d));
  const tot = L.reduce((a, b) => a + b, 0);
  const cnt = L.map((l) => Math.round((FS_N * l) / tot));
  cnt[cnt.length - 1] += FS_N - cnt.reduce((a, b) => a + b, 0);
  const x = new Float32Array(FS_N), y = new Float32Array(FS_N), part = new Uint8Array(FS_N), u = new Float32Array(FS_N);
  let j = 0;
  F_PARTS.forEach((p, s) => {
    for (let q = 0; q < cnt[s]; q++) {
      const uu = (q + 0.5) / cnt[s];
      const pt = pointAt(p.d, uu);
      let xy: P2 = pt ? [pt.x, pt.y] : [0, 0];
      if (p.rot) xy = rotP(xy, p.rot.c, p.rot.a);
      x[j] = xy[0];
      y[j] = xy[1];
      part[j] = s;
      u[j] = uu;
      j++;
    }
  });
  return {x, y, part, u};
})();
