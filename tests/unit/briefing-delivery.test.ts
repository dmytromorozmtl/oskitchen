import { describe, expect, it } from "vitest";

import {
  formatBriefingEmail,
  formatBriefingEmailSubject,
  formatCriticalAlertsSms,
  pickCriticalAlertsForSms,
} from "@/lib/ai/briefing-delivery-format";
import {
  isBriefingDeliveryDue,
  mergeBriefingDeliverySettings,
} from "@/lib/ai/briefing-delivery-settings";
import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";
import type { PredictiveAlert } from "@/lib/ai/predictive-alerts-types";

const briefing: DailyBriefing = {
  timestamp: new Date("2026-06-05T12:00:00.000Z"),
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
      urgency: "critical",
      message: "AI-assisted: short",
      confidence: 0.82,
    },
  ],
  laborInsights: [],
  menuInsights: [],
  staffInsights: [],
  profitInsights: [],
  weeklyForecast: {
    predictedRevenue: 4200,
    predictedOrders: 68,
    confidence: 0.87,
    factors: [],
    recommendations: ["Review inventory"],
  },
};

const alerts: PredictiveAlert[] = [
  {
    id: "a1",
    type: "inventory_shortage",
    severity: "critical",
    title: "Stockout: Tomatoes",
    description: "d",
    impact: 200,
    confidence: 0.9,
    suggestedAction: "Order today",
    expiresAt: new Date(),
  },
];

describe("briefing delivery format", () => {
  it("builds HTML email with AI-assisted label and sections", () => {
    const html = formatBriefingEmail(briefing, alerts);
    expect(html).toContain("AI-assisted briefing");
    expect(html).toContain("Inventory");
    expect(html).toContain("Chicken");
    expect(html).toContain("Predictive alerts");
    expect(html).toContain("critical");
  });

  it("formats email subject with date", () => {
    expect(formatBriefingEmailSubject(briefing)).toContain("OS Kitchen Daily Briefing");
  });

  it("formats critical SMS body", () => {
    const sms = formatCriticalAlertsSms(alerts);
    expect(sms).toContain("CRITICAL");
    expect(sms).toContain("Stockout: Tomatoes");
  });

  it("filters SMS alerts when criticalOnly", () => {
    const mixed: PredictiveAlert[] = [
      ...alerts,
      {
        id: "w1",
        type: "demand_surge",
        severity: "warning",
        title: "Busy Friday",
        description: "d",
        impact: 100,
        confidence: 0.7,
        suggestedAction: "Prep",
        expiresAt: new Date(),
      },
    ];
    expect(pickCriticalAlertsForSms(mixed, true)).toHaveLength(1);
    expect(pickCriticalAlertsForSms(mixed, false).length).toBeGreaterThan(1);
  });
});

describe("briefing delivery settings", () => {
  it("merges partial settings with defaults", () => {
    const merged = mergeBriefingDeliverySettings({
      email: { enabled: true, deliveryTimeLocal: "06:30" },
    });
    expect(merged.email.enabled).toBe(true);
    expect(merged.email.deliveryTimeLocal).toBe("06:30");
    expect(merged.sms.criticalOnly).toBe(true);
  });

  it("detects delivery window in timezone", () => {
    const due = isBriefingDeliveryDue(
      "07:00",
      "America/New_York",
      new Date("2026-06-05T11:05:00.000Z"),
      15,
    );
    expect(due).toBe(true);
  });
});
