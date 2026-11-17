/**
 * Runner CLI for the AI eval harness. Runs every ground-truth case (Task 2-4)
 * through the live eligibility pipeline (lib/claudeBrowser.ts), scores each
 * attempt with the pure scorers (Task 1) and the LLM judge (Task 5), and
 * writes a JSON run artifact plus a Markdown scoreboard (Task 6) under
 * `evals/`.
 *
 * Usage:
 *   npm run eval                       # all cases, 1 run each
 *   npm run eval -- maria rose         # only these case ids
 *   npm run eval -- --runs 3           # all cases, 3 runs each (stability check)
 *
 * Env (.env.local): ANTHROPIC_API_KEY
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { CASES } from './cases';
import { scoreProgramSet, scoreDollars, scoreConfidence } from './scorers';
import { judgeMatch, JUDGE_MODEL } from './judge';
import { renderReport } from './report';
import type { AttemptResult, CaseResult, ReasoningScore, RunData } from './report';
import { ELIGIBILITY_MODEL } from '../../lib/eligibility';
import type { AnalysisOutput, Program } from '../../types/program';
import type { EvalCase } from './types';
import { validateCaseDefinitions } from './validate';
import { loadDotEnvLocal } from '../lib/env';
import { collectAnalysis } from '../lib/collectAnalysis';

const ROOT = process.cwd();

/** Parses a `--runs` value; only a plain positive integer like `3` is accepted. */
function parseRunsValue(value: string | undefined): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
  if (String(parsed) !== value || parsed < 1) {
    throw new Error('--runs must be a positive integer');
  }
  return parsed;
}

/**
 * Positional args are case ids; `--runs N` sets attempts per case (default 1).
 * Throws when `--runs` is missing its value or is not a positive integer.
 */
export function parseEvalArgs(argv: string[]): { caseIds: string[]; runs: number } {
  const caseIds: string[] = [];
  let runs = 1;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--runs') {
      runs = parseRunsValue(argv[i + 1]);
      i++;
      continue;
    }
    caseIds.push(arg);
  }

  return { caseIds, runs };
}

/** True when every output's set of eligible program ids is identical (order-insensitive). */
export function eligibleSetsMatch(outputs: AnalysisOutput[]): boolean {
  const signatures = outputs.map((output) =>
    output.matches
      .filter((m) => m.eligible)
      .map((m) => m.program_id)
      .sort()
      .join(','),
  );
  return signatures.every((sig) => sig === signatures[0]);
}

/**
 * Case-definition problems plus any case id requested on the CLI that is not
 * in CASES. An empty array means it is safe to start calling the API.
 */
function validateCases(requestedCaseIds: string[], allPrograms: Program[]): string[] {
  const allCaseIds = new Set(CASES.map((c) => c.id));
  const unknownRequested = requestedCaseIds
    .filter((id) => !allCaseIds.has(id))
    .map((id) => `Unknown case id requested on the CLI: "${id}"`);
  const programIds = new Set(allPrograms.map((p) => p.id));
  return [...unknownRequested, ...validateCaseDefinitions(CASES, programIds)];
}

/** One attempt of the live eligibility pipeline plus every derived score. */
async function runAttempt(
  apiKey: string,
  kase: EvalCase,
  allPrograms: Program[],
  programById: Map<string, Program>,
): Promise<AttemptResult> {
  let output: AnalysisOutput;
  try {
    output = await collectAnalysis(apiKey, kase.intake, () => process.stdout.write('.'));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${kase.id}: ${message}`);
  }

  const programSet = scoreProgramSet(output, kase.expected, allPrograms);
  const dollars = scoreDollars(output, allPrograms, kase.expected.valueOverrides);
  const confidence = scoreConfidence(output, kase.expected.confidence);
  const { reasoning, judgeTranscripts } = await judgeEligibleMatches(
    apiKey,
    kase,
    output,
    programById,
  );

  return { output, programSet, dollars, confidence, reasoning, judgeTranscripts };
}

/** Judges every model-eligible match sequentially, folding pass/fail/unjudged into a ReasoningScore. */
async function judgeEligibleMatches(
  apiKey: string,
  kase: EvalCase,
  output: AnalysisOutput,
  programById: Map<string, Program>,
): Promise<{ reasoning: ReasoningScore; judgeTranscripts: AttemptResult['judgeTranscripts'] }> {
  const eligibleMatches = output.matches.filter((m) => m.eligible);
  const judgeTranscripts: AttemptResult['judgeTranscripts'] = [];
  const failures: ReasoningScore['failures'] = [];
  let passes = 0;
  let fails = 0;
  let unjudged = 0;

  for (const match of eligibleMatches) {
    const program = programById.get(match.program_id);
    if (!program) continue; // unknown program ids are already flagged by validation/scoring

    const result = await judgeMatch(apiKey, kase.intake, program, match);
    judgeTranscripts.push({
      program_id: match.program_id,
      verdict: result.verdict,
      issue: result.issue,
      prompt: result.prompt,
      raw: result.raw,
    });

    if (result.verdict === 'pass') passes++;
    else if (result.verdict === 'fail') {
      fails++;
      failures.push({ program_id: match.program_id, issue: result.issue });
    } else unjudged++;
  }

  const judged = passes + fails;
  const reasoning: ReasoningScore = {
    passRate: judged === 0 ? 1 : passes / judged,
    judged,
    unjudged,
    failures,
  };

  return { reasoning, judgeTranscripts };
}

function logCaseLine(kase: EvalCase, result: CaseResult): void {
  if (result.error) {
    console.log(`\n✗ ${kase.id}  ERROR: ${result.error}`);
    return;
  }

  const attempt = result.attempts[0];
  const f1 = attempt.programSet.f1.toFixed(2);
  const dollarsPct = Math.round(attempt.dollars.inRangeRate * 100);
  const confPct = Math.round(attempt.confidence.agreementRate * 100);
  const reasoningPct = Math.round(attempt.reasoning.passRate * 100);
  const unstableFlag = result.unstable ? '  UNSTABLE' : '';
  console.log(
    `\n✓ ${kase.id}  F1 ${f1}  $ ${dollarsPct}%  conf ${confPct}%  reasoning ${reasoningPct}%${unstableFlag}`,
  );
}

async function runCase(
  apiKey: string,
  kase: EvalCase,
  runs: number,
  allPrograms: Program[],
  programById: Map<string, Program>,
): Promise<CaseResult> {
  const attempts: AttemptResult[] = [];

  for (let i = 0; i < runs; i++) {
    try {
      const attempt = await runAttempt(apiKey, kase, allPrograms, programById);
      attempts.push(attempt);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const result: CaseResult = { id: kase.id, title: kase.title, error: message, unstable: false, attempts };
      logCaseLine(kase, result);
      return result;
    }
  }

  const unstable = attempts.length > 1 && !eligibleSetsMatch(attempts.map((a) => a.output));
  const result: CaseResult = { id: kase.id, title: kase.title, unstable, attempts };
  logCaseLine(kase, result);
  return result;
}

function todayIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  // Parse args first so a bad --runs fails fast, before any key or file checks.
  // A throw here is printed and exits 1 via the main().catch handler below.
  const { caseIds, runs } = parseEvalArgs(process.argv.slice(2));

  await loadDotEnvLocal(ROOT);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY in .env.local');
    process.exit(1);
    return;
  }

  const allPrograms = JSON.parse(
    await readFile(join(ROOT, 'data', 'programs.json'), 'utf8'),
  ) as Program[];
  const programById = new Map(allPrograms.map((p) => [p.id, p]));

  const problems = validateCases(caseIds, allPrograms);
  if (problems.length > 0) {
    console.error('Eval validation failed:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
    return;
  }

  const selectedCases = caseIds.length
    ? CASES.filter((c) => caseIds.includes(c.id))
    : CASES;

  const cases: CaseResult[] = [];
  for (const kase of selectedCases) {
    const result = await runCase(apiKey, kase, runs, allPrograms, programById);
    cases.push(result);
  }

  const runData: RunData = {
    date: new Date().toISOString(),
    model: ELIGIBILITY_MODEL,
    judgeModel: JUDGE_MODEL,
    gitSha: execSync('git rev-parse --short HEAD').toString().trim(),
    runsPerCase: runs,
    cases,
  };

  const runsDir = join(ROOT, 'evals', 'runs');
  await mkdir(runsDir, { recursive: true });

  const runPath = join(runsDir, `${todayIsoDate(new Date(runData.date))}-${ELIGIBILITY_MODEL}.json`);
  await writeFile(runPath, JSON.stringify(runData, null, 2), 'utf8');

  const reportPath = join(ROOT, 'evals', 'REPORT.md');
  await writeFile(reportPath, renderReport(runData), 'utf8');

  console.log(`\nWrote ${runPath}`);
  console.log(`Wrote ${reportPath}`);

  const anyErrored = cases.some((c) => c.error);
  process.exit(anyErrored ? 1 : 0);
}

if (process.argv[1] && process.argv[1].includes('run-eval')) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
