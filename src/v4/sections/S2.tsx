// Section 2: Anomaly → Break, 88.6–131.22 s (docs/design_v4.md §4 S2).
// 88.6–117.27  the IDE session from S1 grows wrong: her / him, AM / PM, the
//              role swap, the trance; then chorus 2, and you leave.
// 117.27–131.22 no chrome: ISOLATION, FRAGMENTS, the heart, the standoff,
//              ILLEGAL ARGUMENTS. Hand-off to S3: broken pieces, the grid, a
//              lone spark.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../../v3/core';
import {inRange} from '../timeline';
import {S2_END, S2_START} from './s2.data';
import {BridgeS2} from './S2_bridge';
import {ChromeS2} from './S2_chrome';
import {StageS2} from './S2_stage';

export const Section2: React.FC = () => {
  const {t} = useT();
  if (!inRange(t, S2_START, S2_END)) return null;
  return (
    <AbsoluteFill>
      <StageS2 />
      <ChromeS2 />
      <BridgeS2 />
    </AbsoluteFill>
  );
};
