import type { OrderBlocker, OrderBlockerCode, OrderBlockerSeverity } from "@/lib/orders/order-lifecycle-types";

const S: Record<OrderBlockerSeverity, OrderBlockerSeverity> = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export const ORDER_BLOCKER_META: Record<
  OrderBlockerCode,
  {
    label: string;
    explanation: string;
    severity: OrderBlockerSeverity;
    defaultFixHref: string;
    recommendedAction: string;
  }
> = {
  MISSING_ITEMS: {
    label: "No line items",
    explanation: "This order cannot move forward in the kitchen pipeline until at least one line item exists.",
    severity: S.CRITICAL,
    defaultFixHref: "/dashboard/orders",
    recommendedAction: "Add items on the order detail Items tab or recreate the order.",
  },
  UNMAPPED_PRODUCTS: {
    label: "Channel items need mapping",
    explanation: "One or more imported lines are not linked to your KitchenOS menu catalog.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/product-mapping/unmapped",
    recommendedAction: "Resolve mappings in Product mapping, then reprocess the import batch if needed.",
  },
  MISSING_CUSTOMER: {
    label: "Customer name missing",
    explanation: "Operational teams need a customer label for tickets, packing, and handoff.",
    severity: S.MEDIUM,
    defaultFixHref: "/dashboard/orders",
    recommendedAction: "Fill customer name on the order or CRM profile.",
  },
  MISSING_EMAIL_OR_PHONE: {
    label: "Contact channel missing",
    explanation: "Email or phone is required for confirmations and day-of coordination for many workflows.",
    severity: S.MEDIUM,
    defaultFixHref: "/dashboard/orders",
    recommendedAction: "Add email or phone on the Customer tab.",
  },
  MISSING_DELIVERY_ADDRESS: {
    label: "Delivery address not saved",
    explanation: "Delivery orders cannot be marked ready or completed without a structured address on file.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/orders",
    recommendedAction: "Save delivery address on Fulfillment / Route tab.",
  },
  MISSING_FULFILLMENT_DATE: {
    label: "Prep / service date missing",
    explanation: "Production and Today prioritization use a fulfillment or pickup date when available.",
    severity: S.MEDIUM,
    defaultFixHref: "/dashboard/orders",
    recommendedAction: "Set pickup or service date on the order.",
  },
  MISSING_PICKUP_WINDOW: {
    label: "Pickup window not defined",
    explanation: "Some modes expect a window for staging and customer comms.",
    severity: S.LOW,
    defaultFixHref: "/dashboard/settings/orders",
    recommendedAction: "Configure order defaults or set a window on the order when applicable.",
  },
  PRODUCTION_NOT_COMPLETE: {
    label: "Production work open",
    explanation: "Linked production work items are not all marked done before advancing.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/production",
    recommendedAction: "Finish or clear production lines tied to this order.",
  },
  PACKING_NOT_COMPLETE: {
    label: "Packing / verification incomplete",
    explanation: "Packing tasks or verification are still open for this order.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/packing",
    recommendedAction: "Complete packing steps or adjust requirements in production settings.",
  },
  ROUTE_NOT_ASSIGNED: {
    label: "Route not assigned",
    explanation: "Delivery is in a ready state but no route stop is linked yet.",
    severity: S.MEDIUM,
    defaultFixHref: "/dashboard/routes",
    recommendedAction: "Add the order to a route or dispatch workflow.",
  },
  PAYMENT_REVIEW_REQUIRED: {
    label: "Payment needs review",
    explanation: "Payment status does not allow completion until reviewed or adjusted.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/settings/billing",
    recommendedAction: "Mark paid externally, not required, or resolve partial payment per policy.",
  },
  INTEGRATION_ERROR: {
    label: "Channel sync failed",
    explanation: "The linked external order row reported a failure state.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/order-hub",
    recommendedAction: "Inspect the channel row, fix mapping or credentials, then retry sync.",
  },
  IMPORT_ERROR: {
    label: "Import batch error",
    explanation: "The linked import batch is in an error state.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/settings/imports",
    recommendedAction: "Review the import batch and error logs, then re-run or correct source data.",
  },
  POS_TRANSACTION_MISSING: {
    label: "POS transaction missing",
    explanation:
      "This POS sale has no linked POS transaction — register totals, receipts, and audit trail may be incomplete.",
    severity: S.HIGH,
    defaultFixHref: "/dashboard/pos/transactions",
    recommendedAction: "Open POS transactions or support — the order may need a manual reconciliation entry.",
  },
  RECEIPT_MISSING: {
    label: "POS receipt record missing",
    explanation: "The POS transaction exists but no receipt row was stored — re-print may be unavailable.",
    severity: S.MEDIUM,
    defaultFixHref: "/dashboard/pos/receipts",
    recommendedAction: "Check POS receipts or regenerate from support tools if your policy allows.",
  },
};

export function toOrderBlocker(code: OrderBlockerCode, fixHref?: string): OrderBlocker {
  const m = ORDER_BLOCKER_META[code];
  return {
    code,
    label: m.label,
    explanation: m.explanation,
    severity: m.severity,
    fixHref: fixHref ?? m.defaultFixHref,
    recommendedAction: m.recommendedAction,
  };
}
