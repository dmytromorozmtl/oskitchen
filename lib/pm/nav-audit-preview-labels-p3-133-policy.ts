/**
 * Blueprint P3-133 — Nav audit preview labels PM baseline (40% → 0% unlabeled).
 *
 * @see docs/nav-audit-preview-labels-pm.md
 */

export const NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID =
  "nav-audit-preview-labels-p3-133-v1" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_DOC =
  "docs/nav-audit-preview-labels-pm.md" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_ARTIFACT =
  "artifacts/nav-audit-preview-labels-baseline.json" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_AUDIT_SCRIPT =
  "scripts/audit-nav-audit-preview-labels-p3-133.ts" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_NPM_SCRIPT =
  "audit:nav-audit-preview-labels-p3-133" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_UNIT_TEST =
  "tests/unit/nav-audit-preview-labels-p3-133.test.ts" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT = 40 as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT = 0 as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS = {
  p1_24: "nav-audit-preview-p1-24-v1",
  p1_56: "nav-audit-preview-labels-p1-56-v1",
} as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_LIVE_AUDIT_NPM =
  "audit:nav-audit-preview-labels" as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_RELATED_DOCS = [
  "docs/navigation-ia-audit.md",
  "docs/feature-maturity-matrix.md",
  "docs/weekly-go-no-go-log.md",
  "lib/navigation/nav-audit-preview-policy.ts",
  "lib/design/nav-audit-preview-labels-policy.ts",
] as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_HONESTY_MARKERS = [
  "0 signed LOIs",
  "40%",
  "0% unlabeled",
  "qualified beta",
  "baseline",
] as const;

export const NAV_AUDIT_PREVIEW_LABELS_PM_WIRING_PATHS = [
  NAV_AUDIT_PREVIEW_LABELS_PM_DOC,
  "lib/pm/nav-audit-preview-labels-p3-133-policy.ts",
  "lib/pm/nav-audit-preview-labels-p3-133-operations.ts",
  "lib/pm/nav-audit-preview-labels-p3-133-audit.ts",
  NAV_AUDIT_PREVIEW_LABELS_PM_ARTIFACT,
  NAV_AUDIT_PREVIEW_LABELS_PM_UNIT_TEST,
] as const;
