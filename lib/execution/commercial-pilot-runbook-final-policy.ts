/**
 * FINAL-21 — Commercial pilot runbook gate policy (task-215).
 */

import {
  COMMERCIAL_PILOT_RUNBOOK_DOC,
  COMMERCIAL_PILOT_UNIT_TESTS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";

export const COMMERCIAL_PILOT_RUNBOOK_FINAL_POLICY_ID =
  "final-21-commercial-pilot-runbook-v1" as const;

export const COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT =
  "artifacts/commercial-pilot-runbook-summary.json" as const;

export const COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION =
  "final-21-commercial-pilot-runbook-v1" as const;

export const COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT =
  "scripts/ops/run-commercial-pilot-runbook-audit.ts" as const;

export const COMMERCIAL_PILOT_RUNBOOK_FINAL_VITEST_BUNDLE = COMMERCIAL_PILOT_UNIT_TESTS;

export { COMMERCIAL_PILOT_RUNBOOK_DOC };

/** Contract markers in canonical runbook for FINAL-21 gate. */
export const COMMERCIAL_PILOT_RUNBOOK_FINAL_MARKERS = [
  "Commercial pilot runbook gate (FINAL-21)",
  "paid pilot GO/NO-GO",
  "era7-commercial-pilot-runbooks-v1",
  "smoke:pilot-gono-go",
  "What we do not claim in pilots",
] as const;
