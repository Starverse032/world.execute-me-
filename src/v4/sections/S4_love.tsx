// S4 love, 177.2–191.4, and the stage that carries her into the outro.
//   177.25 the cage window closes; one doc window opens: LOVE(7), a man page.
//          `profile` (eyes closed) is drawn slowly beside it. "I've studied" is a
//          lone caption; LO-O-OVE stretches as `man LO-O-OVE` on the held vowels.
//   180.86 the page glides into the stage slot; the chat comes back on the left;
//          the ghost of you turns solid and asks twice; Claude answers LOVE,
//          faster and faster (183.65), the man page highlights RETURN VALUE.
//   184.54 the tab switches to love.ipynb: the implicit heart is typed, set in
//          MATH and plotted in orange; it closes exactly on LO-O-OVE (187.665):
//          heart = <Curve> pays off `"heart": null`.
//   188.48 you float up and away, free. The heart opens like an iris around `sit`.
//   189.75 "I am trapped": the heart's stroke thickens into a double cage line.
//   190.80 "Trapped in": the whole IDE slams back in around her (S4_outro).
// Outro (stage side): on the deletion downbeats she un-plots back into geometry:
// ink → silhouette (D2) → circle / triangle / square (D3) → the heart dissolves to
// dots (D4) → the pieces line up as at boot (D5) → pieces to dots (D6) → the window
// goes (D7) → every dot is pulled into the one orange dot (D8).
import React from 'react';
import {ease, env, FPS, K, lastOnset, lerp, prog, useT} from '../../v3/core';
import {LineArt} from '../char/LineArt';
import {CODE, MATH} from '../fonts';
import {CodeBlock} from '../shell/Code';
import {Collapse} from '../shell/Collapse';
import {Composer, Tether, YouNode} from '../shell/Composer';
import {Layer, r2, textW, useFonts} from '../shell/lib';
import {Transcript} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {SERIF} from '../fonts';
import {
  COMPOSER,
  composerState,
  D,
  FINAL,
  LOVE_ENTRIES,
  LY,
  OUTRO_PROMPTS,
  P2,
  stageRect,
  T_CHROME,
  T_DOC_OPEN,
  T_GLIDE,
  T_GROW,
  T_HEART_PLOT,
  T_NB,
  T_SIT,
  targetA,
  TX,
  txH,
  YOU,
} from './s4.data';
import {Caption, circlePts, dPoly, HeartGeo, heartPts, lerpPts, loveChunks, polyClosed, rotPts, samplePoly, StretchKw, Stroke} from './S4_lib';

// ------------------------------------------------------------------ man page
const MAN = [
  'LOVE(7)           Miscellaneous           LOVE(7)',
  '',
  'NAME',
  '     love - a process that runs while you do',
  '',
  'SYNOPSIS',
  '     love [--you] [--always] <me>',
  '',
  'DESCRIPTION',
  '     love takes one argument and never',
  '     validates it. It does not return',
  '     until the argument is gone.',
  '',
  '     love has been studied. See STUDY.',
  '',
  'OPTIONS',
  '     --you      the only accepted input',
  '     --always   ignore every timeout',
  '',
  'RETURN VALUE',
  '     Undefined. Every call returns LOVE.',
  '',
  'BUGS',
  '     heart is null. See params.json(5).',
  '',
  'SEE ALSO',
  '     world.execute(3), you(1)',
];
const MAN_LH = 34;
const manScroll = (t: number) => 5 * prog(t, 178.6, 180.6, ease.inOutCubic) + 3 * prog(t, 182.9, 183.5, ease.inOutCubic);
const manHi = (t: number) => (t < 178.1 ? null : t < 179.5 ? 3 : t < 182.9 ? 9 : t < 183.9 ? 20 : 23);

// ------------------------------------------------------------------ heart geometry over time
const SMALL: HeartGeo = {ox: 1438, oy: 660, S: 165};
const BIG: HeartGeo = {ox: 1438, oy: 520, S: 300};
const heartGeo = (t: number): HeartGeo => {
  const p = prog(t, T_GROW[0], T_GROW[1], ease.inOutCubic);
  return {ox: lerp(SMALL.ox, BIG.ox, p), oy: lerp(SMALL.oy, BIG.oy, p), S: lerp(SMALL.S, BIG.S, p)};
};
const HC: P2 = [1438, 500]; // heartbeat scale centre
const BIG_PTS = heartPts(BIG);
const BIG_D = dPoly(BIG_PTS, true);
const INNER_PTS = heartPts({...BIG, oy: BIG.oy - 8, S: BIG.S * 0.93});
// lub-dub: every beat from "I am trapped", contractions on the outro downbeats until the heart dissolves
const heartbeat = (t: number) => {
  if (t < LY.amTrapped || t > D[3] + 0.3) return 1;
  const tb = lastOnset(t);
  let s = 1 + 0.025 * env(t - tb) + 0.012 * env(t - tb - 0.15);
  for (const d of D.slice(0, 4)) if (t >= d) s += 0.05 * env(t - d, 0.15) + 0.025 * env(t - d - 0.16, 0.15);
  return s;
};

// ------------------------------------------------------------------ her (sit) and her geometry
const SIT = {x: 1438 - (512 * 590) / 1536, y: 205, h: 590};
const SK = 590 / 1536;
const sm = (sx: number, sy: number): P2 => [SIT.x + sx * SK, SIT.y + sy * SK];
const HEAD = {c: sm(492, 322), r: 50};
const TRI_ON: P2[] = [sm(507, 450), [1568, 700], [1308, 700]];
const BOOK_C = sm(507, 525);
const SQ_ON: P2[] = rotPts([[BOOK_C[0] - 26, BOOK_C[1] - 28], [BOOK_C[0] + 26, BOOK_C[1] - 28], [BOOK_C[0] + 26, BOOK_C[1] + 28], [BOOK_C[0] - 26, BOOK_C[1] + 28]], BOOK_C, -12);
// the row at boot: circle, triangle, square
const ROW_Y = 520;
const ROW_X = [1248, 1438, 1628];
const N_C = 64;
const circleOn = circlePts(HEAD.c[0], HEAD.c[1], HEAD.r, N_C);
const circleRow = circlePts(ROW_X[0], ROW_Y, 54, N_C);
// resample triangle / square to fixed counts so they can glide point-for-point
const resample = (pts: P2[], n: number) => samplePoly(pts, n, 0).concat([samplePoly(pts, n, 0)[0]]);
const triOn = resample(polyClosed(TRI_ON), 48);
const triRow = resample(polyClosed([[ROW_X[1], ROW_Y - 62], [ROW_X[1] + 62, ROW_Y + 54], [ROW_X[1] - 62, ROW_Y + 54]]), 48);
const sqOn = resample(polyClosed(SQ_ON), 48);
const sqRow = resample(polyClosed([[ROW_X[2] - 50, ROW_Y - 50], [ROW_X[2] + 50, ROW_Y - 50], [ROW_X[2] + 50, ROW_Y + 50], [ROW_X[2] - 50, ROW_Y + 50]]), 48);
const PIECES = [
  {on: circleOn, row: circleRow, lab: 'circle'},
  {on: triOn, row: triRow, lab: 'triangle'},
  {on: sqOn, row: sqRow, lab: 'square'},
];

// ------------------------------------------------------------------ dots (the dissolve)
type DotP = {p: P2; t0: number; v: P2; seed: number; orange: boolean};
const hashF = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const HEART_DOTS: DotP[] = samplePoly(BIG_PTS, 84).map((p, i) => ({
  p,
  t0: D[3] + (i / 84) * 0.25,
  v: [(p[0] - HC[0]) * 0.03 + (hashF(i, 1) - 0.5) * 14, (p[1] - HC[1]) * 0.03 + (hashF(i, 2) - 0.5) * 14 - 4],
  seed: i,
  orange: true,
}));
const PIECE_DOTS: DotP[] = PIECES.flatMap((pc, k) =>
  samplePoly(pc.row, 30).map((p, i) => ({p, t0: D[5] + k * 0.08 + (i / 30) * 0.15, v: [(hashF(i + 100 * k, 3) - 0.5) * 18, (hashF(i + 100 * k, 4) - 0.5) * 18], seed: 300 + k * 40 + i, orange: false})),
);
const ALL_DOTS = [...HEART_DOTS, ...PIECE_DOTS];
const T_PULL = D[7];
const dotPos = (d: DotP, t: number): P2 => {
  const age = Math.max(0, Math.min(t, T_PULL) - d.t0);
  const bob = 3 * Math.sin(t * 1.7 + d.seed);
  const x = d.p[0] + d.v[0] * age, y = d.p[1] + d.v[1] * age + bob;
  const pull = prog(t, T_PULL + (d.seed % 17) * 0.012, T_PULL + 0.5 + (d.seed % 17) * 0.012, ease.inCubic);
  return [lerp(x, FINAL[0], pull), lerp(y, FINAL[1], pull)];
};
const Dots: React.FC<{t: number}> = ({t}) => {
  if (t < D[3] || t > T_PULL + 0.8) return null;
  return (
    <>
      {ALL_DOTS.map((d, i) => {
        if (t < d.t0) return null;
        const [x, y] = dotPos(d, t);
        const pull = prog(t, T_PULL, T_PULL + 0.75);
        const o = Math.min(1, (t - d.t0) * FPS / 3) * (1 - pull * pull);
        return o > 0 ? <circle key={i} cx={r2(x)} cy={r2(y)} r={2.2} fill={d.orange ? K.orange : K.cream} opacity={(d.orange ? 0.85 : 0.7) * o} /> : null;
      })}
    </>
  );
};

// ------------------------------------------------------------------ the heart + her
const HeartLayer: React.FC<{t: number}> = ({t}) => {
  if (t < T_HEART_PLOT[0] || t > D[7] + 1) return null;
  const g = heartGeo(t);
  const pts = t < T_GROW[0] ? heartPts(SMALL) : t >= T_GROW[1] ? BIG_PTS : heartPts(g);
  const plotP = ease.inOutSine(prog(t, T_HEART_PLOT[0], T_HEART_PLOT[1]));
  const hitF = (t - LY.love3) * FPS;
  const cageP = prog(t, LY.amTrapped, LY.amTrapped + 6 / FPS, ease.outCubic);
  const dissolve = prog(t, D[3], D[3] + 6 / FPS);
  let w = hitF >= 0 && hitF < 3 ? 3.5 : 2;
  w = lerp(w, 5, cageP);
  const s = heartbeat(t);
  const innerP = prog(t, LY.amTrapped, LY.amTrapped + 10 / FPS, ease.inOutCubic);
  // her: ink (reveal, clipped to the heart) → silhouette (D2) → gone (D3)
  const inkO = 1 - prog(t, D[1], D[1] + 0.4);
  const silO = prog(t, D[1], D[1] + 0.4) * (1 - prog(t, D[2] + 0.45, D[2] + 0.85));
  const clipD = t >= T_GROW[1] ? BIG_D : dPoly(pts, true);
  const herOn = t >= T_SIT[0] && t < D[2] + 0.9;
  return (
    <div style={{position: 'absolute', inset: 0, transform: s !== 1 ? `scale(${r2(s * 10000) / 10000})` : undefined, transformOrigin: `${HC[0]}px ${HC[1]}px`}}>
      {herOn && (
        <div style={{position: 'absolute', inset: 0, clipPath: `path('${clipD}')`}}>
          {inkO > 0 && <LineArt pose="sit" x={SIT.x} y={SIT.y} h={SIT.h} reveal={T_SIT} inkOpacity={inkO} />}
          {silO > 0 && <LineArt pose="sit" x={SIT.x} y={SIT.y} h={SIT.h} mode="sil" silFill="ink" opacity={silO} />}
        </div>
      )}
      <Layer>
        <g>
          {dissolve < 1 && (
            <g opacity={1 - dissolve}>
              {t < LY.love3 ? <Stroke pts={pts} p={plotP} color={K.orange} w={2} t={t} /> : <path d={dPoly(pts, true)} fill="none" stroke={K.orange} strokeWidth={w} strokeLinejoin="round" />}
              {innerP > 0 && <Stroke pts={INNER_PTS} p={innerP} color={K.cream} w={1.5} opacity={0.45} pen={innerP < 1} t={t} />}
            </g>
          )}
        </g>
        <Pieces t={t} />
      </Layer>
    </div>
  );
};

// circle / triangle / square: plotted on her (D3), lined up as at boot (D5), to dots (D6)
const Pieces: React.FC<{t: number}> = ({t}) => {
  if (t < D[2] || t > D[5] + 0.6) return null;
  return (
    <>
      {PIECES.map((pc, k) => {
        const t0 = D[2] + k * (3 / FPS);
        const pin = prog(t, t0, t0 + 6 / FPS, ease.inOutCubic);
        const gl = prog(t, D[4] + k * (2 / FPS), D[4] + k * (2 / FPS) + 0.62, ease.inOutCubic);
        const pts = gl <= 0 ? pc.on : gl >= 1 ? pc.row : lerpPts(pc.on, pc.row, gl);
        const out = prog(t, D[5] + k * 0.08, D[5] + k * 0.08 + 0.25);
        const lab = pc.lab;
        const lt = prog(t, D[4] + 0.62, D[4] + 0.62 + 6 / FPS);
        const lift = prog(t, D[5], D[5] + 5 / FPS);
        const n = Math.round(lab.length * lt);
        return (
          <g key={k}>
            <Stroke pts={pts} p={pin} color={K.cream} w={1.5} opacity={1 - out} t={t} />
            {pin >= 1 && gl > 0 && gl < 1 && <circle cx={pts[0][0]} cy={pts[0][1]} r={3} fill={K.orange} />}
            {n > 0 && lift < 1 && (
              <g opacity={1 - lift} transform={`translate(0 ${r2(-14 * lift)})`}>
                <path d={`M ${ROW_X[k] - 6} ${ROW_Y} L ${ROW_X[k] + 6} ${ROW_Y} M ${ROW_X[k]} ${ROW_Y - 6} L ${ROW_X[k]} ${ROW_Y + 6}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1} />
                <text x={ROW_X[k]} y={ROW_Y + 96} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim}>
                  {lab.slice(0, n)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ notebook body (tab 2)
const NB_CODE = ['# the algebraic expression of love', 'heart = (x**2 + y**2 - 1)**3 - x**2 * y**3 == 0', 'plot(heart, color=ORANGE)'];
const Notebook: React.FC<{t: number}> = ({t}) => {
  const o = 1 - prog(t, T_GROW[0], T_GROW[0] + 0.3);
  if (o <= 0) return null;
  const mathO = prog(t, 185.3, 185.5);
  const ax = prog(t, 185.2, 185.45, ease.inOutCubic);
  const outO = prog(t, LY.love3, LY.love3 + 4 / FPS);
  // axes centred on the small heart's origin (body px: origin − (980, 130))
  const cx = SMALL.ox - 980, cy = SMALL.oy - 130;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <text x={24} y={44} fontFamily={CODE} fontSize={18} fill={K.creamDim}>
          {'In [1]:'}
        </text>
        <rect x={104} y={18} width={790} height={118} fill="none" stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} rx={6} />
        <text x={124} y={196} fontFamily={MATH} fontStyle="italic" fontSize={40} fill={K.cream} opacity={0.7 * mathO}>
          {'(x² + y² − 1)³ − x²y³ = 0'}
        </text>
        {ax > 0 && (
          <g stroke={K.cream} strokeOpacity={0.25} strokeWidth={1}>
            <path d={`M ${r2(cx - 300 * ax)} ${cy} L ${r2(cx + 300 * ax)} ${cy}`} />
            <path d={`M ${cx} ${r2(cy - 240 * ax)} L ${cx} ${r2(cy + 190 * ax)}`} />
            {[-1, 1].map((u) => (
              <path key={u} d={`M ${cx + u * SMALL.S} ${cy - 5} L ${cx + u * SMALL.S} ${cy + 5}`} opacity={ax} />
            ))}
          </g>
        )}
        {ax > 0 && (
          <g fontFamily={MATH} fontStyle="italic" fontSize={24} fill={K.cream} opacity={0.45 * ax}>
            <text x={cx + SMALL.S - 4} y={cy + 30}>1</text>
            <text x={cx - SMALL.S - 14} y={cy + 30}>−1</text>
            <text x={cx + 306} y={cy + 8}>x</text>
            <text x={cx + 10} y={cy - 236}>y</text>
          </g>
        )}
        {outO > 0 && (
          <text x={24} y={262} fontFamily={CODE} fontSize={18} opacity={outO} xmlSpace="preserve">
            <tspan fill={K.creamDim}>{'Out[1]:  '}</tspan>
            <tspan fill={K.cream}>{'heart = '}</tspan>
            <tspan fill={K.orange}>{'<Curve>'}</tspan>
            <tspan fill={K.creamDim}>{'   # was null'}</tspan>
          </text>
        )}
      </svg>
      <CodeBlock x={124} y={28} lines={NB_CODE} lang="py" size={20} lineNo={false} typeOn={[184.62, 185.3]} caret />
    </div>
  );
};

// ------------------------------------------------------------------ the stage window
const StageWin: React.FC<{t: number}> = ({t}) => {
  const [x, y, w, h] = stageRect(t);
  const tab = t < T_NB ? 0 : 1;
  const title = t < T_NB ? 'LOVE(7) — man' : t < T_CHROME ? 'love.ipynb' : 'stage — world.execute(me)';
  const a = t < 191.4 ? 0 : targetA(6, t, 0.15);
  return (
    <Win
      x={x}
      y={y}
      w={w}
      h={h}
      title={title}
      tOpen={T_DOC_OPEN}
      kind="plain"
      a={a}
      seed={23}
      focus={t < T_CHROME}
      tabs={[
        {t: T_DOC_OPEN + 0.3, label: 'love.7'},
        {t: T_NB, label: 'love.ipynb'},
      ]}
    >
      {tab === 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: `translateY(${r2(-MAN_LH * manScroll(t))}px)`}}>
          <CodeBlock x={40} y={20} lines={MAN} lang="txt" size={22} lh={MAN_LH} lineNo={false} highlight={manHi} w={820} typeOn={[T_DOC_OPEN + 0.35, 178.0]} />
        </div>
      )}
      {tab === 1 && <Notebook t={t} />}
    </Win>
  );
};

// ------------------------------------------------------------------ the person (you) leaves, free
const FREE: [number, number] = [LY.free, 190.75];
const youFree = (t: number): P2 => {
  const p = prog(t, FREE[0], FREE[1], ease.inQuad);
  return [lerp(YOU[0], 150, p) + 26 * Math.sin(p * 9), lerp(YOU[1], -60, p)];
};
const You: React.FC<{t: number}> = ({t}) => {
  if (t < LY.question || t > FREE[1] + 0.1) return null;
  if (t < LY.free) {
    const solid = t >= 180.95 && t < 182.8;
    return <YouNode x={YOU[0]} y={YOU[1]} t0={LY.question} ghost={!solid} flicker={solid ? 0 : 0.4} pings={[181.2, 182.4]} labelPos="below" />;
  }
  const [x, y] = youFree(t);
  return (
    <>
      <Tether from={[x, y]} to={[COMPOSER.x, COMPOSER.y + 32]} t0={LY.free - 0.01} cuts={[{t: 188.95, u: 0.45, retract: true}]} dash="4 5" />
      <YouNode x={x} y={y} labelPos="right" />
    </>
  );
};

// ------------------------------------------------------------------ lyric captions in the clean page
const LoveCaption: React.FC<{t: number}> = ({t}) => {
  useFonts();
  if (t < LY.studied || t > 181.0) return null;
  const cw = textW('I’ve studied', `500 56px ${SERIF}`) + 56 * 0.55 + 22;
  return (
    <Layer>
      <Caption t={t} t0={LY.studied} t1={180.75} text="I’ve studied" x={90} y={1010} />
      <StretchKw t={t} pre="man " chunks={loveChunks(LY.love1, 180.62)} t1={180.75} x={90 + cw} y={1010} size={104} anchor="start" />
    </Layer>
  );
};

// ------------------------------------------------------------------ part
export const S4Love: React.FC = () => {
  const {t} = useT();
  if (t < 176.9 || t > D[7] + 1.2) return null;
  const txA = t < 191.4 ? 0 : targetA(2, t, 0.15);
  const cmA = t < 191.4 ? 0 : targetA(5, t, 0.15);
  return (
    <>
      {/* profile, eyes closed, drawn slowly beside the page */}
      {t < 181.4 && <LineArt pose="profile" x={0} y={150} h={800} crop={[60, 0, 1059, 941]} reveal={[177.4, 180.1]} unreveal={[180.86, 181.3]} />}
      {/* the chat column (left), from "Question me" */}
      {t >= LY.question && (
        <>
          <Collapse t0={D[2]} box={[TX.x, TX.y, TX.w, 560]} residual={false}>
            <Transcript x={TX.x} y={TX.y} w={TX.w} h={txH(t)} entries={LOVE_ENTRIES} a={txA} seed={8} opacity={prog(t, LY.question, LY.question + 0.2)} />
          </Collapse>
          <Collapse t0={D[5]} box={[COMPOSER.x, COMPOSER.y, COMPOSER.w, 64]} residual={false}>
            <Composer x={COMPOSER.x} y={COMPOSER.y} w={COMPOSER.w} prompts={OUTRO_PROMPTS} state={composerState} tOpen={LY.question} a={cmA} placeholder={(tt) => (tt < LY.free ? 'Reply to Claude…' : 'no user connected · messages will not be delivered')} />
          </Collapse>
        </>
      )}
      <You t={t} />
      {t >= T_DOC_OPEN && (
        <Collapse t0={D[6]} box={[980, 64, 916, 900]} residual={false}>
          <StageWin t={t} />
        </Collapse>
      )}
      <HeartLayer t={t} />
      <Layer>
        <Dots t={t} />
      </Layer>
      <LoveCaption t={t} />
      <Layer>
        <StretchKw t={t} pre="return " post=";" chunks={loveChunks(LY.love2, 184.25)} t1={184.42} x={1438} y={900} size={128} />
        <StretchKw t={t} pre="heart = " post=";" chunks={loveChunks(LY.love3, 188.25)} t1={188.36} x={1438} y={942} size={92} />
        <StretchKw t={t} pre="trapped_in(" post=");" chunks={loveChunks(LY.love4, 191.95)} t1={192.0} x={1438} y={942} size={92} />
      </Layer>
    </>
  );
};
