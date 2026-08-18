import type { IntakeData } from '../../types/program';

export type Confidence = 'high' | 'medium' | 'low';

export interface EvalCase {
  id: string;
  title: string;
  intake: IntakeData;
  expected: {
    /** EXHAUSTIVE expected-eligible program ids. Anything not here and not in `uncertain` is expected-ineligible. */
    eligible: string[];
    /** Either verdict defensible — excluded from program-set scoring. */
    uncertain?: string[];
    /** Acceptable confidence labels, only where clearly hand-derivable. */
    confidence?: Record<string, Confidence[]>;
    /** Tighter [min, max] than the program's official estimated_annual_value range. */
    valueOverrides?: Record<string, [number, number]>;
  };
  /** Hand-derivation rationale with rule citations — the ground-truth audit trail. */
  notes: string;
}

export interface ProgramSetScore {
  precision: number;
  recall: number;
  f1: number;
  falsePositives: string[];
  falseNegatives: string[];
  hiddenGemMisses: string[];
}

export interface DollarViolation {
  program_id: string;
  value: number;
  min: number;
  max: number;
}

export interface DollarScore {
  inRangeRate: number;
  checked: number;
  violations: DollarViolation[];
}

export interface ConfidenceDisagreement {
  program_id: string;
  expected: Confidence[];
  actual: Confidence;
}

export interface ConfidenceScore {
  agreementRate: number;
  checked: number;
  disagreements: ConfidenceDisagreement[];
}
