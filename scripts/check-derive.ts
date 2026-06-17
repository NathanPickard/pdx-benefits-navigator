import { deriveEligibility, recomputeTotals } from '../lib/eligibility';
import type { AnalysisOutput } from '../types/program';

const sample: AnalysisOutput = {
  matches: [
    { program_id: 'a', eligible: true, confidence: 'high', estimated_annual_value: 100, reasoning: '', requirements: [{ key: 'income', met: 'yes', detail: '' }], next_steps: [], required_documents: [] },
    { program_id: 'b', eligible: true, confidence: 'high', estimated_annual_value: 200, reasoning: '', requirements: [{ key: 'income', met: 'no', detail: '' }], next_steps: [], required_documents: [] },
    { program_id: 'c', eligible: true, confidence: 'low', estimated_annual_value: 50, reasoning: '', requirements: [{ key: 'income', met: 'unknown', detail: '' }], next_steps: [], required_documents: [] },
  ],
  total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0,
  priority_application_order: [], warnings: [],
};
const out = recomputeTotals(deriveEligibility(sample));
const a = out.matches.find((m) => m.program_id === 'a')!;
const b = out.matches.find((m) => m.program_id === 'b')!;
const c = out.matches.find((m) => m.program_id === 'c')!;
const ok = a.eligible === true && b.eligible === false && b.estimated_annual_value === 0 && c.eligible === true;
console.log(ok ? '✓ deriveEligibility: yes→eligible, no→ineligible+zeroed, unknown→eligible' : '✗ FAIL', JSON.stringify({ a: a.eligible, b: b.eligible, bVal: b.estimated_annual_value, c: c.eligible }));
if (!ok) process.exit(1);
