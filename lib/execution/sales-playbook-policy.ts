/**
 * FINAL-20 — Sales-safe playbook hub policy (task-214).
 */

export const SALES_PLAYBOOK_POLICY_ID = "final-20-sales-playbook-v1" as const;

export const SALES_PLAYBOOK_SUMMARY_ARTIFACT = "artifacts/sales-playbook-summary.json" as const;

export const SALES_PLAYBOOK_SUMMARY_VERSION = "final-20-sales-playbook-v1" as const;

export const SALES_PLAYBOOK_DOC = "docs/SALES_PLAYBOOK.md" as const;

export const SALES_PLAYBOOK_RUNNER_SCRIPT = "scripts/ops/run-sales-playbook-audit.ts" as const;

export const SALES_PLAYBOOK_VITEST_SPEC = "tests/unit/sales-playbook-hub-surfaces.test.ts" as const;

/** Contract markers — sales-safe hub links discovery, claims, and Integration Health. */
export const SALES_PLAYBOOK_HUB_MARKERS = [
  "Sales-safe playbook hub",
  "forbidden-claims-training.md",
  "verify-claims",
  "Integration Health",
  "/trust",
  "discovery-call-script.md",
  "objection-handling.md",
] as const;
