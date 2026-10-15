// Shots 1–7 (0.00–16.00 s, f0–f479): power line, PROTECTION hexagons, six
// primitives, their glide into figure F, the parameters, the globe and the
// simulation. Spec: docs/design_v3.md §4. Pure function of t; hard cut at f480.
import React from 'react';
import {beat, beatIndex, CODE, clamp01, ease, FPS, K, lerp, O, prog, useT} from '../core';
import {circlePath, ellipsePath, linePath, PenHead, Plot, polyPath, roundRectPath, Spark, Svg} from '../geo';
import {FIG} from '../figure';
import meta from '../char_meta.json';

// ------------------------------------------------------------------ helpers
type P2 = [number, number];
const F = (f: number) => f / FPS; // frame → seconds
const n2 = (v: number) => Math.round(v * 100) / 100;
const AR = meta.a.w / meta.a.h; // art box width / height
const C0: P2 = [960, 390];

const quadPath = (q: P2[]) => `M ${n2(q[0][0])} ${n2(q[0][1])} Q ${n2(q[1][0])} ${n2(q[1][1])} ${n2(q[2][0])} ${n2(q[2][1])}`;
const quadAt = (q: P2[], u: number): P2 => [
  (1 - u) * (1 - u) * q[0][0] + 2 * u * (1 - u) * q[1][0] + u * u * q[2][0],
  (1 - u) * (1 - u) * q[0][1] + 2 * u * (1 - u) * q[1][1] + u * u * q[2][1],
];
const lp = (a: P2, b: P2, p: number): P2 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
const rot = (p: P2, c: P2, deg: number): P2 => {
  const a = (deg * Math.PI) / 180, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
// Count of characters typed in [a, a + frames].
const typed = (s: string, t: number, a: number, frames: number) => Math.ceil(s.length * prog(t, a, a + F(frames)));
// 15° step per beat since `from`, each step eased over 6 frames.
const step15 = (t: number, from: number) => {
  const n0 = beatIndex(from + 0.001), n = beatIndex(t);
  if (n <= n0) return 0;
  return 15 * (n - n0 - 1) + 15 * prog(t, beat(n), beat(n) + F(6), ease.outCubic);
};

// ------------------------------------------------------------------ figure F
type Box = {x: number; y: number; h: number};
const bw = (b: Box) => b.h * AR;
const mp = (b: Box, nx: number, ny: number): P2 => [b.x + nx * bw(b), b.y + ny * b.h];
const FCX = 0.5375; // horizontal centre of F's extent (dress 0.09–0.985)
const FEET = 0.954; // hem
const B4: Box = {x: 960 - FCX * 480 * AR, y: 150, h: 480}; // shot 4: height 480, top 150, centred 960
const B5: Box = {x: 760 - FCX * 480 * AR, y: 150, h: 480}; // shot 5: centre x 760
const H6 = 480 * 0.19;
const B6: Box = {x: 960 - FCX * H6 * AR, y: 210 - FEET * H6, h: H6}; // shot 6: feet at (960, 210)
const lerpBox = (a: Box, b: Box, p: number): Box => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), h: lerp(a.h, b.h, p)});

type Geo = {
  head: {c: P2; r: number};
  hairL: P2[];
  hairR: P2[];
  sh: P2[];
  dress: P2[]; // apex, right, left (clockwise from apex)
  book: {c: P2; w: number; h: number; rot: number; rad: number};
};

// F on a box; ext 0..1 extends both hair ends by 12 % of the figure height.
const figGeo = (b: Box, ext = 0): Geo => {
  const s = b.h / 480;
  const hl = FIG.hairL, hr = FIG.hairR, d = FIG.dress, bk = FIG.book;
  return {
    head: {c: mp(b, FIG.head.cx, FIG.head.cy), r: FIG.head.r * bw(b)},
    hairL: [mp(b, hl.from[0], hl.from[1]), mp(b, hl.ctrl[0], hl.ctrl[1]), mp(b, hl.to[0], hl.to[1] + 0.12 * ext)],
    hairR: [mp(b, hr.from[0], hr.from[1]), mp(b, hr.ctrl[0], hr.ctrl[1]), mp(b, hr.to[0], hr.to[1] + 0.12 * ext)],
    sh: [mp(b, FIG.shoulders.from[0], FIG.shoulders.from[1]), mp(b, FIG.shoulders.to[0], FIG.shoulders.to[1])],
    dress: [mp(b, d.apex[0], d.apex[1]), mp(b, d.right[0], d.right[1]), mp(b, d.left[0], d.left[1])],
    book: {c: mp(b, bk.cx, bk.cy), w: bk.w * bw(b), h: bk.h * b.h, rot: bk.rot, rad: 4 * s},
  };
};

// The six loose pieces of shot 3 (F's own shapes, re-sized per the piece table).
const quadBox = (q: P2[]) => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i <= 64; i++) {
    const [x, y] = quadAt(q, i / 64);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return {cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, h: y1 - y0};
};
const fitQuad = (q: P2[], to: P2, height: number): P2[] => {
  const bb = quadBox(q), s = height / bb.h;
  return q.map(([x, y]) => [to[0] + (x - bb.cx) * s, to[1] + (y - bb.cy) * s] as P2);
};
const G4 = figGeo(B4);
const PIECES: Geo = {
  head: {c: [700, 280], r: 40},
  hairL: fitQuad(G4.hairL, [960, 280], 140),
  hairR: fitQuad(G4.hairR, [1220, 280], 140),
  sh: [[620, 500], [780, 500]],
  dress: [[960, 420], [1030, 580], [890, 580]],
  book: {c: [1220, 500], w: 56, h: 68, rot: 0, rad: 4},
};
const PIECE_C: P2[] = [[700, 280], [960, 280], [1220, 280], [700, 500], [960, 500], [1220, 500]];
const PIECE_LABEL = ['circle', 'arc', 'arc', 'line', 'triangle', 'rect'];
const PIECE_LABEL_Y = [382, 382, 382, 612, 612, 612]; // row-aligned, below the tallest piece of each row

// Per-part interpolation between the loose pieces and F (p[i] per part).
const glideGeo = (a: Geo, b: Geo, p: number[]): Geo => ({
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

type Part = {d: string; rot?: {a: number; c: P2}};
const figParts = (g: Geo): Part[] => [
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

const PartPlot: React.FC<{part: Part; p?: number; color?: string; w?: number; opacity?: number; pen?: boolean; t: number}> = ({part, ...rest}) => {
  const el = <Plot d={part.d} {...rest} />;
  return part.rot && part.rot.a ? <g transform={`rotate(${n2(part.rot.a)} ${n2(part.rot.c[0])} ${n2(part.rot.c[1])})`}>{el}</g> : el;
};

// ------------------------------------------------------------------ timing
const T = {
  line0: beat(0), // 0.151
  line1: 0.75,
  cur0: 1.074,
  cur1: 1.536,
  ret0: 1.55,
  ret1: 1.74,
  hex0: beat(4), // 1.997
  kw1: F(88),
  hexRot: beat(7), // 3.38
  unplot: beat(8), // 3.843
  glide: beat(12), // 5.689
  kw2: F(191),
  move5: 7.45,
  move5b: 7.8,
  ring0: beat(20), // 9.381
  kw3: F(303),
  shrink0: 11.1,
  shrink1: 11.45,
  rot0: 12.906,
  kw4: F(417),
  bar: (60 / 130) * 4, // 1.846
  cut: F(480),
};
const PIECE_T = [0, 1, 2, 3, 4, 5].map((i) => beat(8 + i / 2)); // 3.843 … 4.997
const GLIDE_DUR = 0.5;
const GLIDE_STAGGER = F(1);

// ------------------------------------------------------------------ shot 5 parameters
const PARAM_T = [16, 17, 18, 19, 20, 21].map((i) => beat(i));
const PARAMS = [
  ['hair.color', '#D97757'],
  ['hair.length', 'long'],
  ['ornament', 'flower'],
  ['ribbon', 'black'],
  ['skirt.motif', 'sun'],
  ['book', 'closed'],
];
const LABEL_X = 1080;
const LABEL_Y = [170, 240, 310, 380, 450, 520];
const LABEL_TYPE = 3; // frames: each label is complete within 0.1 s of its beat
const CHANGE = (i: number) => PARAM_T[i] + F(3); // F visibly changes 3 frames after the beat
const CHANGE_DUR = F(6);

// ------------------------------------------------------------------ globe and orbit
const MERID = [0, 30, 60, 90, 120, 150];
const spinDeg = (t: number) => {
  if (t < T.rot0) return 0;
  const d1 = 40 * (T.kw4 - T.rot0);
  if (t < T.kw4) return 40 * (t - T.rot0);
  const rampT = F(4);
  const dt = Math.min(t, T.kw4 + rampT) - T.kw4;
  const d2 = d1 + 40 * dt + (100 / (2 * rampT)) * dt * dt;
  return t < T.kw4 + rampT ? d2 : d2 + 140 * (t - T.kw4 - rampT);
};

const ORB = {c: [960, 430] as P2, rx: 400, ry: 92, rot: (-12 * Math.PI) / 180, R: 220};
const orbAt = (phi: number): P2 => {
  const x = ORB.rx * Math.cos(phi), y = ORB.ry * Math.sin(phi);
  return [ORB.c[0] + x * Math.cos(ORB.rot) - y * Math.sin(ORB.rot), ORB.c[1] + x * Math.sin(ORB.rot) + y * Math.cos(ORB.rot)];
};
// Behind the globe: far half of the orbit and inside the globe disk.
const orbHidden = (phi: number) => {
  const [x, y] = orbAt(phi);
  return Math.sin(phi) < 0 && Math.hypot(x - ORB.c[0], y - ORB.c[1]) < ORB.R;
};
// Polylines of the arc [a, b] (radians), split into visible / hidden runs.
const orbRuns = (a: number, b: number, samples: number) => {
  const runs: {hidden: boolean; pts: P2[]}[] = [];
  for (let i = 0; i <= samples; i++) {
    const phi = a + ((b - a) * i) / samples;
    const hid = orbHidden(phi);
    const pt = orbAt(phi);
    const last = runs[runs.length - 1];
    if (!last || last.hidden !== hid) {
      if (last) last.pts.push(pt);
      runs.push({hidden: hid, pts: [pt]});
    } else last.pts.push(pt);
  }
  return runs.filter((r) => r.pts.length > 1);
};
const ORBIT_RUNS = orbRuns(0, Math.PI * 2, 360).map((r) => ({hidden: r.hidden, d: polyPath(r.pts)}));

// ------------------------------------------------------------------ component
export const Intro: React.FC = () => {
  const {t} = useT();
  if (t >= T.cut) return null;
  const el: React.ReactNode[] = [];
  const add = (node: React.ReactNode) => el.push(<React.Fragment key={el.length}>{node}</React.Fragment>);

  // ---------------- shot 1: seed dot, power line, current
  const seedS = 1 - prog(t, T.unplot, T.unplot + F(6), ease.inCubic);
  if (t < T.ret1 + 0.001) {
    const ext = t < T.ret0 ? 840 * prog(t, T.line0, T.line1, ease.inOutCubic) : 840 * (1 - prog(t, T.ret0, T.ret1, ease.inCubic));
    if (ext > 0.5) {
      add(<Plot d={linePath(C0[0] - ext, C0[1], C0[0] + ext, C0[1])} color={K.cream} opacity={O.hi} w={1.5} pen={false} />);
      if (t >= T.cur0 && t <= T.cur1) {
        const head = lerp(120, 1800 + 160, prog(t, T.cur0, T.cur1));
        const x0 = Math.max(120, head - 160), x1 = Math.min(1800, head);
        if (x1 > x0) add(<line x1={x0} y1={C0[1]} x2={x1} y2={C0[1]} stroke={K.orange} strokeWidth={3} />);
      }
      add(<PenHead x={C0[0] - ext} y={C0[1]} t={t} />);
      add(<PenHead x={C0[0] + ext} y={C0[1]} t={t} />);
    }
  }

  // ---------------- shot 2: PROTECTION hexagons
  if (t >= T.hex0 && t < T.unplot + F(8)) {
    const un = 1 - prog(t, T.unplot, T.unplot + F(8), ease.inOutCubic);
    const pA = Math.min(clamp01((t - T.hex0) / (T.kw1 - T.hex0)), un);
    add(<Plot d={hexPath(120, 0)} p={pA} color={K.cream} opacity={O.hi} w={1.5} t={t} pen={t < T.kw1} />);
    if (t >= T.kw1) {
      const r = 30 * prog(t, T.hexRot, T.hexRot + F(8), ease.inOutCubic);
      add(<Plot d={hexPath(160, r)} p={un} color={K.orange} w={2} pen={false} />);
      add(<Plot d={hexPath(200, r)} p={un} color={K.cream} opacity={O.mid} w={1} pen={false} />);
    }
  }
  if (seedS > 0) add(<PenHead x={C0[0]} y={C0[1]} t={t} scale={seedS} />);

  // ---------------- shots 3–7: figure F
  if (t >= PIECE_T[0]) {
    // where F stands
    const box =
      t < T.move5
        ? B4
        : t < T.shrink0
          ? lerpBox(B4, B5, prog(t, T.move5, T.move5b, ease.inOutCubic))
          : lerpBox(B5, B6, prog(t, T.shrink0, T.shrink1, ease.inOutCubic));
    const s = box.h / 480;
    const ext = prog(t, CHANGE(1), CHANGE(1) + CHANGE_DUR, ease.inOutCubic);
    const fig = figGeo(box, ext);
    const gp = [0, 1, 2, 3, 4, 5].map((i) => prog(t, T.glide + i * GLIDE_STAGGER, T.glide + i * GLIDE_STAGGER + GLIDE_DUR, ease.inOutCubic));
    const geo = t < T.glide ? PIECES : t < T.glide + 5 * GLIDE_STAGGER + GLIDE_DUR ? glideGeo(PIECES, fig, gp) : fig;
    const parts = figParts(geo);
    const plotP = PIECE_T.map((a) => prog(t, a, a + F(6), ease.inOutCubic));
    const hairOrange = t >= CHANGE(0) + CHANGE_DUR;
    const decorO = 1 - prog(t, T.shrink0, T.shrink0 + F(6));

    // shot 6–7 globe (drawn under F)
    if (t >= T.ring0) add(<Globe t={t} />);

    // base strokes
    parts.forEach((part, i) => {
      const isHair = i === 1 || i === 2;
      const orange = isHair && hairOrange;
      add(<PartPlot part={part} p={plotP[i]} color={orange ? K.orange : K.cream} w={orange ? 2 : 1.5} t={t} />);
    });

    // shot 3: crosshairs and labels
    const markO = 1 - prog(t, T.glide, T.glide + F(6));
    if (markO > 0) {
      PIECE_C.forEach(([cx, cy], i) => {
        const a = PIECE_T[i];
        if (t < a) return;
        const cp = prog(t, a, a + F(3));
        add(
          <g opacity={O.mid * markO}>
            <Plot d={linePath(cx - 6, cy, cx + 6, cy)} p={cp} w={1} pen={false} cap="butt" />
            <Plot d={linePath(cx, cy - 6, cx, cy + 6)} p={cp} w={1} pen={false} cap="butt" />
          </g>,
        );
        const lab = PIECE_LABEL[i];
        const nc = Math.min(lab.length, Math.max(0, Math.ceil((t - a - F(6)) * FPS * 2)));
        if (nc > 0)
          add(
            <text x={cx} y={PIECE_LABEL_Y[i]} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={markO}>
              {lab.slice(0, nc)}
            </text>,
          );
      });
    }

    // shot 4: OBJECT CREATION flash, bounding box
    if (t >= T.kw2) {
      const fl = t < F(194) ? 1 : clamp01(1 - (t - F(193)) / F(6));
      if (fl > 0) parts.forEach((part) => add(<PartPlot part={part} color={K.orange} w={lerp(1.5, 2, fl)} opacity={fl} pen={false} t={t} />));
      const unB = 1 - prog(t, T.move5, T.move5 + F(8), ease.inOutCubic);
      if (unB > 0) {
        const bb = bboxOf(box);
        add(<Plot d={polyPath([[bb.x0, bb.y0], [bb.x1, bb.y0], [bb.x1, bb.y1], [bb.x0, bb.y1]], true)} p={unB} w={1} opacity={O.mid} dash="6 6" cap="butt" pen={false} />);
        const lift = prog(t, T.move5, T.move5 + F(5));
        const lab = 'object #0001';
        if (lift < 1)
          add(
            <text x={bb.x0} y={bb.y0 - 10 - 14 * lift} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={1 - lift}>
              {lab.slice(0, typed(lab, t, T.kw2, 3))}
            </text>,
          );
      }
    }

    // shot 5: parameter changes on F
    if (t >= CHANGE(0)) {
      // 1 hair re-stroked orange
      if (!hairOrange) {
        const hp = prog(t, CHANGE(0), CHANGE(0) + CHANGE_DUR, ease.inOutCubic);
        add(<PartPlot part={parts[1]} p={hp} color={K.orange} w={2} t={t} />);
        add(<PartPlot part={parts[2]} p={hp} color={K.orange} w={2} t={t} />);
      }
    }
    if (t >= CHANGE(2)) {
      // 3 flower: spark outline, steps 15° per beat (abstract flower lives 8.46–12.9)
      const fo = 1 - prog(t, T.rot0, T.rot0 + F(6));
      const [fx, fy] = mp(box, 0.61, 0.045);
      const g = prog(t, CHANGE(2), CHANGE(2) + CHANGE_DUR, ease.outExpo);
      if (fo > 0) add(<Spark x={fx} y={fy} R={12 * s} rot={step15(t, CHANGE(2))} grow={g} hub={g} outline w={1.5} opacity={fo} />);
    }
    if (t >= CHANGE(3) && decorO > 0) {
      // 4 ribbon: bow of two small triangles, ink fill, 1 px cream outline
      const [rx, ry] = mp(box, 0.578, 0.246);
      const bp = prog(t, CHANGE(3), CHANGE(3) + F(6), ease.inOutCubic);
      const fillO = prog(t, CHANGE(3) + F(6), CHANGE(3) + F(9));
      for (const sg of [-1, 1]) {
        const tri: P2[] = [[rx, ry], [rx + sg * 11 * s, ry - 6 * s], [rx + sg * 11 * s, ry + 6 * s]];
        add(
          <g opacity={decorO}>
            {fillO > 0 && <path d={polyPath(tri, true)} fill={K.ink} opacity={fillO} />}
            <Plot d={polyPath(tri, true)} p={bp} w={1} pen={false} cap="butt" />
          </g>,
        );
      }
    }
    if (t >= CHANGE(4) && decorO > 0) {
      // 5 sun motif: circle r 8 plus 8 rays of 6 px
      const [sx, sy] = mp(box, 0.32, 0.72);
      const cp = prog(t, CHANGE(4), CHANGE(4) + F(6), ease.inOutCubic);
      const rp = prog(t, CHANGE(4) + F(4), CHANGE(4) + F(10), ease.outExpo);
      add(
        <g opacity={decorO}>
          <Plot d={circlePath(sx, sy, 8 * s)} p={cp} w={1} pen={false} />
          {rp > 0 &&
            [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
              const a = (k * Math.PI) / 4 - Math.PI / 2;
              const r0 = 11 * s, r1 = r0 + 6 * s * rp;
              return <line key={k} x1={sx + r0 * Math.cos(a)} y1={sy + r0 * Math.sin(a)} x2={sx + r1 * Math.cos(a)} y2={sy + r1 * Math.sin(a)} stroke={K.cream} strokeWidth={1} />;
            })}
        </g>,
      );
    }
    if (t >= CHANGE(5) && decorO > 0) {
      // 6 book closed: spine line
      const sp = spine(geo);
      add(
        <g opacity={decorO}>
          <Plot d={linePath(sp[0][0], sp[0][1], sp[1][0], sp[1][1])} p={prog(t, CHANGE(5), CHANGE(5) + F(4), ease.inOutCubic)} w={1} pen={false} cap="butt" />
        </g>,
      );
    }

    // shot 5: nodes, leaders, labels
    if (t >= PARAM_T[0] && decorO > 0) {
      const nodes = paramNodes(geo, box);
      const ret = prog(t, T.kw3, T.kw3 + F(8), ease.inOutCubic);
      PARAMS.forEach(([key, val], i) => {
        const a = PARAM_T[i];
        if (t < a) return;
        const [nx, ny] = nodes[i];
        const ly = LABEL_Y[SLOT[i]];
        if (ret < 1) {
          const dy = Math.abs(ly - ny);
          const hx = Math.max(nx + 24, LABEL_X - 12 - dy);
          const d = polyPath([[nx, ny], [hx, ny], [LABEL_X - 12, ly]]);
          const lpP = Math.min(prog(t, a, a + F(5), ease.inOutCubic), 1 - ret);
          add(<Plot d={d} p={lpP} w={1} opacity={O.mid} pen={ret === 0} t={t} cap="butt" />);
          const full = `${key} = ${val}`;
          let nc = typed(full, t, a, LABEL_TYPE);
          if (ret > 0) nc = Math.min(nc, Math.round(full.length * (1 - ret)));
          if (nc > 0) {
            const k1 = Math.min(nc, key.length);
            const k2 = Math.min(Math.max(0, nc - key.length), 3);
            const k3 = Math.max(0, nc - key.length - 3);
            add(
              <text x={LABEL_X} y={ly + 7} fontFamily={CODE} fontSize={22} style={{whiteSpace: 'pre'}} opacity={1 - ret}>
                <tspan fill={K.cream} fillOpacity={O.hi}>{key.slice(0, k1)}</tspan>
                {k2 > 0 && <tspan fill={K.creamDim}>{' = '.slice(0, k2)}</tspan>}
                {k3 > 0 && <tspan fill={K.cream}>{val.slice(0, k3)}</tspan>}
              </text>,
            );
          }
        }
        const ns = prog(t, a, a + F(4), ease.outExpo);
        add(<circle cx={nx} cy={ny} r={3.5 * ns} fill={K.orange} opacity={decorO} />);
      });
    }
  }

  return <Svg>{el}</Svg>;
};

// ------------------------------------------------------------------ pieces of geometry
const hexPath = (R: number, rotDeg: number) => {
  const pts: P2[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ((-90 + rotDeg + 60 * i) * Math.PI) / 180;
    pts.push([C0[0] + R * Math.cos(a), C0[1] + R * Math.sin(a)]);
  }
  return polyPath(pts, true);
};

// Dashed bounding box around F (12 px padding), snapped to half pixels for a crisp 1 px line.
const bboxOf = (b: Box) => {
  const g = figGeo(b);
  const snap = (v: number) => Math.round(v) + 0.5;
  return {
    x0: snap(mp(b, 0.09, 0)[0] - 12),
    x1: snap(mp(b, 0.985, 0)[0] + 12),
    y0: snap(Math.min(g.head.c[1] - g.head.r, g.hairL[0][1], g.hairR[0][1]) - 12),
    y1: snap(mp(b, 0, FEET)[1] + 12),
  };
};

// Book spine: a line 7 px inside the left edge of the (rotated) book rect.
const spine = (g: Geo): P2[] => {
  const {c, w, h, rot: r} = g.book;
  const inset = Math.min(7 * (h / 67.2), w * 0.2);
  return [rot([c[0] - w / 2 + inset, c[1] - h / 2], c, r), rot([c[0] - w / 2 + inset, c[1] + h / 2], c, r)];
};

// Node anchors on F for the six parameters. Every node has its own height
// (hair.length sits halfway down the hair it lengthens, book low on the spine,
// clear of the ribbon), so no two leaders share a horizontal run.
const paramNodes = (g: Geo, b: Box): P2[] => [
  quadAt(g.hairR, 0.15),
  quadAt(g.hairR, 0.55),
  mp(b, 0.61, 0.045),
  mp(b, 0.578, 0.246),
  mp(b, 0.32, 0.72),
  (() => {
    const sp = spine(g);
    return lp(sp[0], sp[1], 0.8);
  })(),
];
// Label slot per parameter: slots are assigned in the nodes' top-to-bottom
// order (on F's shot-5 pose, hair extended), so the leaders never cross.
// Parameters still appear in table order, one per beat.
const SLOT: number[] = (() => {
  const nodes = paramNodes(figGeo(B5, 1), B5);
  const slot = new Array<number>(nodes.length);
  nodes
    .map((_, i) => i)
    .sort((p, q) => nodes[p][1] - nodes[q][1] || p - q)
    .forEach((i, r) => (slot[i] = r));
  return slot;
})();

// ------------------------------------------------------------------ shots 5–7: ring → globe, orbit
const Globe: React.FC<{t: number}> = ({t}) => {
  const out: React.ReactNode[] = [];
  const sp = prog(t, T.shrink0, T.shrink1, ease.inOutCubic);
  const cx = lerp(760, 960, sp), cy = lerp(390, 430, sp), R = lerp(270, 220, sp);
  const k = R / 220;

  // ring (shot 5) and globe outline (shot 6)
  const ringP = clamp01((t - T.ring0) / (T.kw3 - T.ring0));
  const ringD = circlePath(cx, cy, R);
  if (t < T.kw3) out.push(<Plot key="ring" d={ringD} p={ease.inQuad(ringP)} color={K.cream} w={1.5} t={t} />);
  else {
    const toCream = prog(t, T.shrink0, T.shrink0 + F(6));
    if (toCream < 1) out.push(<Plot key="ringO" d={ringD} color={K.orange} w={2} opacity={1 - toCream} pen={false} />);
    if (toCream > 0) out.push(<Plot key="ringC" d={ringD} color={K.cream} w={1.5} opacity={O.hi * toCream} pen={false} />);
  }

  // globe lines on beats (8 frames each, 1 px cream 45 %)
  const lineP = (b: number) => prog(t, beat(b), beat(b) + F(8), ease.inOutCubic);
  const pE = lineP(24), pP = lineP(25), pM = lineP(26);
  if (pE > 0) out.push(<Plot key="eq" d={ellipsePath(cx, cy, R, 40 * k)} p={pE} w={1} opacity={O.mid} t={t} />);
  if (pP > 0)
    [-1, 1].forEach((sg) =>
      out.push(<Plot key={`par${sg}`} d={ellipsePath(cx, cy + sg * 126 * k, 180 * k, 32 * k)} p={pP} w={1} opacity={O.mid} t={t} />),
    );
  if (pM > 0) {
    const spin = spinDeg(t);
    MERID.forEach((l0) => {
      if (l0 === 90 && pM < 1) return; // coincides with the outline until the globe spins
      const lam = ((l0 + spin) * Math.PI) / 180;
      const rx = R * Math.abs(Math.sin(lam));
      const op = Math.cos(lam) < 0 ? O.lo : O.mid;
      const d = rx < 0.5 ? linePath(cx, cy - R, cx, cy + R) : ellipsePath(cx, cy, rx, R);
      out.push(<Plot key={`m${l0}`} d={d} p={pM} w={1} opacity={op} t={t} />);
    });
  }

  // shot 7: orbit and satellite
  if (t >= T.kw4) {
    ORBIT_RUNS.forEach((r, i) => out.push(<path key={`o${i}`} d={r.d} fill="none" stroke={K.cream} strokeWidth={1} opacity={r.hidden ? O.lo : O.mid} />));
    const phi = -(2 * Math.PI * (t - T.kw4)) / T.bar; // front pass runs left to right
    const deg = Math.PI / 180;
    [1, 0.6, 0.3].forEach((op, j) => {
      const a = phi + (2 + 18 * j) * deg;
      orbRuns(a, a + 17 * deg, 12).forEach((r, q) =>
        out.push(
          <path key={`tr${j}-${q}`} d={polyPath(r.pts)} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="butt" opacity={op * (r.hidden ? 0.35 : 1)} />,
        ),
      );
    });
    const [sx, sy] = orbAt(phi);
    out.push(<circle key="sat" cx={sx} cy={sy} r={6} fill={K.orange} opacity={orbHidden(phi) ? 0.35 : 1} />);
  }
  return <>{out}</>;
};
