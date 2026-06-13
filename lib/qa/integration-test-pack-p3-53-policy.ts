/**
 * Blueprint P3-53 — Integration test pack.
 *
 * Shopify webhook + WooCommerce webhook + KDS + POS + refund + void + shift.
 *
 * @see e2e/integration-test-pack-p3-53.spec.ts
 * @see docs/integration-test-pack-p3-53.md
 */

export const INTEGRATION_TEST_PACK_P3_53_POLICY_ID = "integration-test-pack-p3-53-v1" as const;

export const INTEGRATION_TEST_PACK_P3_53_DOC = "docs/integration-test-pack-p3-53.md" as const;

export const INTEGRATION_TEST_PACK_P3_53_ARTIFACT =
  "artifacts/integration-test-pack-p3-53-registry.json" as const;

export const INTEGRATION_TEST_PACK_P3_53_SPEC = "e2e/integration-test-pack-p3-53.spec.ts" as const;

export const INTEGRATION_TEST_PACK_P3_53_FLOW_HELPER =
  "e2e/helpers/integration-test-pack-p3-53-flow.ts" as const;

export const INTEGRATION_TEST_PACK_P3_53_READY_HELPER =
  "e2e/helpers/integration-test-pack-p3-53-ready.ts" as const;

export const INTEGRATION_TEST_PACK_P3_53_AUDIT_SCRIPT =
  "scripts/audit-integration-test-pack-p3-53.ts" as const;

export const INTEGRATION_TEST_PACK_P3_53_NPM_SCRIPT = "audit:integration-test-pack-p3-53" as const;

export const INTEGRATION_TEST_PACK_P3_53_CHECK_NPM_SCRIPT =
  "check:integration-test-pack-p3-53" as const;

export const INTEGRATION_TEST_PACK_P3_53_E2E_NPM_SCRIPT =
  "test:e2e:integration-test-pack-p3-53" as const;

export const INTEGRATION_TEST_PACK_P3_53_UNIT_TEST =
  "tests/unit/integration-test-pack-p3-53.test.ts" as const;

export const INTEGRATION_TEST_PACK_P3_53_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT = 7 as const;

export const INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS = [
  "validate_integration_pack_contract",
  "shopify_webhook_module",
  "woocommerce_webhook_module",
  "kds_module",
  "pos_module",
  "refund_module",
  "void_module",
  "shift_module",
] as const;

export const INTEGRATION_TEST_PACK_P3_53_MODULES = [
  {
    id: "shopify_webhook",
    label: "Shopify webhook",
    policyId: "shopify-webhook-order-hub-e2e-v1",
    spec: "e2e/shopify-webhook-order-hub.spec.ts",
    flowSteps: ["webhook_ingest", "verify_external_order"],
  },
  {
    id: "woocommerce_webhook",
    label: "WooCommerce webhook",
    policyId: "woocommerce-webhook-order-hub-e2e-v1",
    spec: "e2e/woocommerce-webhook-order-hub.spec.ts",
    flowSteps: ["webhook_ingest", "verify_external_order"],
  },
  {
    id: "kds",
    label: "KDS bump expo",
    policyId: "kds-playwright-e2e-v1",
    spec: "e2e/kds-playwright.spec.ts",
    flowSteps: ["kds_ticket", "bump_ready", "expo_lane", "complete_order"],
  },
  {
    id: "pos",
    label: "POS checkout",
    policyId: "pos-checkout-e2e-p1-20-v1",
    spec: "e2e/pos-checkout-e2e.spec.ts",
    flowSteps: ["open_shift", "add_item", "apply_discount", "checkout", "receipt"],
  },
  {
    id: "refund",
    label: "POS refund",
    policyId: "pos-checkout-e2e-p1-20-v1",
    spec: "e2e/pos-checkout-e2e.spec.ts",
    flowSteps: ["refund"],
  },
  {
    id: "void",
    label: "POS void",
    policyId: "pos-checkout-e2e-p1-20-v1",
    spec: "e2e/pos-checkout-e2e.spec.ts",
    flowSteps: ["void_sale"],
  },
  {
    id: "shift",
    label: "Cashier shift",
    policyId: "pos-checkout-e2e-p1-20-v1",
    spec: "e2e/pos-checkout-e2e.spec.ts",
    flowSteps: ["open_shift", "close_shift"],
  },
] as const;

export type IntegrationTestPackModuleId =
  (typeof INTEGRATION_TEST_PACK_P3_53_MODULES)[number]["id"];

export const INTEGRATION_TEST_PACK_P3_53_E2E_SPECS = [
  "e2e/shopify-webhook-order-hub.spec.ts",
  "e2e/woocommerce-webhook-order-hub.spec.ts",
  "e2e/kds-playwright.spec.ts",
  "e2e/pos-checkout-e2e.spec.ts",
  INTEGRATION_TEST_PACK_P3_53_SPEC,
] as const;

export const INTEGRATION_TEST_PACK_P3_53_WIRING_PATHS = [
  INTEGRATION_TEST_PACK_P3_53_DOC,
  "lib/qa/integration-test-pack-p3-53-measurement.ts",
  "lib/qa/integration-test-pack-p3-53-audit.ts",
  "lib/integrations/shopify-webhook-order-hub-e2e-policy.ts",
  "e2e/shopify-webhook-order-hub.spec.ts",
  "e2e/helpers/shopify-webhook-order-hub-flow.ts",
  "e2e/helpers/shopify-webhook-order-hub-ready.ts",
  INTEGRATION_TEST_PACK_P3_53_SPEC,
  INTEGRATION_TEST_PACK_P3_53_FLOW_HELPER,
  INTEGRATION_TEST_PACK_P3_53_READY_HELPER,
  INTEGRATION_TEST_PACK_P3_53_UNIT_TEST,
  INTEGRATION_TEST_PACK_P3_53_ARTIFACT,
] as const;

export function isIntegrationTestPackP3_53Enabled(): boolean {
  return process.env.E2E_INTEGRATION_TEST_PACK?.trim() === "true";
}

export function hasIntegrationTestPackP3_53Credentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function integrationTestPackModuleIds(): IntegrationTestPackModuleId[] {
  return INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => module.id);
}
