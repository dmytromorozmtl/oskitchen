/** Canonical strings for activity / audit correlation (append-only semantics). */
export const OPERATION_EVENT_KINDS = [
  "order.status_changed",
  "order.blocker_added",
  "order.blocker_cleared",
  "order.mapping_approved",
  "production.work_completed",
  "packing.task_verified",
  "fulfillment.route_assigned",
  "integration.webhook_failed",
  "integration.import_failed",
  "support.ticket_escalated",
  "billing.restriction_applied",
] as const;

export type OperationEventKind = (typeof OPERATION_EVENT_KINDS)[number];
