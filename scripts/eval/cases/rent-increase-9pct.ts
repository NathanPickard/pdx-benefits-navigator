import type { EvalCase } from '../types';

export const rentIncrease9Pct: EvalCase = {
  id: 'rent-increase-9pct',
  title: 'Household of 2 in Portland (97202), 9% rent increase — 1 point under the 10% trigger',
  intake: {
    household_size: 2,
    num_children: 1,
    children_ages: [10],
    annual_income: 26000,
    zip_code: '97202',
    housing_status: 'rent',
    recent_rent_increase_pct: 9,
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'employed_pt',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'snap',                        // $26,000 < $28,132 (130% FPL, hh2)
      'double-up-food-bucks',        // rides on SNAP
      'ohp',                         // $26,000 < $29,863 (138% FPL, hh2)
      'erdc',                        // child 10 < 13, employed
      'oregon-eitc',                 // $26,000 < $30,000, employed
      'school-meals',                // $26,000 < $40,034 (185% FPL, hh2)
      'liheap-energy-trust',         // under $50,194 (60% SMI, hh2)
      'pdx-water-fa',                // Portland, under $61,620 (60% AMI, hh2)
      'transportation-wallet',       // Portland, under $43,280 (200% FPL, hh2)
      'inclusionary-housing',        // Portland renter, under $82,150 (80% AMI, hh2)
      'sun-service-system',          // Multnomah, school-age child
      'lifeline',                    // $26,000 < $29,214 (135% FPL, hh2)
      'trimet-low-income-fare',      // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization', 'advsd'],
  },
  notes:
    'FPL hh2 = $21,640. The point: pdx-renter-relocation is ineligible because a 9% rent increase ' +
    "is 1 point under the program's 10% no-cause-termination trigger — even though the household " +
    'is a Portland renter and income is well within range for everything else. SNAP cap 130% = ' +
    '$28,132. OHP adult cap 138% = $29,863. EITC cap $30,000 earned income. School-meals cap 185% ' +
    '= $40,034. Lifeline cap 135% = $29,214. Also ineligible: WIC (child is 10, needs under 5), ' +
    'multco-preschool-for-all (child is 10, not 3-4), multco-eviction-prev (no eviction notice), ' +
    'oregon-tanf (over the payment standard), and veteran/senior/homeowner programs (none apply).',
};
