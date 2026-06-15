/**
 * Pilot success metrics baseline — Evolution Era 17 Cycle 19 (Workstream D).
 *
 * Defines measurable pilot KPIs aligned with ICP contract Exhibit C.
 * Does NOT fabricate investor metrics without real pilot data.
 */

import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";

export const PILOT_METRICS_BASELINE_ERA17_POLICY_ID = "era17-pilot-metrics-baseline-v1" as const;

export const PILOT_METRICS_BASELINE_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_METRICS_BASELINE_ERA17_EXTENDS_POLICIES = [
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
  "era16-commercial-pilot-evidence-pack-v1",
] as const;

/** No live pilot snapshot captured — template only until customer week-2 data. */
export const PILOT_METRICS_BASELINE_ERA17_PROOF_STATUS = "awaiting_baseline_capture" as const;

export const PILOT_METRICS_BASELINE_ERA17_DOC =
  "docs/pilot-metrics-baseline-era17.md" as const;

export const PILOT_METRICS_BASELINE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-metrics-baseline-era17.ts" as const;

export const PILOT_METRICS_BASELINE_ERA17_NPM_SCRIPT = "smoke:pilot-metrics-baseline" as const;

export const PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-metrics-baseline-summary.json" as const;

export const PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS = [
  {
    id: "orders_per_day",
    label: "Orders per day",
    envKey: "PILOT_METRICS_ORDERS_PER_DAY",
    unit: "orders/day",
    measurement:
      "Hub + storefront + POS combined; snapshot at pilot week 2 baseline and week 8 review",
    exampleTarget: "Establish baseline week 2; review trend week 8",
  },
  {
    id: "storefront_checkout_success_rate",
    label: "Storefront checkout success rate",
    envKey: "PILOT_METRICS_STOREFRONT_CHECKOUT_SUCCESS_RATE",
    unit: "percent",
    measurement: "Pay-later path completions / attempts on staging or pilot production",
    exampleTarget: "≥95% on staging; document production separately",
  },
  {
    id: "pos_checkout_completion",
    label: "POS tier-2b cash checkout completion",
    envKey: "PILOT_METRICS_POS_CHECKOUT_STATUS",
    unit: "status",
    measurement: "Manual sign-off — no blocker defects on tier-2b path",
    exampleTarget: "PASSED manual sign-off",
  },
  {
    id: "kds_bump_rate",
    label: "KDS bump/recall operational rate",
    envKey: "PILOT_METRICS_KDS_BUMP_RATE",
    unit: "percent",
    measurement: "Bumps completed during service window — not rush-hour certified",
    exampleTarget: "Manual sign-off during pilot service window",
  },
  {
    id: "support_tickets_per_week",
    label: "Support tickets per week",
    envKey: "PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK",
    unit: "tickets/week",
    measurement: "Support queue count + time-to-first-response trend",
    exampleTarget: "Track trend; no SLA claim unless contracted",
  },
  {
    id: "operator_feedback_score",
    label: "Operator feedback score",
    envKey: "PILOT_METRICS_OPERATOR_FEEDBACK_SCORE",
    unit: "score_1_5",
    measurement: "1–5 survey at pilot midpoint and close",
    exampleTarget: "≥4.0 average or documented remediation plan",
  },
] as const;

export const PILOT_METRICS_BASELINE_ERA17_ENV_VARS = [
  "PILOT_METRICS_SNAPSHOT_JSON",
  "PILOT_METRICS_PILOT_WEEK",
  "PILOT_METRICS_CUSTOMER_REF",
  "PILOT_METRICS_CAPTURED_AT",
  ...PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS.map((metric) => metric.envKey),
] as const;

export const PILOT_METRICS_BASELINE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Start metrics capture after paid pilot GO and week-2 baseline window.",
  "Export or record values per docs/pilot-metrics-baseline-era17.md.",
  "Set per-metric env vars or PILOT_METRICS_SNAPSHOT_JSON — do not invent numbers.",
  "Run npm run smoke:pilot-metrics-baseline; review artifacts/pilot-metrics-baseline-summary.json.",
  "Use captured snapshot for investor narrative (Cycle 41) — never reuse template targets as live metrics.",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_FORBIDDEN_CLAIMS = [
  "investor-grade metrics without pilot snapshot",
  "rush-hour kds sla from bump rate",
  "production sla from staging-only checkout rate",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_CANONICAL_MARKERS = [
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
  "pilot-metrics-baseline",
  "awaiting_baseline_capture",
  "baselineProofStatus",
  "overall",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-metrics-baseline-era17",
  "test:ci:pilot-metrics-baseline-era17:cert",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-metrics-baseline-era17-policy.test.ts",
  "tests/unit/pilot-metrics-baseline-summary.test.ts",
  "tests/unit/pilot-metrics-baseline-era17-cert-live.test.ts",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-metrics-baseline-era17.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PILOT_METRICS_BASELINE_ERA17_REVIEW_SECTION =
  "Era 17 pilot metrics baseline (2026-05-28)" as const;
