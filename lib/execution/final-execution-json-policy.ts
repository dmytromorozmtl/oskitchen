/**
 * FINAL-22 — Final execution JSON artifact sync policy (task-216).
 */

export const FINAL_EXECUTION_JSON_POLICY_ID = "final-22-final-execution-json-v1" as const;

export const FINAL_EXECUTION_REPORT_ARTIFACT = "artifacts/final-execution-report.json" as const;

export const FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT =
  "artifacts/final-execution-json-sync-summary.json" as const;

export const FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION =
  "final-22-final-execution-json-v1" as const;

export const FINAL_EXECUTION_JSON_RUNNER_SCRIPT =
  "scripts/ops/run-final-execution-json-sync.ts" as const;

export const FINAL_EXECUTION_TRACKER_ARTIFACT = "artifacts/execution-tracker-final.json" as const;

export const FINAL_EXECUTION_JSON_VITEST_SPEC =
  "tests/unit/final-execution-json-sync.test.ts" as const;

/** Required top-level keys in synced final-execution-report.json. */
export const FINAL_EXECUTION_REPORT_REQUIRED_KEYS = [
  "version",
  "generatedAt",
  "trackerSync",
  "finalOrchestratorGates",
  "goDecision",
  "ready",
  "honestyNote",
] as const;

/** Gate artifact paths aggregated into the JSON snapshot (FINAL-13..FINAL-21). */
export const FINAL_EXECUTION_GATE_ARTIFACTS = [
  "artifacts/ts-build-green-summary.json",
  "artifacts/vitest-health-summary.json",
  "artifacts/dashboard-rsc-golden-path-summary.json",
  "artifacts/cross-tenant-isolation-staging-summary.json",
  "artifacts/webhook-signature-matrix-summary.json",
  "artifacts/integration-health-moat-summary.json",
  "artifacts/trust-page-summary.json",
  "artifacts/sales-playbook-summary.json",
  "artifacts/commercial-pilot-runbook-summary.json",
] as const;
