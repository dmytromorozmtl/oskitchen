import { describe, expect, it } from "vitest";

import {
  buildLoyalty3CrossBrandLane,
  buildLoyalty3DashboardSnapshot,
  buildLoyalty3VipMember,
} from "@/lib/loyalty/loyalty-3-builders";
import {
  LOYALTY_3_PATH,
  LOYALTY_3_POLICY_ID,
  LOYALTY_3_SERVICE,
  LOYALTY_3_VIP_MULTIPLIER_DEFAULT,
} from "@/lib/loyalty/loyalty-3-policy";
import { DEFAULT_LOYALTY_3_CONFIG, parseLoyalty3Config } from "@/lib/loyalty/loyalty-3-settings";
import {
  applyLoyalty3EarnMultiplier,
  resolveLoyalty3VipMultiplier,
} from "@/services/loyalty/loyalty-3.0-service";
import { DEFAULT_RESTAURANT_LOYALTY_CONFIG } from "@/lib/loyalty/restaurant-loyalty-settings";
import type { Loyalty3Program } from "@/lib/loyalty/loyalty-3-types";

describe("Loyalty 3.0", () => {
  it("locks policy constants", () => {
    expect(LOYALTY_3_POLICY_ID).toBe("loyalty-3-v1");
    expect(LOYALTY_3_SERVICE).toBe("services/loyalty/loyalty-3.0-service.ts");
    expect(LOYALTY_3_PATH).toBe("/dashboard/loyalty/loyalty-3");
    expect(LOYALTY_3_VIP_MULTIPLIER_DEFAULT).toBe(1.25);
  });

  it("parses loyalty 3 config with defaults", () => {
    expect(parseLoyalty3Config(null)).toEqual(DEFAULT_LOYALTY_3_CONFIG);
    expect(
      parseLoyalty3Config({ crossBrandEnabled: false, vipMultiplier: 1.5 }),
    ).toMatchObject({ crossBrandEnabled: false, vipMultiplier: 1.5 });
  });

  it("resolves VIP multiplier for VIP status and high LTV", () => {
    const config = DEFAULT_LOYALTY_3_CONFIG;
    expect(
      resolveLoyalty3VipMultiplier({
        config,
        customerStatus: "VIP",
        lifetimeValueCents: 0,
      }),
    ).toBe(1.25);
    expect(
      resolveLoyalty3VipMultiplier({
        config,
        customerStatus: "ACTIVE",
        lifetimeValueCents: 60000,
      }),
    ).toBe(1.25);
    expect(
      resolveLoyalty3VipMultiplier({
        config,
        customerStatus: "ACTIVE",
        lifetimeValueCents: 1000,
      }),
    ).toBe(1);
  });

  it("applies VIP earn multiplier to base points", () => {
    const program: Loyalty3Program = {
      ...DEFAULT_RESTAURANT_LOYALTY_CONFIG,
      pointsPerDollar: 1,
      redeemPointsThreshold: 100,
      redeemValueCents: 500,
      programActive: true,
      v3: DEFAULT_LOYALTY_3_CONFIG,
    };
    expect(
      applyLoyalty3EarnMultiplier(100, program, { status: "VIP", lifetimeValueCents: 0 }),
    ).toBe(125);
  });

  it("builds cross-brand lane and dashboard snapshot", () => {
    const lane = buildLoyalty3CrossBrandLane({
      brandId: "brand-1",
      brandName: "Brand A",
      memberCount: 12,
      pointsEarned: 480,
    });
    expect(lane.brandName).toBe("Brand A");

    const snapshot = buildLoyalty3DashboardSnapshot({
      program: {
        ...DEFAULT_RESTAURANT_LOYALTY_CONFIG,
        pointsPerDollar: 1,
        redeemPointsThreshold: 100,
        redeemValueCents: 500,
        programActive: true,
        v3: DEFAULT_LOYALTY_3_CONFIG,
      },
      crossBrandLanes: [lane],
      vipMembers: [
        buildLoyalty3VipMember({
          customerId: "cust-1",
          displayName: "Jane VIP",
          pointsBalance: 320,
          tier: "GOLD",
          lifetimeValueCents: 80000,
        }),
      ],
      eventOpportunities: [],
      referralStats: {
        completedReferrals: 2,
        pendingReferrals: 1,
        bonusPointsAwarded: 100,
        recentReferrals: [],
      },
      totalMembers: 15,
    });

    expect(snapshot.policyId).toBe(LOYALTY_3_POLICY_ID);
    expect(snapshot.basePath).toBe(LOYALTY_3_PATH);
    expect(snapshot.summary.crossBrandPoints).toBe(480);
    expect(snapshot.summary.vipCount).toBe(1);
  });
});
