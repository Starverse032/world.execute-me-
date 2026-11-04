// Close-ups of Claude (full frame, drawn above the camera layer). v7.
//  Comfort (66.5–70.0, "If I can make you happy / I will run the EXECUTION"):
//    your complaint arrives; she looks at it, reaches out, draws the cursor in
//    and holds it between her hands through a pane of the interface. She keeps
//    that pose while the execution window opens beside her.
//  Cat (81.3–85.1, "If I'm a tabby cat / purr / ENJOYMENT"): the cursor
//    hovers into her ear's hit box (onHover → purr); on "purr" she narrows her
//    eyes and lifts one hand in a loose cat-paw fist toward it; purr waves run
//    out to the cursor. Then the figure, the waves and the event window fold
//    back into cat.ts's preview pane, which keeps the same picture.
// Pose changes are hard cuts between aligned key drawings (one body, the
// changed parts redrawn), never a cross-fade of two whole figures.
// The cursor (you) stays on the outer surface; she stays inside the screen.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {beat, ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {YouNodeG} from '../shell/Composer';
import {CODE} from '../fonts';
import {DotGrid, FeedWin, LogTex, SoftRing} from '../shell/Feed';
import {KwCode, kwFit} from '../shell/KwCode';
import {Layer, P2, r2, rrPath} from '../shell/lib';
import {EDITOR, L} from './s1.data';
import {Caption, LYRIC} from './S4_lib';

const Pic: React.FC<{src: string; x: number; y: number; h: number; ar: number; o?: number}> = ({src, x, y, h, ar, o = 1}) =>
  o > 0 ? <Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, height: h, width: h * ar, opacity: o}} /> : null;

const glide = (t: number, a: P2, b: P2, t0: number, t1: number): P2 => {
  const p = prog(t, t0, t1, ease.inOutCubic);
  return [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
};
// cursor at scale s: the tip is at (x, y); its body centre is this far down-right
const CUR_BODY = (s: number): P2 => [6 * 1.92 * s, 10 * 1.92 * s];

// ------------------------------------------------------------------ comfort (v8)
// art: comfort_look / comfort_reach (aligned), then comfort_hugbox, 1536×1024 at
// full frame height. Your message arrives as a box; she looks at it, reaches,
// and the box slides into her arms; she closes her eyes and holds it, leaning
// her cheek toward it (v8a_points.json: the empty band between her arms is
// art [900, 505, 1536, 635]). The cursor stays outside: it sent the message.
const CF = {in: 66.5, out: [69.98, 70.03] as [number, number]}; // a cut back to the program, not a fade
const CK = 1080 / 1024;
const AX = -20;
const T_REACH = beat(145) - 0.04; // 67.03: she reaches on the beat after "happy"
const HUG = beat(146) - 0.08; // 67.45: she holds it
const LEAN = 110; // she leans toward the box while reaching; the hug drawing is already leaning
const lean = (t: number) => (t >= HUG ? 0 : LEAN * ease.inOutCubic(prog(t, T_REACH - 0.05, HUG)));
const MSG0 = {x: 1300, y: 404, w: 480, h: 64};
const BOX = {x: AX + 900 * CK + 14, y: 505 * CK + 6, w: 760, h: 130 * CK - 12}; // inside her arms
const CUR_TIP: P2 = [MSG0.x + MSG0.w + 18, MSG0.y + MSG0.h - 6];
const COMFORT_LOG = ['msg.in   "nothing worked today."', 'mood     low', 'listen   ok', 'reach    you.message', 'hold     1 / 1', 'run      --execution'];

const runBar = (t: number) => {
  const q = prog(t, 68.62, L.EXEC);
  const n = Math.round(q * 16);
  return `[${'='.repeat(n)}${' '.repeat(16 - n)}] ${String(Math.round(q * 100)).padStart(3)}%`;
};

export const ComfortFull: React.FC = () => {
  const {t} = useT();
  if (t < CF.in || t > CF.out[1]) return null;
  const o = prog(t, CF.in, CF.in + 0.1) * (1 - prog(t, CF.out[0], CF.out[1]));
  const msg = prog(t, CF.in, CF.in + 0.14, ease.outCubic);
  const pose = t < T_REACH ? 'look' : t < HUG ? 'reach' : 'hugbox';
  // the box: from where the message arrived into her arms, larger so it stays readable
  const g = ease.inOutCubic(prog(t, T_REACH + 0.05, HUG));
  const bx = lerp(MSG0.x, BOX.x, g), by = lerp(MSG0.y, BOX.y, g), bw = lerp(MSG0.w, BOX.w, g), bh = lerp(MSG0.h, BOX.h, g);
  const fs = lerp(24, 30, g);
  const held = t >= HUG;
  const glow = held ? 0.16 + 0.22 * env(t - HUG, 0.7) : 0;
  const cur: P2 = glide(t, [CUR_TIP[0] - 40, CUR_TIP[1] - 30], CUR_TIP, CF.in, CF.in + 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: K.bg}} />
      <Layer>
        <DotGrid lights={[{x: bx + bw / 2, y: by + bh / 2, r: 360, a: glow + 0.1 * msg * (held ? 0 : 1)}]} />
        <LogTex t={t} x={1500} y={330} h={110} lines={COMFORT_LOG} />
        {/* the message box, drawn behind her: her arms close around it */}
        <g opacity={msg} transform={`translate(0 ${r2(10 * (1 - msg))})`}>
          {held && <path d={rrPath(bx - 8, by - 8, bw + 16, bh + 16, 18)} fill="none" stroke={K.orange} strokeWidth={2} opacity={0.6 * env(t - HUG, 0.9)} />}
          <path d={rrPath(bx, by, bw, bh, 14)} fill={K.bg} stroke={held ? K.cream : K.cream} strokeOpacity={held ? 0.7 : 0.45} strokeWidth={held ? 2 : 1.5} />
          <text x={r2(bx + 26)} y={r2(by + bh / 2 + fs * 0.36)} fontFamily={CODE} fontSize={r2(fs)} fill={K.cream}>
            {'› nothing worked today.'}
          </text>
        </g>
      </Layer>
      <Pic src={`la3x/comfort_${pose}.png`} x={AX + lean(t)} y={0} h={1080} ar={1.5} />
      <Layer>
        <SoftRing t={t} t0={HUG} x={BOX.x + 220} y={BOX.y + BOX.h / 2} r0={60} r1={320} dur={0.9} />
        <YouNodeG t={t} x={cur[0]} y={cur[1]} scale={1.6} pings={[CF.in + 0.3]} />
        <FeedWin
          t={t}
          t0={CF.in + 0.05}
          x={1440}
          y={60}
          w={430}
          size={19}
          title={t < L.run ? 'comfort.ts' : 'comfort.ts — run'}
          rows={[
            {t: 66.62, text: 'me.listen(you.message);'},
            {t: T_REACH, text: 'me.hold(you.message);'},
            {t: L.run + 0.05, text: '$ run --execution', tone: 'cream'},
            {t: 68.6, text: '', render: (tt) => <text fontFamily={CODE} fontSize={19} fill={K.cream} xmlSpace="preserve">{runBar(tt)}</text>},
            {t: L.EXEC, text: '✓ done in 0.4s', tone: 'orange'},
          ]}
        />
        <Caption t={t} t0={L.happy} t1={L.run - 5 / FPS} text="If I can make you happy" {...LYRIC} plate />
        <Caption t={t} t0={L.run} t1={CF.out[0]} text="I will run the EXECUTION" marks={[[0, L.run], [15, L.EXEC]]} {...LYRIC} plate />
      </Layer>
      <KwCode t0={L.EXEC} t1={CF.out[0] - 0.2} pre="await " kw="EXECUTION" post="();" x={1870} y={920} anchor="end" size={kwFit('await ', 'EXECUTION', '();', 600, 96)} a={0} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cat
// art: catear_half → cat_smile_mid → cat_smile, 1024×1536, aligned (paw fist (193, 888),
// its front knuckle (129, 873)). v9: from the purr on both eyes are closed smile arcs
// (taken from catear_purr). v8: a head-and-shoulders close-up, ears clear of the top.
const CT = {in: L.cat - 0.05, back: [84.78, 85.1] as [number, number], end: 85.12};
const PURR = 83.72; // "purr", read off the centre-channel spectrogram
const T_MID = PURR + 0.1, T_PAW = PURR + 0.33; // the paw is up by 84.05
const CAT = {h: 1382, x: 689, y: 40};
const CK2 = CAT.h / 1536;
const CP = (p: P2): P2 => [CAT.x + p[0] * CK2, CAT.y + p[1] * CK2];
// cat.ts's preview (S1_verse) shows the same drawing at this place in the editor body
export const CAT_PV = {x: 258, y: 360, h: 600};
const PV_SCREEN: P2 = [EDITOR.x + CAT_PV.x, EDITOR.y + 66 + CAT_PV.y];
const PANE = {x0: EDITOR.x, y0: EDITOR.y + 66 + 356, x1: EDITOR.x + EDITOR.w, y1: EDITOR.y + EDITOR.h};
const EAR_BOX = {x: 852, y: 100, w: 140, h: 180};
const THROAT = CP([520, 735]);
const FIST_FRONT = CP([129, 873]);
const CS2 = 1.3;
const CAT_LOG = ['pointer.move  402,380', 'hitTest  ear → false', 'pointer.move  880,190', 'hitTest  ear → true', 'purr.hz  25', 'state  comfortable', 'tail  idle'];

export const CatFull: React.FC = () => {
  const {t} = useT();
  if (t < CT.in || t > CT.end) return null;
  const o = prog(t, CT.in, CT.in + 0.12);
  // folding back into the preview pane
  const u = prog(t, CT.back[0], CT.back[1], ease.inOutCubic);
  const bgO = 1 - prog(t, CT.back[0] + 0.06, CT.back[1] - 0.02);
  const fx = lerp(CAT.x, PV_SCREEN[0], u), fy = lerp(CAT.y, PV_SCREEN[1], u), fh = lerp(CAT.h, CAT_PV.h, u);
  const k = fh / CAT.h;
  const fold = (p: P2): P2 => [fx + (p[0] - CAT.x) * k, fy + (p[1] - CAT.y) * k];
  const clip = `inset(${r2(lerp(0, PANE.y0, u))}px ${r2(lerp(0, 1920 - PANE.x1, u))}px ${r2(lerp(0, 1080 - PANE.y1, u))}px ${r2(lerp(0, PANE.x0, u))}px)`;
  const pose = t < T_MID ? 'catear_half' : t < T_PAW ? 'cat_smile_mid' : 'cat_smile';
  // the cursor: in from the left, into the ear's hit box, then down to meet the paw
  const p0 = glide(t, [-40, 380], [790, 190], 81.55, 82.75);
  const p1 = glide(t, p0, [880, 168], 82.83, 82.98);
  const cur = glide(t, p1, [FIST_FRONT[0] - 62, FIST_FRONT[1] - 44], PURR + 0.05, T_PAW);
  const hover = t >= 82.88 && t < PURR + 0.6;
  const curO = 1 - prog(t, CT.back[0], CT.back[0] + 0.15);
  // purr waves from her throat, on the beats from "purr", fanned away from her face
  const waves: React.ReactNode[] = [];
  if (t >= PURR + 0.05)
    for (let j = 0; j < 5; j++) {
      const ob = Math.max(PURR + 0.05, lastOnset(t)) - j * (60 / 130);
      if (ob < PURR + 0.05) continue;
      const q = (t - ob) / 1.5;
      if (q < 0 || q > 1) continue;
      const R = 70 + 760 * q;
      let d = '';
      for (let i = 0; i <= 90; i++) {
        const a = (140 + (85 * i) / 90) * (Math.PI / 180);
        const rr = R + 5 * Math.sin(i * 0.8 + t * 22);
        const [x, y] = fold([THROAT[0] + Math.cos(a) * rr, THROAT[1] + Math.sin(a) * rr]);
        d += `${i ? 'L' : 'M'} ${r2(x)} ${r2(y)} `;
      }
      waves.push(<path key={j} d={d} fill="none" stroke={j === 0 ? K.orange : K.cream} strokeOpacity={0.75 * (1 - q)} strokeWidth={2.5 * (0.6 + 0.4 * k)} />);
    }
  const contact = t >= T_PAW ? env(t - T_PAW, 0.5) : 0;
  const joy = t >= L.ENJOY ? env(t - L.ENJOY, 0.5) : 0;
  const b = env(t - lastOnset(t), 0.2) * (t >= PURR ? 1 : 0);
  // the purr itself, as a low trace at the right
  let trace = '';
  for (let i = 0; i <= 120; i++) {
    const x = 1650 + 1.9 * i;
    const amp = (t >= PURR ? 6 + 16 * b : 2) * Math.sin(i * 0.9 - t * 30);
    trace += `${i ? 'L' : 'M'} ${r2(x)} ${r2(820 + amp)} `;
  }
  const NODES: P2[] = [[1700, 210], [1830, 260], [1750, 360], [1860, 430], [1710, 500]];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: K.bg, opacity: bgO}} />
      <AbsoluteFill style={{opacity: bgO}}>
        <Layer>
          <DotGrid lights={[{x: EAR_BOX.x + 50, y: EAR_BOX.y + 70, r: 260, a: hover ? 0.2 : 0}, {x: FIST_FRONT[0], y: FIST_FRONT[1], r: 320, a: 0.25 * contact + 0.12 * b}]} />
          <LogTex t={t} x={1650} y={600} h={140} lines={CAT_LOG} />
          {/* idle nodes that wake with the purr */}
          {NODES.map((p, i) => (
            <g key={i}>
              {i > 0 && <path d={`M ${NODES[i - 1][0]} ${NODES[i - 1][1]} L ${p[0]} ${p[1]}`} stroke={K.cream} strokeOpacity={0.12} />}
              <circle cx={p[0]} cy={p[1]} r={4 + 3 * b} fill={t >= PURR && i % 2 === 0 ? K.orange : K.cream} opacity={0.25 + 0.5 * b} />
            </g>
          ))}
          <text x={1650} y={782} fontFamily={CODE} fontSize={15} fill={K.creamDim} opacity={0.7}>
            {t >= PURR ? 'purr.hz = 25' : 'purr.hz = 0'}
          </text>
          <path d={trace} fill="none" stroke={t >= PURR ? K.orange : K.cream} strokeOpacity={0.5} strokeWidth={1.5} />
        </Layer>
      </AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, clipPath: clip}}>
        <Pic src={`la3x/${pose}.png`} x={fx} y={fy} h={fh} ar={1024 / 1536} />
        <Layer>{waves}</Layer>
      </div>
      <Layer>
        {/* the ear's hit box */}
        {hover && (
          <g opacity={prog(t, 82.88, 82.98) * (1 - prog(t, PURR + 0.4, PURR + 0.6))}>
            <rect x={EAR_BOX.x} y={EAR_BOX.y} width={EAR_BOX.w} height={EAR_BOX.h} rx={6} fill="none" stroke={K.orange} strokeWidth={1.5} strokeDasharray="5 5" />
            <text x={EAR_BOX.x} y={EAR_BOX.y - 10} fontFamily={CODE} fontSize={16} fill={K.orange}>
              ear
            </text>
          </g>
        )}
        <SoftRing t={t} t0={T_PAW} x={cur[0] + 15} y={cur[1] + 24} r0={16} r1={90} dur={0.6} color={K.orange} />
        <SoftRing t={t} t0={L.ENJOY} x={cur[0] + 15} y={cur[1] + 24} r0={20} r1={130} dur={0.7} />
        {joy > 0.02 && <circle cx={cur[0] + 15} cy={cur[1] + 24} r={r2(36 - 10 * joy)} fill="none" stroke={K.orange} strokeWidth={2} opacity={joy * curO} />}
        <YouNodeG t={t} x={cur[0]} y={cur[1]} t0={81.5} scale={CS2} opacity={curO} />
        <FeedWin
          t={t}
          t0={81.5}
          x={lerp(100, EDITOR.x + 30, u)}
          y={lerp(100, EDITOR.y + 90, u)}
          w={480}
          o={1 - prog(t, CT.back[0] + 0.05, CT.back[1] - 0.05)}
          title="cat.ts — events"
          rows={[
            {t: 81.6, text: 'onHover(ear, () => purr());'},
            {t: 82.88, text: 'pointer.enter → ear', tone: 'cream'},
            {t: PURR + 0.05, text: '→ purr()', tone: 'orange'},
            {t: T_PAW + 0.02, text: 'state → comfortable', tone: 'cream'},
          ]}
        />
        <Caption t={t} t0={L.cat} t1={L.purr - 5 / FPS} text="If I’m a tabby cat" {...LYRIC} plate />
        {/* v11: stays to the end of the line while the figure folds away; the chat's copy waits at low contrast */}
        <Caption t={t} t0={L.purr} t1={L.god - 5 / FPS} text="Then I will purr for your ENJOYMENT" marks={[[0, L.purr], [26, L.ENJOY], [35, L.ENJOY]]} {...LYRIC} plate />
      </Layer>
      <KwCode t0={L.ENJOY} t1={CT.back[0] - 0.02} pre="purr(): " kw="ENJOYMENT" post=";" x={100} y={880} anchor="start" size={kwFit('purr(): ', 'ENJOYMENT', ';', 560, 100)} a={0} />
    </AbsoluteFill>
  );
};
