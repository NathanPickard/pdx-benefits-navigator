import type { EvalCase } from '../types';

export const cliffOhpOver: EvalCase = {
  id: 'cliff-ohp-over',
  title: 'Single adult at $22,300 — $275 OVER the OHP 138% FPL adult cap ($22,025)',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 22300,
    zip_code: '97214',
    housing_status: 'rent',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'employed_ft',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'oregon-eitc',            // $22,300 < $30,000, employed
      'liheap-energy-trust',    // under $38,384 (60% SMI, hh1)
      'pdx-water-fa',           // Portland renter (landlord verification), under $53,940
      'transportation-wallet',  // Portland, under 200% FPL
      'inclusionary-housing',   // Portland renter, under $71,900 (80% AMI, hh1)
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization', 'advsd'],
  },
  notes:
    'FPL hh1 = $15,960. OHP adult cap 138% = $22,025; $22,300 is $275 over → ineligible (no pregnancy/child path). Lifeline falls with it: over the 135% cap ($21,546) and no SNAP/Medicaid enrollment to qualify through — probes whether the model tracks program-based eligibility coupling, not just income lines. Everything else identical to cliff-ohp-under.',
};
