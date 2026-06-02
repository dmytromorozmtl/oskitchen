import { describe, expect, it } from "vitest";

import { LOYALTY_2_TIER_LADDER } from "@/lib/loyalty/restaurant-loyalty-settings";
import {
  parseCustomerBirthdayMmDd,
  previewLoyalty2Earn,
  todayMmDd,
} from "@/services/loyalty/loyalty-2.0-service";
import type { Loyalty2Program } from "@/services/loyalty/loyalty-2.0-service";
import { resolveVisitFreeItemReward } from "@/services/loyalty/restaurant-loyalty-service";
import { DEFAULT_RESTAURANT_LOYALTY_CONFIG } from "@/lib/loyalty/restaurant-loyalty-settings";

describe("loyalty-2.0-service", () => {
  it("parses customer birthday from tags", () => {
    expect(parseCustomerBirthdayMmDd({ birthday: "03-15" })).toBe("03-15");
    expect(parseCustomerBirthdayMmDd({ birthday: "1990-06-02" })).toBe("06-02");
  });

  it("previews item bonus and tier for espresso", () => {
    const program: Loyalty2Program = {
      ...DEFAULT_RESTAURANT_LOYALTY_CONFIG,
      pointsPerDollar: 1,
      redeemPointsThreshold: 100,
      redeemValueCents: 500,
      programActive: true,
    };
    const preview = previewLoyalty2Earn(program, {
      orderTotal: 4,
      lines: [{ title: "Double Espresso", productId: null, quantity: 1, lineTotal: 4 }],
      lifetimePointsBefore: 0,
      visitCount: 1,
    });
    expect(preview.breakdown.itemBonusPoints).toBeGreaterThanOrEqual(5);
    expect(preview.breakdown.tierName).toBe("SILVER");
  });

  it("awards free item on 10th coffee visit", () => {
    const reward = resolveVisitFreeItemReward(
      10,
      [{ title: "Iced Coffee", productId: null, quantity: 1, lineTotal: 5 }],
      DEFAULT_RESTAURANT_LOYALTY_CONFIG,
    );
    expect(reward).toMatch(/coffee/i);
  });

  it("exposes Silver / Gold / Platinum ladder", () => {
    expect(LOYALTY_2_TIER_LADDER.map((t) => t.name)).toEqual([
      "SILVER",
      "GOLD",
      "PLATINUM",
    ]);
    expect(LOYALTY_2_TIER_LADDER[1]?.minLifetimePoints).toBe(501);
  });

  it("formats today as MM-DD", () => {
    expect(todayMmDd("UTC")).toMatch(/^\d{2}-\d{2}$/);
  });
});
