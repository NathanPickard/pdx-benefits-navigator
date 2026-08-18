import type { EvalCase } from '../types';

export const rose: EvalCase = {
  id: 'rose',
  title: 'Senior widow on Social Security ($21,600), owns home in Lents (97266)',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 21600,
    zip_code: '97266',
    housing_status: 'own',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: true,
    primary_language: 'vi',
    employment_status: 'retired',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'ohp',                      // $21,600 < $22,025 (138% FPL adult) — barely under
      'pdx-water-fa',             // Portland homeowner, under $53,940
      'liheap-energy-trust',      // under $38,384 (60% SMI, hh1)
      'cep-weatherization',       // Portland owner-occupant, senior (55+), under 80% AMI
      'senior-prop-tax-deferral', // 62+, homeowner, income < $70k
      'transportation-wallet',    // Portland, 135.3% < 200% FPL
      'advsd',                    // 60+ = ADRC priority group
      'lifeline',                 // over 135% standalone but OHP enrollment qualifies
    ],
    uncertain: [
      'pge-iqbd',
      'nw-natural-bill-discount',
      'trimet-low-income-fare',   // seed caps at age 64; seniors 65+ qualify via a separate honored-citizen path
    ],
  },
  notes:
    'FPL hh1 = $15,960 → $21,600 = 135.3%. SNAP ineligible: 130% cap = $20,748, over by $852. ' +
    'OHP eligible by $425 (138% adult cap = $22,025) — a real boundary the model must get right. ' +
    'Lifeline: standalone 135% cap = $21,546 (over by $54), but OHP/Medicaid enrollment satisfies the program-based path. ' +
    'Double Up ineligible: requires SNAP. Renter-only and child programs ineligible (homeowner, no children). ' +
    'Oregon EITC ineligible: retired, no earned income.',
};
