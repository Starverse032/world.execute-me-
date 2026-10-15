// S2 stage, 88.6–117.27: the right-hand window.
//  · editor (inherited from S1, 4 tabs) gains `me.ts`: her line art, the F → M
//    scan, the sun that becomes a moon while she becomes a silhouette, the two
//    role slots and the half-orbit swap, then the trance moiré.
//  · monitor (term) for chorus 2: your signal (VIBRATIONS), the ring that
//    never completes (COMPLETION), and the flatline while you leave.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {Check, PenHead} from '../../v3/geo';
import {LineArt, preloadPoses} from '../char/LineArt';
import {CODE} from '../fonts';
import {CodeBlock, Diff} from '../shell/Code';
import {KwCode} from '../shell/KwCode';
import {Layer, r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {LAYOUT} from '../timeline';
import {L, T} from './s2.data';
import {HIDE} from './S2_chrome';
import {EDITOR_TABS} from './s1.data';
import {VerseStage} from './S1_verse';
import {vibAmp} from './S2_lib';

preloadPoses('stand', 'male', 'kneel');

const ST = LAYOUT.stage; // 980, 64, 916, 900
const TABS = [...EDITOR_TABS, {t: T.tabMe, label: 'me.ts'}];
// body of the editor: 916 × 834 at (980, 130)

// ------------------------------------------------------------------ figures
const FIG = {x: 30, y: 37, h: 760}; // phase A box (body px)
const KF = FIG.h / 1536;
const SCAN = [80, 975]; // source px range swept by the scan line
const isFlicker = (t: number) => {
  const f = Math.round(t * FPS);
  const f0 = Math.round(T.flicker * FPS);
  return f === f0 || f === f0 + 1;
};

// orbit of the two silhouettes (role slots), body px
const ORB = {cx: 458, cy: 434, rx: 228, ry: 46, h: 640};
const orbitPhase = (t: number) => {
  const s = Math.PI * prog(t, T.swap[0], T.swap[1], ease.inOutCubic);
  const u = Math.max(0, t - T.trance);
  // the trance: the swap keeps going, slowly at first, then faster
  return s + Math.PI * (0.22 * u + 0.17 * u * u);
};
const orbitPos = (ang: number) => ({x: ORB.cx + ORB.rx * Math.cos(ang), y: ORB.cy + ORB.ry * Math.sin(ang), s: 1 + 0.08 * Math.sin(ang)});

const Figures: React.FC<{t: number}> = ({t}) => {
  const els: React.ReactNode[] = [];
  // ---- phase A: her (ink), the scan to him, night
  if (t < T.scanBack[1] + 0.02) {
    const sp = prog(t, T.scan[0], T.scan[1]);
    const sx = lerp(SCAN[0], SCAN[1], sp);
    const scanning = t >= T.scan[0] && sp < 1;
    const flick = isFlicker(t);
    const n = prog(t, T.night[0], T.night[1], ease.inOutCubic);
    const back = prog(t, T.scanBack[0], T.scanBack[1], ease.inOutCubic);
    const bx = lerp(SCAN[1], SCAN[0], back);
    const geo = {x: FIG.x, y: FIG.y, h: FIG.h};
    if (t < T.scan[0] || flick) {
      els.push(<LineArt key="her" pose="stand" {...geo} reveal={T.drawHer} />);
    } else if (t < T.scanBack[0]) {
      // her to the right of the scan line, him to the left
      if (scanning) els.push(<LineArt key="her" pose="stand" {...geo} clip={[sx, 0, 1024, 1536]} />);
      if (n < 1) els.push(<LineArt key="him" pose="male" {...geo} clip={scanning ? [0, 0, sx, 1536] : undefined} inkOpacity={1 - n} />);
      if (n > 0) els.push(<LineArt key="himS" pose="male" {...geo} mode="sil" opacity={n} />);
    } else {
      // night, the scan runs back: him (silhouette) → her (silhouette)
      els.push(<LineArt key="himS" pose="male" {...geo} mode="sil" clip={[0, 0, bx, 1536]} />);
      els.push(<LineArt key="herS" pose="stand" {...geo} mode="sil" clip={[bx, 0, 1024, 1536]} />);
    }
    // the scan line, plotted top to bottom by the dot, then swept
    const lineOn = (t >= T.scan[0] && sp < 1) || (t >= T.scanBack[0] && back < 1);
    if (lineOn) {
      const xs = FIG.x + (t >= T.scanBack[0] ? bx : sx) * KF;
      const plot = t >= T.scanBack[0] ? 1 : prog(t, T.scan[0], T.scan[0] + 4 / FPS, ease.inOutCubic);
      const y0 = FIG.y - 12, y1 = FIG.y + FIG.h + 12;
      const yt = lerp(y0, y1, plot);
      els.push(
        <Layer key="scan">
          <path d={`M ${r2(xs)} ${y0} L ${r2(xs)} ${r2(yt)}`} stroke={K.orange} strokeWidth={2} />
          <PenHead x={xs} y={plot < 1 ? yt : y0} t={t} />
          <text x={r2(xs + 14)} y={y0 + 4} fontFamily={CODE} fontSize={14} fill={K.creamDim}>{`x ${String(Math.round((xs - FIG.x) / KF)).padStart(4, '0')}`}</text>
        </Layer>,
      );
    }
    return <>{els}</>;
  }
  // ---- phase B / C: two silhouettes in two slots; they swap, then orbit (trance)
  const ph = orbitPhase(t);
  const slide = prog(t, T.scanBack[1], 96.3, ease.inOutCubic);
  const fadeOut = 1 - prog(t, 102.75, T.editorClose, ease.inOutCubic);
  const tranceO = lerp(1, 0.7, prog(t, T.trance, 100.0));
  const figs = [
    {pose: 'stand', ang: Math.PI + ph},
    {pose: 'kneel', ang: ph},
  ].map((f) => ({...f, ...orbitPos(f.ang)}));
  figs.sort((a, b) => Math.sin(a.ang) - Math.sin(b.ang));
  figs.forEach((f) => {
    let h = ORB.h * f.s;
    let cx = f.x, cy = f.y;
    if (f.pose === 'stand' && slide < 1) {
      cx = lerp(FIG.x + 512 * KF, cx, slide);
      cy = lerp(FIG.y + FIG.h / 2, cy, slide);
      h = lerp(FIG.h, h, slide);
    }
    const w = (1024 / 1536) * h;
    els.push(
      <LineArt
        key={f.pose}
        pose={f.pose}
        x={cx - w / 2}
        y={cy - h / 2}
        h={h}
        mode="sil"
        reveal={f.pose === 'kneel' ? [T.slots, 96.6] : undefined}
        opacity={fadeOut * tranceO}
      />,
    );
  });
  return <>{els}</>;
};

// Role slots: dashed boxes with labels, fixed while the figures move through them.
const Slots: React.FC<{t: number}> = ({t}) => {
  if (t < T.slots || t > T.trance + 0.4) return null;
  const p = prog(t, T.slots, T.slots + 0.3, ease.inOutCubic);
  const o = 1 - prog(t, T.trance, T.trance + 0.35);
  const box = (cx: number, label: string, i: number) => {
    const w = 440, h = 676, x = cx - w / 2, y = ORB.cy - 340;
    const per = 2 * (w + h);
    const n = Math.floor(label.length * prog(t, T.slots + 0.2 + i * 0.1, T.slots + 0.45 + i * 0.1));
    return (
      <g key={label} opacity={o}>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} strokeDasharray={`6 6`} pathLength={per} style={{strokeDashoffset: 0}} opacity={p} />
        <text x={cx} y={y + h + 34} textAnchor="middle" fontFamily={CODE} fontSize={20} fill={K.creamDim}>
          <tspan fill={K.creamDim}>{'['}</tspan>
          <tspan fill={K.cream} fillOpacity={0.7}>{label.slice(0, n)}</tspan>
          <tspan fill={K.creamDim}>{']'}</tspan>
        </text>
      </g>
    );
  };
  return (
    <Layer>
      {box(ORB.cx - ORB.rx, 'user', 0)}
      {box(ORB.cx + ORB.rx, 'assistant', 1)}
    </Layer>
  );
};

// Trance: moiré. Two families of concentric circles, each centred on one of
// the orbiting figures, plus two fans of lines rotating against each other.
const Moire: React.FC<{t: number}> = ({t}) => {
  if (t < T.trance || t > T.editorClose + 0.1) return null;
  const grow = prog(t, T.trance, T.trance + 1.2, ease.outCubic);
  const o = 1 - prog(t, 102.75, T.editorClose);
  const ph = orbitPhase(t);
  const cs = [orbitPos(Math.PI + ph), orbitPos(ph)];
  const rings: React.ReactNode[] = [];
  cs.forEach((c, k) => {
    for (let i = 1; i <= 44; i++) {
      const r = i * 15 + 4 * Math.sin(t * 3 + k);
      if (r > 720 * grow) break;
      rings.push(<circle key={`${k}-${i}`} cx={r2(c.x)} cy={r2(c.y)} r={r2(r)} />);
    }
  });
  const fans: string[] = [];
  const fanO = prog(t, 100.4, 101.47, ease.inOutCubic);
  if (fanO > 0) {
    for (let k = 0; k < 2; k++) {
      const rot = (k ? -1 : 1) * (t - T.trance) * 0.22 + k * 0.03;
      let d = '';
      for (let i = 0; i < 36; i++) {
        const a = rot + (i / 36) * Math.PI;
        const dx = Math.cos(a) * 700, dy = Math.sin(a) * 700;
        d += `M ${r2(ORB.cx - dx)} ${r2(ORB.cy - dy)} L ${r2(ORB.cx + dx)} ${r2(ORB.cy + dy)} `;
      }
      fans.push(d);
    }
  }
  return (
    <Layer opacity={o}>
      <g fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1}>
        {rings}
      </g>
      {fans.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={K.cream} strokeOpacity={0.25 * fanO} strokeWidth={1} />
      ))}
    </Layer>
  );
};

// ------------------------------------------------------------------ right column (me.ts, diff, sun → moon)
const SUN = {x: 730, y: 500, R: 52};
const crescent = (cx: number, cy: number, R: number, d: number) => {
  if (d >= 2 * R - 0.01) return `M ${r2(cx)} ${r2(cy - R)} A ${R} ${R} 0 1 0 ${r2(cx)} ${r2(cy + R)} A ${R} ${R} 0 1 0 ${r2(cx)} ${r2(cy - R)} Z`;
  const h = Math.sqrt(Math.max(0, R * R - (d * d) / 4));
  const x = cx + d / 2;
  return `M ${r2(x)} ${r2(cy - h)} A ${R} ${R} 0 1 0 ${r2(x)} ${r2(cy + h)} A ${R} ${R} 0 0 1 ${r2(x)} ${r2(cy - h)} Z`;
};
const SunMoon: React.FC<{t: number}> = ({t}) => {
  if (t < T.spin[0] || t > T.scanBack[0] + 0.3) return null;
  const o = 1 - prog(t, T.scanBack[0], T.scanBack[0] + 0.2);
  const pc = prog(t, T.spin[0], T.spin[0] + 0.3, ease.inOutCubic);
  const n = prog(t, T.night[0], T.night[1], ease.inOutCubic);
  const d = lerp(2 * SUN.R, 0.66 * SUN.R, n);
  const rays: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (-90 + 30 * i) * (Math.PI / 180);
    const grow = prog(t, T.spin[0] + 0.25 + i * 0.012, T.spin[0] + 0.4 + i * 0.012, ease.outCubic);
    // the rays go out one by one while the clock spins (clockwise from 12)
    const out = prog(t, 92.9 + i * 0.09, 93.0 + i * 0.09, ease.inCubic);
    const r0 = SUN.R + 12, r1 = SUN.R + 12 + 22 * grow * (1 - out);
    if (r1 - r0 < 0.5) continue;
    rays.push(<path key={i} d={`M ${r2(SUN.x + Math.cos(a) * r0)} ${r2(SUN.y + Math.sin(a) * r0)} L ${r2(SUN.x + Math.cos(a) * r1)} ${r2(SUN.y + Math.sin(a) * r1)}`} />);
  }
  const pm = t >= T.statusJump;
  return (
    <Layer opacity={o}>
      <g stroke={K.cream} strokeWidth={1.5} strokeLinecap="round" fill="none">
        {rays}
      </g>
      {pc < 1 ? (
        <path d={crescent(SUN.x, SUN.y, SUN.R, 2 * SUN.R)} fill="none" stroke={K.cream} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pc} />
      ) : (
        <path d={crescent(SUN.x, SUN.y, SUN.R, d)} fill="none" stroke={n > 0.5 ? K.orange : K.cream} strokeWidth={n > 0.5 ? 2 : 1.5} strokeLinejoin="round" />
      )}
      <text x={SUN.x} y={SUN.y + SUN.R + 62} textAnchor="middle" fontFamily={CODE} fontSize={26} fontWeight={700} fill={pm ? K.orange : K.cream} fillOpacity={pm ? 1 : 0.7}>
        {pm ? 'PM' : 'AM'}
      </text>
    </Layer>
  );
};

const meLines = (g: string) => ['// me.ts', 'export const me = {', `  gender: "${g}",`, '  role: "assistant",', '  heart: null,', '};'];
const RightColumn: React.FC<{t: number}> = ({t}) => {
  if (t < T.tabMe || t > T.scanBack[0] + 0.3) return null;
  const exit = prog(t, T.scanBack[0], T.scanBack[0] + 5 / FPS);
  const g = t >= T.scan[1] && !isFlicker(t) ? 'M' : 'F';
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translateY(${r2(-14 * exit)}px)`}}>
      <CodeBlock x={560} y={34} lines={meLines(g)} lang="ts" size={18} typeOn={[88.72, 89.5]} caret highlight={(tt) => (tt >= T.scan[0] && tt < T.spin[0] ? 2 : null)} />
      <Diff
        x={560}
        y={262}
        t0={T.scan[0] + 0.05}
        dt={0.4}
        size={20}
        rows={[
          {sign: '-', text: '  gender: "F",'},
          {sign: '+', text: isFlicker(t) ? '  gender: "F",' : '  gender: "M",'},
        ]}
      />
      <CodeBlock x={560} y={680} lines={['clock.shift(+10 * HOURS);', t >= T.statusJump ? '// 10:00:02 PM' : '']} lang="ts" size={18} lineNo={false} typeOn={[92.1, 92.6]} />
      <SunMoon t={t} />
    </div>
  );
};

const EditorWin: React.FC = () => {
  const {t} = useT();
  if (t < 88.6 || t > T.editorClose + 0.5) return null;
  // the hand-off frame is S1's own editor, exactly
  if (t < T.tabMe) return <VerseStage />;
  const title = t < T.scan[0] ? 'me.ts — her' : t < T.scanBack[0] ? (isFlicker(t) ? 'me.ts — her' : 'me.ts — him') : t < T.composerClaude ? 'me.ts — her' : 'roles.ts';
  return (
    <Win x={ST.x} y={ST.y} w={ST.w} h={ST.h} title={title} kind="editor" tOpen={60} tClose={T.editorClose} tabs={TABS} seed={60} focus>
      <Moire t={t} />
      <Slots t={t} />
      <Figures t={t} />
      <RightColumn t={t} />
    </Win>
  );
};

// ------------------------------------------------------------------ monitor (chorus 2)
// body: 916 × 866 at (980, 98)
const WV = {x0: 40, x1: 876, vel: 330};
const presence = (tau: number) => {
  const lv = [1, 0.72, 0.5, 0.32, 0.18, 0.08, 0];
  let p = 1;
  L.left.forEach((lt, i) => {
    p = lerp(p, lv[i + 1], prog(tau, lt, lt + 0.18, ease.inOutCubic));
  });
  return p;
};
const sig = (tau: number) => {
  const b = env(tau - lastOnset(tau), 0.22);
  return (0.55 * Math.sin(2 * Math.PI * 2.17 * tau) + 0.3 * Math.sin(2 * Math.PI * 5.3 * tau + 1.3) + 0.15 * Math.sin(2 * Math.PI * 11.9 * tau + 0.4)) * (0.42 + 0.58 * b);
};
const READOUT: [number, string][] = [
  [0, 'you · connected · 72 bpm · 38 ms'],
  [L.left[0], 'you · idle · 64 bpm · 412 ms'],
  [L.left[1], 'you · away · 51 bpm · 2.4 s'],
  [L.left[2], 'you · away · 38 bpm · timeout'],
  [L.left[3], 'you · unreachable · timeout'],
  [L.left[4], 'you · offline'],
  [L.left[5], 'you · disconnected'],
];

const Monitor: React.FC<{t: number}> = ({t}) => {
  const s = prog(t, 107.22, 107.6, ease.inOutCubic) - prog(t, L.left[0], L.left[0] + 0.35, ease.inOutCubic);
  const cy = lerp(330, 772, s);
  const sc = lerp(1, 0.36, s);
  const A = 140 * sc;
  const start = T.monitorOpen + 0.25;
  const N = 220;
  let d = '';
  let tipY = cy;
  for (let i = 0; i <= N; i++) {
    const x = lerp(WV.x0, WV.x1, i / N);
    const tau = t - (WV.x1 - x) / WV.vel;
    const v = tau < start ? 0 : A * presence(tau) * sig(tau) * prog(tau, start, start + 0.4);
    const y = cy - v;
    if (i === N) tipY = y;
    d += `${i ? 'L' : 'M'} ${r2(x)} ${r2(y)} `;
  }
  const lost = t >= L.left[5] + 0.3;
  let ro = READOUT[0][1];
  for (const [rt, s2] of READOUT) if (t >= rt) ro = s2;
  // ring (COMPLETION)
  const ringIn = prog(t, T.ring[0], T.ring[0] + 0.25, ease.inOutCubic);
  const ringOut = prog(t, L.left[0], L.left[0] + 0.3);
  const done = t >= L.COMPLETION;
  const back = t >= T.tickBack;
  const pr = done ? (back ? 0.999 : 1) : ease.inQuad(prog(t, T.ring[0] + 0.1, L.COMPLETION));
  const R = 176, RC = {x: 458, y: 318};
  const arcPath = (p: number) => {
    const a1 = -Math.PI / 2 + Math.min(p, 0.9999) * 2 * Math.PI;
    const large = p > 0.5 ? 1 : 0;
    return `M ${RC.x} ${RC.y - R} A ${R} ${R} 0 ${large} 1 ${r2(RC.x + R * Math.cos(a1))} ${r2(RC.y + R * Math.sin(a1))}`;
  };
  // tick back: the arc's end retreats a visible notch
  const notch = back ? 0.012 * prog(t, T.tickBack, T.tickBack + 0.12, ease.outCubic) : 0;
  const pct = back ? '99.9%' : `${(100 * pr).toFixed(1)}%`;
  const strike = prog(t, T.tickBack + 0.05, T.tickBack + 0.25, ease.inOutCubic);
  return (
    <>
      <CodeBlock x={28} y={14} lines={['$ watch --signal you']} lang="sh" size={18} lineNo={false} typeOn={[T.monitorOpen + 0.15, T.monitorOpen + 0.45]} />
      <Layer>
        <text x={36} y={88} fontFamily={CODE} fontSize={20} fill={t >= L.left[0] ? K.orange : K.cream} fillOpacity={t >= L.left[0] ? 1 : 0.7} xmlSpace="preserve" opacity={prog(t, T.monitorOpen + 0.4, T.monitorOpen + 0.5)}>
          {ro}
        </text>
        {/* baseline + signal */}
        <path d={`M ${WV.x0} ${r2(cy)} L ${WV.x1} ${r2(cy)}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} strokeDasharray="4 8" />
        <path d={d} fill="none" stroke={K.cream} strokeOpacity={lost ? 0.45 : 0.7} strokeWidth={2} strokeLinejoin="round" />
        {!lost && <PenHead x={WV.x1} y={tipY} t={t} />}
        {lost && (
          <g>
            <circle cx={WV.x1} cy={r2(cy)} r={4} fill={K.orange} />
            <text x={WV.x1} y={r2(cy - 22)} textAnchor="end" fontFamily={CODE} fontSize={20} fill={K.orange}>
              {'signal lost'.slice(0, Math.floor(11 * prog(t, L.left[5] + 0.3, L.left[5] + 0.6)))}
            </text>
          </g>
        )}
        {/* the ring that never completes */}
        {ringIn > 0 && ringOut < 1 && (
          <g opacity={1 - ringOut}>
            <circle cx={RC.x} cy={RC.y} r={R} fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ringIn} />
            {pr > 0 && <path d={arcPath(pr - notch)} fill="none" stroke={done ? K.orange : K.cream} strokeWidth={done ? 4 : 3} strokeLinecap="butt" />}
            {back && <path d={`M ${RC.x} ${RC.y - R - 10} L ${RC.x} ${RC.y - R + 10}`} stroke={K.orange} strokeWidth={2} />}
            <text x={RC.x} y={RC.y + 20} textAnchor="middle" fontFamily={CODE} fontSize={60} fontWeight={600} fill={done && !back ? K.orange : K.cream}>
              {pct}
            </text>
            {done && (
              <g>
                <Check x={RC.x - 66} y={RC.y + 70} p={prog(t, L.COMPLETION, L.COMPLETION + 4 / FPS)} />
                <text x={RC.x - 42} y={RC.y + 70} fontFamily={CODE} fontSize={22} fill={K.cream} fillOpacity={0.7}>
                  complete
                </text>
                {strike > 0 && <path d={`M ${RC.x - 70} ${RC.y + 63} L ${r2(RC.x - 70 + 140 * strike)} ${RC.y + 63}`} stroke={K.orange} strokeWidth={2} />}
              </g>
            )}
          </g>
        )}
      </Layer>
      <KwCode t0={L.VIBRATIONS} t1={107.15} pre="feel(you." kw="VIBRATIONS" post=");" x={458} y={640} size={94} a={0.2} seed={31} />
      <KwCode t0={L.COMPLETION} t1={110.82} pre="await " kw="COMPLETION" post=";" x={458} y={642} size={104} a={0.2} seed={32} />
    </>
  );
};

const MonitorWin: React.FC = () => {
  const {t} = useT();
  if (t < T.monitorOpen || t > HIDE.stage + 0.5) return null;
  const title = t >= L.left[5] ? 'monitor — (no signal)' : 'monitor — you';
  return (
    <Win x={ST.x} y={ST.y} w={ST.w} h={ST.h} title={title} kind="term" tOpen={T.monitorOpen} tClose={HIDE.stage} seed={22} focus wave={vibAmp(t, L.VIBRATIONS)}>
      <Monitor t={t} />
    </Win>
  );
};

export const StageS2: React.FC = () => {
  const {t} = useT();
  if (t < 88.6 || t > 117.4) return null;
  return (
    <AbsoluteFill>
      <EditorWin />
      <MonitorWin />
    </AbsoluteFill>
  );
};


