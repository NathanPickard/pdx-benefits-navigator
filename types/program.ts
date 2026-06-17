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

  /**
   * Optional verified benefit schedule extracted from official sources.
   * Present when a page publishes amounts as a table (by household size,
   * by tier, by location) or a small set of discrete amounts. When present,
   * this is the authoritative ground truth — the seed-derived
   * estimated_annual_value range is a coarser hint that should be used as
   * fallback only.
   */
  benefit_schedule?: {
    description: string;
    unit: 'usd_monthly' | 'usd_annual' | 'usd_one_time' | 'percent_discount';
    amounts: Array<{ condition: string; value: number }>;
  };

  eligibility: {
    income_max_pct_fpl?: number;
    /**
     * Income-ceiling basis when the program does NOT use the federal poverty level.
     *   'smi' = Oregon 60% State Median Income (LIHEAP + OPUC utility bill discounts)
     *   'ami' = Portland-area HUD Area/Median Family Income (housing, weatherization)
     * Absent ⇒ FPL: use income_max_pct_fpl. When set, use income_max_pct against the
     * matching SMI/AMI table in the eligibility system prompt. These scales run 3-5x
     * higher than FPL, so never store an SMI/AMI percentage in income_max_pct_fpl.
     */
    income_basis?: 'fpl' | 'smi' | 'ami';
    /** Income ceiling as a percent of `income_basis` (used when income_basis is 'smi' or 'ami'). */
    income_max_pct?: number;
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
  /**
   * Additional source URLs the scraper should consult alongside application_url.
   * Used when key data (e.g., federal benefit tables) lives on a separate page
   * from the program's application/info page.
   */
  info_urls?: string[];
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

export type RequirementKey =
  | 'income'
  | 'residency'
  | 'citizenship'
  | 'household'
  | 'age'
  | 'status'      // disability / veteran / senior / pregnancy
  | 'event'       // eviction / rent-increase / job-loss / new-baby
  | 'enrollment'; // categorical eligibility via another program

export interface EligibilityRequirement {
  key: RequirementKey;
  met: 'yes' | 'no' | 'unknown';
  detail: string; // plain-language, e.g. "Income $48,000 is under the $66,000 limit for a household of 4"
}

export interface MatchResult {
  program_id: string;
  eligible: boolean;
  confidence: 'high' | 'medium' | 'low';
  estimated_annual_value: number;
  reasoning: string;
  requirements?: EligibilityRequirement[];
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
