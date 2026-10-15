// C14–C18 (177.246–193.981 s): character moment 7 (`read`), the two function
// panels, the heart equation, the final moment (`sit` inside the heart) and the
// heart beating on as data. Spec: docs/design_full.md C14–C18.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {CODE, ease, FPS, K, lerp, MATH, O, prog} from '../core';
import {Check, linePath, PenHead, Svg} from '../geo';
import {
  cumLen,
  F,
  F_CUT18,
  HC,
  HEART_CLIP_1,
  HEART_PTS,
  heartbeat,
  heartClipD,
  heartUpTo,
  heartXY,
  hX,
  hY,
  KV,
  Pt,
  r2,
  scalePts,
  Stroke,
  T_UNHEART,
  TAU,
  typed,
} from './C2_lib';
import {F_CUT14, PANEL, panelX, RB, SB, T_PEN0, T_PEN1} from './C2_points';

// ------------------------------------------------------------------ C14 timing
const F_DOT = 5320; // the pen dot is ours from here (C1 parks it at (1030, 110))
const T_AX = 177.3; // floor axis
const T_SCAN = 177.367; // b384: scan down
const T_MID = 177.829; // scan up
const T_UP = 178.29; // b386: scan done, first leader
const F_KW14 = 5398;
const FLOOR = {y: 670, x0: 1000, x1: 1480};
const SCAN = {x0: 1030, x1: 1450, y0: 110, y1: 670};
export const readPush = (t: number) => 1 + 0.02 * prog(t, 178.29, 180.857);
const PC = {x: 1240, y: 390}; // push centre
const pushed = ([x, y]: Pt, k: number): Pt => [PC.x + (x - PC.x) * k, PC.y + (y - PC.y) * k];
const RS = (nx: number, ny: number): Pt => [RB.x + nx * RB.w, RB.y + ny * RB.h];

// Anchors measured on public/char/read_flat.png (the design's are estimates).
const A_BOOK: Pt = [0.317, 0.214]; // the open book's left (cream) page
const A_EYES: Pt = [0.478, 0.099]; // between the lowered eyes
const A_PAGE: Pt = [0.446, 0.241]; // the printed emblem on the right page
// Labels appear in beat order; their rows follow the nodes' top-to-bottom
// order (eyes, book, page) so no two leaders cross.
type Lab = {tb: number; row: number; key: string; val: string; at: Pt};
const LABS: Lab[] = [
  {tb: 178.29, row: 250, key: 'book', val: 'open', at: A_BOOK},
  {tb: 178.752, row: 190, key: 'eyes', val: 'lowered', at: A_EYES},
  {tb: 179.213, row: 310, key: 'subject', val: '"love"', at: A_PAGE},
];
const LADV = 0.6 * 22;
const LBL_R = 990; // labels right-aligned here

// The small heart (C16 curve at s = 1) hung from its notch.
const SMALL_HEART: Pt[] = Array.from({length: 97}, (_, j) => {
  const tp = (TAU * j) / 96;
  return [hX(tp), 5 - hY(tp)];
});

const Leader: React.FC<{l: Lab; t: number; k: number}> = ({l, t, k}) => {
  if (t < l.tb) return null;
  const tk = F(F_KW14);
  const ret = prog(t, tk, tk + 8 / FPS, ease.inOutCubic);
  const full = `${l.key} = ${l.val}`;
  const tw = full.length * LADV;
  const n = Math.min(typed(full.length, l.tb, t, 5), Math.round(full.length * (1 - ret)));
  const midY = l.row - 7;
  const checkX = LBL_R + 12;
  const lx0 = checkX + 14 + 12, lx1 = lx0 + 40;
  const node = pushed(RS(l.at[0], l.at[1]), k);
  const pts: Pt[] = [node, [lx1, midY], [lx0, midY]];
  const lp = Math.min(prog(t, l.tb, l.tb + 5 / FPS, ease.inOutCubic), 1 - ret);
  const ck = Math.min(prog(t, l.tb + 9 / FPS, l.tb + 12 / FPS), 1 - prog(t, tk, tk + 2 / FPS));
  const ns = Math.min(prog(t, l.tb, l.tb + 3 / FPS, ease.outExpo), 1 - prog(t, tk + 8 / FPS, tk + 11 / FPS));
  return (
    <g>
      <Stroke pts={pts} p={lp} w={1} opacity={O.mid} t={t} pen={ret === 0} />
      {ns > 0 && <circle cx={r2(node[0])} cy={r2(node[1])} r={3.5 * ns} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} />}
      <KV x={LBL_R - tw} y={l.row} k={l.key} v={l.val} n={n} />
      {ck > 0 && <Check x={checkX} y={l.row - 3} p={ck} />}
    </g>
  );
};

// Character moment 7 (Char layer): floor axis, two scans, leaders, small heart.
export const MomentRead: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < 5317 || frame > F_CUT14 + 10) return null;
  const k = readPush(t);
  const yDown = lerp(SCAN.y0, SCAN.y1, prog(t, T_SCAN, T_MID));
  const yUp = lerp(SCAN.y1, SCAN.y0, prog(t, T_MID, T_UP));
  const yScan = t < T_MID ? yDown : yUp;
  const grow = prog(t, T_SCAN, T_SCAN + 4 / FPS, ease.outExpo);
  const scanO = 1 - prog(t, T_UP, T_UP + 6 / FPS);
  const showScan = t >= T_SCAN && scanO > 0;
  // image clips (px in the 560-tall box)
  const flatOn = t >= T_MID && frame < F_CUT14;
  const flatTop = flatOn ? yUp - RB.y : RB.h;
  let linesBot = RB.h;
  if (t >= T_SCAN && t < T_MID) linesBot = SCAN.y1 - yDown;
  else if (t >= T_MID && frame < F_CUT14) linesBot = SCAN.y1 - yUp;
  else if (frame >= F_CUT14) linesBot = 0;
  const linesO = frame >= F_CUT14 ? 1 - Math.min(1, (frame - F_CUT14 + 1) / 3) : 1;
  const showImg = t >= T_SCAN && (flatOn || (linesBot < RB.h && linesO > 0));
  // floor axis (plotted with the push)
  const axIn = prog(t, T_AX, T_AX + 8 / FPS, ease.inOutCubic);
  const axOut = 1 - prog(t, F(F_CUT14), F(F_CUT14) + 8 / FPS, ease.inOutCubic);
  const axP = Math.min(axIn, axOut);
  const axX = lerp(FLOOR.x0, FLOOR.x1, axP);
  // the pen dot: parked at the scan start, then riding the line out for 4 frames
  const showDot = frame >= F_DOT && t < T_SCAN + 4 / FPS;
  const dotY = t < T_SCAN ? SCAN.y0 : yScan;
  // small heart on the book
  const tk = F(F_KW14);
  const shP = prog(t, tk, tk + 6 / FPS);
  const shO = 1 - prog(t, F(F_CUT14), F(F_CUT14) + 5 / FPS);
  const bk = pushed(RS(A_BOOK[0], A_BOOK[1]), k);
  const tr = `translate(${PC.x} ${PC.y}) scale(${r2(k * 10000) / 10000}) translate(${-PC.x} ${-PC.y})`;
  const img: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'};
  return (
    <>
      {showImg && (
        <div
          style={{
            position: 'absolute',
            left: RB.x,
            top: RB.y,
            width: RB.w,
            height: RB.h,
            transform: `scale(${k})`,
            transformOrigin: `${PC.x - RB.x}px ${PC.y - RB.y}px`,
          }}
        >
          <Img src={staticFile('char/read_flat.png')} style={{...img, clipPath: `inset(${r2(Math.min(RB.h, flatTop))}px 0 0 0)`, opacity: flatOn ? 1 : 0}} />
          <Img
            src={staticFile('char/read_lines.png')}
            style={{...img, clipPath: `inset(0 0 ${r2(Math.max(0, Math.min(RB.h, linesBot)))}px 0)`, opacity: linesBot >= RB.h ? 0 : linesO}}
          />
        </div>
      )}
      <Svg>
        {axP > 0 && (
          <g transform={tr}>
            <path d={linePath(FLOOR.x0, FLOOR.y, axX, FLOOR.y)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
            {Array.from({length: 9}, (_, i) => FLOOR.x0 + 60 * i)
              .filter((x) => x <= axX + 0.01)
              .map((x) => (
                <path key={x} d={linePath(x, FLOOR.y, x, FLOOR.y + 6)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
              ))}
            {axIn < 1 && <PenHead x={axX} y={FLOOR.y} t={t} />}
          </g>
        )}
        {frame < F_CUT14 && LABS.map((l, i) => <Leader key={i} l={l} t={t} k={k} />)}
        {shP > 0 && shO > 0 && (
          <g transform={`translate(${r2(bk[0])} ${r2(bk[1])})`}>
            <Stroke pts={SMALL_HEART} p={shP} color={K.orange} w={1.5} opacity={shO} t={t} />
          </g>
        )}
        {showScan && (
          <g opacity={scanO}>
            <path d={linePath(SCAN.x0, yScan, lerp(SCAN.x0, SCAN.x1, grow), yScan)} stroke={K.orange} strokeWidth={2} />
            <text x={SCAN.x1 + 8} y={yScan + 5} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={grow}>
              {`y ${String(Math.round(yScan)).padStart(4, '0')}`}
            </text>
          </g>
        )}
        {showDot && <PenHead x={SCAN.x0} y={dotY} t={t} />}
      </Svg>
    </>
  );
};

// ------------------------------------------------------------------ C15–C16 panels (stage)
const NC = 360;
const curve = (f: (tp: number) => number): Pt[] => Array.from({length: NC + 1}, (_, j) => [panelX((TAU * j) / NC), f((TAU * j) / NC)]);
const fXs = (tp: number) => PANEL.xc - PANEL.xk * hX(tp);
const fYs = (tp: number) => PANEL.yc - PANEL.yk * hY(tp);
const CURVE_X = curve(fXs), CURVE_Y = curve(fYs);
const CX_C = cumLen(CURVE_X), CY_C = cumLen(CURVE_Y);
const upTo = (pts: Pt[], f: (tp: number) => number, tp: number): Pt[] => {
  const n = Math.min(NC, Math.floor((tp / TAU) * NC));
  return [...pts.slice(0, n + 1), [panelX(tp), f(tp)]];
};
const T_AXX = 180.95, T_AXY = 181.033, T_FLBL = 181.3;
const F_KW15 = 5509;
const T_H0 = 184.54; // heart plot from t = 0
const F_KW16 = 5630; // heart closes
export const heartParam = (t: number) => TAU * prog(t, T_H0, F(F_KW16));
const TICKS = [0, 1, 2].map((i) => ({x: 180 + 300 * i, lab: ['0', 'π', '2π'][i]}));
const LBL_X = 'x(t) = 16 sin³t';
const LBL_Y = 'y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t';

const Axis: React.FC<{y: number; ly: number; t0: number; un: number; t: number}> = ({y, ly, t0, un, t}) => {
  const pin = prog(t, t0, t0 + 8 / FPS, ease.inOutCubic);
  const p = Math.min(pin, un);
  if (p <= 0) return null;
  const x = lerp(PANEL.x0, PANEL.x1, p);
  return (
    <g>
      <path d={linePath(PANEL.x0, y, x, y)} stroke={K.cream} strokeWidth={1} opacity={O.lo} />
      {TICKS.filter((k) => k.x <= x + 0.01).map((k) => {
        const tt = t0 + (8 / FPS) * ((k.x - PANEL.x0) / (PANEL.x1 - PANEL.x0));
        const lo = Math.min(prog(t, tt, tt + 4 / FPS), un);
        return (
          <g key={k.x}>
            <path d={linePath(k.x, y, k.x, y + 6)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
            <text x={k.x} y={ly} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={26} fill={K.cream} opacity={O.hi * lo}>
              {k.lab}
            </text>
          </g>
        );
      })}
      {pin < 1 && <PenHead x={x} y={y} t={t} />}
    </g>
  );
};

export const Panels: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < T_AXX || frame > F_KW16 + 8) return null;
  const un = 1 - prog(t, F(F_KW16), F(F_KW16) + 6 / FPS, ease.inOutCubic);
  // function labels
  const nl = (s: string) => Math.min(typed(s.length, T_FLBL, t, 6), Math.round(s.length * un));
  // curves: plotted 182.10–183.50 (easeInOutSine), flash on f5509
  const u = ease.inOutSine(prog(t, T_PEN0, T_PEN1));
  const tp = TAU * u;
  const flash = frame >= F_KW15 && frame < F_KW15 + 3;
  const cw = flash ? 3 : 2, cc = flash ? K.orange : K.cream;
  const plotting = t >= T_PEN0 && t < T_PEN1;
  // C16: the panel pens follow the heart pen
  const h16 = t >= T_H0 && frame < F_KW16;
  const tp16 = heartParam(t);
  const hp = heartXY(tp16);
  const pX: Pt = [panelX(tp16), fXs(tp16)], pY: Pt = [panelX(tp16), fYs(tp16)];
  return (
    <Svg>
      <Axis y={PANEL.xc} ly={345} t0={T_AXX} un={un} t={t} />
      <Axis y={PANEL.yc} ly={600} t0={T_AXY} un={un} t={t} />
      {t >= T_FLBL && (
        <g fontFamily={MATH} fontStyle="italic" fontSize={30} fill={K.cream} opacity={O.hi}>
          <text x={180} y={128}>{LBL_X.slice(0, nl(LBL_X))}</text>
          <text x={180} y={395}>{LBL_Y.slice(0, nl(LBL_Y))}</text>
        </g>
      )}
      {t >= T_PEN0 &&
        (plotting ? (
          <>
            <Stroke pts={upTo(CURVE_X, fXs, tp)} w={2} pen={false} />
            <Stroke pts={upTo(CURVE_Y, fYs, tp)} w={2} pen={false} />
            <PenHead x={panelX(tp)} y={fXs(tp)} t={t} />
            <PenHead x={panelX(tp)} y={fYs(tp)} t={t} />
          </>
        ) : (
          <>
            <Stroke pts={CURVE_X} c={CX_C} p={un} w={cw} color={cc} pen={false} />
            <Stroke pts={CURVE_Y} c={CY_C} p={un} w={cw} color={cc} pen={false} />
          </>
        ))}
      {h16 && (
        <>
          <path d={linePath(pX[0], pX[1], hp[0], hp[1])} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
          <path d={linePath(pY[0], pY[1], hp[0], hp[1])} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
          <PenHead x={pX[0]} y={pX[1]} t={t} />
          <PenHead x={pY[0]} y={pY[1]} t={t} />
        </>
      )}
      {frame >= F_KW16 && un > 0 && (
        <>
          {/* leaders retract into the closed heart's notch */}
          <path d={linePath(hp[0], hp[1], lerp(hp[0], PANEL.x1, un), lerp(hp[1], PANEL.xc, un))} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
          <path d={linePath(hp[0], hp[1], lerp(hp[0], PANEL.x1, un), lerp(hp[1], fYs(TAU), un))} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
        </>
      )}
    </Svg>
  );
};

// ------------------------------------------------------------------ C16–C19 the heart group (Char layer)
const T_GLIDE0 = 187.7, T_GLIDE1 = 188.3;
const T_IRIS0 = 188.483, T_IRIS1 = 189.05;
const T_INNER = 189.746; // "I am trapped"
const T_CREAM = 192.135; // b416
const INNER_PTS = scalePts(HEART_PTS, 0.93);
const INNER_C = cumLen(INNER_PTS);
const HEART_C = cumLen(HEART_PTS);

export const HeartGroup: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < T_H0 || t > T_UNHEART + 12 / FPS) return null;
  const s = heartbeat(t);
  const els: React.ReactNode[] = [];
  const add = (n: React.ReactNode) => els.push(<React.Fragment key={els.length}>{n}</React.Fragment>);
  // --- the heart curve
  if (frame < F_KW16) {
    const tp = heartParam(t);
    add(<Stroke pts={heartUpTo(tp)} w={2} pen={false} />);
    if (tp > 0) add(<PenHead x={heartXY(tp)[0]} y={heartXY(tp)[1]} t={t} />);
  } else if (t < T_UNHEART) {
    const c = prog(t, T_CREAM, T_CREAM + 6 / FPS);
    if (c < 1) add(<Stroke pts={HEART_PTS} c={HEART_C} w={lerp(3, 2, c)} color={K.orange} opacity={1 - c} pen={false} closed />);
    if (c > 0) add(<Stroke pts={HEART_PTS} c={HEART_C} w={2} opacity={c} pen={false} closed />);
  } else {
    const p = 1 - prog(t, T_UNHEART, T_UNHEART + 10 / FPS, ease.inOutCubic);
    add(<Stroke pts={HEART_PTS} c={HEART_C} p={p} w={2} pen={false} />);
  }
  // --- inner heart ("I am trapped"): plots in 10 frames, un-plots at b416
  if (t >= T_INNER) {
    const p = Math.min(prog(t, T_INNER, T_INNER + 10 / FPS, ease.inOutCubic), 1 - prog(t, T_CREAM, T_CREAM + 8 / FPS, ease.inOutCubic));
    add(<Stroke pts={INNER_PTS} c={INNER_C} p={p} w={1} color={K.orange} opacity={O.mid} t={t} pen={t < T_CREAM} />);
  }
  // --- the iris
  const k = ease.outExpo(prog(t, T_IRIS0, T_IRIS1));
  if (t >= T_IRIS0 && k > 0 && k < 0.98) add(<Stroke pts={scalePts(HEART_PTS, k)} w={1.5} opacity={O.mid} pen={false} closed />);
  // --- the pen dot: notch → iris centre, then it opens the iris
  if (frame >= F_KW16) {
    const g = prog(t, T_GLIDE0, T_GLIDE1, ease.inOutCubic);
    const ds = 1 - prog(t, T_IRIS0, T_IRIS0 + 4 / FPS);
    if (ds > 0) add(<PenHead x={HC.x} y={lerp(264, HC.y, g)} t={t} scale={ds} />);
  }
  // --- her art, clipped to (k-heart ∩ heart)
  const artOn = t >= T_IRIS0 && k > 0.001 && frame < F_CUT18 + 3;
  const linesO = frame >= F_CUT18 ? 1 - (frame - F_CUT18 + 1) / 3 : 0;
  const img: React.CSSProperties = {position: 'absolute', left: SB.x, top: SB.y, width: SB.w, height: SB.h};
  const full: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1920, height: 1080};
  return (
    <div style={{...full, transform: s !== 1 ? `scale(${r2(s * 10000) / 10000})` : undefined, transformOrigin: `${HC.x}px ${HC.y}px`}}>
      {artOn && (
        <div style={{...full, clipPath: `path('${HEART_CLIP_1}')`}}>
          <div style={{...full, clipPath: k < 0.999 ? `path('${heartClipD(k)}')` : undefined}}>
            {frame < F_CUT18 ? (
              <Img src={staticFile('char/sit_flat.png')} style={img} />
            ) : (
              <Img src={staticFile('char/sit_lines.png')} style={{...img, opacity: Math.max(0, linesO)}} />
            )}
          </div>
        </div>
      )}
      <Svg>{els}</Svg>
    </div>
  );
};

// ------------------------------------------------------------------ C17–C18 the free "you" circle (stage)
const T_YOU = 188.483, T_YOU_OUT = 193.058;
const YOU_CIRCLE: Pt[] = Array.from({length: 65}, (_, j) => [12 * Math.sin((TAU * j) / 64), -12 * Math.cos((TAU * j) / 64)]);
export const YouCircle: React.FC<{t: number}> = ({t}) => {
  if (t < T_YOU || t > T_YOU_OUT + 7 / FPS) return null;
  const tau = t - T_YOU;
  const x = 600 + 140 * Math.sin(0.9 * tau), y = 330 + 70 * Math.sin(1.4 * tau);
  const p = Math.min(prog(t, T_YOU, T_YOU + 6 / FPS, ease.inOutCubic), 1 - prog(t, T_YOU_OUT, T_YOU_OUT + 6 / FPS, ease.inOutCubic));
  return (
    <Svg>
      <g transform={`translate(${r2(x)} ${r2(y)})`}>
        <Stroke pts={YOU_CIRCLE} p={p} w={1.5} t={t} pen={t < T_YOU_OUT} />
      </g>
    </Svg>
  );
};
