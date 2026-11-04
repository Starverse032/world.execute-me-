// Silent cards around the MV: an opening viewing notice and the closing credits.
// Both run inside Release (Release.tsx), which also shifts the MV by INTRO_FRAMES.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile} from 'remotion';
import {K, useT} from '../v3/core';
import {Spark} from '../v3/geo';
import {CODE} from './fonts';
import {Layer} from './shell/lib';

export const INTRO_FRAMES = 75; // 2.5 s (v9: the viewing notice before the MV)
export const OUTRO_FRAMES = 270; // 9.0 s

// Noto Sans SC. CARD.woff2 is an old subset of it that lacks the v9 card text, so
// the installed family comes first and every character on a card uses one font;
// CARD is only the fallback where the family is not installed.
const ZH = "'Noto Sans SC', 'CARD', sans-serif";
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
const outro = (t: number, dur: number, len = 0.55, tail = 0.25) => interpolate(t, [dur - tail - len, dur - tail], [1, 0], clamp);

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
// v9: the viewing notice: a small orange title over one white line, held long
// enough to read at normal speed, then the MV starts.
export const IntroCard: React.FC = () => {
  const {t} = useT();
  const X = 568; // the line is about 784 px wide
  const fade = outro(t, INTRO_FRAMES / 30, 0.25, 0.05);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <Layer>
          <Spark x={X + 14} y={470} R={14} rays={interpolate(t, [0.05, 0.4], [0, 12], clamp)} />
        </Layer>
        <Text x={X + 44} y={486} o={rowIn(t, 0, 0.1, 0)} font={ZH} size={34} weight={500} color={K.orange}>
          观看提示
        </Text>
        <Text x={X} y={590} o={rowIn(t, 0, 0.2, 0)} font={ZH} size={56} weight={350} color={K.cream}>
          本视频部分画面可能令人不适。
        </Text>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ outro
// v9: six rows, contribution on the left in white, contributor on the right in
// orange, both columns left-aligned on one baseline per row.
const CREDITS: {role: string; who: string}[] = [
  {role: '视频作者', who: 'Starverse'},
  {role: '歌曲原作', who: 'Mili'},
  {role: 'Claude 虚拟形象原案', who: 'Bilibili@ZipZipPipe'},
  {role: '源码开发', who: 'Opus 5.5'},
  {role: '审核校订', who: 'GPT 6.1 Sol'},
  {role: '人物素材', who: 'Image 2.5'},
];

const NOTICE_ZH = '本视频为非官方同人作品，与 Mili、Anthropic、OpenAI 均无关联。';
const NOTICE_EN = 'Unofficial fan work. Not affiliated with Mili, Anthropic or OpenAI.';

export const OutroCard: React.FC = () => {
  const {t} = useT();
  const L = 300;
  const R = 1040;
  const ROW = 88;
  const STEP = 0.24;
  const top = 540 - (CREDITS.length * ROW) / 2 - 60;
  const end = top + CREDITS.length * ROW;
  const noticeO = rowIn(t, 0, 1.0 + CREDITS.length * STEP + 0.2, 0);
  const fade = outro(t, OUTRO_FRAMES / 30);
  const cmd = 'cat CREDITS';
  const typed = Math.floor(interpolate(t, [0.3, 0.9], [0, cmd.length], clamp));
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <Text x={L} y={top - 40} o={interpolate(t, [0.15, 0.35], [0, 1], clamp)} font={CODE} size={26} color={K.orange}>
          $
        </Text>
        <Text x={L + 32} y={top - 40} o={1} font={CODE} size={26} color={K.creamDim}>
          {cmd.slice(0, typed)}
        </Text>
        {CREDITS.map((c, i) => {
          const o = rowIn(t, i, 1.0, STEP);
          const y = top + i * ROW + 62;
          const lineP = interpolate(t, [1.0 + i * STEP, 1.5 + i * STEP], [0, 1], clamp);
          return (
            <React.Fragment key={i}>
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <line x1={L} y1={y - 56} x2={L + (1620 - L) * lineP} y2={y - 56} stroke={K.grid} strokeWidth={1.5} strokeDasharray="6 8" />
              </svg>
              <Text x={L} y={y} o={o} font={ZH} size={38} weight={350} color={K.cream}>
                {c.role}
              </Text>
              <Text x={R} y={y} o={o} font={CODE} size={38} weight={500} color={K.orange}>
                {c.who}
              </Text>
            </React.Fragment>
          );
        })}
        <Layer>
          <Spark x={1620} y={end + 6} R={12} rays={interpolate(t, [2.2, 2.8], [0, 12], clamp)} />
        </Layer>
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L} y1={end + 26} x2={1620} y2={end + 26} stroke={K.grid} strokeWidth={1.5} strokeDasharray="6 8" opacity={noticeO} />
        </svg>
        <Text x={L} y={end + 84} o={noticeO} font={ZH} size={30} weight={350} color={K.cream}>
          {NOTICE_ZH}
        </Text>
        <Text x={L} y={end + 124} o={noticeO} font={CODE} size={19} color={K.creamDim}>
          {NOTICE_EN}
        </Text>
      </div>
    </AbsoluteFill>
  );
};