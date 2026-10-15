// S0 intro, 0–16.0 s: the chat column on the left, the stage on the right,
// and the orange dot's journey (power line → shield → pieces → object →
// parameters → globe → title). The dot itself is drawn by S0.tsx.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {beat, clamp01, ease, env, FPS, K, lerp, prog, pulse} from '../../v3/core';
import {circlePath, Plot, polyPath, Spark, Svg} from '../../v3/geo';
import {CODE} from '../fonts';
import {TokLine, tokenize} from '../shell/Code';
import {Composer} from '../shell/Composer';
import {KwCode, kwFit} from '../shell/KwCode';
import {Caret, r2, rrPath} from '../shell/lib';
import {Transcript} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {
  bookCorners,
  cablePath,
  circPieceD,
  dotPos,
  ellLeft,
  figAt,
  figBox,
  FigGeo,
  GLIDE,
  GLOBE,
  GLOBE_D,
  GLOBE_T,
  HC,
  HEX_BOTTOM,
  HEX_D,
  hexPath,
  n2,
  ORBIT,
  orbitPsi,
  orbitPt,
  PC,
  PIECE_T,
  PLUG_IN,
  PS,
  PT,
  PW,
  PW_BAR,
  PW_CLOSE,
  PW_FIELDS,
  PW_ROWS,
  PW_TXT,
  PW_TYPE,
  SHRINK,
  SOCKET,
  spinDeg,
  sqPieceD,
  TITLE,
  TITLE_TYPE,
  triPieceD,
} from './S0_geo';
import {COL, COMP0, INTRO_ENTRIES, INTRO_PROMPTS, SPARK0, T} from './s0.data';

const Fr = (f: number) => f / FPS;
const KW_X = 1330, KW_Y = 190, KW_W = 1010;
const kwSize = (pre: string, kw: string, post: string) => kwFit(pre, kw, post, KW_W, 104);

// ------------------------------------------------------------------ stage pieces
const Cable: React.FC<{t: number}> = ({t}) => {
  if (t < T.send0) return null;
  const end = t < T.click ? dotPos(t) : PLUG_IN;
  const d = cablePath(end);
  const p = prog(t, T.send0, T.send0 + 0.26, ease.outCubic);
  const live = t >= T.click;
  // current: an orange pulse runs from the left edge into the socket
  const cur = prog(t, T.click + 0.02, T.click + 0.42, ease.inOutCubic);
  return (
    <g>
      <Plot d={d} p={p} color={K.cream} w={1.5} opacity={live ? 0.45 : 0.7} pen={false} />
      {cur > 0 && cur < 1 && <path d={d} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="round" pathLength={1000} strokeDasharray="120 2000" strokeDashoffset={n2(120 - 1120 * cur)} />}
    </g>
  );
};

const Socket: React.FC<{t: number}> = ({t}) => {
  const p = prog(t, 0.18, 0.5, ease.inOutCubic);
  if (p <= 0) return null;
  const {cx, cy, w, h} = SOCKET;
  const x = cx - w / 2, y = cy - h / 2;
  const f = (t - T.click) * FPS;
  const flash = f >= 0 && f < 3;
  const on = t >= T.click;
  const rays = f >= 0 && f < 8 ? f / 8 : -1;
  return (
    <g>
      <Plot d={rrPath(x, y, w, h, 10).replace(/ Z$/, '')} p={p} color={flash ? K.orange : K.cream} w={flash ? 2 : 1.5} opacity={flash ? 1 : 0.7} pen={false} />
      <g opacity={clamp01((p - 0.6) / 0.4)} stroke={K.cream} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round">
        <path d={`M ${cx - 12} ${cy - 9} L ${cx - 12} ${cy + 5} M ${cx + 12} ${cy - 9} L ${cx + 12} ${cy + 5}`} />
      </g>
      {on && <circle cx={x + w - 10} cy={y + 10} r={2.5} fill={K.orange} />}
      {rays >= 0 &&
        [-60, -30, 30, 60].map((a) => {
          const r0 = 10 + 18 * ease.outCubic(rays), r1 = r0 + 10 * (1 - rays);
          const rad = ((a + 90) * Math.PI) / 180;
          const ox = PLUG_IN[0], oy = PLUG_IN[1];
          return <path key={a} d={`M ${n2(ox + Math.cos(rad) * r0)} ${n2(oy + Math.sin(rad) * r0)} L ${n2(ox + Math.cos(rad) * r1)} ${n2(oy + Math.sin(rad) * r1)}`} stroke={K.orange} strokeWidth={1.5} strokeLinecap="round" opacity={1 - rays} />;
        })}
    </g>
  );
};

// the feed line from the socket up to the shield, then the shield itself
const Shield: React.FC<{t: number}> = ({t}) => {
  if (t < 1.74 || t > T.pieces + Fr(10)) return null;
  const top = SOCKET.cy - SOCKET.h / 2;
  const out = prog(t, T.pieces, T.pieces + Fr(8), ease.inOutCubic);
  const dy = t < T.hex0 ? Math.min(top, dotPos(t)[1]) : HEX_BOTTOM[1];
  const feedTop = lerp(dy, top, out);
  const f = (t - T.PROT) * FPS;
  const hexP = t < T.PROT ? prog(t, T.hex0, T.PROT) : 1 - out;
  const rot = 30 * prog(t, T.hexRot, T.hexRot + Fr(8), ease.outCubic);
  const outer = t >= T.PROT ? 1 - out : 0;
  return (
    <g>
      {feedTop < top && <path d={`M ${HC[0]} ${top} L ${HC[0]} ${n2(feedTop)}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1} />}
      <Plot d={HEX_D} p={hexP} color={f >= 0 && f < 3 ? K.orange : K.cream} w={f >= 0 && f < 3 ? 2 : 1.5} opacity={f >= 0 && f < 3 ? 1 : 0.7} pen={false} />
      {outer > 0 && (
        <g transform={`rotate(${n2(rot)} ${HC[0]} ${HC[1]})`}>
          <Plot d={hexPath(200)} p={outer} color={K.orange} w={2} pen={false} />
          <Plot d={hexPath(232)} p={outer} color={K.cream} w={1} opacity={0.45} pen={false} />
        </g>
      )}
    </g>
  );
};

const Cross: React.FC<{c: [number, number]; o: number}> = ({c, o}) =>
  o > 0 ? <path d={`M ${c[0] - 6} ${c[1]} L ${c[0] + 6} ${c[1]} M ${c[0]} ${c[1] - 6} L ${c[0]} ${c[1] + 6}`} stroke={K.cream} strokeOpacity={0.45 * o} strokeWidth={1} /> : null;

const figPaths = (g: FigGeo) => ({
  head: circlePath(g.head.c[0], g.head.c[1], g.head.r, -90),
  tri: polyPath(g.tri, true),
  book: polyPath(bookCorners(g.book), true),
});

// three pieces → object F (→ slides left → shrinks onto the globe)
const Pieces: React.FC<{t: number}> = ({t}) => {
  if (t < PIECE_T.circ[0]) return null;
  const labO = 1 - prog(t, GLIDE.t0, GLIDE.t0 + Fr(6));
  const items: {d: string; tt: [number, number]; c: [number, number]; label: string}[] = [
    {d: circPieceD, tt: PIECE_T.circ, c: PC.c, label: 'circle'},
    {d: triPieceD, tt: PIECE_T.tri, c: [PT.apex[0], 560], label: 'triangle'},
    {d: sqPieceD, tt: PIECE_T.sq, c: [PS.x + PS.s / 2, PS.y + PS.s / 2], label: 'square'},
  ];
  if (t < GLIDE.t0) {
    return (
      <g>
        {items.map((it, i) => {
          const p = prog(t, it.tt[0], it.tt[1], ease.inOutSine);
          const done = t >= it.tt[1];
          const nl = Math.ceil(it.label.length * prog(t, it.tt[1], it.tt[1] + Fr(5)));
          return (
            <g key={i}>
              <Plot d={it.d} p={p} color={K.cream} w={1.5} pen={false} />
              <Cross c={it.c} o={done ? labO : 0} />
              {done && (
                <text x={it.c[0]} y={652} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={labO}>
                  {it.label.slice(0, nl)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }
  const g = figAt(t);
  const P = figPaths(g);
  const f = (t - T.OBJ) * FPS;
  const hot = f >= 0 && f < 3;
  const back = f >= 3 && f < 9 ? 1 - (f - 3) / 6 : 0;
  const col = hot ? K.orange : K.cream;
  const w = hot ? 2 : 1.5 + 0.5 * back;
  // dashed bounding box + label (object #0001)
  const bo = t >= T.OBJ ? 1 - prog(t, SHRINK.t0 - 4.2, SHRINK.t0 - 4.0) : 0;
  const bb = figBox(g);
  const pad = 20;
  return (
    <g>
      <path d={P.head} fill="none" stroke={col} strokeWidth={w} />
      <path d={P.tri} fill="none" stroke={col} strokeWidth={w} strokeLinejoin="round" />
      <path d={P.book} fill="none" stroke={col} strokeWidth={w} strokeLinejoin="round" />
      {items.map((it, i) => (
        <g key={i} opacity={labO}>
          <Cross c={it.c} o={1} />
          <text x={it.c[0]} y={652} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim}>
            {it.label}
          </text>
        </g>
      ))}
      {bo > 0 && (
        <g opacity={bo}>
          <rect x={n2(bb.x0 - pad)} y={n2(bb.y0 - pad)} width={n2(bb.x1 - bb.x0 + 2 * pad)} height={n2(bb.y1 - bb.y0 + 2 * pad)} fill="none" stroke={K.cream} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="6 6" />
          <text x={n2(bb.x0 - pad)} y={n2(bb.y1 + pad + 22)} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
            {'object #0001'.slice(0, Math.ceil(12 * prog(t, T.OBJ, T.OBJ + Fr(6))))}
          </text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ params.json
const ParamsBody: React.FC<{t: number}> = ({t}) => {
  const {size, lh, cw} = PW_TXT;
  const base = lh * 0.5 + size * 0.36;
  // highlighted (active) row
  let active = -1;
  PW_FIELDS.forEach((f) => {
    if (t >= f.t - 0.06 && t < f.t + PW_TYPE + 0.2) active = f.row;
  });
  const lit = PW_BAR.n === 0 ? 0 : Math.max(0, Math.min(PW_BAR.n, Math.floor((t - PW_BAR.t0) / PW_BAR.step + 1e-6) + 1));
  const hairDone = t >= PW_FIELDS[0].t + PW_TYPE;
  return (
    <svg width={PW.w} height={PW.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {active >= 0 && (
        <g>
          <rect x={16} y={n2(PW_TXT.y + active * lh)} width={PW.w - 32} height={lh} fill={K.line2} fillOpacity={0.35} />
          <rect x={16} y={n2(PW_TXT.y + active * lh)} width={2} height={lh} fill={K.orange} />
        </g>
      )}
      {PW_ROWS.map((row, i) => {
        const f = PW_FIELDS.find((q) => q.row === i);
        let n = row.length;
        if (f) n = f.col + Math.min(row.length - f.col, Math.max(0, Math.floor(((t - f.t) / PW_TYPE) * (row.length - f.col) + 1e-6)));
        const y = PW_TXT.y + i * lh + base;
        return (
          <g key={i}>
            <text x={24 + 24} y={n2(y)} textAnchor="end" fontFamily={CODE} fontSize={size} fill={K.creamDim} fillOpacity={0.45}>
              {i + 1}
            </text>
            <TokLine toks={tokenize(row, 'json')} n={n} size={size} x={PW_TXT.x} y={y} />
          </g>
        );
      })}
      {/* colour decorator after the hair value, like an editor's swatch */}
      {hairDone && <rect x={PW_TXT.x + PW_ROWS[1].length * cw + 12} y={n2(PW_TXT.y + lh + 9)} width={14} height={14} rx={2} fill={K.orange} />}
      {/* the 12-cell init bar, filling on 16ths and completing on the hit */}
      <text x={24} y={PW_BAR.y + 12} fontFamily={CODE} fontSize={15} fill={K.creamDim}>
        init
      </text>
      {Array.from({length: PW_BAR.n}, (_, k) => {
        const on = k < lit;
        const x = PW_BAR.x + k * (PW_BAR.cw + PW_BAR.gap);
        const hit = t >= T.INIT && t < T.INIT + Fr(3);
        return <rect key={k} x={x} y={PW_BAR.y} width={PW_BAR.cw} height={PW_BAR.h} rx={2} fill={on ? K.orange : 'none'} stroke={on ? K.orange : K.line2} strokeWidth={1.5} opacity={on && !hit && t >= T.INIT ? 0.7 : 1} />;
      })}
      <text x={PW_BAR.x + PW_BAR.n * (PW_BAR.cw + PW_BAR.gap) + 6} y={PW_BAR.y + 12} fontFamily={CODE} fontSize={15} fill={lit >= PW_BAR.n ? K.cream : K.creamDim}>
        {`${lit}/${PW_BAR.n}`}
      </text>
    </svg>
  );
};

// ------------------------------------------------------------------ globe
const Globe: React.FC<{t: number}> = ({t}) => {
  if (t < GLOBE_T.outline[0]) return null;
  const pO = prog(t, GLOBE_T.outline[0], GLOBE_T.outline[1], ease.inOutSine);
  const pE = prog(t, GLOBE_T.eq[0], GLOBE_T.eq[1], ease.inOutSine);
  const pN = prog(t, GLOBE_T.parN[0], GLOBE_T.parN[1], ease.inOutSine);
  const pS = prog(t, GLOBE_T.parS[0], GLOBE_T.parS[1], ease.inOutSine);
  const [cx, cy] = GLOBE.c, R = GLOBE.R;
  const lam = spinDeg(t);
  const mer: React.ReactNode[] = [];
  if (t >= GLOBE_T.spin) {
    for (let k = 0; k < 4; k++) {
      const o = prog(t, GLOBE_T.spin + k * 0.1, GLOBE_T.spin + k * 0.1 + Fr(6));
      if (o <= 0) continue;
      const l = ((lam + 22.5 + 45 * k) * Math.PI) / 180;
      const rx = Math.max(0.5, R * Math.abs(Math.sin(l)));
      const front = Math.cos(l) >= 0;
      mer.push(<ellipse key={k} cx={cx} cy={cy} rx={n2(rx)} ry={R} fill="none" stroke={K.cream} strokeWidth={1} strokeOpacity={(front ? 0.45 : 0.25) * o} />);
    }
  }
  // orbit + satellite trail (the dot is the satellite)
  let orbit: React.ReactNode = null;
  if (t >= T.SIM) {
    const psi = orbitPsi(Math.min(t, T.title0));
    const trail = [1, 0.6, 0.3].map((o, i) => {
      const pts: [number, number][] = [];
      for (let k = 0; k <= 6; k++) pts.push(orbitPt(psi - 4 - i * 17 - (k / 6) * 15));
      return <path key={i} d={polyPath(pts)} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="round" opacity={o * (t < T.title0 ? 1 : 1 - prog(t, T.title0, T.title0 + Fr(6)))} />;
    });
    orbit = (
      <g>
        <ellipse cx={cx} cy={cy} rx={ORBIT.rx} ry={ORBIT.ry} transform={`rotate(${ORBIT.rot} ${cx} ${cy})`} fill="none" stroke={K.cream} strokeOpacity={0.45} strokeWidth={1} />
        {trail}
      </g>
    );
  }
  return (
    <g>
      {mer}
      <Plot d={GLOBE_D.eq} p={pE} color={K.cream} w={1} opacity={0.45} pen={false} />
      <Plot d={GLOBE_D.parN} p={pN} color={K.cream} w={1} opacity={0.45} pen={false} />
      <Plot d={GLOBE_D.parS} p={pS} color={K.cream} w={1} opacity={0.45} pen={false} />
      <Plot d={GLOBE_D.outline} p={pO} color={K.cream} w={1.5} opacity={0.7} pen={false} />
      {orbit}
    </g>
  );
};
void ellLeft;

// ------------------------------------------------------------------ title (typing)
export const TitleTyping: React.FC<{t: number}> = ({t}) => {
  if (t < TITLE_TYPE[0]) return null;
  const s = TITLE.text;
  const n = Math.min(s.length, Math.floor(((t - TITLE_TYPE[0]) / (TITLE_TYPE[1] - TITLE_TYPE[0])) * s.length + 1e-6) + 1);
  const shown = s.slice(0, n) + (t >= T.drop ? ',' : '');
  const typing = n < s.length;
  return (
    <Svg>
      <text x={TITLE.x0} y={TITLE.base} fontFamily={CODE} fontWeight={500} fontSize={TITLE.size} fill={K.cream} stroke={K.bg} strokeWidth={14} strokeLinejoin="round" style={{paintOrder: 'stroke'}} xmlSpace="preserve">
        {shown}
      </text>
      {(typing || t < T.drop) && <Caret x={TITLE.x0 + n * 72 + 4} y={TITLE.base} h={110} color={K.cream} opacity={typing || Math.floor(t * 4) % 2 === 0 ? 1 : 0} />}
    </Svg>
  );
};

// ------------------------------------------------------------------ the whole intro
export const Intro: React.FC<{t: number}> = ({t}) => {
  // everything but the title dims to 0.25 while the title types
  const dim = 1 - 0.75 * prog(t, T.title0, T.title0 + Fr(6), ease.outCubic);
  const PROT = ['world.', 'PROTECTION', ' = true;'] as const;
  const OBJ = ['new ', 'OBJECT_CREATION', '();'] as const;
  const INIT = ['', 'INITIALIZATION', '(params)'] as const;
  const SIM = ['world.', 'SIMULATION', '.start()'] as const;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: dim}}>
        <Svg>
          <Cable t={t} />
          <Socket t={t} />
          <Shield t={t} />
          <Globe t={t} />
          <Pieces t={t} />
        </Svg>
        {t >= 7.3 && t < PW_CLOSE + 0.5 && (
          <Win x={PW.x} y={PW.y} w={PW.w} h={PW.h} title="params.json" tOpen={7.446} tClose={PW_CLOSE} a={0} seed={3}>
            <ParamsBody t={t} />
          </Win>
        )}
        {/* the chat column */}
        <Transcript x={COL.x} y={COL.y} w={COL.w} h={COL.h} entries={INTRO_ENTRIES} a={0} />
        <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <text x={SPARK0[0] + 22} y={SPARK0[1] + 6} fontFamily={CODE} fontSize={16} fill={K.cream} fillOpacity={0.7}>
            claude
          </text>
        </svg>
      </AbsoluteFill>
      <Composer x={COMP0.x} y={COMP0.y} w={COMP0.w} prompts={INTRO_PROMPTS} a={0} />
      {/* keywords as statements, in the stage's top band */}
      <KwCode t0={T.PROT} t1={3.67} pre={PROT[0]} kw={PROT[1]} post={PROT[2]} x={KW_X} y={KW_Y} size={kwSize(...PROT)} a={0} />
      <KwCode t0={T.OBJ} t1={7.25} pre={OBJ[0]} kw={OBJ[1]} post={OBJ[2]} x={KW_X} y={KW_Y} size={kwSize(...OBJ)} a={0} />
      <KwCode t0={T.INIT} t1={10.9} pre={INIT[0]} kw={INIT[1]} post={INIT[2]} x={KW_X} y={KW_Y} size={kwSize(...INIT)} a={0} />
      <KwCode t0={T.SIM} t1={14.75} pre={SIM[0]} kw={SIM[1]} post={SIM[2]} x={KW_X} y={KW_Y} size={kwSize(...SIM)} a={0} />
      <TitleTyping t={t} />
    </AbsoluteFill>
  );
};

// small helpers re-used by S0.tsx
export const sparkIntro = (t: number) => ({x: SPARK0[0], y: SPARK0[1], R: 14 * (1 + 0.15 * pulse(t, 4)), rot: t * 40});
void beat;
void env;
