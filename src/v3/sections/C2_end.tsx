// C19–C22 (193.981–211.96 s): figure F re-assembled from her points, the
// pieces put back and picked up, the seed, the final EXECUTION spark, exit 0
// and the closing fade. Spec: docs/design_full.md C19–C22 (fix 12: the fade).
import React from 'react';
import {CODE, ease, FPS, K, lerp, O, prog} from '../core';
import {linePath, PenHead, Plot, pointAt, polyPath, Spark, Svg} from '../geo';
import {F, r2, rayD, typed} from './C2_lib';
import {F_BBOX, FGEO, figParts, glideGeo, Part, PIECE_C, PIECE_LABEL, PIECE_LABEL_Y, PIECES} from './C2_fig';
import {FPLOT_DUR, FPLOT_STAG, T_FPLOT} from './C2_points';

// ------------------------------------------------------------------ timing
const T_BOX = 195.827; // b424
const T_DIS = 196.75; // b426: box un-plots, F disassembles
const GLIDE_DUR = 0.5; // + 1-frame stagger: all six land by 197.42 (as in shot 4)
const GLIDE_STAG = 1 / FPS;
const landT = (i: number) => T_DIS + i * GLIDE_STAG + GLIDE_DUR;
// C20: one primitive un-plots per beat, P6 first (index = part 0..5 = P1..P6)
const UNPLOT = [199.981, 199.519, 199.058, 198.596, 198.135, 197.673];
const T_DOT0 = 200.25, T_DOT1 = 200.75; // the dot glides to C
const DOT_FROM: [number, number] = [700, 240];
const C = {x: 960, y: 390};
const RINGS = [201.365, 203.211, 205.057];
const T_OUTLINE = 205.057;
export const F_KW22 = 6174;
const F_STOP = 6212; // audio stops
const STEPS = [205.98, 206.442, 206.903];
export const T_FADE0 = 210.0, T_FADE1 = 211.6;
export const T_SFADE0 = 211.0, T_SFADE1 = 211.9;
const SPARK_R = 56;

export const sparkRot = (t: number) => {
  let a = 0;
  for (const s of STEPS) a += 15 * prog(t, s, s + 6 / FPS, ease.outCubic);
  return a + 4 * Math.max(0, t - F(F_STOP));
};

const PartPlot: React.FC<{part: Part; p?: number; pen?: boolean; t: number}> = ({part, ...rest}) => {
  const el = <Plot d={part.d} w={1.5} color={K.cream} {...rest} />;
  return part.rot && part.rot.a ? <g transform={`rotate(${r2(part.rot.a)} ${r2(part.rot.c[0])} ${r2(part.rot.c[1])})`}>{el}</g> : el;
};

// ------------------------------------------------------------------ C19–C20 figure F and the pieces
export const Figure: React.FC<{t: number}> = ({t}) => {
  if (t < T_FPLOT || t > UNPLOT[0] + 9 / FPS) return null;
  const gp = [0, 1, 2, 3, 4, 5].map((i) => prog(t, T_DIS + i * GLIDE_STAG, landT(i) - 0.0001, ease.inOutCubic));
  const geo = t < T_DIS ? FGEO : glideGeo(FGEO, PIECES, gp);
  const parts = figParts(geo);
  const el: React.ReactNode[] = [];
  const add = (n: React.ReactNode) => el.push(<React.Fragment key={el.length}>{n}</React.Fragment>);
  parts.forEach((part, i) => {
    const a = T_FPLOT + i * FPLOT_STAG;
    const pin = prog(t, a, a + FPLOT_DUR, ease.inOutCubic);
    const pout = 1 - prog(t, UNPLOT[i], UNPLOT[i] + 8 / FPS, ease.inOutCubic);
    const p = Math.min(pin, pout);
    // the circle's pen is drawn by Seed (it stays as the dot)
    add(<PartPlot part={part} p={p} t={t} pen={i !== 0 || t < UNPLOT[0]} />);
    // crosshair and label on landing; lift-fade when picked up
    const fin = prog(t, landT(i), landT(i) + 5 / FPS);
    const lift = prog(t, UNPLOT[i], UNPLOT[i] + 5 / FPS);
    const o = fin * (1 - lift);
    if (o > 0) {
      const [cx, cy] = PIECE_C[i];
      add(
        <g opacity={o} transform={`translate(0 ${r2(-14 * lift)})`}>
          <g opacity={O.mid}>
            <path d={linePath(cx - 6, cy, cx + 6, cy)} stroke={K.cream} strokeWidth={1} />
            <path d={linePath(cx, cy - 6, cx, cy + 6)} stroke={K.cream} strokeWidth={1} />
          </g>
          <text x={cx} y={PIECE_LABEL_Y[i]} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim}>
            {PIECE_LABEL[i]}
          </text>
        </g>,
      );
    }
  });
  // dashed bounding box with `object #0001` (shot 4's frame, in reverse)
  if (t >= T_BOX) {
    const b = F_BBOX;
    const un = 1 - prog(t, T_DIS, T_DIS + 6 / FPS, ease.inOutCubic);
    if (un > 0)
      add(
        <Plot
          d={polyPath(
            [
              [b.x0, b.y0],
              [b.x1, b.y0],
              [b.x1, b.y1],
              [b.x0, b.y1],
            ],
            true,
          )}
          p={un}
          w={1}
          opacity={O.mid}
          dash="6 6"
          cap="butt"
          pen={false}
        />,
      );
    const lift = prog(t, T_DIS, T_DIS + 5 / FPS);
    const lab = 'object #0001';
    if (lift < 1)
      add(
        <text x={b.x0} y={b.y0 - 10 - 14 * lift} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={1 - lift}>
          {lab.slice(0, typed(lab.length, T_BOX, t, 3))}
        </text>,
      );
  }
  return <Svg>{el}</Svg>;
};

// ------------------------------------------------------------------ C20–C22 the dot, the rings, the spark
const CIRCLE_D = figParts(PIECES)[0].d;
const RAYS = Array.from({length: 12}, (_, i) => rayD(SPARK_R, i));

export const Seed: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < UNPLOT[0] || t >= T_FADE0) return null;
  const el: React.ReactNode[] = [];
  const add = (n: React.ReactNode) => el.push(<React.Fragment key={el.length}>{n}</React.Fragment>);
  // downbeat rings from the seed
  for (const tb of RINGS) {
    const u = (t - tb) / 1.2;
    if (u >= 0 && u < 1) add(<circle cx={C.x} cy={C.y} r={r2(lerp(9, 600, u))} fill="none" stroke={K.cream} strokeWidth={1} opacity={0.45 * (1 - u)} />);
  }
  if (frame < F_KW22) {
    // the spark outline plots around the dot (the dot is its hub)
    if (t >= T_OUTLINE)
      RAYS.forEach((d, i) => {
        const p = prog(t, T_OUTLINE + 0.05 * i, T_OUTLINE + 0.05 * i + 4 / FPS);
        if (p > 0)
          add(
            <g transform={`translate(${C.x} ${C.y})`}>
              <Plot d={d} p={p} w={1} opacity={O.mid} pen={false} />
            </g>,
          );
      });
    // the dot: P1's pen tip while it un-plots, parked at 12 o'clock, then it glides to C
    let pos: [number, number];
    if (t < UNPLOT[0] + 8 / FPS) {
      const p = 1 - prog(t, UNPLOT[0], UNPLOT[0] + 8 / FPS, ease.inOutCubic);
      const q = pointAt(CIRCLE_D, p);
      pos = q ? [q.x, q.y] : DOT_FROM;
    } else {
      const g = prog(t, T_DOT0, T_DOT1, ease.inOutCubic);
      pos = [lerp(DOT_FROM[0], C.x, g), lerp(DOT_FROM[1], C.y, g)];
    }
    add(<PenHead x={pos[0]} y={pos[1]} t={t} />);
  } else {
    add(<Spark x={C.x} y={C.y} R={SPARK_R} rot={sparkRot(t)} />);
  }
  return <Svg>{el}</Svg>;
};

// ------------------------------------------------------------------ the closing fade (above all UI)
export const ClosingFade: React.FC<{t: number}> = ({t}) => {
  if (t < T_FADE0) return null;
  const o = prog(t, T_FADE0, T_FADE1);
  const so = 1 - prog(t, T_SFADE0, T_SFADE1);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: K.bg, opacity: o}} />
      {so > 0 && (
        <Svg>
          <Spark x={C.x} y={C.y} R={SPARK_R} rot={sparkRot(t)} opacity={so} />
        </Svg>
      )}
    </>
  );
};
