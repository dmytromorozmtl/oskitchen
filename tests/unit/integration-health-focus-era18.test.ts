import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_FOCUS_ERA18_BACKLOG_ID,
  INTEGRATION_HEALTH_FOCUS_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/integrations/integration-health-focus-era18-policy";
import {
  buildIntegrationHealthFocusSnapshot,
  pickIntegrationHealthAttentionItems,
  resolveIntegrationHealthRowNextAction,
  summarizeIntegrationHealthFocus,
} from "@/lib/integrations/integration-health-focus-era18";
import type { IntegrationHealthCard } from "@/services/developer/integration-health-service";

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

describe("integration-health-focus-era18 policy", () => {
  it("registers era18 integration health focus proof", () => {
    expect(INTEGRATION_HEALTH_FOCUS_ERA18_POLICY_ID).toBe("era18-integration-health-focus-v1");
    expect(INTEGRATION_HEALTH_FOCUS_ERA18_PROOF_STATUS).toBe(
      "integration_health_focus_attention_wired",
    );
    expect(INTEGRATION_HEALTH_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-022");
  });
});

describe("pickIntegrationHealthAttentionItems", () => {
  it("prioritizes connection errors and missing webhook secrets", () => {
    const snapshot = buildIntegrationHealthFocusSnapshot({
      summary: {
        overall: "down",
        healthyCount: 0,
        degradedCount: 0,
        downCount: 1,
        stripeConfigured: true,
        emailConfigured: true,
      },
      cards: [
        card({ status: "ERROR", provider: "SHOPIFY", name: "Shop", hasWebhookSecret: false }),
      ],
      failedWebhookCount: 3,
    });

    const items = pickIntegrationHealthAttentionItems(snapshot);
    expect(items[0]?.id).toBe("connection-errors");
    expect(items.some((item) => item.id === "missing-webhook-secret")).toBe(true);
    expect(items.some((item) => item.id === "webhook-backlog")).toBe(true);
  });

  it("surfaces stripe and email gaps when channels are healthy", () => {
    const snapshot = buildIntegrationHealthFocusSnapshot({
      summary: {
        overall: "degraded",
        healthyCount: 1,
        degradedCount: 1,
        downCount: 0,
        stripeConfigured: false,
        emailConfigured: false,
      },
      cards: [card()],
      failedWebhookCount: 0,
    });

    const items = pickIntegrationHealthAttentionItems(snapshot);
    expect(items.some((item) => item.id === "stripe-missing")).toBe(true);
    expect(items.some((item) => item.id === "email-missing")).toBe(true);
  });

  it("returns empty when pilot posture is clear", () => {
    const snapshot = buildIntegrationHealthFocusSnapshot({
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
    });

    expect(pickIntegrationHealthAttentionItems(snapshot)).toEqual([]);
  });
});

describe("resolveIntegrationHealthRowNextAction", () => {
  it("routes ERROR status to provider setup page", () => {
    const action = resolveIntegrationHealthRowNextAction(
      card({ status: "ERROR", provider: "SHOPIFY" }),
    );
    expect(action?.label).toBe("Reconnect integration");
    expect(action?.href).toBe("/dashboard/integrations/shopify");
    expect(action?.tone).toBe("urgent");
  });

  it("prompts webhook secret for pilot providers", () => {
    const action = resolveIntegrationHealthRowNextAction(
      card({ provider: "WOOCOMMERCE", hasWebhookSecret: false }),
    );
    expect(action?.label).toBe("Configure webhook secret");
    expect(action?.href).toBe("/dashboard/integrations/woocommerce");
  });

  it("returns null when connection is healthy", () => {
    expect(resolveIntegrationHealthRowNextAction(card())).toBeNull();
  });
});

describe("summarizeIntegrationHealthFocus", () => {
  it("flags urgent when webhooks backlog or stripe missing", () => {
    const snapshot = buildIntegrationHealthFocusSnapshot({
      summary: {
        overall: "degraded",
        healthyCount: 1,
        degradedCount: 0,
        downCount: 0,
        stripeConfigured: false,
        emailConfigured: true,
      },
      cards: [card()],
      failedWebhookCount: 2,
    });

    expect(summarizeIntegrationHealthFocus(snapshot).hasUrgent).toBe(true);
  });
});
