import type { AnalysisOutput, EligibilityRequirement, MatchResult } from '@/types/program';

// The translation model sees the whole AnalysisOutput, so it can drift totals,
// flip `eligible`, or rename program ids. Start from the English analysis and
// copy over only the human-readable strings, so numbers, eligibility and ids
// always match what the English view shows.

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function sameLengthStringsOr(value: unknown, fallback: string[]): string[] {
  return isStringArray(value) && value.length === fallback.length ? value : fallback;
}

function mergeRequirements(
  original: EligibilityRequirement[],
  translated: unknown
): EligibilityRequirement[] {
  if (!Array.isArray(translated)) return original;
  return original.map((req, i) => {
    const candidate: unknown = translated[i];
    if (!isRecord(candidate) || candidate.key !== req.key) return req;
    return { ...req, detail: stringOr(candidate.detail, req.detail) };
  });
}

function mergeMatch(original: MatchResult, translated: UnknownRecord | undefined): MatchResult {
  if (!translated) return original;
  const urgencyNote =
    typeof original.urgency_note === 'string'
      ? stringOr(translated.urgency_note, original.urgency_note)
      : original.urgency_note;
  return {
    ...original,
    reasoning: stringOr(translated.reasoning, original.reasoning),
    urgency_note: urgencyNote,
    next_steps: sameLengthStringsOr(translated.next_steps, original.next_steps),
    required_documents: sameLengthStringsOr(
      translated.required_documents,
      original.required_documents
    ),
    requirements: original.requirements
      ? mergeRequirements(original.requirements, translated.requirements)
      : original.requirements,
  };
}

function translatedMatchesById(translated: UnknownRecord): Map<string, UnknownRecord> {
  const matches = Array.isArray(translated.matches) ? translated.matches : [];
  return new Map(
    matches
      .filter(isRecord)
      .filter((m): m is UnknownRecord & { program_id: string } => typeof m.program_id === 'string')
      .map((m) => [m.program_id, m])
  );
}

export function mergeTranslatedStrings(
  original: AnalysisOutput,
  translated: unknown
): AnalysisOutput {
  if (!isRecord(translated)) return original;
  const byId = translatedMatchesById(translated);
  const caseworkerNotes =
    typeof original.caseworker_notes === 'string'
      ? stringOr(translated.caseworker_notes, original.caseworker_notes)
      : original.caseworker_notes;
  return {
    ...original,
    matches: original.matches.map((m) => mergeMatch(m, byId.get(m.program_id))),
    warnings: isStringArray(translated.warnings) ? translated.warnings : original.warnings,
    caseworker_notes: caseworkerNotes,
  };
}
