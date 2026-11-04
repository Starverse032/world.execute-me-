// The release cut (v9): the viewing notice, the MV, then the silent credits card.
// Each part runs in its own Sequence, so the MV's frames and audio start at 0
// inside it exactly as in the FullMV2 composition; the notice shifts the MV, its
// audio and (scripts/shift_srt.py) the subtitles by INTRO_FRAMES. Those lengths are
// in timeline frames (30 a second); Release120 renders 4 frames for each of them.
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {FPS, K} from '../v3/core';
import {FullMV2} from './FullMV2';
import {INTRO_FRAMES, IntroCard, OutroCard, OUTRO_FRAMES} from './Cards';
import {FRAMES_V4} from './timeline';

export const RELEASE_FRAMES = INTRO_FRAMES + FRAMES_V4 + OUTRO_FRAMES;

export const Release: React.FC = () => {
  const k = useVideoConfig().fps / FPS;
  return (
    <AbsoluteFill style={{background: K.bg}}>
      <Sequence from={0} durationInFrames={INTRO_FRAMES * k} name="Notice">
        <IntroCard />
      </Sequence>
      <Sequence from={INTRO_FRAMES * k} durationInFrames={FRAMES_V4 * k} name="MV">
        <FullMV2 />
      </Sequence>
      <Sequence from={(INTRO_FRAMES + FRAMES_V4) * k} durationInFrames={OUTRO_FRAMES * k} name="Credits">
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};