import type { EvalCase } from '../types';

export const unhoused: EvalCase = {
  id: 'unhoused',
  title: 'Unhoused single adult in downtown Portland (97204), deep poverty ($6,000)',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 6000,
    zip_code: '97204',
    housing_status: 'unhoused',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'unemployed',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'snap',                   // deep poverty, $6,000 far under $20,748 (130% FPL, hh1);
      // the ABAWD time-limit is a caveat on continued receipt, not initial ineligibility
      'double-up-food-bucks',   // rides on SNAP
      'ohp',                    // $6,000 < $22,025 (138% FPL, hh1)
      'transportation-wallet',  // under $31,920 (200% FPL, hh1)
      'lifeline',               // $6,000 < $21,546 (135% FPL, hh1)
      'trimet-low-income-fare', // under 200% FPL, adult 18-64
    ],
    uncertain: [
      'pdx-water-fa',           // assumes a utility account tied to a dwelling
      'liheap-energy-trust',    // assumes a utility account tied to a dwelling
      'pge-iqbd',               // assumes a utility account tied to a dwelling
      'nw-natural-bill-discount', // assumes a utility account tied to a dwelling
      'inclusionary-housing',   // not currently a renter, but IH waitlists are a plausible rehousing path
      'cep-weatherization',
      'advsd',
    ],
  },
  notes:
    'FPL hh1 = $15,960. Deep poverty at $6,000 clears every income cap with room to spare: SNAP ' +
    '130% cap = $20,748, OHP 138% cap = $22,025, transportation-wallet 200% cap = $31,920, Lifeline ' +
    '135% cap = $21,546. The point: housing_status "unhoused" makes utility-account-dependent ' +
    'programs (LIHEAP, PGE, NW Natural, Portland water) genuinely ambiguous rather than a clean yes ' +
    'or no, since none of them can attach to a dwelling that does not exist — hence uncertain, not ' +
    'ineligible. Ineligible: oregon-eitc (unemployed, no earned income), pdx-renter-relocation and ' +
    'multco-eviction-prev (not a renter, so no lease to trigger either program), all child programs ' +
    '(no children), oregon-tanf (no children, not pregnant), and veteran/senior programs (none apply).',
};
