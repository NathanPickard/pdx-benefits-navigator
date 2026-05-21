/**
 * Browser-side Anthropic client. Calls the Claude API directly from the user's
 * browser using a key they provide via the ApiKeyControl. The user's key never
 * touches our server.
 *
 * `dangerouslyAllowBrowser: true` is safe here because the key belongs to the
 * end user (bring-your-own-key), not to us. They are choosing to expose their
 * own key to their own session.
 */

import Anthropic from '@anthropic-ai/sdk';

import {
  ELIGIBILITY_MODEL,
  ELIGIBILITY_SYSTEM_PROMPT,
  enforceEligibilityConsistency,
  parseJsonObject,
  recomputeTotals,
} from './eligibility';
import type { AnalysisOutput, IntakeData } from '@/types/program';

function makeClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export type AnalyzeStreamEvent =
  | { type: 'progress'; programId: string }
  | { type: 'complete'; output: AnalysisOutput }
  | { type: 'error'; message: string };

export async function* analyzeEligibilityStream(
  apiKey: string,
  intake: IntakeData,
  /**
   * Optional model override. Defaults to ELIGIBILITY_MODEL (Haiku) for the
   * runtime BYOK path. Precompute uses Sonnet for tighter constraint
   * adherence and arithmetic.
   */
  model: string = ELIGIBILITY_MODEL
): AsyncGenerator<AnalyzeStreamEvent> {
  try {
    const anthropic = makeClient(apiKey);
    const stream = anthropic.messages.stream({
      model,
      // 16K accommodates Sonnet's longer reasoning for the full 20-program
      // evaluation; Haiku rarely uses more than ~8K but the extra ceiling
      // costs nothing on input/cache-miss pricing.
      max_tokens: 16000,
      system: [
        {
          type: 'text',
          text: ELIGIBILITY_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze eligibility for this Portland resident:\n\n${JSON.stringify(intake, null, 2)}`,
        },
      ],
    });

    let buffer = '';
    const seenIds = new Set<string>();
    const programIdRegex = /"program_id"\s*:\s*"([^"]+)"/g;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        buffer += event.delta.text;
        programIdRegex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = programIdRegex.exec(buffer)) !== null) {
          const id = match[1];
          if (!seenIds.has(id)) {
            seenIds.add(id);
            yield { type: 'progress', programId: id };
          }
        }
      }
    }

    const parsed = parseJsonObject<AnalysisOutput>(buffer);
    const consistent = enforceEligibilityConsistency(parsed);
    yield { type: 'complete', output: recomputeTotals(consistent) };
  } catch (e) {
    yield {
      type: 'error',
      message: e instanceof Error ? e.message : 'Unknown error calling Claude',
    };
  }
}

export async function translatePayload<T>(
  apiKey: string,
  payload: T,
  targetLanguage: 'es' | 'vi'
): Promise<T> {
  const anthropic = makeClient(apiKey);
  const response = await anthropic.messages.create({
    model: ELIGIBILITY_MODEL,
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: `Translate the human-readable STRING VALUES in this JSON to ${targetLanguage}. Keep all JSON keys, numbers, IDs (e.g. snake_case program_ids like "snap", "pdx-renter-relocation"), URLs, dates, and the object structure exactly as given. Do not translate proper-noun program names (SNAP, WIC, OHP, ERDC, LIHEAP, PCEF, ADVSD, SUN, PGE), but DO translate descriptive phrases. Return ONLY the translated JSON object — no markdown, no preamble, no trailing prose.\n\n${JSON.stringify(payload)}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');
  return parseJsonObject<T>(text);
}
