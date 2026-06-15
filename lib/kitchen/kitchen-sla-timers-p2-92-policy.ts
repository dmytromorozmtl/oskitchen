/**
 * Blueprint P2-92 — Kitchen SLA timers (green/yellow/red, bottleneck alerts, avg prep time).
 *
 * @see docs/kitchen-sla-timers.md
 * @see app/dashboard/kitchen/sla/page.tsx
 */

export const KITCHEN_SLA_TIMERS_POLICY_ID = "kitchen-sla-timers-p2-92-v1" as const;

export const KITCHEN_SLA_TIMERS_DOC = "docs/kitchen-sla-timers.md" as const;

export const KITCHEN_SLA_TIMERS_CONTENT_PATH =
  "lib/kitchen/kitchen-sla-timers-p2-92-content.ts" as const;

export const KITCHEN_SLA_TIMERS_OPERATIONS_PATH =
  "lib/kitchen/kitchen-sla-timers-p2-92-operations.ts" as const;

export const KITCHEN_SLA_TIMERS_SERVICE_PATH =
  "services/kitchen/kitchen-sla-timers-p2-92-service.ts" as const;

export const KITCHEN_SLA_TIMERS_COMPONENT =
  "components/kitchen/kitchen-sla-timers-panel.tsx" as const;

export const KITCHEN_SLA_TIMERS_PAGE = "app/dashboard/kitchen/sla/page.tsx" as const;

export const KITCHEN_SLA_TIMERS_ROUTE = "/dashboard/kitchen/sla" as const;

export const KITCHEN_SLA_TIMERS_CAPABILITY_COUNT = 3 as const;

export const KITCHEN_SLA_TIMERS_TEST_IDS = [
  "kitchen-sla-timers",
  "kitchen-sla-green-yellow-red",
  "kitchen-sla-bottleneck-alerts",
  "kitchen-sla-avg-prep-time",
] as const;

export const KITCHEN_SLA_TIMERS_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "SLA",
  "not certified",
] as const;

export const KITCHEN_SLA_TIMERS_AUDIT_SCRIPT = "scripts/audit-kitchen-sla-timers.ts" as const;

export const KITCHEN_SLA_TIMERS_NPM_SCRIPT = "audit:kitchen-sla-timers" as const;

export const KITCHEN_SLA_TIMERS_UNIT_TEST = "tests/unit/kitchen-sla-timers.test.ts" as const;

export const KITCHEN_SLA_TIMERS_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const KITCHEN_SLA_TIMERS_WIRING_PATHS = [
  KITCHEN_SLA_TIMERS_DOC,
  KITCHEN_SLA_TIMERS_CONTENT_PATH,
  KITCHEN_SLA_TIMERS_OPERATIONS_PATH,
  KITCHEN_SLA_TIMERS_SERVICE_PATH,
  KITCHEN_SLA_TIMERS_COMPONENT,
  KITCHEN_SLA_TIMERS_PAGE,
  "lib/kitchen/kitchen-sla-timers-p2-92-policy.ts",
  "lib/kitchen/kitchen-sla-timers-p2-92-audit.ts",
  "lib/kitchen/kds-queue-clarity-era18.ts",
  "lib/kitchen/kds-production-view.ts",
  KITCHEN_SLA_TIMERS_UNIT_TEST,
] as const;
