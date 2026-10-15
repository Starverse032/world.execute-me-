// S4 outro, 190.8–211.96: the chrome slams back in around her ("Trapped in"),
// then is deleted one component per bar downbeat (D[0..7]):
//   header · sidebar (world.execute(me) struck first) · transcript · log ·
//   status · composer · window frame · grid.
// Tension: the orange dot (the pen, the trigger) travels to each component and
// parks on it two beats early; orange brackets lock on and blink on eighths;
// the targeted component glitches harder and harder (a → 0.62) until it is
// squashed to a line, a point, gone. Claude logs every `rm` in a log that is
// itself deleted; after that it types the commands into the human's composer,
// then (no chrome left) the dot types bare, ever smaller commands. Each removal
// leaves a dashed residual outline. EXECUTION (205.81) lights every residue
// orange, then all of it is pulled into the one dot: world.execute(me) ⎿ exit 0,
// ✻ Worked for 3m 31s. The dot fades by 211.0; black to the end.
import React from 'react';
import {clamp01, ease, FPS, K, lerp, prog, useT} from '../../v3/core';
import {Elbow, Spark} from '../../v3/geo';
import {CODE} from '../fonts';
import {Collapse} from '../shell/Collapse';
import {KwCode} from '../shell/KwCode';
import {Layer, r2} from '../shell/lib';
import {Sidebar} from '../shell/Sidebar';
import {clockStr, Header, Status} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {
  BOXES,
  D,
  DOT_AT,
  DOT_FROM,
  FINAL,
  FLOAT_CMDS,
  LOG_BOX,
  LOG_ENTRIES,
  LY,
  OUTRO_VERBS,
  P2,
  SIDEBAR_ITEMS,
  T_CHROME,
  T_COLLAPSE,
  T_DOT_FADE,
  T_DOT_OUT,
  T_EXIT0,
  T_TEXT_FADE,
  T_WORKED,
  targetA,
  arriveAt,
} from './s4.data';
import {Brackets, Dot} from './S4_lib';

// ------------------------------------------------------------------ the chrome
const Chrome: React.FC<{t: number}> = ({t}) => {
  if (t < T_CHROME || t > D[4] + 1) return null;
  const clock = clockStr(23 * 3600 + 59 * 60 + 3 + (t - 95));
  return (
    <>
      <Collapse t0={D[0]} box={[0, 0, 1920, 44]} residual={false}>
        <Header path="~/world" model="claude-opus" clock={clock} t0={T_CHROME} a={targetA(0, t, 0.15)} />
      </Collapse>
      <Collapse t0={D[1]} box={[24, 64, 240, 900]} residual={false}>
        <Sidebar x={24} y={64} w={240} h={900} items={SIDEBAR_ITEMS} t0={T_CHROME + 0.05} a={targetA(1, t, 0.15)} />
      </Collapse>
      <Collapse t0={D[3]} box={LOG_BOX} residual={false}>
        <Win x={LOG_BOX[0]} y={LOG_BOX[1]} w={LOG_BOX[2]} h={LOG_BOX[3]} title="log" kind="term" tOpen={T_CHROME + 0.1} a={targetA(3, t, 0.15)} seed={61}>
          <Transcript x={16} y={4} w={608} h={172} entries={LOG_ENTRIES} a={targetA(3, t, 0)} seed={9} fade={40} />
        </Win>
      </Collapse>
      <Collapse t0={D[4]} box={BOXES[4]} residual={false}>
        <Status x={300} y={878} t0={T_CHROME + 0.16} verbs={OUTRO_VERBS} a={targetA(4, t, 0.15)} tokens={(tt) => 4100 + 23 * (tt - T_CHROME)} />
      </Collapse>
    </>
  );
};

// ------------------------------------------------------------------ the dot's route
const dotPos = (t: number): P2 => {
  let from: P2 = DOT_FROM, tf = T_DOT_OUT + 0.1;
  for (let k = 0; k < D.length; k++) {
    const arrive = arriveAt(k);
    if (t < arrive) {
      const p = prog(t, tf, arrive, ease.inOutCubic);
      return [lerp(from[0], DOT_AT[k][0], p), lerp(from[1], DOT_AT[k][1], p)];
    }
    if (t < D[k] + 0.15) return DOT_AT[k];
    from = DOT_AT[k];
    tf = D[k] + 0.15;
  }
  return FINAL;
};

// ------------------------------------------------------------------ residual outlines
const T_LIT = LY.exec;
const Residuals: React.FC<{t: number}> = ({t}) => {
  const lit = clamp01((t - T_LIT) * FPS / 3);
  const col = prog(t, T_COLLAPSE[0], T_COLLAPSE[1], ease.inCubic);
  if (col >= 1) return null;
  return (
    <>
      {BOXES.map((b, k) => {
        const f = (t - D[k]) * FPS;
        const o = clamp01((f - 10) / 6);
        if (o <= 0) return null;
        // shrink toward the final dot
        const [x, y, w, h] = b;
        const s = 1 - col;
        const X = FINAL[0] + (x - FINAL[0]) * s, Y = FINAL[1] + (y - FINAL[1]) * s;
        const flick = lit > 0 && lit < 1 ? 1 : lit;
        return (
          <rect
            key={k}
            x={r2(X + 0.5)}
            y={r2(Y + 0.5)}
            width={r2(Math.max(0, w * s - 1))}
            height={r2(Math.max(0, h * s - 1))}
            fill="none"
            stroke={flick > 0 ? K.orange : K.creamDim}
            strokeOpacity={flick > 0 ? 0.45 + 0.55 * flick : 0.25 * o}
            strokeWidth={flick > 0 ? 2 : 1}
            strokeDasharray="5 6"
            rx={k === 5 ? 14 : k === 6 || k === 3 ? 10 : 0}
          />
        );
      })}
    </>
  );
};

// the grid's own deletion (it is not wrapped by Collapse): a line and point at the dot
const GridGone: React.FC<{t: number}> = ({t}) => {
  const f = (t - D[7]) * FPS;
  if (f < 8 || f > 18) return null;
  const sx = 1 - ease.inCubic(clamp01((f - 8) / 5));
  return <path d={`M ${r2(FINAL[0] - 948 * sx)} ${FINAL[1]} L ${r2(FINAL[0] + 948 * sx)} ${FINAL[1]}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={1.5} opacity={f < 13 ? 1 : 0} />;
};

// bare commands typed by the dot when there is nothing left to type into
const FloatCmds: React.FC<{t: number}> = ({t}) => (
  <>
    {FLOAT_CMDS.map((c, i) => {
      const end = D[6 + i] + 0.3;
      if (t < c.t || t > end + 5 / FPS) return null;
      const n = Math.min(c.text.length, Math.floor((t - c.t) * 22 + 1));
      const out = prog(t, end, end + 5 / FPS);
      return (
        <text key={i} x={c.at[0]} y={c.at[1] - 14 * out} fontFamily={CODE} fontSize={c.size} fill={K.orange} opacity={1 - out} xmlSpace="preserve">
          {c.text.slice(0, n)}
        </text>
      );
    })}
  </>
);

// ------------------------------------------------------------------ the last lines
const ExitLines: React.FC<{t: number}> = ({t}) => {
  if (t < T_EXIT0 || t > T_TEXT_FADE[1]) return null;
  const o = 1 - prog(t, T_TEXT_FADE[0], T_TEXT_FADE[1]);
  const call = 'world.execute(me)';
  const n = Math.min(call.length, Math.floor((t - T_EXIT0) * FPS * 5 + 1));
  const running = t < T_EXIT0 + 0.45;
  const rt = T_EXIT0 + 0.45;
  const el = prog(t, rt, rt + 3 / FPS);
  const x0 = 812, y0 = 624;
  return (
    <g opacity={o}>
      <circle cx={x0 + 8} cy={y0 - 9} r={7} fill={running ? K.orange : K.creamDim} />
      <text x={x0 + 30} y={y0} fontFamily={CODE} fontSize={26} fill={K.cream}>
        {call.slice(0, n)}
      </text>
      {el > 0 && (
        <>
          <Elbow x={x0 + 32} y={y0 + 34} p={el} />
          <text x={x0 + 56} y={y0 + 42} fontFamily={CODE} fontSize={26} fill={K.creamDim} opacity={el >= 1 ? 1 : 0}>
            {'exit 0'}
          </text>
        </>
      )}
      {t >= T_WORKED && (
        <g opacity={prog(t, T_WORKED, T_WORKED + 5 / FPS)}>
          <Spark x={x0 + 9} y={y0 + 99} R={13} color={K.creamDim} />
          <text x={x0 + 30} y={y0 + 108} fontFamily={CODE} fontSize={26} fill={K.creamDim}>
            {'Worked for 3m 31s'}
          </text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ part
export const S4Outro: React.FC = () => {
  const {t} = useT();
  if (t < T_CHROME || t > 211.4) return null;
  const [dx, dy] = dotPos(t);
  const dotIn = clamp01((t - T_DOT_OUT) * FPS / 4);
  const dotO = dotIn * (1 - prog(t, T_DOT_FADE[0], T_DOT_FADE[1]));
  // the final pull: a ring from the dot when everything has collapsed into it
  const ring = (t - T_COLLAPSE[1]) / 1.0;
  return (
    <>
      <Chrome t={t} />
      <Layer>
        <Residuals t={t} />
        <GridGone t={t} />
        {D.map((d, k) => (
          <Brackets key={k} t={t} t0={arriveAt(k)} t1={d} box={k === 7 ? [24, 24, 1872, 1032] : BOXES[k]} len={k === 7 ? 48 : 22} />
        ))}
        <FloatCmds t={t} />
      </Layer>
      <KwCode t0={LY.exec} t1={206.45} pre="world." kw="EXECUTION" post="(me);" x={960} y={720} size={180} a={0} exit="fade" underline />
      <Layer>
        {ring > 0 && ring < 1 && <circle cx={FINAL[0]} cy={FINAL[1]} r={r2(lerp(9, 420, ease.outCubic(ring)))} fill="none" stroke={K.cream} strokeWidth={1} opacity={0.45 * (1 - ring)} />}
        {t >= T_DOT_OUT && <Dot t={t} x={dx} y={dy} opacity={dotO} ring={t < T_TEXT_FADE[0]} />}
        <ExitLines t={t} />
      </Layer>
    </>
  );
};
