/**
 * EXEC-02 — execution tracker slot reconciliation registry (task-182).
 *
 * @see lib/execution/execution-tracker-reconciliation-audit-policy.ts
 */

export const EXECUTION_TRACKER_RECONCILIATION_POLICY_ID =
  "execution-tracker-reconciliation-exec02-v1" as const;

export const EXECUTION_TRACKER_RECONCILIATION_ARTIFACT =
  "artifacts/execution-tracker-final.json" as const;

export const EXECUTION_TRACKER_RECONCILIATION_PREREQUISITE_POLICY_ID =
  "program-completion-capstone-exec01-v1" as const;
