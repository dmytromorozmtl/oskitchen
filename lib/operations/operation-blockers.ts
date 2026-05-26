import type { OrderBlocker, OrderBlockerCode } from "@/lib/orders/order-lifecycle-types";

import { priorityScoreFromSeverity } from "@/lib/operations/operation-priorities";

export type OperationalBlockerDomain =
  | "order"
  | "integration"
  | "inventory"
  | "billing"
  | "support"
  | "data";

export type OperationalBlocker = {
  domain: OperationalBlockerDomain;
  code: OrderBlockerCode | string;
  label: string;
  explanation: string;
  severity: OrderBlocker["severity"];
  fixHref: string;
  recommendedAction: string;
  /** When false, UI must not offer dismiss without a server-side policy. */
  dismissAllowed: boolean;
  priorityScore: number;
};

const DOMAIN_BY_CODE: Partial<Record<OrderBlockerCode, OperationalBlockerDomain>> = {
  MISSING_ITEMS: "order",
  UNMAPPED_PRODUCTS: "order",
  MISSING_CUSTOMER: "order",
  MISSING_EMAIL_OR_PHONE: "order",
  MISSING_DELIVERY_ADDRESS: "order",
  MISSING_FULFILLMENT_DATE: "order",
  MISSING_PICKUP_WINDOW: "order",
  PRODUCTION_NOT_COMPLETE: "order",
  PACKING_NOT_COMPLETE: "order",
  ROUTE_NOT_ASSIGNED: "order",
  PAYMENT_REVIEW_REQUIRED: "billing",
  INTEGRATION_ERROR: "integration",
  IMPORT_ERROR: "integration",
  POS_TRANSACTION_MISSING: "order",
  RECEIPT_MISSING: "order",
};

function dismissAllowedFor(code: OrderBlockerCode): boolean {
  return !(
    code === "MISSING_ITEMS" ||
    code === "UNMAPPED_PRODUCTS" ||
    code === "MISSING_DELIVERY_ADDRESS" ||
    code === "INTEGRATION_ERROR" ||
    code === "IMPORT_ERROR" ||
    code === "POS_TRANSACTION_MISSING"
  );
}

export function fromOrderBlocker(b: OrderBlocker): OperationalBlocker {
  return {
    domain: DOMAIN_BY_CODE[b.code] ?? "order",
    code: b.code,
    label: b.label,
    explanation: b.explanation,
    severity: b.severity,
    fixHref: b.fixHref,
    recommendedAction: b.recommendedAction,
    dismissAllowed: dismissAllowedFor(b.code),
    priorityScore: priorityScoreFromSeverity(b.severity),
  };
}

export function mapOrderBlockers(blockers: OrderBlocker[]): OperationalBlocker[] {
  return blockers.map(fromOrderBlocker).sort((a, b) => b.priorityScore - a.priorityScore);
}
