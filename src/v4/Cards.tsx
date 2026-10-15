// Silent title cards added around the MV (Starverse, 2026-10-15 12:41):
// an opening notice and a closing credits card. Rendered as their own
// compositions and joined to the MV with ffmpeg, so the MV itself is untouched.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile} from 'remotion';
import {K, useT} from '../v3/core';
import {Spark} from '../v3/geo';
import {CODE} from './fonts';
import {Layer} from './shell/lib';

export const INTRO_FRAMES = 180; // 6.0 s
export const OUTRO_FRAMES = 210; // 7.0 s

// Noto Sans SC (variable), subset to the card text: public/fonts5/CARD.woff2.
const ZH = "'CARD', sans-serif";
const fontHandle = delayRender('fonts-cards');
const face = new FontFace('CARD', `url(${staticFile('fonts5/CARD.woff2')}) format('woff2')`, {weight: '100 900'});
document.fonts.add(face);
face.load().then(
  () => continueRender(fontHandle),
  () => continueRender(fontHandle),
);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Row i fades in from `start + i*step`; everything fades out at the end.
const rowIn = (t: number, i: number, start: number, step: number) => interpolate(t, [start + i * step, start + i * step + 0.25], [0, 1], clamp);
const outro = (t: number, dur: number) => interpolate(t, [dur - 0.8, dur - 0.25], [1, 0], clamp);

const Text: React.FC<{x: number; y: number; o: number; font: string; size: number; color: string; weight?: number; children: React.ReactNode}> = ({
  x,
  y,
  o,
  font,
  size,
  color,
  weight = 400,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y - size,
      lineHeight: `${size * 1.25}px`,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      opacity: o,
      whiteSpace: 'pre',
    }}
  >
    {children}
  </div>
);

// ------------------------------------------------------------------ intro
// A doc-comment header, the way a source file opens.
type Row = {kind: 'mono' | 'zh' | 'en'; text: string; gap: number};
const NOTICE: Row[] = [
  {kind: 'mono', text: '/**', gap: 0},
  {kind: 'zh', text: '本视频源代码由 Claude Opus 5.5 独立完成，', gap: 74},
  {kind: 'zh', text: '为非官方同人作品，与 Mili、Anthropic、OpenAI 均无关联。', gap: 74},
  {kind: 'mono', text: '', gap: 52},
  {kind: 'en', text: 'Source code written independently by Claude Opus 5.5.', gap: 46},
  {kind: 'en', text: 'Unofficial fan work. Not affiliated with Mili, Anthropic or OpenAI.', gap: 46},
  {kind: 'mono', text: '', gap: 46},
];

export const IntroCard: React.FC = () => {
  const {t} = useT();
  const X = 330;
  const GUT = 230;
  const total = NOTICE.reduce((s, r) => s + r.gap, 0);
  let y = 540 - total / 2 + 40;
  const fade = outro(t, INTRO_FRAMES / 30);
  const last = NOTICE.length;
  const caretOn = Math.floor(t * 2) % 2 === 0;
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <Layer>
          <Spark x={GUT + 12} y={540 - total / 2 - 40} R={13} rays={interpolate(t, [0.1, 0.7], [0, 12], clamp)} />
        </Layer>
        <Text x={GUT + 40} y={540 - total / 2 - 30} o={rowIn(t, 0, 0.3, 0)} font={CODE} size={22} color={K.creamDim}>
          NOTICE
        </Text>
        {NOTICE.map((r, i) => {
          y += r.gap;
          const o = rowIn(t, i, 0.45, 0.16);
          const star = i === last - 1 ? ' */' : i === 0 ? '' : ' *';
          return (
            <React.Fragment key={i}>
              <Text x={GUT} y={y} o={o * 0.7} font={CODE} size={20} color={K.line2}>
                {String(i + 1).padStart(2, ' ')}
              </Text>
              <Text x={GUT + 52} y={y} o={o} font={CODE} size={30} color={K.orange}>
                {i === 0 ? '/**' : star}
              </Text>
              {r.kind === 'zh' && (
                <Text x={X + 28} y={y} o={o} font={ZH} size={46} weight={350} color={K.cream}>
                  {r.text}
                </Text>
              )}
              {r.kind === 'en' && (
                <Text x={X + 28} y={y} o={o} font={CODE} size={26} color={K.creamDim}>
                  {r.text}
                </Text>
              )}
            </React.Fragment>
          );
        })}
        {/* caret after the closing comment */}
        {t > 0.45 + last * 0.16 && caretOn && <div style={{position: 'absolute', left: GUT + 52 + 3 * 18 + 10, top: y - 26, width: 3, height: 32, background: K.cream}} />}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ outro
type Credit = {zh: string; en: string; val: string; valEn?: string; accent: boolean};
const CREDITS: Credit[] = [
  {zh: 'Claude 虚拟形象原案', en: 'Claude avatar, original design', val: 'Bilibili@ZipZipPipe', accent: true},
  {zh: '歌曲《world.execute(me);》原作', en: 'Song "world.execute(me);" by', val: 'Mili', accent: true},
  {zh: '人物素材', en: 'Character art', val: '由 Claude 调用 ChatGPT 生成', valEn: 'generated by Claude via ChatGPT', accent: false},
];

export const OutroCard: React.FC = () => {
  const {t} = useT();
  const L = 300;
  const R = 1080;
  const ROW = 150;
  const top = 540 - (CREDITS.length * ROW) / 2 + 40;
  const fade = outro(t, OUTRO_FRAMES / 30);
  const cmd = 'cat CREDITS';
  const typed = Math.floor(interpolate(t, [0.3, 0.9], [0, cmd.length], clamp));
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <Text x={L} y={top - 70} o={interpolate(t, [0.15, 0.35], [0, 1], clamp)} font={CODE} size={26} color={K.orange}>
          $
        </Text>
        <Text x={L + 32} y={top - 70} o={1} font={CODE} size={26} color={K.creamDim}>
          {cmd.slice(0, typed)}
        </Text>
        {CREDITS.map((c, i) => {
          const o = rowIn(t, i, 1.0, 0.35);
          const y = top + i * ROW + 40;
          const lineP = interpolate(t, [1.0 + i * 0.35, 1.6 + i * 0.35], [0, 1], clamp);
          return (
            <React.Fragment key={i}>
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <line x1={L} y1={y - 72} x2={L + (1620 - L) * lineP} y2={y - 72} stroke={K.grid} strokeWidth={1.5} strokeDasharray="6 8" />
              </svg>
              <Text x={L} y={y} o={o} font={ZH} size={40} weight={350} color={K.cream}>
                {c.zh}
              </Text>
              <Text x={L} y={y + 42} o={o} font={CODE} size={21} color={K.creamDim}>
                {c.en}
              </Text>
              <Text x={R} y={y} o={o} font={c.accent ? CODE : ZH} size={c.accent ? 38 : 40} weight={c.accent ? 500 : 350} color={c.accent ? K.orange : K.cream}>
                {c.val}
              </Text>
              {c.valEn && (
                <Text x={R} y={y + 42} o={o} font={CODE} size={21} color={K.creamDim}>
                  {c.valEn}
                </Text>
              )}
            </React.Fragment>
          );
        })}
        <Layer>
          <Spark x={1620} y={top + CREDITS.length * ROW + 10} R={12} rays={interpolate(t, [2.2, 2.8], [0, 12], clamp)} />
        </Layer>
      </div>
    </AbsoluteFill>
  );
};
