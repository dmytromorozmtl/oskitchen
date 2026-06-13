/**
 * Blueprint P3-54 — Negative test suite.
 *
 * Invalid signature, replay webhook, wrong tenant, expired session, no permission.
 *
 * @see e2e/negative-test-suite-p3-54.spec.ts
 * @see docs/negative-test-suite-p3-54.md
 */

export const NEGATIVE_TEST_SUITE_P3_54_POLICY_ID = "negative-test-suite-p3-54-v1" as const;

export const NEGATIVE_TEST_SUITE_P3_54_DOC = "docs/negative-test-suite-p3-54.md" as const;

export const NEGATIVE_TEST_SUITE_P3_54_ARTIFACT =
  "artifacts/negative-test-suite-p3-54-registry.json" as const;

export const NEGATIVE_TEST_SUITE_P3_54_SPEC = "e2e/negative-test-suite-p3-54.spec.ts" as const;

export const NEGATIVE_TEST_SUITE_P3_54_FLOW_HELPER =
  "e2e/helpers/negative-test-suite-p3-54-flow.ts" as const;

export const NEGATIVE_TEST_SUITE_P3_54_READY_HELPER =
  "e2e/helpers/negative-test-suite-p3-54-ready.ts" as const;

export const NEGATIVE_TEST_SUITE_P3_54_AUDIT_SCRIPT =
  "scripts/audit-negative-test-suite-p3-54.ts" as const;

export const NEGATIVE_TEST_SUITE_P3_54_NPM_SCRIPT = "audit:negative-test-suite-p3-54" as const;

export const NEGATIVE_TEST_SUITE_P3_54_CHECK_NPM_SCRIPT =
  "check:negative-test-suite-p3-54" as const;

export const NEGATIVE_TEST_SUITE_P3_54_E2E_NPM_SCRIPT =
  "test:e2e:negative-test-suite-p3-54" as const;

export const NEGATIVE_TEST_SUITE_P3_54_UNIT_TEST =
  "tests/unit/negative-test-suite-p3-54.test.ts" as const;

export const NEGATIVE_TEST_SUITE_P3_54_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT = 5 as const;

export const NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS = [
  "validate_negative_suite_contract",
  "invalid_signature_module",
  "replay_webhook_module",
  "wrong_tenant_module",
  "expired_session_module",
  "no_permission_module",
] as const;

export const NEGATIVE_TEST_SUITE_P3_54_MODULES = [
  {
    id: "invalid_signature",
    label: "Invalid signature",
    policyId: "webhook-signature-regression-p1-22-v1",
    spec: "tests/unit/webhook-signature-regression.test.ts",
    expectedStatus: 401,
    flowSteps: ["assert_invalid_signature_rejected"],
  },
  {
    id: "replay_webhook",
    label: "Replay webhook",
    policyId: "webhook-replay-idempotency-e2e-v1",
    spec: "e2e/webhook-replay-idempotency.spec.ts",
    expectedStatus: 409,
    flowSteps: ["simulate_duplicate_ingest", "assert_idempotent_replay"],
  },
  {
    id: "wrong_tenant",
    label: "Wrong tenant",
    policyId: "cross-tenant-e2e-p1-14-v1",
    spec: "e2e/cross-tenant-e2e.spec.ts",
    expectedStatus: 403,
    flowSteps: ["foreign_workspace_probe", "assert_forbidden_or_not_found"],
  },
  {
    id: "expired_session",
    label: "Expired session",
    policyId: "expired-session-e2e-v1",
    spec: "e2e/expired-session-e2e.spec.ts",
    expectedStatus: 401,
    flowSteps: ["dashboard_redirects_to_login", "api_returns_unauthorized"],
  },
  {
    id: "no_permission",
    label: "No permission",
    policyId: "role-permissions-matrix-e2e-v1",
    spec: "e2e/role-permissions-matrix.spec.ts",
    expectedStatus: 403,
    flowSteps: ["capability_denied_probe", "permission_denied_surface"],
  },
] as const;

export type NegativeTestSuiteModuleId =
  (typeof NEGATIVE_TEST_SUITE_P3_54_MODULES)[number]["id"];

export const NEGATIVE_TEST_SUITE_P3_54_E2E_SPECS = [
  "tests/unit/webhook-signature-regression.test.ts",
  "e2e/webhook-replay-idempotency.spec.ts",
  "e2e/cross-tenant-e2e.spec.ts",
  "e2e/expired-session-e2e.spec.ts",
  "e2e/role-permissions-matrix.spec.ts",
  NEGATIVE_TEST_SUITE_P3_54_SPEC,
] as const;

export const NEGATIVE_TEST_SUITE_P3_54_WIRING_PATHS = [
  NEGATIVE_TEST_SUITE_P3_54_DOC,
  "lib/qa/negative-test-suite-p3-54-measurement.ts",
  "lib/qa/negative-test-suite-p3-54-audit.ts",
  "lib/qa/expired-session-e2e-policy.ts",
  "e2e/expired-session-e2e.spec.ts",
  NEGATIVE_TEST_SUITE_P3_54_SPEC,
  NEGATIVE_TEST_SUITE_P3_54_FLOW_HELPER,
  NEGATIVE_TEST_SUITE_P3_54_READY_HELPER,
  NEGATIVE_TEST_SUITE_P3_54_UNIT_TEST,
  NEGATIVE_TEST_SUITE_P3_54_ARTIFACT,
] as const;

export function isNegativeTestSuiteP3_54Enabled(): boolean {
  return process.env.E2E_NEGATIVE_TEST_SUITE?.trim() === "true";
}

export function negativeTestSuiteModuleIds(): NegativeTestSuiteModuleId[] {
  return NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => module.id);
}
