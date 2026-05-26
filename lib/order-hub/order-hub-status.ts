/**
 * Order Hub triage tabs — shared labels/ids for UI and filtering.
 * Filtering logic lives in `services/order-hub/order-triage-service.ts`.
 */
export const ORDER_HUB_TABS = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs review" },
  { id: "needs_mapping", label: "Needs mapping" },
  { id: "missing_customer_info", label: "Missing customer info" },
  { id: "missing_fulfillment_info", label: "Missing fulfillment info" },
  { id: "ready_for_production", label: "Ready for production" },
  { id: "in_production", label: "In production" },
  { id: "packing", label: "Packing" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed / errors" },
  { id: "pos", label: "POS" },
] as const;

export type OrderHubTabId = (typeof ORDER_HUB_TABS)[number]["id"];
