/**
 * Blueprint P3-149 — Accounting depth (R365 parity baseline).
 *
 * @see docs/accounting-depth-r365.md
 */

export const ACCOUNTING_DEPTH_P3_149_POLICY_ID = "accounting-depth-p3-149-v1" as const;

export const ACCOUNTING_DEPTH_P3_149_DOC = "docs/accounting-depth-r365.md" as const;

export const ACCOUNTING_DEPTH_P3_149_ARTIFACT =
  "artifacts/accounting-depth-r365-registry.json" as const;

export const ACCOUNTING_DEPTH_P3_149_AUDIT_SCRIPT =
  "scripts/audit-accounting-depth-p3-149.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_NPM_SCRIPT = "audit:accounting-depth-p3-149" as const;

export const ACCOUNTING_DEPTH_P3_149_UNIT_TEST =
  "tests/unit/accounting-depth-p3-149.test.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const ACCOUNTING_DEPTH_P3_149_COMPETITOR = "restaurant365" as const;

export const ACCOUNTING_DEPTH_P3_149_POSITIONING_LINE =
  "Kitchen-first ops with honest GL depth — not R365 enterprise accounting suite." as const;

export const ACCOUNTING_DEPTH_P3_149_HEADLINE =
  "Accounting depth — R365 parity baseline" as const;

export const ACCOUNTING_DEPTH_P3_149_ROUTE = "/dashboard/accounting/depth" as const;

export const ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF =
  "gl-depth-accounting-absolute-final-v1" as const;

export const ACCOUNTING_DEPTH_P3_149_SECONDARY_REF =
  "accountant-portal-absolute-final-v1" as const;

export const ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT = 6 as const;

export const ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS = [
  "chart_of_accounts",
  "journal_entries",
  "gl_depth_sync",
  "pnl_reconciliation",
  "period_close",
  "ap_automation",
] as const;

export type AccountingDepthCapabilityId =
  (typeof ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS)[number];

export const ACCOUNTING_DEPTH_P3_149_TEST_IDS = [
  "accounting-depth-r365",
  "accounting-depth-coa",
  "accounting-depth-journal",
  "accounting-depth-gl-sync",
  "accounting-depth-reconciliation",
  "accounting-depth-period-close",
  "accounting-depth-ap",
] as const;

export const ACCOUNTING_DEPTH_P3_149_COMPONENT =
  "components/accounting/accounting-depth-panel.tsx" as const;

export const ACCOUNTING_DEPTH_P3_149_PAGE =
  "app/dashboard/accounting/depth/page.tsx" as const;

export const ACCOUNTING_DEPTH_P3_149_LEGACY_GL =
  "lib/accounting/gl-depth-accounting-policy.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_LEGACY_COA =
  "lib/accounting/chart-of-accounts-mapping-absolute-final-policy.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_LEGACY_JOURNAL =
  "lib/accounting/journal-entry-export-absolute-final-policy.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_LEGACY_PORTAL =
  "lib/accounting/accountant-portal-absolute-final-policy.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_LEGACY_AP =
  "lib/accounting/ap-automation-p2-104-policy.ts" as const;

export const ACCOUNTING_DEPTH_P3_149_RELATED_DOCS = [
  "app/restaurant365-alternative/page.tsx",
  "docs/accountant-portal-gtm-scale.md",
  "docs/pnl-reconciliation-gtm-scale.md",
  "lib/accounting/chart-of-accounts-mapping-absolute-final-policy.ts",
  "lib/accounting/journal-entry-export-absolute-final-policy.ts",
  "lib/accounting/accountant-portal-absolute-final-policy.ts",
] as const;

export const ACCOUNTING_DEPTH_P3_149_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
  "not a certified GL",
] as const;

export const ACCOUNTING_DEPTH_P3_149_WIRING_PATHS = [
  ACCOUNTING_DEPTH_P3_149_DOC,
  "lib/accounting/accounting-depth-p3-149-policy.ts",
  "lib/accounting/accounting-depth-p3-149-content.ts",
  "lib/accounting/accounting-depth-p3-149-operations.ts",
  "lib/accounting/accounting-depth-p3-149-audit.ts",
  ACCOUNTING_DEPTH_P3_149_ARTIFACT,
  ACCOUNTING_DEPTH_P3_149_UNIT_TEST,
  ACCOUNTING_DEPTH_P3_149_COMPONENT,
  ACCOUNTING_DEPTH_P3_149_PAGE,
  ACCOUNTING_DEPTH_P3_149_LEGACY_GL,
  ACCOUNTING_DEPTH_P3_149_LEGACY_COA,
  ACCOUNTING_DEPTH_P3_149_LEGACY_JOURNAL,
  ACCOUNTING_DEPTH_P3_149_LEGACY_PORTAL,
  ACCOUNTING_DEPTH_P3_149_LEGACY_AP,
] as const;
