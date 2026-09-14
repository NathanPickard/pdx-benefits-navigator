import Anthropic from '@anthropic-ai/sdk';
import { ELIGIBILITY_SYSTEM_PROMPT } from '../../lib/eligibility';
import type { IntakeData, MatchResult, Program } from '../../types/program';

export const JUDGE_MODEL = 'claude-haiku-4-5-20251001';

const REFERENCE_TABLES_START_MARKER = '==== 2026 FEDERAL POVERTY LEVEL';
const REFERENCE_TABLES_END_MARKER = '==== PROGRAMS DATABASE';

function extractReferenceTables(): string {
  const startIndex = ELIGIBILITY_SYSTEM_PROMPT.indexOf(REFERENCE_TABLES_START_MARKER);
  const endIndex = ELIGIBILITY_SYSTEM_PROMPT.indexOf(REFERENCE_TABLES_END_MARKER);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      'judge.ts: could not find reference table markers in ELIGIBILITY_SYSTEM_PROMPT ' +
        `(expected "${REFERENCE_TABLES_START_MARKER}" and "${REFERENCE_TABLES_END_MARKER}"). ` +
        'lib/eligibility.ts may have been restructured — update these markers to match.',
    );
  }
  return ELIGIBILITY_SYSTEM_PROMPT.slice(startIndex, endIndex).trim();
}

const REFERENCE_TABLES = extractReferenceTables();

export function buildJudgePrompt(
  intake: IntakeData,
  program: Program,
  match: MatchResult,
): string {
  return [
    'You are auditing one eligibility determination made by another AI.',
    'Judge ONE narrow question: does the reasoning AFFIRMATIVELY CONTRADICT the household facts,',
    'the program definition, or the official reference tables below?',
    'Fail ONLY for: a number that contradicts the program data or reference tables; a rule',
    'attributed to this program that it does not have; or reasoning about a different household',
    'than the one given.',
    'Do NOT fail for: values that match the reference tables; derived arithmetic consistent with',
    'them; hedged assumptions about facts the intake does not capture (the intake has no age',
    'field, no utility-account fields); estimates within the program’s stated range; or facts you',
    'merely cannot verify. Unverifiable-but-plausible is a pass.',
    'Do NOT re-decide eligibility.',
    '',
    '== HOUSEHOLD (intake) ==',
    JSON.stringify(intake, null, 2),
    '',
    `== PROGRAM: ${program.name} (${program.id}) ==`,
    JSON.stringify(
      { eligibility: program.eligibility, estimated_annual_value: program.estimated_annual_value },
      null,
      2,
    ),
    '',
    '== OFFICIAL REFERENCE TABLES (the engine under audit was given these) ==',
    REFERENCE_TABLES,
    '',
    '== DETERMINATION UNDER AUDIT ==',
    `eligible: ${match.eligible}, confidence: ${match.confidence}, estimated_annual_value: ${match.estimated_annual_value}`,
    `reasoning: ${match.reasoning}`,
    '',
    'Reply with ONLY the JSON object: {"verdict": "pass"} or {"verdict": "fail", "issue": "<one short sentence>"}',
  ].join('\n');
}

export function parseJudgeResponse(
  text: string,
): { verdict: 'pass' | 'fail'; issue?: string } | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const verdict = (parsed as { verdict?: unknown }).verdict;
    if (verdict !== 'pass' && verdict !== 'fail') return null;
    const issue = (parsed as { issue?: unknown }).issue;
    return { verdict, issue: typeof issue === 'string' ? issue : undefined };
  } catch {
    return null;
  }
}

export async function judgeMatch(
  apiKey: string,
  intake: IntakeData,
  program: Program,
  match: MatchResult,
): Promise<{ verdict: 'pass' | 'fail' | 'unjudged'; issue?: string; prompt: string; raw: string }> {
  const prompt = buildJudgePrompt(intake, program, match);
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    const parsed = parseJudgeResponse(raw);
    if (!parsed) return { verdict: 'unjudged', prompt, raw };
    return { ...parsed, prompt, raw };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { verdict: 'unjudged', issue: `judge call failed: ${message}`, prompt, raw: '' };
  }
}
