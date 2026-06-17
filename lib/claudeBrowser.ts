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
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

import {
  ELIGIBILITY_MODEL,
  ELIGIBILITY_SYSTEM_PROMPT,
  deriveEligibility,
  assertConsistency,
  parseJsonObject,
  recomputeTotals,
} from './eligibility';
import { AnalysisOutputSchema, parseAnalysis } from './eligibilitySchema';
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

/**
 * Run one stream attempt. Returns { parsed, stopReason }. Yields progress
 * events into the provided callback so the generator can forward them.
 * On the retry attempt, `onProgress` is still called (uses the same seenIds
 * set so no duplicate program_id events are emitted across attempts).
 */
async function runStreamAttempt(
  anthropic: Anthropic,
  intake: IntakeData,
  model: string,
  seenIds: Set<string>,
  onProgress: (programId: string) => void
): Promise<{ parsed: AnalysisOutput; stopReason: string | null }> {
  const stream = anthropic.messages.stream({
    model,
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
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
    output_config: { format: zodOutputFormat(AnalysisOutputSchema) },
  });

  const programIdRegex = /"program_id"\s*:\s*"([^"]+)"/g;
  let buffer = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      buffer += event.delta.text;
      programIdRegex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = programIdRegex.exec(buffer)) !== null) {
        const id = match[1];
        if (!seenIds.has(id)) {
          seenIds.add(id);
          onProgress(id);
        }
      }
    }
  }

  const finalMessage = await stream.finalMessage();
  const stopReason = finalMessage.stop_reason;

  // parsed_output comes from the structured-output schema; fall back to
  // parsing the buffered JSON text if the SDK didn't populate it (rare).
  const parsed: AnalysisOutput =
    finalMessage.parsed_output ?? parseAnalysis(JSON.parse(buffer));

  return { parsed, stopReason };
}

export async function* analyzeEligibilityStream(
  apiKey: string,
  intake: IntakeData,
  /**
   * Optional model override. Defaults to ELIGIBILITY_MODEL (Sonnet 4.6),
   * which both the runtime BYOK path and the demo precompute now share so
   * baked fixtures match live results.
   */
  model: string = ELIGIBILITY_MODEL
): AsyncGenerator<AnalyzeStreamEvent> {
  const anthropic = makeClient(apiKey);
  const seenIds = new Set<string>();

  // Collected progress events from the first attempt to yield them in order.
  const pendingProgress: string[] = [];

  try {
    let firstAttemptError: unknown = null;

    // ── Attempt 1 ──────────────────────────────────────────────────────────
    try {
      const result = await runStreamAttempt(
        anthropic,
        intake,
        model,
        seenIds,
        (id) => pendingProgress.push(id)
      );

      // Flush progress events from the first attempt.
      for (const id of pendingProgress) {
        yield { type: 'progress', programId: id };
      }

      if (result.stopReason === 'max_tokens') {
        // Truncated — treat as retryable.
        firstAttemptError = new Error('max_tokens');
      } else {
        // Apply derive → assert → recompute and yield complete.
        const derived = deriveEligibility(result.parsed);
        assertConsistency(derived);
        yield { type: 'complete', output: recomputeTotals(derived) };
        return;
      }
    } catch (err) {
      // Flush whatever progress we collected before the error.
      for (const id of pendingProgress) {
        yield { type: 'progress', programId: id };
      }
      firstAttemptError = err;
    }

    // ── Attempt 2 (retry once on truncation or validation failure) ──────────
    // Collect attempt-2 progress ids so we can yield them after the call
    // resolves (can't yield from inside a plain callback).
    const retryProgress: string[] = [];

    let attempt2Result: { parsed: AnalysisOutput; stopReason: string | null };
    try {
      attempt2Result = await runStreamAttempt(
        anthropic,
        intake,
        model,
        seenIds, // shared — won't re-emit already-seen program ids
        (id) => retryProgress.push(id)
      );
    } catch (err) {
      // Re-throw typed API errors so the outer handler produces the correct
      // user-facing message (auth failure, rate limit, etc.). Only absorb
      // truncation/parse failures here.
      if (
        err instanceof Anthropic.AuthenticationError ||
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.APIError
      ) {
        throw err;
      }
      yield {
        type: 'error',
        message: 'The analysis response was cut off — please try again.',
      };
      return;
    }

    // Flush attempt-2 progress events (mirroring attempt-1 flush above).
    for (const id of retryProgress) {
      yield { type: 'progress', programId: id };
    }

    if (attempt2Result.stopReason === 'max_tokens') {
      yield {
        type: 'error',
        message: 'The analysis response was cut off — please try again.',
      };
      return;
    }

    // Both attempts succeeded enough to reach here; apply pipeline.
    void firstAttemptError; // acknowledged, not rethrown
    const parsed = attempt2Result.parsed;
    const derived = deriveEligibility(parsed);
    assertConsistency(derived);
    yield { type: 'complete', output: recomputeTotals(derived) };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      yield {
        type: 'error',
        message: 'Your API key was rejected. Check it in the key settings and try again.',
      };
    } else if (e instanceof Anthropic.RateLimitError) {
      yield {
        type: 'error',
        message: 'Anthropic is rate-limiting this key. Wait a moment and try again.',
      };
    } else if (e instanceof Anthropic.APIError) {
      yield {
        type: 'error',
        message: `Anthropic API error (${e.status ?? '?'}). Please try again.`,
      };
    } else {
      yield {
        type: 'error',
        message: e instanceof Error ? e.message : 'Unknown error calling Claude',
      };
    }
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
  // parseJsonObject is translation-only: used here to tolerantly extract the
  // returned JSON blob. The eligibility hot path uses structured output instead.
  return parseJsonObject<T>(text);
}
