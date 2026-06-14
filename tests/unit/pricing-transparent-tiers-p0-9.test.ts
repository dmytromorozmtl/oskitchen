import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRICING_TRANSPARENT_TIERS_P0_9_HEADLINE,
  PRICING_TRANSPARENT_TIERS_P0_9_ROUTE,
  STRIPE_PROCESSING_DISCLOSURE,
  TRANSPARENT_PRICING_COMPARISON_HEADERS,
  TRANSPARENT_PRICING_TIER_STRIP,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-content";
import {
  PRICING_TRANSPARENT_TIERS_P0_9_COMPONENT,
  PRICING_TRANSPARENT_TIERS_P0_9_DOC,
  PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID,
  PRICING_TRANSPARENT_TIERS_P0_9_PROCESSING_COMPONENT,
  PRICING_TRANSPARENT_TIERS_P0_9_REQUIRED_PRICES,
  PRICING_TRANSPARENT_TIERS_P0_9_WIRING_PATHS,
  auditTransparentPricingTierStrip,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-policy";

const ROOT = process.cwd();

describe("transparent pricing tiers — Square parity (P0-9)", () => {
  it("locks P0-9 policy and published tier prices", () => {
    expect(PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID).toBe("p0-9-transparent-pricing-tiers-v1");
    expect(PRICING_TRANSPARENT_TIERS_P0_9_ROUTE).toBe("/pricing");
    expect(PRICING_TRANSPARENT_TIERS_P0_9_REQUIRED_PRICES).toEqual({
      STARTER: 49,
      PRO: 79,
      TEAM: 199,
      ENTERPRISE: 499,
    });
    expect(auditTransparentPricingTierStrip()).toEqual([]);
  });

  it("exposes all four tiers in the transparent price strip", () => {
    expect(TRANSPARENT_PRICING_TIER_STRIP).toHaveLength(4);
    expect(TRANSPARENT_PRICING_TIER_STRIP.map((tier) => tier.monthlyUsd)).toEqual([49, 79, 199, 499]);
    expect(PRICING_TRANSPARENT_TIERS_P0_9_HEADLINE.toLowerCase()).toContain("square");
  });

  it("includes prices in feature comparison column headers", () => {
    expect(TRANSPARENT_PRICING_COMPARISON_HEADERS.map((header) => header.label)).toEqual([
      "Starter · $49/mo",
      "Pro · $79/mo",
      "Team · $199/mo",
      "Enterprise · $499/mo",
    ]);
  });

  it("documents Stripe processing separation from software", () => {
    expect(STRIPE_PROCESSING_DISCLOSURE.headline.toLowerCase()).toContain("separate");
    expect(STRIPE_PROCESSING_DISCLOSURE.bullets.join(" ").toLowerCase()).toContain("stripe");
  });

  it("wires P0-9 components into /pricing page", () => {
    for (const rel of PRICING_TRANSPARENT_TIERS_P0_9_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, PRICING_TRANSPARENT_TIERS_P0_9_DOC), "utf8");
    expect(doc).toContain(PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID);
    expect(doc).toContain("$49");
    expect(doc).toContain("$499");

    const pricingPage = readFileSync(join(ROOT, "components/marketing/pricing-page.tsx"), "utf8");
    expect(pricingPage).toContain("TransparentPricingTiersBar");
    expect(pricingPage).toContain("PricingProcessingFeesDisclosure");
    expect(pricingPage).toContain("TRANSPARENT_PRICING_COMPARISON_HEADERS");

    expect(existsSync(join(ROOT, PRICING_TRANSPARENT_TIERS_P0_9_COMPONENT))).toBe(true);
    expect(existsSync(join(ROOT, PRICING_TRANSPARENT_TIERS_P0_9_PROCESSING_COMPONENT))).toBe(true);
  });
});
