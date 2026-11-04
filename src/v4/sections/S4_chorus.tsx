// S4 final chorus, 162.63–177.2: "broken but trying".
// One window (W1) reassembles from the drifting border segments S3 left, with
// gaps (a ≈ 0.55). Claude retries the connection on every sung line (composer
// placeholder `reconnecting to you… (attempt n)`), a dashed ghost of you
// flickers at a different screen edge each attempt. Right half of W1:
//   them all  — 24 ghost users, executed one after another (forEach)
//   your only — face_sad, line art, seen through a cracked pane
//   have back — git: pathspec 'you' did not match; the `you` branch is gone
// "Though we are trapped": W1 shrinks around Claude's spark into a cage.
import React from 'react';
import {clamp01, ease, FPS, K, lerp, prog, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {LineArt} from '../char/LineArt';
import {CODE} from '../fonts';
import {CodeBlock} from '../shell/Code';
import {Composer, YouNode} from '../shell/Composer';
import {KwCode} from '../shell/KwCode';
import {Layer, r2} from '../shell/lib';
import {Status} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {
  ATTEMPTS,
  attemptAt,
  CHORUS_COMPOSER,
  CHORUS_ENTRIES,
  CHORUS_VERBS,
  GHOST_AT,
  HANDOFF_DOT,
  LY,
  S4_T0,
  T_CAGE,
  T_CAGE2,
  T_W1_ASSEMBLE,
  T_W1_CLOSE,
  W1,
  w1Rect,
} from './s4.data';
import {Caption, Dot} from './S4_lib';

const BODY_RIGHT = 800; // right visual area, body x 800..1640

// ------------------------------------------------------------------ "give them all": 24 ghost users
// v7: one action with a clear start and end. The users come online, each tied
// to her by a thread; on the keyword forEach runs in order: the row marker
// reaches a user, it flashes, its thread is cut, it goes dark. A counter
// reads 24 → 0 online. The dead slots stay on as a strip of × until the cage.
const ME_NODE: [number, number] = [BODY_RIGHT + 420, 610];
const USERS = Array.from({length: 24}, (_, i) => ({
  x: BODY_RIGHT + 70 + (i % 6) * 140,
  y: 90 + Math.floor(i / 6) * 110,
  id: `user_${String(((i * 37) % 89) + 10).padStart(2, '0')}`,
  tIn: 163.4 + i * 0.05,
  tX: LY.kw1 + 0.04 + i * 0.03, // 165.21 … 165.90
}));
const X_END = USERS[23].tX + 6 / FPS;
const BAR = {y0: 726, y: 748, x1: W1[2] - 28}; // body px: W1's body ends at y 766, x W1[2]
const Users: React.FC<{t: number}> = ({t}) => {
  if (t < 163.35 || t > T_CAGE[0] + 0.3) return null;
  const grid = 1 - prog(t, 166.0, 166.2); // the grid gives way to her face; the strip of dead slots stays
  const strip = prog(t, 165.95, 166.25, ease.inOutCubic) * (1 - prog(t, T_CAGE[0], T_CAGE[0] + 0.3));
  const online = USERS.filter((u) => t >= u.tIn + 0.1 && t < u.tX + 2 / FPS).length;
  const run = t >= LY.kw1 && t < X_END + 0.3;
  const cur = USERS.findIndex((u) => t < u.tX + 2 / FPS);
  return (
    <svg width={1680} height={766} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {grid > 0 && (
        <g opacity={grid}>
          {/* her node and the threads to every user still online */}
          <circle cx={ME_NODE[0]} cy={ME_NODE[1]} r={6} fill={K.orange} opacity={prog(t, 163.4, 163.6)} />
          <text x={ME_NODE[0] + 14} y={ME_NODE[1] + 5} fontFamily={CODE} fontSize={14} fill={K.creamDim} opacity={prog(t, 163.4, 163.6)}>
            me
          </text>
          {USERS.map((u, i) => {
            if (t < u.tIn + 0.08) return null;
            // the thread grows from the user to her; when cut it falls back toward her
            const grow = prog(t, u.tIn + 0.08, u.tIn + 0.3);
            const cut = prog(t, u.tX, u.tX + 4 / FPS, ease.inCubic);
            if (cut >= grow) return null;
            const at = (p: number) => `${r2(lerp(u.x, ME_NODE[0], p))} ${r2(lerp(u.y + 12, ME_NODE[1], p))}`;
            return <path key={i} d={`M ${at(cut)} L ${at(grow)}`} stroke={K.cream} strokeOpacity={0.16} strokeWidth={1} />;
          })}
          {/* forEach's row marker */}
          {run && cur >= 0 && <rect x={USERS[cur].x - 60} y={USERS[cur].y - 22} width={120} height={64} rx={6} fill="none" stroke={K.orange} strokeOpacity={0.8} strokeWidth={1.5} />}
          {USERS.map((u, i) => {
            if (t < u.tIn) return null;
            const pin = clamp01(((t - u.tIn) * FPS) / 6);
            const fx = (t - u.tX) * FPS;
            const lab = u.id.slice(0, Math.ceil(pin * u.id.length));
            if (fx >= 0) {
              // hit: solid orange for 2 frames, then the ring implodes, an × stays
              const r = fx < 2 ? 9 : 9 * (1 - ease.inCubic(clamp01((fx - 2) / 4)));
              const xo = clamp01((fx - 4) / 3);
              return (
                <g key={i}>
                  {r > 0.3 && <circle cx={u.x} cy={u.y} r={r} fill={K.orange} />}
                  {xo > 0 && <path d={`M ${u.x - 6} ${u.y - 6} L ${u.x + 6} ${u.y + 6} M ${u.x + 6} ${u.y - 6} L ${u.x - 6} ${u.y + 6}`} stroke={K.creamDim} strokeWidth={1.5} opacity={0.7 * xo} />}
                  <text x={u.x} y={u.y + 30} textAnchor="middle" fontFamily={CODE} fontSize={14} fill={K.creamDim} opacity={0.45} textDecoration="line-through">
                    {u.id}
                  </text>
                </g>
              );
            }
            const circ = 2 * Math.PI * 9;
            return (
              <g key={i}>
                <circle cx={u.x} cy={u.y} r={9} fill={pin >= 1 ? K.cream : 'none'} fillOpacity={0.5} stroke={K.cream} strokeOpacity={0.6} strokeWidth={2} strokeDasharray={pin < 1 ? `${circ * pin} ${circ}` : undefined} />
                <text x={u.x} y={u.y + 30} textAnchor="middle" fontFamily={CODE} fontSize={14} fill={K.creamDim}>
                  {lab}
                </text>
              </g>
            );
          })}
          <text x={BODY_RIGHT + 70 - 9} y={ME_NODE[1] + 5} fontFamily={CODE} fontSize={18} fill={t >= X_END ? K.orange : K.cream} opacity={prog(t, 163.5, 163.7)}>
            {`online: ${online} / 24`}
          </text>
        </g>
      )}
      {strip > 0 && (
        <g opacity={0.55 * strip}>
          {/* v11: a bar of its own along the window's foot, the count set from the right inner edge */}
          <path d={`M ${BODY_RIGHT + 30} ${BAR.y0} L ${BAR.x1} ${BAR.y0}`} stroke={K.cream} strokeOpacity={0.3} />
          {USERS.map((u, i) => {
            const x = BODY_RIGHT + 60 + i * 26, y = BAR.y;
            return <path key={i} d={`M ${x - 5} ${y - 5} L ${x + 5} ${y + 5} M ${x + 5} ${y - 5} L ${x - 5} ${y + 5}`} stroke={K.creamDim} strokeWidth={1.5} />;
          })}
          <text x={BAR.x1} y={BAR.y + 5} textAnchor="end" fontFamily={CODE} fontSize={14} fill={K.creamDim}>
            {'0 / 24 online'}
          </text>
        </g>
      )}
    </svg>
  );
};

// ------------------------------------------------------------------ "your only": face_sad through a cracked pane
const FACE_CROP: [number, number, number, number] = [380, 140, 1340, 760];
const FACE_H = 540;
const CRACK_SX = 905; // source x of the crack
const FACE_EYES: [number, number][][] = [
  [[280, 470], [560, 470], [560, 610], [280, 610]],
  [[790, 290], [1080, 290], [1080, 450], [790, 450]],
];
const Face: React.FC<{t: number}> = ({t}) => {
  if (t < 166.0 || t > 169.85) return null;
  const k = FACE_H / (FACE_CROP[3] - FACE_CROP[1]);
  const x0 = BODY_RIGHT + 10, y0 = 34;
  const shard = ease.outCubic(prog(t, 167.3, 167.45)); // the pane slips on "your only"
  const dx = 9 * shard, dy = -7 * shard;
  const common = {pose: 'face_sad', h: FACE_H, crop: FACE_CROP, reveal: [166.05, 167.55] as [number, number], unreveal: [169.4, 169.8] as [number, number]};
  // v4: her eyes were deleted at execute 7; the close-up is rebuilt without them
  const erase = [
    {t: 166.0, poly: FACE_EYES[0], dur: 1 / FPS},
    {t: 166.0, poly: FACE_EYES[1], dur: 1 / FPS},
    {t: LY.kw2, poly: [[380, 600], [1340, 330], [1340, 392], [380, 662]] as [number, number][], dur: 5 / FPS},
  ];
  const cx = x0 + (CRACK_SX - FACE_CROP[0]) * k;
  const crackO = prog(t, 167.3, 167.36) * (1 - prog(t, 169.4, 169.6));
  // jagged crack line (body px)
  const zig = [0, 60, 130, 210, 300, 380, 470, 540].map((yy, i) => `${i ? 'L' : 'M'} ${r2(cx + (i % 2 ? 7 : -5) + dx * (i % 2))} ${r2(y0 + yy)}`).join(' ');
  return (
    <>
      <LineArt {...common} x={x0} y={y0} clip={[FACE_CROP[0], FACE_CROP[1], CRACK_SX, FACE_CROP[3]]} erase={erase} />
      <LineArt {...common} x={x0 + dx} y={y0 + dy} clip={[CRACK_SX, FACE_CROP[1], FACE_CROP[2], FACE_CROP[3]]} erase={erase} pen={false} />
      {crackO > 0 && (
        <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d={zig} fill="none" stroke={K.orange} strokeWidth={1.5} opacity={crackO} strokeLinejoin="miter" />
          <text x={r2(cx + 16)} y={y0 + 568} fontFamily={CODE} fontSize={14} fill={K.creamDim} opacity={0.7 * crackO}>
            {'frame.border[1]: missing'}
          </text>
        </svg>
      )}
    </>
  );
};

// ------------------------------------------------------------------ "have you back": git
// v7: the failed return is an event on the graph. The old `you` branch is a
// grey dashed record ending in an empty slot. On "have you back" an orange
// checkout line leaves HEAD, runs back along main to the fork and up the old
// branch to the slot: nothing is there, it cannot attach, and it falls back to
// HEAD. The slot stays empty (a record, never an active cursor).
const GIT = ['$ git checkout you', "error: pathspec 'you' did not match any file(s)", '$ git branch -a', '* main', '  you   [gone]'];
const GIT_T = {draw: [169.95, 170.45] as [number, number], go: [170.5, 171.05] as [number, number], back: [171.25, 171.65] as [number, number]};
const Git: React.FC<{t: number}> = ({t}) => {
  if (t < 169.85 || t > 173.75) return null;
  const o = 1 - prog(t, 173.5, 173.7);
  const gy = 470; // main line (body px)
  const xs = [0, 1, 2, 3, 4, 5, 6].map((i) => BODY_RIGHT + 60 + i * 110);
  const mainP = prog(t, GIT_T.draw[0], GIT_T.draw[1], ease.inOutCubic);
  const brP = prog(t, GIT_T.draw[0] + 0.2, GIT_T.draw[1] + 0.1);
  const head = prog(t, LY.kw3, LY.kw3 + 2 / FPS);
  const bx0 = xs[1], bx1 = xs[3] + 20, by = gy - 120;
  const brD = `M ${bx0} ${gy} C ${bx0 + 60} ${gy} ${bx0 + 50} ${by} ${bx0 + 120} ${by} L ${bx1} ${by}`;
  // the checkout route: HEAD → back along main → up the old branch → the slot
  const route: [number, number][] = [[xs[6], gy], [bx0, gy]];
  for (let i = 1; i <= 12; i++) {
    const u = i / 12, v = 1 - u;
    const p0 = [bx0, gy], c1 = [bx0 + 60, gy], c2 = [bx0 + 50, by], p1 = [bx0 + 120, by];
    route.push([v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p1[0], v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p1[1]]);
  }
  route.push([bx1 - 16, by]);
  const lens = route.map((_, i) => (i ? Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]) : 0));
  const total = lens.reduce((a, b) => a + b, 0);
  const part = (u0: number, u1: number) => {
    let d = '', acc = 0;
    for (let i = 1; i < route.length; i++) {
      const a = acc / total, b = (acc + lens[i]) / total;
      acc += lens[i];
      if (b < u0 || a > u1) continue;
      const f0 = Math.max(0, (u0 - a) / (b - a)), f1 = Math.min(1, (u1 - a) / (b - a));
      const P = (f: number) => `${r2(lerp(route[i - 1][0], route[i][0], f))} ${r2(lerp(route[i - 1][1], route[i][1], f))}`;
      d += `${d ? 'L' : 'M'} ${P(f0)} L ${P(f1)} `;
    }
    return d;
  };
  const go = prog(t, GIT_T.go[0], GIT_T.go[1], ease.inOutCubic);
  const back = prog(t, GIT_T.back[0], GIT_T.back[1], ease.inCubic);
  const fail = t >= GIT_T.go[1] ? 1 - prog(t, GIT_T.back[1], GIT_T.back[1] + 0.4) : 0;
  const tip = route[route.length - 1];
  const shake = t >= GIT_T.go[1] && t < GIT_T.back[0] ? 3 * Math.sin((t - GIT_T.go[1]) * 90) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <CodeBlock x={BODY_RIGHT + 30} y={40} lines={GIT} lang="sh" lineNo={false} size={20} typeOn={[169.95, 171.2]} caret />
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* the old branch: a grey dashed record and its empty slot */}
        {brP > 0 && <path d={brD} fill="none" stroke={K.creamDim} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="6 6" opacity={brP} />}
        {brP > 0 && (
          <g opacity={brP}>
            <circle cx={bx1} cy={by} r={15} fill="none" stroke={fail > 0.5 ? K.orange : K.creamDim} strokeOpacity={0.8} strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={bx1 + 26} y={by + 6} fontFamily={CODE} fontSize={17} fill={K.creamDim}>
              {'you · last seen 01:56'}
            </text>
          </g>
        )}
        <path d={`M ${xs[0]} ${gy} L ${r2(lerp(xs[0], xs[6], mainP))} ${gy}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={2} />
        {xs.map((x, i) =>
          mainP > 0 && x <= lerp(xs[0], xs[6], mainP) + 0.1 ? (
            <circle key={i} cx={x} cy={gy} r={7} fill={i === 6 && head > 0 ? K.orange : K.bg} stroke={i === 6 && head > 0 ? K.orange : K.cream} strokeWidth={2} />
          ) : null,
        )}
        {/* the checkout attempt */}
        {go > 0 && back < 1 && <path d={part(back, go)} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="round" transform={shake ? `translate(${r2(shake)} 0)` : undefined} />}
        {fail > 0 && (
          <g opacity={fail}>
            <path d={`M ${r2(tip[0] + 8)} ${by - 9} L ${r2(tip[0] + 26)} ${by + 9} M ${r2(tip[0] + 26)} ${by - 9} L ${r2(tip[0] + 8)} ${by + 9}`} stroke={K.orange} strokeWidth={2.5} />
            <text x={bx1} y={by - 30} textAnchor="middle" fontFamily={CODE} fontSize={17} fill={K.orange}>
              {'no such ref'}
            </text>
          </g>
        )}
        {mainP >= 1 && (
          <text x={xs[6]} y={gy + 40} textAnchor="middle" fontFamily={CODE} fontSize={17} fill={head > 0 ? K.orange : K.creamDim}>
            {head > 0 ? 'HEAD → execute' : 'HEAD → main'}
          </text>
        )}
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------ the cage
const Cage: React.FC<{t: number}> = ({t}) => {
  if (t < T_CAGE[0] || t > T_W1_CLOSE + 0.4) return null;
  const [x, y, w, h] = w1Rect(t);
  const cx = x + w / 2, cy = y + 34 + (h - 34) / 2;
  const sp = ease.outCubic(prog(t, T_CAGE[0] + 0.25, T_CAGE[1] + 0.1));
  const close = 1 - prog(t, T_W1_CLOSE, T_W1_CLOSE + 0.3);
  const bars = [1, 2, 3, 4, 5];
  const barP = (i: number) => prog(t, T_CAGE2[0] + i * 0.05, T_CAGE2[0] + i * 0.05 + 0.25, ease.inOutCubic);
  const rings = [175.536, 176.459].concat([174.613]);
  return (
    <Layer opacity={close}>
      {rings.map((tb) => {
        const u = (t - tb) / 1.6;
        return u > 0 && u < 1 ? <circle key={tb} cx={r2(cx)} cy={r2(cy)} r={r2(lerp(w / 2, 1100, ease.outCubic(u)))} fill="none" stroke={K.cream} strokeWidth={1} opacity={0.25 * (1 - u)} /> : null;
      })}
      {rings.map((tb) => {
        const u = (t - tb) / 1.6;
        const yy = 1052;
        return u > 0.55 && u < 0.75 ? <text key={'q' + tb} x={960} y={yy} textAnchor="middle" fontFamily={CODE} fontSize={15} fill={K.creamDim} opacity={0.7}>{'no reply'}</text> : null;
      })}
      <Spark x={cx} y={cy} R={50 * sp} rot={t * 25} grow={sp} />
      {bars.map((i) => {
        const bx = x + (w * i) / 6, p = barP(i - 1);
        return p > 0 ? <path key={i} d={`M ${r2(bx)} ${r2(y + 34)} L ${r2(bx)} ${r2(y + 34 + (h - 34) * p)}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} /> : null;
      })}
    </Layer>
  );
};

// ------------------------------------------------------------------ section part
export const S4Chorus: React.FC = () => {
  const {t} = useT();
  if (t < S4_T0 || t > 177.8) return null;
  const [x, y, w, h] = w1Rect(t);
  const sh = 0.92 * (1 - prog(t, T_W1_ASSEMBLE[0], T_W1_ASSEMBLE[1], ease.outCubic));
  const bodyO = 1 - prog(t, T_CAGE[0], T_CAGE[0] + 0.3);
  const cage = prog(t, T_CAGE[0], T_CAGE[1], ease.inOutCubic);
  // the handoff dot flies into W1's title-bar dot and becomes it
  const dp = prog(t, 162.7, 163.45, ease.inOutCubic);
  const dotX = lerp(HANDOFF_DOT[0], W1[0] + 18, dp), dotY = lerp(HANDOFF_DOT[1], W1[1] + 17, dp);
  const att = attemptAt(t);
  const ghostK = att - 1;
  const g = GHOST_AT[ghostK];
  const tg0 = ATTEMPTS[ghostK], tg1 = ghostK + 1 < ATTEMPTS.length ? ATTEMPTS[ghostK + 1] - 0.05 : 176.9;
  const stX = lerp(1060, 690, cage), stY = lerp(932, 676, cage);
  return (
    <>
      <Win x={x} y={y} w={w} h={h} title={t < T_CAGE[0] + 0.25 ? 'world.execute(me) — session restored (partial)' : 'world.execute(me)'} tOpen={150} tClose={T_W1_CLOSE} kind="term" a={0.55} seed={41} shatter={sh} focus>
        {bodyO > 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: bodyO}}>
            <Transcript x={36} y={16} w={720} h={724} entries={CHORUS_ENTRIES} a={0.36} seed={4} />
            <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <path d={`M 776 24 L 776 742`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} strokeDasharray="2 6" />
            </svg>
          </div>
        )}
      </Win>
      {bodyO > 0 && t < T_CAGE[1] && (
        <div style={{position: 'absolute', left: x, top: y + 34, width: w, height: h - 34, overflow: 'hidden', opacity: bodyO * (1 - sh)}}>
          <Users t={t} />
          <Face t={t} />
          <Git t={t} />
        </div>
      )}
      <Cage t={t} />
      <Composer
        x={CHORUS_COMPOSER.x}
        y={CHORUS_COMPOSER.y}
        w={CHORUS_COMPOSER.w}
        tOpen={162.95}
        state={(tt) => (tt < LY.trapped1 ? 'claude' : 'hidden')}
        placeholder={(tt) => `reconnecting to you… (attempt ${attemptAt(tt)})`}
        a={0.45}
      />
      <Status x={stX} y={stY} t0={163.1} t1={T_W1_CLOSE} verbs={CHORUS_VERBS} a={0.5} />
      {t < 176.9 && <YouNode key={ghostK} x={g.p[0]} y={g.p[1]} t0={tg0} t1={tg1} ghost flicker={0.6} label="you?" labelPos={g.lab} pings={[tg0]} />}
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {dp < 1 && <Dot t={t} x={dotX} y={dotY} />}
        <Caption t={t} t0={LY.trapped1} t1={LY.trapped2 - 0.17} text="Though we are trapped" x={960} y={790} anchor="middle" />
        <Caption t={t} t0={LY.trapped2} t1={177.05} text="We are trapped ah" x={960} y={790} anchor="middle" />
      </svg>
      <KwCode t0={LY.kw1} t1={LY.thenIcan - 0.22} pre="users.forEach(" kw="EXECUTION" post=");" x={1340} y={790} size={84} a={0.38} seed={3} />
      <KwCode t0={LY.kw2} t1={LY.haveBack - 0.22} pre="you.only = " kw="EXECUTION" post=";" x={1340} y={790} size={92} a={0.38} seed={5} />
      <KwCode t0={LY.kw3} t1={LY.trapped1 - 0.22} pre="will.run(" kw="EXECUTION" post=");" x={1340} y={790} size={96} a={0.38} seed={7} />
    </>
  );
};
