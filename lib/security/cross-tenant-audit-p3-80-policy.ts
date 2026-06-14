/**
 * P3-80 — Cross-tenant service scope audit: 88% → 100% workspaceId coverage.
 *
 * @see docs/cross-tenant-audit-p3-80.md
 */

export const CROSS_TENANT_AUDIT_P3_80_POLICY_ID = "cross-tenant-audit-p3-80-v1" as const;

export const CROSS_TENANT_AUDIT_P3_80_DOC = "docs/cross-tenant-audit-p3-80.md" as const;

export const CROSS_TENANT_AUDIT_P3_80_ARTIFACT = "artifacts/cross-tenant-audit-p3-80.json" as const;

export const CROSS_TENANT_AUDIT_P3_80_AUDIT_MODULE =
  "lib/security/cross-tenant-audit-p3-80-audit.ts" as const;

export const CROSS_TENANT_AUDIT_P3_80_SCORING_MODULE =
  "lib/security/cross-tenant-audit-p3-80-scoring.ts" as const;

export const CROSS_TENANT_AUDIT_P3_80_SERVICE_AUDIT_MODULE =
  "lib/security/cross-tenant-service-scope-audit.ts" as const;

export const CROSS_TENANT_AUDIT_P3_80_SCENARIO_COUNT = 6 as const;

export const CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE = 100 as const;

export const CROSS_TENANT_AUDIT_P3_80_BASELINE_COVERAGE = 88 as const;

export const CROSS_TENANT_AUDIT_P3_80_MAX_HITS = 0 as const;

export const CROSS_TENANT_AUDIT_P3_80_CHECK_NPM_SCRIPT = "check:cross-tenant-audit-p3-80" as const;

export const CROSS_TENANT_AUDIT_P3_80_UNIT_TEST =
  "tests/unit/cross-tenant-audit-p3-80.test.ts" as const;

export const CROSS_TENANT_AUDIT_P3_80_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const CROSS_TENANT_AUDIT_P3_80_UPSTREAM_POLICIES = [
  "p0-15-cross-tenant-data-leak-e2e-v1",
  "final-16-cross-tenant-v1",
] as const;

export const CROSS_TENANT_AUDIT_P3_80_WIRING_PATHS = [
  CROSS_TENANT_AUDIT_P3_80_DOC,
  CROSS_TENANT_AUDIT_P3_80_ARTIFACT,
  CROSS_TENANT_AUDIT_P3_80_AUDIT_MODULE,
  CROSS_TENANT_AUDIT_P3_80_SCORING_MODULE,
  CROSS_TENANT_AUDIT_P3_80_SERVICE_AUDIT_MODULE,
  CROSS_TENANT_AUDIT_P3_80_UNIT_TEST,
  CROSS_TENANT_AUDIT_P3_80_CI_WORKFLOW,
  "scripts/audit-service-userid-scope.ts",
  "scripts/service-userid-scope-baseline.json",
  "lib/scope/workspace-resource-scope.ts",
  "artifacts/cross-tenant-data-leak-e2e.json",
] as const;
