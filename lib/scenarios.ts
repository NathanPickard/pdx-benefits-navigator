import type { IntakeData } from '@/types/program';

export const maria: IntakeData = {
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
};

export const james: IntakeData = {
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
};

export const rose: IntakeData = {
  household_size: 1,
  num_children: 0,
  children_ages: [],
  annual_income: 21600,
  zip_code: '97266',
  housing_status: 'own',
  has_disability: false,
  is_veteran: false,
  is_pregnant: false,
  has_senior_in_household: true,
  primary_language: 'vi',
  employment_status: 'retired',
  citizenship: 'citizen',
};

export const scenarios = { maria, james, rose };
