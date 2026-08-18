import Anthropic from '@anthropic-ai/sdk';
import type { IntakeData, MatchResult, Program } from '../../types/program';

export const JUDGE_MODEL = 'claude-haiku-4-5-20251001';

export function buildJudgePrompt(
  intake: IntakeData,
  program: Program,
  match: MatchResult,
): string {
  return [
    'You are auditing one eligibility determination made by another AI.',
    'Judge ONE narrow question: does the reasoning below cite the correct decisive facts',
    'for this household and this program, without fabricating numbers?',
    'Do NOT re-decide eligibility. Fail only for: wrong/fabricated numbers, citing a rule',
    'this program does not have, or reasoning about a different household than the one given.',
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
    '== DETERMINATION UNDER AUDIT ==',
    `eligible: ${match.eligible}, confidence: ${match.confidence}, estimated_annual_value: ${match.estimated_annual_value}`,
    `reasoning: ${match.reasoning}`,
    '',
    'Reply with ONLY a JSON object: {"verdict": "pass"} or {"verdict": "fail", "issue": "<one short sentence>"}',
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
