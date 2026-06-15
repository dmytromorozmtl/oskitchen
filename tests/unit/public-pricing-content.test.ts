import { describe, expect, it } from "vitest";

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";
import {
  PUBLIC_PRICING_PLANS,
  PUBLIC_PRICING_UNIVERSAL_BENEFITS,
  signupHrefForPlan,
} from "@/lib/marketing/public-pricing-content";

describe("public pricing content", () => {
  it("exposes four plans at published list prices", () => {
    expect(PUBLIC_PRICING_PLANS).toHaveLength(4);
    expect(PLAN_REGISTRY.STARTER.priceMonthlyUsd).toBe(49);
    expect(PLAN_REGISTRY.PRO.priceMonthlyUsd).toBe(79);
    expect(PLAN_REGISTRY.TEAM.priceMonthlyUsd).toBe(199);
    expect(PLAN_REGISTRY.ENTERPRISE.priceMonthlyUsd).toBe(499);
  });

  it("links self-serve checkout tiers to signup with plan param", () => {
    expect(signupHrefForPlan("STARTER")).toBe("/signup?plan=STARTER");
    expect(signupHrefForPlan("PRO")).toBe("/signup?plan=PRO");
    expect(signupHrefForPlan("TEAM")).toBe("/signup?plan=TEAM");
  });

  it("includes universal trial benefits on every plan card", () => {
    for (const benefit of PUBLIC_PRICING_UNIVERSAL_BENEFITS) {
      expect(PUBLIC_PRICING_PLANS[0].bullets).toContain(benefit);
    }
    expect(PUBLIC_PRICING_PLANS.find((p) => p.key === "PRO")?.badge).toBe("Most Popular");
  });
});
