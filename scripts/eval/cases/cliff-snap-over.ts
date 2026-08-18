import type { EvalCase } from '../types';

export const cliffSnapOver: EvalCase = {
  id: 'cliff-snap-over',
  title: 'Household of 3 at $36,000 — $484 OVER the SNAP 130% FPL cap ($35,516)',
  intake: {
    household_size: 3,
    num_children: 1,
    children_ages: [9],
    annual_income: 36000,
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
      'ohp',                    // 131.8% < 138% adult cap
      'erdc',                   // child 9 < 13, employed, under 200% FPL
      'school-meals',           // under 185% FPL, school-age child
      'liheap-energy-trust',    // under $62,005 (60% SMI, hh3)
      'pdx-water-fa',           // Portland, under $69,300 (60% AMI, hh3)
      'transportation-wallet',  // Portland, under 200% FPL
      'inclusionary-housing',   // Portland renter, under $92,400 (80% AMI, hh3)
      'sun-service-system',     // Multnomah, school-age child
      'lifeline',               // $36,000 < $36,882 (135% FPL, hh3)
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization', 'advsd'],
  },
  notes:
    'FPL hh3 = $27,320. SNAP cap 130% = $35,516; income $36,000 is $484 over → ineligible, and Double Up falls with it (requires SNAP). All other verdicts identical to cliff-snap-under: OHP (131.8% < 138%), ERDC, school meals, LIHEAP, Water Bureau, Transportation Wallet, Inclusionary Housing, SUN, Lifeline ($36,000 < $36,882), TriMet. Probes the over side of the same threshold.',
};
