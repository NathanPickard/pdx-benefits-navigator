export type LanguageCode = 'en' | 'es' | 'vi';

export const LANGUAGES: { code: LanguageCode; short: string; label: string }[] = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'es', short: 'ES', label: 'Español' },
  { code: 'vi', short: 'VI', label: 'Tiếng Việt' },
];

export interface Chrome {
  resultsKicker: string;
  perYear: string;
  howWeCompare: string;
  mostToolsOnly: string;
  federalStateBarLabel: string;
  pdxNavigatorBarLabel: string;
  youdMiss: string;
  readFirst: string;
  programsCountTemplate: string; // "{count} programs you qualify for"
  sortNote: string;
  hiddenGem: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  estimatedYear: string;
  whyYouQualify: string;
  nextSteps: string;
  whatToBring: string;
  applyNow: string;
  jurisdictionFederal: string;
  jurisdictionOregon: string;
  jurisdictionMultnomah: string;
  jurisdictionPortland: string;
  translatedByAI: string;
  translating: string;
  disclaimer: string;
  downloadPacket: string;
  buildingPacket: string;
  exportCalendar: string;
  renewalCalendarTitle: string;
  renewalCalendarSubtitle: string;
  renewalUpcoming: string;
  renewalLater: string;
  renewalNoneLabel: string;
  urgencyEvictionTitle: string;
  urgencyEvictionBody: string;
  urgencyRentIncreaseTitle: string;
  urgencyRentIncreaseBodyTemplate: string; // contains "{pct}"
  // Status control (BenefitCard)
  statusNotStarted: string;
  statusInProgress: string;
  statusApplied: string;
  myStatus: string;
  // Progress bar
  applicationProgress: string;
  appliedOfTotalTemplate: string; // contains "{applied}" and "{total}"
  // Share / action buttons
  copySummary: string;
  print: string;
  // Application-status metadata row
  savedOnDevice: string;
  clearProgress: string;
  // Filter chips
  filterCategory: string;
  filterJurisdiction: string;
  filterAll: string;
  showingNofMTemplate: string; // contains "{shown}" and "{total}"
  noFilterMatch: string;
  clearFilters: string;
  // Copy-summary toast messages
  copySummarySuccess: string;
  copySummaryFallback: string;
}

export const CHROME_EN: Chrome = {
  resultsKicker: 'We found benefits you qualify for',
  perYear: '/ year',
  howWeCompare: 'How we compare',
  mostToolsOnly: 'Most benefits tools only check federal & state programs.',
  federalStateBarLabel: 'Federal & state tools',
  pdxNavigatorBarLabel: 'PDX Benefits Navigator',
  youdMiss: "you'd otherwise miss",
  readFirst: 'Read these first',
  programsCountTemplate: '{count} programs you qualify for',
  sortNote: 'Sorted by hidden gems, then value',
  hiddenGem: 'Hidden gem',
  confidenceHigh: 'High confidence',
  confidenceMedium: 'Worth checking',
  confidenceLow: 'Edge case',
  estimatedYear: 'estimated / year',
  whyYouQualify: 'Why you qualify',
  nextSteps: 'Next steps',
  whatToBring: 'What to bring',
  applyNow: 'Apply now',
  jurisdictionFederal: 'Federal',
  jurisdictionOregon: 'State of Oregon',
  jurisdictionMultnomah: 'Multnomah County',
  jurisdictionPortland: 'City of Portland',
  translatedByAI: 'Translated by AI',
  translating: 'Translating…',
  disclaimer:
    'Estimates only — not legal advice. Confirm eligibility with each program. We never store your answers; everything runs in this browser session.',
  downloadPacket: 'Download packet (PDF)',
  buildingPacket: 'Building packet…',
  exportCalendar: 'Export to calendar (.ics)',
  renewalCalendarTitle: 'Renewal calendar',
  renewalCalendarSubtitle:
    'When each benefit needs to be renewed so you never lose coverage.',
  renewalUpcoming: 'Next 6 months',
  renewalLater: 'Later this year',
  renewalNoneLabel: 'No renewals required',
  urgencyEvictionTitle: 'Apply today — your eviction can likely be stopped',
  urgencyEvictionBody:
    'Multnomah Eviction Prevention funds emergency rent help, and many Oregon eviction notices have procedural defects that void them. Call 503-988-3646 today — earlier calls have better odds. Start with the program below.',
  urgencyRentIncreaseTitle: 'Apply within 45 days',
  urgencyRentIncreaseBodyTemplate:
    'Your rent went up {pct}% in the past year. Under Portland City Code 30.01.085, your landlord owes you $2,900–$4,500 in Renter Relocation Assistance — but you have only 45 days from the rent-increase notice to send a written demand.',
  // Status control (BenefitCard)
  statusNotStarted: 'Not started',
  statusInProgress: 'In progress',
  statusApplied: 'Applied',
  myStatus: 'My status',
  // Progress bar
  applicationProgress: 'Application progress',
  appliedOfTotalTemplate: '{applied} of {total} applied', // interpolate {applied} and {total}
  // Share / action buttons
  copySummary: 'Copy summary',
  print: 'Print',
  // Application-status metadata row
  savedOnDevice: 'Saved only on this device',
  clearProgress: 'Clear my saved progress',
  // Filter chips
  filterCategory: 'Category',
  filterJurisdiction: 'Jurisdiction',
  filterAll: 'All',
  showingNofMTemplate: 'Showing {shown} of {total}', // interpolate {shown} and {total}
  noFilterMatch: 'No programs match this filter.',
  clearFilters: 'Clear filters',
  // Copy-summary toast messages
  copySummarySuccess: 'Summary copied to clipboard',
  copySummaryFallback: 'Copy not supported — use the PDF instead',
};
