/**
 * Blueprint P1-30 — Public Design Partner tier content for /pricing.
 */

import {
  DESIGN_PARTNER_LOI_SKU,
  DESIGN_PARTNER_PROGRAM_DURATION_DAYS,
  DESIGN_PARTNER_PROGRAM_HEADLINE,
  DESIGN_PARTNER_PROGRAM_NAME,
} from "@/lib/marketing/pilot-pricing-skus";
import {
  PRICING_PAGE_P1_30_SKU,
  PRICING_PAGE_P1_30_TIER_TEST_ID,
} from "@/lib/marketing/pricing-page-p1-30-policy";

export const DESIGN_PARTNER_TIER_NAME = DESIGN_PARTNER_PROGRAM_NAME;

export const DESIGN_PARTNER_TIER_HEADLINE = DESIGN_PARTNER_PROGRAM_HEADLINE;

export const DESIGN_PARTNER_TIER_SUBLINE =
  "Qualified meal prep, ghost kitchen, and commissary operators: join the Design Partner Program with a non-binding LOI, staging workspace, and weekly product feedback — free platform access for 90 days before committing to a paid pilot SOW." as const;

export const DESIGN_PARTNER_TIER_PRICE_LABEL = "$0" as const;

export const DESIGN_PARTNER_TIER_PRICE_SUFFIX =
  `/ ${DESIGN_PARTNER_PROGRAM_DURATION_DAYS} days` as const;

export const DESIGN_PARTNER_TIER_SKU = PRICING_PAGE_P1_30_SKU;

export const DESIGN_PARTNER_TIER_INCLUDES = DESIGN_PARTNER_LOI_SKU.includes;

export const DESIGN_PARTNER_TIER_CTA = {
  label: DESIGN_PARTNER_LOI_SKU.ctaLabel,
  href: `${DESIGN_PARTNER_LOI_SKU.ctaHref}?utm_source=pricing&utm_medium=design_partner_program&utm_campaign=p0-8-pilot-sku`,
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
