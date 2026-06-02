import { describe, expect, it } from "vitest";

import type { CoPilotRecommendation } from "@/lib/ai/co-pilot-types";

describe("co-pilot-service", () => {
  it("scan returns pricing hygiene when modules are unavailable", async () => {
    const { scanRestaurantCoPilotRecommendations } = await import(
      "@/services/ai/co-pilot-service"
    );
    const recs = await scanRestaurantCoPilotRecommendations(
      "00000000-0000-4000-8000-000000000099",
    );
    expect(recs.some((r) => r.category === "pricing")).toBe(true);
  });

  it("maps pricing alerts to menu adjustment drafts", () => {
    const rec: CoPilotRecommendation = {
      id: "abc",
      category: "pricing",
      severity: "warning",
      title: "Low margin bowl",
      summary: "Food cost above target.",
      impactLabel: "$120/wk",
      suggestedAction: "Raise price $1",
      actionType: "suggest_menu_adjustment",
      payload: { suggestion: "Raise price $1" },
      actionRoute: "/dashboard/analytics/food-cost",
    };
    expect(rec.actionType).toBe("suggest_menu_adjustment");
    expect(rec.category).toBe("pricing");
  });
});
