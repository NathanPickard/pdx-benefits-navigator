export interface Program {
  id: string;
  name: string;
  short_name: string;
  category:
    | 'food'
    | 'healthcare'
    | 'housing'
    | 'utility'
    | 'childcare'
    | 'education'
    | 'tax'
    | 'transportation'
    | 'cash'
    | 'connectivity';
  jurisdiction: 'federal' | 'oregon' | 'multnomah' | 'portland';
  hidden_gem: boolean;
  urgency: 'standard' | 'time_sensitive' | 'event_triggered';
  description: string;
  legal_basis?: string;

  estimated_annual_value: {
    min: number;
    max: number;
    median: number;
  };

  eligibility: {
    income_max_pct_fpl?: number;
    income_max_annual?: number;
    household_size_min?: number;
    household_size_max?: number;
    age_min?: number;
    age_max?: number;
    must_be_renter?: boolean;
    must_be_homeowner?: boolean;
    must_have_children_under?: number;
    must_be_pregnant?: boolean;
    must_be_disabled?: boolean;
    must_be_veteran?: boolean;
    must_be_senior?: boolean;
    must_reside_in?: ('portland' | 'multnomah' | 'oregon')[];
    citizenship_status?: 'citizen' | 'lpr_or_citizen' | 'any';
    employment_required?: boolean;
    triggered_by_event?:
      | 'eviction_notice'
      | 'rent_increase_10pct'
      | 'disaster'
      | 'job_loss'
      | 'new_baby';
    other_requirements?: string[];
  };

  application_url: string;
  application_method: 'online' | 'phone' | 'in_person' | 'mail';
  documents_required: string[];
  processing_time: string;
  renewal_cycle?: string;
  contact_phone?: string;
  contact_org?: string;
}

export interface IntakeData {
  household_size: number;
  num_children: number;
  children_ages: number[];
  annual_income: number;
  zip_code: string;
  housing_status: 'rent' | 'own' | 'unhoused' | 'staying_with_others';
  recent_rent_increase_pct?: number;
  received_eviction_notice?: boolean;
  has_disability: boolean;
  is_veteran: boolean;
  is_pregnant: boolean;
  has_senior_in_household: boolean;
  primary_language: 'en' | 'es' | 'vi' | 'ru' | 'zh' | 'so' | 'ar';
  employment_status:
    | 'employed_ft'
    | 'employed_pt'
    | 'self_employed'
    | 'unemployed'
    | 'retired'
    | 'disabled';
  citizenship: 'citizen' | 'lpr' | 'other' | 'prefer_not_say';
}

export interface MatchResult {
  program_id: string;
  eligible: boolean;
  confidence: 'high' | 'medium' | 'low';
  estimated_annual_value: number;
  reasoning: string;
  next_steps: string[];
  required_documents: string[];
  application_deadline?: string;
  urgency_note?: string;
}

export interface AnalysisOutput {
  matches: MatchResult[];
  total_estimated_annual_value: number;
  federal_only_value: number;
  pdx_specific_value: number;
  priority_application_order: string[];
  warnings: string[];
  caseworker_notes?: string;
}
