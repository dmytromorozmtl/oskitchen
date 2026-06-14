/**
 * P0-8 — Design Partner Program pilot SKU on /pricing.
 *
 * @see docs/pricing-pilot-sku-p0-8.md
 */

import {
  DESIGN_PARTNER_LOI_SKU,
  DESIGN_PARTNER_PROGRAM_DURATION_DAYS,
  DESIGN_PARTNER_PROGRAM_HEADLINE,
  DESIGN_PARTNER_PROGRAM_NAME,
} from "@/lib/marketing/pilot-pricing-skus";

export const PRICING_PILOT_SKU_P0_8_POLICY_ID = "p0-8-pricing-pilot-sku-v1" as const;

export const PRICING_PILOT_SKU_P0_8_DOC = "docs/pricing-pilot-sku-p0-8.md" as const;

export const PRICING_PILOT_SKU_P0_8_ROUTE = "/pricing" as const;

export const PRICING_PILOT_SKU_P0_8_SKU = DESIGN_PARTNER_LOI_SKU.sku;

export const PRICING_PILOT_SKU_P0_8_PROGRAM_NAME = DESIGN_PARTNER_PROGRAM_NAME;

export const PRICING_PILOT_SKU_P0_8_HEADLINE = DESIGN_PARTNER_PROGRAM_HEADLINE;

export const PRICING_PILOT_SKU_P0_8_DURATION_DAYS = DESIGN_PARTNER_PROGRAM_DURATION_DAYS;

export const PRICING_PILOT_SKU_P0_8_UNIT_TEST = "tests/unit/pricing-pilot-sku-p0-8.test.ts" as const;

export const PRICING_PILOT_SKU_P0_8_CHECK_NPM_SCRIPT = "check:pricing-pilot-sku-p0-8" as const;

export const PRICING_PILOT_SKU_P0_8_WIRING_PATHS = [
  PRICING_PILOT_SKU_P0_8_DOC,
  "lib/marketing/pilot-pricing-skus.ts",
  "lib/marketing/pricing-page-p1-30-content.ts",
  "components/marketing/design-partner-pricing-tier.tsx",
  "components/marketing/pilot-pricing-section.tsx",
  "app/pricing/page.tsx",
  "lib/marketing/pricing-faq.ts",
  PRICING_PILOT_SKU_P0_8_UNIT_TEST,
] as const;
