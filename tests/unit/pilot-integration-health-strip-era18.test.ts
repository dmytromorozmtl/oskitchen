import { describe, expect, it } from "vitest";

import {
  buildPilotIntegrationHealthStripModel,
  formatPilotIntegrationLastSync,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { PILOT_INTEGRATION_HEALTH_TODAY_ERA18_POLICY_ID } from "@/lib/integrations/pilot-integration-health-today-era18-policy";
import type { PermissionKey } from "@/lib/permissions/permissions";

describe("pilot integration health strip era18", () => {
  it("formats recent sync times for operator scan", () => {
    const now = new Date("2026-05-28T12:00:00.000Z");
    expect(formatPilotIntegrationLastSync(null, now.getTime())).toBe("never synced");
    expect(
      formatPilotIntegrationLastSync(new Date("2026-05-28T11:58:00.000Z"), now.getTime()),
    ).toBe("2m ago");
  });

  it("builds compact strip model with top connections and webhook backlog", () => {
    const model = buildPilotIntegrationHealthStripModel({
      summary: {
        overall: "degraded",
        healthyCount: 1,
        degradedCount: 1,
        downCount: 0,
        stripeConfigured: true,
        emailConfigured: false,
      },
      failedWebhookCount: 2,
      cards: [
        {
          id: "c1",
          provider: "WOOCOMMERCE",
          name: "Pilot Woo",
          status: "CONNECTED",
          lastSyncAt: new Date("2026-05-28T11:00:00.000Z"),
          lastError: null,
          hasWebhookSecret: true,
        },
        {
          id: "c2",
          provider: "SHOPIFY",
          name: "Pilot Shopify",
          status: "ERROR",
          lastSyncAt: null,
          lastError: "token expired",
          hasWebhookSecret: false,
        },
      ],
      now: new Date("2026-05-28T12:00:00.000Z"),
    });

    expect(model.overall).toBe("degraded");
    expect(model.failedWebhookCount).toBe(2);
    expect(model.connections).toHaveLength(2);
    expect(model.connections[1]?.hasError).toBe(true);
  });

  it("shows strip for owners, managers, and integration readers", () => {
    const granted = (...keys: PermissionKey[]) => new Set(keys) as ReadonlySet<PermissionKey>;

    expect(
      shouldShowPilotIntegrationHealthStrip({
        workspaceRole: "OWNER",
        persona: "owner",
        granted: granted(),
      }),
    ).toBe(true);

    expect(
      shouldShowPilotIntegrationHealthStrip({
        workspaceRole: "STAFF",
        persona: "manager",
        granted: granted("orders.manage"),
      }),
    ).toBe(true);

    expect(
      shouldShowPilotIntegrationHealthStrip({
        workspaceRole: "STAFF",
        persona: "cashier",
        granted: granted("integrations.read"),
      }),
    ).toBe(true);

    expect(
      shouldShowPilotIntegrationHealthStrip({
        workspaceRole: "STAFF",
        persona: "kitchen",
        granted: granted("kitchen.view"),
      }),
    ).toBe(false);
  });

  it("locks today command center policy id", () => {
    expect(PILOT_INTEGRATION_HEALTH_TODAY_ERA18_POLICY_ID).toBe(
      "era18-pilot-integration-health-today-v1",
    );
  });
});
