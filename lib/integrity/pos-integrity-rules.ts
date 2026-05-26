/**
 * POS order integrity signals for support / platform diagnostics (no PII, no payments pan).
 */
export type PosIntegrityIssueCode =
  | "POS_ORDER_WITHOUT_TRANSACTION"
  | "POS_PLACEHOLDER_EMAIL_EXPOSED"
  | "POS_SCHEDULED_WITHOUT_DATE"
  | "POS_DELIVERY_WITHOUT_ADDRESS";

export type PosIntegrityIssue = { code: PosIntegrityIssueCode; severity: "HIGH" | "MEDIUM" | "LOW"; message: string };

export function listPosIntegrityIssues(order: {
  creationSource: string | null;
  orderType: string | null;
  customerEmail: string;
  fulfillmentType: string;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  sourceMetadataJson: unknown;
  posTransactions: { id: string }[];
}): PosIntegrityIssue[] {
  const out: PosIntegrityIssue[] = [];
  if (order.creationSource === "POS" && order.orderType === "POS_SALE" && order.posTransactions.length === 0) {
    out.push({
      code: "POS_ORDER_WITHOUT_TRANSACTION",
      severity: "HIGH",
      message: "POS sale has no linked POS transaction row.",
    });
  }
  if (order.creationSource === "POS" && order.customerEmail.includes("@local.kitchenos.invalid")) {
    out.push({
      code: "POS_PLACEHOLDER_EMAIL_EXPOSED",
      severity: "LOW",
      message: "Guest placeholder email on file — expected for walk-ins; hide in customer-facing surfaces.",
    });
  }
  return out;
}
