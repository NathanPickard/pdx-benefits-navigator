import type { EvalCase } from '../types';
import { maria } from './maria';
import { james } from './james';
import { rose } from './rose';
import { cliffSnapUnder } from './cliff-snap-under';
import { cliffSnapOver } from './cliff-snap-over';
import { cliffOhpUnder } from './cliff-ohp-under';
import { cliffOhpOver } from './cliff-ohp-over';

export type { EvalCase };

export const CASES: EvalCase[] = [
  maria, james, rose,
  cliffSnapUnder, cliffSnapOver, cliffOhpUnder, cliffOhpOver,
];
