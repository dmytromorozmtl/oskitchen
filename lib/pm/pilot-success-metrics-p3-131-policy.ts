/**
 * Blueprint P3-131 — Pilot success metrics (W1 / W4 / W8 milestones).
 *
 * @see docs/pilot-success-metrics.md
 */

export const PILOT_SUCCESS_METRICS_POLICY_ID = "pilot-success-metrics-p3-131-v1" as const;

export const PILOT_SUCCESS_METRICS_DOC = "docs/pilot-success-metrics.md" as const;

export const PILOT_SUCCESS_METRICS_ARTIFACT = "artifacts/pilot-success-metrics-baseline.json" as const;

export const PILOT_SUCCESS_METRICS_AUDIT_SCRIPT =
  "scripts/audit-pilot-success-metrics-p3-131.ts" as const;

export const PILOT_SUCCESS_METRICS_NPM_SCRIPT = "audit:pilot-success-metrics-p3-131" as const;

export const PILOT_SUCCESS_METRICS_UNIT_TEST =
  "tests/unit/pilot-success-metrics-p3-131.test.ts" as const;

export const PILOT_SUCCESS_METRICS_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PILOT_SUCCESS_METRICS_MILESTONE_IDS = ["w1", "w4", "w8"] as const;

export type PilotSuccessMetricsMilestoneId =
  (typeof PILOT_SUCCESS_METRICS_MILESTONE_IDS)[number];

export const PILOT_SUCCESS_METRICS_MILESTONES = [
  {
    id: "w1" as const,
    week: 1,
    label: "Week 1 — stability",
    metrics: [
      {
        id: "critical_bugs",
        target: "0",
        description: "Zero Sev-1/Sev-2 pilot bugs open",
      },
      {
        id: "kds_latency_p95",
        target: "<2s",
        description: "KDS ticket render p95 under 2 seconds",
      },
      {
        id: "order_capture_rate",
        target: "100%",
        description: "Orders ingested to hub without loss",
      },
    ],
  },
  {
    id: "w4" as const,
    week: 4,
    label: "Week 4 — adoption",
    metrics: [
      {
        id: "time_to_value",
        target: "<2h",
        description: "Quick Start to first KDS bump",
      },
      {
        id: "daily_active_users",
        target: ">80%",
        description: "DAU of entitled pilot seats",
      },
    ],
  },
  {
    id: "w8" as const,
    week: 8,
    label: "Week 8 — satisfaction",
    metrics: [
      {
        id: "nps",
        target: ">=8",
        description: "Operator NPS on 0–10 scale",
      },
    ],
  },
] as const;

export const PILOT_SUCCESS_METRICS_RELATED_DOCS = [
  "docs/pilot-package-v1.md",
  "docs/pilot-acceptance-criteria.md",
  "docs/pilot-metrics-review-process.md",
  "artifacts/pilot-gono-go-summary.json",
] as const;

export const PILOT_SUCCESS_METRICS_HONESTY_MARKERS = [
  "0 signed LOIs",
  "not captured",
  "BETA",
  "qualified beta",
  "baseline",
] as const;

export const PILOT_SUCCESS_METRICS_WIRING_PATHS = [
  PILOT_SUCCESS_METRICS_DOC,
  "lib/pm/pilot-success-metrics-p3-131-policy.ts",
  "lib/pm/pilot-success-metrics-p3-131-operations.ts",
  "lib/pm/pilot-success-metrics-p3-131-audit.ts",
  PILOT_SUCCESS_METRICS_ARTIFACT,
  PILOT_SUCCESS_METRICS_UNIT_TEST,
] as const;
