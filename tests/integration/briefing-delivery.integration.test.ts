import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  deliverDailyBriefing,
  deliverDailyBriefingForUser,
  deliverDailyBriefingIfScheduled,
} from "@/services/ai/briefing-delivery";

const { mockBriefing, criticalAlert, notificationLogCreate, resendSend } = vi.hoisted(() => {
  const briefing = {
    timestamp: "2026-06-05T12:00:00.000Z",
    workspaceId: "ws-1",
    aiAssisted: true,
    overallConfidence: 0.87,
    inventoryAlerts: [
      {
        item: "Chicken",
        currentStock: 5,
        dailyUsage: 10,
        daysRemaining: 0,
        recommendedOrder: 50,
        urgency: "critical" as const,
        message: "AI-assisted: short",
        confidence: 0.82,
      },
    ],
    laborInsights: [],
    menuInsights: [],
    staffInsights: [],
    profitInsights: [],
    weeklyForecast: {
      predictedRevenue: 1000,
      predictedOrders: 20,
      confidence: 0.8,
      factors: [],
      recommendations: [],
    },
  };

  return {
    mockBriefing: briefing,
    criticalAlert: {
      id: "c1",
      type: "inventory_shortage" as const,
      severity: "critical" as const,
      title: "Stockout",
      description: "d",
      impact: 150,
      confidence: 0.9,
      suggestedAction: "Order",
      expiresAt: new Date(),
    },
    notificationLogCreate: vi.fn().mockResolvedValue({ id: "log-1" }),
    resendSend: vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null }),
  };
});

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/ai/briefing-delivery-settings", () => ({
  loadBriefingDeliverySettings: vi.fn(),
  isBriefingDeliveryDue: vi.fn(() => true),
}));

vi.mock("@/services/ai/ai-restaurant-brain", () => ({
  generateDailyBriefing: vi.fn().mockResolvedValue(mockBriefing),
}));

vi.mock("@/services/ai/predictive-alerts", () => ({
  generatePredictiveAlerts: vi.fn().mockResolvedValue([criticalAlert]),
}));

vi.mock("@/lib/notifications/provider-resend", () => ({
  canSendEmails: vi.fn(() => false),
  getProviderMode: vi.fn(() => "log_only"),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendSend };
  },
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
      create: notificationLogCreate,
    },
  },
}));

describe("briefing delivery service (integration)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "OS Kitchen <briefings@example.com>";
    resendSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    const { generateDailyBriefing } = await import("@/services/ai/ai-restaurant-brain");
    const { generatePredictiveAlerts } = await import("@/services/ai/predictive-alerts");
    const { canSendEmails } = await import("@/lib/notifications/provider-resend");
    const { isBriefingDeliveryDue } = await import("@/lib/ai/briefing-delivery-settings");

    vi.mocked(generateDailyBriefing).mockResolvedValue(mockBriefing);
    vi.mocked(generatePredictiveAlerts).mockResolvedValue([criticalAlert]);
    vi.mocked(canSendEmails).mockReturnValue(false);
    vi.mocked(isBriefingDeliveryDue).mockReturnValue(true);
  });

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
    expect(sendSmsNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "+15551234567",
        body: expect.stringContaining("CRITICAL"),
      }),
    );
    expect(notificationLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateKey: "ai_daily_briefing_sms",
          triggerType: "ai_briefing_delivery",
          channel: "SMS",
          status: "SENT",
        }),
      }),
    );
  });

  it("skips email when provider not configured", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");
    const { canSendEmails } = await import("@/lib/notifications/provider-resend");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: true, address: "owner@example.com", deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });
    vi.mocked(canSendEmails).mockReturnValue(false);

    const result = await deliverDailyBriefing("ws-1", { force: true });
    expect(result.email.attempted).toBe(true);
    expect(result.email.ok).toBe(false);
    expect(result.email.reason).toContain("not configured");
    expect(notificationLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateKey: "ai_daily_briefing",
          channel: "EMAIL",
          status: "SKIPPED",
        }),
      }),
    );
  });

  it("sends formatted email when Resend is configured", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");
    const { canSendEmails } = await import("@/lib/notifications/provider-resend");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: true, address: "owner@example.com", deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });
    vi.mocked(canSendEmails).mockReturnValue(true);

    const result = await deliverDailyBriefing("ws-1", { force: true });

    expect(result.email.attempted).toBe(true);
    expect(result.email.ok).toBe(true);
    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: expect.stringContaining("OS Kitchen Daily Briefing"),
        html: expect.stringContaining("AI-assisted briefing"),
        text: expect.stringContaining("Chicken"),
      }),
    );
  });

  it("skips delivery outside configured schedule unless forced", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings, isBriefingDeliveryDue } = await import(
      "@/lib/ai/briefing-delivery-settings"
    );
    const { generateDailyBriefing } = await import("@/services/ai/ai-restaurant-brain");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: true, address: "owner@example.com", deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });
    vi.mocked(isBriefingDeliveryDue).mockReturnValue(false);

    const result = await deliverDailyBriefing("ws-1", { respectSchedule: true, force: false });

    expect(result.email.attempted).toBe(false);
    expect(result.email.reason).toContain("Outside configured delivery window");
    expect(generateDailyBriefing).not.toHaveBeenCalled();
  });

  it("skips SMS when no critical alerts qualify", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");
    const { generatePredictiveAlerts } = await import("@/services/ai/predictive-alerts");
    const { sendSmsNotification } = await import("@/services/notifications/sms-service");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: false, address: null, deliveryTimeLocal: "07:00" },
      sms: { enabled: true, number: "+15551234567", criticalOnly: true },
    });
    vi.mocked(generatePredictiveAlerts).mockResolvedValue([
      {
        ...criticalAlert,
        id: "w1",
        severity: "warning",
        title: "Busy Friday",
      },
    ]);

    const result = await deliverDailyBriefing("ws-1", { force: true });

    expect(result.sms.attempted).toBe(false);
    expect(result.sms.reason).toContain("No critical alerts");
    expect(sendSmsNotification).not.toHaveBeenCalled();
  });

  it("delivers on schedule via deliverDailyBriefingIfScheduled", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings, isBriefingDeliveryDue } = await import(
      "@/lib/ai/briefing-delivery-settings"
    );

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: true, address: "owner@example.com", deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });
    vi.mocked(isBriefingDeliveryDue).mockReturnValue(true);

    const result = await deliverDailyBriefingIfScheduled("ws-1");
    expect(result).not.toBeNull();
    expect(result?.workspaceId).toBe("ws-1");
  });

  it("returns null from deliverDailyBriefingIfScheduled when channels disabled", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");

    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: false, address: null, deliveryTimeLocal: "07:00" },
      sms: { enabled: false, number: null, criticalOnly: true },
    });

    await expect(deliverDailyBriefingIfScheduled("ws-1")).resolves.toBeNull();
  });

  it("resolves workspace from user via deliverDailyBriefingForUser", async () => {
    const { resolveOwnerWorkspaceId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    const { loadBriefingDeliverySettings } = await import("@/lib/ai/briefing-delivery-settings");

    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(loadBriefingDeliverySettings).mockResolvedValue({
      email: { enabled: false, address: null, deliveryTimeLocal: "07:00" },
      sms: { enabled: true, number: "+15551234567", criticalOnly: true },
    });

    const result = await deliverDailyBriefingForUser("user-1", { force: true });
    expect(result.workspaceId).toBe("ws-1");
    expect(result.sms.ok).toBe(true);
  });

  it("exposes dedicated CI script for briefing delivery integration", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:briefing-delivery-integration"]).toContain(
      "briefing-delivery.integration.test.ts",
    );
  });
});
