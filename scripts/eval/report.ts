import type { ProgramSetScore, DollarScore, ConfidenceScore } from './types';
import type { AnalysisOutput } from '../../types/program';

export interface ReasoningScore {
  passRate: number; // passes / (passes + fails); 1 when nothing judged
  judged: number; // passes + fails
  unjudged: number;
  failures: Array<{ program_id: string; issue?: string }>;
}

export interface AttemptResult {
  output: AnalysisOutput;
  programSet: ProgramSetScore;
  dollars: DollarScore;
  confidence: ConfidenceScore;
  reasoning: ReasoningScore;
  judgeTranscripts: Array<{ program_id: string; verdict: string; issue?: string; prompt: string; raw: string }>;
}

export interface CaseResult {
  id: string;
  title: string;
  error?: string; // set when the analysis call failed — attempts empty
  unstable: boolean; // eligible sets differed across attempts
  attempts: AttemptResult[];
}

export interface RunData {
  date: string; // ISO 8601
  model: string;
  judgeModel: string;
  gitSha: string;
  runsPerCase: number;
  cases: CaseResult[];
}

/** Row of rendered scoreboard numbers for one attempt, or `undefined` fields for an errored case. */
interface ScoreboardRow {
  label: string;
  f1: string;
  precision: string;
  recall: string;
  dollarsInRange: string;
  confAgree: string;
  reasoningPass: string;
  flags: string;
}

const NUMERIC_PLACEHOLDER = '—'; // em dash

function toFixed2(n: number): string {
  return n.toFixed(2);
}

function toPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function attemptLabel(caseId: string, attemptIndex: number, attemptCount: number): string {
  return attemptCount > 1 ? `${caseId} (run ${attemptIndex + 1})` : caseId;
}

function caseFlags(caseResult: CaseResult): string {
  const flags: string[] = [];
  if (caseResult.error) flags.push(caseResult.error);
  if (caseResult.unstable) flags.push('unstable');
  return flags.join('; ');
}

function confAgreeCell(confidence: ConfidenceScore): string {
  return confidence.checked === 0 ? NUMERIC_PLACEHOLDER : toPercent(confidence.agreementRate);
}

function attemptRow(caseResult: CaseResult, attempt: AttemptResult, attemptIndex: number): ScoreboardRow {
  return {
    label: attemptLabel(caseResult.id, attemptIndex, caseResult.attempts.length),
    f1: toFixed2(attempt.programSet.f1),
    precision: toFixed2(attempt.programSet.precision),
    recall: toFixed2(attempt.programSet.recall),
    dollarsInRange: toPercent(attempt.dollars.inRangeRate),
    confAgree: confAgreeCell(attempt.confidence),
    reasoningPass: toPercent(attempt.reasoning.passRate),
    flags: caseFlags(caseResult),
  };
}

function dashRow(label: string, flags: string): ScoreboardRow {
  return {
    label,
    f1: NUMERIC_PLACEHOLDER,
    precision: NUMERIC_PLACEHOLDER,
    recall: NUMERIC_PLACEHOLDER,
    dollarsInRange: NUMERIC_PLACEHOLDER,
    confAgree: NUMERIC_PLACEHOLDER,
    reasoningPass: NUMERIC_PLACEHOLDER,
    flags,
  };
}

function erroredRow(caseResult: CaseResult): ScoreboardRow {
  return dashRow(caseResult.id, caseFlags(caseResult));
}

function scoreboardRowsFor(caseResult: CaseResult): ScoreboardRow[] {
  if (caseResult.error) return [erroredRow(caseResult)];
  return caseResult.attempts.map((attempt, i) => attemptRow(caseResult, attempt, i));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function firstAttempts(cases: CaseResult[]): AttemptResult[] {
  return cases
    .filter((c) => !c.error && c.attempts.length > 0)
    .map((c) => c.attempts[0]);
}

function aggregateConfAgreeCell(attempts: AttemptResult[]): string {
  const checkedAttempts = attempts.filter((a) => a.confidence.checked > 0);
  if (checkedAttempts.length === 0) return NUMERIC_PLACEHOLDER;
  return toPercent(mean(checkedAttempts.map((a) => a.confidence.agreementRate)));
}

function aggregateRow(cases: CaseResult[]): ScoreboardRow {
  const attempts = firstAttempts(cases);
  if (attempts.length === 0) return dashRow('Aggregate', '');
  return {
    label: 'Aggregate',
    f1: toFixed2(mean(attempts.map((a) => a.programSet.f1))),
    precision: toFixed2(mean(attempts.map((a) => a.programSet.precision))),
    recall: toFixed2(mean(attempts.map((a) => a.programSet.recall))),
    dollarsInRange: toPercent(mean(attempts.map((a) => a.dollars.inRangeRate))),
    confAgree: aggregateConfAgreeCell(attempts),
    reasoningPass: toPercent(mean(attempts.map((a) => a.reasoning.passRate))),
    flags: '',
  };
}

/** Escapes characters that would corrupt a Markdown table cell: pipes (column
 *  delimiters) and newlines (row delimiters). Applied to every cell so any
 *  free-text field — most notably an error message — can't split the table. */
function sanitizeCell(text: string): string {
  return text.replace(/\n/g, ' ').replace(/\|/g, '\\|');
}

function renderScoreboardRow(row: ScoreboardRow): string {
  const cells = [
    row.label,
    row.f1,
    row.precision,
    row.recall,
    row.dollarsInRange,
    row.confAgree,
    row.reasoningPass,
    row.flags,
  ].map(sanitizeCell);
  return `| ${cells.join(' | ')} |`;
}

function renderHeader(run: RunData): string {
  return [
    '# Eval Report',
    '',
    `- Date: ${run.date}`,
    `- Eligibility model: ${run.model}`,
    `- Judge model: ${run.judgeModel}`,
    `- Git SHA: ${run.gitSha}`,
    `- Runs per case: ${run.runsPerCase}`,
    `- Cases: ${run.cases.length}`,
  ].join('\n');
}

function renderScoreboard(run: RunData): string {
  const rows = run.cases.flatMap(scoreboardRowsFor);
  rows.push(aggregateRow(run.cases));
  return [
    '## Scoreboard',
    '',
    '| case | F1 | precision | recall | $ in-range | conf. agree | reasoning pass | flags |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(renderScoreboardRow),
  ].join('\n');
}

function renderFalsePositives(programSet: ProgramSetScore): string[] {
  return programSet.falsePositives.map((id) => `- False positive: ${id}`);
}

function renderFalseNegatives(programSet: ProgramSetScore): string[] {
  return programSet.falseNegatives.map((id) => {
    const isHiddenGem = programSet.hiddenGemMisses.includes(id);
    return `- False negative: ${id}${isHiddenGem ? ' 💎' : ''}`;
  });
}

function renderDollarViolations(dollars: DollarScore): string[] {
  return dollars.violations.map(
    (v) => `- Dollar violation: ${v.program_id}: $${v.value} outside [$${v.min}–$${v.max}]`
  );
}

function renderConfidenceDisagreements(confidence: ConfidenceScore): string[] {
  return confidence.disagreements.map(
    (d) => `- Confidence disagreement: ${d.program_id}: expected ${d.expected.join('/')}, got ${d.actual}`
  );
}

function renderJudgeFailures(reasoning: ReasoningScore): string[] {
  return reasoning.failures.map(
    (f) => `- Judge failure: ${f.program_id}${f.issue ? `: ${f.issue}` : ''}`
  );
}

function renderUnjudgedCount(reasoning: ReasoningScore): string[] {
  return reasoning.unjudged > 0 ? [`- Unjudged: ${reasoning.unjudged}`] : [];
}

function attemptHasFailures(attempt: AttemptResult): boolean {
  return (
    attempt.programSet.falsePositives.length > 0 ||
    attempt.programSet.falseNegatives.length > 0 ||
    attempt.dollars.violations.length > 0 ||
    attempt.confidence.disagreements.length > 0 ||
    attempt.reasoning.failures.length > 0 ||
    attempt.reasoning.unjudged > 0
  );
}

function renderAttemptFailures(attempt: AttemptResult): string[] {
  return [
    ...renderFalsePositives(attempt.programSet),
    ...renderFalseNegatives(attempt.programSet),
    ...renderDollarViolations(attempt.dollars),
    ...renderConfidenceDisagreements(attempt.confidence),
    ...renderJudgeFailures(attempt.reasoning),
    ...renderUnjudgedCount(attempt.reasoning),
  ];
}

function renderCaseFailures(caseResult: CaseResult): string[] {
  if (caseResult.error) return [`### ${caseResult.id}`, '', `- Error: ${caseResult.error}`, ''];

  const failingAttempts = caseResult.attempts
    .map((attempt, i) => ({ attempt, i }))
    .filter(({ attempt }) => attemptHasFailures(attempt));

  if (failingAttempts.length === 0) return [];

  return [
    `### ${caseResult.id}`,
    '',
    ...failingAttempts.flatMap(({ attempt, i }) => {
      const label = attemptLabel(caseResult.id, i, caseResult.attempts.length);
      const heading = caseResult.attempts.length > 1 ? [`#### ${label}`, ''] : [];
      return [...heading, ...renderAttemptFailures(attempt), ''];
    }),
  ];
}

function renderFailures(run: RunData): string {
  const sections = run.cases.flatMap(renderCaseFailures);
  if (sections.length === 0) return '## Failures\n\nNone.';
  return ['## Failures', '', ...sections].join('\n').trimEnd();
}

export function renderReport(run: RunData): string {
  return [renderHeader(run), '', renderScoreboard(run), '', renderFailures(run), ''].join('\n');
}
