import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCommissionComparisonCalculatorWiring } from "@/lib/marketing/commission-comparison-calculator-audit";
import { auditCommissionFreeOrderingP2_113 } from "@/lib/marketing/commission-free-ordering-p2-113-audit";
import { COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES } from "@/lib/marketing/commission-comparison-calculator-p3-148-content";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPONENT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_ABSOLUTE_FINAL,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_CALCULATOR,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_PUBLIC_PAGE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PAGE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_SECONDARY_REF,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

export type CommissionComparisonCalculatorFeatureRecord = {
  id: string;
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type CommissionComparisonCalculatorRegistry = {
  version: string;
  policyId: typeof COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  secondaryRef: string;
  featureCount: number;
  route: string;
  publicRoute: string;
  activePilotCount: number;
  features: CommissionComparisonCalculatorFeatureRecord[];
};

export function loadCommissionComparisonCalculatorRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/commission-comparison-calculator-registry.json",
): CommissionComparisonCalculatorRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as CommissionComparisonCalculatorRegistry;
}

export function validateCommissionComparisonCalculatorRegistry(
  registry: CommissionComparisonCalculatorRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  featuresComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches =
    registry.policyId === COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID;

  const featuresComplete =
    registry.featureCount === COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT &&
    registry.route === COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE &&
    registry.publicRoute === COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE &&
    registry.secondaryRef === COMMISSION_COMPARISON_CALCULATOR_P3_148_SECONDARY_REF &&
    registry.features.length === COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS.length &&
    COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS.every((featureId, index) => {
      const record = registry.features[index];
      const expected = COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES[index];
      return (
        record?.id === featureId &&
        record.testId === expected?.testId &&
        record.route === expected?.route &&
        (record.status === "shipped" || record.status === "BETA")
      );
    });

  const zeroActivePilots = registry.activePilotCount === 0;

  const valid = policyIdMatches && featuresComplete && zeroActivePilots;

  return {
    valid,
    policyIdMatches,
    featuresComplete,
    zeroActivePilots,
  };
}

export function checkCommissionComparisonCalculatorAbsoluteFinalAudit(
  root = process.cwd(),
): boolean {
  const summary = auditCommissionComparisonCalculatorWiring(root);
  return summary.ok;
}

export function checkCommissionComparisonCalculatorCommissionFreeAudit(
  root = process.cwd(),
): boolean {
  const summary = auditCommissionFreeOrderingP2_113(root);
  return summary.passed;
}

export function checkCommissionComparisonCalculatorLegacyWiring(
  root = process.cwd(),
): boolean {
  const calculatorPath = join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_CALCULATOR);
  const publicPagePath = join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_PUBLIC_PAGE);
  const absoluteFinalPath = join(
    root,
    COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_ABSOLUTE_FINAL,
  );

  if (!existsSync(calculatorPath) || !existsSync(publicPagePath) || !existsSync(absoluteFinalPath)) {
    return false;
  }

  const calculatorSource = readFileSync(calculatorPath, "utf8");
  const publicPageSource = readFileSync(publicPagePath, "utf8");
  const absoluteFinalSource = readFileSync(absoluteFinalPath, "utf8");

  return (
    calculatorSource.includes("CommissionComparisonCalculator") &&
    calculatorSource.includes("commission-comparison-calculator") &&
    publicPageSource.includes("CommissionComparisonCalculator") &&
    publicPageSource.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE) &&
    absoluteFinalSource.includes("commission-comparison-calculator-absolute-final-v1")
  );
}

export function checkCommissionComparisonCalculatorLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPONENT);
  const pagePath = join(root, COMMISSION_COMPARISON_CALCULATOR_P3_148_PAGE);

  if (!existsSync(componentPath) || !existsSync(pagePath)) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("CommissionComparisonCalculatorPanel") &&
    componentSource.includes("commission-comparison-chownow") &&
    COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS.every((id) =>
      componentSource.includes(id),
    );

  const pageWired =
    pageSource.includes("CommissionComparisonCalculatorPanel") &&
    pageSource.includes(COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE);

  return componentWired && pageWired;
}
