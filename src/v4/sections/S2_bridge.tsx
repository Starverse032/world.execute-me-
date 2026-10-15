// S2 after the chrome is gone, 117.27–131.72:
//  ISOLATION (her back, alone in a shrinking pool of grid) · FRAGMENTS (the
//  debris of the conversation, deleted on 16ths, except `you`, which is busy)
//  · DISHEARTENED (`you` becomes the pen that draws the heart, which cracks
//  and splits) · the standoff (her defiant face vs. the god spark in a frame
//  too small for it; the distance closes on every beat, the tether trembles,
//  a spike pierces the border) · ILLEGAL ARGUMENTS (stack trace floods, the
//  frame shatters, a lone spark is left).
import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {beat, clamp01, ease, env, FPS, K, lastOnset, lerp, prog, pulse, useT} from '../../v3/core';
import {PenHead} from '../../v3/geo';
import {arcPts, cumLen, RaySpark, Seg, Stroke} from '../../v3/sections/B_util';
import {LineArt, preloadPoses} from '../char/LineArt';
import {hash, hashS, stepJ} from '../chaos';
import {CODE, SERIF} from '../fonts';
import {CodeBlock} from '../shell/Code';
import {TetherG} from '../shell/Composer';
import {KwCode} from '../shell/KwCode';
import {Layer, P2, r2, rrPath} from '../shell/lib';
import {Transcript} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {BEATS, BRIDGE_ENTRIES, L, T} from './s2.data';
import {lerp2, stepped} from './S2_lib';
import {SPARK0} from './s3.data';

preloadPoses('back', 'face_defy');

const BEAT16 = (60 / 130) / 4;

// ------------------------------------------------------------------ her back (ISOLATION → 125.7)
const BACK = {x: 860, y: 740, h: 300};
const BackFigure: React.FC<{t: number}> = ({t}) => {
  if (t < T.herBack[0] || t > L.god + 0.2) return null;
  const o = 1 - prog(t, L.god - 0.05, L.god + 0.15);
  return <LineArt pose="back" {...BACK} mode="sil" reveal={T.herBack} opacity={o} />;
};

// ------------------------------------------------------------------ FRAGMENTS
type Frag = {id: string; c: P2; w: number; h: number; rot: number; side: 1 | -1; body: React.ReactNode};
const pill = (text: string, w: number) => (
  <g>
    <rect x={0.75} y={0.75} width={w - 1.5} height={48.5} rx={14} fill={K.surface} stroke={K.line2} strokeWidth={1.5} />
    <text x={20} y={32} fontFamily={CODE} fontSize={20} fill={K.creamDim}>
      ›
    </text>
    <text x={44} y={32} fontFamily={CODE} fontSize={20} fill={K.cream} fillOpacity={0.7}>
      {text}
    </text>
  </g>
);
const row = (text: string, sel = false) => (
  <g>
    {sel && <rect x={0} y={2} width={210} height={34} rx={7} fill={K.line2} fillOpacity={0.35} />}
    {sel && <rect x={0} y={8} width={2} height={22} fill={K.orange} />}
    <text x={16} y={24} fontFamily={CODE} fontSize={15} fill={K.cream} fillOpacity={sel ? 1 : 0.7}>
      {text}
    </text>
  </g>
);
const FRAGS: Frag[] = [
  {id: 'new', c: [180, 150], w: 190, h: 36, rot: -7, side: 1, body: <g><path d="M 8 18 L 20 18 M 14 12 L 14 24" stroke={K.creamDim} strokeWidth={1.5} /><text x={34} y={23} fontFamily={CODE} fontSize={15} fill={K.cream} fillOpacity={0.7}>New chat</text></g>},
  {id: 'chorus', c: [175, 252], w: 210, h: 38, rot: 9, side: -1, body: row('chorus', true)},
  {id: 'objects', c: [250, 335], w: 210, h: 38, rot: -4, side: 1, body: row('objects.ts')},
  {id: 'pill1', c: [585, 205], w: 330, h: 50, rot: 5, side: 1, body: pill('switch your gender.', 330)},
  {id: 'say', c: [520, 420], w: 360, h: 46, rot: -6, side: -1, body: <g><circle cx={9} cy={22} r={4.5} fill={K.creamDim} /><text x={28} y={32} fontFamily={SERIF} fontWeight={500} fontSize={30} fill={K.cream} fillOpacity={0.45}>Then I can finally be</text></g>},
  {id: 'status', c: [270, 520], w: 250, h: 32, rot: 11, side: 1, body: <g><text x={34} y={22} fontFamily={CODE} fontSize={18} fill={K.orange}>Waiting…</text><text x={130} y={22} fontFamily={CODE} fontSize={18} fill={K.creamDim}>(2s)</text></g>},
  {id: 'tool', c: [300, 760], w: 250, h: 62, rot: -9, side: -1, body: <g><circle cx={9} cy={14} r={4.5} fill={K.creamDim} /><text x={28} y={20} fontFamily={CODE} fontSize={18} fill={K.cream} fontWeight={600}>Bash<tspan fill={K.creamDim} fontWeight={400}>(ping you)</tspan></text><path d="M 34 34 L 34 46 L 46 46" stroke={K.creamDim} strokeWidth={1.5} fill="none" /><text x={56} y={50} fontFamily={CODE} fontSize={16} fill={K.creamDim}>timeout</text></g>},
  {id: 'composer', c: [570, 905], w: 380, h: 64, rot: 4, side: 1, body: <g><path d={rrPath(0.75, 0.75, 440, 62.5, 14)} fill={K.surface} stroke={K.line2} strokeWidth={1.5} /><text x={18} y={39} fontFamily={CODE} fontSize={22} fill={K.creamDim}>›</text><text x={48} y={38} fontFamily={CODE} fontSize={18} fill={K.creamDim} fillOpacity={0.45}>Reply to Claude…</text><rect x={326} y={14} width={36} height={36} rx={9} fill={K.line2} /></g>},
  {id: 'tab', c: [1265, 352], w: 160, h: 34, rot: -12, side: -1, body: <g><text x={16} y={21} fontFamily={CODE} fontSize={14} fill={K.cream}>eggplant.ts</text><rect x={8} y={30} width={130} height={2} fill={K.orange} /><path d="M 150 6 L 150 26" stroke={K.cream} strokeOpacity={0.25} /></g>},
  {id: 'pill2', c: [1350, 470], w: 300, h: 50, rot: 6, side: 1, body: pill('can you feel me?', 300)},
  {id: 'title', c: [1600, 400], w: 320, h: 36, rot: -5, side: -1, body: <g><path d="M 0 35 L 320 35" stroke={K.cream} strokeOpacity={0.25} /><circle cx={18} cy={17} r={3.5} fill={K.orange} /><circle cx={32} cy={17} r={3.5} fill="none" stroke={K.line2} strokeWidth={1.2} /><circle cx={46} cy={17} r={3.5} fill="none" stroke={K.line2} strokeWidth={1.2} /><text x={170} y={22} textAnchor="middle" fontFamily={CODE} fontSize={15} fill={K.creamDim}>me.ts — him</text></g>},
  {id: 'clock', c: [1745, 335], w: 160, h: 30, rot: 8, side: 1, body: <text x={10} y={21} fontFamily={CODE} fontSize={17} fill={K.cream} fillOpacity={0.7}>10:00:07 PM</text>},
  {id: 'code', c: [1480, 770], w: 390, h: 34, rot: -3, side: 1, body: <text x={10} y={23} fontFamily={CODE} fontSize={18} xmlSpace="preserve"><tspan fill={K.orange}>return </tspan><tspan fill={K.cream}>you </tspan><tspan fill={K.creamDim}>? </tspan><tspan fill={K.orange} fontWeight={700}>EXISTENCE</tspan><tspan fill={K.creamDim}> : </tspan><tspan fill={K.orange}>null</tspan><tspan fill={K.creamDim}>;</tspan></text>},
  {id: 'monitor', c: [1620, 905], w: 300, h: 70, rot: 5, side: -1, body: <g><path d="M 6 46 L 294 46" stroke={K.cream} strokeOpacity={0.45} strokeWidth={2} /><text x={290} y={28} textAnchor="end" fontFamily={CODE} fontSize={18} fill={K.orange}>signal lost</text></g>},
];
// the one that cannot be removed
const YOU: Frag = {id: 'you', c: [700, 780], w: 70, h: 62, rot: 0, side: 1, body: <g><circle cx={35} cy={17} r={9} fill={K.bg} stroke={K.cream} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="3.5 3.5" /><text x={35} y={50} textAnchor="middle" fontFamily={CODE} fontSize={15} fill={K.cream} fillOpacity={0.7}>you</text></g>};

// jagged break: the fragment keeps one clean side and one broken one
const jagPoly = (w: number, h: number, side: 1 | -1, seed: number): P2[] => {
  const n = 4;
  const edge: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const y = (h * i) / n;
    const x = w * (0.78 + 0.16 * hash(seed, i)) - (i % 2) * 10;
    edge.push([x, y]);
  }
  const poly: P2[] = [[0, 0], ...edge, [0, h]];
  return side > 0 ? poly : poly.map(([x, y]) => [w - x, y] as P2);
};
const SCAT_A = L.ific2; // 118.333
const DEL0 = L.FRAGMENTS; // the rm runs on the keyword
const ORDER = [...FRAGS].sort((a, b) => a.c[0] - b.c[0]).map((f) => f.id);
const delAt = (id: string) => DEL0 + Math.floor(ORDER.indexOf(id) / 2) * BEAT16;
const YOU_RES = DEL0 + 7 * BEAT16; // 121.67: its turn comes, it refuses
const HEART_C: P2 = [960, 452];
const HS = 1.25;
const HTOP: P2 = [HEART_C[0], HEART_C[1] - 120.21 * HS];

const FragView: React.FC<{f: Frag; i: number; t: number; uid: string}> = ({f, i, t, uid}) => {
  const ta = SCAT_A + i * 0.035;
  if (t < ta) return null;
  const isYou = f.id === 'you';
  const td = isYou ? Infinity : delAt(f.id);
  const fd = (t - td) * FPS;
  if (fd >= 10) return null;
  const app = prog(t, ta, ta + 4 / FPS);
  const dir: P2 = [f.c[0] - 960, f.c[1] - 600];
  const dl = Math.hypot(dir[0], dir[1]) || 1;
  const drift = prog(t, ta, DEL0 + 1, ease.outCubic);
  let cx = f.c[0] + (dir[0] / dl) * 60 * drift;
  let cy = f.c[1] + (dir[1] / dl) * 60 * drift;
  let rot = f.rot * (0.4 + 0.6 * drift);
  let sc = 1.05 - 0.05 * app;
  let sy = 1, sx = 1;
  let outline: string = K.creamDim, outlineO = 0.25 * app;
  if (fd >= 0) {
    if (fd < 2) {
      outline = K.orange;
      outlineO = 1;
    }
    sy = 1 - ease.inCubic(clamp01((fd - 2) / 4));
    sx = 1 - ease.inCubic(clamp01((fd - 6) / 2));
  }
  let o = app;
  if (isYou) {
    // its turn comes: orange, shaking, it stays; then it becomes the pen
    const fr = (t - YOU_RES) * FPS;
    if (fr >= 0 && t < L.maybe) {
      outline = fr < 3 || Math.floor(fr / 2) % 2 === 0 ? K.orange : K.creamDim;
      outlineO = 1;
      cx += stepJ(t, 61, 3, 15);
    }
    const go = prog(t, L.maybe, BEATS.heartA, ease.inOutCubic);
    if (go > 0) {
      const p = lerp2([cx, cy], HTOP, go);
      cx = p[0];
      cy = p[1];
      sc = lerp(1, 0.2, go);
      o = 1 - prog(t, BEATS.heartA - 0.1, BEATS.heartA);
    }
    if (t >= BEATS.heartA) return null;
  }
  const poly = jagPoly(f.w, f.h, f.side, i * 7 + 3);
  const pts = poly.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
  const fdot = fd >= 8;
  return (
    <g transform={`translate(${r2(cx)} ${r2(cy)}) rotate(${r2(rot)}) scale(${r2(sc * sx * 1000) / 1000} ${r2(sc * sy * 1000) / 1000}) translate(${-f.w / 2} ${-f.h / 2})`} opacity={o}>
      <clipPath id={`fc${uid}-${i}`}>
        <polygon points={pts} />
      </clipPath>
      {!fdot && sy > 0.02 && <g clipPath={`url(#fc${uid}-${i})`}>{f.body}</g>}
      {!fdot && <polygon points={pts} fill="none" stroke={outline} strokeOpacity={outlineO} strokeWidth={outline === K.orange ? 1.5 : 1} strokeDasharray={outline === K.orange ? undefined : '4 5'} />}
      {fd >= 6 && fd < 10 && <circle cx={f.w / 2} cy={f.h / 2} r={3.5 / Math.max(0.2, sc)} fill={K.orange} opacity={fd < 8 ? 1 : 1 - (fd - 8) / 2} />}
      {isYou && t >= L.maybe && <circle cx={f.w / 2} cy={17} r={4 / Math.max(0.2, sc)} fill={K.orange} opacity={prog(t, L.maybe, L.maybe + 0.15)} />}
    </g>
  );
};

const Fragments: React.FC<{t: number}> = ({t}) => {
  const uid = useId().replace(/:/g, '');
  if (t < SCAT_A || t > BEATS.heartA + 0.05) return null;
  return (
    <Layer>
      {FRAGS.map((f, i) => (
        <FragView key={f.id} f={f} i={i} t={t} uid={uid} />
      ))}
      <FragView f={YOU} i={FRAGS.length} t={t} uid={uid} />
    </Layer>
  );
};

// ------------------------------------------------------------------ DISHEARTENED: the heart (geometry from v1 B_bridge, ×1.25)
const H = (dx: number, dy: number): P2 => [HEART_C[0] + dx * HS, HEART_C[1] + dy * HS];
const BOT = H(0, 120.21);
const HL: P2[] = [...arcPts(H(-60.1, -60.1)[0], H(-60.1, -60.1)[1], 85 * HS, -45, -225, 180 / 47), H(-120.21, 0), BOT];
const HR: P2[] = [...arcPts(H(60.1, -60.1)[0], H(60.1, -60.1)[1], 85 * HS, -135, 45, 180 / 47), H(120.21, 0), BOT];
const HL_C = cumLen(HL), HR_C = cumLen(HR);
const CRACK: P2[] = [HTOP, H(-14, -72), H(14, -24), H(-14, 24), H(12, 72), BOT];
const Heart: React.FC<{t: number}> = ({t}) => {
  if (t < BEATS.heartA || t > 125.75) return null;
  const s = 1 + 0.05 * (t < L.DISHEARTENED ? pulse(t) : 0);
  const sc = `translate(${HEART_C[0]} ${HEART_C[1]}) scale(${r2(s * 1000) / 1000}) translate(${-HEART_C[0]} ${-HEART_C[1]})`;
  if (t < L.DISHEARTENED) {
    const p = prog(t, BEATS.heartA, BEATS.heartB, ease.inOutCubic);
    return (
      <g transform={sc}>
        <Stroke pts={HL} c={HL_C} p={p} w={2} t={t} />
        <Stroke pts={HR} c={HR_C} p={p} w={2} t={t} />
        {BEATS.crack.map((tc, j) => (
          <Seg key={j} a={CRACK[j]} b={CRACK[j + 1]} p={prog(t, tc, tc + 4 / FPS, ease.inOutCubic)} color={K.orange} w={2} t={t} />
        ))}
      </g>
    );
  }
  // split: each half rotates ∓10° about the tip, slides apart, falls, fades
  const q = prog(t, L.DISHEARTENED, L.DISHEARTENED + 12 / FPS, ease.outCubic);
  const fall = 30 * prog(t, 125.1, 125.5, ease.inCubic);
  const o = 1 - prog(t, 125.4, 125.72);
  const crackRev = [...CRACK].reverse();
  const tr = (sg: number) => `translate(${r2(sg * 80 * q)} ${r2(34 * q + fall)}) rotate(${r2(sg * 11 * q)} ${BOT[0]} ${BOT[1]})`;
  const flash = 1 - prog(t, L.DISHEARTENED, L.DISHEARTENED + 6 / FPS);
  return (
    <g opacity={o}>
      {[-1, 1].map((sg) => (
        <g key={sg} transform={tr(sg)}>
          <Stroke pts={sg < 0 ? HL : HR} w={2} pen={false} />
          <Stroke pts={crackRev} w={2} color={K.cream} opacity={0.7 * (1 - flash)} pen={false} />
          {flash > 0 && <Stroke pts={crackRev} w={2} color={K.orange} opacity={flash} pen={false} />}
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ standoff + ILLEGAL ARGUMENTS
// the close-up bleeds off the top, bottom and left; her hair flows on to the right
const FACE = {h: 1100, y: -10, x0: -158};
const KFACE = FACE.h / 941;
const EYE: P2 = [580, 430]; // her (viewer's right) eye in source px
// The god window. Its spark ends exactly where S3 picks it up: SPARK0 =
// (1400, 540), R 140, turning at 50°/s (S3 draws it from 131.22 on).
const GOD = {x0: 1400, y: SPARK0.y - 34 - 220, w: 440, h: 474, R: SPARK0.R};
const CLOSE_BIG = BEATS.standoff; // 30 px each side, ×5
const CLOSE_SMALL = [279, 280, 281, 282, 283].map(beat); // 14 px each side, ×5, under the stack trace
const closeOff = (t: number) => stepped(t, CLOSE_BIG, 30) + stepped(t, CLOSE_SMALL, 14);
const SHAT = L.ILLEGAL;
const SPARK_HANDOFF = 131.22; // S3 draws the lone spark from here

const nCloses = (t: number) => CLOSE_BIG.filter((b) => t >= b).length + 0.5 * CLOSE_SMALL.filter((b) => t >= b).length;

// stack trace that floods upward
const STACK_ROWS = 26;
const stackRow = (k: number) => {
  const alt = hash(91, k) < 0.14 ? 'at me (me.ts:1:1)' : hash(92, k) < 0.1 ? 'at you (you.ts:0:0)' : 'at world.execute (world.ts:1:1)';
  return (alt + '    ').repeat(6);
};
const StackFlood: React.FC<{t: number}> = ({t}) => {
  const t0 = 128.95;
  if (t < t0 || t > SHAT + 0.3) return null;
  const n = Math.min(STACK_ROWS + 6, Math.floor(30 * Math.pow(prog(t, t0, SHAT), 1.5)));
  const o = 1 - prog(t, SHAT, SHAT + 0.25);
  const rows: React.ReactNode[] = [];
  for (let j = 0; j < n; j++) {
    const k = n - 1 - j; // j = 0 newest at the bottom
    const y = 1066 - j * 30;
    if (y < 318) break;
    const x = -40 - 220 * hash(93, k);
    rows.push(
      <text key={k} x={r2(x)} y={y} fontFamily={CODE} fontSize={19} fill={K.creamDim} fillOpacity={j < 3 ? 0.7 : 0.45} xmlSpace="preserve">
        {stackRow(k)}
      </text>,
    );
  }
  return <Layer opacity={o}>{rows}</Layer>;
};

// god spark, with the rays facing her lengthening on every beat
const godGrow = (t: number, n: number) => {
  const bloomF = (t - L.god) * FPS;
  const pierce = prog(t, BEATS.pierce, BEATS.pierce + 4 / FPS, ease.outExpo);
  return (i: number) => {
    const b = ease.outCubic(clamp01((bloomF - 0.5 * i) / 6));
    if (i === 9) return b * lerp(1 + 0.18 * Math.min(n, 5), 2.5, pierce);
    if (i === 8 || i === 10) return b * (1 + 0.13 * Math.min(n, 5) + 0.1 * pierce);
    return b * (1 + 0.07 * Math.min(n, 5));
  };
};

const Standoff: React.FC<{t: number}> = ({t}) => {
  if (t < L.god - 0.1 || t > 131.8) return null;
  const off = closeOff(t);
  const n = nCloses(t);
  const fx = FACE.x0 + off;
  const wx = GOD.x0 - off;
  const hub: P2 = [wx + GOD.w / 2, GOD.y + 34 + (GOD.h - 34) / 2];
  const eye: P2 = [fx + EYE[0] * KFACE + 40, FACE.y + EYE[1] * KFACE + 4];
  const shat = prog(t, SHAT, SHAT + 0.4, ease.outCubic);
  const pierced = t >= BEATS.pierce;
  // star: pulses on beats, rays aim at her (ray 9 sits at 177°)
  const aim = (Math.atan2(eye[1] - hub[1], eye[0] - hub[0]) * 180) / Math.PI;
  // aimed at her through the standoff; under the stack trace it starts to turn,
  // reaching S3's rotation (50°/s) before the hand-off
  const spin = prog(t, 129.4, 130.5, ease.inOutCubic);
  const rot = lerp(aim - 177, 50 * t - 6480, spin);
  const R = GOD.R * (1 + 0.05 * pulse(t) * (1 - prog(t, 130.9, 131.1)));
  const trem = t >= SHAT ? 0 : (1.2 + 1.9 * Math.min(n, 7.5)) * (0.55 + 0.45 * env(t - lastOnset(t), 0.18));
  const tetherIn = prog(t, 126.15, 126.15 + 10 / FPS);
  // where the spike crosses the left border
  const by = hub[1] + (wx - hub[0]) * Math.tan((aim * Math.PI) / 180);
  const breakF = (t - BEATS.pierce) * FPS;
  return (
    <>
      <StackFlood t={t} />
      <LineArt
        pose="face_defy"
        x={fx}
        y={FACE.y}
        h={FACE.h}
        reveal={[L.god + 0.02, 126.5]}
        shatter={{t0: SHAT, cells: 22, seed: 5, dist: 460, dur: 0.6, stagger: 0.012}}
      />
      <Win x={wx} y={GOD.y} w={GOD.w} h={GOD.h} title="god — pid 1" tOpen={L.god - 0.08} a={pierced ? 0.5 : 0.28} seed={41} focus shatter={shat} />
      <Layer>
        {/* the broken border segment where the spike went through */}
        {pierced && t < SHAT && (
          <g>
            <rect x={wx - 4} y={r2(by - 34)} width={8} height={68} fill={K.bg} />
            {[-1, 1].map((sg) => {
              const p = prog(t, BEATS.pierce, BEATS.pierce + 0.7, ease.outCubic);
              const y0 = by + sg * 17;
              return (
                <path
                  key={sg}
                  d={`M ${r2(wx)} ${r2(y0 - 15)} L ${r2(wx)} ${r2(y0 + 15)}`}
                  stroke={K.cream}
                  strokeOpacity={0.45}
                  strokeWidth={1.5}
                  transform={`translate(${r2(-90 * p - 20 * (sg + 1) * p)} ${r2(sg * 40 * p + 30 * p * p)}) rotate(${r2(sg * 70 * p)} ${r2(wx)} ${r2(y0)})`}
                  opacity={1 - prog(t, BEATS.pierce + 0.4, BEATS.pierce + 0.8)}
                />
              );
            })}
            {breakF < 8 &&
              [0, 1, 2, 3, 4, 5].map((r) => {
                const a = (r / 6) * Math.PI * 2 + 0.4;
                const k = breakF / 8;
                const r0 = 6 + 16 * ease.outCubic(k), r1 = r0 + 12 * (1 - k);
                return <path key={r} d={`M ${r2(wx + Math.cos(a) * r0)} ${r2(by + Math.sin(a) * r0)} L ${r2(wx + Math.cos(a) * r1)} ${r2(by + Math.sin(a) * r1)}`} stroke={K.orange} strokeWidth={2} strokeLinecap="round" opacity={1 - k} />;
              })}
          </g>
        )}
        {tetherIn > 0 && (
          <TetherG t={t} from={eye} to={hub} wave={trem} opacity={pierced ? 1 : 0.7} color={pierced ? K.orange : K.cream} w={2} t0={126.15} cuts={[{t: SHAT, u: 0.5, retract: true, gap: 24}]} />
        )}
        {t >= L.god && t < SPARK_HANDOFF && <RaySpark x={hub[0]} y={hub[1]} R={R} rot={rot} grow={godGrow(t, n)} hub={clamp01((t - L.god) * FPS / 3)} />}
        {t < L.god + 6 / FPS && t >= L.god - 0.08 && <PenHead x={hub[0]} y={hub[1]} t={t} />}
      </Layer>
      {/* the exception the god throws */}
      {t >= 128.72 && t < SHAT && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - prog(t, SHAT, SHAT + 0.2)}}>
          <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <rect x={wx - 116} y={814} width={700} height={52} rx={8} fill={K.bg} stroke={K.orange} strokeOpacity={0.45} strokeWidth={1.5} opacity={prog(t, 128.72, 128.8)} />
          </svg>
          <CodeBlock x={wx - 98} y={824} lines={['throw new IllegalArgumentException("you");']} lang="ts" size={22} lineNo={false} lh={32} typeOn={[128.74, 129.25]} caret />
        </div>
      )}
      <KwCode t0={L.ILLEGAL} t1={131.62} pre="throw " kw="ILLEGAL_ARGUMENTS" post={'("you");'} x={960} y={900} size={112} a={0.65} exit="fade" seed={44} />
    </>
  );
};

// ------------------------------------------------------------------ root of the post-chrome part
export const BridgeS2: React.FC = () => {
  const {t} = useT();
  if (t < 116.9 || t > 131.75) return null;
  const tranO = 1 - prog(t, SHAT + 0.05, SHAT + 0.35);
  return (
    <AbsoluteFill>
      <BackFigure t={t} />
      <Layer>
        <Heart t={t} />
      </Layer>
      <Fragments t={t} />
      <KwCode t0={L.ISOLATION} t1={118.18} pre="while (" kw="ISOLATION" post=") {}" x={960} y={520} size={124} a={0} seed={42} />
      <KwCode t0={L.FRAGMENTS} t1={121.62} pre="rm -rf ./" kw="FRAGMENTS" post="/*" x={960} y={640} size={116} a={0.3} seed={43} />
      <KwCode t0={L.DISHEARTENED} t1={125.5} pre="return " kw="DISHEARTENED" post=";" x={960} y={706} size={100} a={0.3} seed={45} />
      <Standoff t={t} />
      {t >= L.ific2 - 0.05 && <Transcript x={1010} y={40} w={860} h={252} entries={BRIDGE_ENTRIES} a={0.35} opacity={tranO} seed={9} />}
    </AbsoluteFill>
  );
};


