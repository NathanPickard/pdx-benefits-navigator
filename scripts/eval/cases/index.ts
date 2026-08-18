import type { EvalCase } from '../types';
import { maria } from './maria';
import { james } from './james';
import { rose } from './rose';

export type { EvalCase };

export const CASES: EvalCase[] = [maria, james, rose];
