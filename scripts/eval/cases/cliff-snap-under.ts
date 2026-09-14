import type { EvalCase } from '../types';

export const cliffSnapUnder: EvalCase = {
  id: 'cliff-snap-under',
  title: 'Household of 3 at $35,000 — $516 UNDER the SNAP 130% FPL cap ($35,516)',
  intake: {
    household_size: 3,
    num_children: 1,
    children_ages: [9],
    annual_income: 35000,
    zip_code: '97206',
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
      'snap',                   // 128.1% < 130% — the case's point
      'double-up-food-bucks',   // rides on SNAP
      'ohp',                    // 128.1% < 138% adult cap
      'erdc',                   // child 9 < 13, employed, under 200% FPL
      'school-meals',           // under 185% FPL, school-age child
      'liheap-energy-trust',    // under $62,005 (60% SMI, hh3)
      'pdx-water-fa',           // Portland, under $69,300 (60% AMI, hh3)
      'transportation-wallet',  // Portland, under 200% FPL
      'inclusionary-housing',   // Portland renter, under $92,400 (80% AMI, hh3)
      'sun-service-system',     // Multnomah, school-age child
      'lifeline',               // $35,000 < $36,882 (135% FPL, hh3)
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization', 'advsd'],
    confidence: { snap: ['high', 'medium'] },
  },
  notes:
    'FPL hh3 = $27,320. SNAP cap 130% = $35,516; income $35,000 is $516 under → eligible. ' +
    'Probes threshold arithmetic on the under side; pair with cliff-snap-over. ' +
    'Ineligible: WIC (child is 9, needs under 5), EITC ($35,000 > $30,000), TANF (over payment standard), ' +
    'Preschool for All (child not 3-4), renter relocation (no trigger), eviction prevention (no notice), ' +
    'veteran/senior/homeowner programs (none apply).',
};
