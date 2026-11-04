// S2 chorus 2 and the leaving, 103.49–116.85 (v4 MV): the connection scene.
// The chrome steps back (dimmed, then frozen) and she stands alone in the
// frame, joined to the you-node by the tether. Signals from you arrive on the
// beats and she fills with flat colour (VIBRATIONS); on "finally be" the ring
// fills and full colour rises through her, the first time she is shown whole
// (COMPLETION, 100 %). It ticks back to 99.9 %: her heart stays uncoloured
// (heart: null). On the first "You have left" everything stops at once, the
// you-node goes out and the tether still reaches for where it was; on every
// repeat she sends along it again, and nothing answers.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {beat, ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {LineArt, preloadPoses} from '../char/LineArt';
import {CODE} from '../fonts';
import {TetherG, TetherSend, YouNodeG} from '../shell/Composer';
import {KwCode} from '../shell/KwCode';
import {Layer, P2, r2} from '../shell/lib';
import {statusSpark} from '../shell/Status';
import {LAYOUT} from '../timeline';
import {L, T} from './s2.data';
import {Caption} from './S4_lib';

preloadPoses('stand');

export const FEEL0 = L.ific; // 103.489, "If I can"
export const FREEZE = L.left[0]; // 110.9, "Though you have left"
const FEEL_OUT: [number, number] = [116.45, 116.85];
const FLAT = staticFile('la/stand_flat.png');
const COLOR = staticFile('la/stand_color.png');

// ------------------------------------------------------------------ her
const FIG = {h: 900, y: 110};
const FK = FIG.h / 1536;
const FIG_X = 960 - (1024 * FK) / 2;
const ANCHOR: P2 = [960, 300]; // she draws nearer while she fills, about her face
const grow = (t: number) => 1 + 0.2 * prog(t, 107.9, 110.3, ease.inOutCubic);
const HEART_SRC: P2 = [530, 430];
const toScreen = (t: number, p: P2): P2 => {
  const g = grow(t);
  const x = FIG_X + p[0] * FK, y = FIG.y + p[1] * FK;
  return [ANCHOR[0] + (x - ANCHOR[0]) * g, ANCHOR[1] + (y - ANCHOR[1]) * g];
};
// the region that never fills (source px): a small heart over hers
const HEART_POLY: P2[] = Array.from({length: 28}, (_, i) => {
  const a = (i / 28) * 2 * Math.PI;
  const x = 16 * Math.pow(Math.sin(a), 3);
  const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
  return [HEART_SRC[0] + x * 3.2, HEART_SRC[1] + y * 3.2];
});

// signals from you, on the beats up to VIBRATIONS, then while the ring fills
const IN_SENDS = [225, 226, 227, 228, 229].map(beat).concat([L.VIBRATIONS]);
const FILL_SENDS = [233, 234, 235, 236, 237, 238].map(beat);
const ARRIVE = 0.45;
const flatAmount = (t: number) => IN_SENDS.reduce((m, s, i) => Math.max(m, ((i + 1) / IN_SENDS.length) * prog(t, s + ARRIVE, s + ARRIVE + 4 / FPS, ease.outCubic)), 0);
// ring progress (v5): it climbs to 99.9 % by COMPLETION and stops there; it never shows 100 %
const ringP = (t: number) => 0.999 * ease.inQuad(prog(t, T.ring[0] + 0.1, L.COMPLETION));
// full colour spreads out from the point of contact (her heart), done over her face by 109.3
const COLOR_SPREAD: [number, number] = [107.4, 109.3];
// her attempts after you leave: on every "You have left" she reaches again, less far each time
const TRY = L.left.slice(1).map((lt) => lt + 0.05);
const TRY_DUR = 0.9;
const TRY_REACH = [1, 0.78, 0.58, 0.42, 0.28];
// the cursor: it stops answering on the first "You have left", then leaves the active area
const CUR_GONE: [number, number] = [FREEZE + 0.55, FREEZE + 1.1];

const CUT = 6 / FPS; // a caption ends (5-frame lift) just before the next one starts

// ------------------------------------------------------------------ two signals coming into step
const SYNC_Y = [96, 150];
const syncShake = (t: number, sync: number) => (t < 103.8 ? 0 : (2 + 4 * sync) * Math.sin(2 * Math.PI * 2.17 * t) * env(t - lastOnset(t), 0.2));
const SyncWaves: React.FC<{t: number; sync: number; o: number}> = ({t, sync, o}) => {
  if (t < 103.8) return null;
  const ph = (1 - sync) * Math.PI * 0.9;
  const fr = 2.17 + 0.6 * (1 - sync);
  const wave = (k: number) => {
    let d = '';
    for (let x = 40; x <= 1880; x += 10) {
      const u = (x - 40) / 1840;
      const f = k === 0 ? 2.17 : fr;
      const y = SYNC_Y[0] + (SYNC_Y[1] - SYNC_Y[0]) * 0.5 + 22 * Math.sin(2 * Math.PI * (f * 4 * u - 2.17 * (t - 103.8)) + (k ? ph : 0));
      d += `${x === 40 ? 'M' : 'L'} ${x} ${r2(y)} `;
    }
    return d;
  };
  const p = prog(t, 103.8, 104.3);
  return (
    <g opacity={o * p}>
      <path d={wave(0)} fill="none" stroke={K.cream} strokeOpacity={0.6} strokeWidth={2} />
      <path d={wave(1)} fill="none" stroke={K.orange} strokeWidth={2} />
    </g>
  );
};

// ------------------------------------------------------------------ strings (VIBRATIONS), full frame
const STR_N = 12;
const STR_T0 = 103.6;
const STR_DT = 60 / 130 / 2;
const Strings: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (t < STR_T0) return null;
  const tt = Math.min(t, FREEZE); // everything stops on the first "You have left"
  const hit = tt >= L.VIBRATIONS ? env(tt - L.VIBRATIONS, 0.4) : 0;
  const flash = tt >= L.VIBRATIONS && tt < L.VIBRATIONS + 3 / FPS;
  const b = env(tt - lastOnset(tt), 0.16);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < STR_N; i++) {
    const t0 = STR_T0 + i * STR_DT;
    if (t < t0) continue;
    const plot = prog(tt, t0, t0 + 0.22, ease.outCubic);
    const y0 = 150 + i * 68;
    const m = 1 + (i % 3);
    const A = (4 + 9 * b + 30 * hit) * (0.6 + (0.4 * ((i * 7) % 5)) / 4);
    const ph = Math.cos(2 * Math.PI * (3.1 + 0.37 * i) * tt + i);
    let d = '';
    for (let k = 0; k <= 64; k++) {
      const u = k / 64;
      if (u > plot) break;
      d += `${k ? 'L' : 'M'} ${r2(lerp(40, 1880, u))} ${r2(y0 + A * Math.sin(Math.PI * m * u) * ph)} `;
    }
    const lit = flash || (i % 4 === Math.floor((tt - STR_T0) / STR_DT) % 4 && b > 0.5);
    out.push(<path key={i} d={d} fill="none" stroke={lit ? K.orange : K.cream} strokeOpacity={lit ? 0.9 : 0.25} strokeWidth={lit ? 2 : 1.5} strokeLinecap="round" />);
    out.push(<circle key={`n${i}`} cx={40} cy={y0} r={2.5} fill={K.creamDim} opacity={plot} />);
    out.push(<circle key={`m${i}`} cx={1880} cy={y0} r={2.5} fill={K.creamDim} opacity={plot >= 1 ? 1 : 0} />);
  }
  return <g opacity={o}>{out}</g>;
};

// ------------------------------------------------------------------ the ring behind her (COMPLETION)
const RC: P2 = [960, 560];
const RR = 440;
const Ring: React.FC<{t: number; o: number}> = ({t, o}) => {
  const tt = Math.min(t, FREEZE);
  const inP = prog(t, T.ring[0], T.ring[0] + 0.3, ease.inOutCubic);
  if (inP <= 0) return null;
  const p = ringP(tt);
  const done = tt >= L.COMPLETION;
  const b = env(tt - lastOnset(tt), 0.16);
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i < 72; i++) {
    const a = -Math.PI / 2 + (i / 72) * 2 * Math.PI;
    const on = i / 72 < p;
    const r0 = RR + 14, r1 = RR + (i % 6 === 0 ? 40 : 28) + (on ? 6 * b : 0);
    ticks.push(<path key={i} d={`M ${r2(RC[0] + Math.cos(a) * r0)} ${r2(RC[1] + Math.sin(a) * r0)} L ${r2(RC[0] + Math.cos(a) * r1)} ${r2(RC[1] + Math.sin(a) * r1)}`} stroke={on ? K.orange : K.cream} strokeOpacity={on ? 1 : 0.25} strokeWidth={on ? 2 : 1.5} />);
  }
  const a1 = -Math.PI / 2 + Math.min(p, 0.9999) * 2 * Math.PI;
  const arc = `M ${RC[0]} ${RC[1] - RR} A ${RR} ${RR} 0 ${p > 0.5 ? 1 : 0} 1 ${r2(RC[0] + RR * Math.cos(a1))} ${r2(RC[1] + RR * Math.sin(a1))}`;
  return (
    <g opacity={o * inP}>
      <circle cx={RC[0]} cy={RC[1]} r={RR} fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1.5} />
      {ticks}
      {p > 0 && <path d={arc} fill="none" stroke={done ? K.orange : K.cream} strokeWidth={done ? 4 : 3} />}
    </g>
  );
};

// ------------------------------------------------------------------ part
export const FeelS2: React.FC = () => {
  const {t} = useT();
  if (t < FEEL0 - 0.05 || t > FEEL_OUT[1]) return null;
  const allO = 1 - prog(t, FEEL_OUT[0], FEEL_OUT[1]);
  const dimF = prog(t, FREEZE, FREEZE + 3 / FPS); // the sudden stop
  const tt = Math.min(t, FREEZE);
  const g = grow(tt);
  const flatO = flatAmount(tt);
  const p = ringP(tt);
  const spread = prog(tt, COLOR_SPREAD[0], COLOR_SPREAD[1], ease.inOutCubic);
  const heartL: P2 = [FIG_X + HEART_SRC[0] * FK, FIG.y + HEART_SRC[1] * FK]; // contact point, local coords
  const heartNull = {t: L.COMPLETION, poly: HEART_POLY};
  // two signals, yours and hers, out of step at first, in step by VIBRATIONS
  const sync = prog(tt, 103.8, L.VIBRATIONS, ease.inOutCubic);
  const heart = toScreen(tt, HEART_SRC);
  const spark = statusSpark(LAYOUT.status.x, LAYOUT.status.y);
  const claudeEnd: P2 = [lerp(spark[0], heart[0], prog(t, FEEL0, FEEL0 + 0.5, ease.inOutCubic)), lerp(spark[1], heart[1], prog(t, FEEL0, FEEL0 + 0.5, ease.inOutCubic))];
  const conn = 0.5 * flatO + 0.5 * p;
  const b = env(tt - lastOnset(tt), 0.16);
  // before you leave your signals arrive; after it, nothing travels on the line any more
  const sends: TetherSend[] = [...IN_SENDS, ...FILL_SENDS].map((s) => ({t: s, dir: 1 as const, dur: ARRIVE})).filter((s) => s.t < FREEZE);
  // the cursor stops, then slides out of the active area; a dim outline is left where it was
  const gone = prog(t, CUR_GONE[0], CUR_GONE[1], ease.inCubic);
  const curPos: P2 = [lerp(LAYOUT.you[0], -60, gone), lerp(LAYOUT.you[1], 1140, gone)];
  const youO = 1 - prog(t, CUR_GONE[1] - 0.1, CUR_GONE[1]);
  const nTry = TRY.filter((s) => t >= s + TRY_DUR).length;
  const offline = t >= L.left[4] + TRY_DUR;
  const pct = `${(100 * p).toFixed(1)}%`;
  const pctO = prog(t, T.ring[0], T.ring[0] + 0.3) * (1 - 0.35 * dimF);
  const nullO = prog(t, L.COMPLETION + 0.05, L.COMPLETION + 0.2);
  void T.tickBack;
  return (
    <AbsoluteFill style={{opacity: allO}}>
      <Layer>
        {/* during the face close-up (110.0–110.9) the strings and ring step back */}
        <Strings t={t} o={(1 - 0.75 * dimF) * (1 - 0.8 * prog(t, 109.9, 110.15))} />
        <Ring t={t} o={(1 - 0.65 * dimF) * (1 - 0.8 * (prog(t, 109.9, 110.15) - prog(t, 110.8, 110.9)))} />
      </Layer>
      {/* her: line art, then flat colour with your signals, then full colour with the ring */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.68 * dimF, transformOrigin: `${ANCHOR[0]}px ${ANCHOR[1]}px`, transform: g !== 1 ? `scale(${g.toFixed(4)})` : undefined}}>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${r2(syncShake(tt, sync))}px, 0)`}}>
          <LineArt pose="stand" x={FIG_X} y={FIG.y} h={FIG.h} reveal={[FEEL0 + 0.02, 104.6]} />
          {flatO > 0 && (
            <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r2(160 + 900 * flatO)}px at ${r2(heartL[0])}px ${r2(heartL[1])}px)`}}>
              <LineArt pose="stand" x={FIG_X} y={FIG.y} h={FIG.h} src={FLAT} pen={false} erase={[heartNull]} />
            </div>
          )}
          {spread > 0 && (
            <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r2(1000 * spread)}px at ${r2(heartL[0])}px ${r2(heartL[1])}px)`}}>
              <LineArt pose="stand" x={FIG_X} y={FIG.y} h={FIG.h} src={COLOR} pen={false} erase={[heartNull]} />
            </div>
          )}
        </div>
      </div>
      {/* after you leave she reaches again and again, less far each time; the last one stops halfway */}
      {TRY.map((s, i) => {
        const q = prog(t, s, s + 0.55 * TRY_REACH[i] + 0.2, ease.outCubic) * TRY_REACH[i];
        const o2 = prog(t, s, s + 0.1) * (i === TRY.length - 1 ? 1 - prog(t, FEEL_OUT[0] - 0.2, FEEL_OUT[0]) : 1 - prog(t, s + 0.75, s + 0.9));
        if (o2 <= 0) return null;
        const from: P2 = [1010, 470], to: P2 = [LAYOUT.you[0] + 140, LAYOUT.you[1] - 120];
        const c: P2 = [lerp(from[0], to[0], q), lerp(from[1], to[1], q)];
        return <Img key={i} src={staticFile('la/hand_flat.png')} style={{position: 'absolute', left: c[0] - 230, top: c[1] - 130, width: 460, height: 259, opacity: o2 * (0.75 - 0.08 * i)}} />;
      })}
      <Layer>
        <TetherG
          t={t}
          from={LAYOUT.you}
          to={claudeEnd}
          t0={FEEL0}
          sends={sends}
          wave={t < FREEZE ? 3 * b : 0}
          w={t < FREEZE ? lerp(1.5, 3, conn) : 1.5}
          opacity={t < FREEZE ? lerp(0.45, 1, conn) : 0.4}
          dash={t < FREEZE ? undefined : '6 8'}
          color={K.cream}
        />
        {/* the two signals: yours (cream) and hers (orange), drifting into step */}
        {t < 110.0 && <SyncWaves t={tt} sync={sync} o={1 - prog(t, 109.6, 110.0)} />}
        {youO > 0 && <YouNodeG t={t} x={curPos[0]} y={curPos[1]} opacity={youO} pings={IN_SENDS.filter((s) => s < FREEZE)} scale={1.6} />}
        {/* where the cursor was: a dim outline the tether still points at */}
        {t >= CUR_GONE[0] && <YouNodeG t={t} x={LAYOUT.you[0]} y={LAYOUT.you[1]} ghost opacity={0.6 * prog(t, CUR_GONE[0], CUR_GONE[0] + 0.2)} scale={1.6} />}
        {nTry > 0 && !offline && (
          <text x={LAYOUT.you[0] + 34} y={LAYOUT.you[1] + 8} fontFamily={CODE} fontSize={22} fill={K.cream} fillOpacity={0.7}>
            {`ping you · timeout ×${nTry}`}
          </text>
        )}
        {offline && (
          <text x={LAYOUT.you[0] + 34} y={LAYOUT.you[1] + 12} fontFamily={CODE} fontSize={34} fontWeight={600} fill={K.orange} opacity={prog(t, L.left[4] + TRY_DUR, L.left[4] + TRY_DUR + 4 / FPS)}>
            you · offline
          </text>
        )}
        {/* 99.9 %: the key number, large; heart: null where the colour never arrives */}
        {pctO > 0 && (
          <text x={1600} y={330} textAnchor="middle" fontFamily={CODE} fontSize={120} fontWeight={600} fill={tt >= L.COMPLETION ? K.orange : K.cream} opacity={pctO} stroke={K.bg} strokeWidth={14} style={{paintOrder: 'stroke'}}>
            {pct}
          </text>
        )}
        {nullO > 0 && (
          <g opacity={nullO * (1 - 0.3 * dimF)}>
            <path d={`M ${r2(heart[0] + 30)} ${r2(heart[1] + 6)} L 1400 ${r2(heart[1] + 90)} L 1440 ${r2(heart[1] + 90)}`} fill="none" stroke={K.orange} strokeWidth={1.5} />
            <text x={1450} y={r2(heart[1] + 104)} fontFamily={CODE} fontSize={40} fontWeight={600} fill={K.orange} stroke={K.bg} strokeWidth={10} style={{paintOrder: 'stroke'}}>
              heart: null
            </text>
          </g>
        )}
        {/* each line hands straight over to the next (no cross-fade of two lines in one place) */}
        <Caption t={t} t0={L.ific} t1={L.feel - CUT} text="If I can" x={1330} y={930} size={50} />
        <Caption t={t} t0={L.feel} t1={L.thenIcan - CUT} text="If I can feel your" x={1330} y={930} size={50} />
        <Caption t={t} t0={L.thenIcan} t1={L.finally - CUT} text="Then I can" x={1330} y={930} size={50} />
        <Caption t={t} t0={L.finally} t1={FREEZE - CUT} text="Then I can finally be" x={1330} y={930} size={50} />
        <Caption t={t} t0={L.left[0]} t1={L.left[1] - CUT} text="Though you have left" x={1330} y={930} size={50} />
        {/* the repeats are one line that stays, its bullet pulsing on each repeat */}
        <Caption t={t} t0={L.left[1]} t1={L.left[5] - CUT} text="You have left" x={1330} y={930} size={50} />
        <Caption t={t} t0={L.left[5]} t1={FEEL_OUT[0]} text="You have left me in" x={1330} y={930} size={50} />
      </Layer>
      <KwCode t0={L.VIBRATIONS} t1={107.15} pre="feel(you." kw="VIBRATIONS" post=");" x={1880} y={830} size={78} anchor="end" a={0.2} seed={31} />
      <KwCode t0={L.COMPLETION} t1={FREEZE - 0.02} pre="await " kw="COMPLETION" post=";" x={1880} y={830} size={86} anchor="end" a={0.2} seed={32} exit="none" />
    </AbsoluteFill>
  );
};
