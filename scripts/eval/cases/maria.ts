import type { EvalCase } from '../types';

export const maria: EvalCase = {
  id: 'maria',
  title: 'Single parent of 2 in Cully (97218), renter, 12% rent increase, LPR',
  intake: {
    household_size: 4,
    num_children: 2,
    children_ages: [5, 8],
    annual_income: 48000,
    zip_code: '97218',
    housing_status: 'rent',
    recent_rent_increase_pct: 12,
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: false,
    primary_language: 'es',
    employment_status: 'employed_pt',
    citizenship: 'lpr',
  },
  expected: {
    eligible: [
      'ohp',                    // children eligible to 305% FPL (145.5% < 305)
      'pdx-renter-relocation',  // Portland renter, 12% > 10% trigger
      'erdc',                   // 145.5% < 200% FPL, kids under 13, employed
      'liheap-energy-trust',    // $48,000 < $73,816 (60% SMI, hh4)
      'pdx-water-fa',           // Portland, $48,000 < $76,980 (60% AMI, hh4)
      'school-meals',           // 145.5% < 185% FPL, school-age kids
      'transportation-wallet',  // Portland, 145.5% < 200% FPL
      'inclusionary-housing',   // Portland renter, $48,000 < $102,650 (80% AMI, hh4)
      'sun-service-system',     // Multnomah, school-age kids
      'trimet-low-income-fare', // Multnomah, 145.5% < 200% FPL, adult 18-64
    ],
    uncertain: [
      'pge-iqbd',                 // income under 60% SMI but PGE customership unknowable from intake
      'nw-natural-bill-discount', // same — NW Natural customership unknown
      'cep-weatherization',       // renter: flagship needs owner-occupant 55+/disabled; other PCEF services vary
      'advsd',                    // ADRC helpline open to all, but no 60+/disability/veteran priority in household
      'lifeline', // qualifies only via the "enrolled in qualifying program" path — prospective OHP eligibility vs actual enrollment is genuinely ambiguous
    ],
    confidence: {
      'pdx-renter-relocation': ['high'],  // trigger facts are explicit in intake
      'school-meals': ['high'],
    },
  },
  notes:
    'FPL hh4 = $33,000 → $48,000 = 145.5%. SNAP ineligible (130% cap = $42,900). ' +
    'WIC ineligible: youngest child is 5 (needs under 5) and not pregnant. ' +
    'Oregon EITC ineligible: $48,000 > $30,000 cap. TANF ineligible: far over payment standard. ' +
    'Preschool for All ineligible: kids 5 and 8 (needs age 3-4). Double Up ineligible: requires SNAP. ' +
    'Veterans exemption / senior deferral ineligible: not veteran, no senior, renter. ' +
    'Eviction prevention ineligible: no eviction notice. Renter Relocation: PCC 30.01.085, >10% increase. ' +
    'Lifeline moved to uncertain after eval run 1 (2026-09-14): the seed\'s program-based path says ENROLLED, not eligible-for — either verdict is defensible.',
};
