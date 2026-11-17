import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SESSION_KEYS, readPrebaked, readStoredIntake } from '../sessionState.js';
import { cacheAnalysis, readCachedAnalysis } from '../resultsCache.js';
import { scenarios } from '../scenarios.js';
import type { AnalysisOutput } from '../../types/program.js';

// Minimal in-memory stand-in for the browser's sessionStorage.
function installSessionStorage(): Map<string, string> {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage, configurable: true });
  return store;
}

const MARIA_ANALYSIS = JSON.parse(
  readFileSync(new URL('../../data/scenarios/maria.json', import.meta.url), 'utf8'),
) as AnalysisOutput;

let store: Map<string, string>;
beforeEach(() => {
  store = installSessionStorage();
});

test('readStoredIntake: returns a valid stored intake', () => {
  store.set(SESSION_KEYS.intake, JSON.stringify(scenarios.maria));
  assert.deepEqual(readStoredIntake(), scenarios.maria);
});

test('readStoredIntake: null when the key is missing', () => {
  assert.equal(readStoredIntake(), null);
});

test('readStoredIntake: null on invalid JSON', () => {
  store.set(SESSION_KEYS.intake, '{not json');
  assert.equal(readStoredIntake(), null);
});

test('readStoredIntake: null on a partial intake', () => {
  const { zip_code: _omit, ...partial } = scenarios.maria;
  void _omit;
  store.set(SESSION_KEYS.intake, JSON.stringify(partial));
  assert.equal(readStoredIntake(), null);
});

test('readPrebaked: returns a valid demo analysis', () => {
  store.set(SESSION_KEYS.prebaked, JSON.stringify(MARIA_ANALYSIS));
  assert.deepEqual(readPrebaked(), MARIA_ANALYSIS);
});

test('readPrebaked: null when the key is missing', () => {
  assert.equal(readPrebaked(), null);
});

test('readPrebaked: null on invalid JSON or the wrong shape', () => {
  store.set(SESSION_KEYS.prebaked, 'garbage');
  assert.equal(readPrebaked(), null);
  store.set(SESSION_KEYS.prebaked, JSON.stringify({ matches: 'nope' }));
  assert.equal(readPrebaked(), null);
});

test('readCachedAnalysis: returns a valid cached analysis for the same intake', () => {
  cacheAnalysis(scenarios.maria, MARIA_ANALYSIS);
  assert.deepEqual(readCachedAnalysis(scenarios.maria), MARIA_ANALYSIS);
});

test('readCachedAnalysis: a malformed cached analysis is a cache miss', () => {
  cacheAnalysis(scenarios.maria, { matches: 'nope' } as unknown as AnalysisOutput);
  assert.equal(readCachedAnalysis(scenarios.maria), null);
});
