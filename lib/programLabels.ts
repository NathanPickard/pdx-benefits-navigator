import type { Program } from '@/types/program';

/** Display label for each program category, shared by result cards and filter chips. */
export const CATEGORY_LABEL: Record<Program['category'], string> = {
  food: 'Food',
  healthcare: 'Healthcare',
  housing: 'Housing',
  utility: 'Utility',
  childcare: 'Childcare',
  education: 'Education',
  tax: 'Tax',
  transportation: 'Transportation',
  cash: 'Cash',
  connectivity: 'Connectivity',
};
