import { analyzeEligibilityStream } from '../../lib/claudeBrowser';
import { ELIGIBILITY_MODEL } from '../../lib/eligibility';
import type { AnalysisOutput, IntakeData } from '../../types/program';

/**
 * Drains one analyzeEligibilityStream run with the runtime ELIGIBILITY_MODEL
 * and returns the final analysis. Calls `onProgress` for each streamed
 * program id. Throws on an error event or when no complete event arrives;
 * callers add their own label to the message.
 */
export async function collectAnalysis(
  apiKey: string,
  intake: IntakeData,
  onProgress?: (programId: string) => void,
): Promise<AnalysisOutput> {
  let output: AnalysisOutput | null = null;
  let errorMessage: string | null = null;

  for await (const event of analyzeEligibilityStream(apiKey, intake, ELIGIBILITY_MODEL)) {
    if (event.type === 'progress') {
      onProgress?.(event.programId);
    } else if (event.type === 'complete') {
      output = event.output;
    } else if (event.type === 'error') {
      errorMessage = event.message;
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!output) throw new Error('no complete event received');
  return output;
}
