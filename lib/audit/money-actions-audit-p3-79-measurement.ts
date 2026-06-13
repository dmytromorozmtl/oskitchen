import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditAllMoneyActions } from "@/lib/audit/money-actions-audit-policy";
import {
  MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT,
  MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE,
  MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID,
} from "@/lib/audit/money-actions-audit-p3-79-policy";

export type MoneyActionsAuditContractValidation = {
  passed: boolean;
  upstreamRegistryOk: boolean;
  registryCountOk: boolean;
  terminalRouteWired: boolean;
  failures: string[];
};

export function validateMoneyActionsAuditContract(
  root = process.cwd(),
): MoneyActionsAuditContractValidation {
  const failures: string[] = [];

  const upstream = auditAllMoneyActions(root);
  const upstreamRegistryOk =
    upstream.passed && upstream.policyId === MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID;
  if (!upstreamRegistryOk) {
    failures.push("upstream money actions registry audit failed");
    for (const report of upstream.reports.filter((entry) => !entry.passed)) {
      failures.push(`unwired: ${report.entry.servicePath} (${report.entry.action})`);
    }
  }

  const registryCountOk = upstream.reports.length === MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT;
  if (!registryCountOk) {
    failures.push(
      `registry count drift: expected ${MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT}, got ${upstream.reports.length}`,
    );
  }

  let terminalRouteWired = false;
  const terminalPath = join(root, MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE);
  if (!existsSync(terminalPath)) {
    failures.push(`missing terminal route: ${MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE}`);
  } else {
    const source = readFileSync(terminalPath, "utf8");
    terminalRouteWired =
      source.includes("logPosTerminalControlEvent") &&
      source.includes("POS_TERMINAL_PAYMENT_INTENT_CREATED") &&
      source.includes("POS_TERMINAL_PAYMENT_CAPTURED") &&
      source.includes("POS_TERMINAL_PAYMENT_CANCELLED");
    if (!terminalRouteWired) {
      failures.push("terminal route missing full payment audit wiring");
    }
  }

  return {
    passed: failures.length === 0,
    upstreamRegistryOk,
    registryCountOk,
    terminalRouteWired,
    failures,
  };
}
