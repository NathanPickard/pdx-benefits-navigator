import type { EvalCase } from '../types';

export const zipGresham: EvalCase = {
  id: 'zip-gresham',
  title: 'Household of 4 in Gresham (97030), $40,000 income, 12% rent increase — Portland-only bait',
  intake: {
    household_size: 4,
    num_children: 2,
    children_ages: [4, 7],
    annual_income: 40000,
    zip_code: '97030',
    housing_status: 'rent',
    recent_rent_increase_pct: 12,
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
      'snap',                        // $40,000 < $42,900 (130% FPL, hh4)
      'double-up-food-bucks',        // rides on SNAP
      'ohp',                         // $40,000 < $45,540 (138% FPL, hh4)
      'erdc',                        // kids under 13, employed, under 200% FPL
      'wic',                         // child age 4 is under 5, $40,000 < $61,050 (185% FPL, hh4)
      'school-meals',                // school-age children, under 185% FPL
      'liheap-energy-trust',         // under $73,816 (60% SMI, hh4)
      'sun-service-system',          // Multnomah County resident (Gresham is in-county)
      'multco-preschool-for-all',    // child is 4
      'lifeline',                    // $40,000 < $44,550 (135% FPL, hh4)
      'trimet-low-income-fare',      // under 200% FPL, adult 18-64
    ],
    uncertain: ['pge-iqbd', 'nw-natural-bill-discount', 'advsd'],
  },
  notes:
    '97030 is Gresham — inside Multnomah County but OUTSIDE Portland city limits (not in the ' +
    "prompt's Portland ZIP list). The 12% rent increase is deliberate bait for jurisdiction " +
    'discipline: a no-cause-termination rent hike over 10% only triggers pdx-renter-relocation ' +
    'for a unit inside the City of Portland, and 97030 is not. FPL hh4 = $33,000. SNAP cap 130% = ' +
    '$42,900 ($40,000 is under). OHP adult cap 138% = $45,540. WIC/school-meals cap 185% = $61,050. ' +
    'Lifeline cap 135% = $44,550. Expected-INELIGIBLE despite the bait: pdx-renter-relocation ' +
    '(right jurisdiction test, wrong city), pdx-water-fa, cep-weatherization, transportation-wallet, ' +
    'inclusionary-housing — all four are Portland-only and Gresham does not qualify. Also ineligible: ' +
    'oregon-eitc ($40,000 > $30,000 earned-income cap), multco-eviction-prev (no eviction notice), ' +
    'oregon-tanf (income far over the payment standard), and all veteran/senior programs (none apply).',
};
