import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_ANALYSIS_P3_72_DOC,
  BUNDLE_ANALYSIS_P3_72_NPM_SCRIPTS,
  BUNDLE_ANALYSIS_P3_72_POLICY_ID,
  BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_P3_72_UPSTREAM_DOC,
  BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID,
  BUNDLE_ANALYSIS_P3_72_WIRING_PATHS,
} from "@/lib/performance/bundle-analysis-p3-72-policy";
import { validateBundleAnalysisContract } from "@/lib/performance/bundle-analysis-p3-72-measurement";

export type BundleAnalysisP3_72AuditSummary = {
  policyId: typeof BUNDLE_ANALYSIS_P3_72_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  totalCodeSplitTargets: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditBundleAnalysisP3_72(
  root = process.cwd(),
): BundleAnalysisP3_72AuditSummary {
  const wiringComplete = BUNDLE_ANALYSIS_P3_72_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, BUNDLE_ANALYSIS_P3_72_DOC))) {
    const source = readFileSync(join(root, BUNDLE_ANALYSIS_P3_72_DOC), "utf8");
    docWired =
      source.includes(BUNDLE_ANALYSIS_P3_72_POLICY_ID) &&
      source.includes(BUNDLE_ANALYSIS_P3_72_UPSTREAM_DOC) &&
      source.includes(BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID) &&
      source.includes("Wave 2");
  }

  const contract = validateBundleAnalysisContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = BUNDLE_ANALYSIS_P3_72_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: BUNDLE_ANALYSIS_P3_72_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    totalCodeSplitTargets: BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS,
    npmScriptsWired,
    passed,
  };
}

export function formatBundleAnalysisP3_72AuditLines(
  summary: BundleAnalysisP3_72AuditSummary,
): string[] {
  return [
    `Bundle analysis optimization audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${BUNDLE_ANALYSIS_P3_72_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Code-split targets: ${summary.totalCodeSplitTargets} (wave 1 + wave 2)`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
