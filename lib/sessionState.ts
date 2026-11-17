/**
 * sessionStorage keys shared by the intake form, the demo loader and the
 * results page. Keep every key here so readers and writers can't drift apart.
 */
export const SESSION_KEYS = {
  /** The submitted (or autosaved) intake answers, as JSON. */
  intake: 'pdx_intake',
  /** A pre-baked demo analysis, as JSON. Set by /demo/[scenario]. */
  prebaked: 'pdx_prebaked',
  /** '1' when the results page should replay the pre-baked analysis as a stream. */
  demoSimulate: 'pdx_demo_simulate',
} as const;
