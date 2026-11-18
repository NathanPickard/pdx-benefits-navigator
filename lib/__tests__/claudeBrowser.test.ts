import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import {
  analyzeEligibilityStream,
  translatePayload,
  type AnalyzeStreamEvent,
} from '../claudeBrowser.js';
import { scenarios } from '../scenarios.js';
import type { AnalysisOutput } from '../../types/program.js';

const MARIA_ANALYSIS = JSON.parse(
  readFileSync(new URL('../../data/scenarios/maria.json', import.meta.url), 'utf8'),
) as AnalysisOutput;

const TRUNCATED = 'The analysis response was cut off — please try again.';

/** One scripted stream attempt: either throws mid-stream or finishes. */
type AttemptScript =
  | { kind: 'throw'; error: unknown }
  | { kind: 'finish'; stopReason: string; parsed: AnalysisOutput };

const originalStream = Anthropic.Messages.prototype.stream;

/** Replace messages.stream with a fake that plays the scripts in order. */
function mockStream(scripts: AttemptScript[]): { calls: () => number } {
  let calls = 0;
  Anthropic.Messages.prototype.stream = function fakeStream() {
    const script = scripts[calls];
    calls += 1;
    if (!script) throw new Error(`unexpected stream call #${calls}`);
    return {
      async *[Symbol.asyncIterator]() {
        if (script.kind === 'throw') throw script.error;
        yield {
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text: '"program_id": "snap"' },
        };
      },
      finalMessage: async () => {
        if (script.kind === 'throw') throw script.error;
        return { stop_reason: script.stopReason, parsed_output: script.parsed };
      },
    } as unknown as ReturnType<typeof originalStream>;
  };
  return { calls: () => calls };
}

async function collect(): Promise<AnalyzeStreamEvent[]> {
  const events: AnalyzeStreamEvent[] = [];
  for await (const event of analyzeEligibilityStream('test-key', scenarios.maria)) {
    events.push(event);
  }
  return events;
}

function lastEvent(events: AnalyzeStreamEvent[]): AnalyzeStreamEvent {
  const last = events.at(-1);
  assert.ok(last, 'expected at least one event');
  return last;
}

afterEach(() => {
  Anthropic.Messages.prototype.stream = originalStream;
});

test('a 401 is not retried and reports a rejected key', async () => {
  const authError = new Anthropic.AuthenticationError(401, undefined, 'bad key', new Headers());
  const mock = mockStream([{ kind: 'throw', error: authError }]);

  const events = await collect();

  assert.equal(mock.calls(), 1);
  const last = lastEvent(events);
  assert.equal(last.type, 'error');
  assert.match(last.type === 'error' ? last.message : '', /API key was rejected/);
});

test('a 429 is not retried', async () => {
  const rateError = new Anthropic.RateLimitError(429, undefined, 'slow down', new Headers());
  const mock = mockStream([{ kind: 'throw', error: rateError }]);

  const events = await collect();

  assert.equal(mock.calls(), 1);
  assert.equal(lastEvent(events).type, 'error');
});

test('a mid-stream error with no status is retried once', async () => {
  const midStream = new Anthropic.APIError(undefined, undefined, 'stream dropped', undefined);
  const mock = mockStream([
    { kind: 'throw', error: midStream },
    { kind: 'finish', stopReason: 'end_turn', parsed: MARIA_ANALYSIS },
  ]);

  const events = await collect();

  assert.equal(mock.calls(), 2);
  assert.equal(lastEvent(events).type, 'complete');
});

test('a 5xx is retried once', async () => {
  const serverError = new Anthropic.InternalServerError(500, undefined, 'oops', new Headers());
  const mock = mockStream([
    { kind: 'throw', error: serverError },
    { kind: 'finish', stopReason: 'end_turn', parsed: MARIA_ANALYSIS },
  ]);

  const events = await collect();

  assert.equal(mock.calls(), 2);
  assert.equal(lastEvent(events).type, 'complete');
});

test('max_tokens on both attempts yields the truncated message', async () => {
  const mock = mockStream([
    { kind: 'finish', stopReason: 'max_tokens', parsed: MARIA_ANALYSIS },
    { kind: 'finish', stopReason: 'max_tokens', parsed: MARIA_ANALYSIS },
  ]);

  const events = await collect();

  assert.equal(mock.calls(), 2);
  assert.deepEqual(lastEvent(events), { type: 'error', message: TRUNCATED });
});

test('a malformed result on the final attempt yields the truncated message', async () => {
  const malformed = { ...MARIA_ANALYSIS, matches: undefined } as unknown as AnalysisOutput;
  const mock = mockStream([
    { kind: 'finish', stopReason: 'end_turn', parsed: malformed },
    { kind: 'finish', stopReason: 'end_turn', parsed: malformed },
  ]);

  const events = await collect();

  assert.equal(mock.calls(), 2);
  assert.deepEqual(lastEvent(events), { type: 'error', message: TRUNCATED });
});

test('progress ids are not re-emitted across attempts', async () => {
  mockStream([
    { kind: 'finish', stopReason: 'max_tokens', parsed: MARIA_ANALYSIS },
    { kind: 'finish', stopReason: 'end_turn', parsed: MARIA_ANALYSIS },
  ]);

  const events = await collect();

  assert.equal(events.filter((e) => e.type === 'progress').length, 1);
  assert.equal(lastEvent(events).type, 'complete');
});

/** Replace messages.stream with a fake whose final message carries `text`. */
function mockTranslationStream(stopReason: string, text: string): void {
  Anthropic.Messages.prototype.stream = function fakeStream() {
    return {
      finalMessage: async () => ({
        stop_reason: stopReason,
        content: [{ type: 'text', text }],
      }),
    } as unknown as ReturnType<typeof originalStream>;
  };
}

test('translatePayload returns the translated JSON object', async () => {
  mockTranslationStream('end_turn', '{"greeting":"hola","total":42}');

  const result = await translatePayload('test-key', { greeting: 'hello', total: 42 }, 'es');

  assert.deepEqual(result, { greeting: 'hola', total: 42 });
});

test('translatePayload reports a cut-off translation in plain words', async () => {
  mockTranslationStream('max_tokens', '{"greeting":"xin ch');

  await assert.rejects(
    translatePayload('test-key', { greeting: 'hello' }, 'vi'),
    /translation was cut off/i,
  );
});
