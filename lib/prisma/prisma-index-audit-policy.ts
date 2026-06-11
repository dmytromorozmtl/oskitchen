/**
 * P1-36 — Prisma index audit across all models in prisma/schema.prisma.
 */

export const PRISMA_INDEX_AUDIT_POLICY_ID = "prisma-index-audit-p1-36-v1" as const;

export const PRISMA_INDEX_AUDIT_SCHEMA_PATH = "prisma/schema.prisma" as const;

export const PRISMA_INDEX_AUDIT_SCRIPT = "scripts/check-prisma-indexes.ts" as const;

export const PRISMA_INDEX_AUDIT_NPM_SCRIPT = "check:prisma-indexes" as const;

export const PRISMA_INDEX_AUDIT_UNIT_TEST = "tests/unit/prisma-index-audit.test.ts" as const;

export const PRISMA_INDEX_AUDIT_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

/** Locked model count from schema.prisma (2026-06). */
export const PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT = 401 as const;

/** Tenant-scoping FK fields that must always have index coverage when present. */
export const PRISMA_TENANT_SCOPE_INDEX_FIELDS = [
  "userId",
  "workspaceId",
  "organizationId",
] as const;

export const PRISMA_INDEX_AUDIT_CI_SCRIPTS = [
  "test:ci:prisma-index-audit",
  PRISMA_INDEX_AUDIT_NPM_SCRIPT,
] as const;

/** Models exempt from FK index enforcement (Prisma views / internal). */
export const PRISMA_INDEX_AUDIT_MODEL_EXEMPTIONS = [] as const;
