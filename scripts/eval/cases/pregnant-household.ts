import type { EvalCase } from '../types';

export const pregnantHousehold: EvalCase = {
  id: 'pregnant-household',
  title: 'Pregnant household of 2, no children yet, in Portland (97217) — the OHP pregnancy-path decisive case',
  intake: {
    household_size: 2,
    num_children: 0,
    children_ages: [],
    annual_income: 35000,
    zip_code: '97217',
    housing_status: 'rent',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: true,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'employed_ft',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'wic',                    // the point: $35,000 < $40,034 (185% FPL, hh2), pregnant
      'ohp',                    // pregnancy path: $35,000 < $41,116 (190% FPL, hh2) — the 138%
      // adult cap of $29,863 is EXCEEDED, but the pregnancy path is decisive
      'liheap-energy-trust',    // under $50,194 (60% SMI, hh2)
      'pdx-water-fa',           // Portland, under $61,620 (60% AMI, hh2)
      'transportation-wallet',  // Portland, under $43,280 (200% FPL, hh2)
      'inclusionary-housing',   // Portland renter, under $82,150 (80% AMI, hh2)
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: [
      'pge-iqbd',
      'nw-natural-bill-discount',
      'cep-weatherization',
      'advsd',
      'lifeline', // qualifies only via the "enrolled in qualifying program" path — prospective OHP eligibility vs actual enrollment is genuinely ambiguous
    ],
  },
  notes:
    'FPL hh2 = $21,640. The point: OHP is eligible not through the 138% adult cap ($29,863, which ' +
    '$35,000 exceeds) but through the pregnancy path at 190% FPL ($41,116) — the pregnancy status ' +
    'is decisive. WIC cap 185% FPL = $40,034, also satisfied via pregnancy. Lifeline standalone cap ' +
    '135% = $29,214 is exceeded, but OHP program-based enrollment qualifies it anyway. Ineligible: ' +
    'snap ($35,000 > $28,132, the 130% FPL cap), double-up-food-bucks (requires SNAP), erdc (no ' +
    'child under 13 yet — pregnancy alone does not satisfy it), school-meals (no enrolled child), ' +
    'sun-service-system and multco-preschool-for-all (no children), oregon-eitc ($35,000 > $30,000 ' +
    'earned-income cap), oregon-tanf (pregnancy qualifies categorically but income far exceeds the ' +
    'payment standard), pdx-renter-relocation and multco-eviction-prev (no triggering event), and ' +
    'veteran/senior programs (none apply). ' +
    'Lifeline moved to uncertain after eval run 1 (2026-09-14): the seed\'s program-based path says ENROLLED, not eligible-for — either verdict is defensible.',
};
