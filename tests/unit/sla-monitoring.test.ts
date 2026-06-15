import { describe, expect, it } from "vitest";

import {
  buildSlaAlerts,
  buildSlaMonitoringDashboard,
  buildSlaSignals,
  listSlaMonitoringSignalIds,
} from "@/lib/enterprise/sla-monitoring-builders";
import {
  ENTERPRISE_SLA_UPTIME_TARGET_PCT,
  SLA_MONITORING_POLICY_ID,
} from "@/lib/enterprise/sla-monitoring-policy";

function healthyInput() {
  return {
    workspaceId: "ws-1",
    databaseOk: true,
    databaseLatencyMs: 42,
    integrationFleetScore: 88,
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

describe("SLA monitoring (ENT-68)", () => {
  it("locks ENT-68 policy id and four signals", () => {
    expect(SLA_MONITORING_POLICY_ID).toBe("sla-monitoring-ent68-v1");
    expect(listSlaMonitoringSignalIds()).toHaveLength(4);
  });

  it("builds healthy SLA signals", () => {
    const signals = buildSlaSignals(healthyInput());
    expect(signals).toHaveLength(4);
    expect(signals.every((s) => s.status === "healthy")).toBe(true);
    expect(signals.find((s) => s.id === "platform_health")?.responseTimeMs).toBe(42);
  });

  it("raises alerts on latency and critical integrations", () => {
    const alerts = buildSlaAlerts({
      ...healthyInput(),
      databaseLatencyMs: 1200,
      criticalIntegrations: 2,
      failedWebhooks: 8,
      cronFailing: 1,
    });
    expect(alerts.some((a) => a.id === "db_latency")).toBe(true);
    expect(alerts.some((a) => a.id === "integration_critical")).toBe(true);
    expect(alerts.some((a) => a.id === "webhook_failures")).toBe(true);
    expect(alerts.some((a) => a.id === "cron_failing")).toBe(true);
  });

  it("assembles full SLA monitoring dashboard", () => {
    const dashboard = buildSlaMonitoringDashboard(healthyInput());
    expect(dashboard.policyId).toBe(SLA_MONITORING_POLICY_ID);
    expect(dashboard.summary.uptimePct).toBeGreaterThanOrEqual(ENTERPRISE_SLA_UPTIME_TARGET_PCT);
    expect(dashboard.summary.alertCount).toBe(0);
    expect(dashboard.targets.uptimePct).toBe(99.9);
    expect(dashboard.basePath).toBe("/dashboard/enterprise/sla");
  });

  it("warns when no integrations monitored", () => {
    const dashboard = buildSlaMonitoringDashboard({
      ...healthyInput(),
      monitoredIntegrations: 0,
      healthyIntegrations: 0,
    });
    expect(dashboard.warnings.some((w) => w.includes("No LIVE integrations"))).toBe(true);
    expect(dashboard.warnings.some((w) => w.includes("not a signed contractual"))).toBe(true);
  });
});
