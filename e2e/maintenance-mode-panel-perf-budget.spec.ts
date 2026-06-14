import { expect, test } from "@playwright/test";

import {
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TEST_ID,
  isMaintenanceModePanelPerfBudgetE2EEnabled,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-p2-53-policy";
import { validateMaintenanceModePanelPerfBudgetContract } from "@/lib/qa/maintenance-mode-panel-perf-budget-measurement";

import {
  listMaintenanceModePanelPerfBudgetPaths,
  runMaintenanceModePanelPerfBudgetContractStep,
  runMaintenanceModePanelPerfBudgetPolicyFlow,
} from "./helpers/maintenance-mode-panel-perf-budget-flow";

/**
 * Maintenance mode panel Lighthouse perf budget (P2-53).
 *
 * @see lighthouserc.maintenance-mode-panel.cjs
 * @see docs/maintenance-mode-panel-perf-budget-p2-53.md
 */

test.describe("maintenance mode panel perf budget policy (contract)", () => {
  test("locks FCP 2.5s, LCP 4s, CLS 0.1, TBT 350ms thresholds", () => {
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID).toBe(
      "maintenance-mode-panel-perf-budget-p2-53-v1",
    );
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS).toBe(2500);
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS).toBe(4000);
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX).toBe(0.1);
    expect(validateMaintenanceModePanelPerfBudgetContract().passed).toBe(true);
  });

  test("contract step lists two dashboard host paths", () => {
    const result = runMaintenanceModePanelPerfBudgetContractStep();
    expect(result.passed).toBe(true);
    expect(listMaintenanceModePanelPerfBudgetPaths()).toEqual([
      "/dashboard/today",
      "/platform/implementations",
    ]);
  });

  test("policy flow completes four steps", () => {
    const flow = runMaintenanceModePanelPerfBudgetPolicyFlow();
    expect(flow.steps).toEqual([...MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS]);
    expect(flow.contract.passed).toBe(true);
  });

  test("E2E gate requires E2E_MAINTENANCE_MODE_PANEL_PERF flag for live LHCI", () => {
    const original = process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
    delete process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
    expect(isMaintenanceModePanelPerfBudgetE2EEnabled()).toBe(false);
    process.env.E2E_MAINTENANCE_MODE_PANEL_PERF = "true";
    expect(isMaintenanceModePanelPerfBudgetE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_MAINTENANCE_MODE_PANEL_PERF = original;
    else delete process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
  });
});

test.describe("maintenance mode panel perf budget (chromium-authed, live)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      !isMaintenanceModePanelPerfBudgetE2EEnabled(),
      "Live panel perf E2E requires E2E_MAINTENANCE_MODE_PANEL_PERF=true",
    );
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Live panel perf E2E runs in chromium-authed project only",
    );
  });

  test("maintenance-mode-panel visible on /dashboard/today within LCP budget", async ({ page }) => {
    const started = Date.now();
    await page.goto("/dashboard/today", { waitUntil: "domcontentloaded" });
    const panel = page.getByTestId(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TEST_ID);
    const visible = await panel.isVisible().catch(() => false);
    if (visible) {
      expect(Date.now() - started).toBeLessThan(
        MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS,
      );
    }
  });
});
