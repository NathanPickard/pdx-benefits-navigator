import type { EvalCase } from '../types';

export const seniorRenter: EvalCase = {
  id: 'senior-renter',
  title: 'Senior renter in Portland (97211), retired, $19,000 — the homeowner-only deferral trap',
  intake: {
    household_size: 1,
    num_children: 0,
    children_ages: [],
    annual_income: 19000,
    zip_code: '97211',
    housing_status: 'rent',
    received_eviction_notice: false,
    has_disability: false,
    is_veteran: false,
    is_pregnant: false,
    has_senior_in_household: true,
    primary_language: 'en',
    employment_status: 'retired',
    citizenship: 'citizen',
  },
  expected: {
    eligible: [
      'snap',                        // $19,000 < $20,748 (130% FPL, hh1); retiree, no ABAWD issue
      'double-up-food-bucks',        // rides on SNAP
      'ohp',                         // $19,000 < $22,025 (138% FPL, hh1)
      'liheap-energy-trust',         // under $38,384 (60% SMI, hh1)
      'pdx-water-fa',                // Portland, renter path with landlord verification
      'transportation-wallet',       // Portland, under $31,920 (200% FPL, hh1)
      'inclusionary-housing',        // Portland renter, under $71,900 (80% AMI, hh1)
      'advsd',                       // 60+ is an ADRC priority group
      'lifeline',                    // $19,000 < $21,546 (135% FPL, hh1)
    ],
    uncertain: [
      'pge-iqbd',
      'nw-natural-bill-discount',
      'cep-weatherization',    // renter — the flagship weatherization service is owner-occupant only,
      // but other PCEF-funded services vary by unit type
      'trimet-low-income-fare', // 65+ qualifies via the separate honored-citizen path even without an age field
    ],
  },
  notes:
    'The trap: senior-prop-tax-deferral is ineligible even though age and income both qualify, ' +
    'because the program requires HOMEOWNERSHIP and this household rents (housing_status: "rent"). ' +
    'FPL hh1 = $15,960. SNAP cap 130% = $20,748. OHP adult cap 138% = $22,025. Lifeline cap 135% = ' +
    '$21,546. advsd is eligible on has_senior_in_household alone, independent of the deferral trap. ' +
    'Also ineligible: oregon-eitc (retired, no earned income), pdx-renter-relocation and ' +
    'multco-eviction-prev (no triggering event), all child programs (no children), ' +
    'veterans-prop-tax-exempt (not a veteran), and oregon-tanf (no children, not pregnant).',
};
