/**
 * FINAL-17 — Webhook signature matrix policy constants (task-211).
 */

export const WEBHOOK_SIGNATURE_MATRIX_POLICY_ID = "final-17-webhook-signature-v1" as const;

export const WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT =
  "artifacts/webhook-signature-matrix-summary.json" as const;

export const WEBHOOK_SIGNATURE_MATRIX_SUMMARY_VERSION = "final-17-webhook-signature-v1" as const;

export const WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC =
  "tests/unit/webhook-signature-matrix.test.ts" as const;

export const WEBHOOK_SIGNATURE_STATIC_AUDIT_ARTIFACT =
  "artifacts/webhook-signature-audit.json" as const;

export const WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT =
  "scripts/ops/run-webhook-signature-matrix-audit.ts" as const;

export const WEBHOOK_SIGNATURE_MATRIX_EXPECTED_CORE_ROUTES = 52 as const;

export const WEBHOOK_SIGNATURE_MATRIX_EXPECTED_INGRESS_ROUTES = 56 as const;

/** Contract markers in the CI matrix test source. */
export const WEBHOOK_SIGNATURE_MATRIX_CONTRACT_MARKERS = [
  "webhook signature matrix — 52 routes",
  "signature verification in source",
  "zero unverified routes",
  "production-partner ingress routes",
] as const;
