// Verse 1 inside the plot (v6 MV), 31.2–41.0. Drawn above the camera layer.
// The camera pushes into plot.py's figure, and at that scale this layer takes
// over full frame. Points, lines and functions carry the verse; no figure.
//  set of points  the scatter of her points (as plotted in the notebook) is
//                 flat at first, then opens in depth: x, y and a new z axis,
//                 the cloud turning so its front and back separate.
//  DIMENSION      the cursor drags along z and the view turns further.
//  circle         the same points travel to a circle; the circumference is
//                 drawn bright, the radius dim, a dot runs one lap.
//  CIRCUMFERENCE  the circle unrolls into one straight line, 2πr long.
//  sine wave      that line bends into the sine wave; one tangent, one contact
//                 point, and the cursor docks on it.
// Every sung line has its caption here (bottom left); keywords sit at the top.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, K, lerp, prog, useT} from '../../v3/core';
import {hash} from '../chaos';
import {strokePoints, usePose} from '../char/LineArt';
import {MATH} from '../fonts';
import {YouNodeG} from '../shell/Composer';
import {KwCode, kwFit} from '../shell/KwCode';
import {Layer, P2, r2} from '../shell/lib';
import {T} from './s0.data';
import {Caption, LYRIC} from './S4_lib';

export const FULL_IN: [number, number] = [31.2, 31.4];
export const FULL_OUT: [number, number] = [40.7, 41.0];
// the scatter exactly where plot.py's points land under the camera push
const FK = 1040 / 1536;
const FX = 960 - (1024 * FK) / 2;
const FY = 20;
const C3: P2 = [960, 540]; // centre of the cloud on screen

// ------------------------------------------------------------------ timeline
const DEPTH: [number, number] = [31.55, 32.4]; // the cloud opens in z
const TURN0: [number, number] = [31.55, 32.4]; // and turns to show it
const DRAG: [number, number] = [T.DIM + 0.05, 33.3]; // the cursor drags along z
const GATHER: [number, number] = [33.45, 34.25]; // points → circle
const CIRC = {c: [960, 520] as P2, r: 280, lap: [34.3, 35.9] as [number, number]};
const UNROLL: [number, number] = [T.CIRC - 0.02, T.CIRC + 0.6]; // circle → straight line
const BEND: [number, number] = [37.1, 37.7]; // line → sine wave
const LINE_Y = 560;
const LINE_X0 = 960 - Math.PI * CIRC.r; // the unrolled line is 2πr long, centred
const WAVE = {lam: 2 * Math.PI * CIRC.r / 2.5, w: 2.2, A: 150, t0: 37.1};
const waveA = (t: number) => WAVE.A * prog(t, BEND[0], BEND[1], ease.inOutCubic) * (1 - prog(t, 40.45, 40.8));
const waveY = (x: number, t: number) => LINE_Y - waveA(t) * Math.sin((2 * Math.PI * (x - LINE_X0)) / WAVE.lam - WAVE.w * Math.max(0, t - BEND[1]));
const waveSlope = (x: number, t: number) => -waveA(t) * ((2 * Math.PI) / WAVE.lam) * Math.cos((2 * Math.PI * (x - LINE_X0)) / WAVE.lam - WAVE.w * Math.max(0, t - BEND[1]));

// the view angle around the vertical axis
const theta = (t: number) => (35 * prog(t, TURN0[0], TURN0[1], ease.inOutCubic) + 25 * prog(t, DRAG[0], DRAG[1], ease.inOutCubic)) * (Math.PI / 180);
const project = (x: number, y: number, z: number, th: number): {p: P2; s: number; z: number} => {
  const xr = x * Math.cos(th) + z * Math.sin(th);
  const zr = -x * Math.sin(th) + z * Math.cos(th);
  const f = 1400 / (1400 + zr);
  return {p: [C3[0] + xr * f, C3[1] + y * f], s: f, z: zr};
};

export const VerseFull: React.FC = () => {
  const {t} = useT();
  const rec = usePose('stand');
  const pts = useMemo(() => {
    if (!rec) return null;
    return strokePoints(rec, 1100, 7).map((p, i) => {
      const x = FX + p[0] * FK - C3[0], y = FY + p[1] * FK - C3[1];
      // depth: a gentle swell front-to-back across the body plus per-point scatter
      const z = 140 * Math.cos(x / 260) * Math.cos(y / 420) + (hash(71, i) - 0.5) * 120;
      const a = -Math.PI / 2 + 2 * Math.PI * (i / 1100);
      return {x, y, z, ring: [CIRC.c[0] + CIRC.r * Math.cos(a), CIRC.c[1] + CIRC.r * Math.sin(a)] as P2};
    });
  }, [rec]);
  if (!pts || t < FULL_IN[0] || t > 41.5) return null;
  const tail = <Caption t={t} t0={40.706} t1={41.02} text="If I approach infinity" {...LYRIC} />;
  if (t > FULL_OUT[1]) return <AbsoluteFill><Layer>{tail}</Layer></AbsoluteFill>;
  const bgO = prog(t, FULL_IN[0], FULL_IN[1]) * (1 - prog(t, FULL_OUT[0], FULL_OUT[1]));
  const dz = prog(t, DEPTH[0], DEPTH[1], ease.inOutCubic);
  const th = theta(t);
  const g = prog(t, GATHER[0], GATHER[1], ease.inOutCubic);
  const un = prog(t, UNROLL[0], UNROLL[1], ease.inOutCubic);

  // ---- the points: cloud → circle (they stop being drawn once the circle line takes over)
  const dotsO = 1 - prog(t, 34.2, 34.5);
  const dots: React.ReactNode[] = [];
  if (dotsO > 0) {
    const proj = pts.map((q) => project(q.x, q.y, q.z * dz, th));
    const order = proj.map((_, i) => i).sort((a, b) => proj[b].z - proj[a].z);
    order.forEach((i) => {
      const pr = proj[i];
      const lag = 0.12 * hash(72, i);
      const gi = prog(t, GATHER[0] + lag, GATHER[1] + lag, ease.inOutCubic);
      const x = lerp(pr.p[0], pts[i].ring[0], gi), y = lerp(pr.p[1], pts[i].ring[1], gi);
      const front = Math.max(0, Math.min(1, 0.5 - pr.z / 300));
      const moving = gi > 0 && gi < 1;
      dots.push(<circle key={i} cx={r2(x)} cy={r2(y)} r={r2((1.6 + 1.6 * front) * (moving ? 1.2 : 1))} fill={moving || (dz > 0 && front > 0.75) ? K.orange : K.cream} opacity={dotsO * (0.35 + 0.55 * front)} />);
    });
  }

  // ---- axes (x, y, and the new z), through the cloud's centre
  const axesO = prog(t, 31.5, 31.8) * (1 - prog(t, GATHER[0], GATHER[0] + 0.3));
  const ax = (v: [number, number, number], len: number) => {
    const a = project(-v[0] * len, -v[1] * len, -v[2] * len, th), b = project(v[0] * len, v[1] * len, v[2] * len, th);
    return {a: a.p, b: b.p};
  };
  const X = ax([1, 0, 0], 520), Y = ax([0, -1, 0], 460), Z = ax([0, 0, 1], 600 * prog(t, DEPTH[0], DEPTH[0] + 0.5, ease.outCubic));
  const zHot = t >= T.DIM && t < DRAG[1];

  // ---- the cursor: drags out along +z, then waits on the right, then docks on the tangent
  const zEnd = Z.b;
  const dock: [number, number] = [38.45, 40.55];
  const curX = lerp(560, 1400, prog(t, dock[0], dock[1], ease.inOutSine));
  let cur: P2;
  if (t < DRAG[0]) cur = [lerp(1500, zEnd[0], prog(t, 32.3, DRAG[0], ease.inOutCubic)), lerp(980, zEnd[1], prog(t, 32.3, DRAG[0], ease.inOutCubic))];
  else if (t < 34.3) cur = zEnd;
  else if (t < dock[0]) cur = [lerp(zEnd[0], curX, prog(t, 37.8, dock[0], ease.inOutCubic)), lerp(zEnd[1], waveY(curX, t), prog(t, 37.8, dock[0], ease.inOutCubic))];
  else cur = [curX, waveY(curX, t)];
  const docked = t >= dock[0] && t < 40.75;

  // ---- circle → line → wave (one polyline that changes shape)
  const N = 160;
  const shape: P2[] = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const a = -Math.PI / 2 + 2 * Math.PI * u;
    const onC: P2 = [CIRC.c[0] + CIRC.r * Math.cos(a), CIRC.c[1] + CIRC.r * Math.sin(a)];
    const lx = LINE_X0 + 2 * Math.PI * CIRC.r * u;
    const onL: P2 = [lx, t >= BEND[0] ? waveY(lx, t) : LINE_Y];
    shape.push([lerp(onC[0], onL[0], un), lerp(onC[1], onL[1], un)]);
  }
  const drawn = prog(t, GATHER[1] - 0.2, GATHER[1] + 0.1); // the circle line takes over from the dots
  const lap = prog(t, CIRC.lap[0], CIRC.lap[1], ease.inOutSine);
  const lapA = -Math.PI / 2 + 2 * Math.PI * lap;
  const shapeO = 1 - prog(t, 40.45, 40.8);
  const tangent = (x: number, len: number) => {
    const m = waveSlope(x, t), L = Math.hypot(1, m), y = waveY(x, t);
    return `M ${r2(x - len / 2 / L)} ${r2(y - (m * len) / 2 / L)} L ${r2(x + len / 2 / L)} ${r2(y + (m * len) / 2 / L)}`;
  };
  const tanHit = t >= T.TAN && t < T.TAN + 0.2;

  return (
    <>
      <AbsoluteFill style={{opacity: bgO}}>
        <AbsoluteFill style={{background: K.bg}} />
        <Layer>
          {axesO > 0 && (
            <g opacity={axesO}>
              <path d={`M ${r2(X.a[0])} ${r2(X.a[1])} L ${r2(X.b[0])} ${r2(X.b[1])} M ${r2(Y.a[0])} ${r2(Y.a[1])} L ${r2(Y.b[0])} ${r2(Y.b[1])}`} stroke={K.cream} strokeOpacity={0.35} strokeWidth={1.5} />
              <text x={r2(X.b[0] + 12)} y={r2(X.b[1] + 8)} fontFamily={MATH} fontStyle="italic" fontSize={36} fill={K.cream} fillOpacity={0.6}>x</text>
              <text x={r2(Y.b[0] + 12)} y={r2(Y.b[1])} fontFamily={MATH} fontStyle="italic" fontSize={36} fill={K.cream} fillOpacity={0.6}>y</text>
              {dz > 0 && <path d={`M ${r2(Z.a[0])} ${r2(Z.a[1])} L ${r2(Z.b[0])} ${r2(Z.b[1])}`} stroke={K.orange} strokeWidth={zHot ? 4 : 2.5} />}
              {dz > 0.5 && <text x={r2(Z.b[0] + 14)} y={r2(Z.b[1] - 8)} fontFamily={MATH} fontStyle="italic" fontSize={40} fill={K.orange}>z</text>}
            </g>
          )}
          {dots}
          {/* the circle (dim radius, bright circumference) → the unrolled line → the wave */}
          {t >= GATHER[1] - 0.2 && shapeO > 0 && (
            <g opacity={shapeO}>
              {un < 0.05 && <path d={`M ${CIRC.c[0]} ${CIRC.c[1]} L ${CIRC.c[0] + CIRC.r} ${CIRC.c[1]}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1.5} />}
              {un < 0.05 && <text x={CIRC.c[0] + CIRC.r / 2 - 8} y={CIRC.c[1] - 14} fontFamily={MATH} fontStyle="italic" fontSize={36} fill={K.cream} fillOpacity={0.35}>r</text>}
              <path d={shape.map((q, i) => `${i ? 'L' : 'M'} ${r2(q[0])} ${r2(q[1])}`).join(' ')} fill="none" stroke={t < BEND[0] ? K.orange : K.cream} strokeOpacity={drawn * (t < BEND[0] ? 1 : 0.8)} strokeWidth={t < BEND[0] ? 3.5 : 2.5} />
              {lap > 0 && lap < 1 && <circle cx={r2(CIRC.c[0] + CIRC.r * Math.cos(lapA))} cy={r2(CIRC.c[1] + CIRC.r * Math.sin(lapA))} r={9} fill={K.orange} />}
              {un >= 1 && t < BEND[0] + 0.3 && (
                <g opacity={1 - prog(t, BEND[0], BEND[0] + 0.3)}>
                  <path d={`M ${r2(LINE_X0)} ${LINE_Y + 30} L ${r2(LINE_X0)} ${LINE_Y + 50} M ${r2(LINE_X0 + 2 * Math.PI * CIRC.r)} ${LINE_Y + 30} L ${r2(LINE_X0 + 2 * Math.PI * CIRC.r)} ${LINE_Y + 50} M ${r2(LINE_X0)} ${LINE_Y + 40} L ${r2(LINE_X0 + 2 * Math.PI * CIRC.r)} ${LINE_Y + 40}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} />
                  <text x={960} y={LINE_Y + 92} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={44} fill={K.cream}>2πr</text>
                </g>
              )}
              {docked && <path d={tangent(cur[0], 320)} stroke={tanHit ? K.orange : K.cream} strokeWidth={tanHit ? 3 : 2} />}
              {docked && <path d={tangent(cur[0], 50)} stroke={K.orange} strokeWidth={6} strokeLinecap="round" />}
              {docked && <circle cx={r2(cur[0])} cy={r2(cur[1])} r={5} fill={K.orange} />}
            </g>
          )}
          <YouNodeG t={t} x={cur[0]} y={docked ? cur[1] - 2 : cur[1]} t0={32.3} scale={1.3} pings={[DRAG[0], dock[0]]} />
          <Caption t={t} t0={FULL_IN[0]} t1={33.245} text="Then I will give you my DIMENSION" {...LYRIC} marks={[[0, 31.116], [24, T.DIM]]} />
          <Caption t={t} t0={33.412} t1={34.479} text="If I’m a circle" {...LYRIC} />
          <Caption t={t} t0={34.646} t1={36.9} text="Then I will give you my CIRCUMFERENCE" {...LYRIC} marks={[[0, 34.646], [24, T.CIRC]]} />
          <Caption t={t} t0={37.067} t1={38.429} text="If I’m a sine wave" {...LYRIC} />
          <Caption t={t} t0={38.596} t1={40.539} text="Then you can sit on all my TANGENTS" {...LYRIC} marks={[[0, 38.596], [27, T.TAN]]} />
        </Layer>
        <KwCode t0={T.DIM} t1={33.19} pre="me." kw="DIMENSION" post=" += 1;" x={960} y={170} size={kwFit('me.', 'DIMENSION', ' += 1;', 1300, 120)} a={0} />
        <KwCode t0={T.CIRC} t1={36.85} pre="const " kw="CIRCUMFERENCE" post=" = 2πr;" x={960} y={170} size={kwFit('const ', 'CIRCUMFERENCE', ' = 2πr;', 1300, 120)} a={0} />
        <KwCode t0={T.TAN} t1={40.49} pre="you.sit(" kw="TANGENTS" post=")" x={960} y={170} size={kwFit('you.sit(', 'TANGENTS', ')', 1300, 120)} a={0} />
      </AbsoluteFill>
      <AbsoluteFill>
        <Layer>{tail}</Layer>
      </AbsoluteFill>
    </>
  );
};
