/**
 * Blueprint P3-132 — Feature graduation criteria (accuracy, E2E, merchant proof).
 *
 * @see docs/feature-graduation-criteria.md
 */

export const FEATURE_GRADUATION_POLICY_ID = "feature-graduation-p3-132-v1" as const;

export const FEATURE_GRADUATION_DOC = "docs/feature-graduation-criteria.md" as const;

export const FEATURE_GRADUATION_ARTIFACT = "artifacts/feature-graduation-registry.json" as const;

export const FEATURE_GRADUATION_AUDIT_SCRIPT =
  "scripts/audit-feature-graduation-p3-132.ts" as const;

export const FEATURE_GRADUATION_NPM_SCRIPT = "audit:feature-graduation-p3-132" as const;

export const FEATURE_GRADUATION_UNIT_TEST =
  "tests/unit/feature-graduation-p3-132.test.ts" as const;

export const FEATURE_GRADUATION_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const FEATURE_GRADUATION_GATE_IDS = [
  "accuracy_benchmark",
  "e2e_pass",
  "merchant_proof",
] as const;

export type FeatureGraduationGateId = (typeof FEATURE_GRADUATION_GATE_IDS)[number];

export const FEATURE_GRADUATION_GATES = [
  {
    id: "accuracy_benchmark" as const,
    label: "Accuracy benchmark",
    threshold: ">85%",
    evidenceScripts: [
      "benchmark:invoice-scanner-accuracy",
      "benchmark:bank-import-reconciliation",
      "regression:ai-invoice-accuracy",
    ],
  },
  {
    id: "e2e_pass" as const,
    label: "E2E pass",
    threshold: "CI green",
    evidenceScripts: [
      "test:ci:login-today-playbook-e2e",
      "test:ci:pos-shift-checkout-receipt-e2e",
      "test:ci:kds-bump-expo-e2e",
    ],
  },
  {
    id: "merchant_proof" as const,
    label: "Merchant proof",
    threshold: "LOI + pilot metrics",
    evidenceScripts: [],
  },
] as const;

export const FEATURE_GRADUATION_FEATURE_IDS = [
  "today",
  "pos",
  "kds",
  "quick_start",
  "invoice_scanner",
  "bank_import",
  "stripe",
  "shopify",
  "doordash",
] as const;

export type FeatureGraduationFeatureId = (typeof FEATURE_GRADUATION_FEATURE_IDS)[number];

export const FEATURE_GRADUATION_STAGES = [
  "preview",
  "beta",
  "pilot_ready",
  "graduated",
] as const;

export const FEATURE_GRADUATION_RELATED_DOCS = [
  "docs/feature-maturity-matrix.md",
  "docs/pilot-package-v1.md",
  "docs/pilot-success-metrics.md",
  "docs/loi-pipeline.md",
  "artifacts/pilot-gono-go-summary.json",
] as const;

export const FEATURE_GRADUATION_HONESTY_MARKERS = [
  "0 signed LOIs",
  "0 graduated",
  "not graduated",
  "BETA",
  "qualified beta",
  "baseline",
] as const;

export const FEATURE_GRADUATION_WIRING_PATHS = [
  FEATURE_GRADUATION_DOC,
  "lib/pm/feature-graduation-p3-132-policy.ts",
  "lib/pm/feature-graduation-p3-132-operations.ts",
  "lib/pm/feature-graduation-p3-132-audit.ts",
  FEATURE_GRADUATION_ARTIFACT,
  FEATURE_GRADUATION_UNIT_TEST,
] as const;
