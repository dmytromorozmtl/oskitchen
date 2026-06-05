import { describe, expect, it } from "vitest";

import {
  buildAutoCampaignRecommendations,
  buildMarketingManagerSnapshot,
  buildWeatherPromoRecommendations,
} from "@/lib/ai/marketing-manager-builders";
import {
  AI_MARKETING_MANAGER_POLICY_ID,
  AI_MARKETING_MANAGER_ROUTE,
  AI_MARKETING_MANAGER_SERVICE,
} from "@/lib/ai/marketing-manager-policy";

describe("AI marketing manager", () => {
  it("locks policy constants", () => {
    expect(AI_MARKETING_MANAGER_POLICY_ID).toBe("ai-marketing-manager-v1");
    expect(AI_MARKETING_MANAGER_SERVICE).toBe("services/ai/marketing-manager.ts");
    expect(AI_MARKETING_MANAGER_ROUTE).toBe("/dashboard/marketing/manager");
  });

  const flows = [
    { id: "welcome" as const, label: "Welcome email", configured: true },
    { id: "abandoned_cart" as const, label: "Abandoned cart", configured: true },
    { id: "post_purchase" as const, label: "Post-purchase", configured: false },
    { id: "win_back" as const, label: "Win-back", configured: true },
  ];

  it("builds auto campaigns with ready win-back when audience exists", () => {
    const campaigns = buildAutoCampaignRecommendations({
      flows,
      ordersLast7d: 42,
      churnRiskCount: 8,
      openCarts: 3,
      marketingConsentCount: 120,
      newCustomers30d: 15,
    });
    const winBack = campaigns.find((row) => row.id === "win_back");
    expect(winBack?.status).toBe("ready");
    expect(winBack?.audienceSize).toBe(8);
    const postPurchase = campaigns.find((row) => row.id === "post_purchase");
    expect(postPurchase?.status).toBe("blocked");
  });

  it("blocks campaigns without marketing consent", () => {
    const campaigns = buildAutoCampaignRecommendations({
      flows,
      ordersLast7d: 20,
      churnRiskCount: 5,
      openCarts: 2,
      marketingConsentCount: 0,
      newCustomers30d: 4,
    });
    expect(campaigns.find((row) => row.id === "win_back")?.status).toBe("blocked");
  });

  it("builds weather promos for rain and calendar events", () => {
    const rainDate = new Date("2026-06-05T12:00:00.000Z");
    const promos = buildWeatherPromoRecommendations(rainDate, "rain");
    const rainPromo = promos.find((row) => row.weather === "rain");
    expect(rainPromo).toBeDefined();
    expect(rainPromo?.offer).toContain("delivery");
  });

  it("assembles snapshot with daily brief", () => {
    const snapshot = buildMarketingManagerSnapshot({
      workspaceId: "ws-1",
      klaviyoConfigured: true,
      ordersLast7d: 30,
      churnRiskCount: 6,
      openCarts: 2,
      activeHolidayPackages: 1,
      marketingConsentCount: 80,
      newCustomers30d: 10,
      flows,
      analyzedAt: new Date("2026-06-05T10:00:00.000Z"),
      weather: "heat",
    });
    expect(snapshot.policyId).toBe(AI_MARKETING_MANAGER_POLICY_ID);
    expect(snapshot.dailyBrief.weatherMode).toBe("heat");
    expect(snapshot.weatherPromos.some((row) => row.weather === "heat")).toBe(true);
    expect(snapshot.aiAssisted).toBe(true);
  });
});
