// Section C timeline data = part C1 (131.20–177.25 s) + part C2 (177.25–211.96 s).
import type {SectionData} from '../tl';
import {DATA as C1} from './c1.data';
import {DATA as C2} from './c2.data';

export const DATA: SectionData = {
  logs: [...C1.logs, ...C2.logs],
  status: [...C1.status, ...C2.status],
  ui: [...C1.ui, ...C2.ui],
  patches: {...C1.patches, ...C2.patches},
  ripples: [...(C1.ripples ?? []), ...(C2.ripples ?? [])],
  paths: [...(C1.paths ?? []), ...(C2.paths ?? [])],
};
