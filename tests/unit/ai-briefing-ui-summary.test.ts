import { describe, expect, it } from "vitest";

import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";
import {
  buildAiBriefingSectionSummaries,
  countCriticalAiBriefingAlerts,
} from "@/lib/ai/restaurant-brain-ui-summary";

const baseBriefing: DailyBriefing = {
  timestamp: new Date(),
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
    {
      item: "Rice",
      currentStock: 20,
      dailyUsage: 5,
      daysRemaining: 4,
      recommendedOrder: 10,
      urgency: "warning",
      message: "AI-assisted: trending",
      confidence: 0.75,
    },
  ],
  laborInsights: [
    {
      type: "understaffed",
      shift: "Thu dinner",
      role: "Kitchen",
      impact: 240,
      message: "AI-assisted: needs staff",
      confidence: 0.85,
    },
  ],
  menuInsights: [
    {
      item: "Chicken Bowl",
      foodCost: 38,
      margin: 34,
      trend: "declining",
      comparedToLastWeek: -8,
      recommendation: "AI-assisted: raise price",
      confidence: 0.84,
    },
  ],
  staffInsights: [],
  profitInsights: [
    {
      factor: "Food cost %",
      impact: 120,
      percentageOfRevenue: 33,
      trend: "declining",
      recommendation: "AI-assisted: review purchasing",
      confidence: 0.79,
    },
  ],
  weeklyForecast: {
    predictedRevenue: 4200,
    predictedOrders: 68,
    confidence: 0.87,
    factors: [{ name: "Order history", impact: "positive" }],
    recommendations: ["Review inventory alerts"],
  },
};

describe("restaurant brain ui summary", () => {
  it("counts critical alerts across categories", () => {
    expect(countCriticalAiBriefingAlerts(baseBriefing)).toBeGreaterThanOrEqual(2);
  });

  it("builds section headlines for dashboard cards", () => {
    const sections = buildAiBriefingSectionSummaries(baseBriefing);
    expect(sections).toHaveLength(5);
    expect(sections[0]?.headline).toContain("2 items need reordering");
    expect(sections[1]?.headline).toContain("Understaffed");
    expect(sections[2]?.headline).toContain("Chicken Bowl");
    expect(sections[4]?.headline).toContain("$4,200");
    expect(sections.every((s) => s.confidence > 0)).toBe(true);
  });
});
