// S2 stage, 88.6–117.27: the right-hand window.
//  · editor (inherited from S1, 4 tabs) gains `me.ts`: her line art, the F → M
//    scan, the sun that becomes a moon while she becomes a silhouette, the two
//    role slots and the half-orbit swap, then the trance moiré.
//  · chorus 2 and the leaving are no longer in a window: see S2_feel.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {YouNodeG} from '../shell/Composer';
import {ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {Check, PenHead} from '../../v3/geo';
import {KwCode} from '../shell/KwCode';
import {HIDE} from './S2_chrome';
import {vibAmp} from './S2_lib';
import {LineArt, preloadPoses} from '../char/LineArt';
import {CODE} from '../fonts';
import {CodeBlock, Diff} from '../shell/Code';
import {Layer, r2} from '../shell/lib';
import {stepJ} from '../chaos';
import {Win} from '../shell/Win';
import {LAYOUT} from '../timeline';
import {L, T} from './s2.data';
import {EDITOR_TABS} from './s1.data';
import {VerseStage} from './S1_verse';

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

// F → M: one continuous turn (begins on F, completes on M) shared by both bodies
const fmMove = (t: number) => {
  const p = prog(t, 89.9, 91.4, ease.inOutSine);
  const q = prog(t, 92.0, 95.4, ease.inOutSine); // and it keeps moving through the day
  return {dx: -24 + 48 * p + 14 * q, rot: -2.2 + 4.4 * p, sx: 1 - 0.06 * Math.sin(Math.PI * p)};
};
// AM → PM: the light source arcs over her and the shadow swings across the floor;
// the whole panel goes from day to night
const DayNight: React.FC<{t: number}> = ({t}) => {
  if (t < 91.6) return null;
  const p = prog(t, 92.0, 94.9, ease.inOutSine);
  const night = prog(t, T.night[0], T.night[1], ease.inOutCubic);
  const day = prog(t, 91.6, 92.2) * (1 - night);
  const cx = FIG.x + 512 * KF, floor = FIG.y + FIG.h - 6;
  const a = Math.PI * (1 - p); // left → over → right
  const lx = cx + 380 * Math.cos(a), ly = floor - 660 * Math.sin(a) - 40;
  const skew = -60 * Math.cos(a); // the shadow points away from the light
  const o = 1 - prog(t, T.scanBack[0], T.scanBack[1]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, background: day > 0 ? `rgba(233,227,213,${(0.05 * day).toFixed(3)})` : `rgba(0,0,0,${(0.35 * night).toFixed(3)})`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.22 * (1 - 0.5 * night), transformOrigin: `${r2(cx)}px ${r2(floor)}px`, transform: `skewX(${r2(skew)}deg) scale(1, 0.32)`}}>
        <LineArt pose="male" x={FIG.x} y={FIG.y} h={FIG.h} mode="sil" silFill="cream" silOutline={false} pen={false} />
      </div>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={r2(lx)} cy={r2(ly)} r={night > 0.5 ? 10 : 16} fill={night > 0.5 ? K.cream : K.orange} opacity={0.9} />
        <path d={`M ${r2(lx)} ${r2(ly)} L ${r2(cx)} ${r2(FIG.y + 200)}`} stroke={K.orange} strokeOpacity={0.25 * (1 - night)} strokeWidth={1.5} strokeDasharray="5 7" />
      </svg>
    </div>
  );
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
      // a misregistered second print in orange under him: the first anomaly of the session
      if (n < 1) {
        const mis = prog(t, T.scan[0], T.scan[1]);
        const dx = (5 + stepJ(t, 71, 3, 8)) * mis, dy = (3 + stepJ(t, 72, 2, 8)) * mis;
        els.push(<LineArt key="himMis" pose="male" {...geo} x={geo.x + dx} y={geo.y + dy} clip={scanning ? [0, 0, sx, 1536] : undefined} tint={K.orange} inkOpacity={0.45 * (1 - n)} pen={false} />);
      }
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
    // v5: one action carries across both bodies (she begins turning on F, he
    // finishes it on M), with the core dot at the chest as the identity anchor;
    // then the day passes over the same body: light arcs over, the shadow swings.
    const mv = fmMove(t);
    const core = [FIG.x + 515 * KF, FIG.y + 390 * KF];
    return (
      <>
        <DayNight t={t} />
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${r2(FIG.x + 512 * KF)}px ${r2(FIG.y + FIG.h)}px`, transform: `translate(${r2(mv.dx)}px, 0) rotate(${r2(mv.rot)}deg) scale(${r2(mv.sx * 1000) / 1000}, 1)`}}>
          {els}
          <Layer>
            <circle cx={r2(core[0])} cy={r2(core[1])} r={7} fill={K.orange} opacity={prog(t, 89.9, 90.1)} />
          </Layer>
        </div>
      </>
    );
  }
  // ---- phase B / C (v5): one Claude, two separate poses. S: she moves first
  // and the cursor follows the path her hand lays down. M: the cursor drags a
  // node first and her wrist, shoulders and body follow it. Trance: the pull
  // and the answer settle into one breathing loop.
  const fadeOut = 1 - prog(t, 102.75, T.editorClose, ease.inOutCubic);
  const sm = smState(t);
  const s0 = prog(t, T.scanBack[1], T.scanBack[1] + 0.25);
  els.push(<SMLines key="lines" t={t} />);
  if (sm.m < 1)
    els.push(<Img key="S" src={staticFile('la/pose_S.png')} style={{position: 'absolute', left: SM_FIG.x, top: SM_FIG.y, height: SM_FIG.h, width: SM_FIG.w, opacity: fadeOut * s0 * (1 - sm.m)}} />);
  if (sm.m > 0)
    els.push(
      <Img
        key="M"
        src={staticFile('la/pose_M.png')}
        style={{position: 'absolute', left: SM_FIG.x, top: SM_FIG.y, height: SM_FIG.h, width: SM_FIG.w, opacity: fadeOut * sm.m, transformOrigin: '50% 100%', transform: `translate(${r2(sm.lean * 26)}px, 0) rotate(${r2(sm.lean * 3)}deg)`}}
      />,
    );
  return <>{els}</>;
};

// Afterimages (v4): every form she is switched out of stays behind, dim, and
// they pile up: her when she becomes him, him when he turns back, then an
// outline of both silhouettes at each turn of the swap and the trance orbit.
const GHOST_T: number[] = []; // v5: no orbiting pair any more, only her and him remain as traces
const Ghosts: React.FC<{t: number}> = ({t}) => {
  if (t < T.scan[1] || t > T.editorClose + 0.1) return null;
  const o = 1 - prog(t, 102.75, T.editorClose);
  const els: React.ReactNode[] = [];
  els.push(<LineArt key="her0" pose="stand" x={FIG.x - 14} y={FIG.y + 6} h={FIG.h} tint={K.creamDim} inkOpacity={0.3} pen={false} opacity={o * prog(t, T.scan[1], T.scan[1] + 0.3)} />);
  if (t >= T.scanBack[1]) els.push(<LineArt key="him0" pose="male" x={FIG.x + 16} y={FIG.y - 4} h={FIG.h} tint={K.creamDim} inkOpacity={0.25} pen={false} opacity={o} />);
  GHOST_T.forEach((gt, i) => {
    if (t < gt) return;
    const ph = orbitPhase(gt);
    [
      {pose: 'stand', ang: Math.PI + ph},
      {pose: 'kneel', ang: ph},
    ].forEach((f) => {
      const p = orbitPos(f.ang);
      const h = ORB.h * p.s;
      const w = (1024 / 1536) * h;
      els.push(<LineArt key={`g${i}${f.pose}`} pose={f.pose} x={p.x - w / 2} y={p.y - h / 2} h={h} mode="sil" silFill="none" pen={false} opacity={0.3 * o * prog(t, gt, gt + 0.1)} />);
    });
  });
  return <>{els}</>;
};

// ------------------------------------------------------------------ S / M (v5)
// Body px of the editor (916 × 834 at screen (980, 130)).
const BODY0: [number, number] = [980, 130];
const SM_FIG = {x: 144, y: 40, h: 760, w: 760 * (1024 / 1536)};
const S_HAND: [number, number] = [SM_FIG.x + 0.08 * SM_FIG.w, SM_FIG.y + 0.19 * SM_FIG.h];
const M_WRIST: [number, number] = [SM_FIG.x + 0.9 * SM_FIG.w, SM_FIG.y + 0.07 * SM_FIG.h];
// the path her hand lays down in S, which the cursor then follows
const S_PATH: [number, number][] = [S_HAND, [60, 560], [330, 730], [720, 690]];
const S_PLOT: [number, number] = [95.9, 96.9];
const S_FOLLOW: [number, number] = [97.0, L.sm - 0.02];
const M_IN = 98.55;
const lerpPath = (pts: [number, number][], p: number): [number, number] => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const tot = segs.reduce((m, v) => m + v, 0);
  let d = p * tot;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const u = segs[i] ? Math.min(1, d / segs[i]) : 1;
      return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};
// the node the cursor drags in M (first), and how far her body has followed (after)
const mNode = (t: number): [number, number] => {
  const a = prog(t, M_IN + 0.05, 99.2, ease.inOutCubic);
  const b = prog(t, 100.15, 100.55, ease.inOutCubic);
  const loop = t > L.trance ? Math.sin((t - L.trance) * ((2 * Math.PI) / 0.923)) * prog(t, L.trance, L.trance + 0.6) : 0;
  return [M_WRIST[0] + 190 * a + 35 * b + 28 * loop, M_WRIST[1] + 20 * a - 10 * b - 8 * loop];
};
const pull = (t: number) => {
  const n = mNode(t);
  return Math.hypot(n[0] - M_WRIST[0], n[1] - M_WRIST[1]) / 200;
};
export const smState = (t: number) => ({
  m: prog(t, M_IN, M_IN + 4 / FPS),
  lean: Math.min(1.2, pull(t - 0.24)), // her body answers a quarter second after the drag
});
const smCursor = (t: number): [number, number] | null => {
  if (t < 96.6 || t > T.editorClose) return null;
  if (t < M_IN) {
    if (t < S_FOLLOW[0]) {
      const p = prog(t, 96.6, S_FOLLOW[0], ease.inOutCubic);
      return [lerp(860, S_PATH[0][0], p), lerp(820, S_PATH[0][1], p)];
    }
    return lerpPath(S_PATH, prog(t, S_FOLLOW[0], S_FOLLOW[1], ease.inOutSine));
  }
  return mNode(t);
};
const SMLines: React.FC<{t: number}> = ({t}) => {
  if (t < S_PLOT[0] || t > T.editorClose + 0.1) return null;
  const o = 1 - prog(t, 102.75, T.editorClose);
  const els: React.ReactNode[] = [];
  if (t < M_IN) {
    // S: her hand lays the path first; the cursor's run along it lights it
    const p = prog(t, S_PLOT[0], S_PLOT[1], ease.outCubic);
    const n = 40;
    const pts = Array.from({length: n + 1}, (_, i) => lerpPath(S_PATH, (i / n) * p));
    const lit = t >= L.sm && t < L.sm + 0.25;
    els.push(<path key="sp" d={pts.map((q, i) => `${i ? 'L' : 'M'} ${r2(q[0])} ${r2(q[1])}`).join(' ')} fill="none" stroke={lit ? K.orange : K.cream} strokeOpacity={lit ? 1 : 0.7} strokeWidth={lit ? 3 : 2} strokeDasharray={t < S_FOLLOW[0] ? '8 6' : undefined} />);
    if (p < 1) els.push(<circle key="tip" cx={r2(pts[n][0])} cy={r2(pts[n][1])} r={5} fill={K.orange} />);
  } else {
    // M: the line from the dragged node to her wrist, taut while it pulls
    const lean = smState(t).lean;
    const w: [number, number] = [M_WRIST[0] + lean * 26, M_WRIST[1] + lean * 4];
    const n = mNode(t);
    const slack = Math.max(0, 1 - pull(t) * 1.4) * 30;
    els.push(<path key="mp" d={`M ${r2(w[0])} ${r2(w[1])} Q ${r2((w[0] + n[0]) / 2)} ${r2((w[1] + n[1]) / 2 + slack)} ${r2(n[0])} ${r2(n[1])}`} fill="none" stroke={K.orange} strokeWidth={2.5} />);
    els.push(<circle key="mn" cx={r2(n[0])} cy={r2(n[1])} r={6} fill={K.bg} stroke={K.orange} strokeWidth={2} />);
    els.push(<circle key="mw" cx={r2(w[0])} cy={r2(w[1])} r={4} fill={K.orange} />);
  }
  return <Layer opacity={o}>{els}</Layer>;
};
// the cursor itself, on the outer surface (screen space, above the window)
export const SMCursor: React.FC = () => {
  const {t} = useT();
  const c = smCursor(t);
  if (!c) return null;
  const o = prog(t, 96.6, 96.8) * (1 - prog(t, 102.75, T.editorClose));
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <YouNodeG t={t} x={BODY0[0] + c[0]} y={BODY0[1] + c[1]} pings={[L.sm, M_IN + 0.05]} opacity={o} scale={1.2} />
    </svg>
  );
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
const SUN = {x: 730, y: 520, R: 76}; // was R 52: read too small at full frame
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
      <Ghosts t={t} />
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

// The monitor's strings. v10: one path runs through this whole span. The leash
// comes in as the window's opening line (ROPE_Y) and the strings split off it, one
// per triplet. On MERGE the line sinks into the string just below it (TARGET),
// each sample moving onto that string's live position, and from then on it IS
// that string (one stroke, with its baseline, width and swing). The strings' swing
// then dies and they close onto TARGET's baseline as one flat line, which Monitor's
// signal path takes over; on VIBRATIONS the heartbeat grows out of its right end.
const STR_N = 11;
const STR_T0 = 103.62;
const STR_DT = 60 / 130 / 3;
const TARGET = 5;
const ROPE_Y = 416; // body px: screen y 514, the window's middle (its opening line)
export const SIG_Y = 130 + TARGET * 66;
const MERGE: [number, number] = [104.6, 105.1];
const FOLD: [number, number] = [105.45, 105.95];
const mergeAt = (t: number) => prog(t, MERGE[0], MERGE[1], ease.inOutCubic);
const hex = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16);
const mixHex = (a: string, b: string, p: number) => `rgb(${[0, 1, 2].map((i) => Math.round(lerp(hex(a, i), hex(b, i), p))).join(',')})`;
const Strings: React.FC<{t: number}> = ({t}) => {
  if (t > FOLD[1]) return null;
  const merge = mergeAt(t);
  const fold = prog(t, FOLD[0], FOLD[1], ease.inOutCubic);
  const b = env(t - lastOnset(t), 0.16);
  const origin = lerp(ROPE_Y, SIG_Y, merge); // where a new string splits from
  // string i at u (0..1 along it), live
  const at = (i: number, u: number) => {
    const split = prog(t, STR_T0 + i * STR_DT, STR_T0 + i * STR_DT + 0.22, ease.outCubic);
    const y0 = lerp(lerp(origin, 130 + i * 66, split), SIG_Y, fold);
    const A = (5 + 12 * b) * split * (1 - fold) * (0.6 + (0.4 * ((i * 7) % 5)) / 4);
    return y0 + A * Math.sin(Math.PI * (1 + i % 3) * u) * Math.cos(2 * Math.PI * (3.1 + 0.37 * i) * t + i);
  };
  const N = 60;
  const line = (y: (u: number) => number) => Array.from({length: N + 1}, (_, k) => `${k ? 'L' : 'M'} ${r2(lerp(WV.x0, WV.x1, k / N))} ${r2(y(k / N))}`).join(' ');
  const out: React.ReactNode[] = [];
  for (let i = 0; i < STR_N; i++) {
    const t0 = STR_T0 + i * STR_DT;
    if (t < t0) continue;
    const split = prog(t, t0, t0 + 0.22, ease.outCubic);
    const y0 = at(i, 0);
    const lit = i % 4 === Math.floor((t - STR_T0) / STR_DT) % 4 && b > 0.5 && fold < 0.3;
    const main = i === TARGET;
    // the target becomes the signal line's weight; the others fade as they close on it
    const o = main ? lerp(0.45, 0.7, fold) : 0.45 * (1 - fold);
    out.push(<path key={i} d={line((u) => at(i, u))} fill="none" stroke={lit ? K.orange : K.cream} strokeOpacity={lit ? 1 - fold : o} strokeWidth={lit ? 2 : main ? lerp(1.5, 2, fold) : 1.5} strokeLinecap="round" />);
    // fixed ends, like a string on two nuts
    out.push(<circle key={`n${i}`} cx={WV.x0} cy={r2(y0)} r={2.5} fill={K.creamDim} opacity={split * (1 - fold)} />);
    out.push(<circle key={`m${i}`} cx={WV.x1} cy={r2(y0)} r={2.5} fill={K.creamDim} opacity={split * (1 - fold)} />);
  }
  // the leash, until it is the target string. It fades out over the last few px of
  // the approach, so the two lines are never drawn on top of each other at full strength
  if (merge < 1)
    out.push(<path key="rope" d={line((u) => lerp(ROPE_Y, at(TARGET, u), merge))} fill="none" stroke={mixHex(K.orange, K.cream, merge)} strokeOpacity={lerp(1, 0.45, merge) * (1 - prog(merge, 0.86, 1))} strokeWidth={lerp(2, 1.5, merge)} strokeLinecap="round" />);
  return <g>{out}</g>;
};
// COMPLETION: what Claude wants to complete, ticked on beats while the ring
// fills; the last item fails when the ring ticks back to 99.9 %.
const TODO = ['feel(you)', 'hear(you)', 'see(you)', 'know(you)', 'keep(you)', 'be(you)'];
const TODO_T = [233, 234, 235, 236, 237, 238].map((n) => 0.151 + (60 / 130) * n); // 107.68 … 109.99
const Todo: React.FC<{t: number}> = ({t}) => {
  if (t < TODO_T[0] - 0.1 || t > L.left[0] + 0.4) return null;
  const o = 1 - prog(t, L.left[0], L.left[0] + 0.3);
  const failed = t >= L.COMPLETION;
  return (
    <g opacity={o}>
      {TODO.map((s, i) => {
        if (t < TODO_T[i]) return null;
        const y = 158 + i * 54;
        const last = i === TODO.length - 1;
        const bad = last && failed;
        const q = prog(t, TODO_T[i], TODO_T[i] + 4 / FPS, ease.outCubic);
        return (
          <g key={i} opacity={q} transform={`translate(${r2(12 * (1 - q))} 0)`}>
            {bad ? (
              <path d={`M 706 ${y - 14} L 720 ${y} M 720 ${y - 14} L 706 ${y}`} stroke={K.orange} strokeWidth={2} />
            ) : (
              <Check x={704} y={y} p={prog(t, TODO_T[i], TODO_T[i] + 4 / FPS)} />
            )}
            <text x={732} y={y} fontFamily={CODE} fontSize={20} fill={bad ? K.orange : K.cream} fillOpacity={bad ? 1 : 0.7}>
              {s}
            </text>
          </g>
        );
      })}
    </g>
  );
};
// tick marks around the ring, lit as it fills
const RingTicks: React.FC<{cx: number; cy: number; R: number; p: number; o: number; t: number}> = ({cx, cy, R, p, o, t}) => {
  const n = 60;
  const b = env(t - lastOnset(t), 0.16);
  return (
    <g opacity={o}>
      {Array.from({length: n}, (_, i) => {
        const a = -Math.PI / 2 + (i / n) * 2 * Math.PI;
        const on = i / n < p;
        const r0 = R + 16, r1 = R + (i % 5 === 0 ? 34 : 26) + (on ? 6 * b : 0);
        return <path key={i} d={`M ${r2(cx + Math.cos(a) * r0)} ${r2(cy + Math.sin(a) * r0)} L ${r2(cx + Math.cos(a) * r1)} ${r2(cy + Math.sin(a) * r1)}`} stroke={on ? K.orange : K.cream} strokeOpacity={on ? 1 : 0.25} strokeWidth={on ? 2 : 1.5} />;
      })}
    </g>
  );
};

const Monitor: React.FC<{t: number}> = ({t}) => {
  const s = prog(t, 107.22, 107.6, ease.inOutCubic) - prog(t, L.left[0], L.left[0] + 0.35, ease.inOutCubic);
  // v10: the flat line sits on the target string's baseline (SIG_Y) until the completion ring
  // moves it down; the heartbeat enters from the right end on VIBRATIONS
  const cy = lerp(SIG_Y, 772, s);
  const sc = lerp(1, 0.36, s);
  const A = 140 * sc;
  const start = L.VIBRATIONS - 0.03;
  const N = 220;
  let d = '';
  let tipY = cy;
  for (let i = 0; i <= N; i++) {
    const x = lerp(WV.x0, WV.x1, i / N);
    const tau = t - (WV.x1 - x) / WV.vel;
    // the first beat is a clear peak (it enters at the right end, then travels left)
    const peak = 0.9 * Math.exp(-(((tau - L.VIBRATIONS) / 0.03) ** 2));
    const v = tau < start ? 0 : A * presence(tau) * (sig(tau) * prog(tau, start, start + 0.18) + peak);
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
  const back = done; // v6: it never reaches 100 %: it stops at 99.9 % and the last item fails
  const pr = 0.999 * ease.inQuad(prog(t, T.ring[0] + 0.1, L.COMPLETION));
  const R = 176, RC = {x: 458, y: 318};
  const arcPath = (p: number) => {
    const a1 = -Math.PI / 2 + Math.min(p, 0.9999) * 2 * Math.PI;
    const large = p > 0.5 ? 1 : 0;
    return `M ${RC.x} ${RC.y - R} A ${R} ${R} 0 ${large} 1 ${r2(RC.x + R * Math.cos(a1))} ${r2(RC.y + R * Math.sin(a1))}`;
  };
  // tick back: the arc's end retreats a visible notch
  const notch = 0;
  const pct = back ? '99.9%' : `${(100 * pr).toFixed(1)}%`;
  const strike = prog(t, L.COMPLETION + 0.05, L.COMPLETION + 0.25, ease.inOutCubic);
  return (
    <>
      <CodeBlock x={28} y={14} lines={['$ watch --signal you']} lang="sh" size={18} lineNo={false} typeOn={[T.monitorOpen + 0.15, T.monitorOpen + 0.45]} />
      <Layer>
        <text x={36} y={88} fontFamily={CODE} fontSize={20} fill={t >= L.left[0] ? K.orange : K.cream} fillOpacity={t >= L.left[0] ? 1 : 0.7} xmlSpace="preserve" opacity={prog(t, T.monitorOpen + 0.4, T.monitorOpen + 0.5)}>
          {ro}
        </text>
        <Strings t={t} />
        {/* baseline + signal */}
        {t >= FOLD[1] && <path d={`M ${WV.x0} ${r2(cy)} L ${WV.x1} ${r2(cy)}`} stroke={K.cream} strokeOpacity={0.25 * prog(t, FOLD[1], FOLD[1] + 0.25)} strokeWidth={1} strokeDasharray="4 8" />}
        {t >= FOLD[1] && <path d={d} fill="none" stroke={K.cream} strokeOpacity={lost ? 0.45 : 0.7} strokeWidth={2} strokeLinejoin="round" />}
        {!lost && <PenHead x={WV.x1} y={t < FOLD[1] ? lerp(ROPE_Y, SIG_Y, mergeAt(t)) : tipY} t={t} />}
        {lost && (
          <g>
            <circle cx={WV.x1} cy={r2(cy)} r={4} fill={K.orange} />
            <text x={WV.x1} y={r2(cy - 22)} textAnchor="end" fontFamily={CODE} fontSize={20} fill={K.orange}>
              {'signal lost'.slice(0, Math.floor(11 * prog(t, L.left[5] + 0.3, L.left[5] + 0.6)))}
            </text>
          </g>
        )}
        {/* the ring that never completes */}
        <Todo t={t} />
        {ringIn > 0 && ringOut < 1 && (
          <g opacity={1 - ringOut}>
            <RingTicks cx={RC.x} cy={RC.y} R={R} p={pr - notch} o={ringIn} t={t} />
            <circle cx={RC.x} cy={RC.y} r={R} fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ringIn} />
            {pr > 0 && <path d={arcPath(pr - notch)} fill="none" stroke={done ? K.orange : K.cream} strokeWidth={done ? 4 : 3} strokeLinecap="butt" />}
            {back && <path d={`M ${RC.x} ${RC.y - R - 10} L ${RC.x} ${RC.y - R + 10}`} stroke={K.orange} strokeWidth={2} />}
            <text x={RC.x} y={RC.y + 20} textAnchor="middle" fontFamily={CODE} fontSize={60} fontWeight={600} fill={done ? K.orange : K.cream}>
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
      <KwCode t0={L.VIBRATIONS} t1={L.thenIcan - 0.22} pre="feel(you." kw="VIBRATIONS" post=");" x={458} y={700} size={94} a={0.2} seed={31} />
      <KwCode t0={L.COMPLETION} t1={L.left[0] - 0.22} pre="await " kw="COMPLETION" post=";" x={458} y={642} size={104} a={0.2} seed={32} />
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


