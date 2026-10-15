// Section B, shots B9–B12 (118.31–131.20 s): the shards of her (FRAGMENTS),
// the heart that cracks and splits (DISHEARTENED), and character moment 6
// (pose `defy`, "Challenging your god"), closing on the seed at C.
// Spec: docs/design_B.md B.1 shots B9–B12, B.2 moment 6, B.3.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {beat, clamp01, CODE, ease, FPS, K, lerp, O, prog, rng} from '../core';
import {Check, PenHead} from '../geo';
import {SHARDS} from './B_shards';
import {SIT} from './B_chorus';
import {ADV, arcPts, beatEnv, beatSteps, C, cumLen, DEG, F, KV, Pt, r2, RaySpark, Seg, Stroke, typed} from './B_util';

const f6 = 6 / FPS;
const f8 = 8 / FPS;

// ------------------------------------------------------------------ B9: shards
const N = SHARDS.length;
const SC_A = 118.4, SC_B = 120.3; // scatter
const CUT8 = 3549, GONE8 = 3552; // her line art cross-fades into the shards
const MARQ_A = beat(259); // 119.689 (f3591)
const SEL_F = 3605; // b260: cream shards re-stroke orange, left to right
const HIT9_F = 3626; // FRAGMENTS: deletion sweep
const MARQ_OUT = 121.47;

type Sh = {pts: Pt[]; c0: Pt; c1: Pt; dir: Pt; rot: number; orange: boolean; rank: number};
const SH: Sh[] = (() => {
  const R = rng(4242);
  const base = SHARDS.map((s) => {
    const pts = s.p.map(([nx, ny]) => [SIT.x + nx * SIT.w, SIT.y + ny * SIT.h] as Pt);
    const c0: Pt = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
    const v = (s.p[0][1] + s.p[1][1] + s.p[2][1]) / 3;
    return {pts, c0, v, orange: s.cls === 'o'};
  });
  const order = base.map((_, i) => i).sort((a, b) => base[a].c0[0] - base[b].c0[0]);
  const out: Sh[] = new Array(N);
  order.forEach((i, rank) => {
    const b = base[i];
    const jx = (R() * 2 - 1) * 24, jy = (R() * 2 - 1) * 24, rot = (R() * 2 - 1) * 35;
    const c1: Pt = [760 + (940 * rank) / (N - 1) + jx, 170 + 450 * b.v + jy];
    const L = Math.hypot(c1[0] - b.c0[0], c1[1] - b.c0[1]) || 1;
    out[i] = {pts: b.pts, c0: b.c0, c1, dir: [(c1[0] - b.c0[0]) / L, (c1[1] - b.c0[1]) / L], rot, orange: b.orange, rank};
  });
  return out;
})();
const TRI_C = (pts: Pt[]) => cumLen([...pts, pts[0]]);

// Max travel ~770 px in 1.9 s: inOutSine peaks at ~630 px/s (inOutCubic would be ~1200).
const scatterQ = (t: number) => prog(t, SC_A, SC_B, ease.inOutSine);

const Shards: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < CUT8 || t > 121.75) return null;
  const q = scatterQ(t);
  const after = Math.max(0, t - SC_B);
  const fadeIn = frame >= GONE8 ? 1 : (frame - CUT8) / (GONE8 - CUT8);
  return (
    <g opacity={r2(fadeIn)}>
      {SH.map((s, i) => {
        const delF = HIT9_F + Math.round((18 * s.rank) / (N - 1));
        const p = frame < delF ? 1 : 1 - (t - delF / FPS) / f6;
        if (p <= 0) return null;
        const sc = lerp(1, 1.5, q);
        const a = (s.rot * q + 4 * after) * DEG;
        const cx = lerp(s.c0[0], s.c1[0], q) + s.dir[0] * 8 * after;
        const cy = lerp(s.c0[1], s.c1[1], q) + s.dir[1] * 8 * after;
        const ca = Math.cos(a), sa = Math.sin(a);
        const pts = s.pts.map(([x, y]) => {
          const u = (x - s.c0[0]) * sc, v = (y - s.c0[1]) * sc;
          return [cx + u * ca - v * sa, cy + u * sa + v * ca] as Pt;
        });
        const selected = frame >= SEL_F + Math.round((6 * s.rank) / (N - 1));
        const orange = s.orange || selected;
        const w = s.orange ? 1.5 : 1;
        const loop = [...pts, pts[0]];
        return <Stroke key={i} pts={loop} c={TRI_C(pts)} p={p} color={orange ? K.orange : K.cream} w={w} opacity={orange ? 1 : O.hi} pen={false} closed={p >= 1} />;
      })}
    </g>
  );
};

const MARQ: Pt[] = [
  [700, 120],
  [1780, 120],
  [1780, 660],
  [700, 660],
  [700, 120],
];
const MARQ_CL = cumLen(MARQ);
const Marquee: React.FC<{t: number}> = ({t}) => {
  if (t < MARQ_A || t > MARQ_OUT + 0.3) return null;
  const p = Math.min(prog(t, MARQ_A, MARQ_A + f8, ease.inOutCubic), 1 - prog(t, MARQ_OUT, MARQ_OUT + f8, ease.inOutCubic));
  const lab = `${N} selected`;
  const n = typed(lab.length, MARQ_A, t, 5);
  const lo = 1 - prog(t, MARQ_OUT, MARQ_OUT + f6);
  return (
    <g>
      <Stroke pts={MARQ} c={MARQ_CL} p={p} w={1} opacity={O.mid} dash="6 6" t={t} />
      {n > 0 && lo > 0 && (
        <text x={712} y={140} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={lo}>
          {lab.slice(0, n)}
        </text>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ B10: the heart
const HC: Pt = [960, 410];
const TOP: Pt = [960, 289.79], BOT: Pt = [960, 530.21];
const HL: Pt[] = [...arcPts(899.9, 349.9, 85, -45, -225, 180 / 47), [839.79, 410], BOT];
const HR: Pt[] = [...arcPts(1020.1, 349.9, 85, -135, 45, 180 / 47), [1080.21, 410], BOT];
const HL_C = cumLen(HL), HR_C = cumLen(HR);
const CRACK: Pt[] = [TOP, [946, 338], [974, 386], [946, 434], [972, 482], BOT];
const CRACK_REV = [...CRACK].reverse();
const CRACK_C = cumLen(CRACK_REV);
const HEART_A = beat(264), HEART_B = beat(266); // 121.997 → 122.920
const CRACK_T = [0, 1, 2, 3, 4].map((j) => beat(268 + j / 2)); // 123.843 … 124.766
const HIT10 = F(3747); // DISHEARTENED
const FALL_A = 125.1, FALL_B = 125.46;
const HUN_A = 125.46, HUN_B = 125.46 + 7 / FPS;

// Partial draw of a half's closed loop: outline T → B, then the crack B → T.
const HalfLoop: React.FC<{outline: Pt[]; oc: Float64Array; p: number; crackMix: number; t: number}> = ({outline, oc, p, crackMix, t}) => {
  const Lo = oc[oc.length - 1], Lc = CRACK_C[CRACK_C.length - 1];
  const s = p * (Lo + Lc);
  const po = Math.min(1, s / Lo), pc = clamp01((s - Lo) / Lc);
  const unplotting = p < 1;
  return (
    <>
      <Stroke pts={outline} c={oc} p={po} w={1.5} t={t} pen={unplotting && pc <= 0} />
      {pc > 0 && (
        <>
          <Stroke pts={CRACK_REV} c={CRACK_C} p={pc} w={1.5} color={K.cream} opacity={O.hi * crackMix} t={t} pen={unplotting} />
          {crackMix < 1 && <Stroke pts={CRACK_REV} c={CRACK_C} p={pc} w={1.5} color={K.orange} opacity={1 - crackMix} pen={false} />}
        </>
      )}
    </>
  );
};

const Heart: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < HEART_A || t > HUN_B + 0.05) return null;
  const s = 1 + 0.06 * beatEnv(t, 266, 270);
  const scale = `translate(${HC[0]} ${HC[1]}) scale(${r2(s * 1000) / 1000}) translate(${-HC[0]} ${-HC[1]})`;
  if (frame < 3747) {
    const p = prog(t, HEART_A, HEART_B, ease.inOutCubic);
    return (
      <g transform={scale}>
        <Stroke pts={HL} c={HL_C} p={p} w={1.5} t={t} />
        <Stroke pts={HR} c={HR_C} p={p} w={1.5} t={t} />
        {CRACK_T.map((tc, j) => (
          <Seg key={j} a={CRACK[j]} b={CRACK[j + 1]} p={prog(t, tc, tc + 4 / FPS, ease.inOutCubic)} color={K.orange} w={1.5} t={t} />
        ))}
      </g>
    );
  }
  // split: each half (outline + crack copy) rotates ∓10° about the tip and slides apart
  const q = prog(t, HIT10, HIT10 + 12 / FPS, ease.outCubic);
  const fall = 24 * prog(t, FALL_A, FALL_B);
  const crackMix = prog(t, HIT10, HIT10 + f6);
  const p = 1 - prog(t, HUN_A, HUN_B);
  const tr = (sgn: number) => `translate(${r2(sgn * 70 * q)} ${r2(30 * q + fall)}) rotate(${r2(sgn * 10 * q)} ${BOT[0]} ${BOT[1]})`;
  return (
    <g>
      <g transform={tr(-1)}>
        <HalfLoop outline={HL} oc={HL_C} p={p} crackMix={crackMix} t={t} />
      </g>
      <g transform={tr(1)}>
        <HalfLoop outline={HR} oc={HR_C} p={p} crackMix={crackMix} t={t} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ B11–B12: moment 6 (pose `defy`)
// The art has the open book on the viewer's LEFT and the raised palm on the
// viewer's RIGHT, so this is the design's mirrored layout: the god spark on the
// right, her box x 500–860, the iris still closing on C.
const BOX = {x: 500, y: 120, w: 360, h: 540};
const SPK = {x: 1280, y: 390, R: 100};
const FEET: Pt = [BOX.x + BOX.w / 2, BOX.y + BOX.h]; // push origin (680, 660)
// Anchors measured on public/char/defy_flat.png (normalised).
const ANC = {face: [0.487, 0.105], book: [0.375, 0.205], palm: [0.725, 0.19]};
const T6 = {
  bloom: 125.689, // b272 (f3771)
  pid: 125.8,
  scanM: beat(273), // 126.151: scan turns
  scanB: beat(274), // 126.613: scan done, push starts
  pushB: beat(283), // 130.766
  ring: [beat(276), beat(277)],
  chal: beat(277), // 127.997 (f3840)
  retract: 128.661,
  solid: beat(279), // 128.920
  rays: [0, 1, 2, 3, 4, 5, 6, 7].map((j) => beat(279 + j / 2)),
  irisF: 3923, // b283
  irisEndF: 3935,
};
const RAY_ORDER = [0, 6, 3, 9, 1, 7, 4, 10];
export const push6 = (t: number) => 1 + 0.03 * prog(t, T6.scanB, T6.pushB);
const S6 = (a: number[], k: number): Pt => {
  const x = BOX.x + a[0] * BOX.w, y = BOX.y + a[1] * BOX.h;
  return [FEET[0] + (x - FEET[0]) * k, FEET[1] + (y - FEET[1]) * k];
};

type Lab6 = {tb: number; side: 'L' | 'R'; x: number; y: number; k: string; v: string; at: number[]};
const LABS: Lab6[] = [
  {tb: beat(274), side: 'L', x: 450, y: 238, k: 'book', v: 'open', at: ANC.book},
  {tb: beat(275), side: 'R', x: 910, y: 170, k: 'hand', v: 'raised', at: ANC.palm},
  {tb: beat(276), side: 'L', x: 450, y: 184, k: 'obey', v: 'false', at: ANC.face},
];
const LFS = 22;

// Moment A leader mechanics: the label types in 5 frames, an orange check 4 frames
// later; the leader runs 40 px horizontal from the label, then straight to a node.
const Leader: React.FC<{l: Lab6; t: number; k: number}> = ({l, t, k}) => {
  if (t < l.tb) return null;
  const full = `${l.k} = ${l.v}`;
  const back = prog(t, T6.retract, T6.retract + f8, ease.inOutCubic);
  if (back >= 1) return null;
  const n = Math.round(full.length * Math.min(prog(t, l.tb, l.tb + 5 / FPS), 1 - back));
  const tw = full.length * ADV(LFS);
  const textX = l.side === 'R' ? l.x : l.x - tw;
  const checkX = textX + tw + 12;
  const midY = l.y - 7;
  const [nx, ny] = S6(l.at, k);
  const lx0 = l.side === 'R' ? l.x - 12 : checkX + 14 + 12;
  const lx1 = l.side === 'R' ? lx0 - 40 : lx0 + 40;
  const lead: Pt[] = [
    [nx, ny],
    [lx1, midY],
    [lx0, midY],
  ];
  const lp = Math.min(prog(t, l.tb, l.tb + 5 / FPS, ease.inOutCubic), 1 - back);
  const ck = Math.min(prog(t, l.tb + 9 / FPS, l.tb + 12 / FPS), 1 - prog(t, T6.retract, T6.retract + 3 / FPS));
  const node = Math.min(prog(t, l.tb, l.tb + 3 / FPS, ease.outExpo), 1 - prog(t, T6.retract + f6, T6.retract + f8));
  return (
    <g>
      <Stroke pts={lead} p={lp} w={1} opacity={O.mid} t={t} pen={back === 0} />
      {node > 0 && <circle cx={r2(nx)} cy={r2(ny)} r={r2(3.5 * node)} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} />}
      <KV x={textX} y={l.y} k={l.k} v={l.v} n={n} size={LFS} />
      {ck > 0 && <Check x={checkX} y={l.y - 3} p={ck} />}
    </g>
  );
};

export const MomentDefy: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < T6.bloom - 0.01 || frame > 3936) return null;
  const k = push6(t);
  // --- scan: plotted across y 120 in 3 frames, down to 660 by b273, back up by b274
  const plotB = T6.bloom + 3 / FPS;
  const across = prog(t, T6.bloom, plotB, ease.inOutCubic);
  const yScan = t < T6.scanM ? lerp(120, 660, prog(t, plotB, T6.scanM)) : lerp(660, 120, prog(t, T6.scanM, T6.scanB));
  const scanO = 1 - prog(t, T6.scanB, T6.scanB + 3 / FPS);
  let linesBot = 660 - yScan;
  let flatTop: number = BOX.h;
  if (t >= T6.scanM) {
    linesBot = 0;
    flatTop = Math.max(0, yScan - BOX.y);
  }
  // --- spark: bloom, rotation, ray loss
  const x0 = (t - T6.bloom) * FPS;
  const loss = (i: number) => {
    const j = RAY_ORDER.indexOf(i);
    return j < 0 ? 1 : 1 - ease.inCubic(prog(t, T6.rays[j], T6.rays[j] + f6));
  };
  const grow = (i: number) => ease.outCubic(clamp01((x0 - 0.5 * i) / 2.5)) * loss(i);
  const rot = 8 * (t - T6.bloom) + beatSteps(t, T6.bloom + 0.01);
  // --- challenge line: palm → toward the hub, stopping 116 px short
  const palm = S6(ANC.palm, k);
  const dx = SPK.x - palm[0], dy = SPK.y - palm[1];
  const L = Math.hypot(dx, dy);
  const end: Pt = [palm[0] + (dx * (L - 116)) / L, palm[1] + (dy * (L - 116)) / L];
  const chP = prog(t, T6.chal, T6.chal + f8, ease.inOutCubic);
  const solid = prog(t, T6.solid, T6.solid + f6);
  // --- iris close onto C
  const irisOn = frame >= T6.irisF;
  const r = irisOn ? 560 * (1 - ease.inCubic(clamp01((frame - T6.irisF) / (T6.irisEndF - T6.irisF)))) : 0;
  const img: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'};
  const pidN = typed(5, T6.pid, t, 5);
  const seedS = irisOn ? ease.outExpo(clamp01((frame - T6.irisF) / 4)) : 0;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: irisOn ? `circle(${r2(Math.max(0, r))}px at ${C.x}px ${C.y}px)` : undefined}}>
        <div
          style={{
            position: 'absolute',
            left: BOX.x,
            top: BOX.y,
            width: BOX.w,
            height: BOX.h,
            transform: `scale(${r2(k * 10000) / 10000})`,
            transformOrigin: `${FEET[0] - BOX.x}px ${FEET[1] - BOX.y}px`,
          }}
        >
          <Img src={staticFile('char/defy_flat.png')} style={{...img, clipPath: `inset(${r2(Math.min(BOX.h, flatTop))}px 0 0 0)`, opacity: flatTop < BOX.h ? 1 : 0}} />
          <Img src={staticFile('char/defy_lines.png')} style={{...img, clipPath: `inset(0 0 ${r2(Math.max(0, Math.min(BOX.h, linesBot)))}px 0)`, opacity: linesBot >= BOX.h ? 0 : 1}} />
        </div>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {T6.ring.map((tb, i) => {
            const x = (t - tb) / 0.4;
            if (x < 0 || x >= 1) return null;
            return <circle key={i} cx={SPK.x} cy={SPK.y} r={r2(lerp(100, 300, x))} fill="none" stroke={K.orange} strokeWidth={1} opacity={r2(0.45 * (1 - x))} />;
          })}
          <RaySpark x={SPK.x} y={SPK.y} R={SPK.R} rot={rot} grow={grow} hub={clamp01(x0 / 2)} />
          {pidN > 0 && (
            <text x={SPK.x} y={528} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim}>
              {'pid 1'.slice(0, pidN)}
            </text>
          )}
          {chP > 0 && (
            <>
              {solid < 1 && <Stroke pts={[palm, end]} p={chP} w={1} opacity={O.mid * (1 - solid)} dash="6 6" t={t} />}
              {solid > 0 && <Seg a={palm} b={end} w={1.5} opacity={O.hi * solid} pen={false} />}
            </>
          )}
          {LABS.map((l, i) => (
            <Leader key={i} l={l} t={t} k={k} />
          ))}
          {t >= T6.bloom && scanO > 0 && (
            <g opacity={r2(scanO)}>
              <path d={`M475 ${r2(yScan)}L${r2(lerp(475, 885, across))} ${r2(yScan)}`} stroke={K.orange} strokeWidth={2} />
              {across < 1 && <PenHead x={lerp(475, 885, across)} y={yScan} t={t} />}
              {across >= 1 && (
                <text x={893} y={r2(yScan + 5)} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
                  {`y ${String(Math.round(yScan)).padStart(4, '0')}`}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
      {irisOn && (
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {r > 0 && r <= 300 && <circle cx={C.x} cy={C.y} r={r2(r)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={r2(O.mid * clamp01((300 - r) / 30))} />}
          {seedS > 0 && <PenHead x={C.x} y={C.y} t={t} scale={seedS} />}
        </svg>
      )}
    </>
  );
};

// ------------------------------------------------------------------ export (stage geometry)
export const Bridge: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < CUT8 || t > 125.75) return null;
  return (
    <g>
      <Shards t={t} frame={frame} />
      <Marquee t={t} />
      <Heart t={t} frame={frame} />
    </g>
  );
};
