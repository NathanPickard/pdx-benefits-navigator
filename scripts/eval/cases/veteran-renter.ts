import type { EvalCase } from '../types';

export const veteranRenter: EvalCase = {
  id: 'veteran-renter',
  title: 'Veteran renter, no disability, in Portland (97209) — the property-tax-exemption trap',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 18000,
    zip_code: '97209',
    housing_status: 'rent',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: true,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'en',
    employment_status: 'employed_pt',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'snap',                        // $18,000 < $20,748 (130% FPL, hh1)
      'double-up-food-bucks',        // rides on SNAP
      'ohp',                         // $18,000 < $22,025 (138% FPL, hh1)
      'oregon-eitc',                 // $18,000 < $30,000, employed
      'liheap-energy-trust',         // under $38,384 (60% SMI, hh1)
      'pdx-water-fa',                // Portland renter, under $53,940 (60% AMI, hh1)
      'transportation-wallet',       // Portland, under $31,920 (200% FPL, hh1)
      'inclusionary-housing',        // Portland renter, under $71,900 (80% AMI, hh1)
      'advsd',                       // veterans are a named ADRC priority group
      'lifeline',                    // $18,000 < $21,546 (135% FPL, hh1)
      'trimet-low-income-fare',      // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'cep-weatherization'],
  },
  notes:
    'The trap: veterans-prop-tax-exempt is ineligible even though is_veteran is true, because the ' +
    'program requires OWNING a home AND a service-connected disability — this household rents ' +
    '(housing_status) and has no disability (has_disability: false). senior-prop-tax-deferral is ' +
    'also ineligible: renter, no disability, no senior in household. FPL hh1 = $15,960. SNAP cap ' +
    '130% = $20,748. OHP adult cap 138% = $22,025. EITC cap $30,000 earned income. Lifeline cap ' +
    '135% = $21,546. advsd is eligible on veteran status alone, independent of the property-tax ' +
    'trap. Also ineligible: pdx-renter-relocation (no rent-increase/no-cause trigger), ' +
    'multco-eviction-prev (no eviction notice), all child programs (no children), and oregon-tanf ' +
    '(no children, not pregnant).',
};
