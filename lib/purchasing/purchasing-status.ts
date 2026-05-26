import type { PurchaseOrderStatus } from "@prisma/client";

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  SENT: "Sent",
  PARTIALLY_RECEIVED: "Partially received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
  OVERDUE: "Overdue",
};

const TERMINAL: PurchaseOrderStatus[] = ["RECEIVED", "CANCELLED"];

export function isTerminalPurchaseOrderStatus(status: PurchaseOrderStatus): boolean {
  return TERMINAL.includes(status);
}

export function purchaseOrderNeedsAttention(status: PurchaseOrderStatus): boolean {
  return status === "DRAFT" || status === "READY_FOR_REVIEW" || status === "OVERDUE";
}
