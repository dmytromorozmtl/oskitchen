import {
  KITCHEN_SLA_TIMERS_CAPABILITY_COUNT,
  KITCHEN_SLA_TIMERS_ROUTE,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";

export const KITCHEN_SLA_TIMERS_EYEBROW = "Kitchen SLA · rush-hour timers" as const;

export const KITCHEN_SLA_TIMERS_HEADLINE =
  "Green, yellow, and red ticket timers with bottleneck alerts and avg prep time" as const;

export const KITCHEN_SLA_TIMERS_SUBLINE =
  "Three SLA signals for typical rush-hour line kitchens — green under 5m, yellow 5–10m, red over 10m. BETA: verify station load alerts — not certified third-party KDS SLA audit." as const;

export const KITCHEN_SLA_TIMERS_CAPABILITIES = [
  {
    id: "kitchen-sla-green-yellow-red",
    label: "Green / yellow / red timers",
    description:
      "Ticket SLA level from elapsed seconds — aligned with kds-queue-clarity-era18 thresholds (5m / 10m).",
    module: "lib/kitchen/kitchen-sla-timers-p2-92-operations.ts",
  },
  {
    id: "kitchen-sla-bottleneck-alerts",
    label: "Bottleneck alerts",
    description:
      "Station with highest load percent and overdue items triggers a manager-facing bottleneck alert.",
    module: "lib/kitchen/kds-production-view.ts",
  },
  {
    id: "kitchen-sla-avg-prep-time",
    label: "Avg prep time",
    description:
      "Mean elapsed seconds for in-progress tickets — rolling snapshot from today's KDS queue.",
    module: "services/kitchen/kitchen-sla-timers-p2-92-service.ts",
  },
] as const;

export const KITCHEN_SLA_TIMERS_OPERATOR_LINKS = [
  { label: "Kitchen display", href: "/dashboard/kitchen" },
  { label: "Multi-station KDS", href: "/dashboard/kitchen/multi-station" },
  { label: "Bump / recall audit", href: "/dashboard/kitchen/bump-recall-audit" },
] as const;

export { KITCHEN_SLA_TIMERS_CAPABILITY_COUNT, KITCHEN_SLA_TIMERS_ROUTE };
