import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAINTENANCE_MODE_PANEL_CLS_MAX,
  MAINTENANCE_MODE_PANEL_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_POLICY_ID,
  MAINTENANCE_MODE_PANEL_PERF_PATHS,
  MAINTENANCE_MODE_PANEL_TBT_MAX_MS,
} from "@/lib/performance/maintenance-mode-panel-perf-budget-policy";
import {
  auditMaintenanceModePanelPerfBudgetP253,
  formatMaintenanceModePanelPerfBudgetP253AuditLines,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-p2-53-audit";
import {
  evaluateMaintenanceModePanelPerfBudgetMetrics,
  validateMaintenanceModePanelPerfBudgetContract,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-measurement";
import {
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CHECK_NPM_SCRIPT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_NPM_SCRIPT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_WORKFLOW,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LHCI_NPM_SCRIPT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_WIRING_PATHS,
  isMaintenanceModePanelPerfBudgetE2EEnabled,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-p2-53-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Maintenance mode panel perf budget (P2-53)", () => {
  it("locks P2-53 policy and dashboard Lighthouse thresholds", () => {
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID).toBe(
      "maintenance-mode-panel-perf-budget-p2-53-v1",
    );
    expect(MAINTENANCE_MODE_PANEL_PERF_BUDGET_POLICY_ID).toBe(
      "maintenance-mode-panel-perf-budget-v1",
    );
    expect(MAINTENANCE_MODE_PANEL_FCP_MAX_MS).toBe(2500);
    expect(MAINTENANCE_MODE_PANEL_LCP_MAX_MS).toBe(4000);
    expect(MAINTENANCE_MODE_PANEL_CLS_MAX).toBe(0.1);
    expect(MAINTENANCE_MODE_PANEL_TBT_MAX_MS).toBe(350);
    expect(MAINTENANCE_MODE_PANEL_PERF_PATHS).toEqual([
      "/dashboard/today",
      "/platform/implementations",
    ]);
  });

  it("validates LHCI config contract for maintenance-mode-panel", () => {
    const validation = validateMaintenanceModePanelPerfBudgetContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathCount).toBe(2);
    expect(validation.panelTestIdWired).toBe(true);
    expect(validation.platformSectionsLazyLoaded).toBe(true);
  });

  it("evaluates passing and failing metric bundles", () => {
    expect(
      evaluateMaintenanceModePanelPerfBudgetMetrics({
        fcpMs: 2200,
        lcpMs: 3800,
        cls: 0.05,
        tbtMs: 300,
        performanceScore: 0.9,
      }).passed,
    ).toBe(true);
    expect(
      evaluateMaintenanceModePanelPerfBudgetMetrics({
        fcpMs: 2600,
        lcpMs: 4100,
        cls: 0.12,
        tbtMs: 400,
        performanceScore: 0.8,
      }).passed,
    ).toBe(false);
  });

  it("passes full P2-53 audit — LHCI config, panel wiring, artifact", () => {
    const summary = auditMaintenanceModePanelPerfBudgetP253(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.panelTestIdWired).toBe(true);
    expect(summary.platformSectionsLazyLoaded).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-53 wiring paths exist including doc, artifact, LHCI config, and CI gate", () => {
    for (const path of MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LHCI_NPM_SCRIPT}"`);

    const ci = readSource(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_WORKFLOW);
    expect(ci).toContain(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CHECK_NPM_SCRIPT);

    const doc = readSource(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC);
    expect(doc).toContain(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID);

    const spec = readSource(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC);
    expect(spec).toContain(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID);

    const config = readSource(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG);
    expect(config).toContain("/dashboard/today");
    expect(config).toContain("maxNumericValue: 2500");

    const artifact = JSON.parse(readSource(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT));
    expect(artifact.policyId).toBe(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID);
    expect(artifact.panelTestId).toBe("maintenance-mode-panel");
  });

  it("E2E gate requires E2E_MAINTENANCE_MODE_PANEL_PERF flag", () => {
    const original = process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
    delete process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
    expect(isMaintenanceModePanelPerfBudgetE2EEnabled()).toBe(false);
    process.env.E2E_MAINTENANCE_MODE_PANEL_PERF = "true";
    expect(isMaintenanceModePanelPerfBudgetE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_MAINTENANCE_MODE_PANEL_PERF = original;
    else delete process.env.E2E_MAINTENANCE_MODE_PANEL_PERF;
  });

  it("formats audit lines", () => {
    const summary = auditMaintenanceModePanelPerfBudgetP253(ROOT);
    const lines = formatMaintenanceModePanelPerfBudgetP253AuditLines(summary);
    expect(
      lines.some((line) => line.includes(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID)),
    ).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
