// Section C (see docs/design_C.md), built in two parts: C1 = 131.20–177.25 s
// (crash, rebuild, EXECUTION climax, final chorus; shots C1–C13) and C2 =
// 177.25–211.96 s (love outro, un-render, exit 0, closing fade; shots C14–C22).
import React from 'react';
import {SectionC1, SectionC1Char, SectionC1Top} from './C1';
import {SectionC2, SectionC2Char, SectionC2Top} from './C2';

export const SectionC: React.FC = () => (
  <>
    <SectionC1 />
    <SectionC2 />
  </>
);
export const SectionCChar: React.FC = () => (
  <>
    <SectionC1Char />
    <SectionC2Char />
  </>
);
export const SectionCTop: React.FC = () => (
  <>
    <SectionC1Top />
    <SectionC2Top />
  </>
);
