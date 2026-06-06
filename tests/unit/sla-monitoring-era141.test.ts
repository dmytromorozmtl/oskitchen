import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SLA_MONITORING_ERA141_CANONICAL_POLICY_ID,
  SLA_MONITORING_ERA141_CAPABILITIES,
  SLA_MONITORING_ERA141_POLICY_ID,
  SLA_MONITORING_ERA141_ROUTE,
  SLA_MONITORING_ERA141_SERVICE,
  SLA_MONITORING_ERA141_SIGNALS,
  SLA_MONITORING_ERA141_SUMMARY_ARTIFACT,
  SLA_MONITORING_ERA141_WIRING_PATHS,
} from "@/lib/enterprise/sla-monitoring-era141-policy";
import {
  auditSlaMonitoringSmokeWiring,
  buildSlaMonitoringSmokeEra141Summary,
  resolveSlaMonitoringSmokeEra141ProofStatus,
} from "@/lib/enterprise/sla-monitoring-smoke-summary";
import {
  buildSlaAlerts,
  buildSlaMonitoringDashboard,
  buildSlaSignals,
} from "@/lib/enterprise/sla-monitoring-builders";
import {
  ENTERPRISE_SLA_UPTIME_TARGET_PCT,
  SLA_MONITORING_POLICY_ID,
} from "@/lib/enterprise/sla-monitoring-policy";

const ROOT = process.cwd();

function healthyInput() {
  return {
    workspaceId: "ws-era141",
    databaseOk: true,
    databaseLatencyMs: 42,
    integrationFleetScore: 90,
    healthyIntegrations: 18,
    watchIntegrations: 0,
    criticalIntegrations: 0,
    monitoredIntegrations: 18,
    cronHealthy: 4,
    cronTotal: 4,
    cronFailing: 0,
    failedWebhooks: 0,
    integrationCheckLatencyMs: 120,
    integrationCheckP95Ms: 350,
  };
}

describe("sla monitoring era141", () => {
  it("locks era141 policy and artifact path", () => {
    expect(SLA_MONITORING_ERA141_POLICY_ID).toBe("era141-sla-monitoring-v1");
    expect(SLA_MONITORING_ERA141_SUMMARY_ARTIFACT).toBe(
      "artifacts/sla-monitoring-smoke-summary.json",
    );
    expect(SLA_MONITORING_ERA141_ROUTE).toBe("/dashboard/enterprise/sla");
    expect(SLA_MONITORING_ERA141_SIGNALS).toHaveLength(4);
    expect(SLA_MONITORING_ERA141_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era141 with canonical SLA monitoring policy", () => {
    expect(SLA_MONITORING_ERA141_CANONICAL_POLICY_ID).toBe(SLA_MONITORING_POLICY_ID);
  });

  it("audits in-repo SLA Monitoring wiring", () => {
    const audit = auditSlaMonitoringSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SLA_MONITORING_ERA141_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes uptime response time alerts wiring", () => {
    const service = readFileSync(join(ROOT, SLA_MONITORING_ERA141_SERVICE), "utf8");
    expect(service).toContain("loadEnterpriseSlaMonitoringDashboard");
    expect(service).toContain("loadLiveIntegrationHealthDashboard");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/sla-monitoring-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("sla-monitoring-panel");
    expect(panel).toContain("sla-alert-");

    const signals = buildSlaSignals(healthyInput());
    expect(signals).toHaveLength(4);
    expect(signals.find((s) => s.id === "platform_health")?.responseTimeMs).toBe(42);

    const alerts = buildSlaAlerts({
      ...healthyInput(),
      databaseLatencyMs: 1200,
      criticalIntegrations: 2,
    });
    expect(alerts.some((a) => a.id === "db_latency")).toBe(true);

    const dashboard = buildSlaMonitoringDashboard(healthyInput());
    expect(dashboard.summary.uptimePct).toBeGreaterThanOrEqual(ENTERPRISE_SLA_UPTIME_TARGET_PCT);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSlaMonitoringSmokeEra141ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSlaMonitoringSmokeEra141ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSlaMonitoringSmokeEra141Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("alerts");
  });
});
