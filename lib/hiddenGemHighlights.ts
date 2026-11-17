import type { Program } from '@/types/program';

/**
 * Hand-written marketing copy for the hidden-gem programs shown on the landing
 * and about pages. The value strings are literal (they include phrasing like
 * "up to" and "/ yr"), so lib/__tests__/hiddenGemHighlights.test.ts checks that
 * every `$` figure equals the program's min, max or median in programs.json.
 */
export interface HiddenGemHighlight {
  programId: string;
  name: string;
  value: string;
  jurisdiction: Program['jurisdiction'];
  blurb: string;
}

export interface MarqueeItem {
  programId: string;
  name: string;
  value: string;
}

export const HIDDEN_GEM_HIGHLIGHTS: readonly HiddenGemHighlight[] = [
  {
    programId: 'pdx-renter-relocation',
    name: 'Portland Renter Relocation',
    value: '$2,900 – $4,500',
    jurisdiction: 'portland',
    blurb:
      'When your rent goes up more than 10% in a year, your landlord owes you a lump sum.',
  },
  {
    programId: 'cep-weatherization',
    name: 'CEP Home Weatherization',
    value: 'up to $15,000',
    jurisdiction: 'portland',
    blurb:
      "Free weatherization, heat pumps, and home repairs, funded by Portland's clean energy tax on large retailers.",
  },
  {
    programId: 'sun-service-system',
    name: 'SUN Service System',
    value: '$1,000 – $6,000',
    jurisdiction: 'multnomah',
    blurb:
      'After-school, family meals, mental health, and basic-needs case management.',
  },
  {
    programId: 'multco-eviction-prev',
    name: 'Multnomah Eviction Prevention',
    value: 'up to $5,000',
    jurisdiction: 'multnomah',
    blurb: 'Emergency rent paid directly to landlords — within days.',
  },
  {
    programId: 'pdx-water-fa',
    name: 'Water Bureau Discount',
    value: '80% off bill',
    jurisdiction: 'portland',
    blurb:
      'Up to 80% off water + sewer for households under 60% State Median Income.',
  },
  {
    programId: 'transportation-wallet',
    name: 'Transportation Wallet',
    value: '$100 – $308 / yr',
    jurisdiction: 'portland',
    blurb:
      'TriMet, BIKETOWN, and parking credits for income-qualified residents.',
  },
];

/** Landing-page marquee: one headline figure per program. */
export const MARQUEE_ITEMS: readonly MarqueeItem[] = [
  { programId: 'pdx-renter-relocation', name: 'Portland Renter Relocation', value: '$4,500' },
  { programId: 'cep-weatherization', name: 'CEP Home Weatherization', value: 'up to $15,000' },
  { programId: 'sun-service-system', name: 'SUN Service System', value: '$3,000' },
  { programId: 'multco-eviction-prev', name: 'Multnomah Eviction Prevention', value: '$2,000' },
  { programId: 'pdx-water-fa', name: 'Water Bureau Discount', value: '80% off' },
  { programId: 'transportation-wallet', name: 'Transportation Wallet', value: '$308 / yr' },
  { programId: 'inclusionary-housing', name: 'Inclusionary Housing', value: '$9,000 / yr' },
];
