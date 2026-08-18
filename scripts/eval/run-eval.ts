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
import { analyzeEligibilityStream } from '../../lib/claudeBrowser';
import { ELIGIBILITY_MODEL } from '../../lib/eligibility';
import type { AnalysisOutput, Program } from '../../types/program';
import type { EvalCase } from './types';

const ROOT = process.cwd();

// ── loadDotEnvLocal — copied verbatim from scripts/precompute-scenarios.ts ──
async function loadDotEnvLocal(): Promise<void> {
  try {
    const text = await readFile(join(ROOT, '.env.local'), 'utf8');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // Fall back to shell env.
  }
}

/** Positional args are case ids; `--runs N` sets attempts per case (default 1). */
export function parseEvalArgs(argv: string[]): { caseIds: string[]; runs: number } {
  const caseIds: string[] = [];
  let runs = 1;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--runs') {
      const next = argv[i + 1];
      const parsed = next === undefined ? NaN : Number.parseInt(next, 10);
      runs = Number.isNaN(parsed) ? 1 : parsed;
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

interface ValidationProblem {
  message: string;
}

function validateCases(
  requestedCaseIds: string[],
  allPrograms: Program[],
): ValidationProblem[] {
  const problems: ValidationProblem[] = [];
  const programIds = new Set(allPrograms.map((p) => p.id));
  const allCaseIds = new Set(CASES.map((c) => c.id));

  for (const id of requestedCaseIds) {
    if (!allCaseIds.has(id)) {
      problems.push({ message: `Unknown case id requested on the CLI: "${id}"` });
    }
  }

  const seenCaseIds = new Set<string>();
  for (const kase of CASES) {
    if (seenCaseIds.has(kase.id)) {
      problems.push({ message: `Duplicate case id in CASES: "${kase.id}"` });
    }
    seenCaseIds.add(kase.id);

    const referencedIds = [...kase.expected.eligible, ...(kase.expected.uncertain ?? [])];
    for (const programId of referencedIds) {
      if (!programIds.has(programId)) {
        problems.push({
          message: `Case "${kase.id}" references unknown program id "${programId}"`,
        });
      }
    }

    const eligibleSet = new Set(kase.expected.eligible);
    const uncertainSet = new Set(kase.expected.uncertain ?? []);
    for (const id of eligibleSet) {
      if (uncertainSet.has(id)) {
        problems.push({
          message: `Case "${kase.id}" lists "${id}" in both expected.eligible and expected.uncertain`,
        });
      }
    }
  }

  return problems;
}

/** One attempt of the live eligibility pipeline plus every derived score. */
async function runAttempt(
  apiKey: string,
  kase: EvalCase,
  allPrograms: Program[],
  programById: Map<string, Program>,
): Promise<AttemptResult> {
  let output: AnalysisOutput | null = null;
  let errorMessage: string | null = null;

  for await (const event of analyzeEligibilityStream(apiKey, kase.intake, ELIGIBILITY_MODEL)) {
    if (event.type === 'progress') {
      process.stdout.write('.');
    } else if (event.type === 'complete') {
      output = event.output;
    } else if (event.type === 'error') {
      errorMessage = event.message;
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!output) throw new Error(`${kase.id}: no complete event received`);

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
  await loadDotEnvLocal();
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

  const { caseIds, runs } = parseEvalArgs(process.argv.slice(2));

  const problems = validateCases(caseIds, allPrograms);
  if (problems.length > 0) {
    console.error('Eval validation failed:');
    for (const problem of problems) console.error(`  - ${problem.message}`);
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
