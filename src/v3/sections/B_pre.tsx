// Section B, shots B1–B4 (88.60–103.54 s): Venus to Mars, the AM–PM dial,
// the S / M swap, and the trance spirals. Spec: docs/design_B.md B.1.
// The circle is one object from the Venus plot to the S un-plot (B1–B4).
import React from 'react';
import {beat, CODE, ease, fr, FPS, K, lerp, O, prog} from '../core';
import {Arrow, PenHead} from '../geo';
import {ADV, ArcStroke, arcPts, beatEnv, C, cumLen, DEG, KV, polar, Pt, r2, Seg, Stroke, typed} from './B_util';

const f6 = 6 / FPS;
const f8 = 8 / FPS;

// ------------------------------------------------------------------ timing
const B1 = {
  circA: beat(192), // 88.766 (f2663): Venus circle plotted from its bottom point
  circB: beat(193), // 89.228 (f2677)
  stemB: beat(193.5), // 89.459
  barB: beat(194), // 89.689: crossbar done, label
  morphA: beat(196), // 90.613
  morphB: beat(199), // 91.997 (f2760)
  flipF: fr(beat(197)), // f2732: F backspaces, M types on the next frame
};
const B2 = {
  out: 92.015, // Mars un-plots, label lifts out
  growA: 92.06,
  dial: beat(200), // 92.459
  numT: 92.55,
  amT: 92.6,
  land: Array.from({length: 12}, (_, k) => 92.69 + 0.23077 * k), // step landings (eighth notes)
};
const B3 = {
  clean: 95.465,
  moveB: 95.92,
  sqA: beat(207), // 95.689
  labT: beat(208), // 96.151
  hintA: beat(209), // 96.613
  swapA: beat(212), // 97.997
  swapB: beat(214), // 98.920
  outA: beat(215), // 99.382
};
const B4 = {
  aA: beat(215), // 99.382
  aB: beat(218), // 100.766
  bA: beat(220), // 101.689
  bB: beat(222), // 102.613
  outA: beat(223), // 103.074
  outB: beat(224), // 103.536
};
export const PRE_END = B4.outB + 0.05;

// ------------------------------------------------------------------ B1–B3: the circle
// Swap orbit (377 px of path in 0.923 s): inOutSine keeps the peak at ~640 px/s
// (inOutCubic would peak at ~1220 px/s, over the 600 px/s limit).
const swapQ = (t: number) => prog(t, B3.swapA, B3.swapB, ease.inOutSine);
const circleState = (t: number, frame: number) => {
  let cx = C.x, cy = C.y, r = 90, w = 1.5, p = 1;
  if (t < B1.circB) p = prog(t, B1.circA, B1.circB); // constant speed
  if (t >= B1.circB && t < B2.out) r = 90 * (1 + 0.05 * beatEnv(t, 193, 199));
  if (frame >= 2760 && frame < 2763) w = 2;
  if (t >= B2.growA) r = lerp(90, 200, prog(t, B2.growA, B2.dial, ease.inOutSine));
  if (t >= B3.clean) {
    const q = prog(t, B3.clean, B3.moveB, ease.inOutSine);
    cx = lerp(C.x, 840, q);
    r = lerp(200, 60, q);
  }
  if (t >= B3.swapA) {
    const a = (180 + 180 * swapQ(t)) * DEG;
    cx = C.x + 120 * Math.cos(a);
    cy = C.y + 120 * Math.sin(a);
  }
  if (t >= B3.moveB) r *= 1 + 0.05 * beatEnv(t, 208, 214);
  if (frame >= 2968 && frame < 2971) w = 2;
  if (t >= B3.outA) p = 1 - prog(t, B3.outA, B3.outA + f8, ease.inOutCubic);
  return {cx, cy, r, w, p};
};

// ------------------------------------------------------------------ B1: Venus / Mars glyph
const Gender: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B1.circB || t > B2.out + 10 / FPS) return null;
  const q = prog(t, B1.morphA, B1.morphB, ease.inOutSine);
  const phi = lerp(90, -45, q);
  const unplot = prog(t, B2.out, B2.out + f8, ease.inOutCubic);
  const rOut = lerp(210, 90, unplot);
  const ra = t < B2.out ? lerp(165, 210, q) : rOut;
  const beta = lerp(90, 145, q);
  const bl = lerp(45, 36, q) * (1 - prog(t, B2.out, B2.out + 3 / FPS));
  const stemA = polar(C.x, C.y, 90, phi);
  const stemTip = polar(C.x, C.y, rOut, phi);
  const stemP = prog(t, B1.circB, B1.stemB, ease.inOutCubic);
  const barP = prog(t, B1.stemB, B1.barB, ease.inOutCubic);
  const P = polar(C.x, C.y, ra, phi);
  const barb = (s: number): Pt => [P[0] + bl * Math.cos((phi + s * beta) * DEG), P[1] + bl * Math.sin((phi + s * beta) * DEG)];
  const plotting = t < B1.barB;
  return (
    <g>
      <Seg a={stemA} b={plotting ? polar(C.x, C.y, 210, 90) : stemTip} p={plotting ? stemP : 1} t={t} pen={plotting} />
      {unplot > 0 && unplot < 1 && <PenHead x={stemTip[0]} y={stemTip[1]} t={t} />}
      {bl > 0.5 && barP > 0 && (
        <>
          <Seg a={P} b={barb(1)} p={barP} t={t} pen={barP < 1} />
          <Seg a={P} b={barb(-1)} p={barP} t={t} pen={barP < 1} />
        </>
      )}
    </g>
  );
};

const GenderLabel: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B1.barB || t > B2.out + 6 / FPS) return null;
  const lift = prog(t, B2.out, B2.out + 5 / FPS);
  const n = typed(10, B1.barB, t, 5); // "gender = F"
  let v = 'F', vc: string = K.cream;
  if (frame === B1.flipF) v = '';
  else if (frame > B1.flipF) {
    v = 'M';
    if (frame <= B1.flipF + 6) vc = K.orange;
  }
  return (
    <g opacity={1 - lift} transform={`translate(0 ${r2(-14 * lift)})`}>
      <Seg a={[870, 390]} b={[810, 390]} p={prog(t, B1.barB, B1.barB + 4 / FPS, ease.inOutCubic)} w={1} opacity={O.mid} t={t} />
      <KV x={798 - 10 * ADV(22)} y={398} k="gender" v={v} n={frame >= B1.flipF ? 9 + v.length : n} valColor={vc} />
    </g>
  );
};

// ------------------------------------------------------------------ B2: the dial
const handAngle = (t: number) => {
  let a = -90;
  B2.land.forEach((L, k) => {
    const a0 = k === 0 ? B2.dial + 4 / FPS : L - f6;
    a += 30 * prog(t, a0, L, ease.inOutSine); // hand tip peak ~490 px/s (inOutCubic: ~940)
  });
  return a;
};

const Dial: React.FC<{t: number; frame: number; cs: ReturnType<typeof circleState>}> = ({t, frame, cs}) => {
  if (t < B2.dial || t > B3.clean + 10 / FPS) return null;
  const {cx, cy, r} = cs;
  const k = r / 200;
  const clean = prog(t, B3.clean, B3.clean + f6, ease.inOutCubic);
  const fadeC = 1 - prog(t, B3.clean, B3.clean + f6);
  const ha = handAngle(t);
  // the tick each landing hits flashes orange for 2 frames
  let flashTick = -1;
  B2.land.forEach((L, i) => {
    const f0 = fr(L);
    if (frame >= f0 && frame < f0 + 2) flashTick = (i + 1) % 12;
  });
  const ticks = Array.from({length: 12}, (_, j) => {
    const a = -90 + 30 * j;
    const major = j % 3 === 0;
    const t0 = B2.dial + (0.5 * j) / FPS;
    const p = Math.min(prog(t, t0, t0 + 3 / FPS, ease.inOutCubic), 1 - clean);
    const fl = flashTick === j;
    return (
      <Seg
        key={j}
        a={polar(cx, cy, 200 * k, a)}
        b={polar(cx, cy, (major ? 176 : 186) * k, a)}
        p={p}
        pen={false}
        w={major || fl ? 2 : 1}
        color={fl ? K.orange : K.cream}
        opacity={fl ? 1 : major ? 1 : O.hi}
        cap="butt"
      />
    );
  });
  const nums = ['12', '3', '6', '9'].map((s, i) => {
    const [x, y] = polar(cx, cy, 150 * k, -90 + 90 * i);
    const n = typed(s.length, B2.numT, t, s.length);
    return n > 0 ? (
      <text key={s} x={r2(x)} y={r2(y + 8)} textAnchor="middle" fontFamily={CODE} fontSize={22} fill={K.cream} opacity={O.hi * fadeC}>
        {s.slice(0, n)}
      </text>
    ) : null;
  });
  // AM / PM: two monospace cells centred at (960, 478)
  const pmF = fr(B2.land[11]);
  const c0 = frame < pmF ? 'A' : frame === pmF ? '' : 'P';
  const pmOrange = frame > pmF && frame <= pmF + 6;
  const amN = typed(2, B2.amT, t, 2);
  const adv = 0.6 * 28;
  const amX = cx - adv, amY = cy + (478 - 390) * k + 10;
  const rimP = (ha + 90) / 360;
  const handP = Math.min(prog(t, B2.dial, B2.dial + 4 / FPS, ease.inOutCubic), 1 - clean);
  return (
    <g>
      {ticks}
      {nums}
      {amN > 0 && fadeC > 0 && (
        <text y={r2(amY)} fontFamily={CODE} fontWeight={500} fontSize={28} fill={pmOrange ? K.orange : K.cream} opacity={fadeC}>
          {amN >= 1 && c0 && <tspan x={r2(amX)}>{c0}</tspan>}
          {amN >= 2 && <tspan x={r2(amX + adv)}>M</tspan>}
        </text>
      )}
      <Seg a={[cx, cy]} b={polar(cx, cy, 120 * k, ha)} p={handP} w={2} t={t} pen={t < B3.clean} />
      {rimP > 0 && <ArcStroke cx={cx} cy={cy} r={r} a0={-90} sweep={360} p={rimP} color={K.orange} w={3} pen={false} opacity={fadeC} />}
    </g>
  );
};

// ------------------------------------------------------------------ B3: S / M swap
const SQ: Pt[] = [
  [-80, -80],
  [80, -80],
  [80, 80],
  [-80, 80],
  [-80, -80],
];
const SQ_C = cumLen(SQ);
const HINT_U = arcPts(C.x, C.y, 230, 205, 335);
const HINT_L = arcPts(C.x, C.y, 230, 25, 155);

const Swap: React.FC<{t: number; frame: number; cs: ReturnType<typeof circleState>}> = ({t, frame, cs}) => {
  if (t < B3.sqA || t > B3.outA + 10 / FPS) return null;
  const am = 180 * swapQ(t) * DEG;
  const mx = C.x + 120 * Math.cos(am), my = C.y + 120 * Math.sin(am);
  const s = 1 + 0.05 * beatEnv(t, 208, 214);
  const flash = frame >= 2968 && frame < 2971;
  const plotP = prog(t, B3.sqA, B3.sqA + 16 / FPS);
  const outP = prog(t, B3.outA, B3.outA + f8, ease.inOutCubic);
  const sqP = Math.min(plotP, 1 - outP);
  const hint = Math.min(prog(t, B3.hintA, B3.hintA + f8, ease.inOutCubic), 1 - prog(t, B3.swapA, B3.swapA + f6, ease.inOutCubic));
  const labO = t >= B3.labT - 0.001 ? (1 - outP) * O.hi : 0;
  const sq = SQ.map(([x, y]) => [mx + x * s, my + y * s] as Pt);
  const lab = (x: number, y: number, ch: string) =>
    labO > 0 ? (
      <text x={r2(x)} y={r2(y + 14)} textAnchor="middle" fontFamily={CODE} fontWeight={500} fontSize={40} fill={K.cream} opacity={labO}>
        {ch}
      </text>
    ) : null;
  const arrowAt = (pts: Pt[]) => {
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    return <Arrow x={b[0]} y={b[1]} angle={(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI} size={10} w={1} opacity={O.mid} />;
  };
  return (
    <g>
      <Stroke pts={sq} c={SQ_C} p={sqP} w={flash ? 2 : 1.5} t={t} />
      {lab(mx, my, 'M')}
      {lab(cs.cx, cs.cy, 'S')}
      {hint > 0 && (
        <>
          <Stroke pts={HINT_U} p={hint} w={1} opacity={O.mid} t={t} />
          <Stroke pts={HINT_L} p={hint} w={1} opacity={O.mid} t={t} />
          {hint >= 1 && arrowAt(HINT_U)}
          {hint >= 1 && arrowAt(HINT_L)}
        </>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ B4: trance spirals
const SPIRAL = (sign: 1 | -1, outward: boolean): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i < 720; i++) {
    const th = (12 * Math.PI * (outward ? i : 719 - i)) / 719;
    const r = 12 + (248 * th) / (12 * Math.PI);
    const a = sign * th - Math.PI / 2;
    pts.push([C.x + r * Math.cos(a), C.y + r * Math.sin(a)]);
  }
  return pts;
};
const SPA = SPIRAL(1, true);
const SPA_C = cumLen(SPA);
const SPB = SPIRAL(-1, false); // outer end inward
const SPB_C = cumLen(SPB);

const Trance: React.FC<{t: number}> = ({t}) => {
  if (t < B4.aA || t > B4.outB + 0.05) return null;
  const s = 1 + 0.05 * beatEnv(t, 216, 223);
  const out = prog(t, B4.outA, B4.outB, ease.inCubic);
  const pa = Math.min(prog(t, B4.aA, B4.aB, ease.inOutSine), 1 - out);
  const pb = prog(t, B4.bA, B4.bB, ease.inOutSine);
  const tr = (rho: number) => `translate(${C.x} ${C.y}) rotate(${r2(rho)}) scale(${r2(s * 1000) / 1000}) translate(${-C.x} ${-C.y})`;
  const rings = [220, 221, 222].map((n) => {
    const x = (t - beat(n)) / 0.4;
    if (x < 0 || x >= 1) return null;
    return <circle key={n} cx={C.x} cy={C.y} r={r2(280 * x)} fill="none" stroke={K.orange} strokeWidth={1} opacity={r2(0.45 * (1 - x))} />;
  });
  return (
    <g>
      {rings}
      <g transform={tr(45 * (t - B4.aA))}>
        <Stroke pts={SPA} c={SPA_C} p={pa} w={1.5} opacity={O.hi} t={t} />
      </g>
      {t >= B4.bA && (
        <g transform={tr(-45 * (t - B4.bA))}>
          {/* B is sampled outer → inner: plotting runs inward; the exit retracts its outer tail toward C */}
          <Stroke pts={SPB} c={SPB_C} p={pb} from={out} penAt={out > 0 ? 'start' : 'end'} w={1} opacity={O.mid} t={t} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ export
export const PreChorus: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t > PRE_END) return null;
  const cs = circleState(t, frame);
  const showCircle = t >= B1.circA && t < B3.outA + f8 + 0.01;
  return (
    <g>
      {showCircle && <ArcStroke cx={cs.cx} cy={cs.cy} r={cs.r} a0={90} sweep={360} p={cs.p} w={cs.w} t={t} />}
      <Gender t={t} frame={frame} />
      <GenderLabel t={t} frame={frame} />
      <Dial t={t} frame={frame} cs={cs} />
      <Swap t={t} frame={frame} cs={cs} />
      <Trance t={t} />
    </g>
  );
};
