import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkCommissionComparisonCalculatorAbsoluteFinalAudit,
  checkCommissionComparisonCalculatorCommissionFreeAudit,
  checkCommissionComparisonCalculatorLegacyWiring,
  checkCommissionComparisonCalculatorLiveWiring,
  loadCommissionComparisonCalculatorRegistry,
  validateCommissionComparisonCalculatorRegistry,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-operations";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ARTIFACT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_HONESTY_MARKERS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POSITIONING_LINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_RELATED_DOCS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

export type CommissionComparisonCalculatorP3_148AuditSummary = {
  policyId: typeof COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  absoluteFinalAuditPassed: boolean;
  commissionFreeAuditPassed: boolean;
  legacyCalculatorWiringPassed: boolean;
  liveCalculatorWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  featuresDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCommissionComparisonCalculatorP3_148(
  root = process.cwd(),
): CommissionComparisonCalculatorP3_148AuditSummary {
  const wiringComplete = COMMISSION_COMPARISON_CALCULATOR_P3_148_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let featuresDocumented = false;

  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC), "utf8");
    docWired =
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_POSITIONING_LINE) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF) &&
      source.includes(String(COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT)) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE);
    relatedDocsReferenced = COMMISSION_COMPARISON_CALCULATOR_P3_148_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    featuresDocumented = COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS.every((featureId) =>
      source.includes(featureId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_ARTIFACT))) {
    const registry = loadCommissionComparisonCalculatorRegistry(root);
    registryValid = validateCommissionComparisonCalculatorRegistry(registry).valid;
  }

  const absoluteFinalAuditPassed = checkCommissionComparisonCalculatorAbsoluteFinalAudit(root);
  const commissionFreeAuditPassed = checkCommissionComparisonCalculatorCommissionFreeAudit(root);
  const legacyCalculatorWiringPassed = checkCommissionComparisonCalculatorLegacyWiring(root);
  const liveCalculatorWiringPassed = checkCommissionComparisonCalculatorLiveWiring(root);

  const combinedSources = [
    COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC,
    COMMISSION_COMPARISON_CALCULATOR_P3_148_ARTIFACT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMMISSION_COMPARISON_CALCULATOR_P3_148_HONESTY_MARKERS.every(
    (marker) => combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    absoluteFinalAuditPassed &&
    commissionFreeAuditPassed &&
    legacyCalculatorWiringPassed &&
    liveCalculatorWiringPassed &&
    relatedDocsReferenced &&
    featuresDocumented &&
    honestyMarkersPresent;

  return {
    policyId: COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    absoluteFinalAuditPassed,
    commissionFreeAuditPassed,
    legacyCalculatorWiringPassed,
    liveCalculatorWiringPassed,
    relatedDocsReferenced,
    featuresDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCommissionComparisonCalculatorP3_148AuditLines(
  summary: CommissionComparisonCalculatorP3_148AuditSummary,
): string[] {
  return [
    `Commission comparison calculator ChowNow audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Absolute-final calculator audit: ${summary.absoluteFinalAuditPassed ? "PASS" : "FAIL"}`,
    `Commission-free ordering audit: ${summary.commissionFreeAuditPassed ? "PASS" : "FAIL"}`,
    `Legacy calculator wiring: ${summary.legacyCalculatorWiringPassed ? "PASS" : "FAIL"}`,
    `Live calculator hub: ${summary.liveCalculatorWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `6 calculator features documented: ${summary.featuresDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
