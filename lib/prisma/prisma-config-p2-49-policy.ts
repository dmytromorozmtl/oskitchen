/**
 * P2-49 — Prisma config migration: package.json#prisma → prisma.config.ts.
 *
 * @see docs/prisma-config-p2-49.md
 * @see prisma.config.ts
 * @see lib/prisma/prisma-config-policy.ts (P1-15 base policy)
 */

export const PRISMA_CONFIG_P2_49_POLICY_ID = "prisma-config-p2-49-v1" as const;

export const PRISMA_CONFIG_P2_49_DOC = "docs/prisma-config-p2-49.md" as const;

export const PRISMA_CONFIG_P2_49_ARTIFACT = "artifacts/prisma-config-p2-49.json" as const;

export const PRISMA_CONFIG_P2_49_AUDIT_MODULE = "lib/prisma/prisma-config-p2-49-audit.ts" as const;

export const PRISMA_CONFIG_P2_49_CHECK_NPM_SCRIPT = "check:prisma-config-p2-49" as const;

export const PRISMA_CONFIG_P2_49_CI_NPM_SCRIPT = "test:ci:prisma-config-p2-49" as const;

export const PRISMA_CONFIG_P2_49_UNIT_TEST = "tests/unit/prisma-config-p2-49.test.ts" as const;

export const PRISMA_CONFIG_P2_49_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PRISMA_CONFIG_P2_49_BASE_POLICY = "lib/prisma/prisma-config-policy.ts" as const;

export const PRISMA_CONFIG_P2_49_CONFIG_PATH = "prisma.config.ts" as const;

export const PRISMA_CONFIG_P2_49_SCHEMA_PATH = "prisma/schema.prisma" as const;

export const PRISMA_CONFIG_P2_49_MIGRATIONS_PATH = "prisma/migrations" as const;

export const PRISMA_CONFIG_P2_49_SEED_COMMAND = "tsx prisma/seed.ts" as const;

export const PRISMA_CONFIG_P2_49_WIRING_PATHS = [
  PRISMA_CONFIG_P2_49_DOC,
  PRISMA_CONFIG_P2_49_ARTIFACT,
  PRISMA_CONFIG_P2_49_AUDIT_MODULE,
  PRISMA_CONFIG_P2_49_UNIT_TEST,
  PRISMA_CONFIG_P2_49_CI_WORKFLOW,
  PRISMA_CONFIG_P2_49_BASE_POLICY,
  PRISMA_CONFIG_P2_49_CONFIG_PATH,
  PRISMA_CONFIG_P2_49_SCHEMA_PATH,
  "tests/unit/prisma-config.test.ts",
] as const;
