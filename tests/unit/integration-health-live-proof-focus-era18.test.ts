import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import {
  channelPilotLiveProofSetupHref,
  evaluateChannelLiveProofOperatorStatus,
  formatChannelLiveProofOperatorStatus,
  mergeLiveProofIntoIntegrationHealthSnapshot,
  pickIntegrationHealthAttentionItemsWithLiveProof,
  pickIntegrationHealthLiveProofAttentionItems,
  resolveIntegrationHealthRowNextActionWithLiveProof,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import {
  buildIntegrationHealthFocusSnapshot,
  type IntegrationHealthCard,
} from "@/lib/integrations/integration-health-focus-era18";
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

describe("integration-health-live-proof-focus-era18 policy", () => {
  it("registers era18 integration health live proof operator proof", () => {
    expect(INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-integration-health-live-proof-focus-v1",
    );
    expect(INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS).toBe(
      "integration_health_live_proof_operator_wired",
    );
    expect(INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-046");
  });
});

describe("evaluateChannelLiveProofOperatorStatus", () => {
  it("returns awaiting_engineering_live_smoke when pilot wizard is complete", () => {
    const progress = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: true,
      hasCredentials: true,
      hasWebhookSecret: true,
      hasStoreIdentity: true,
      certification: pilotReadyCertification("woocommerce"),
    });
    const wooCard = card();
    expect(
      evaluateChannelLiveProofOperatorStatus({
        card: wooCard,
        progress,
      }),
    ).toBe("awaiting_engineering_live_smoke");
  });

  it("returns connection_blocked for ERROR status", () => {
    const progress = evaluateChannelPilotSetupProgress({
      provider: "shopify",
      hasConnection: true,
      hasCredentials: false,
      hasWebhookSecret: false,
      hasStoreIdentity: false,
      certification: null,
    });
    expect(
      evaluateChannelLiveProofOperatorStatus({
        card: card({ provider: "SHOPIFY", status: "ERROR" }),
        progress,
      }),
    ).toBe("connection_blocked");
  });
});

describe("pickIntegrationHealthLiveProofAttentionItems", () => {
  it("surfaces incomplete pilot wizard before live smoke pending", () => {
    const pilotSlice = slice();
    const items = pickIntegrationHealthLiveProofAttentionItems([pilotSlice]);
    const remainingSteps =
      pilotSlice.progress.totalCount - pilotSlice.progress.completedCount;
    expect(items.some((item) => item.id === "woocommerce-pilot-setup")).toBe(true);
    expect(items[0]?.tone).toBe("urgent");
    expect(items[0]?.detail).toContain(`${remainingSteps} step`);
  });

  it("surfaces live smoke pending when in-app pilot is ready", () => {
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

    const items = pickIntegrationHealthLiveProofAttentionItems([ready]);
    expect(items.some((item) => item.id === "shopify-awaiting-live-smoke")).toBe(true);
    expect(items[0]?.detail.toLowerCase()).toContain("engineering live smoke");
  });
});

describe("resolveIntegrationHealthRowNextActionWithLiveProof", () => {
  it("routes incomplete pilot wizard to setup anchor", () => {
    const pilotSlice = slice();
    const action = resolveIntegrationHealthRowNextActionWithLiveProof(card(), pilotSlice);
    expect(action?.label).toBe("Continue pilot setup");
    expect(action?.href).toBe(
      channelPilotLiveProofSetupHref("WOOCOMMERCE", pilotSlice.progress.currentStepId ?? "save_credentials"),
    );
  });

  it("prefers urgent connection errors over pilot setup", () => {
    const action = resolveIntegrationHealthRowNextActionWithLiveProof(
      card({ status: "ERROR" }),
      slice(),
    );
    expect(action?.label).toBe("Reconnect integration");
  });
});

describe("pickIntegrationHealthAttentionItemsWithLiveProof", () => {
  it("merges channel and live proof attention items", () => {
    const snapshot = mergeLiveProofIntoIntegrationHealthSnapshot(
      buildIntegrationHealthFocusSnapshot({
        summary: {
          overall: "healthy",
          healthyCount: 1,
          degradedCount: 0,
          downCount: 0,
          stripeConfigured: true,
          emailConfigured: true,
        },
        cards: [card()],
        failedWebhookCount: 0,
      }),
      [slice()],
    );

    const items = pickIntegrationHealthAttentionItemsWithLiveProof(snapshot);
    expect(items.some((item) => item.id === "woocommerce-pilot-setup")).toBe(true);
  });
});

describe("formatChannelLiveProofOperatorStatus", () => {
  it("uses honest operator-facing labels", () => {
    expect(formatChannelLiveProofOperatorStatus("awaiting_engineering_live_smoke")).toContain(
      "engineering live smoke pending",
    );
  });
});
