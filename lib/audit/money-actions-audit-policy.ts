/**
 * P1-31 — critical money mutations must emit structured audit logs.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export const MONEY_ACTIONS_AUDIT_POLICY_ID = "money-actions-audit-p1-31-v1" as const;

export type MoneyActionKind =
  | "payment"
  | "refund"
  | "void"
  | "payout"
  | "marketplace_po"
  | "billing"
  | "storefront"
  | "terminal"
  | "cash";

export type MoneyActionAuditEntry = {
  kind: MoneyActionKind;
  action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
  servicePath: string;
  auditCallPattern: RegExp;
  /** When set, wiring passes if helper (e.g. logPosTerminalControlEvent) + action pattern match. */
  auditHelperPattern?: RegExp;
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
  {
    kind: "payment",
    action: AUDIT_ACTIONS.MARKETPLACE_PAYMENT_INITIATED,
    servicePath: "services/marketplace/checkout-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.MARKETPLACE_PAYMENT_INITIATED/,
  },
  {
    kind: "billing",
    action: AUDIT_ACTIONS.BILLING_PLAN_CHANGED,
    servicePath: "services/marketplace/billing-integration-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.BILLING_PLAN_CHANGED/,
  },
  {
    kind: "terminal",
    action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_INTENT_CREATED,
    servicePath: "app/api/pos/terminal/route.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_TERMINAL_PAYMENT_INTENT_CREATED/,
    auditHelperPattern: /logPosTerminalControlEvent/,
  },
  {
    kind: "terminal",
    action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CAPTURED,
    servicePath: "app/api/pos/terminal/route.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_TERMINAL_PAYMENT_CAPTURED/,
    auditHelperPattern: /logPosTerminalControlEvent/,
  },
  {
    kind: "terminal",
    action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CANCELLED,
    servicePath: "app/api/pos/terminal/route.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_TERMINAL_PAYMENT_CANCELLED/,
    auditHelperPattern: /logPosTerminalControlEvent/,
  },
  {
    kind: "storefront",
    action: AUDIT_ACTIONS.STOREFRONT_PAYMENT_FAILED,
    servicePath: "services/storefront/storefront-payment-audit.ts",
    auditCallPattern: /AUDIT_ACTIONS\.STOREFRONT_PAYMENT_FAILED/,
  },
  {
    kind: "storefront",
    action: AUDIT_ACTIONS.STOREFRONT_PAYMENT_RETRY_STARTED,
    servicePath: "services/storefront/storefront-payment-audit.ts",
    auditCallPattern: /AUDIT_ACTIONS\.STOREFRONT_PAYMENT_RETRY_STARTED/,
  },
  {
    kind: "cash",
    action: AUDIT_ACTIONS.POS_CASH_COUNTED,
    servicePath: "services/pos/pos-cash-count-service.ts",
    auditCallPattern: /AUDIT_ACTIONS\.POS_CASH_COUNTED/,
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
    const directAudit = source.includes("auditLog(") && entry.auditCallPattern.test(source);
    const helperAudit =
      entry.auditHelperPattern != null &&
      entry.auditHelperPattern.test(source) &&
      entry.auditCallPattern.test(source);
    auditWired = directAudit || helperAudit;
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
