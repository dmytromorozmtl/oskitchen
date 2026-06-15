import { describe, expect, it } from "vitest";

import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import {
  PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_BACKLOG_ID,
  PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_POLICY_ID,
  PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_PROOF_STATUS,
} from "@/lib/integrations/pilot-integration-health-live-proof-era18-policy";
import {
  augmentPilotIntegrationHealthStripWithLiveProof,
  buildPilotIntegrationLiveProofRows,
  refinePilotIntegrationHealthHeadlineForLiveProof,
  summarizePilotIntegrationLiveProof,
} from "@/lib/integrations/pilot-integration-health-live-proof-era18";
import { buildPilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

function baseModel() {
  return buildPilotIntegrationHealthStripModel({
    summary: {
      overall: "healthy",
      healthyCount: 1,
      degradedCount: 0,
      downCount: 0,
      stripeConfigured: true,
      emailConfigured: true,
    },
    failedWebhookCount: 0,
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
    ],
    now: new Date("2026-05-28T12:00:00.000Z"),
  });
}

function slice(over: Partial<ChannelPilotLiveProofSlice> = {}): ChannelPilotLiveProofSlice {
  const progress = evaluateChannelPilotSetupProgress({
    provider: "woocommerce",
    hasConnection: true,
    hasCredentials: true,
    hasWebhookSecret: true,
    hasStoreIdentity: true,
    certification: null,
  });

  return {
    provider: "WOOCOMMERCE",
    card: {
      id: "c1",
      provider: "WOOCOMMERCE",
      name: "Pilot Woo",
      status: "CONNECTED",
      lastSyncAt: new Date("2026-05-28T11:00:00.000Z"),
      lastError: null,
      hasWebhookSecret: true,
    },
    progress,
    operatorStatus: "wizard_incomplete",
    ...over,
  };
}

describe("pilot-integration-health-live-proof-era18 policy", () => {
  it("registers era18 pilot strip live proof proof", () => {
    expect(PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_POLICY_ID).toBe(
      "era18-pilot-integration-health-live-proof-v1",
    );
    expect(PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_PROOF_STATUS).toBe(
      "pilot_integration_health_live_proof_wired",
    );
    expect(PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_BACKLOG_ID).toBe("KOS-E18-047");
  });
});

describe("buildPilotIntegrationLiveProofRows", () => {
  it("surfaces incomplete pilot wizard as urgent when progress started", () => {
    const rows = buildPilotIntegrationLiveProofRows([slice()]);
    expect(rows.some((row) => row.id === "woocommerce-pilot-setup")).toBe(true);
    expect(rows[0]?.tone).toBe("urgent");
  });

  it("surfaces not-connected providers as normal setup rows", () => {
    const rows = buildPilotIntegrationLiveProofRows([
      slice({
        provider: "SHOPIFY",
        card: null,
        operatorStatus: "no_connection",
        progress: evaluateChannelPilotSetupProgress({
          provider: "shopify",
          hasConnection: false,
          hasCredentials: false,
          hasWebhookSecret: false,
          hasStoreIdentity: false,
          certification: null,
        }),
      }),
    ]);

    expect(rows[0]?.id).toBe("shopify-not-connected");
    expect(rows[0]?.tone).toBe("normal");
  });

  it("skips connection_blocked rows because connection errors show elsewhere", () => {
    const rows = buildPilotIntegrationLiveProofRows([
      slice({ operatorStatus: "connection_blocked" }),
    ]);
    expect(rows).toEqual([]);
  });
});

describe("refinePilotIntegrationHealthHeadlineForLiveProof", () => {
  it("prioritizes urgent pilot setup in headline", () => {
    const rows = buildPilotIntegrationLiveProofRows([slice()]);
    const headline = refinePilotIntegrationHealthHeadlineForLiveProof({
      overall: "healthy",
      headline: baseModel().headline,
      liveProofRows: rows,
    });
    expect(headline).toContain("pilot setup incomplete");
  });

  it("mentions engineering live smoke pending when in-app pilot is ready", () => {
    const rows = buildPilotIntegrationLiveProofRows([
      slice({
        operatorStatus: "awaiting_engineering_live_smoke",
        progress: evaluateChannelPilotSetupProgress({
          provider: "woocommerce",
          hasConnection: true,
          hasCredentials: true,
          hasWebhookSecret: true,
          hasStoreIdentity: true,
          certification: {
            provider: "woocommerce",
            lastRunAt: "2026-05-28T12:00:00.000Z",
            overall: "PASS",
            checks: [
              {
                id: "rest_api_reachable",
                label: "REST API reachable",
                status: "pass",
                message: "ok",
              },
              {
                id: "recent_valid_webhooks",
                label: "Recent valid webhooks",
                status: "pass",
                message: "ok",
              },
            ],
            productStatus: "BETA",
          },
        }),
      }),
    ]);

    const headline = refinePilotIntegrationHealthHeadlineForLiveProof({
      overall: "healthy",
      headline: baseModel().headline,
      liveProofRows: rows,
    });
    expect(headline.toLowerCase()).toContain("engineering live smoke");
  });
});

describe("augmentPilotIntegrationHealthStripWithLiveProof", () => {
  it("merges live proof rows into strip model", () => {
    const augmented = augmentPilotIntegrationHealthStripWithLiveProof(baseModel(), [slice()]);
    expect(augmented.hasLiveProofAttention).toBe(true);
    expect(augmented.liveProofRows.length).toBeGreaterThan(0);
    expect(augmented.headline).toContain("pilot setup incomplete");
  });
});

describe("summarizePilotIntegrationLiveProof", () => {
  it("counts urgent and pending live smoke rows", () => {
    const rows = buildPilotIntegrationLiveProofRows([
      slice(),
      slice({
        provider: "SHOPIFY",
        operatorStatus: "awaiting_engineering_live_smoke",
        progress: evaluateChannelPilotSetupProgress({
          provider: "shopify",
          hasConnection: true,
          hasCredentials: true,
          hasWebhookSecret: true,
          hasStoreIdentity: true,
          certification: {
            provider: "shopify",
            lastRunAt: "2026-05-28T12:00:00.000Z",
            overall: "PASS",
            checks: [
              {
                id: "rest_api_reachable",
                label: "REST API reachable",
                status: "pass",
                message: "ok",
              },
              {
                id: "recent_valid_webhooks",
                label: "Recent valid webhooks",
                status: "pass",
                message: "ok",
              },
            ],
            productStatus: "BETA",
          },
        }),
        card: {
          id: "c2",
          provider: "SHOPIFY",
          name: "Pilot Shopify",
          status: "CONNECTED",
          lastSyncAt: null,
          lastError: null,
          hasWebhookSecret: true,
        },
      }),
    ]);

    const summary = summarizePilotIntegrationLiveProof(rows);
    expect(summary.urgentCount).toBe(1);
    expect(summary.pendingLiveSmokeCount).toBe(1);
  });
});
