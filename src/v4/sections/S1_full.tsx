// Chorus 1 full frame (v4 MV), 61.9–63.3. Drawn above the camera layer.
// On STIMULATIONS the six stimulus windows lose their frames: the six signals
// run across the whole screen, one band each, bursting on the beats, then the
// interface comes back for only.you (the hand is pushed in by the camera).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {beat, env, K, lastOnset, prog, pulse, useT} from '../../v3/core';
import {KwCode, kwFit} from '../shell/KwCode';
import {YouNodeG} from '../shell/Composer';
import {Layer, r2} from '../shell/lib';
import {L} from './s1.data';
import {Caption, LYRIC} from './S4_lib';

const IN: [number, number] = [61.86, 61.96];
const OUT: [number, number] = [63.12, 63.3];
const BURSTS = [L.STIM, beat(135), beat(136)];
const ROWS = 6;
const ROW_H = 132;
const TOP = 60;
const X0 = 60, X1 = 1860;
const TAU = Math.PI * 2;

const wave = (kind: number, u: number) => {
  const s = Math.sin(TAU * u);
  if (kind === 0) return s;
  if (kind === 1) return s >= 0 ? 0.8 : -0.8;
  if (kind === 2) return 2 * (u - Math.floor(u)) - 1;
  const f = u - Math.floor(u);
  return f < 0.08 ? -1 + f * 12 : f < 0.16 ? 1 - (f - 0.08) * 25 : 0;
};

const Band: React.FC<{t: number; i: number}> = ({t, i}) => {
  const cy = TOP + ROW_H * (i + 0.5);
  const burst = Math.max(...BURSTS.map((b) => env(t - b, 0.18)));
  const amp = ROW_H * 0.36 * (1 + 0.25 * pulse(t) + 0.45 * burst);
  const lit = burst > 0.5 && i % 2 === Math.floor((t - L.STIM) * 4) % 2;
  const col = lit ? K.orange : K.cream;
  if (i < 4) {
    let d = '';
    const N = 220;
    for (let k = 0; k <= N; k++) {
      const x = X0 + ((X1 - X0) * k) / N;
      const u = (k / N) * 5 - (t - L.STIM) * 1.6 * (1 + i * 0.15);
      d += `${k ? 'L' : 'M'} ${r2(x)} ${r2(cy - amp * 0.82 * wave(i, u))} `;
    }
    return <path d={d} fill="none" stroke={col} strokeWidth={lit ? 2.5 : 2} strokeLinejoin="round" />;
  }
  if (i === 4) {
    // Lissajous orbits laid along the band
    const out: React.ReactNode[] = [];
    for (let j = 0; j < 7; j++) {
      const cx = X0 + 120 + j * 270;
      let d = '';
      const ph = (t - L.STIM) * 1.4 + j;
      for (let k = 0; k <= 90; k++) {
        const a = (k / 90) * TAU;
        d += `${k ? 'L' : 'M'} ${r2(cx + 1.4 * amp * Math.sin(3 * a + ph))} ${r2(cy + 0.9 * amp * Math.sin(2 * a))} `;
      }
      out.push(<path key={j} d={d} fill="none" stroke={col} strokeWidth={1.5} />);
    }
    return <g>{out}</g>;
  }
  // a dot matrix lighting on the beats
  const on = Math.floor((lastOnset(t) - 59) / 0.4615 + 0.5);
  const dots: React.ReactNode[] = [];
  for (let c = 0; c < 46; c++)
    for (let r = 0; r < 3; r++) {
      const k = r * 46 + c;
      const isOn = (k * 7 + on * 5) % 11 < 3 || burst > 0.4;
      dots.push(<circle key={k} cx={X0 + 20 + c * 39} cy={cy - 36 + r * 36} r={isOn ? 6 : 3} fill={isOn ? K.orange : K.creamDim} opacity={isOn ? 0.6 + 0.4 * pulse(t) : 0.45} />);
    }
  return <g>{dots}</g>;
};

// v8: "Then I can" stays at the bottom left until the line ends (63.535), after
// the bands have gone, as one continuous caption (the conversation shows it
// only as history: s1.data `quiet`), so it never jumps back into the chat.
const TAIL_END = L.only - 5 / 30;
export const StimFull: React.FC = () => {
  const {t} = useT();
  if (t < IN[0] || t > TAIL_END + 0.2) return null;
  const o = prog(t, IN[0], IN[1]) * (1 - prog(t, OUT[0], OUT[1]));
  // v11: the whole sung line stays readable over the bands to its end; its code keyword
  // has left by then, so "Then I can" comes in alone
  const caption = (
    <>
      <g opacity={prog(t, IN[0], IN[1])}>
        <Caption t={t} t0={IN[0]} t1={L.thenIcan - 5 / 30} text="If I can give you all the STIMULATIONS" marks={[[0, L.give], [26, L.STIM], [38, L.STIM]]} {...LYRIC} plate />
      </g>
      <Caption t={t} t0={L.thenIcan} t1={TAIL_END} text="Then I can" {...LYRIC} plate />
    </>
  );
  return (
    <>
      {o > 0 && (
        <AbsoluteFill style={{opacity: o}}>
          <AbsoluteFill style={{background: K.bg}} />
          <Layer>
            {Array.from({length: ROWS}, (_, i) => (
              <Band key={i} t={t} i={i} />
            ))}
          </Layer>
          <KwCode t0={L.STIM} t1={L.thenIcan - 0.22} pre="give(you, ..." kw="STIMULATIONS" post=")" x={960} y={926} size={kwFit('give(you, ...', 'STIMULATIONS', ')', 1000, 84)} a={0} />
        </AbsoluteFill>
      )}
      <AbsoluteFill>
        <Layer>{caption}</Layer>
      </AbsoluteFill>
    </>
  );
};
