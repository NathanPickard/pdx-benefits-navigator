import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { NextRequest } from 'next/server';
import { POST } from '../route.js';
import { scenarios } from '../../../../lib/scenarios.js';
import type { AnalysisOutput } from '../../../../types/program.js';

const MARIA_ANALYSIS = JSON.parse(
  readFileSync(new URL('../../../../data/scenarios/maria.json', import.meta.url), 'utf8'),
) as AnalysisOutput;

function postRequest(body: string): NextRequest {
  return new Request('http://localhost/api/packet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }) as NextRequest;
}

test('POST /api/packet: 400 on a body that is not JSON', async () => {
  const res = await POST(postRequest('{not json'));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Invalid request body' });
});

test('POST /api/packet: 400 when intake or analysis is missing', async () => {
  const res = await POST(postRequest(JSON.stringify({ intake: scenarios.maria })));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Invalid request body' });
});

test('POST /api/packet: 400 when the intake fails the schema', async () => {
  const intake = { ...scenarios.maria, zip_code: 'abc' };
  const res = await POST(postRequest(JSON.stringify({ intake, analysis: MARIA_ANALYSIS })));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Invalid request body' });
});

test('POST /api/packet: 400 when the analysis has the wrong shape', async () => {
  const analysis = { ...MARIA_ANALYSIS, matches: 'nope' };
  const res = await POST(postRequest(JSON.stringify({ intake: scenarios.maria, analysis })));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Invalid request body' });
});

test('POST /api/packet: 200 PDF for a valid demo fixture', async () => {
  const res = await POST(
    postRequest(JSON.stringify({ intake: scenarios.maria, analysis: MARIA_ANALYSIS })),
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'application/pdf');
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-');
});
