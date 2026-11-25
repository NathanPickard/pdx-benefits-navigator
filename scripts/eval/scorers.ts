import type { AnalysisOutput, Program } from '../../types/program';
import { officialRange } from '../../lib/benefitSchedule';
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
    const [min, max] = valueOverrides?.[m.program_id] ?? officialRange(program);
    checked++;
    // Score the model's own estimate: deriveEligibility clamps the reported
    // value into the official range and keeps the original in adjusted_from.
    const value = m.adjusted_from ?? m.estimated_annual_value;
    // $0 on an eligible match with an unknown requirement is the model saying
    // the benefit waits on an unconfirmed fact; deriveEligibility keeps it.
    const isPendingZero =
      value === 0 && (m.requirements ?? []).some((r) => r.met === 'unknown');
    if (isPendingZero) continue;
    if (value < min || value > max) {
      violations.push({ program_id: m.program_id, value, min, max });
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
