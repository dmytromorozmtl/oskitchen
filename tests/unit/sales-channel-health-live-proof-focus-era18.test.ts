import { describe, expect, it } from "vitest";

import {
  SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID,
  SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
  SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS,
  SALES_CHANNEL_HEALTH_LIVE_PROOF_ROUTE,
} from "@/lib/integrations/sales-channel-health-live-proof-focus-era18-policy";
import {
  evaluateChannelLiveProofOperatorStatus,
  pickIntegrationHealthLiveProofAttentionItems,
  resolveSalesChannelHealthConnectionNextActionWithLiveProof,
  salesChannelHealthLiveProofPanelHref,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { type IntegrationHealthCard } from "@/lib/integrations/integration-health-focus-era18";
import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";

function card(over: Partial<IntegrationHealthCard> = {}): IntegrationHealthCard {
  return {
    id: "c1",
    provider: "WOOCOMMERCE",
    name: "Pilot Woo",
    status: "CONNECTED",
    lastSyncAt: new Date("2026-05-28T10:00:00Z"),
    lastError: null,
    hasWebhookSecret: true,
    ...over,
  };
}

function pilotReadyCertification(provider: "woocommerce" | "shopify") {
  return {
    provider,
    lastRunAt: "2026-05-28T12:00:00.000Z",
    overall: "PASS" as const,
    checks: [
      {
        id: "rest_api_reachable" as const,
        label: "REST API reachable",
        status: "pass" as const,
        message: "ok",
      },
      {
        id: "recent_valid_webhooks" as const,
        label: "Recent valid webhooks",
        status: "pass" as const,
        message: "ok",
      },
    ],
    productStatus: "BETA" as const,
  };
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
  const baseCard = card();
  return {
    provider: "WOOCOMMERCE",
    card: baseCard,
    progress,
    operatorStatus: evaluateChannelLiveProofOperatorStatus({ card: baseCard, progress }),
    ...over,
  };
}

describe("sales-channel-health-live-proof-focus-era18 policy", () => {
  it("registers era18 sales channel health live proof operator proof", () => {
    expect(SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-sales-channel-health-live-proof-focus-v1",
    );
    expect(SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS).toBe(
      "sales_channel_health_live_proof_operator_wired",
    );
    expect(SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-050");
    expect(SALES_CHANNEL_HEALTH_LIVE_PROOF_ROUTE).toBe("/dashboard/sales-channels/health");
  });
});

describe("salesChannelHealthLiveProofPanelHref", () => {
  it("anchors live proof panel on sales channel health route", () => {
    expect(salesChannelHealthLiveProofPanelHref()).toBe(
      "/dashboard/sales-channels/health#channel-live-proof",
    );
  });
});

describe("pickIntegrationHealthLiveProofAttentionItems sales channel href", () => {
  it("uses sales channel health anchor when configured", () => {
    const ready = slice({
      progress: evaluateChannelPilotSetupProgress({
        provider: "shopify",
        hasConnection: true,
        hasCredentials: true,
        hasWebhookSecret: true,
        hasStoreIdentity: true,
        certification: pilotReadyCertification("shopify"),
      }),
      provider: "SHOPIFY",
      card: card({ provider: "SHOPIFY" }),
      operatorStatus: "awaiting_engineering_live_smoke",
    });

    const items = pickIntegrationHealthLiveProofAttentionItems([ready], {
      liveProofPanelHref: salesChannelHealthLiveProofPanelHref(),
    });

    expect(items[0]?.href).toBe("/dashboard/sales-channels/health#channel-live-proof");
  });
});

describe("resolveSalesChannelHealthConnectionNextActionWithLiveProof", () => {
  it("routes incomplete pilot wizard to setup anchor", () => {
    const pilotSlice = slice();
    const action = resolveSalesChannelHealthConnectionNextActionWithLiveProof(
      card(),
      pilotSlice,
      null,
    );
    expect(action?.label).toBe("Continue pilot setup");
    expect(action?.tone).toBe("urgent");
  });

  it("routes in-app ready slice to local live proof panel", () => {
    const ready = slice({
      progress: evaluateChannelPilotSetupProgress({
        provider: "woocommerce",
        hasConnection: true,
        hasCredentials: true,
        hasWebhookSecret: true,
        hasStoreIdentity: true,
        certification: pilotReadyCertification("woocommerce"),
      }),
      operatorStatus: "awaiting_engineering_live_smoke",
    });

    const action = resolveSalesChannelHealthConnectionNextActionWithLiveProof(
      card(),
      ready,
      { status: "HEALTHY" },
    );
    expect(action?.label).toBe("Review live proof status");
    expect(action?.href).toBe("/dashboard/sales-channels/health#channel-live-proof");
  });

  it("prefers urgent connection errors over pilot setup", () => {
    const action = resolveSalesChannelHealthConnectionNextActionWithLiveProof(
      card({ status: "ERROR" }),
      slice(),
      null,
    );
    expect(action?.label).toBe("Reconnect integration");
  });

  it("falls back to failed health probe when no live proof action", () => {
    const action = resolveSalesChannelHealthConnectionNextActionWithLiveProof(
      card({ provider: "UBER_EATS" }),
      null,
      { status: "FAILED", errorMessage: "timeout" },
    );
    expect(action?.label).toBe("Fix failed health probe");
  });
});
