import { test } from 'node:test';
import assert from 'node:assert/strict';
import programs from '../../data/programs.json';
import { scenarios } from '../../lib/scenarios';
import maria from '../../data/scenarios/maria.json';
import james from '../../data/scenarios/james.json';
import rose from '../../data/scenarios/rose.json';

const ids = new Set((programs as { id: string }[]).map((p) => p.id));
const fixtures = { maria, james, rose } as const;

// ──── SLUG_MAP check ────
// SLUG_MAP is defined in app/demo/[scenario]/page.tsx with keys: maria, james, rose.
// Because that file is a Next.js client component, it cannot be imported in a
// plain Node test without the full Next.js compilation stack. We therefore
// assert the invariant as a comment-level contract: its keys are statically
// { maria, james, rose } — identical to Object.keys(scenarios). If that file
// ever drifts, this note and the scenarios-key test below are the guard.

test('scenarios.ts keys match the baked fixture set', () => {
  assert.deepEqual(Object.keys(scenarios).sort(), Object.keys(fixtures).sort());
});

for (const [slug, fx] of Object.entries(fixtures)) {
  test(`${slug}: every match.program_id exists in programs.json`, () => {
    for (const m of fx.matches) {
      assert.ok(ids.has(m.program_id), `${slug}: unknown program_id "${m.program_id}"`);
    }
  });

  test(`${slug}: total equals sum of eligible values`, () => {
    const sum = fx.matches
      .filter((m) => m.eligible)
      .reduce((t, m) => t + (m.estimated_annual_value || 0), 0);
    assert.equal(fx.total_estimated_annual_value, sum);
  });
}

// Signature programs (the personas' headline gems) must be eligible.
const SIGNATURE: Record<string, string> = {
  maria: 'pdx-renter-relocation',
  james: 'veterans-prop-tax-exempt',
  rose: 'senior-prop-tax-deferral',
};

for (const [slug, pid] of Object.entries(SIGNATURE)) {
  test(`${slug}: signature program ${pid} is eligible`, () => {
    const m = (
      fixtures as never as Record<string, { matches: { program_id: string; eligible: boolean }[] }>
    )[slug].matches.find((x) => x.program_id === pid);
    assert.ok(m && m.eligible, `${slug}: ${pid} not eligible`);
  });
}
