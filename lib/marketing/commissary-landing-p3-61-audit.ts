import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSARY_LANDING_P3_61_CANONICAL_PATH,
  COMMISSARY_LANDING_P3_61_DOC,
  COMMISSARY_LANDING_P3_61_NPM_SCRIPTS,
  COMMISSARY_LANDING_P3_61_POLICY_ID,
  COMMISSARY_LANDING_P3_61_PRIMARY_KEYWORD,
  COMMISSARY_LANDING_P3_61_WIRING_PATHS,
} from "@/lib/marketing/commissary-landing-p3-61-policy";
import { validateCommissaryLandingContract } from "@/lib/marketing/commissary-landing-p3-61-measurement";

export type CommissaryLandingP3_61AuditSummary = {
  policyId: typeof COMMISSARY_LANDING_P3_61_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditCommissaryLandingP3_61(root = process.cwd()): CommissaryLandingP3_61AuditSummary {
  const wiringComplete = COMMISSARY_LANDING_P3_61_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, COMMISSARY_LANDING_P3_61_DOC))) {
    const source = readFileSync(join(root, COMMISSARY_LANDING_P3_61_DOC), "utf8");
    docWired =
      source.includes(COMMISSARY_LANDING_P3_61_POLICY_ID) &&
      source.includes(COMMISSARY_LANDING_P3_61_CANONICAL_PATH) &&
      source.includes(COMMISSARY_LANDING_P3_61_PRIMARY_KEYWORD);
  }

  const contract = validateCommissaryLandingContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = COMMISSARY_LANDING_P3_61_NPM_SCRIPTS.every((script) =>
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
    policyId: COMMISSARY_LANDING_P3_61_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatCommissaryLandingP3_61AuditLines(
  summary: CommissaryLandingP3_61AuditSummary,
): string[] {
  return [
    `Commissary landing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${COMMISSARY_LANDING_P3_61_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /commissary-kitchen-software: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
