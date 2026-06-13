import { expect, test } from "@playwright/test";

import {
  LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
  LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";
import { validateLighthouseCiGateContract } from "@/lib/qa/lighthouse-ci-gate-p3-60-measurement";

import {
  listLighthouseCiGatePaths,
  runLighthouseCiGateContractStep,
  runLighthouseCiGatePolicyFlow,
} from "./helpers/lighthouse-ci-gate-p3-60-flow";
import { lighthouseCiGateP3_60Ready } from "./helpers/lighthouse-ci-gate-p3-60-ready";

/**
 * Lighthouse CI gate — FCP<2s, LCP<3.5s, CLS<0.1.
 *
 * @see lighthouserc.core-web-vitals.cjs
 * @see docs/lighthouse-ci-gate-p3-60.md
 */

test.describe("lighthouse ci gate p3-60 policy", () => {
  test("locks FCP 2s, LCP 3.5s, CLS 0.1 thresholds", () => {
    expect(LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID).toBe("lighthouse-ci-gate-p3-60-v1");
    expect(LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS).toBe(2000);
    expect(LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS).toBe(3500);
    expect(LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX).toBe(0.1);
    expect(validateLighthouseCiGateContract().passed).toBe(true);
  });

  test("contract step lists four marketing paths", () => {
    const result = runLighthouseCiGateContractStep();
    expect(result.passed).toBe(true);
    expect(listLighthouseCiGatePaths()).toEqual(["/", "/pricing", "/login", "/shopify"]);
  });

  test("policy flow completes four steps", () => {
    const flow = runLighthouseCiGatePolicyFlow();
    expect(flow.steps).toHaveLength(4);
    expect(flow.contract.passed).toBe(true);
  });

  test("E2E gate requires E2E_LIGHTHOUSE_CI_GATE flag for live LHCI runs", () => {
    if (!lighthouseCiGateP3_60Ready()) {
      test.skip(true, "Set E2E_LIGHTHOUSE_CI_GATE=true for live Lighthouse CI runs");
    }
    expect(lighthouseCiGateP3_60Ready()).toBe(true);
  });
});
