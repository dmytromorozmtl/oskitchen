import {
  BUMP_RECALL_AUDIT_DIMENSION_COUNT,
  BUMP_RECALL_AUDIT_ROUTE,
} from "@/lib/kitchen/bump-recall-audit-p2-91-policy";

export const BUMP_RECALL_AUDIT_EYEBROW = "KDS bump/recall audit · operator accountability" as const;

export const BUMP_RECALL_AUDIT_HEADLINE =
  "Who bumped, time per station, late tickets, and remake reasons" as const;

export const BUMP_RECALL_AUDIT_SUBLINE =
  "Four audit dimensions from KITCHEN_ORDER_BUMPED and KITCHEN_ORDER_RECALLED events — typical rush-hour operator accountability. BETA: verify coverage — not certified third-party KDS compliance audit." as const;

export const BUMP_RECALL_AUDIT_DIMENSIONS = [
  {
    id: "bump-recall-who-bumped",
    label: "Who bumped",
    description:
      "Actor user id, email, and role captured on every bump and recall via kitchen-permission-audit.",
    module: "services/kitchen/kitchen-permission-audit.ts",
  },
  {
    id: "bump-recall-station-time",
    label: "Time per station",
    description:
      "Elapsed seconds at bump/recall plus inferred station from order line keywords (grill, fry, cold, bar, expo, packing).",
    module: "lib/kitchen/bump-recall-audit-p2-91-operations.ts",
  },
  {
    id: "bump-recall-late-tickets",
    label: "Late tickets",
    description:
      "lateTicket flag when elapsed seconds exceed KDS_OVERDUE_SECONDS (900s) before bump or recall.",
    module: "lib/kitchen/kds-queue-clarity-era18.ts",
  },
  {
    id: "bump-recall-remake-reason",
    label: "Remake reason",
    description:
      "Recall metadata includes remakeReason — operator_recall or late_ticket_remake when ticket was overdue.",
    module: "actions/kitchen-daily-kds.ts",
  },
] as const;

export const BUMP_RECALL_AUDIT_OPERATOR_LINKS = [
  { label: "Kitchen display", href: "/dashboard/kitchen" },
  { label: "Multi-station KDS", href: "/dashboard/kitchen/multi-station" },
  { label: "Audit center", href: "/dashboard/audit-center" },
] as const;

export { BUMP_RECALL_AUDIT_DIMENSION_COUNT, BUMP_RECALL_AUDIT_ROUTE };
