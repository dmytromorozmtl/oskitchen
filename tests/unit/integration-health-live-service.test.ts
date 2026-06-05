import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_LIVE_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT,
  INTEGRATION_HEALTH_LIVE_POLICY_ID,
} from "@/lib/integrations/integration-health-live-policy";
import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";
import {
  buildLiveIntegrationHealthDashboard,
  loadLiveIntegrationHealthDashboard,
} from "@/services/integrations/integration-health-live-service";

describe("integration health live service", () => {
  it("locks policy and route constants", () => {
    expect(INTEGRATION_HEALTH_LIVE_POLICY_ID).toBe("integration-health-live-dashboard-v1");
    expect(INTEGRATION_HEALTH_LIVE_DASHBOARD_ROUTE).toBe("/dashboard/integration-health/live");
    expect(INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT).toBe(LIVE_INTEGRATION_IDS.length);
  });

  it("builds dashboard with one row per LIVE registry entry", () => {
    const dashboard = buildLiveIntegrationHealthDashboard({
      rows: LIVE_INTEGRATION_IDS.map((integrationId) => ({
        integrationId,
        name: integrationId,
        setupRoute: `/dashboard/integrations/${integrationId}`,
        healthScore: 80,
        band: "healthy" as const,
        envStatus: "ready" as const,
        configuredEnvCount: 2,
        requiredEnvCount: 2,
        connectionStatus: "none" as const,
        connectionName: null,
        trend: { direction: "stable" as const, delta7d: 0, recentScores: [78, 80, 81] },
        alerts: [],
      })),
    });

    expect(dashboard.monitoredCount).toBe(LIVE_INTEGRATION_IDS.length);
    expect(dashboard.rows).toHaveLength(LIVE_INTEGRATION_IDS.length);
    expect(dashboard.fleetScore).toBe(80);
    expect(dashboard.fleetBand).toBe("healthy");
  });

  it("exports loadLiveIntegrationHealthDashboard loader", () => {
    expect(typeof loadLiveIntegrationHealthDashboard).toBe("function");
  });
});
