/**
 * Blueprint P1-15 / P2-49 — Prisma config migration (package.json#prisma → prisma.config.ts).
 *
 * @see prisma.config.ts
 * @see docs/prisma-config-p2-49.md
 * @see tests/unit/prisma-config.test.ts
 */

export const PRISMA_CONFIG_POLICY_ID = "prisma-config-p1-15-v1" as const;

export const PRISMA_CONFIG_PATH = "prisma.config.ts" as const;

export const PRISMA_SCHEMA_PATH = "prisma/schema.prisma" as const;

export const PRISMA_MIGRATIONS_PATH = "prisma/migrations" as const;

export const PRISMA_SEED_COMMAND = "tsx prisma/seed.ts" as const;

export const PRISMA_CONFIG_UNIT_TEST = "tests/unit/prisma-config.test.ts" as const;

export const PRISMA_CONFIG_NPM_SCRIPT = "test:ci:prisma-config" as const;

export const PRISMA_CONFIG_WIRING_PATHS = [
  PRISMA_CONFIG_PATH,
  PRISMA_SCHEMA_PATH,
  PRISMA_CONFIG_UNIT_TEST,
  "lib/prisma/prisma-config-policy.ts",
] as const;
