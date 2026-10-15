import React from 'react';
import {Composition} from 'remotion';
import {DemoV3} from './v3/DemoV3';
import {FULL_FRAMES, FullMV} from './v3/FullMV';
import {FullMV2} from './v4/FullMV2';
import {V4Kit, KIT_FRAMES} from './v4/Kit';
import {FRAMES_V4} from './v4/timeline';
import {IntroCard, OutroCard, INTRO_FRAMES, OUTRO_FRAMES} from './v4/Cards';
import {Release, RELEASE_FRAMES} from './v4/Release';

export const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Release" component={Release} durationInFrames={RELEASE_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="FullMV2" component={FullMV2} durationInFrames={FRAMES_V4} fps={FPS} width={1920} height={1080} />
  <Composition id="IntroCard" component={IntroCard} durationInFrames={INTRO_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="OutroCard" component={OutroCard} durationInFrames={OUTRO_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="V4Kit" component={V4Kit} durationInFrames={KIT_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="FullMV" component={FullMV} durationInFrames={FULL_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="DemoV3" component={DemoV3} durationInFrames={1380} fps={FPS} width={1920} height={1080} />
  </>
);
