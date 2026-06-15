/**
 * POST-220 — Re-certification after 220-task program closure (cycle 217+).
 */

export const POST_220_VERIFICATION_POLICY_ID = "post-220-program-verify-v1" as const;

export const POST_220_VERIFICATION_SUMMARY_ARTIFACT =
  "artifacts/post-220-verification-summary.json" as const;

export const POST_220_VERIFICATION_RUNNER_SCRIPT =
  "scripts/ops/run-post-220-verification.ts" as const;

export const POST_220_VERIFICATION_VITEST_SPEC =
  "tests/unit/post-220-verification.test.ts" as const;
