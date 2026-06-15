import { describe, expect, it } from "vitest";

import { buildFoodCostTrend30d, gaugeTone } from "@/lib/ai/food-cost-dashboard-builders";

describe("buildFoodCostTrend30d", () => {
  it("aggregates snapshots by day", () => {
    const trend = buildFoodCostTrend30d([
      {
        createdAt: new Date("2026-05-01T10:00:00Z"),
        ingredientCost: 3,
        salePrice: 10,
        marginPercent: 50,
      },
      {
        createdAt: new Date("2026-05-01T14:00:00Z"),
        ingredientCost: 4,
        salePrice: 10,
        marginPercent: 40,
      },
      {
        createdAt: new Date("2026-05-02T10:00:00Z"),
        ingredientCost: 2,
        salePrice: 10,
        marginPercent: 60,
      },
    ]);

    expect(trend).toHaveLength(2);
    expect(trend[0]!.date).toBe("2026-05-01");
    expect(trend[0]!.foodCostPercent).toBe(35);
    expect(trend[0]!.marginPercent).toBe(45);
    expect(trend[0]!.sampleSize).toBe(2);
    expect(trend[1]!.foodCostPercent).toBe(20);
  });

  it("skips rows with zero sale price", () => {
    const trend = buildFoodCostTrend30d([
      {
        createdAt: new Date("2026-05-01T10:00:00Z"),
        ingredientCost: 3,
        salePrice: 0,
        marginPercent: 0,
      },
    ]);
    expect(trend).toHaveLength(0);
  });
});

describe("gaugeTone", () => {
  it("returns green when food cost is at or below target", () => {
    expect(gaugeTone(28, 30, "lower-is-better")).toBe("green");
  });

  it("returns yellow when margin is slightly below target", () => {
    expect(gaugeTone(35, 40, "higher-is-better")).toBe("yellow");
  });

  it("returns red when margin is far below target", () => {
    expect(gaugeTone(20, 40, "higher-is-better")).toBe("red");
  });
});
