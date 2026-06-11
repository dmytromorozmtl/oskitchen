/**
 * P1-31 — critical money mutations must emit structured audit logs.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export const MONEY_ACTIONS_AUDIT_POLICY_ID = "money-actions-audit-p1-31-v1" as const;

export type MoneyActionKind = "payment" | "refund" | "void" | "payout" | "marketplace_po";

export type MoneyActionAuditEntry = {
  kind: MoneyActionKind;
  action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
  servicePath: string;
  auditCallPattern: RegExp;
};

/** Canonical registry — payment, refund, void, payout, marketplace PO. */
export const MONEY_ACTION_AUDIT_REGISTRY: readonly MoneyActionAuditEntry[] = [
  {
    kind: "payment",
    action: AUDIT_ACTIONS.POS_PAYMENT_RECORDED,
    servicePath: "services/pos/pos-checkout-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_PAYMENT_RECORDED/,
  },
  {
    kind: "refund",
    action: AUDIT_ACTIONS.POS_TRANSACTION_REFUNDED,
    servicePath: "services/pos/pos-refund-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_TRANSACTION_REFUNDED/,
  },
  {
    kind: "void",
    action: AUDIT_ACTIONS.POS_TRANSACTION_VOIDED,
    servicePath: "services/pos/pos-void-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_TRANSACTION_VOIDED/,
  },
  {
    kind: "payout",
    action: AUDIT_ACTIONS.VENDOR_PAYOUT_REQUESTED,
    servicePath: "services/marketplace/vendor-finance-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.VENDOR_PAYOUT_REQUESTED/,
  },
  {
    kind: "payout",
    action: AUDIT_ACTIONS.VENDOR_INSTANT_PAYOUT_REQUESTED,
    servicePath: "services/marketplace/instant-payouts-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.VENDOR_INSTANT_PAYOUT_REQUESTED/,
  },
  {
    kind: "marketplace_po",
    action: AUDIT_ACTIONS.MARKETPLACE_PO_CREATED,
    servicePath: "services/marketplace/checkout-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.MARKETPLACE_PO_CREATED/,
  },
] as const;

export const MONEY_ACTIONS_AUDIT_CI_SCRIPTS = ["test:ci:money-actions-audit"] as const;

export type MoneyActionAuditReport = {
  policyId: typeof MONEY_ACTIONS_AUDIT_POLICY_ID;
  entry: MoneyActionAuditEntry;
  servicePresent: boolean;
  auditWired: boolean;
  passed: boolean;
};

export function auditMoneyActionEntry(
  entry: MoneyActionAuditEntry,
  root = process.cwd(),
): MoneyActionAuditReport {
  const absPath = join(root, entry.servicePath);
  const servicePresent = existsSync(absPath);
  let auditWired = false;
  if (servicePresent) {
    const source = readFileSync(absPath, "utf8");
    auditWired = source.includes("auditLog(") && entry.auditCallPattern.test(source);
  }
  return {
    policyId: MONEY_ACTIONS_AUDIT_POLICY_ID,
    entry,
    servicePresent,
    auditWired,
    passed: servicePresent && auditWired,
  };
}

export function auditAllMoneyActions(root = process.cwd()): {
  policyId: typeof MONEY_ACTIONS_AUDIT_POLICY_ID;
  reports: MoneyActionAuditReport[];
  passed: boolean;
} {
  const reports = MONEY_ACTION_AUDIT_REGISTRY.map((entry) => auditMoneyActionEntry(entry, root));
  return {
    policyId: MONEY_ACTIONS_AUDIT_POLICY_ID,
    reports,
    passed: reports.every((report) => report.passed),
  };
}
