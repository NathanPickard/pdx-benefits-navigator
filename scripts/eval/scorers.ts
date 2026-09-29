import type { AnalysisOutput, Program } from '../../types/program';
import type {
  Confidence,
  ConfidenceScore,
  DollarScore,
  DollarViolation,
  EvalCase,
  ProgramSetScore,
} from './types';

export function scoreProgramSet(
  output: AnalysisOutput,
  expected: EvalCase['expected'],
  allPrograms: Program[],
): ProgramSetScore {
  const uncertain = new Set(expected.uncertain ?? []);
  const expectedEligible = new Set(expected.eligible);
  const actualEligible = new Set(
    output.matches.filter((m) => m.eligible).map((m) => m.program_id),
  );
  const gemIds = new Set(allPrograms.filter((p) => p.hidden_gem).map((p) => p.id));

  let truePositives = 0;
  const falsePositives: string[] = [];
  const falseNegatives: string[] = [];

  for (const p of allPrograms) {
    if (uncertain.has(p.id)) continue;
    const exp = expectedEligible.has(p.id);
    const act = actualEligible.has(p.id);
    if (exp && act) truePositives++;
    else if (!exp && act) falsePositives.push(p.id);
    else if (exp && !act) falseNegatives.push(p.id);
  }

  const precision =
    truePositives + falsePositives.length === 0
      ? 1
      : truePositives / (truePositives + falsePositives.length);
  const recall =
    truePositives + falseNegatives.length === 0
      ? 1
      : truePositives / (truePositives + falseNegatives.length);
  const f1 =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    precision,
    recall,
    f1,
    falsePositives,
    falseNegatives,
    hiddenGemMisses: falseNegatives.filter((id) => gemIds.has(id)),
  };
}

export type ScheduleUnit = NonNullable<Program['benefit_schedule']>['unit'];

/** Multiplier that turns one schedule row into an annual dollar amount. */
const ANNUAL_MULTIPLIER: Partial<Record<ScheduleUnit, number>> = {
  usd_monthly: 12,
  usd_annual: 1,
  usd_one_time: 1,
};

/**
 * The dollar range an eligible estimate may fall in. The prompt tells the model a
 * benefit_schedule is authoritative, so its annualized rows widen the coarse range.
 * A schedule is trusted only when it is dollar-denominated AND overlaps the range:
 * some schedules hold copays (erdc) or assessed-value exemptions
 * (veterans-prop-tax-exempt) rather than benefit dollars.
 */
export function acceptedDollarRange(program: Program): [number, number] {
  const { min, max } = program.estimated_annual_value;
  const schedule = program.benefit_schedule;
  const multiplier = schedule ? ANNUAL_MULTIPLIER[schedule.unit] : undefined;
  if (!schedule || multiplier === undefined || schedule.amounts.length === 0) {
    return [min, max];
  }

  const annual = schedule.amounts.map((row) => row.value * multiplier);
  const low = Math.min(...annual);
  const high = Math.max(...annual);
  const overlapsRange = low <= max && high >= min;
  return overlapsRange ? [Math.min(min, low), Math.max(max, high)] : [min, max];
}

export function scoreDollars(
  output: AnalysisOutput,
  allPrograms: Program[],
  valueOverrides?: Record<string, [number, number]>,
): DollarScore {
  const byId = new Map(allPrograms.map((p) => [p.id, p]));
  const violations: DollarViolation[] = [];
  let checked = 0;

  for (const m of output.matches) {
    if (!m.eligible) continue;
    const program = byId.get(m.program_id);
    if (!program) continue;
    const [min, max] = valueOverrides?.[m.program_id] ?? acceptedDollarRange(program);
    checked++;
    if (m.estimated_annual_value < min || m.estimated_annual_value > max) {
      violations.push({ program_id: m.program_id, value: m.estimated_annual_value, min, max });
    }
  }

  return {
    inRangeRate: checked === 0 ? 1 : (checked - violations.length) / checked,
    checked,
    violations,
  };
}

export function scoreConfidence(
  output: AnalysisOutput,
  expectedConfidence?: Record<string, Confidence[]>,
): ConfidenceScore {
  if (!expectedConfidence) return { agreementRate: 1, checked: 0, disagreements: [] };
  const byId = new Map(output.matches.map((m) => [m.program_id, m]));
  const disagreements: ConfidenceScore['disagreements'] = [];
  let checked = 0;

  for (const [id, allowed] of Object.entries(expectedConfidence)) {
    const m = byId.get(id);
    if (!m || !m.eligible) continue;
    checked++;
    if (!allowed.includes(m.confidence)) {
      disagreements.push({ program_id: id, expected: allowed, actual: m.confidence });
    }
  }

  return {
    agreementRate: checked === 0 ? 1 : (checked - disagreements.length) / checked,
    checked,
    disagreements,
  };
}
