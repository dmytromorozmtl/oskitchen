import { expect, test } from "@playwright/test";

import {
  INTEGRATION_SMOKE_SUITE_NATIVE_ORDER_KDS_E2E_SPECS,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_SLA_MS,
  integrationSmokeSuiteChannelOrderKdsCount,
} from "@/lib/integrations/integration-smoke-suite-order-kds-policy";

/**
 * Absolute Final Task 55 — integration smoke suite order→KDS policy E2E contract.
 */
test.describe("integration smoke suite order→KDS", () => {
  test("exports eighteen LIVE round-trip entries and KDS SLA", () => {
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID).toBe(
      "integration-smoke-suite-order-kds-absolute-final-v1",
    );
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT).toBe(18);
    expect(integrationSmokeSuiteChannelOrderKdsCount()).toBe(6);
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH).toBe("/dashboard/kitchen");
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_SLA_MS).toBe(15_000);
    expect(INTEGRATION_SMOKE_SUITE_NATIVE_ORDER_KDS_E2E_SPECS.length).toBeGreaterThanOrEqual(4);
  });
});
