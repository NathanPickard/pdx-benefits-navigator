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

/** Output cap for streamed requests (Sonnet 4.6's maximum). */
const MAX_OUTPUT_TOKENS = 64000;

/** Shown when a translation still ran past the output cap. */
const TRANSLATION_TRUNCATED_MESSAGE =
  'The translation was cut off before it finished. Please try again.';

/** One initial attempt plus one retry on truncation, parse or server failure. */
const MAX_ATTEMPTS = 2;

/**
 * Shown when every attempt was truncated or produced an unusable result. A
 * parse or pipeline failure on the final attempt also lands here.
 */
const TRUNCATED_MESSAGE = 'The analysis response was cut off — please try again.';

/**
 * Client errors (status < 500: bad key, rate limit, bad request) fail the same
 * way on a retry. Server errors and mid-stream errors (no status) may not.
 */
function isNonRetryableApiError(err: unknown): boolean {
  return err instanceof Anthropic.APIError && typeof err.status === 'number' && err.status < 500;
}

/** Derive eligibility, check consistency and recompute dollar totals. */
function finalize(parsed: AnalysisOutput): AnalysisOutput {
  const derived = deriveEligibility(parsed);
  assertConsistency(derived);
  return recomputeTotals(derived);
}

interface StreamAttemptResult {
  parsed: AnalysisOutput;
  stopReason: string | null;
}

/**
 * Run one stream attempt. Yields a progress event as soon as each new
 * program_id appears in the streamed text, then returns { parsed, stopReason }.
 * The retry attempt shares the same seenIds set, so no program_id is emitted
 * twice across attempts.
 */
async function* runStreamAttempt(
  anthropic: Anthropic,
  intake: IntakeData,
  model: string,
  seenIds: Set<string>
): AsyncGenerator<AnalyzeStreamEvent, StreamAttemptResult> {
  const stream = anthropic.messages.stream({
    model,
    // The full 24-program per-requirement analysis runs ~8-12K output tokens;
    // 64K is safe streaming headroom (timeouts aren't a concern when streaming).
    // NOTE: adaptive thinking was tried and removed — on this 20-program task it
    // pushed a streamed analysis past several minutes with no accuracy gain over
    // Sonnet 4.6's default reasoning (which Phase 0 already validated).
    max_tokens: MAX_OUTPUT_TOKENS,
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
          yield { type: 'progress', programId: id };
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
  // Shared across attempts, so already-seen program ids aren't re-emitted.
  const seenIds = new Set<string>();

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const isFinalAttempt = attempt === MAX_ATTEMPTS;
      let output: AnalysisOutput | null = null;
      try {
        const { parsed, stopReason } = yield* runStreamAttempt(anthropic, intake, model, seenIds);
        // A truncated response leaves output null, so the loop retries.
        if (stopReason !== 'max_tokens') output = finalize(parsed);
      } catch (err) {
        // Client errors (bad key, rate limit, bad request) won't change on a
        // retry. API errors on the final attempt go to the outer handler for
        // a specific message. Anything else (parse or pipeline failure) retries,
        // and on the final attempt falls through to TRUNCATED_MESSAGE.
        if (isNonRetryableApiError(err)) throw err;
        if (isFinalAttempt && err instanceof Anthropic.APIError) throw err;
      }
      if (output) {
        yield { type: 'complete', output };
        return;
      }
    }
    yield { type: 'error', message: TRUNCATED_MESSAGE };
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
  // Streamed so the request can use the full output allowance: a non-streamed
  // call had to cap at 16K tokens, which a Vietnamese translation of a large
  // analysis overflows.
  const response = await anthropic.messages.stream({
    model: ELIGIBILITY_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      {
        role: 'user',
        content: `Translate the human-readable STRING VALUES in this JSON to ${targetLanguage}. Keep all JSON keys, numbers, IDs (e.g. snake_case program_ids like "snap", "pdx-renter-relocation"), URLs, dates, and the object structure exactly as given. Do not translate proper-noun program names (SNAP, WIC, OHP, ERDC, LIHEAP, PCEF, ADVSD, SUN, PGE), but DO translate descriptive phrases. Return ONLY the translated JSON object — no markdown, no preamble, no trailing prose.\n\n${JSON.stringify(payload)}`,
      },
    ],
  }).finalMessage();

  if (response.stop_reason === 'max_tokens') {
    throw new Error(TRANSLATION_TRUNCATED_MESSAGE);
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  // parseJsonObject is translation-only: used here to tolerantly extract the
  // returned JSON blob. The eligibility hot path uses structured output instead.
  return parseJsonObject<T>(text);
}
