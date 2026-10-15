// The release cut: silent notice card, the MV, silent credits card.
// Each part runs in its own Sequence, so the MV's frames and audio start at 0
// inside it exactly as in the FullMV2 composition.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {K} from '../v3/core';
import {FullMV2} from './FullMV2';
import {IntroCard, OutroCard, INTRO_FRAMES, OUTRO_FRAMES} from './Cards';
import {FRAMES_V4} from './timeline';

export const RELEASE_FRAMES = INTRO_FRAMES + FRAMES_V4 + OUTRO_FRAMES;

export const Release: React.FC = () => (
  <AbsoluteFill style={{background: K.bg}}>
    <Sequence from={0} durationInFrames={INTRO_FRAMES} name="Notice">
      <IntroCard />
    </Sequence>
    <Sequence from={INTRO_FRAMES} durationInFrames={FRAMES_V4} name="MV">
      <FullMV2 />
    </Sequence>
    <Sequence from={INTRO_FRAMES + FRAMES_V4} durationInFrames={OUTRO_FRAMES} name="Credits">
      <OutroCard />
    </Sequence>
  </AbsoluteFill>
);
