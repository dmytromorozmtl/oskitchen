import { describe, expect, it, vi } from "vitest";

import { deliverDailyBriefing } from "@/services/ai/briefing-delivery";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/ai/briefing-delivery-settings", () => ({
  loadBriefingDeliverySettings: vi.fn(),
  isBriefingDeliveryDue: vi.fn(() => true),
}));

vi.mock("@/services/ai/ai-restaurant-brain", () => ({
  generateDailyBriefing: vi.fn().mockResolvedValue({
    timestamp: new Date("2026-06-05T12:00:00.000Z"),
    workspaceId: "ws-1",
    aiAssisted: true,
    overallConfidence: 0.87,
    inventoryAlerts: [],
    laborInsights: [],
    menuInsights: [],
    staffInsights: [],
    profitInsights: [],
    weeklyForecast: { predictedRevenue: 1000, predictedOrders: 20, confidence: 0.8, factors: [], recommendations: [] },
  }),
}));

vi.mock("@/services/ai/predictive-alerts", () => ({
  generatePredictiveAlerts: vi.fn().mockResolvedValue([
    {
      id: "c1",
      type: "inventory_shortage",
      severity: "critical",
      title: "Stockout",
      description: "d",
      impact: 150,
      confidence: 0.9,
      suggestedAction: "Order",
      expiresAt: new Date(),
    },
  ]),
}));

vi.mock("@/lib/notifications/provider-resend", () => ({
  canSendEmails: vi.fn(() => false),
  getProviderMode: vi.fn(() => "log_only"),
}));

vi.mock("@/services/notifications/sms-service", () => ({
  sendSmsNotification: vi.fn().mockResolvedValue({ ok: true, sid: "SM123" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn().mockResolvedValue({ timezone: "UTC" }),
    },
    notificationLog: {
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
    },
  },
}));

describe("briefing delivery service (integration)", () => {
  it("delivers SMS for critical alerts when enabled", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");
    const { sendSmsNotification } = await import("@/services/notifications/sms-service");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: false, address: null, deliveryTimeLocal: "07:00" },
      sms: { enabled: true, number: "+15551234567", criticalOnly: true },
    });

    const result = await deliverDailyBriefing("ws-1", { force: true });

    expect(result.sms.attempted).toBe(true);
    expect(result.sms.ok).toBe(true);
    expect(sendSmsNotification).toHaveBeenCalled();
  });

  it("skips email when provider not configured", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: true, address: "owner@example.com", deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });

    const result = await deliverDailyBriefing("ws-1", { force: true });
    expect(result.email.attempted).toBe(true);
    expect(result.email.ok).toBe(false);
  });
});
