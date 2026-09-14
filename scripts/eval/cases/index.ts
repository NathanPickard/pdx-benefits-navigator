import type { EvalCase } from '../types';
import { maria } from './maria';
import { james } from './james';
import { rose } from './rose';
import { cliffSnapUnder } from './cliff-snap-under';
import { cliffSnapOver } from './cliff-snap-over';
import { cliffOhpUnder } from './cliff-ohp-under';
import { cliffOhpOver } from './cliff-ohp-over';
import { zipGresham } from './zip-gresham';
import { rentIncrease9Pct } from './rent-increase-9pct';
import { evictionNotice } from './eviction-notice';
import { veteranRenter } from './veteran-renter';
import { seniorRenter } from './senior-renter';
import { pregnantHousehold } from './pregnant-household';
import { unhoused } from './unhoused';

export type { EvalCase };

export const CASES: EvalCase[] = [
  maria, james, rose,
  cliffSnapUnder, cliffSnapOver, cliffOhpUnder, cliffOhpOver,
  zipGresham, rentIncrease9Pct, evictionNotice,
  veteranRenter, seniorRenter, pregnantHousehold, unhoused,
];
