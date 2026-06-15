import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";
import {
  PILOT_DISCOUNT_PCT,
  PILOT_DURATION_MONTHS,
  PILOT_SUBSCRIPTION_SKUS,
} from "@/lib/marketing/pilot-pricing-skus";
import {
  PRICING_SKU_P3_135_PILOT_DISCOUNT_PCT,
  PRICING_SKU_P3_135_PILOT_MONTHLY_USD,
  PRICING_SKU_P3_135_PILOT_SKU,
  PRICING_SKU_P3_135_PILOT_TERM_MONTHS,
  PRICING_SKU_P3_135_PILOT_TOTAL_USD,
  PRICING_SKU_P3_135_POLICY_ID,
  PRICING_SKU_P3_135_STANDARD_MONTHLY_USD,
  PRICING_SKU_P3_135_STANDARD_SKU,
} from "@/lib/pm/pricing-sku-p3-135-policy";

export type PricingSkuRegistry = {
  version: string;
  policyId: typeof PRICING_SKU_P3_135_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  canonicalPair: {
    pilot: {
      sku: string;
      planKey: string;
      label: string;
      monthlyUsd: number;
      termMonths: number;
      totalUsd: number;
      discountPct: number;
    };
    standard: {
      sku: string;
      planKey: string;
      label: string;
      monthlyUsd: number;
    };
  };
  standardPlans: Array<{ sku: string; planKey: string; monthlyUsd: number }>;
  pilotDurationMonths: number;
  pilotDiscountPct: number;
  publishedOnPricingPage: boolean;
  implementationSource: string;
  billingSource: string;
};

export function loadPricingSkuRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/pricing-sku-registry.json",
): PricingSkuRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as PricingSkuRegistry;
}

export function computeLivePricingSkuPair(): {
  pilotSku: string;
  pilotMonthlyUsd: number;
  pilotTermMonths: number;
  pilotTotalUsd: number;
  standardSku: string;
  standardMonthlyUsd: number;
  discountPct: number;
} {
  const proPlan = PLAN_REGISTRY.PRO;
  const listMonthly = proPlan.priceMonthlyUsd ?? 0;
  const pilotMonthlyUsd = Math.round(listMonthly * (1 - PILOT_DISCOUNT_PCT / 100));

  const pilotSkuEntry = PILOT_SUBSCRIPTION_SKUS.find((sku) => sku.sku === PRICING_SKU_P3_135_PILOT_SKU);

  return {
    pilotSku: pilotSkuEntry?.sku ?? PRICING_SKU_P3_135_PILOT_SKU,
    pilotMonthlyUsd: pilotSkuEntry?.pilotMonthlyUsd ?? pilotMonthlyUsd,
    pilotTermMonths: PILOT_DURATION_MONTHS,
    pilotTotalUsd: (pilotSkuEntry?.pilotMonthlyUsd ?? pilotMonthlyUsd) * PILOT_DURATION_MONTHS,
    standardSku: PRICING_SKU_P3_135_STANDARD_SKU,
    standardMonthlyUsd: listMonthly,
    discountPct: PILOT_DISCOUNT_PCT,
  };
}

export function validatePricingSkuRegistry(
  registry: PricingSkuRegistry,
  live = computeLivePricingSkuPair(),
): {
  valid: boolean;
  policyIdMatches: boolean;
  canonicalPairMatches: boolean;
  standardPlansMatch: boolean;
} {
  const policyIdMatches = registry.policyId === PRICING_SKU_P3_135_POLICY_ID;

  const canonicalPairMatches =
    registry.canonicalPair.pilot.sku === PRICING_SKU_P3_135_PILOT_SKU &&
    registry.canonicalPair.standard.sku === PRICING_SKU_P3_135_STANDARD_SKU &&
    registry.canonicalPair.pilot.monthlyUsd === PRICING_SKU_P3_135_PILOT_MONTHLY_USD &&
    registry.canonicalPair.standard.monthlyUsd === PRICING_SKU_P3_135_STANDARD_MONTHLY_USD &&
    registry.canonicalPair.pilot.termMonths === PRICING_SKU_P3_135_PILOT_TERM_MONTHS &&
    registry.canonicalPair.pilot.totalUsd === PRICING_SKU_P3_135_PILOT_TOTAL_USD &&
    registry.canonicalPair.pilot.discountPct === PRICING_SKU_P3_135_PILOT_DISCOUNT_PCT &&
    registry.canonicalPair.pilot.monthlyUsd === live.pilotMonthlyUsd &&
    registry.canonicalPair.standard.monthlyUsd === live.standardMonthlyUsd &&
    registry.pilotDurationMonths === live.pilotTermMonths &&
    registry.pilotDiscountPct === live.discountPct;

  const standardPlansMatch =
    registry.standardPlans.length === 4 &&
    registry.standardPlans.every((entry) => {
      const plan = PLAN_REGISTRY[entry.planKey as keyof typeof PLAN_REGISTRY];
      return plan?.priceMonthlyUsd === entry.monthlyUsd;
    });

  const valid = policyIdMatches && canonicalPairMatches && standardPlansMatch;

  return {
    valid,
    policyIdMatches,
    canonicalPairMatches,
    standardPlansMatch,
  };
}
