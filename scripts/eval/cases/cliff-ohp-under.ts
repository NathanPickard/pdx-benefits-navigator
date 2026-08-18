import type { EvalCase } from '../types';

export const cliffOhpUnder: EvalCase = {
  id: 'cliff-ohp-under',
  title: 'Single adult at $21,800 — $225 UNDER the OHP 138% FPL adult cap ($22,025)',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 21800,
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
      'ohp',                    // 136.6% < 138% — the case's point
      'oregon-eitc',            // $21,800 < $30,000, employed
      'liheap-energy-trust',    // under $38,384 (60% SMI, hh1)
      'pdx-water-fa',           // Portland renter (landlord verification), under $53,940
      'transportation-wallet',  // Portland, under 200% FPL
      'inclusionary-housing',   // Portland renter, under $71,900 (80% AMI, hh1)
      'lifeline',               // over 135% standalone ($21,546) but OHP enrollment qualifies
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization', 'advsd'],
  },
  notes:
    'FPL hh1 = $15,960. OHP adult cap 138% = $22,025; $21,800 is $225 under → eligible. ' +
    'SNAP ineligible both sides of this pair: 130% cap = $20,748. ' +
    'Lifeline: over the 135% standalone cap ($21,546) but qualifies via OHP/Medicaid enrollment — ' +
    'this coupling flips in cliff-ohp-over. Child/senior/veteran/homeowner programs ineligible.',
};
