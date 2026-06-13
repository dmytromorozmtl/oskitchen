import { expect, test } from "@playwright/test";

import { POS_CHECKOUT_E2E_FLOW_STEPS } from "@/lib/pos/pos-checkout-e2e-policy";
import { KDS_PLAYWRIGHT_FLOW_STEPS } from "@/lib/qa/kds-playwright-e2e-policy";
import {
  INTEGRATION_TEST_PACK_P3_53_E2E_SPECS,
  INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS,
  INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT,
  INTEGRATION_TEST_PACK_P3_53_MODULES,
  INTEGRATION_TEST_PACK_P3_53_POLICY_ID,
  integrationTestPackModuleIds,
} from "@/lib/qa/integration-test-pack-p3-53-policy";
import {
  buildIntegrationTestPackModuleStatuses,
  uniqueIntegrationTestPackSpecs,
  validateIntegrationTestPackContract,
} from "@/lib/qa/integration-test-pack-p3-53-measurement";

import {
  integrationTestPackModuleCount,
  listIntegrationTestPackModules,
  runIntegrationTestPackContractStep,
  runIntegrationTestPackFlow,
} from "./helpers/integration-test-pack-p3-53-flow";

/**
 * Integration test pack — Shopify + WooCommerce webhooks, KDS, POS, refund, void, shift.
 *
 * @see docs/integration-test-pack-p3-53.md
 */

test.describe("integration test pack p3-53 policy", () => {
  test("exports seven modules and orchestrator specs", () => {
    expect(INTEGRATION_TEST_PACK_P3_53_POLICY_ID).toBe("integration-test-pack-p3-53-v1");
    expect(integrationTestPackModuleIds()).toHaveLength(INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT);
    expect(integrationTestPackModuleCount()).toBe(7);
    expect(INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => module.id)).toEqual([
      "shopify_webhook",
      "woocommerce_webhook",
      "kds",
      "pos",
      "refund",
      "void",
      "shift",
    ]);
    expect(INTEGRATION_TEST_PACK_P3_53_E2E_SPECS.length).toBeGreaterThanOrEqual(5);
    expect(uniqueIntegrationTestPackSpecs().length).toBeGreaterThanOrEqual(4);
    expect(validateIntegrationTestPackContract().passed).toBe(true);
  });

  test("pos checkout policy covers refund void and shift steps", () => {
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("refund");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("void_sale");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("open_shift");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("close_shift");
  });

  test("kds playwright policy covers bump expo complete", () => {
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toContain("kds_ticket");
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toContain("bump_ready");
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toContain("complete_order");
  });

  test("each module spec exists on disk", () => {
    for (const status of buildIntegrationTestPackModuleStatuses()) {
      expect(status.specPresent, `${status.moduleId} spec`).toBe(true);
      expect(status.flowSteps.length).toBeGreaterThan(0);
    }
  });
});

test.describe("integration test pack contract step", () => {
  test("validates seven-module integration pack contract", () => {
    const result = runIntegrationTestPackContractStep();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(7);
    expect(result.modules).toEqual(listIntegrationTestPackModules());
    expect(result.specCount).toBeGreaterThanOrEqual(4);
  });
});

test.describe("integration test pack orchestrator", () => {
  test("lists all pack modules with contract steps", () => {
    const result = runIntegrationTestPackFlow();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(7);
    expect(result.steps[0]).toBe(INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS[0]);
    expect(result.steps).toContain("shopify_webhook_module");
    expect(result.steps).toContain("woocommerce_webhook_module");
    expect(result.steps).toContain("kds_module");
    expect(result.steps).toContain("refund_module");
    expect(result.steps).toContain("void_module");
    expect(result.steps).toContain("shift_module");
  });
});
