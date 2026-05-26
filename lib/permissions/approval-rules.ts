export const APPROVAL_STATUSES = [
  "NOT_REQUIRED",
  "REQUIRED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type SensitiveAction =
  | "ORDER_CANCEL"
  | "ORDER_REFUND_PLACEHOLDER"
  | "POS_COMP"
  | "POS_SHIFT_CLOSE_HIGH_VARIANCE"
  | "BILLING_PLAN_CHANGE"
  | "TRIAL_EXTENSION"
  | "ENTITLEMENT_OVERRIDE"
  | "STAFF_PERMISSION_CHANGE"
  | "DATA_DELETE_OR_ARCHIVE"
  | "WEBHOOK_REPLAY"
  | "DEMO_RESET"
  | "EXPORT_SENSITIVE_REPORT"
  | "IMPERSONATE_WORKSPACE";

/** Policy table — persistence for approvals is roadmap; enforcement must remain server-side per route. */
export function approvalStatusForAction(action: SensitiveAction): ApprovalStatus {
  switch (action) {
    case "ORDER_CANCEL":
    case "POS_COMP":
    case "DATA_DELETE_OR_ARCHIVE":
    case "WEBHOOK_REPLAY":
    case "DEMO_RESET":
    case "EXPORT_SENSITIVE_REPORT":
    case "IMPERSONATE_WORKSPACE":
    case "ENTITLEMENT_OVERRIDE":
    case "BILLING_PLAN_CHANGE":
      return "REQUIRED";
    case "POS_SHIFT_CLOSE_HIGH_VARIANCE":
    case "STAFF_PERMISSION_CHANGE":
    case "TRIAL_EXTENSION":
      return "REQUIRED";
    case "ORDER_REFUND_PLACEHOLDER":
      return "REQUIRED";
    default:
      return "NOT_REQUIRED";
  }
}

export const DEFAULT_APPROVAL_TTL_HOURS = 24;
