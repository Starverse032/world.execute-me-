// 47.6–49.6, full frame above the camera, in two stages, one at a time:
//  1 the eye: her line-art eye fills the screen; in its middle a monitor strip
//    shows your signal, which fades from a live trace to a flat line ("blind")
//  2 closed: the lids meet, and what was behind the eye breaks into a mosaic
// v8: on "So dizzy" this layer leaves; the v5 dizzy special UI (S1_pre: the
// centred line and the turning, wobbling polygons, now filling the screen) takes over.
// The sung line sits on its own plate at the bottom.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {hash} from '../chaos';
import {LineArt} from '../char/LineArt';
import {CODE} from '../fonts';
import {Layer, r2} from '../shell/lib';
import {L, W} from './s1.data';
import {Caption, LYRIC} from './S4_lib';

const IN: [number, number] = [47.6, 47.75];
const OUT: [number, number] = [L.dizzy - 0.04, L.dizzy + 0.1];
const CLOSE: [number, number] = [W.blind, W.blind + 0.32]; // 48.61, on "blind"
const EK = 1080 / 941; // the eye drawing fills the frame
const EYE_CY = 525 * EK; // the eye's centre line on screen
const STRIP = {x: 610, y: EYE_CY - 64, w: 700, h: 128};

const Signal: React.FC<{t: number}> = ({t}) => {
  const fade = prog(t, 47.85, W.blind - 0.02, ease.inQuad); // live → flat
  const o = prog(t, 47.75, 47.85) * (1 - prog(t, CLOSE[0], CLOSE[0] + 0.12));
  if (o <= 0) return null;
  const b = env(t - lastOnset(t), 0.18);
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const x = STRIP.x + 24 + (STRIP.w - 48) * u;
    const v = (1 - fade) * 38 * (0.6 + 0.4 * b) * (0.55 * Math.sin(2 * Math.PI * (5 * u - 2.17 * t)) + 0.3 * Math.sin(2 * Math.PI * (11 * u - 3.1 * t) + 1.3));
    d += `${i ? 'L' : 'M'} ${r2(x)} ${r2(STRIP.y + STRIP.h / 2 + 10 - v)} `;
  }
  const flat = fade >= 0.98;
  return (
    <g opacity={o}>
      <rect x={STRIP.x} y={STRIP.y} width={STRIP.w} height={STRIP.h} rx={8} fill={K.bg} fillOpacity={0.92} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} />
      <text x={STRIP.x + 20} y={STRIP.y + 28} fontFamily={CODE} fontSize={18} fill={flat ? K.orange : K.creamDim}>
        {flat ? 'signal: none' : 'signal: you'}
      </text>
      <path d={d} fill="none" stroke={flat ? K.orange : K.cream} strokeWidth={2} />
    </g>
  );
};

// the mosaic behind the closed eye: square cells re-rolled every 3 frames
const Mosaic: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (o <= 0) return null;
  const roll = Math.floor(t * (FPS / 3));
  const S = 60;
  const cells: React.ReactNode[] = [];
  for (let gy = 0; gy < 18; gy++)
    for (let gx = 0; gx < 32; gx++) {
      const h = hash(roll * 7 + gy * 131 + gx, 3);
      if (h < 0.35) continue;
      const orange = h > 0.965;
      cells.push(<rect key={gy * 32 + gx} x={gx * S + 1} y={gy * S + 1} width={S - 2} height={S - 2} fill={orange ? K.orange : K.cream} opacity={orange ? 0.55 : 0.04 + 0.2 * (h - 0.35)} />);
    }
  return <g opacity={o}>{cells}</g>;
};

export const EyeFull: React.FC = () => {
  const {t} = useT();
  if (t < IN[0] || t > OUT[1]) return null;
  const o = prog(t, IN[0], IN[1]) * (1 - prog(t, OUT[0], OUT[1]));
  const close = prog(t, CLOSE[0], CLOSE[1], ease.inOutCubic);
  const lid = (EYE_CY + 20) * close; // how far each lid has come in (top lid from 0, bottom lid from 1080)
  const eyeO = 1 - prog(t, L.dizzy - 0.1, L.dizzy + 0.1);
  const mosaicO = prog(t, CLOSE[1], CLOSE[1] + 0.2) * (1 - prog(t, L.dizzy - 0.05, L.dizzy + 0.15));
  // the closed eye: one curved lash line across the middle
  const closedD = `M 380 ${r2(EYE_CY - 10)} Q 960 ${r2(EYE_CY + 70)} 1540 ${r2(EYE_CY - 10)}`;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: K.bg}} />
      <Layer>
        <Mosaic t={t} o={mosaicO} />
      </Layer>
      {eyeO > 0 && close < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: eyeO, clipPath: `inset(${r2(lid * (EYE_CY / (EYE_CY + 20)))}px 0 ${r2(lid * ((1080 - EYE_CY) / (EYE_CY + 20)))}px 0)`}}>
          <LineArt pose="eye" x={0} y={0} h={1080} reveal={[47.66, 47.95]} pen={false} />
        </div>
      )}
      <Layer>
        {close > 0 && close < 1 && (
          <path d={`M 0 ${r2(lid * (EYE_CY / (EYE_CY + 20)))} L 1920 ${r2(lid * (EYE_CY / (EYE_CY + 20)))} M 0 ${r2(1080 - lid * ((1080 - EYE_CY) / (EYE_CY + 20)))} L 1920 ${r2(1080 - lid * ((1080 - EYE_CY) / (EYE_CY + 20)))}`} stroke={K.orange} strokeWidth={2.5} />
        )}
        {close >= 1 && eyeO > 0 && (
          <g opacity={eyeO}>
            <path d={closedD} fill="none" stroke={K.cream} strokeWidth={4} strokeLinecap="round" />
            {Array.from({length: 9}, (_, i) => {
              const u = (i + 1) / 10;
              const x = lerp(380, 1540, u), y = EYE_CY - 10 + 4 * 80 * u * (1 - u) * 0.5 * 2;
              return <path key={i} d={`M ${r2(x)} ${r2(y)} L ${r2(x + (u - 0.5) * 40)} ${r2(y + 34)}`} stroke={K.cream} strokeWidth={2.5} strokeLinecap="round" />;
            })}
          </g>
        )}
        <Signal t={t} />
        <Caption t={t} t0={L.blind} t1={L.dizzy - 0.17} text="And then blind my vision" {...LYRIC} plate />
      </Layer>
    </AbsoluteFill>
  );
};
