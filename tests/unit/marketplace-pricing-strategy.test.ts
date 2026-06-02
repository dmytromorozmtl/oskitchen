import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VENDOR_PLAN_MONTHLY_FEE_USD,
  commissionRateForPlan,
} from "@/lib/marketplace/billing-integration-types";
import { MARKETPLACE_FEATURED_SLOT_PRICING_USD } from "@/lib/marketplace/featured-placement-types";

const STRATEGY_PATH = join(process.cwd(), "docs/marketplace-pricing-strategy.md");

describe("marketplace pricing strategy doc", () => {
  it("exists with revenue model and honesty rules", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    expect(doc).toContain("# Marketplace pricing strategy — OS Kitchen");
    expect(doc).toContain("marketplace-pricing-strategy-v1");
    expect(doc).toContain("## Revenue model");
    expect(doc).toContain("## Vendor plan tiers");
    expect(doc).toContain("What sales can say");
    expect(doc).toContain("no live GMV");
    expect(doc).toContain("billing-integration-types.ts");
  });

  it("matches coded vendor tiers and featured slot pricing", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    expect(doc).toContain(`$${VENDOR_PLAN_MONTHLY_FEE_USD.GROWTH}`);
    expect(doc).toContain(`${commissionRateForPlan("FREE")}%`);
    expect(doc).toContain(`${commissionRateForPlan("GROWTH")}%`);
    expect(doc).toContain(`${commissionRateForPlan("ENTERPRISE")}%`);
    expect(doc).toContain(
      `$${MARKETPLACE_FEATURED_SLOT_PRICING_USD.homepage_hero.weeklyUsd}`,
    );
    expect(doc).toContain("Task 109");
  });
});
