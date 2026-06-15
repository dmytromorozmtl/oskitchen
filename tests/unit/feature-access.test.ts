import { describe, expect, it } from "vitest";

import { planAllowsFeature, requiredPlanForFeature } from "@/lib/feature-access";

describe("feature-access", () => {
  it("gates Shopify on Starter", () => {
    expect(planAllowsFeature("STARTER", "channels_shopify")).toBe(false);
    expect(planAllowsFeature("PRO", "channels_shopify")).toBe(true);
  });

  it("gates Uber on Team+", () => {
    expect(planAllowsFeature("PRO", "channels_uber")).toBe(false);
    expect(planAllowsFeature("TEAM", "channels_uber")).toBe(true);
  });

  it("requiredPlanForFeature returns TEAM for uber", () => {
    expect(requiredPlanForFeature("channels_uber")).toBe("TEAM");
  });
});
