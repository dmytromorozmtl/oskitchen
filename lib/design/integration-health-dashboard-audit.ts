import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_HEALTH_DASHBOARD_ALERTS_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_LIVE_PANEL_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_PAGE_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_POLICY_ID,
  INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_TEST_PREFIX,
  INTEGRATION_HEALTH_DASHBOARD_SECTION_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_MODULE,
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID,
} from "@/lib/design/integration-health-dashboard-policy";

export type IntegrationHealthDashboardAuditSummary = {
  policyId: typeof INTEGRATION_HEALTH_DASHBOARD_POLICY_ID;
  sparklineModulePresent: boolean;
  scoreCardModulePresent: boolean;
  alertsModulePresent: boolean;
  livePanelWired: boolean;
  sectionWired: boolean;
  mainPageWired: boolean;
  passed: boolean;
};

export function auditIntegrationHealthDashboard(
  root = process.cwd(),
): IntegrationHealthDashboardAuditSummary {
  const sparklinePath = join(root, INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_MODULE);
  const scoreCardPath = join(root, INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_MODULE);
  const alertsPath = join(root, INTEGRATION_HEALTH_DASHBOARD_ALERTS_MODULE);
  const livePanelPath = join(root, INTEGRATION_HEALTH_DASHBOARD_LIVE_PANEL_MODULE);
  const sectionPath = join(root, INTEGRATION_HEALTH_DASHBOARD_SECTION_MODULE);
  const pagePath = join(root, INTEGRATION_HEALTH_DASHBOARD_PAGE_MODULE);

  const sparklineModulePresent = existsSync(sparklinePath);
  const scoreCardModulePresent = existsSync(scoreCardPath);
  const alertsModulePresent = existsSync(alertsPath);

  let livePanelWired = false;
  let sectionWired = false;
  let mainPageWired = false;

  if (existsSync(livePanelPath)) {
    const source = readFileSync(livePanelPath, "utf8");
    livePanelWired =
      source.includes("IntegrationHealthScoreCard") &&
      source.includes("IntegrationHealthAlertsPanel") &&
      source.includes("INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID") &&
      source.includes("INTEGRATION_HEALTH_DASHBOARD_SCORE_GRID_CLASS");
  }

  if (existsSync(sectionPath)) {
    const source = readFileSync(sectionPath, "utf8");
    sectionWired =
      source.includes("IntegrationHealthLiveDashboardSection") &&
      source.includes("INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID");
  }

  if (existsSync(pagePath)) {
    const source = readFileSync(pagePath, "utf8");
    mainPageWired =
      source.includes("IntegrationHealthLiveDashboardSection") &&
      source.includes("loadLiveIntegrationHealthDashboard");
  }

  const passed =
    sparklineModulePresent &&
    scoreCardModulePresent &&
    alertsModulePresent &&
    livePanelWired &&
    sectionWired &&
    mainPageWired &&
    INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID === "integration-health-sparkline" &&
    INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID === "integration-health-alerts-panel" &&
    INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_TEST_PREFIX === "integration-health-score-card";

  return {
    policyId: INTEGRATION_HEALTH_DASHBOARD_POLICY_ID,
    sparklineModulePresent,
    scoreCardModulePresent,
    alertsModulePresent,
    livePanelWired,
    sectionWired,
    mainPageWired,
    passed,
  };
}

export function formatIntegrationHealthDashboardAuditLines(
  summary: IntegrationHealthDashboardAuditSummary,
): string[] {
  return [
    `Integration Health dashboard audit (${summary.policyId})`,
    `Sparkline (${INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID}): ${summary.sparklineModulePresent ? "yes" : "no"}`,
    `Score cards (${INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_TEST_PREFIX}): ${summary.scoreCardModulePresent ? "yes" : "no"}`,
    `Alerts (${INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID}): ${summary.alertsModulePresent ? "yes" : "no"}`,
    `Live panel (${INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID}): ${summary.livePanelWired ? "yes" : "no"}`,
    `Main page section (${INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID}): ${summary.sectionWired && summary.mainPageWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
