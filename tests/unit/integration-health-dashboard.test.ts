import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIntegrationHealthDashboard,
  formatIntegrationHealthDashboardAuditLines,
} from "@/lib/design/integration-health-dashboard-audit";
import {
  INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_AUDIT_SCRIPT,
  INTEGRATION_HEALTH_DASHBOARD_BAND_META,
  INTEGRATION_HEALTH_DASHBOARD_CI_WORKFLOW,
  INTEGRATION_HEALTH_DASHBOARD_NPM_SCRIPT,
  INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_POLICY_ID,
  INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_UNIT_TEST,
  integrationHealthScoreCardTestId,
} from "@/lib/design/integration-health-dashboard-policy";

const ROOT = process.cwd();

describe("Integration Health dashboard (P1-70)", () => {
  it("locks policy id and band meta for score cards", () => {
    expect(INTEGRATION_HEALTH_DASHBOARD_POLICY_ID).toBe(
      "integration-health-dashboard-p1-70-v1",
    );
    expect(INTEGRATION_HEALTH_DASHBOARD_BAND_META.healthy.scoreClass).toContain("emerald");
    expect(INTEGRATION_HEALTH_DASHBOARD_BAND_META.watch.scoreClass).toContain("amber");
    expect(INTEGRATION_HEALTH_DASHBOARD_BAND_META.critical.scoreClass).toContain("rose");
  });

  it("ships sparkline and score card modules", () => {
    const sparkline = readFileSync(
      join(ROOT, INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_MODULE),
      "utf8",
    );
    expect(sparkline).toContain("IntegrationHealthSparkline");
    expect(sparkline).toContain("INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID");

    const scoreCard = readFileSync(
      join(ROOT, INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_MODULE),
      "utf8",
    );
    expect(scoreCard).toContain("IntegrationHealthScoreCard");
    expect(scoreCard).toContain("integrationHealthScoreCardTestId");
    expect(integrationHealthScoreCardTestId("shopify")).toBe(
      "integration-health-score-card-shopify",
    );
  });

  it("passes full Integration Health dashboard audit", () => {
    const summary = auditIntegrationHealthDashboard(ROOT);
    expect(summary.sparklineModulePresent).toBe(true);
    expect(summary.scoreCardModulePresent).toBe(true);
    expect(summary.alertsModulePresent).toBe(true);
    expect(summary.livePanelWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.mainPageWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_DASHBOARD_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_DASHBOARD_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INTEGRATION_HEALTH_DASHBOARD_NPM_SCRIPT]).toContain(
      "audit-integration-health-dashboard.ts",
    );
    expect(pkg.scripts?.["test:ci:integration-health-dashboard"]).toContain(
      INTEGRATION_HEALTH_DASHBOARD_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INTEGRATION_HEALTH_DASHBOARD_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:integration-health-dashboard");
  });

  it("formats audit lines", () => {
    const summary = auditIntegrationHealthDashboard(ROOT);
    const lines = formatIntegrationHealthDashboardAuditLines(summary);
    expect(lines.some((line) => line.includes(INTEGRATION_HEALTH_DASHBOARD_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes(INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes(INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
