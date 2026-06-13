/**
 * Blueprint P1-22 — Webhook signature regression (59 routes → invalid signature → 401).
 *
 * @see tests/unit/webhook-signature-regression.test.ts
 * @see scripts/audit-webhook-signatures.ts
 * @see lib/security/webhook-ingress-extended.ts
 */

export { WEBHOOK_ALL_INGRESS_ROUTE_COUNT } from "@/lib/security/webhook-ingress-extended";

export const WEBHOOK_SIGNATURE_REGRESSION_POLICY_ID =
  "webhook-signature-regression-p1-22-v1" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT = 59 as const;

export const WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS = 401 as const;

export const WEBHOOK_SIGNATURE_REGRESSION_ARTIFACT =
  "artifacts/webhook-signature-regression-summary.json" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_UNIT_TEST =
  "tests/unit/webhook-signature-regression.test.ts" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_AUDIT_SCRIPT =
  "scripts/run-webhook-signature-regression-benchmark.ts" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_NPM_SCRIPT =
  "benchmark:webhook-signature-regression" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_CHECK_NPM_SCRIPT =
  "check:webhook-signature-regression" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const WEBHOOK_SIGNATURE_REGRESSION_FLOW_STEPS = [
  "enumerate_routes",
  "assert_signature_verified",
  "assert_invalid_signature_rejected",
] as const;

export type WebhookSignatureRegressionFlowStep =
  (typeof WEBHOOK_SIGNATURE_REGRESSION_FLOW_STEPS)[number];

export function isWebhookSignatureRegression401(status: number): boolean {
  return status === WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS;
}

export function acceptsWebhookInvalidSignatureStatus(status: number): boolean {
  return status === 401 || status === 400;
}
