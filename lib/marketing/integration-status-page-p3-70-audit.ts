import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH,
  INTEGRATION_STATUS_PAGE_P3_70_DOC,
  INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPTS,
  INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID,
  INTEGRATION_STATUS_PAGE_P3_70_PRIMARY_KEYWORD,
  INTEGRATION_STATUS_PAGE_P3_70_WIRING_PATHS,
} from "@/lib/marketing/integration-status-page-p3-70-policy";
import { validateIntegrationStatusPageContract } from "@/lib/marketing/integration-status-page-p3-70-measurement";

export type IntegrationStatusPageP3_70AuditSummary = {
  policyId: typeof INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditIntegrationStatusPageP3_70(
  root = process.cwd(),
): IntegrationStatusPageP3_70AuditSummary {
  const wiringComplete = INTEGRATION_STATUS_PAGE_P3_70_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, INTEGRATION_STATUS_PAGE_P3_70_DOC))) {
    const source = readFileSync(join(root, INTEGRATION_STATUS_PAGE_P3_70_DOC), "utf8");
    docWired =
      source.includes(INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID) &&
      source.includes(INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH) &&
      source.includes(INTEGRATION_STATUS_PAGE_P3_70_PRIMARY_KEYWORD);
  }

  const contract = validateIntegrationStatusPageContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPTS.every((script) =>
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
    policyId: INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatIntegrationStatusPageP3_70AuditLines(
  summary: IntegrationStatusPageP3_70AuditSummary,
): string[] {
  return [
    `Integration status page audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${INTEGRATION_STATUS_PAGE_P3_70_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /status: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
