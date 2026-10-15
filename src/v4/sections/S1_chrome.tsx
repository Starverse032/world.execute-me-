// S1 IDE chrome: header, sidebar, transcript, status line, composer, you-node
// and tether, in the standard layout (docs/design_v4.md §5). `lite` draws a
// cheap outline-only version for deep recursion levels (SIMULATION).
import React from 'react';
import {K, useT} from '../../v3/core';
import {Composer, Tether, YouNode} from '../shell/Composer';
import {Sidebar} from '../shell/Sidebar';
import {clockStr, Header, Status, statusSpark} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {LAYOUT} from '../timeline';
import {rrPath} from '../shell/lib';
import {CHATS_S1, CLEARS_S1, clockAt, ENTRIES_S1, GIVES, PROMPTS_S1, STATUS_S1, STATUS_T0} from './s1.data';

export const TX_H = 790; // transcript height while the status line is visible
const SENDS = PROMPTS_S1.map((p) => p.send);
const TETHER_SENDS = [...SENDS, ...GIVES.map((g) => ({t: g + 0.05, dir: -1 as const, dur: 0.45}))];
const PINGS = [...SENDS, ...GIVES.map((g) => g + 0.5)];

// Everything except the stage. `dim` fades the chrome (special lyric UIs).
export const Chrome: React.FC<{dim?: number; lite?: boolean; hide?: boolean}> = ({dim = 1, lite, hide}) => {
  const {t} = useT();
  const L = LAYOUT;
  const tx = L.transcript;
  if (hide) return null;
  if (lite) return <ChromeLite />;
  const [yx, yy] = L.you;
  const sp = statusSpark(L.status.x, L.status.y);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: dim}}>
      <Header path="~/world" model="claude-opus" clock={clockStr(clockAt(t))} a={0} />
      <Sidebar {...L.sidebar} items={CHATS_S1} a={0} />
      <Transcript x={tx.x} y={tx.y} w={tx.w} h={TX_H} entries={ENTRIES_S1} clears={CLEARS_S1} a={0} />
      <Status x={L.status.x} y={L.status.y} t0={STATUS_T0} verbs={STATUS_S1} a={0} />
      <Composer {...L.composer} prompts={PROMPTS_S1} a={0} />
      <Tether from={[yx, yy]} to={sp} sends={TETHER_SENDS} />
      <YouNode x={yx} y={yy} pings={PINGS} />
    </div>
  );
};

// Outline-only stand-in used at recursion depth ≥ 3 (drawn ≤ 0.1 scale).
const ChromeLite: React.FC = () => {
  const L = LAYOUT;
  const s = L.sidebar, tx = L.transcript, c = L.composer;
  const bars = [0.8, 0.55, 0.9, 0.4, 0.7, 0.62, 0.85];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M 0 44 L 1920 44" stroke={K.cream} strokeOpacity={0.25} strokeWidth={3} />
      <path d={rrPath(s.x, s.y, s.w, s.h, 10)} fill={K.surface} stroke={K.cream} strokeOpacity={0.25} strokeWidth={4} />
      {bars.map((b, i) => (
        <rect key={i} x={tx.x + 30} y={tx.y + 380 + i * 62} width={(tx.w - 60) * b} height={26} rx={4} fill={K.cream} opacity={i === bars.length - 1 ? 0.7 : 0.25} />
      ))}
      <path d={rrPath(c.x, c.y, c.w, 64, 14)} fill={K.surface} stroke={K.line2} strokeWidth={4} />
      <circle cx={L.you[0]} cy={L.you[1]} r={9} fill="none" stroke={K.cream} strokeWidth={4} />
    </svg>
  );
};
