import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeLivePricingSkuPair,
  loadPricingSkuRegistry,
  validatePricingSkuRegistry,
} from "@/lib/pm/pricing-sku-p3-135-operations";
import {
  PRICING_SKU_P3_135_ARTIFACT,
  PRICING_SKU_P3_135_BILLING_SOURCE,
  PRICING_SKU_P3_135_DOC,
  PRICING_SKU_P3_135_HONESTY_MARKERS,
  PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE,
  PRICING_SKU_P3_135_PILOT_MONTHLY_USD,
  PRICING_SKU_P3_135_PILOT_SKU,
  PRICING_SKU_P3_135_PILOT_TERM_MONTHS,
  PRICING_SKU_P3_135_PILOT_TOTAL_USD,
  PRICING_SKU_P3_135_POLICY_ID,
  PRICING_SKU_P3_135_RELATED_DOCS,
  PRICING_SKU_P3_135_STANDARD_MONTHLY_USD,
  PRICING_SKU_P3_135_STANDARD_SKU,
  PRICING_SKU_P3_135_WIRING_PATHS,
} from "@/lib/pm/pricing-sku-p3-135-policy";

export type PricingSkuP3_135AuditSummary = {
  policyId: typeof PRICING_SKU_P3_135_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveSourcesWired: boolean;
  relatedDocsReferenced: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPricingSkuP3_135(root = process.cwd()): PricingSkuP3_135AuditSummary {
  const wiringComplete = PRICING_SKU_P3_135_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;

  if (existsSync(join(root, PRICING_SKU_P3_135_DOC))) {
    const source = readFileSync(join(root, PRICING_SKU_P3_135_DOC), "utf8");
    docWired =
      source.includes(PRICING_SKU_P3_135_PILOT_SKU) &&
      source.includes(PRICING_SKU_P3_135_STANDARD_SKU) &&
      source.includes(`$${PRICING_SKU_P3_135_PILOT_MONTHLY_USD}`) &&
      source.includes(`$${PRICING_SKU_P3_135_STANDARD_MONTHLY_USD}`) &&
      source.includes(`$${PRICING_SKU_P3_135_PILOT_TOTAL_USD}`) &&
      source.includes(`${PRICING_SKU_P3_135_PILOT_TERM_MONTHS} months`) &&
      source.includes(PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE) &&
      source.includes(PRICING_SKU_P3_135_BILLING_SOURCE);
    relatedDocsReferenced = PRICING_SKU_P3_135_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
  }

  let registryValid = false;
  if (existsSync(join(root, PRICING_SKU_P3_135_ARTIFACT))) {
    const registry = loadPricingSkuRegistry(root);
    registryValid = validatePricingSkuRegistry(registry, computeLivePricingSkuPair()).valid;
  }

  let liveSourcesWired = false;
  if (
    existsSync(join(root, PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE)) &&
    existsSync(join(root, PRICING_SKU_P3_135_BILLING_SOURCE))
  ) {
    const impl = readFileSync(join(root, PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE), "utf8");
    liveSourcesWired =
      impl.includes("PILOT_SUBSCRIPTION_SKUS") &&
      impl.includes("PILOT_DISCOUNT_PCT") &&
      impl.includes("PILOT_DURATION_MONTHS") &&
      impl.includes('PILOT-${key.slice(0, 3)}-50');
  }

  const combinedSources = [PRICING_SKU_P3_135_DOC, PRICING_SKU_P3_135_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PRICING_SKU_P3_135_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveSourcesWired &&
    relatedDocsReferenced &&
    honestyMarkersPresent;

  return {
    policyId: PRICING_SKU_P3_135_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveSourcesWired,
    relatedDocsReferenced,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPricingSkuP3_135AuditLines(
  summary: PricingSkuP3_135AuditSummary,
): string[] {
  return [
    `Pricing SKU PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PRICING_SKU_P3_135_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live pricing sources: ${summary.liveSourcesWired ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
