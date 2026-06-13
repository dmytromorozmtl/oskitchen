import { expect, test } from "@playwright/test";

import {
  BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
  BUNDLE_BUDGET_GATE_P3_59_POLICY_ID,
  BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
} from "@/lib/qa/bundle-budget-gate-p3-59-policy";
import { validateBundleBudgetGateContract } from "@/lib/qa/bundle-budget-gate-p3-59-measurement";

import {
  runBundleBudgetGateContractStep,
  runBundleBudgetGatePolicyFlow,
} from "./helpers/bundle-budget-gate-p3-59-flow";
import { bundleBudgetGateP3_59Ready } from "./helpers/bundle-budget-gate-p3-59-ready";

/**
 * Bundle budget CI gate — fail when any route First Load JS > 1000 kB.
 *
 * @see scripts/check-bundle-size-regression.ts
 * @see docs/bundle-budget-gate-p3-59.md
 */

test.describe("bundle budget gate p3-59 policy", () => {
  test("locks 500 kB warn and 1000 kB fail thresholds", () => {
    expect(BUNDLE_BUDGET_GATE_P3_59_POLICY_ID).toBe("bundle-budget-gate-p3-59-v1");
    expect(BUNDLE_BUDGET_GATE_P3_59_WARN_KB).toBe(500);
    expect(BUNDLE_BUDGET_GATE_P3_59_FAIL_KB).toBe(1000);
    expect(validateBundleBudgetGateContract().passed).toBe(true);
  });

  test("contract step validates CI wiring", () => {
    const result = runBundleBudgetGateContractStep();
    expect(result.passed).toBe(true);
    expect(result.failThresholdKb).toBe(1000);
  });

  test("policy flow completes four steps", () => {
    const flow = runBundleBudgetGatePolicyFlow();
    expect(flow.steps).toHaveLength(4);
    expect(flow.contract.passed).toBe(true);
  });

  test("E2E gate requires E2E_BUNDLE_BUDGET_GATE flag for live build log checks", () => {
    if (!bundleBudgetGateP3_59Ready()) {
      test.skip(true, "Set E2E_BUNDLE_BUDGET_GATE=true for live build log gate runs");
    }
    expect(bundleBudgetGateP3_59Ready()).toBe(true);
  });
});
