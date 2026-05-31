import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_SCORE_HEALTHY_MIN,
  INTEGRATION_HEALTH_SCORING_POLICY_ID,
} from "@/lib/integration-health/health-scoring-policy";
import {
  buildIntegrationHealthScoreboard,
  computeIntegrationHealthTrend,
  predictIntegrationHealthAlerts,
  scoreIntegrationHealth,
} from "@/services/integration-health/health-scoring-engine";

const healthyBase = {
  connectionId: "conn-1",
  provider: "SHOPIFY",
  connectionName: "Main Shopify",
  connectionStatus: "CONNECTED",
  hasCredentials: true,
  lastHealthStatus: "OK" as const,
  latencyMs: 420,
  lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  webhookEvents7d: { total: 100, failed: 2 },
};

describe("integration health scoring engine", () => {
  it("locks scoring policy id", () => {
    expect(INTEGRATION_HEALTH_SCORING_POLICY_ID).toBe("critical-integration-health-scoring-v1");
  });

  it("scores healthy connected integration above 80", () => {
    const result = scoreIntegrationHealth(healthyBase);
    expect(result.score).toBeGreaterThanOrEqual(INTEGRATION_HEALTH_SCORE_HEALTHY_MIN);
    expect(result.band).toBe("healthy");
  });

  it("scores error connection as critical", () => {
    const result = scoreIntegrationHealth({
      ...healthyBase,
      connectionStatus: "ERROR",
      lastHealthStatus: "ERROR",
      hasCredentials: false,
      webhookEvents7d: { total: 50, failed: 30 },
      lastSyncAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });
    expect(result.score).toBeLessThan(55);
    expect(result.band).toBe("critical");
    expect(result.alerts.some((a) => a.code === "score_critical")).toBe(true);
  });

  it("detects declining trend", () => {
    const trend = computeIntegrationHealthTrend([85, 82, 78, 70, 62, 58]);
    expect(trend.direction).toBe("declining");
    expect(trend.delta7d).toBeLessThan(0);
  });

  it("emits predictive alerts for stale sync and webhook failures", () => {
    const result = scoreIntegrationHealth({
      ...healthyBase,
      lastSyncAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      webhookEvents7d: { total: 20, failed: 8 },
      healthCheckHistory: [
        { status: "OK", latencyMs: 900, checkedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        { status: "DEGRADED", latencyMs: 2500, checkedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: "DEGRADED", latencyMs: 2600, checkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });
    expect(result.alerts.some((a) => a.code === "sync_stale")).toBe(true);
    expect(result.alerts.some((a) => a.code === "webhook_failures")).toBe(true);
  });

  it("builds workspace scoreboard with aggregated alerts", () => {
    const a = scoreIntegrationHealth(healthyBase);
    const b = scoreIntegrationHealth({
      ...healthyBase,
      connectionId: "conn-2",
      connectionName: "Woo Store",
      provider: "WOOCOMMERCE",
      connectionStatus: "ERROR",
      lastHealthStatus: "ERROR",
    });
    const board = buildIntegrationHealthScoreboard({ connections: [a, b] });
    expect(board.connections).toHaveLength(2);
    expect(board.workspaceScore).toBeGreaterThan(0);
    expect(board.alerts.length).toBeGreaterThan(0);
    expect(board.policyId).toBe(INTEGRATION_HEALTH_SCORING_POLICY_ID);
  });

  it("predictIntegrationHealthAlerts adds auth warning", () => {
    const scored = scoreIntegrationHealth({
      ...healthyBase,
      connectionStatus: "NEEDS_AUTH",
      hasCredentials: false,
      lastHealthStatus: "DEGRADED",
    });
    const alerts = predictIntegrationHealthAlerts(scored);
    expect(alerts.some((a) => a.code === "auth_degraded")).toBe(true);
  });
});
