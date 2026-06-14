/**
 * P0-9 — Transparent pricing tiers policy (Square parity on /pricing).
 *
 * @see docs/pricing-transparent-tiers-p0-9.md
 */

import {
  PRICING_TRANSPARENT_TIERS_P0_9_DOC,
  PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID,
  PRICING_TRANSPARENT_TIERS_P0_9_ROUTE,
  TRANSPARENT_PRICING_TIER_STRIP,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-content";

export {
  PRICING_TRANSPARENT_TIERS_P0_9_DOC,
  PRICING_TRANSPARENT_TIERS_P0_9_POLICY_ID,
  PRICING_TRANSPARENT_TIERS_P0_9_ROUTE,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-content";

export const PRICING_TRANSPARENT_TIERS_P0_9_COMPONENT =
  "components/marketing/transparent-pricing-tiers-bar.tsx" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_PROCESSING_COMPONENT =
  "components/marketing/pricing-processing-fees-disclosure.tsx" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_UNIT_TEST =
  "tests/unit/pricing-transparent-tiers-p0-9.test.ts" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_CHECK_NPM_SCRIPT =
  "check:pricing-transparent-tiers-p0-9" as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_REQUIRED_PRICES = {
  STARTER: 49,
  PRO: 79,
  TEAM: 199,
  ENTERPRISE: 499,
} as const;

export const PRICING_TRANSPARENT_TIERS_P0_9_WIRING_PATHS = [
  PRICING_TRANSPARENT_TIERS_P0_9_DOC,
  "lib/marketing/pricing-transparent-tiers-p0-9-content.ts",
  PRICING_TRANSPARENT_TIERS_P0_9_COMPONENT,
  PRICING_TRANSPARENT_TIERS_P0_9_PROCESSING_COMPONENT,
  "components/marketing/pricing-page.tsx",
  PRICING_TRANSPARENT_TIERS_P0_9_UNIT_TEST,
] as const;

export function auditTransparentPricingTierStrip(): string[] {
  const mismatches: string[] = [];
  for (const [key, expected] of Object.entries(PRICING_TRANSPARENT_TIERS_P0_9_REQUIRED_PRICES) as Array<
    [keyof typeof PRICING_TRANSPARENT_TIERS_P0_9_REQUIRED_PRICES, number]
  >) {
    const tier = TRANSPARENT_PRICING_TIER_STRIP.find((item) => item.key === key);
    if (!tier) {
      mismatches.push(`${key}: missing from tier strip`);
      continue;
    }
    if (tier.monthlyUsd !== expected) {
      mismatches.push(`${key}: expected $${expected}, got $${tier.monthlyUsd}`);
    }
  }
  return mismatches;
}
