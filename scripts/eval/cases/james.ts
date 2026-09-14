import type { EvalCase } from '../types';

export const james: EvalCase = {
  id: 'james',
  title: 'Disabled veteran, unemployed, $0 income, owns home in St. Johns (97203)',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 0,
    zip_code: '97203',
    housing_status: 'own',
    received_eviction_notice: false,
    has_disability: true,
    is_veteran: true,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'unemployed',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'snap',                     // $0 < 130% FPL; disability exempts from ABAWD limit
      'ohp',                      // $0 < 138% FPL adult
      'pdx-water-fa',             // Portland homeowner/account holder, $0 < $53,940
      'liheap-energy-trust',      // $0 < $38,384 (60% SMI, hh1)
      'cep-weatherization',       // Portland owner-occupant WITH disability, under 80% AMI
      'senior-prop-tax-deferral', // rule is 62+ OR qualifying disability; homeowner; income < $70k
      'transportation-wallet',    // Portland, under 200% FPL
      'advsd',                    // adult with disability + veteran = ADRC priority groups
      'veterans-prop-tax-exempt', // veteran + homeowner + disability
      'lifeline',                 // $0 < 135% FPL
      'trimet-low-income-fare',   // Multnomah, under 200% FPL
      'double-up-food-bucks',     // SNAP-eligible household
    ],
    uncertain: [
      'pge-iqbd',                 // utility customership unknowable from intake
      'nw-natural-bill-discount',
    ],
    confidence: {
      'veterans-prop-tax-exempt': ['high', 'medium'], // service-connected rating not directly asked
    },
  },
  notes:
    'FPL hh1 = $15,960 → $0 income is under every income ceiling. ' +
    'Senior deferral: ORS 311.668 allows EITHER age 62+ OR qualifying disability — james qualifies via disability. ' +
    'Renter-only programs (renter relocation, eviction prevention, inclusionary housing) ineligible: homeowner. ' +
    'Child programs (WIC, school meals, SUN, ERDC, Preschool for All, TANF) ineligible: no children, not pregnant. ' +
    'Oregon EITC ineligible: no earned income (unemployed).',
};
