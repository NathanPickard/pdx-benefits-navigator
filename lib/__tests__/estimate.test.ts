import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEstimate, hasEstimate } from '../estimate.js';
import { CHROME_EN } from '../i18n.js';

// ──── hasEstimate ────

test('hasEstimate: a positive value is an estimate', () => {
  assert.equal(hasEstimate(12000), true);
  assert.equal(hasEstimate(1), true);
});

test('hasEstimate: zero means the match has no estimate', () => {
  assert.equal(hasEstimate(0), false);
});

test('hasEstimate: negative and non-finite values are not estimates', () => {
  assert.equal(hasEstimate(-50), false);
  assert.equal(hasEstimate(Number.NaN), false);
  assert.equal(hasEstimate(Number.POSITIVE_INFINITY), false);
});

// ──── formatEstimate ────

test('formatEstimate: formats an estimate as whole US dollars with separators', () => {
  assert.equal(formatEstimate(12000), '$12,000');
  assert.equal(formatEstimate(480), '$480');
});

test('formatEstimate: an unestimated match shows "Ask the program", never $0', () => {
  assert.equal(formatEstimate(0), 'Ask the program');
});

test('formatEstimate: negative or NaN values fall back to the ask label', () => {
  assert.equal(formatEstimate(-1), 'Ask the program');
  assert.equal(formatEstimate(Number.NaN), 'Ask the program');
});

test('formatEstimate: uses the supplied (translated) ask label', () => {
  assert.equal(formatEstimate(0, 'Pregunte al programa'), 'Pregunte al programa');
});

test('formatEstimate: a supplied label does not affect estimates', () => {
  assert.equal(formatEstimate(2900, 'Pregunte al programa'), '$2,900');
});

// ──── Chrome bundle ────

test('CHROME_EN carries the translatable "Ask the program" label', () => {
  assert.equal(CHROME_EN.askTheProgram, 'Ask the program');
});
