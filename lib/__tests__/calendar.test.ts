import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIcsCalendar, renewalIntervalMonths } from '../calendar.js';
import type { CalendarEntry } from '../calendar.js';
import type { MatchResult, Program } from '../../types/program.js';

// ──── renewalIntervalMonths ────

test('renewalIntervalMonths: annual keywords map to 12', () => {
  assert.equal(renewalIntervalMonths('Annual recertification'), 12);
  assert.equal(renewalIntervalMonths('Renew yearly'), 12);
  assert.equal(renewalIntervalMonths('Every year'), 12);
});

test('renewalIntervalMonths: monthly keywords map to 1', () => {
  assert.equal(renewalIntervalMonths('Monthly'), 1);
  assert.equal(renewalIntervalMonths('Every month'), 1);
});

test('renewalIntervalMonths: quarterly maps to 3', () => {
  assert.equal(renewalIntervalMonths('Quarterly'), 3);
});

test('renewalIntervalMonths: 6-month keywords map to 6', () => {
  assert.equal(renewalIntervalMonths('Every 6 months'), 6);
  assert.equal(renewalIntervalMonths('Biannual renewal'), 6);
  assert.equal(renewalIntervalMonths('Twice a year'), 6);
});

test('renewalIntervalMonths: undefined → 12 (default)', () => {
  assert.equal(renewalIntervalMonths(undefined), 12);
});

test('renewalIntervalMonths: unrecognized string → 12 (default)', () => {
  assert.equal(renewalIntervalMonths('Upon re-application'), 12);
});

// ──── buildIcsCalendar ────

const makeEntry = (overMatch: Partial<MatchResult> = {}, overProgram: Partial<Program> = {}): CalendarEntry => ({
  match: {
    program_id: 'snap',
    eligible: true,
    confidence: 'high',
    estimated_annual_value: 1800,
    reasoning: 'Household of 3 below 130% FPL',
    next_steps: ['Apply at OregonFoodBankPortal.gov'],
    required_documents: ['ID', 'Proof of income'],
    ...overMatch,
  },
  program: {
    id: 'snap',
    name: 'SNAP Food Benefits',
    short_name: 'SNAP',
    category: 'food',
    jurisdiction: 'oregon',
    hidden_gem: false,
    urgency: 'standard',
    description: 'Federal food assistance program',
    estimated_annual_value: { min: 1000, max: 3600, median: 2200 },
    eligibility: { income_max_pct_fpl: 130 },
    application_url: 'https://www.oregon.gov/dhs/ASSISTANCE/FOOD-BENEFITS/Pages/index.aspx',
    application_method: 'online',
    documents_required: ['ID', 'Proof of income'],
    processing_time: '30 days',
    renewal_cycle: 'Annual recertification',
    contact_phone: '503-555-0100',
    contact_org: 'Oregon DHS',
    ...overProgram,
  },
});

test('buildIcsCalendar: emits a valid VCALENDAR wrapper', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /END:VCALENDAR/);
  assert.match(ics, /VERSION:2\.0/);
  assert.match(ics, /CALSCALE:GREGORIAN/);
});

test('buildIcsCalendar: emits a VEVENT for each entry', () => {
  const ics = buildIcsCalendar([makeEntry(), makeEntry({ program_id: 'wic' }, { id: 'wic', name: 'WIC' })]);
  const beginCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
  const endCount = (ics.match(/END:VEVENT/g) ?? []).length;
  assert.equal(beginCount, 2);
  assert.equal(endCount, 2);
});

test('buildIcsCalendar: VEVENT contains DTSTART, SUMMARY, DTSTAMP, UID', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.match(ics, /DTSTART;VALUE=DATE:/);
  assert.match(ics, /SUMMARY:/);
  assert.match(ics, /DTSTAMP:/);
  assert.match(ics, /UID:/);
});

test('buildIcsCalendar: SUMMARY includes program name', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.match(ics, /SUMMARY:Renew: SNAP Food Benefits/);
});

test('buildIcsCalendar: DTSTART is a future date for annual renewal', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  const match = ics.match(/DTSTART;VALUE=DATE:(\d{8})/);
  assert.ok(match, 'DTSTART line should exist');
  const dateStr = match![1];
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10);
  const day = parseInt(dateStr.slice(6, 8), 10);
  const dtstart = new Date(Date.UTC(year, month - 1, day));
  // For an annual renewal cycle, the start date should be ~12 months from now
  const now = new Date();
  assert.ok(dtstart > now, 'DTSTART should be in the future');
});

test('buildIcsCalendar: includes VALARM reminder block', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.match(ics, /BEGIN:VALARM/);
  assert.match(ics, /TRIGGER:-P14D/);
  assert.match(ics, /END:VALARM/);
});

test('buildIcsCalendar: empty entries produces VCALENDAR with no VEVENT', () => {
  const ics = buildIcsCalendar([]);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /END:VCALENDAR/);
  assert.ok(!(ics.includes('BEGIN:VEVENT')), 'Should have no VEVENTs for empty input');
});

test('buildIcsCalendar: uses \r\n line endings (RFC 5545)', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.ok(ics.includes('\r\n'), 'ICS output must use CRLF line endings per RFC 5545');
});

test('buildIcsCalendar: URL property included when program has application_url', () => {
  const ics = buildIcsCalendar([makeEntry()]);
  assert.match(ics, /URL:https:\/\/www\.oregon\.gov/);
});
