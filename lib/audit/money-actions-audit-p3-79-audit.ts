import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MONEY_ACTIONS_AUDIT_P3_79_DOC,
  MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPTS,
  MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID,
  MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT,
  MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID,
  MONEY_ACTIONS_AUDIT_P3_79_WIRING_PATHS,
} from "@/lib/audit/money-actions-audit-p3-79-policy";
import { validateMoneyActionsAuditContract } from "@/lib/audit/money-actions-audit-p3-79-measurement";

export type MoneyActionsAuditP3_79AuditSummary = {
  policyId: typeof MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  registryCount: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditMoneyActionsAuditP3_79(
  root = process.cwd(),
): MoneyActionsAuditP3_79AuditSummary {
  const wiringComplete = MONEY_ACTIONS_AUDIT_P3_79_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, MONEY_ACTIONS_AUDIT_P3_79_DOC))) {
    const source = readFileSync(join(root, MONEY_ACTIONS_AUDIT_P3_79_DOC), "utf8");
    docWired =
      source.includes(MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID) &&
      source.includes(MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID) &&
      source.includes("terminal");
  }

  const contract = validateMoneyActionsAuditContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    registryCount: MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT,
    npmScriptsWired,
    passed,
  };
}

export function formatMoneyActionsAuditP3_79AuditLines(
  summary: MoneyActionsAuditP3_79AuditSummary,
): string[] {
  return [
    `Money actions audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${MONEY_ACTIONS_AUDIT_P3_79_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Registry entries: ${summary.registryCount}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
