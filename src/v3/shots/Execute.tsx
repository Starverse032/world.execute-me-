// Shots 7 (end) – 10 (start), 15.842–23.6 s: the user bubble flight, the
// title bubble with the spark bloom, the backspace to "me", and character
// moment A ("me, rendered"). Spec: docs/design_v3.md §4 shots 7–10, §5 moment A.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {beat, beatIndex, clamp01, CODE, ease, FPS, K, lastOnset, lerp, O, prog, pulse, useT} from '../core';
import {CUT, SEND} from '../data';
import {FIG} from '../figure';
import {Check, Elbow, linePath, PenHead, Plot, polyPath, roundRectPath, Spark, Svg, circlePath} from '../geo';
import meta from '../char_meta.json';

const f2t = (f: number) => f / FPS;
const r2 = (v: number) => Math.round(v * 100) / 100;

// ------------------------------------------------------------------ title layout
const TS = 112; // title font size
const ADV = 0.6 * TS; // JetBrains Mono advance (600 / 1000 em)
const TITLE = 'world.execute(me);';
const ME0 = 14; // index of "me"
const TX0 = 960 - (TITLE.length * ADV) / 2; // 355.2: "me" spans 1296–1430
const TBASE = 580; // baseline: glyph box centred on y = 540
const PADX = 56;
const BUB = {x: TX0 - PADX, y: 440, w: TITLE.length * ADV + 2 * PADX, h: 200, r: 28}; // x 299–1621
const ME_C = {x: TX0 + (ME0 + 1) * ADV, y: 540}; // (1363, 540): where "me" collapses
// Composer prompt position at send (ui.tsx): x 304, baseline 948, 44 px weight 500.
const CMP = {x: 304, y: 948, size: 44};

const titleText = (left: string, right: string, li: number, weight: number) => (
  <text y={TBASE} fontFamily={CODE} fontWeight={weight} fontSize={TS} fill={K.cream}>
    {left && <tspan x={r2(TX0 + li * ADV)}>{left}</tspan>}
    <tspan x={r2(TX0 + ME0 * ADV)} fill={K.orange}>
      me
    </tspan>
    {right && <tspan x={r2(TX0 + (ME0 + 2) * ADV)}>{right}</tspan>}
  </text>
);

// ------------------------------------------------------------------ spark with per-ray growth
const JIT = [0, 4, -3, 2, -4, 3, 0, -2, 4, -3, 2, -1];
const LEN = [1.0, 0.8, 0.95, 0.76, 0.98, 0.84, 0.93, 0.78, 1.0, 0.82, 0.96, 0.79];
const rayD = (R: number, i: number, g: number) => {
  const a = ((-90 + 30 * i + JIT[i]) * Math.PI) / 180;
  const r0 = 0.1 * R, w0 = 0.075 * R, w1 = 0.025 * R;
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  const tip = Math.max(r0 + w1, R * LEN[i] * g);
  const P = (r: number, w: number) => `${r2(r * c + px * w)} ${r2(r * s + py * w)}`;
  return `M ${P(r0, w0)} L ${P(tip - w1, w1)} A ${r2(w1)} ${r2(w1)} 0 0 0 ${P(tip - w1, -w1)} L ${P(r0, -w0)} Z`;
};
const RaySpark: React.FC<{x: number; y: number; R: number; rot: number; grow: (i: number) => number; hub: number}> = ({x, y, R, rot, grow, hub}) => (
  <g transform={`translate(${x} ${y}) rotate(${r2(rot)})`}>
    {JIT.map((_, i) => {
      const g = grow(i);
      return g > 0.001 ? <path key={i} d={rayD(R, i, g)} fill={K.orange} /> : null;
    })}
    {hub > 0 && <circle r={0.14 * R} fill={K.orange} opacity={hub} />}
  </g>
);

// 15° step on every beat after t0 (each step eased over 6 frames, easeOutCubic).
const beatSteps = (t: number, t0: number) => {
  const n0 = beatIndex(t0) + 1;
  const n = beatIndex(t);
  if (n < n0) return 0;
  return 15 * (n - n0) + 15 * prog(t, beat(n), beat(n) + 6 / FPS, ease.outCubic);
};

// ------------------------------------------------------------------ shot 7 end: the bubble flight (f476–f479)
const Flight: React.FC<{t: number}> = ({t}) => {
  const p = prog(t, SEND, CUT, ease.outExpo);
  const s = lerp(CMP.size / TS, 1, p);
  const ax = lerp(CMP.x, TX0, p), ay = lerp(CMP.y, TBASE, p);
  const tr = `translate(${r2(ax - s * TX0)} ${r2(ay - s * TBASE)}) scale(${r2(s * 1000) / 1000})`;
  return (
    <Svg style={{zIndex: 5}}>
      <g transform={tr}>
        <rect x={BUB.x} y={BUB.y} width={BUB.w} height={BUB.h} rx={BUB.r} fill={K.surface} stroke={K.line2} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {titleText('world.execute(', ');', 0, Math.round(lerp(500, 700, p)))}
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------ shots 8–9: title, bloom, backspace, collapse
const SPARK = {x: 960, y: 330, R: 56};
// Title hold beat rings: one from the spark on every beat b35–b39 (16.30–18.15),
// on the detected onset; the downbeat b36 is orange, the others cream.
const RING_BEATS = [35, 36, 37, 38, 39].map((n) => ({t: lastOnset(beat(n) + 0.041), down: n % 4 === 0}));
const RING_DUR = 0.8;
// The bubble outline answers each beat with a 1 px echo that steps out 24 px
// and fades (the title text itself never moves).
const ECHO_DUR = 0.5;
const BS = 18.611; // backspace (f558)
// The "me" dot glides to the top of her box and arrives exactly as the scan
// line starts from it (it is never parked as a loose pen head).
const GLIDE = {a: 19.0, b: 19.3, to: {x: 1258, y: 140}};

const Title: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  // --- spark: bloom f480–f488, rays retract f558–f565
  const bloom = (i: number) => ease.outCubic(clamp01((frame - 480 - 0.5 * i) / 2.5));
  const retract = 1 - prog(t, f2t(558), f2t(566), ease.inCubic);
  const rot = 8 * (t - CUT) + beatSteps(t, CUT);
  // --- backspace: 2 chars per frame from the outer ends inward (f558–f565)
  const del = Math.max(0, Math.min(16, 2 * (frame - 557)));
  const R = Math.min(2, Math.ceil(del / 8));
  const L = del - R;
  const left = 'world.execute('.slice(L);
  const right = ');'.slice(0, 2 - R);
  const bx0 = TX0 + L * ADV - PADX;
  const bx1 = TX0 + (TITLE.length - R) * ADV + PADX;
  const bub = roundRectPath(bx0, BUB.y, bx1 - bx0, BUB.h, BUB.r);
  // --- un-plot of the bubble (f566–f570) and "me" collapsing into the pen dot
  const unplot = frame <= 565 ? 1 : clamp01(1 - (frame - 565) / 5);
  const meS = frame <= 565 ? 1 : clamp01(1 - ease.inCubic((frame - 565) / 4));
  // --- "⎿ executing…"
  const exP = prog(t, BS, BS + 5 / FPS);
  const exN = Math.floor((t - 16.3) * FPS * 5);
  // the spark breathes on every beat of the hold (size only; the text stays put)
  const sparkR = SPARK.R * (t < BS ? 1 + 0.1 * pulse(t) : 1);
  return (
    <Svg>
      {RING_BEATS.map(({t: tb, down}, i) => {
        const q = (t - tb) / RING_DUR;
        if (q < 0 || q >= 1) return null;
        const r = lerp(SPARK.R, 640, ease.outCubic(q));
        return (
          <circle
            key={i}
            cx={SPARK.x}
            cy={SPARK.y}
            r={r2(r)}
            fill="none"
            stroke={down ? K.orange : K.cream}
            strokeWidth={1.5}
            opacity={(down ? 0.9 : O.hi) * (1 - q)}
          />
        );
      })}
      {frame <= 557 &&
        RING_BEATS.map(({t: tb}, i) => {
          const q = (t - tb) / ECHO_DUR;
          if (q < 0 || q >= 1) return null;
          const g = 24 * ease.outCubic(q);
          return (
            <path
              key={`e${i}`}
              d={roundRectPath(BUB.x - g, BUB.y - g, BUB.w + 2 * g, BUB.h + 2 * g, BUB.r + g)}
              fill="none"
              stroke={K.cream}
              strokeWidth={1}
              opacity={O.mid * (1 - q)}
            />
          );
        })}
      {retract > 0 && <RaySpark {...SPARK} R={sparkR} rot={rot} grow={(i) => bloom(i) * retract} hub={retract} />}
      {unplot > 0 && (
        <>
          <path d={bub} fill={K.surface} opacity={unplot} />
          {/* un-plots are bare: no pen head on a retracting stroke */}
          <Plot d={bub} p={unplot} color={K.line2} w={1.5} t={t} pen={false} />
        </>
      )}
      {meS > 0 && (
        <g transform={`translate(${ME_C.x} ${ME_C.y}) scale(${r2(meS * 100) / 100}) translate(${-ME_C.x} ${-ME_C.y})`}>{titleText(left, right, L, 700)}</g>
      )}
      {frame >= 568 && t < GLIDE.a + 0.001 && <PenHead x={ME_C.x} y={ME_C.y} t={t} scale={frame >= 570 ? 1 : (frame - 567) / 3} />}
      {t >= 16.3 && exP < 1 && (
        <g opacity={1 - exP} transform={`translate(0 ${-14 * exP})`}>
          <Elbow x={BUB.x} y={688} p={prog(t, 16.3, 16.3 + 3 / FPS)} />
          <text x={BUB.x + 22} y={694} fontFamily={CODE} fontSize={22} fill={K.creamDim}>
            {'executing…'.slice(0, Math.max(0, exN))}
          </text>
        </g>
      )}
    </Svg>
  );
};

// ------------------------------------------------------------------ moment A geometry
const BH = 840;
const BW = (BH * meta.a.w) / meta.a.h; // 469
const BX = 1260 - BW / 2; // 1025.5
const BY = 140;
export const A_BOX = {x: BX, y: BY, w: BW, h: BH};
const PUSH_O = {x: 1260, y: 980}; // push anchored at her feet on the floor axis
// Slow push 1.000 → 1.025 over 20.457–22.765 (linear), held afterwards.
export const aPush = (t: number) => 1 + 0.025 * prog(t, 20.457, 22.765);
const S = (nx: number, ny: number): [number, number] => [BX + nx * BW, BY + ny * BH];
const pushed = ([x, y]: [number, number], k: number): [number, number] => [PUSH_O.x + (x - PUSH_O.x) * k, PUSH_O.y + (y - PUSH_O.y) * k];

const quad = (a: number[], c: number[], b: number[]) => {
  const [x0, y0] = S(a[0], a[1]), [cx, cy] = S(c[0], c[1]), [x1, y1] = S(b[0], b[1]);
  return `M ${r2(x0)} ${r2(y0)} Q ${r2(cx)} ${r2(cy)} ${r2(x1)} ${r2(y1)}`;
};
const bookPath = () => {
  const {cx, cy, w, h, rot} = FIG.book;
  const [x, y] = S(cx, cy);
  const hw = (w * BW) / 2, hh = (h * BH) / 2, a = (rot * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const pts: [number, number][] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  return polyPath(pts, true);
};
const CONSTRUCT: string[] = (() => {
  const h = FIG.head;
  const [hx, hy] = S(h.cx, h.cy);
  const d = FIG.dress;
  return [
    circlePath(hx, hy, h.r * BW),
    quad(FIG.hairL.from, FIG.hairL.ctrl, FIG.hairL.to),
    quad(FIG.hairR.from, FIG.hairR.ctrl, FIG.hairR.to),
    linePath(...S(FIG.shoulders.from[0], FIG.shoulders.from[1]), ...S(FIG.shoulders.to[0], FIG.shoulders.to[1])),
    polyPath([S(d.apex[0], d.apex[1]), S(d.right[0], d.right[1]), S(d.left[0], d.left[1])], true),
    bookPath(),
  ];
})();

// Plot time per primitive: 6 frames each (as in shot 3), 0.5-frame stagger, so all
// six are on her before the scan starts at 19.30.
const CON_DUR = 6 / FPS;
const T_CON = 19.073; // b41
const T_SCAN = 19.3;
const T_MID = 19.765; // scan turns
const T_UP = 20.457; // b44, scan-up done
const T_EXIT = 22.765; // b49
const T_CUTF = 683; // flat fills cut out on this frame
const T_PTS = 23.226; // b50
const FLOOR = {y: 980, x0: 960, x1: 1560};

// Feature anchors verified on the processed cutout (public/char/a_flat.png).
const FEAT = {
  flower: [0.584, 0.047],
  ribbon: [0.51, 0.205], // black collar cravat
  book: [0.337, 0.263],
  hair: [0.18, 0.456],
  sun: [0.157, 0.775], // white sunburst on the black panel
};
type Lab = {tb: number; side: 'R' | 'L'; y: number; key: string; val: string; at: number[]};
const LABELS: Lab[] = [
  {tb: beat(44), side: 'R', y: 180, key: 'ornament', val: 'flower', at: FEAT.flower},
  {tb: beat(45), side: 'R', y: 340, key: 'ribbon', val: 'black', at: FEAT.ribbon},
  {tb: beat(46), side: 'L', y: 360, key: 'book', val: 'closed', at: FEAT.book},
  {tb: beat(47), side: 'L', y: 520, key: 'hair.color', val: '#D97757', at: FEAT.hair},
  {tb: beat(48), side: 'L', y: 744, key: 'skirt.motif', val: 'sun', at: FEAT.sun},
];
const LFS = 22, LADV = 0.6 * LFS;

const Label: React.FC<{l: Lab; t: number; k: number}> = ({l, t, k}) => {
  if (t < l.tb) return null;
  const full = `${l.key} = ${l.val}`;
  const out = prog(t, T_EXIT, T_EXIT + 6 / FPS, ease.inOutCubic); // un-plot
  const typeIn = prog(t, l.tb, l.tb + 5 / FPS);
  const n = Math.round(full.length * Math.min(typeIn, 1 - out));
  const shown = full.slice(0, n);
  const tw = full.length * LADV;
  const midY = l.y - 7;
  const textX = l.side === 'R' ? 1560 : 940 - tw;
  const checkX = textX + tw + 12;
  // leader: node → 40 px horizontal → label
  const [nx, ny] = pushed(S(l.at[0], l.at[1]), k);
  const lx0 = l.side === 'R' ? 1560 - 12 : checkX + 14 + 12;
  const lx1 = l.side === 'R' ? lx0 - 40 : lx0 + 40;
  const lead = polyPath([
    [nx, ny],
    [lx1, midY],
    [lx0, midY],
  ]);
  const lp = Math.min(prog(t, l.tb, l.tb + 5 / FPS, ease.inOutCubic), 1 - out);
  const ck = Math.min(prog(t, l.tb + 9 / FPS, l.tb + 12 / FPS), 1 - prog(t, T_EXIT, T_EXIT + 2 / FPS)); // checks leave first
  const node = Math.min(prog(t, l.tb, l.tb + 3 / FPS, ease.outExpo), 1 - prog(t, T_EXIT + 3 / FPS, T_EXIT + 6 / FPS));
  const parts = [l.key, ' = ', l.val];
  let used = 0;
  const spans = parts.map((s, i) => {
    const seg = shown.slice(used, used + s.length);
    used += s.length;
    const st = i === 0 ? {fill: K.cream, opacity: O.hi} : i === 1 ? {fill: K.creamDim} : {fill: K.cream};
    return seg ? (
      <tspan key={i} {...st}>
        {seg}
      </tspan>
    ) : null;
  });
  return (
    <g>
      <Plot d={lead} p={lp} color={K.cream} w={1} opacity={O.mid} t={t} pen={out === 0} />
      {node > 0 && <circle cx={r2(nx)} cy={r2(ny)} r={3.5 * node} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} />}
      {shown && (
        <text x={textX} y={l.y} fontFamily={CODE} fontSize={LFS} style={{whiteSpace: 'pre'}}>
          {spans}
        </text>
      )}
      {ck > 0 && <Check x={checkX} y={l.y - 3} p={ck} />}
    </g>
  );
};

const MomentA: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const k = aPush(t);
  // --- scan line
  const yDown = lerp(140, 980, prog(t, T_SCAN, T_MID));
  const yUp = lerp(980, 140, prog(t, T_MID, T_UP));
  const yScan = t < T_MID ? yDown : yUp;
  const grow = prog(t, T_SCAN, T_SCAN + 4 / FPS, ease.outExpo);
  const scanO = 1 - prog(t, T_UP, T_UP + 6 / FPS);
  const showScan = t >= T_SCAN && scanO > 0;
  // --- image clips (px in the 840-tall box)
  const flatOn = t >= T_MID && frame < T_CUTF;
  const flatTop = flatOn ? yUp - BY : BH;
  let linesBot = BH;
  if (t >= T_SCAN && t < T_MID) linesBot = 980 - yDown;
  else if (t >= T_MID && frame < T_CUTF) linesBot = 980 - yUp;
  else if (frame >= T_CUTF) linesBot = 0;
  const linesO = 1 - prog(t, T_PTS, T_PTS + 3 / FPS);
  // --- construction primitives and floor axis
  const conO = lerp(O.mid, O.lo, prog(t, T_UP, T_UP + 6 / FPS));
  const conOut = prog(t, T_PTS, T_PTS + 8 / FPS, ease.inOutCubic);
  const axP = Math.min(prog(t, T_CON, T_CON + 8 / FPS, ease.inOutCubic), 1 - conOut);
  const axX = lerp(FLOOR.x0, FLOOR.x1, axP);
  // --- flower spark overlay
  const [fx, fy] = pushed(S(FEAT.flower[0], FEAT.flower[1]), k);
  const sparkIn = prog(t, T_UP, T_UP + 6 / FPS, ease.outExpo);
  const sparkOut = 1 - prog(t, T_EXIT, T_EXIT + 6 / FPS, ease.inCubic);
  const sparkG = Math.min(sparkIn, sparkOut);
  const sparkRot = beatSteps(t, T_UP - 0.01);
  // --- the pen dot parked at the top of the box, then riding the scan line out
  const dotP = prog(t, GLIDE.a, GLIDE.b, ease.inOutCubic);
  const showDot = t > GLIDE.a && t < T_SCAN + 4 / FPS;
  const dot = t < T_SCAN ? {x: lerp(ME_C.x, GLIDE.to.x, dotP), y: lerp(ME_C.y, GLIDE.to.y, dotP)} : {x: GLIDE.to.x, y: yScan};
  const tr = `translate(${PUSH_O.x} ${PUSH_O.y}) scale(${k}) translate(${-PUSH_O.x} ${-PUSH_O.y})`;
  const imgStyle: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'};
  return (
    <>
      {t >= T_SCAN - 0.2 && (
        <div
          style={{
            position: 'absolute',
            left: BX,
            top: BY,
            width: BW,
            height: BH,
            transform: `scale(${k})`,
            transformOrigin: `${PUSH_O.x - BX}px ${PUSH_O.y - BY}px`,
          }}
        >
          <Img src={staticFile('char/a_flat.png')} style={{...imgStyle, clipPath: `inset(${r2(Math.min(BH, flatTop))}px 0 0 0)`, opacity: flatOn ? 1 : 0}} />
          <Img src={staticFile('char/a_lines.png')} style={{...imgStyle, clipPath: `inset(0 0 ${r2(Math.min(BH, linesBot))}px 0)`, opacity: linesBot >= BH ? 0 : linesO}} />
        </div>
      )}
      <Svg>
        <g transform={tr}>
          {CONSTRUCT.map((d, i) => {
            const a = T_CON + (0.5 * i) / FPS;
            const pin = prog(t, a, a + CON_DUR, ease.inOutCubic);
            const p = Math.min(pin, 1 - conOut);
            // six faint construction strokes plot together: no pen heads (they would
            // read as loose orange dots); the floor axis and the glide dot carry the pen
            return <Plot key={i} d={d} p={p} color={K.cream} w={1} opacity={conO} t={t} pen={false} />;
          })}
          {axP > 0 && (
            <>
              <path d={linePath(FLOOR.x0, FLOOR.y, axX, FLOOR.y)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
              {Array.from({length: 11}, (_, i) => FLOOR.x0 + 60 * i)
                .filter((x) => x <= axX + 0.01)
                .map((x) => (
                  <path key={x} d={linePath(x, FLOOR.y, x, FLOOR.y + 6)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
                ))}
              {axP < 1 && conOut === 0 && <PenHead x={axX} y={FLOOR.y} t={t} />}
            </>
          )}
        </g>
        {sparkG > 0 && (
          <>
            {/* bg knockout under the outline keeps it crisp over her orange hair */}
            <Spark x={fx} y={fy} R={26} outline w={3.5} color={K.bg} grow={sparkG} hub={sparkG} rot={sparkRot} />
            <Spark x={fx} y={fy} R={26} outline w={1.5} grow={sparkG} hub={sparkG} rot={sparkRot} />
          </>
        )}
        {LABELS.map((l, i) => (
          <Label key={i} l={l} t={t} k={k} />
        ))}
        {showScan && (
          <g opacity={scanO}>
            <path d={linePath(lerp(GLIDE.to.x, 1000, grow), yScan, lerp(GLIDE.to.x, 1520, grow), yScan)} stroke={K.orange} strokeWidth={2} />
            <text x={1528} y={yScan + 5} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={grow}>
              {`y ${String(Math.round(yScan)).padStart(4, '0')}`}
            </text>
          </g>
        )}
        {showDot && <PenHead x={dot.x} y={dot.y} t={t} />}
      </Svg>
    </>
  );
};

// ------------------------------------------------------------------ export
export const Execute: React.FC = () => {
  const {t, frame} = useT();
  if (t < SEND || t > 23.7) return null;
  if (t < CUT) return <Flight t={t} />;
  return (
    <>
      {t < GLIDE.a + 0.001 && <Title t={t} frame={frame} />}
      {t > GLIDE.a && <MomentA t={t} frame={frame} />}
    </>
  );
};
