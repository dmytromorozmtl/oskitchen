/**
 * Blueprint P1-30 — Public Design Partner tier content for /pricing.
 */

import { DESIGN_PARTNER_LOI_SKU, PILOT_DURATION_MONTHS } from "@/lib/marketing/pilot-pricing-skus";
import {
  PRICING_PAGE_P1_30_SKU,
  PRICING_PAGE_P1_30_TIER_TEST_ID,
} from "@/lib/marketing/pricing-page-p1-30-policy";

export const DESIGN_PARTNER_TIER_NAME = "Design Partner" as const;

export const DESIGN_PARTNER_TIER_HEADLINE =
  "Design Partner — $0 platform during LOI term" as const;

export const DESIGN_PARTNER_TIER_SUBLINE =
  "Qualified meal prep, ghost kitchen, and commissary operators: join the design partner cohort with a non-binding LOI, staging workspace, and weekly product feedback — before committing to a paid pilot SOW." as const;

export const DESIGN_PARTNER_TIER_PRICE_LABEL = "$0" as const;

export const DESIGN_PARTNER_TIER_PRICE_SUFFIX = `/ ${PILOT_DURATION_MONTHS}-month LOI` as const;

export const DESIGN_PARTNER_TIER_SKU = PRICING_PAGE_P1_30_SKU;

export const DESIGN_PARTNER_TIER_INCLUDES = DESIGN_PARTNER_LOI_SKU.includes;

export const DESIGN_PARTNER_TIER_CTA = {
  label: DESIGN_PARTNER_LOI_SKU.ctaLabel,
  href: `${DESIGN_PARTNER_LOI_SKU.ctaHref}?utm_source=pricing&utm_medium=design_partner_tier&utm_campaign=p1-30`,
} as const;

export const DESIGN_PARTNER_TIER_DISCLAIMER =
  "Non-binding LOI — ICP qualification required. Platform modules ship at current BETA / pilot_ready maturity; verify LIVE integration status for your channels. Paid pilot SOW optional at term end." as const;

export const DESIGN_PARTNER_TIER_ICP_TAGS = [
  "Meal prep",
  "Ghost kitchen",
  "Commissary",
  "Multi-brand delivery",
] as const;

export { PRICING_PAGE_P1_30_TIER_TEST_ID };
