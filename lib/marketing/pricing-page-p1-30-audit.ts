import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRICING_PAGE_P1_30_COMPONENT,
  PRICING_PAGE_P1_30_CONTENT_PATH,
  PRICING_PAGE_P1_30_DOC,
  PRICING_PAGE_P1_30_HONESTY_MARKERS,
  PRICING_PAGE_P1_30_PAGE,
  PRICING_PAGE_P1_30_POLICY_ID,
  PRICING_PAGE_P1_30_PRICING_PAGE,
  PRICING_PAGE_P1_30_SKU,
  PRICING_PAGE_P1_30_TIER_TEST_ID,
  PRICING_PAGE_P1_30_WIRING_PATHS,
} from "@/lib/marketing/pricing-page-p1-30-policy";

export type PricingPageP130AuditSummary = {
  policyId: typeof PRICING_PAGE_P1_30_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pricingPageWired: boolean;
  pageWired: boolean;
  skuWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPricingPageP130(root = process.cwd()): PricingPageP130AuditSummary {
  const wiringComplete = PRICING_PAGE_P1_30_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pricingPageWired = false;
  let pageWired = false;
  let skuWired = false;

  if (existsSync(join(root, PRICING_PAGE_P1_30_DOC))) {
    const source = readFileSync(join(root, PRICING_PAGE_P1_30_DOC), "utf8");
    docWired =
      source.includes(PRICING_PAGE_P1_30_POLICY_ID) &&
      source.includes(PRICING_PAGE_P1_30_TIER_TEST_ID) &&
      source.includes(PRICING_PAGE_P1_30_SKU);
  }

  if (existsSync(join(root, PRICING_PAGE_P1_30_COMPONENT))) {
    const source = readFileSync(join(root, PRICING_PAGE_P1_30_COMPONENT), "utf8");
    componentWired =
      source.includes("DesignPartnerPricingTier") &&
      source.includes("DESIGN_PARTNER_TIER_HEADLINE") &&
      source.includes("PRICING_PAGE_P1_30_TIER_TEST_ID");
  }

  if (existsSync(join(root, PRICING_PAGE_P1_30_PRICING_PAGE))) {
    const source = readFileSync(join(root, PRICING_PAGE_P1_30_PRICING_PAGE), "utf8");
    pricingPageWired = source.includes("DesignPartnerPricingTier");
  }

  if (existsSync(join(root, PRICING_PAGE_P1_30_PAGE))) {
    const source = readFileSync(join(root, PRICING_PAGE_P1_30_PAGE), "utf8");
    pageWired = source.includes("PricingPage");
  }

  const pilotSkusPath = "lib/marketing/pilot-pricing-skus.ts";
  if (existsSync(join(root, pilotSkusPath))) {
    const source = readFileSync(join(root, pilotSkusPath), "utf8");
    skuWired = source.includes(PRICING_PAGE_P1_30_SKU);
  }

  const combinedSources = [
    PRICING_PAGE_P1_30_DOC,
    PRICING_PAGE_P1_30_COMPONENT,
    PRICING_PAGE_P1_30_CONTENT_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PRICING_PAGE_P1_30_HONESTY_MARKERS.every((marker) =>
    combinedSources.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pricingPageWired &&
    pageWired &&
    skuWired &&
    honestyMarkersPresent;

  return {
    policyId: PRICING_PAGE_P1_30_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pricingPageWired,
    pageWired,
    skuWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPricingPageP130AuditLines(summary: PricingPageP130AuditSummary): string[] {
  return [
    `Pricing page P1-30 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PRICING_PAGE_P1_30_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component (${PRICING_PAGE_P1_30_TIER_TEST_ID}): ${summary.componentWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingPageWired ? "yes" : "no"}`,
    `Route page wired: ${summary.pageWired ? "yes" : "no"}`,
    `SKU (${PRICING_PAGE_P1_30_SKU}): ${summary.skuWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
