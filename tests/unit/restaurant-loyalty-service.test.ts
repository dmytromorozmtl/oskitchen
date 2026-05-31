import { describe, expect, it } from "vitest";

import {
  DEFAULT_RESTAURANT_LOYALTY_CONFIG,
  parseRestaurantLoyaltyConfig,
} from "@/lib/loyalty/restaurant-loyalty-settings";
import {
  buildRestaurantLoyaltyEarnBreakdown,
  calculateItemBonusPoints,
  resolveTier,
  shouldAwardVisitReward,
} from "@/services/loyalty/restaurant-loyalty-service";

describe("restaurant loyalty service", () => {
  const config = {
    ...DEFAULT_RESTAURANT_LOYALTY_CONFIG,
    itemBonuses: [{ titleContains: "salmon", bonusPoints: 12 }],
  };

  it("awards item bonus points for matching lines", () => {
    const bonus = calculateItemBonusPoints(
      [{ title: "Grilled Salmon Bowl", productId: null, quantity: 2, lineTotal: 24 }],
      config.itemBonuses,
    );
    expect(bonus).toBe(24);
  });

  it("applies tier multiplier and visit reward", () => {
    const breakdown = buildRestaurantLoyaltyEarnBreakdown({
      orderTotal: 100,
      pointsPerDollar: 1,
      lines: [{ title: "Salmon plate", productId: null, quantity: 1, lineTotal: 30 }],
      config,
      lifetimePointsBefore: 480,
      visitCount: 5,
    });
    expect(breakdown.itemBonusPoints).toBe(12);
    expect(breakdown.visitBonusPoints).toBe(50);
    expect(breakdown.tierName).toBe("SILVER");
    expect(breakdown.totalPoints).toBeGreaterThan(100);
  });

  it("resolves highest qualifying tier", () => {
    const tier = resolveTier(1600, config.tiers);
    expect(tier.name).toBe("GOLD");
  });

  it("parses settings overrides", () => {
    const parsed = parseRestaurantLoyaltyConfig({
      enabled: true,
      visitRewardEvery: 10,
      visitRewardPoints: 100,
    });
    expect(parsed.visitRewardEvery).toBe(10);
    expect(shouldAwardVisitReward(10, parsed)).toBe(true);
  });
});
