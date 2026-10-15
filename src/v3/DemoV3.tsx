// world.execute(me); demo v3: "Plotted Session" (minimal geometric).
// Layer order follows docs/design_v3.md §7.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile} from 'remotion';
import {END, K, useT} from './core';
import {Composer, GlobalFade, Grid, Header, LogZone, StageKeyword, stageDim, StatusLine} from './ui';
import {Intro} from './shots/Intro';
import {Execute} from './shots/Execute';
import {Points} from './shots/Points';
import {Verse, VerseTop} from './shots/Verse';

const Stage: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{opacity: stageDim(t)}}>
      <Intro />
      <Execute />
      <Points />
      <Verse />
    </AbsoluteFill>
  );
};

export const DemoV3: React.FC = () => (
  <AbsoluteFill style={{background: K.bg}}>
    <Audio
      src={staticFile('song.mp3')}
      volume={(f) => interpolate(f / 30, [END - 1.4, END - 0.1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    <Grid />
    <Stage />
    <StageKeyword />
    <LogZone />
    <StatusLine />
    <Composer />
    <Header />
    <GlobalFade />
    <VerseTop />
  </AbsoluteFill>
);
