import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH,
  COMMISSION_COMPARISON_LANDING_P3_64_DOC,
  COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPTS,
  COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID,
  COMMISSION_COMPARISON_LANDING_P3_64_PRIMARY_KEYWORD,
  COMMISSION_COMPARISON_LANDING_P3_64_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-landing-p3-64-policy";
import { validateCommissionComparisonLandingContract } from "@/lib/marketing/commission-comparison-landing-p3-64-measurement";

export type CommissionComparisonLandingP3_64AuditSummary = {
  policyId: typeof COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditCommissionComparisonLandingP3_64(
  root = process.cwd(),
): CommissionComparisonLandingP3_64AuditSummary {
  const wiringComplete = COMMISSION_COMPARISON_LANDING_P3_64_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_LANDING_P3_64_DOC))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_LANDING_P3_64_DOC), "utf8");
    docWired =
      source.includes(COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID) &&
      source.includes(COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH) &&
      source.includes(COMMISSION_COMPARISON_LANDING_P3_64_PRIMARY_KEYWORD);
  }

  const contract = validateCommissionComparisonLandingContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    contract.passed &&
    contract.pathsAligned &&
    npmScriptsWired;

  return {
    policyId: COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatCommissionComparisonLandingP3_64AuditLines(
  summary: CommissionComparisonLandingP3_64AuditSummary,
): string[] {
  return [
    `Commission comparison landing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${COMMISSION_COMPARISON_LANDING_P3_64_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /commission-comparison: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
