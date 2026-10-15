// S2 chrome, 88.6–117.27: the IDE session inherited from S1 (header, sidebar,
// transcript, status, composer, you-node + tether), its anomalies, the
// leaving of the you-node, and the stagger that hides all of it for ISOLATION.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, ease, FPS, K, lerp, prog, useT} from '../../v3/core';
import {anomaly, corrupt, stepJ} from '../chaos';
import {CODE} from '../fonts';
import {Composer, ComposerState, TetherG, YouNodeG} from '../shell/Composer';
import {P2, r2} from '../shell/lib';
import {Sidebar} from '../shell/Sidebar';
import {clockStr, Header, Status, statusSpark} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {LAYOUT} from '../timeline';
import {ENTRIES, L, PROMPTS, SIDEBAR_ITEMS, T} from './s2.data';
import {CLEARS_S1, clockAt, STATUS_S1, STATUS_T0} from './s1.data';
import {EchoFrame, Fold, lerp2, vibAmp, WaveFrame} from './S2_lib';

const LY = LAYOUT;
const TX = {x: LY.transcript.x, y: LY.transcript.y, w: LY.transcript.w, h: 790};
const SPARK = statusSpark(LY.status.x, LY.status.y); // (318, 878)
const HOME = LY.you; // (272, 940)

// Chrome hides in a stagger so that all of it is gone on ISOLATION (117.274).
export const HIDE = {header: 116.75, stage: 116.8, sidebar: 116.82, status: 116.88, composer: 116.92, transcript: 116.9};

// ------------------------------------------------------------------ clock
// S1's clock (11:59:xx AM at the hand-off), then it spins ten hours to PM over 92–95.
export const clockSec = (t: number) => clockAt(t) + 10 * 3600 * prog(t, T.spin[0], T.spin[1], ease.inOutCubic);

// ------------------------------------------------------------------ you-node path
// Each "You have left" pushes the node one step further toward the
// bottom-left corner; on the sixth it drifts off the frame.
const STEPS: P2[] = [HOME, [250, 985], [214, 1008], [168, 1028], [118, 1044], [70, 1056]];
export const youAt = (t: number): P2 => {
  let p: P2 = HOME;
  for (let i = 0; i < 5; i++) p = lerp2(p, STEPS[i + 1], prog(t, L.left[i], L.left[i] + 0.55, ease.inOutCubic));
  const off = prog(t, T.leaveOff, T.offGone, ease.inCubic);
  return lerp2(p, [-70, 1125], off);
};
const LEAVE_LABELS = ['you · idle', 'you · away', 'you · 2.4 s', 'you · timeout', 'you · offline', 'you?'];
// The node's label: `you`, swapped with `claude` during the role swap.
const youLabel = (t: number) => {
  if (t >= L.left[0]) {
    let i = 0;
    for (let k = 0; k < 6; k++) if (t >= L.left[k]) i = k;
    return LEAVE_LABELS[i];
  }
  const glitch = (a: string, b: string, t0: number) => {
    const p = clamp01((t - t0) / 0.2);
    const s = p < 0.5 ? a : b;
    return corrupt(s, t, 0.7 * Math.sin(Math.PI * p), 41);
  };
  if (t >= T.unswap && t < T.unswap + 0.2) return glitch('claude', 'you', T.unswap);
  if (t >= T.composerClaude && t < T.composerClaude + 0.2) return glitch('you', 'claude', T.composerClaude);
  if (t >= T.composerClaude && t < T.unswap) return 'claude';
  return 'you';
};

const composerState = (t: number): ComposerState => (t >= T.leaveOff ? 'disabled' : t >= T.composerClaude && t < T.unswap ? 'claude' : 'normal');
const placeholder = (t: number) => {
  const st = composerState(t);
  if (st === 'disabled') return 'no user connected · messages will not be delivered';
  if (st === 'claude') return 'Reply to you…';
  return 'Reply to Claude…';
};
const swap = (t: number) => (t < T.unswap + 0.34 ? prog(t, T.swap[0], T.swap[1], ease.inOutCubic) : 0);

// Tether: cuts on every "You have left", pings from Claude that die at the gaps.
const CUTS = [
  {t: L.left[0], u: 0.62},
  {t: L.left[1], u: 0.34},
  {t: L.left[2], u: 0.8},
  {t: L.left[3], u: 0.18},
  {t: L.left[4], u: 0.5},
  {t: L.left[5], u: 0.42, retract: true, gap: 20},
];
const SENDS = [T.sendSwitch, {t: T.composerClaude, dir: -1 as const}, T.sendFeel, ...L.left.map((lt) => ({t: lt + 0.12, dir: -1 as const, dur: 0.6}))];

const YouAndTether: React.FC = () => {
  const {t} = useT();
  if (t > T.offGone + 0.1) return null;
  const p = youAt(t);
  const lab = youLabel(t);
  // label sits below the node, rising above it as the node sinks to the edge
  const above = prog(t, L.left[0], L.left[1], ease.inOutCubic);
  const ly = lerp(p[1] + 29, p[1] - 17, above);
  const flick = t >= T.leaveOff ? 1 - 0.8 * (Math.floor(t * 12) % 3 === 0 ? 1 : 0) * prog(t, T.leaveOff + 0.3, T.leaveOff + 0.5) : 1;
  const vib = vibAmp(t, L.VIBRATIONS);
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <TetherG t={t} from={p} to={SPARK} sends={SENDS} cuts={CUTS} wave={vib * 0.5} />
      <YouNodeG t={t} x={p[0]} y={p[1]} label="" pings={[T.sendSwitch, T.sendFeel]} opacity={flick} />
      <text x={r2(p[0])} y={r2(ly)} textAnchor={p[0] < 140 ? 'start' : 'middle'} dx={p[0] < 140 ? -6 : 0} fontFamily={CODE} fontSize={15} fill={lab === 'claude' ? K.orange : K.cream} fillOpacity={lab === 'claude' ? 1 : 0.7} opacity={flick} xmlSpace="preserve">
        {lab}
      </text>
    </svg>
  );
};

// On the sixth "You have left" there is no chat left to delete but
// world.execute(me): a strike starts through it and stalls before `me)`.
const StalledStrike: React.FC = () => {
  const {t} = useT();
  if (t < L.left[5]) return null;
  const p = prog(t, L.left[5], L.left[5] + 0.5, ease.outCubic);
  const ty = LY.sidebar.y + 142 + 19;
  const x0 = LY.sidebar.x + 22;
  const len = 14 * 9 + 2; // "world.execute("
  const jx = stepJ(t, 77, 1.5, 12) * prog(t, L.left[5] + 0.5, L.left[5] + 0.6);
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M ${x0} ${ty} L ${r2(x0 + len * p + jx)} ${ty}`} stroke={K.orange} strokeWidth={1.5} />
      {p > 0.98 && <circle cx={r2(x0 + len + jx)} cy={ty} r={2.5} fill={K.orange} />}
    </svg>
  );
};

// Trance (99.35–103): borders double and drift. VIBRATIONS: strings.
const Overlays: React.FC = () => {
  const {t} = useT();
  const echo = 12 * Math.min(prog(t, T.trance, 100.6, ease.inOutCubic), 1 - prog(t, 102.6, T.unswap, ease.inOutCubic));
  const vib = vibAmp(t, L.VIBRATIONS);
  const sb: [number, number, number, number] = [LY.sidebar.x, LY.sidebar.y, LY.sidebar.w, LY.sidebar.h];
  const cp: [number, number, number, number] = [LY.composer.x, LY.composer.y, LY.composer.w, 64];
  const st: [number, number, number, number] = [LY.stage.x, LY.stage.y, LY.stage.w, LY.stage.h];
  if (echo <= 0.05 && vib <= 0.05) return null;
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <EchoFrame t={t} box={sb} amp={echo} phase={0.7} />
      <EchoFrame t={t} box={cp} r={14} amp={echo * 0.8} phase={2.1} />
      <EchoFrame t={t} box={st} amp={echo * 1.2} phase={4.0} />
      <EchoFrame t={t} box={st} amp={echo * 0.6} phase={5.3} color={K.orange} opacity={0.25} />
      {t < HIDE.sidebar && <WaveFrame t={t} box={sb} amp={vib} seed={7} />}
      {t < HIDE.composer && <WaveFrame t={t} box={cp} r={14} amp={vib * 0.6} color={K.line2} opacity={1} seed={3} />}
      {vib > 0.05 && t < HIDE.header && (
        <g>
          <path d="M 0 44 L 1920 44" stroke={K.bg} strokeWidth={3} />
          <path
            d={Array.from({length: 97}, (_, i) => `${i ? 'L' : 'M'} ${i * 20} ${r2(44 + vib * 0.7 * Math.sin((Math.PI * 3 * i) / 96) * Math.cos(t * 2 * Math.PI * 6))}`).join(' ')}
            fill="none"
            stroke={K.cream}
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        </g>
      )}
    </svg>
  );
};

const VERBS = [
  ...STATUS_S1,
  {t: T.newChatSwitch, verb: 'Switching'},
  {t: L.whatever, verb: 'Rescheduling'},
  {t: L.role, verb: 'Swapping'},
  {t: T.trance, verb: 'Entrancing'},
  {t: T.sendFeel, verb: 'Listening'},
  {t: L.thenIcan, verb: 'Completing'},
  {t: L.left[0], verb: 'Pinging'},
  {t: L.left[5], verb: 'Waiting'},
];

export const ChromeS2: React.FC = () => {
  const {t} = useT();
  if (t < 88.6 || t > 117.4) return null;
  const a = anomaly(t);
  // Status continues S1's run; at the PM landing its timer jumps twelve hours.
  const statusEl = <Status x={LY.status.x} y={LY.status.y} t0={t < T.statusJump ? STATUS_T0 : STATUS_T0 - 43200} tokens={(tt) => 380 + 41 * (tt - STATUS_T0)} verbs={VERBS} />;
  return (
    <AbsoluteFill>
      <Fold t0={HIDE.header} box={[0, 0, 1920, 44]}>
        <Header path="~/world" clock={clockStr(clockSec(t))} a={a} />
      </Fold>
      <Fold t0={HIDE.sidebar} box={[LY.sidebar.x, LY.sidebar.y, LY.sidebar.w, LY.sidebar.h]}>
        <Sidebar {...LY.sidebar} items={SIDEBAR_ITEMS} />
        <StalledStrike />
      </Fold>
      <Fold t0={HIDE.transcript} box={[TX.x, TX.y, TX.w, TX.h]}>
        <Transcript {...TX} entries={ENTRIES} clears={[...CLEARS_S1, T.newChatSwitch, T.newChatFeel]} swap={swap} />
      </Fold>
      <Fold t0={HIDE.status} box={[LY.status.x, LY.status.y - 14, 640, 28]}>
        {statusEl}
      </Fold>
      <YouAndTether />
      <Fold t0={HIDE.composer} box={[LY.composer.x, LY.composer.y, LY.composer.w, 64]}>
        <Composer {...LY.composer} prompts={PROMPTS} state={composerState} placeholder={placeholder} />
      </Fold>
      <Overlays />
    </AbsoluteFill>
  );
};

export {SPARK, HOME};

