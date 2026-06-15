/**
 * Blueprint P2-102 — Actual vs theoretical variance (separate dashboard tile).
 *
 * @see docs/actual-vs-theoretical-variance.md
 * @see app/dashboard/inventory/actual-vs-theoretical-variance/page.tsx
 */

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID =
  "actual-vs-theoretical-variance-p2-102-v1" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC =
  "docs/actual-vs-theoretical-variance.md" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_AVT_POLICY =
  "services/costing/actual-vs-theoretical-service.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_ALERT_POLICY =
  "services/costing/costing-alert-service.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CONTENT_PATH =
  "lib/inventory/actual-vs-theoretical-variance-p2-102-content.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH =
  "lib/inventory/actual-vs-theoretical-variance-p2-102-operations.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SERVICE_PATH =
  "services/inventory/actual-vs-theoretical-variance-p2-102-service.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT =
  "components/inventory/actual-vs-theoretical-variance-panel.tsx" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_PAGE =
  "app/dashboard/inventory/actual-vs-theoretical-variance/page.tsx" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE =
  "/dashboard/inventory/actual-vs-theoretical-variance" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE = "/dashboard/costing/avt" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT = 3 as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS = [
  "actual-vs-theoretical-variance",
  "avt-variance-tile",
  "avt-theoretical-baseline",
  "avt-actual-depletion",
] as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AUDIT_SCRIPT =
  "scripts/audit-actual-vs-theoretical-variance-p2-102.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_NPM_SCRIPT =
  "audit:actual-vs-theoretical-variance-p2-102" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_UNIT_TEST =
  "tests/unit/actual-vs-theoretical-variance-p2-102.test.ts" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_WIRING_PATHS = [
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CONTENT_PATH,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SERVICE_PATH,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_PAGE,
  "lib/inventory/actual-vs-theoretical-variance-p2-102-policy.ts",
  "lib/inventory/actual-vs-theoretical-variance-p2-102-audit.ts",
  "app/dashboard/costing/avt/page.tsx",
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_UNIT_TEST,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_AVT_POLICY,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_ALERT_POLICY,
] as const;
