// Section A, verse 2 stage geometry: shot 29 (eggplant from two ellipses,
// NUTRIENTS), shot 30 (morph into a tomato, free radicals, ANTIOXIDANTS),
// shot 31 (tabby cat, purr wave, ENJOYMENT) and shot 32's exit into the pen
// dot at C (moment 4 itself is in A_char.tsx).
// Spec: docs/design_A.md A.1 shots 29–32.
import React from 'react';
import {beat, BEAT, clamp01, ease, FPS, K, lerp, O, prog, pulse, rng} from '../core';
import {circlePath, fnPath, linePath, PenHead, Plot, polyPath} from '../geo';
import {antsOffset, DEG, F, kv, Ln, lp2, math, mono, P2, Path, r2, rectPath, Txt} from './A_lib';

const b = beat;
const f6 = 6 / FPS;
const ARRIVE = 73.845 + 0.385; // shot 28: "me" has become the pen at C

// ------------------------------------------------------------------ ellipses
type Ell = {cx: number; cy: number; rx: number; ry: number; rot: number};
const ellPt = (e: Ell, th: number): P2 => {
  const c = Math.cos(e.rot * DEG), s = Math.sin(e.rot * DEG);
  const x = e.rx * Math.cos(th), y = e.ry * Math.sin(th);
  return [e.cx + x * c - y * s, e.cy + x * s + y * c];
};
const inside = (e: Ell, [x, y]: P2) => {
  const c = Math.cos(e.rot * DEG), s = Math.sin(e.rot * DEG);
  const dx = x - e.cx, dy = y - e.cy;
  const u = dx * c + dy * s, v = -dx * s + dy * c;
  return (u / e.rx) ** 2 + (v / e.ry) ** 2 < 1;
};
const lerpEll = (a: Ell, c: Ell, m: number): Ell => ({cx: lerp(a.cx, c.cx, m), cy: lerp(a.cy, c.cy, m), rx: lerp(a.rx, c.rx, m), ry: lerp(a.ry, c.ry, m), rot: lerp(a.rot, c.rot, m)});
const N_ELL = 160;
// Runs of ellipse e (from its local 3 o'clock, clockwise) up to progress p,
// split by whether they lie inside `other`.
const ellRuns = (e: Ell, other: Ell | null, p: number) => {
  const end = p * N_ELL;
  const runs: {inside: boolean; pts: P2[]}[] = [];
  for (let i = 0; i < Math.ceil(end); i++) {
    const a = ellPt(e, (i / N_ELL) * 2 * Math.PI);
    const bb = ellPt(e, (Math.min(i + 1, end) / N_ELL) * 2 * Math.PI);
    const ins = other ? inside(other, lp2(a, bb, 0.5)) : false;
    const last = runs[runs.length - 1];
    if (!last || last.inside !== ins) runs.push({inside: ins, pts: [a, bb]});
    else last.pts.push(bb);
  }
  return runs;
};
const E1_0: Ell = {cx: 818.8, cy: 451.7, rx: 100, ry: 125, rot: -20};
const E2_0: Ell = {cx: 774.4, cy: 329.5, rx: 62, ry: 85, rot: -20};
const TOM: Ell = {cx: 1120, cy: 410, rx: 130, ry: 130, rot: 0};
const starPts = (cx: number, cy: number, R: number, r: number, rot: number): P2[] =>
  Array.from({length: 10}, (_, i) => {
    const a = (-90 + rot + 36 * i) * DEG;
    const rr = i % 2 ? r : R;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as P2;
  });

// ------------------------------------------------------------------ timing
const B161 = b(161), B162 = b(162), B163 = b(163), B164 = b(164);
const HIT29 = F(2309);
const S30 = 77.576, B168 = b(168), B169 = b(169), B170 = b(170), B172 = b(172);
const HIT30 = F(2419);
const B176 = b(176), B177 = b(177), B178 = b(178), B179 = b(179), B180 = b(180), B183 = b(183);
const EYES31 = 82.074, LAB31 = 82.833, HIT31 = F(2528);
const OUT31 = 84.878, END31 = b(184); // 85.074

const morph = (t: number) => prog(t, B168, B170, ease.inOutSine); // inOutSine keeps the glide under ~600 px/s
const glide31 = (t: number) => prog(t, B176, B177, ease.inOutSine);
const e1At = (t: number) => lerpEll(E1_0, TOM, morph(t));
const e2At = (t: number) => lerpEll(E2_0, TOM, morph(t));
const calyx = (t: number) => {
  const m = morph(t);
  return {cx: lerp(750.4, 1120, m), cy: lerp(263.7, 280, m), R: lerp(46, 52, m), r: lerp(20, 22, m), rot: lerp(-20, 36, m)};
};
const stemTip = (t: number): P2 => lp2([731.6, 212.1], [1120, 250], morph(t));
// head circle: tomato → cat head (b176 → b177) → C, r → 0 (84.878 → 85.074)
const head = (t: number) => {
  const g = glide31(t);
  const q = prog(t, OUT31, END31, ease.inCubic);
  const cx = lerp(1120, 960, g), cy = lerp(lerp(410, 380, g), 390, q), r = lerp(130, 120, g) * (1 - q);
  return {cx, cy, r};
};

// shot-29 leaders
const LEAD29 = [
  {node: [868.4, 412.4] as P2, base: 560, key: 'kcal', val: '25'},
  {node: [898.3, 465.4] as P2, base: 600, key: 'fiber', val: '3.0 g'},
  {node: [887.2, 522.6] as P2, base: 640, key: 'K', val: '229 mg'},
];
// free radicals around the tomato
const RAD = (() => {
  const r = rng(2026);
  return Array.from({length: 12}, (_, j) => ({a0: 30 * j + (r() * 2 - 1) * 10, rad: 200 + 50 * r(), t0: b(172 + (j % 3))}));
})();
const sup = (s: string, size = 20) => math(s, size, K.cream, 12);

// ------------------------------------------------------------------ shots 29–30: eggplant → tomato
const Specimen: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < ARRIVE || t >= B176 + 8 / FPS) return null;
  const out: React.ReactNode[] = [];
  const m = morph(t);
  const E1 = e1At(t), E2 = e2At(t);
  const p1 = prog(t, B161, B161 + 16 / FPS, ease.inOutCubic);
  const p2 = prog(t, B162, B162 + 12 / FPS, ease.inOutCubic);
  // inside arcs fade to 25 % (b163); during the morph they return to 100 % (no flicker as the shapes merge)
  const inO = lerp(1, O.lo, prog(t, B163, B163 + f6)) + (1 - O.lo) * m * (t >= B168 ? 1 : 0);
  const e2O = 1 - prog(t, B170 - f6, B170);
  // flash: f2309 (eggplant) and f2419 (tomato): orange for 3 frames, back to cream over 6
  const fl = (h: number) => {
    const f = frame - h;
    return f < 0 ? 0 : f < 3 ? 1 : 1 - clamp01((f - 3) / 6);
  };
  const flash = Math.max(fl(2309), frame >= 2419 && frame < 2422 ? 1 : 0);
  const draw = (e: Ell, other: Ell | null, p: number, o: number, key: string) => {
    if (p <= 0 || o <= 0) return;
    ellRuns(e, other, p).forEach((r, i) => {
      const d = polyPath(r.pts);
      const ro = o * (r.inside ? inO : 1);
      out.push(<Path key={key + i} d={d} w={1.5} o={ro} />);
      if (flash > 0) out.push(<Path key={key + 'f' + i} d={d} w={2} c={K.orange} o={ro * flash} />);
    });
    if (p < 1) {
      const tip = ellPt(e, p * 2 * Math.PI);
      out.push(<PenHead key={key + 'pen'} x={tip[0]} y={tip[1]} t={t} />);
    }
  };
  draw(E1, t >= B162 ? E2 : null, p1, 1, 'e1');
  draw(E2, E1, p2, e2O, 'e2');

  // calyx (b163, 6 frames) and stem (4 frames); un-plot at b176
  const un = 1 - prog(t, B176, B176 + f6, ease.inOutCubic);
  if (t >= B163) {
    const c = calyx(t);
    const sp = Math.min(prog(t, B163, B163 + f6, ease.inOutCubic), un);
    const fd = polyPath(starPts(c.cx, c.cy, c.R, c.r, c.rot), true);
    out.push(<Plot key="star" d={fd} p={sp} w={1.5} t={t} pen={un >= 1} />);
    if (flash > 0 && sp >= 1) out.push(<Path key="starf" d={fd} c={K.orange} w={2} o={flash} />);
    const tip = stemTip(t);
    const stp = Math.min(prog(t, B163 + f6, B163 + 10 / FPS, ease.inOutCubic), un);
    const sd = linePath(c.cx, c.cy, tip[0], tip[1]);
    out.push(<Plot key="stem" d={sd} p={stp} w={2} t={t} pen={un >= 1} />);
    if (flash > 0 && stp >= 1) out.push(<Path key="stemf" d={sd} c={K.orange} w={2} o={flash} />);
  }

  // specimen boxes with marching ants
  const box = (x0: number, y0: number, x1: number, y1: number, label: string, tIn: number, tOut: number, key: string) => {
    if (t < tIn) return;
    const u = 1 - prog(t, tOut, tOut + f6, ease.inOutCubic);
    const d = rectPath(x0, y0, x1, y1);
    if (u >= 1)
      out.push(<path key={key} d={d} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid} strokeDasharray="6 6" strokeDashoffset={antsOffset(t, tIn)} />);
    else out.push(<Plot key={key} d={d} p={u} w={1} opacity={O.mid} dash="6 6" pen={false} cap="butt" />);
    out.push(<Txt key={key + 'l'} t={t} t0={tIn} tOut={tOut} x={x0} y={y0 - 8} parts={[mono(label, 16)]} dur={3 / FPS} />);
  };
  box(680, 188, 950, 598, 'object #0002', B163, S30, 'box2');
  box(960, 200, 1280, 570, 'object #0003', B170, B176, 'box3');

  // labels
  out.push(
    <Txt
      key="f29"
      t={t}
      t0={B164}
      tOut={S30}
      x={1000}
      y={240}
      opacity={O.hi}
      parts={[math('x', 30), sup('2'), math('/a', 30), sup('2'), math(' + y', 30), sup('2'), math('/b', 30), sup('2'), math(' = 1', 30)]}
    />,
  );
  out.push(<Txt key="ab" t={t} t0={B164} tOut={S30} x={1000} y={278} parts={[mono('a = 100 · b = 125', 20)]} />);
  out.push(<Txt key="f30" t={t} t0={B169} tOut={B176} x={900} y={240} anchor="end" opacity={O.hi} parts={[math('x', 30), sup('2'), math(' + y', 30), sup('2'), math(' = r', 30), sup('2')]} />);
  out.push(<Txt key="r130" t={t} t0={B169} tOut={B176} x={900} y={278} anchor="end" parts={[mono('r = 130', 20)]} />);

  // NUTRIENTS leaders (f2309, 2-frame stagger), retract at 77.576
  if (frame >= 2309) {
    const ret = 1 - prog(t, S30, S30 + f6, ease.inOutCubic);
    LEAD29.forEach((L, i) => {
      const t0 = HIT29 + (2 * i) / FPS;
      if (t < t0) return;
      const d = polyPath([L.node, [960, L.node[1]], [990, L.base - 8]]);
      const lp = Math.min(prog(t, t0, t0 + f6, ease.inOutCubic), ret);
      out.push(<Plot key={'ld' + i} d={d} p={lp} w={1} opacity={O.mid} t={t} pen={ret >= 1} />);
      const no = prog(t, t0, t0 + 2 / FPS) * (1 - prog(t, S30 + f6, S30 + 9 / FPS));
      if (no > 0) out.push(<circle key={'ln' + i} cx={L.node[0]} cy={L.node[1]} r={3.5} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} opacity={no} />);
      out.push(<Txt key={'lt' + i} t={t} t0={t0 + 4 / FPS} tOut={S30} x={1000} y={L.base} parts={kv(L.key, L.val)} />);
    });
  }

  // tomato ribs (b169), 1 px cream 25 %, following the morphing body
  if (t >= B169) {
    const rp = Math.min(prog(t, B169, B169 + 8 / FPS, ease.inOutCubic), un);
    [45, 95].forEach((rx) => {
      const pts: P2[] = [];
      for (let i = 0; i <= 96; i++) pts.push(ellPt({...E1, rx}, -Math.PI / 2 + (i / 96) * 2 * Math.PI));
      out.push(<Plot key={'rib' + rx} d={polyPath(pts)} p={rp} w={1} opacity={O.lo} t={t} pen={un >= 1} />);
    });
  }

  // free radicals: 4 per beat on b172–b174; neutralised by the wave at f2419
  if (t >= B172) {
    const fo = 1 - prog(t, B176, B176 + f6);
    const rw = 130 + 190 * clamp01((t - HIT30) / (12 / FPS));
    RAD.forEach((R, j) => {
      if (t < R.t0 || fo <= 0) return;
      const sIn = prog(t, R.t0, R.t0 + 3 / FPS, ease.outExpo);
      const a = (R.a0 + 10 * (t - B172)) * DEG;
      const x = 1120 + R.rad * Math.cos(a), y = 410 + R.rad * Math.sin(a);
      const paired = frame >= 2419 && rw >= R.rad;
      const pl = 1 + 0.5 * pulse(t);
      if (!paired) {
        out.push(<circle key={'rr' + j} cx={r2(x)} cy={r2(y)} r={8 * sIn} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45 * fo} />);
        out.push(<circle key={'rd' + j} cx={r2(x)} cy={r2(y)} r={r2(3 * sIn * pl)} fill={K.orange} opacity={fo} />);
      } else {
        // paired electron: a second cream dot 6 px beside it (along the drift tangent)
        const tx = -Math.sin(a), ty = Math.cos(a);
        out.push(<circle key={'rd' + j} cx={r2(x)} cy={r2(y)} r={r2(3 * pl)} fill={K.cream} opacity={fo} />);
        out.push(<circle key={'re' + j} cx={r2(x + 6 * tx)} cy={r2(y + 6 * ty)} r={r2(3 * pl)} fill={K.cream} opacity={fo} />);
      }
    });
    // neutralising wave
    const q = (t - HIT30) / (12 / FPS);
    if (frame >= 2419 && q < 1) out.push(<circle key="wave" cx={1120} cy={410} r={r2(rw)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={1 - q} />);
    if (frame >= 2419) {
      out.push(
        <Txt
          key="lyc"
          t={t}
          t0={HIT30}
          tOut={B176}
          x={900}
          y={600}
          anchor="end"
          parts={[mono('C', 22, K.cream), mono('40', 15, K.cream, 1, -5), mono('H', 22, K.cream), mono('56', 15, K.cream, 1, -5)]}
        />,
      );
      out.push(<Txt key="lyc2" t={t} t0={HIT30} tOut={B176} x={900} y={628} anchor="end" parts={[mono('lycopene', 16)]} />);
    }
  }

  // the pen: C → E1's local 3 o'clock (74.230 → b161); later it rests on the stem tip
  if (t < B161) out.push(<PenHead key="pen" x={lerp(960, 912.8, prog(t, ARRIVE, B161, ease.inOutCubic))} y={lerp(390, 417.5, prog(t, ARRIVE, B161, ease.inOutCubic))} t={t} />);
  else if (t >= B163 + 10 / FPS && t < B176) {
    const tip = stemTip(t);
    out.push(<PenHead key="pen" x={tip[0]} y={tip[1]} t={t} />);
  }
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 31: tabby cat
const EARS: P2[][] = [
  [
    [856.1, 320],
    [843.0, 230.3],
    [919.0, 267.2],
  ],
  [
    [1063.9, 320],
    [1077.0, 230.3],
    [1001.0, 267.2],
  ],
];
const EYE_X = [915, 1005];
const almond = (cx: number) => `M ${cx - 22} 380 Q ${cx} 356 ${cx + 22} 380 Q ${cx} 404 ${cx - 22} 380`;
const content = (cx: number) => `M ${cx - 22} 384 Q ${cx} 370 ${cx + 22} 384`;
const NOSE = polyPath(
  [
    [952, 406],
    [968, 406],
    [960, 416],
  ],
  true,
);
const MOUTH = ['M 960 416 Q 958 429 946 426', 'M 960 416 Q 962 429 974 426'];
const WHISK: [P2, P2][] = [
  [
    [905, 410],
    [800, 396],
  ],
  [
    [905, 418],
    [796, 418],
  ],
  [
    [905, 426],
    [800, 440],
  ],
];
const mirror = ([x, y]: P2): P2 => [1920 - x, y];
const TABBY_M = polyPath([
  [926, 330],
  [938, 296],
  [960, 318],
  [982, 296],
  [994, 330],
]);
const STRIPES: [P2, P2][] = [
  [
    [850, 370],
    [876, 374],
  ],
  [
    [852, 388],
    [878, 388],
  ],
];
const purrA = (t: number) => {
  const base = 4 + 8 * pulse(t);
  const jump = t >= HIT31 ? 12 * Math.exp(-(t - HIT31) / 0.4) : 0;
  return Math.min(16, base + jump);
};
const purrY = (x: number, t: number) => 600 - purrA(t) * Math.sin((2 * Math.PI * (x - 760)) / 40 - (2 * Math.PI * (t - B180)) / (BEAT / 2));

const Cat: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B176 || t >= END31 + 1 / FPS) return null;
  const out: React.ReactNode[] = [];
  const un = 1 - prog(t, OUT31, OUT31 + f6, ease.inOutCubic); // all features un-plot
  const P = (key: string, d: string, t0: number, dur: number, w = 1.5, c: string = K.cream, o = 1) => {
    if (t < t0) return;
    const p = Math.min(prog(t, t0, t0 + dur, ease.inOutCubic), un);
    out.push(<Plot key={key} d={d} p={p} color={c} w={w} opacity={o} t={t} pen={un >= 1} />);
  };
  // head circle (from the tomato), flashes orange on the hit
  const h = head(t);
  if (h.r > 0.5) {
    const fl = frame >= 2528 && frame < 2531;
    out.push(<Path key="head" d={circlePath(h.cx, h.cy, h.r)} w={fl ? 2 : 1.5} c={fl ? K.orange : K.cream} />);
  }
  // ears
  EARS.forEach((e, i) => P('ear' + i, polyPath(e), B177, f6));
  // eyes and pupils; closed content arcs from the hit
  EYE_X.forEach((cx, i) => {
    if (frame < 2528) {
      P('eye' + i, almond(cx), EYES31, f6);
      const ps = Math.min(prog(t, EYES31 + 2 / FPS, EYES31 + 6 / FPS, ease.outExpo), un);
      if (ps > 0) out.push(<Ln key={'pu' + i} x1={cx} y1={380 - 9 * ps} x2={cx} y2={380 + 9 * ps} w={2} c={K.orange} />);
    } else P('eyc' + i, content(cx), HIT31 - 1, 1e-3);
  });
  // nose, mouth, whiskers (b178)
  P('nose', NOSE, B178, 4 / FPS);
  MOUTH.forEach((d, i) => P('mo' + i, d, B178 + 2 / FPS, 4 / FPS));
  WHISK.forEach(([a, c], i) => {
    P('wl' + i, linePath(a[0], a[1], c[0], c[1]), B178 + i / FPS, 4 / FPS, 1, K.cream, O.hi);
    const ma = mirror(a), mc = mirror(c);
    P('wr' + i, linePath(ma[0], ma[1], mc[0], mc[1]), B178 + i / FPS, 4 / FPS, 1, K.cream, O.hi);
  });
  // tabby M and cheek stripes (b179)
  P('M', TABBY_M, B179, 5 / FPS, 1.5, K.orange);
  STRIPES.forEach(([a, c], i) => {
    P('sl' + i, linePath(a[0], a[1], c[0], c[1]), B179, 4 / FPS, 1, K.cream, O.hi);
    const ma = mirror(a), mc = mirror(c);
    P('sr' + i, linePath(ma[0], ma[1], mc[0], mc[1]), B179, 4 / FPS, 1, K.cream, O.hi);
  });
  // box
  if (t >= B179) {
    const d = rectPath(770, 200, 1150, 530);
    if (un >= 1)
      out.push(<path key="box4" d={d} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid} strokeDasharray="6 6" strokeDashoffset={antsOffset(t, B179)} />);
    else out.push(<Plot key="box4" d={d} p={un} w={1} opacity={O.mid} dash="6 6" pen={false} cap="butt" />);
    out.push(<Txt key="box4l" t={t} t0={B179} tOut={OUT31} x={770} y={190} parts={[mono('object #0004', 16)]} dur={3 / FPS} />);
  }
  // purr labels
  out.push(<Txt key="purr" t={t} t0={LAB31} tOut={OUT31} x={1200} y={240} opacity={O.hi} parts={[math('purr(t) = A sin(2πft)', 30)]} />);
  out.push(<Txt key="f25" t={t} t0={LAB31} tOut={OUT31} x={1200} y={278} parts={[mono('f = 25 Hz', 20)]} />);
  // purr wave (b180)
  if (t >= B180) {
    const pp = Math.min(prog(t, B180, B180 + 8 / FPS, ease.inOutCubic), un);
    const xe = 760 + 400 * pp;
    if (xe > 760.5) out.push(<Path key="purrw" d={fnPath((x) => purrY(x, t), 760, xe, Math.max(2, Math.round((xe - 760) / 2)))} w={1} o={O.hi} />);
    if (pp > 0 && pp < 1 && un >= 1) out.push(<PenHead key="purrpen" x={xe} y={purrY(xe, t)} t={t} />);
    else if (pp >= 1) out.push(<PenHead key="purrpen" x={1160} y={purrY(1160, t)} t={t} />);
  }
  // sound arcs on the hit and on b183
  [HIT31, B183].forEach((t0, k) => {
    if (t < t0) return;
    const q = (t - t0) / (10 / FPS);
    if (q >= 1) return;
    [180, 200, 220].forEach((r) =>
      [0, 180].forEach((a) => {
        const rr = r + 20 * ease.outCubic(q);
        const a0 = (a - 20) * DEG, a1 = (a + 20) * DEG;
        const pts: P2[] = [];
        for (let i = 0; i <= 16; i++) {
          const th = a0 + ((a1 - a0) * i) / 16;
          pts.push([960 + rr * Math.cos(th), 380 + rr * Math.sin(th)]);
        }
        out.push(<Path key={`sa${k}-${r}-${a}`} d={polyPath(pts)} w={1} o={O.hi * (1 - q)} />);
      }),
    );
  });
  // the pen: stem tip → head top during the glide; parked on the head top until the purr wave
  if (t < B177) {
    const tip = lp2(stemTip(t), [h.cx, h.cy - h.r], glide31(t));
    out.push(<PenHead key="pen" x={tip[0]} y={tip[1]} t={t} />);
  } else if (t < B180) out.push(<PenHead key="pen" x={h.cx} y={h.cy - h.r} t={t} />);
  // the head contracts into the pen dot at C (f2552)
  if (t >= OUT31 && h.r < 30) out.push(<PenHead key="pen0" x={960} y={390} t={t} scale={Math.max(0.001, 1 - h.r / 30)} />);
  return <>{out}</>;
};

export const Verse2: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <>
    <Specimen t={t} frame={frame} />
    <Cat t={t} frame={frame} />
  </>
);
