// 88.55–103.5 (v8), full frame above the camera, three shots:
//  F/M (88.55–92.25): her head and shoulders in two-tone colour blocks; on "M"
//    the figure is rebuilt band by band as the slender male state
//  AM/PM (92.25–95.45): a flying globe under one fixed instant (13:05 UTC); the
//    readout rolls and settles on UTC−08:00 on "AM", UTC+00:00 on "PM"
//  S/M (95.45–103.5): S and M in one frame (colour blocks), giant S and M behind
//    them, lit in turn by syllable; the trance spreads from the shared cursor,
//    and the leash becomes the monitor's signal line
// One caption track (bottom left) runs over all three (LyricGuard leaves this span alone).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {beat, ease, env, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {Cursor} from '../shell/Composer';
import {CODE, SERIF} from '../fonts';
import {DotGrid, FeedWin, SoftRing} from '../shell/Feed';
import {Frame, Layer, P2, r2, rrPath} from '../shell/lib';
import {L} from './s2.data';
import {Caption, LYRIC} from './S4_lib';

const HAND = 5 / 30; // captions hand over directly: the old one lifts out as the next streams in
const IN = 88.55, OUT: [number, number] = [103.8, 103.88]; // the gathered line stays until the monitor's body (with the same line in it) is on
const FM_END = 92.25, GLOBE_END = 95.45; // v7: the rebuilt male face holds 0.7 s
// sung syllables, read off the centre (L+R minus L−R) spectrogram of the song:
// "To F to M" and "To S to M" share one melody, 16 beats apart
const W_F = beat(196), W_M = beat(198); // "To F to M": 90.61, 91.53
const W_AM = 94.3, W_PM = 95.0; // "From AM to PM"
const W_S = beat(212) + 0.03, W_M2 = beat(214) + 0.03; // "To S to M": 98.03, 98.95 (first frames 2941, 2969): the voice sits about a frame behind the grid here

const Pic: React.FC<{src: string; x: number; y: number; w: number; h: number; o?: number; clip?: string; filter?: string}> = ({src, x, y, w, h, o = 1, clip, filter}) =>
  o > 0 ? <Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, clipPath: clip, filter}} /> : null;

// ------------------------------------------------------------------ giant back letters
// Shared by F/M and S/M. `on` 0..1: how lit it is; a lit letter stays quieter than
// the figure in front of it, a dark one keeps only a faint outline.
const BackLetter: React.FC<{ch: string; x: number; y: number; size: number; on: number; press?: number}> = ({ch, x, y, size, on, press = 0}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={size} fill={K.orange} fillOpacity={0.03 + 0.17 * on} stroke={on > 0.3 ? K.orange : K.cream} strokeOpacity={0.09 + 0.56 * on} strokeWidth={3 + 2 * press}>
    {ch}
  </text>
);

// ------------------------------------------------------------------ F/M (v10)
// Both states in warm two-tone colour blocks; each face is one lit shape and one large
// backlit shape (fm_F_tone, fm_M_tone: a slender youth continuous with her). A giant F stands
// behind her and lights on "F". On "M" the figure is rebuilt band by band from
// the bottom up: each band folds shut on F and opens again on M, so only one state
// is ever drawn in any band (nothing of F stays behind M), and the same scan
// hands the giant F over to the giant M. On the left: the switch and the state,
// over a low-contrast scan ruler.
const FACE = {x: 300, y: 0, w: 1620, h: 1080}; // 1536×1024 art; F's right edge on the frame edge
const M_DY = 0; // both drawings end on their canvas bottom
const SCAN: [number, number] = [W_M - 0.34, W_M + 0.04];
const BANDS = 12;
const BAND_H = 1080 / BANDS;
// band j (0 = bottom) folds over [f, f + 0.05] and opens on M over [f + 0.05, f + 0.1]
const bandT = (j: number) => SCAN[0] + (j / (BANDS - 1)) * (SCAN[1] - SCAN[0] - 0.1);
const scanY = (t: number) => lerp(1080, 0, ease.inOutCubic(prog(t, SCAN[0], SCAN[1])));
const F_LETTER = {x: 640, y: 880, size: 1040}; // clear of her hair, under the panel
const M_LETTER = {x: 770, y: 880, size: 1040};
const RULER = {x: 84, y0: 340, y1: 900};
const FM: React.FC<{t: number}> = ({t}) => {
  const knob = prog(t, W_M - 0.1, W_M + 0.06, ease.inOutCubic);
  const fOn = t >= W_F - 0.05;
  const scanning = t > SCAN[0] && t < SCAN[1];
  const done = t >= SCAN[1];
  const rebuilt = Array.from({length: BANDS}, (_, j) => j).filter((j) => t >= bandT(j) + 0.1).length;
  const fHit = t >= W_F ? env(t - W_F, 0.35) : 0;
  const sy = scanY(t);
  const fLit = 0.25 + 0.75 * prog(t, W_F - 0.04, W_F + 0.12);
  const mLit = 0.4 + 0.6 * prog(t, SCAN[1] - 0.1, SCAN[1] + 0.1);
  const mGrow = 0.95 + 0.05 * ease.outCubic(prog(t, SCAN[0], SCAN[1] + 0.12));
  const img = (src: string, dy: number, top: number) => (
    <Img src={staticFile(src)} style={{position: 'absolute', left: FACE.x, top: FACE.y + dy - top, width: FACE.w, height: FACE.h}} />
  );
  let figure: React.ReactNode;
  if (t < SCAN[0]) figure = img('la3x/fm_F_tone.png', 0, 0);
  else if (done) figure = img('la3x/fm_M_tone.png', M_DY, 0);
  else
    figure = Array.from({length: BANDS}, (_, j) => {
      const f = bandT(j);
      const isM = t >= f + 0.05;
      const s = isM ? ease.outCubic(prog(t, f + 0.05, f + 0.1)) : 1 - ease.inCubic(prog(t, f, f + 0.05));
      const top = 1080 - (j + 1) * BAND_H;
      return (
        <div key={j} style={{position: 'absolute', left: 0, top, width: 1920, height: BAND_H, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: BAND_H, transform: `scaleY(${s.toFixed(4)})`, transformOrigin: '50% 50%'}}>
            {isM ? img('la3x/fm_M_tone.png', M_DY, top) : img('la3x/fm_F_tone.png', 0, top)}
          </div>
        </div>
      );
    });
  // the scan ruler: ticks every 28 px, longer every fifth; the marker rides the scan
  const ticks: React.ReactNode[] = [];
  for (let i = 0; RULER.y0 + i * 28 <= RULER.y1; i++) {
    const y = RULER.y0 + i * 28;
    const major = i % 5 === 0;
    ticks.push(<path key={i} d={`M ${RULER.x} ${y} L ${RULER.x + (major ? 26 : 12)} ${y}`} stroke={K.cream} strokeOpacity={major ? 0.3 : 0.16} strokeWidth={1.5} />);
    if (major)
      ticks.push(
        <text key={`n${i}`} x={RULER.x + 36} y={y + 5} fontFamily={CODE} fontSize={13} fill={K.creamDim} opacity={0.55}>
          {String(1080 - y).padStart(4, '0')}
        </text>,
      );
  }
  const row = (k: string, a: string, b: string) => (
    <text fontFamily={CODE} fontSize={18} xmlSpace="preserve">
      <tspan fill={K.creamDim}>{k.padEnd(8, ' ')}</tspan>
      <tspan fill={done ? K.cream : K.creamDim}>{done ? b : a}</tspan>
    </text>
  );
  const bars = `${'■'.repeat(rebuilt)}${'·'.repeat(BANDS - rebuilt)}`;
  return (
    <>
      <Layer>
        <DotGrid lights={[{x: 1260, y: sy, r: 300, a: scanning ? 0.25 : 0}]} />
        {/* the giant letters, behind the figure; the rebuild's scan hands one over to the other */}
        <defs>
          <clipPath id="fm-above">
            <rect x={0} y={0} width={1920} height={r2(sy)} />
          </clipPath>
          <clipPath id="fm-below">
            <rect x={0} y={r2(sy)} width={1920} height={r2(1080 - sy)} />
          </clipPath>
        </defs>
        {!done && (
          <g clipPath="url(#fm-above)">
            <BackLetter ch="F" {...F_LETTER} on={fLit} press={fHit} />
          </g>
        )}
        {t > SCAN[0] && (
          <g clipPath="url(#fm-below)" transform={`translate(${M_LETTER.x} ${M_LETTER.y}) scale(${r2(mGrow * 1000) / 1000}) translate(${-M_LETTER.x} ${-M_LETTER.y})`}>
            <BackLetter ch="M" {...M_LETTER} on={mLit} />
          </g>
        )}
        {scanning && <rect x={60} y={r2(sy - 1)} width={1800} height={2} fill={K.orange} opacity={0.7} />}
        {/* viewfinder brackets around the head */}
        {[[930, 110, 1, 1], [1600, 110, -1, 1], [930, 740, 1, -1], [1600, 740, -1, -1]].map(([x, y, dx, dy], i) => (
          <path key={i} d={`M ${x} ${y + 40 * dy} L ${x} ${y} L ${x + 40 * dx} ${y}`} fill="none" stroke={fHit > 0.05 || scanning ? K.orange : K.cream} strokeOpacity={0.5} strokeWidth={2} />
        ))}
        <g opacity={prog(t, IN + 0.2, IN + 0.6)}>
          {ticks}
          {scanning && sy >= RULER.y0 && sy <= RULER.y1 && <path d={`M ${RULER.x - 16} ${r2(sy - 7)} L ${RULER.x - 2} ${r2(sy)} L ${RULER.x - 16} ${r2(sy + 7)} Z`} fill={K.orange} />}
        </g>
      </Layer>
      <AbsoluteFill>{figure}</AbsoluteFill>
      <Layer>
        <FeedWin
          t={t}
          t0={IN + 0.1}
          x={60}
          y={70}
          w={340}
          size={18}
          title="me.ts"
          rows={[
            {
              t: IN + 0.15,
              text: '',
              render: () => (
                <g transform="translate(0 -20)">
                  <text x={0} y={20} fontFamily={CODE} fontSize={18} fill={K.creamDim}>
                    gender
                  </text>
                  <rect x={100} y={-4} width={150} height={34} rx={17} fill={K.bg} stroke={K.cream} strokeOpacity={0.5} strokeWidth={1.5} />
                  <rect x={r2(103 + 72 * knob)} y={-1} width={72} height={28} rx={14} fill={fOn ? K.orange : K.creamDim} fillOpacity={fOn ? 0.9 : 0.3} />
                  <text x={139} y={19} textAnchor="middle" fontFamily={CODE} fontWeight={700} fontSize={18} fill={knob < 0.5 && fOn ? K.bg : K.cream}>
                    F
                  </text>
                  <text x={211} y={19} textAnchor="middle" fontFamily={CODE} fontWeight={700} fontSize={18} fill={knob >= 0.5 ? K.bg : K.cream}>
                    M
                  </text>
                </g>
              ),
            },
            {
              t: IN + 0.3,
              text: '',
              render: () => (
                <text fontFamily={CODE} fontSize={18} fontWeight={700} xmlSpace="preserve">
                  <tspan fill={K.creamDim} fontWeight={400}>{'form    '}</tspan>
                  <tspan fill={fOn || done ? K.orange : K.cream}>{done ? 'M' : scanning ? 'F → M' : 'F'}</tspan>
                </text>
              ),
            },
            {t: IN + 0.42, text: '', render: () => row('hair', 'long', 'short')},
            {t: IN + 0.54, text: '', render: () => row('collar', 'frill', 'stand')},
            {t: SCAN[0], text: '', render: () => <text fontFamily={CODE} fontSize={15} fill={done ? K.creamDim : K.cream} xmlSpace="preserve">{bars}</text>},
          ]}
        />
      </Layer>
    </>
  );
};
// ------------------------------------------------------------------ AM/PM (v7: UTC offsets)
// One fixed instant, 1:05 PM UTC. The globe turns under the reading meridian (the
// orange line at its front); the readout gives that meridian's UTC offset and
// its local time at that same instant: UTC−08:00 5:05 AM on "AM", UTC+00:00 1:05 PM
// on "PM". Night is where the sun is down at 13:05 UTC, so it turns with the earth.
const G = {cx: 800, cy: 492, R: 360, tilt: 0.32};
const DEG = Math.PI / 180;
const UTC_MIN = 13 * 60 + 5;
const SUN_LON = ((12 * 60 - UTC_MIN) / 4) * DEG; // where it is noon at 13:05 UTC (−16.25°)
// v8: the globe flies. The reading longitude (degrees, unwrapped) spins two and
// a half turns and settles on UTC−08:00 (05:05, AM) by "AM", then spins once
// more and lands on UTC+00:00 (13:05, PM) on "PM". The readout rolls with it.
const SPIN1: [number, number] = [FM_END, W_AM - 0.12];
const SPIN2: [number, number] = [W_AM + 0.22, W_PM - 0.02];
const frontLon = (t: number) =>
  t < SPIN2[0] ? lerp(-120 - 900, -120, ease.outCubic(prog(t, SPIN1[0], SPIN1[1]))) : lerp(-120, 360, ease.inOutCubic(prog(t, SPIN2[0], SPIN2[1])));
const wrapZone = (z: number) => ((((z + 12) % 24) + 24) % 24) - 12;
const pad2 = (n: number) => String(n).padStart(2, '0');
const sgn = (h: number) => `UTC${h < 0 ? '−' : '+'}${pad2(Math.abs(h))}:00`;
// v11: every local time on screen goes through this one 12-hour format, to go with "From AM to PM"
const clock12 = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return {txt: `${Math.floor(m / 60) % 12 || 12}:${pad2(m % 60)}`, pm: m >= 720};
};
const local = (h: number) => clock12(UTC_MIN + h * 60);
const Globe: React.FC<{t: number}> = ({t}) => {
  const front = frontLon(t) * DEG;
  const proj = (lat: number, lon: number) => {
    const rl = lon - front;
    const X = Math.cos(lat) * Math.sin(rl), Y = Math.sin(lat), Z = Math.cos(lat) * Math.cos(rl);
    const Y2 = Y * Math.cos(G.tilt) - Z * Math.sin(G.tilt), Z2 = Z * Math.cos(G.tilt) + Y * Math.sin(G.tilt);
    return {x: G.cx + G.R * X, y: G.cy - G.R * Y2, z: Z2};
  };
  const dayAt = (lon: number) => Math.cos(lon - SUN_LON) > 0;
  const lines: React.ReactNode[] = [];
  // a polyline along the sphere, split where it goes behind; night parts dim
  const trace = (key: string, pts: {lat: number; lon: number}[], w: number, base: number, color: string = K.cream) => {
    let d = '', dn = '';
    let prev: 'd' | 'n' | null = null;
    pts.forEach((p) => {
      const q = proj(p.lat, p.lon);
      if (q.z <= 0) {
        prev = null;
        return;
      }
      const day = dayAt(p.lon);
      const seg = day ? 'd' : 'n';
      const cmd = prev === seg ? 'L' : 'M';
      if (day) d += `${cmd} ${r2(q.x)} ${r2(q.y)} `;
      else dn += `${cmd} ${r2(q.x)} ${r2(q.y)} `;
      prev = seg;
    });
    lines.push(<path key={key + 'd'} d={d} fill="none" stroke={color} strokeOpacity={base} strokeWidth={w} />);
    lines.push(<path key={key + 'n'} d={dn} fill="none" stroke={color} strokeOpacity={base * 0.55} strokeWidth={w} />);
  };
  const meridian = (lon: number) => Array.from({length: 61}, (_, i) => ({lat: -Math.PI / 2 + (Math.PI * i) / 60, lon}));
  // the 24 zone meridians, one per hour; while it spins fast each leaves two fading copies behind (motion blur)
  const dl = frontLon(t) - frontLon(t - 1 / 30); // degrees per frame
  const blur = Math.min(1, Math.abs(dl) / 12);
  for (let h = -12; h < 12; h++) {
    trace('m' + h, meridian(h * 15 * DEG), 1.1, (h % 2 ? 0.2 : 0.35) * (1 - 0.4 * blur));
    if (blur > 0.1) for (const k of [1, 2]) trace(`m${h}b${k}`, meridian((h * 15 + (dl * k) / 3) * DEG), 1.1, 0.12 * blur * (3 - k));
  }
  for (const latD of [-60, -30, 0, 30, 60]) {
    const lat = latD * DEG;
    trace('p' + latD, Array.from({length: 121}, (_, i) => ({lat, lon: (2 * Math.PI * i) / 120})), latD === 0 ? 1.6 : 1.2, latD === 0 ? 0.5 : 0.35);
  }
  // where it is noon and midnight at this instant (they turn with the earth)
  const dashed = (lon: number, label: string, o: number) => {
    let d = '', pen = false;
    for (let i = 0; i <= 60; i++) {
      const q = proj(-Math.PI / 2 + (Math.PI * i) / 60, lon);
      if (q.z > 0) d += `${pen ? 'L' : 'M'} ${r2(q.x)} ${r2(q.y)} `;
      pen = q.z > 0;
    }
    const top = proj(64 * DEG, lon);
    return (
      <g key={label} opacity={o}>
        <path d={d} fill="none" stroke={K.orange} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="8 8" />
        {top.z > 0.15 && (
          <text x={r2(top.x)} y={r2(top.y - 14)} textAnchor="middle" fontFamily={CODE} fontSize={18} fill={K.orange}>
            {label}
          </text>
        )}
      </g>
    );
  };
  // the offsets along the equator near the front (hidden while it spins fast)
  const off = frontLon(t) / 15;
  const zone = wrapZone(Math.round(off));
  const labels: React.ReactNode[] = [];
  for (let h = -12; h < 12; h++) {
    const q = proj(-8 * DEG, h * 15 * DEG);
    if (q.z < 0.55 || blur > 0.5) continue;
    const hot = h === zone;
    labels.push(
      <text key={h} x={r2(q.x)} y={r2(q.y + 30)} textAnchor="middle" fontFamily={CODE} fontSize={hot ? 22 : 16} fontWeight={hot ? 700 : 400} fill={hot ? K.orange : K.creamDim} opacity={Math.min(1, (q.z - 0.55) / 0.2)}>
        {h === 0 ? '±0' : h < 0 ? `−${-h}` : `+${h}`}
      </text>,
    );
  }
  // the reading meridian, fixed at the front
  let read = '';
  for (let i = 0; i <= 40; i++) {
    const q = proj(-Math.PI / 2 + (Math.PI * i) / 40, front);
    if (q.z > 0) read += `${read ? 'L' : 'M'} ${r2(q.x)} ${r2(q.y)} `;
  }
  const flip = (w: number) => (t >= w ? env(t - w, 0.3) : 0);
  const box = Math.max(flip(W_AM), flip(W_PM));
  const PX = 1330, ROWS: number[] = [-8, 0, 8];
  // the readout is a reel: each zone is one item (offset over local time); items
  // roll up as the offset grows, and a settled reel shows exactly one
  const REEL = {top: 136, h: 146, row: 146};
  const frac = off - Math.round(off);
  const reel: React.ReactNode[] = [];
  for (const j of [-1, 0, 1]) {
    const z = wrapZone(Math.round(off) + j);
    const dy = (j - frac) * REEL.row;
    const l = local(z);
    reel.push(
      <g key={j} transform={`translate(0 ${r2(dy)})`}>
        <text x={PX} y={200} fontFamily={CODE} fontSize={66} fontWeight={700} fill={K.cream}>
          {sgn(z)}
        </text>
        <text x={PX} y={262} fontFamily={CODE} fontSize={44} fill={K.cream}>
          {l.txt}
          <tspan dx={16} fontSize={30} fontWeight={700} fill={l.pm ? K.orange : K.creamDim}>
            {l.pm ? 'PM' : 'AM'}
          </tspan>
        </text>
      </g>,
    );
  }
  return (
    <Layer>
      <circle cx={G.cx} cy={G.cy} r={G.R} fill={K.bg} stroke={K.cream} strokeOpacity={0.6} strokeWidth={2} />
      {lines}
      {dashed(SUN_LON, '12:00 PM', 1)}
      {dashed(SUN_LON + Math.PI, '12:00 AM', 0.6)}
      <path d={read} fill="none" stroke={K.orange} strokeWidth={3} />
      {labels}
      {/* the readout: offset first, local time second */}
      <text x={PX} y={118} fontFamily={CODE} fontSize={22} fill={K.creamDim}>
        {'now = 1:05 PM UTC'}
      </text>
      <defs>
        <clipPath id="s8-reel">
          <rect x={PX - 20} y={REEL.top} width={440} height={REEL.h} />
        </clipPath>
      </defs>
      <g clipPath="url(#s8-reel)" opacity={1 - 0.35 * blur}>
        {reel}
      </g>
      {box > 0.02 && <rect x={PX - 18} y={136} width={430} height={146} rx={8} fill="none" stroke={K.orange} strokeWidth={2} opacity={box} />}
      <path d={`M ${PX} 318 L ${PX + 400} 318`} stroke={K.cream} strokeOpacity={0.2} />
      {ROWS.map((h, i) => {
        const on = h === zone;
        const l = local(h);
        return (
          <text key={h} x={PX} y={360 + 38 * i} fontFamily={CODE} fontSize={22} fill={on ? K.orange : K.creamDim} fontWeight={on ? 700 : 400}>
            {`${sgn(h)}   ${l.txt} ${l.pm ? 'PM' : 'AM'}`}
          </text>
        );
      })}
    </Layer>
  );
};

// ------------------------------------------------------------------ S/M (v10)
// One frame, two states of the same Claude, in warm two-tone colour blocks (large
// backlit shapes, no separate eyes). S stands high on the right, her raised boot pressing the
// cursor, a leash from the cursor up to her fist; M lies low on the left, her
// upturned fingertips touching the same cursor. A giant S stands behind S and a
// giant M behind M. "Oh switch my role" shows only the letters, the cursor and the
// program; S appears, lit, on her first "S" and M on her first "M", which also dims S.
// In the trance both keep a common rhythm: pulses from the cursor spread over the
// whole screen, the grid heaves, the letters breathe in turn. At the end the
// leash itself straightens into the line the monitor opens from (S2_stage).
// art (v10_points.json): sm_S_tone 1024×1536, raised sole (79, 1043), fist (931, 130);
//                        sm_M_tone 1536×1024, touch (1516, 369), floor 899
const CT: P2 = [900, 570]; // the cursor's tip
const CS = 1.6; // cursor scale (≈ 37 × 60 px)
const FOOT_AT: P2 = [CT[0] + 28, CT[1] + 26]; // her sole on the cursor's upper right
const TOUCH_AT: P2 = [CT[0] + 8, CT[1] + 50]; // fingertips at its lower left
const SKS = 0.56, SKM = 0.566;
const S_XY: P2 = [FOOT_AT[0] - 79 * SKS, FOOT_AT[1] - 1043 * SKS];
const S_FIST: P2 = [S_XY[0] + 931 * SKS, S_XY[1] + 130 * SKS];
const M_XY: P2 = [TOUCH_AT[0] - 1516 * SKM, TOUCH_AT[1] - 369 * SKM];
// baselines, centred: S stands out to the right of her raised arm, M rises above her back
const LETTER = {S: {x: 1585, y: 800, size: 900}, M: {x: 360, y: 830, size: 660}}; // M far enough left that, pressed over, its right stem clears her head
const T_CONTACT = W_M2;
const DIM = 0.14; // the state not being sung: dark, but its pose still reads
// S is hauled up along the leash (the cursor toward her fist)
const S_HAUL = 210;
const S_DIR: P2 = (() => {
  const dx = S_FIST[0] - CT[0] - 18, dy = S_FIST[1] - CT[1] - 18, d = Math.hypot(dx, dy);
  return [dx / d, dy / d];
})();
// the monitor window (S2_stage, 980..1896 × 64..964) opens at 103.45 from an orange
// construction line across its middle, where its signal line then sits (SIG_Y)
const LINE = {y: 514, x0: 1020, x1: 1856};
const T_GATHER: [number, number] = [102.85, 103.45];
const NODES: P2[] = [[520, 120], [760, 300], [1240, 960], [1800, 960], [160, 420], [1060, 120]];

// v11: one marker per syllable (W_S, W_M2). The figure's first visible frame, the lighting and the
// lyric's letter all start on the first frame at or after it; nothing shows on the frame before.
const sungIn = (t: number, w: number, len = 0.1) => (t < w ? 0 : prog(t, w - 0.02, w - 0.02 + len, ease.outCubic));
const LETTER_ON = 1 / 40; // Caption streams 40 ch/s: its next letter is on this long after the mark

const SM: React.FC<{t: number}> = ({t}) => {
  // each figure is invisible until its own first syllable, then wipes in within a few frames
  const build = prog(t, GLOBE_END, GLOBE_END + 0.5, ease.inOutCubic);
  const sIn = sungIn(t, W_S), mIn = sungIn(t, W_M2);
  // light: 0..1 per state (figure and letter together); the letters wait at half light, then by syllable
  const toS = sungIn(t, W_S, 0.08), toM = sungIn(t, W_M2, 0.08);
  const trance = prog(t, L.enter, L.enter + 0.5);
  const b = env(t - lastOnset(t), 0.22);
  const beatN = Math.floor((lastOnset(t) - L.enter) / (60 / 130));
  const alt = t >= L.enter ? (beatN % 2 === 0 ? 1 : 0) : 0; // in the trance the two answer each other on the beats
  const sLit = lerp(lerp(lerp(0.42, 1, toS), DIM, toM), DIM + (1 - DIM) * alt * (0.35 + 0.65 * b), trance);
  const mLit = lerp(lerp(lerp(0.42, DIM, toS), 1, toM), DIM + (1 - DIM) * (1 - alt) * (0.35 + 0.65 * b), trance);
  const gather = ease.inOutCubic(prog(t, T_GATHER[0], T_GATHER[1]));
  const keep = 1 - gather;
  // the leash: thrown from her fist on "S", taut by 98.2; it stays as the trace of the relation
  const shoot = prog(t, W_S + 0.02, W_S + 0.14, ease.outCubic);
  const taut = prog(t, W_S + 0.14, W_S + 0.24, ease.inOutCubic);
  const press = t >= W_S && t < W_S + 3 / 30 ? 0.88 : 1; // the cursor squashes under the boot
  const sag = 50 * (1 - taut);
  const ropeA: P2 = [CT[0] + 18, CT[1] + 18];
  const ropeEnds = (): [P2, P2] => {
    // at the end the leash itself becomes the monitor's line
    const a: P2 = [lerp(ropeA[0], LINE.x0, gather), lerp(ropeA[1], LINE.y, gather)];
    const z: P2 = [lerp(S_FIST[0], LINE.x1, gather), lerp(S_FIST[1], LINE.y, gather)];
    return [a, z];
  };
  const [ra, rz] = ropeEnds();
  const rope = (u: number) => {
    const mx = (ra[0] + rz[0]) / 2, my = (ra[1] + rz[1]) / 2 + sag * (1 - gather);
    const ex = lerp(rz[0], ra[0], u), ey = lerp(rz[1], ra[1], u);
    return `M ${r2(rz[0])} ${r2(rz[1])} Q ${r2(lerp(rz[0], mx, u))} ${r2(lerp(rz[1], my, u))} ${r2(ex)} ${r2(ey)}`;
  };
  const ropeLit = gather > 0 ? 1 : sLit;
  // pulses from the cursor: on the beats from "So we can enter", wider from "the trance"
  const P0: P2 = [CT[0] + 18, CT[1] + 30];
  const rings: {R: number; q: number; j: number}[] = [];
  if (t >= L.enter)
    for (let j = 0; j < 7; j++) {
      const ob = lastOnset(t) - j * (60 / 130);
      if (ob < L.enter) continue;
      const q = (t - ob) / 2.2;
      if (q < 0 || q > 1) continue;
      rings.push({R: 20 + lerp(700, 2100, prog(ob, L.enter, L.trance)) * ease.outCubic(q), q, j});
    }
  const heave = (x: number, y: number): P2 => {
    let dx = 0, dy = 0;
    const d = Math.hypot(x - P0[0], y - P0[1]) || 1;
    for (const r of rings) {
      const k = 12 * (1 - r.q) * Math.exp(-(((d - r.R) / 46) ** 2));
      dx += ((x - P0[0]) / d) * k;
      dy += ((y - P0[1]) / d) * k;
    }
    return [dx, dy];
  };
  const grid: React.ReactNode[] = [];
  for (let y = 24; y < 1080; y += 48)
    for (let x = 24; x < 1920; x += 48) {
      const [dx, dy] = heave(x, y);
      grid.push(<circle key={`${x},${y}`} cx={r2(x + dx)} cy={r2(y + dy)} r={1.6} fill={K.cream} opacity={(0.06 + Math.min(0.35, Math.hypot(dx, dy) / 30)) * keep * build} />);
    }
  // the giant letters: they rise in from below as the frame builds and light with
  // their state, then each takes a blow on its syllable and stays where it ends up:
  // S is hauled up along the leash (a small dip, then pulled, a small overshoot,
  // stopped by the time the leash is taut); M is forced down and over (it flattens
  // and leans from its feet, overshoots, recovers a little, stays). In the trance
  // they only breathe, from where they stopped.
  const letter = (ch: 'S' | 'M', lit: number) => {
    const L0 = LETTER[ch];
    const draw = prog(t, GLOBE_END + (ch === 'S' ? 0.1 : 0.35), GLOBE_END + (ch === 'S' ? 0.9 : 1.15), ease.inOutCubic);
    const on = Math.max(0, (lit - DIM) / (1 - DIM));
    const breathe = 1 + 0.02 * b * trance;
    const top = L0.y + 0.08 * L0.size - draw * L0.size;
    let tf: string;
    let hit = 0;
    if (ch === 'S') {
      const pull = ease.outCubic(prog(t, W_S + 0.08, W_S + 0.26));
      const dip = 16 * prog(t, W_S, W_S + 0.08) * (1 - prog(t, W_S + 0.08, W_S + 0.16));
      const over = 12 * Math.sin(Math.PI * prog(t, W_S + 0.24, W_S + 0.46));
      const along = -S_HAUL * (1 - pull) - dip + over;
      tf = `translate(${r2(S_DIR[0] * along)} ${r2(S_DIR[1] * along)})`;
      hit = t >= W_S ? env(t - W_S - 0.08, 0.3) : 0;
    } else {
      const fall = ease.inCubic(prog(t, W_M2, W_M2 + 0.14));
      const rebound = 0.14 * Math.sin(Math.PI * prog(t, W_M2 + 0.13, W_M2 + 0.4));
      const p = Math.max(0, fall + rebound * (t >= W_M2 + 0.13 ? 1 : 0));
      const skew = -24 * p, sy = 1 - 0.3 * p, dy = 34 * p;
      tf = `translate(${L0.x} ${r2(L0.y + dy)}) skewX(${r2(skew)}) scale(1 ${r2(sy * 1000) / 1000}) translate(${-L0.x} ${-L0.y})`;
      hit = t >= W_M2 ? env(t - W_M2, 0.3) : 0;
    }
    return (
      <g key={ch} opacity={keep}>
        <defs>
          <clipPath id={`s8-letter-${ch}`}>
            <rect x={L0.x - L0.size * 1.2} y={r2(top)} width={2.4 * L0.size} height={L0.size * 1.3} />
          </clipPath>
        </defs>
        <g transform={tf}>
          <g clipPath={`url(#s8-letter-${ch})`}>
            <g transform={`translate(${L0.x} ${L0.y}) scale(${r2(breathe * 1000) / 1000}) translate(${-L0.x} ${-L0.y})`}>
              <BackLetter ch={ch} {...L0} on={on} press={hit} />
            </g>
          </g>
        </g>
      </g>
    );
  };
  const fil = (lit: number) => `brightness(${lit.toFixed(3)}) saturate(${(0.6 + 0.4 * lit).toFixed(3)})`;
  const contact = t >= T_CONTACT ? env(t - T_CONTACT, 0.5) : 0;
  return (
    <>
      <Layer>
        {grid}
        {letter('S', sLit)}
        {letter('M', mLit)}
        {rings.map((r) => (
          <circle key={r.j} cx={r2(P0[0])} cy={r2(P0[1])} r={r2(r.R)} fill="none" stroke={r.j === 0 ? K.orange : K.cream} strokeOpacity={0.5 * (1 - r.q) * keep} strokeWidth={2.2} />
        ))}
        {/* control lines: reaching for the cursor while the roles are open, joined in the trance */}
        {NODES.map((n, i) => {
          const reach = t < L.enter ? 0.4 + 0.08 * Math.sin(t * 3 + i) : lerp(0.4, 1, prog(t, L.enter + i * 0.04, L.enter + 0.35 + i * 0.04));
          const tip: P2 = [lerp(n[0], P0[0], reach), lerp(n[1], P0[1], reach)];
          const o = build * keep * 0.8;
          return (
            <g key={i} opacity={o}>
              <path d={`M ${n[0]} ${n[1]} L ${r2(tip[0])} ${r2(tip[1])}`} stroke={t >= L.enter ? K.orange : K.cream} strokeOpacity={t >= L.enter ? 0.45 : 0.25} strokeWidth={1.5} strokeDasharray={t >= L.enter ? undefined : '4 6'} />
              <circle cx={n[0]} cy={n[1]} r={5} fill={t >= L.enter ? K.orange : K.cream} opacity={0.7} />
            </g>
          );
        })}
      </Layer>
      <Pic src="la3x/sm_M_tone.png" x={M_XY[0]} y={M_XY[1]} w={1536 * SKM} h={1024 * SKM} o={mIn > 0 ? keep : 0} clip={`inset(0 0 0 ${r2((1 - mIn) * 100)}%)`} filter={fil(mLit)} />
      <Layer>
        {/* the one cursor: drawn under her boot, its tail at M's fingertips */}
        <g opacity={build * keep} transform={`translate(${r2(CT[0])} ${r2(CT[1] + 60)}) scale(1 ${press}) translate(${r2(-CT[0])} ${r2(-CT[1] - 60)})`}>
          <Cursor x={CT[0]} y={CT[1]} s={1.2 * CS} />
        </g>
      </Layer>
      <Pic src="la3x/sm_S_tone.png" x={S_XY[0]} y={S_XY[1] - 16 * (1 - sIn)} w={1024 * SKS} h={1536 * SKS} o={sIn > 0 ? keep : 0} clip={`inset(0 0 ${r2((1 - sIn) * 100)}% 0)`} filter={fil(sLit)} />
      <Layer>
        {shoot > 0 && (
          <g opacity={0.18 + 0.82 * ropeLit}>
            <path d={rope(shoot)} fill="none" stroke={K.bg} strokeWidth={7} strokeLinecap="round" />
            <path d={rope(shoot)} fill="none" stroke={ropeLit > 0.7 ? K.orange : K.cream} strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        <SoftRing t={t} t0={W_S} x={FOOT_AT[0]} y={FOOT_AT[1]} r0={10} r1={70} dur={0.45} color={K.orange} />
        {contact > 0.02 && <circle cx={r2(TOUCH_AT[0])} cy={r2(TOUCH_AT[1])} r={r2(10 + 30 * (1 - contact))} fill="none" stroke={K.orange} strokeWidth={2} opacity={contact * keep} />}
        <FeedWin
          t={t}
          t0={L.role}
          x={60}
          y={60}
          w={310}
          size={18}
          o={keep}
          title="role.ts — control"
          rows={[
            {t: L.role + 0.1, text: 'role.switch();'},
            {t: L.role + 0.6, text: 'control.owner = ?', tone: 'dim'},
            {t: W_S + 0.05, text: 'control.owner = me', tone: 'orange'},
            {t: W_M2 + 0.05, text: 'control.owner = you', tone: 'orange'},
            {t: L.trance, text: 'while (true) enter();', tone: 'cream'},
          ]}
        />
      </Layer>
    </>
  );
};

// One caption track for the whole span, so a line never waits for a shot's fade.
const CAPS: {t0: number; t1: number; text: string; marks?: [number, number][]}[] = [
  {t0: L.gender, t1: L.fm, text: 'Switch my gender'},
  {t0: L.fm, t1: L.whatever, text: 'To F to M', marks: [[0, L.fm], [3, W_F], [5, W_M - 0.3], [8, W_M]]},
  {t0: L.whatever, t1: L.ampm, text: 'And then do whatever'},
  {t0: L.ampm, t1: L.role, text: 'From AM to PM', marks: [[0, L.ampm], [5, W_AM], [8, W_PM - 0.25], [11, W_PM]]},
  {t0: L.role, t1: L.sm, text: 'Oh switch my role'},
  {t0: L.sm, t1: L.enter, text: 'To S to M', marks: [[0, L.sm], [3, W_S - LETTER_ON], [5, W_M2 - 0.3], [8, W_M2 - LETTER_ON]]},
  {t0: L.enter, t1: L.trance, text: 'So we can enter'},
  {t0: L.trance, t1: L.ific, text: 'The trance the trance'},
];

export const ScenesS2: React.FC = () => {
  const {t} = useT();
  if (t < IN || t > OUT[1]) return null;
  const o = prog(t, IN, IN + 0.1) * (1 - prog(t, OUT[0], OUT[1]));
  const fmO = 1 - prog(t, FM_END - 0.05, FM_END + 0.08);
  const gO = prog(t, FM_END - 0.05, FM_END + 0.08) * (1 - prog(t, GLOBE_END - 0.05, GLOBE_END + 0.08));
  const smO = prog(t, GLOBE_END - 0.05, GLOBE_END + 0.08);
  const bgO = 1 - prog(t, T_GATHER[0] + 0.2, T_GATHER[1]); // the stage beneath shows through as it all gathers into the line
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: K.bg, opacity: bgO}} />
      {fmO > 0 && (
        <AbsoluteFill style={{opacity: fmO}}>
          <FM t={t} />
        </AbsoluteFill>
      )}
      {gO > 0 && (
        <AbsoluteFill style={{opacity: gO}}>
          <Globe t={t} />
        </AbsoluteFill>
      )}
      {smO > 0 && (
        <AbsoluteFill style={{opacity: smO}}>
          <SM t={t} />
        </AbsoluteFill>
      )}
      <Layer>
        {CAPS.map((c) => (
          <Caption key={c.text} t={t} t0={c.t0} t1={c.t1 - HAND} text={c.text} marks={c.marks} {...LYRIC} plate />
        ))}
      </Layer>
    </AbsoluteFill>
  );
};
