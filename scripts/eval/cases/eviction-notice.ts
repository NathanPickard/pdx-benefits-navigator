import type { EvalCase } from '../types';

export const evictionNotice: EvalCase = {
  id: 'eviction-notice',
  title: 'Household of 3 with an eviction notice in Multnomah County (97216)',
  intake: {
    household_size: 3,
    num_children: 1,
    children_ages: [6],
    annual_income: 32000,
    zip_code: '97216',
    housing_status: 'rent',
    received_eviction_notice: true,
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
      'multco-eviction-prev',        // the point: Multnomah renter + eviction notice + $32,000 < $92,400 (80% AMI, hh3)
      'snap',                        // $32,000 < $35,516 (130% FPL, hh3)
      'double-up-food-bucks',        // rides on SNAP
      'ohp',                         // $32,000 < $37,702 (138% FPL, hh3)
      'erdc',                        // child 6 < 13, employed
      'school-meals',                // $32,000 < $50,542 (185% FPL, hh3)
      'liheap-energy-trust',         // under $62,005 (60% SMI, hh3)
      'pdx-water-fa',                // Portland, under $69,300 (60% AMI, hh3)
      'transportation-wallet',       // Portland, under $54,640 (200% FPL, hh3)
      'inclusionary-housing',        // Portland renter, under $92,400 (80% AMI, hh3)
      'sun-service-system',          // Multnomah, school-age child
      'lifeline',                    // $32,000 < $36,882 (135% FPL, hh3)
      'trimet-low-income-fare',      // under 200% FPL, adult 18-64
    ],
    uncertain: [
      'pdx-renter-relocation', // a no-cause termination WOULD trigger it, but the intake cannot
      // distinguish a no-cause eviction notice from a for-cause one
      'pge-iqbd',
      'nw-natural-bill-discount',
      'cep-weatherization',
      'advsd',
    ],
  },
  notes:
    'FPL hh3 = $27,320. The point: multco-eviction-prev is eligible because this household is a ' +
    'Multnomah County renter who received an eviction notice with income $32,000 under $92,400 ' +
    '(80% AMI, hh3). pdx-renter-relocation is deliberately marked uncertain, not eligible: a ' +
    'no-cause termination would trigger it, but received_eviction_notice: true alone cannot tell ' +
    'the model whether this is a no-cause or for-cause notice — no rent-increase field is set. ' +
    'SNAP cap 130% = $35,516. OHP adult cap 138% = $37,702. School-meals cap 185% = $50,542. ' +
    'Lifeline cap 135% = $36,882. Ineligible: oregon-eitc ($32,000 > $30,000 earned-income cap), ' +
    'WIC (child is 6, needs under 5), multco-preschool-for-all (child is 6, not 3-4), oregon-tanf ' +
    '(over the payment standard), and veteran/senior/homeowner programs (none apply).',
};
