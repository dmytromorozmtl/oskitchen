/**
 * Blueprint P3-75 — Seed/demo tenant (50 orders, 3 vendors, 20 inventory).
 *
 * @see docs/demo-tenant-seed-p3-75.md
 */

import {
  DEMO_TENANT_INVENTORY_ITEM_COUNT,
  DEMO_TENANT_ORDER_COUNT,
  DEMO_TENANT_SEED_CLI_PATH,
  DEMO_TENANT_SEED_COMMERCIAL_PATH,
  DEMO_TENANT_SEED_POLICY_ID,
  DEMO_TENANT_SEED_SERVICE_PATH,
  DEMO_TENANT_VENDOR_COUNT,
} from "@/lib/demo/demo-tenant-seed-policy";

export const DEMO_TENANT_SEED_P3_75_POLICY_ID = "demo-tenant-seed-p3-75-v1" as const;

export const DEMO_TENANT_SEED_P3_75_DOC = "docs/demo-tenant-seed-p3-75.md" as const;

export const DEMO_TENANT_SEED_P3_75_ARTIFACT =
  "artifacts/demo-tenant-seed-p3-75-registry.json" as const;

export const DEMO_TENANT_SEED_P3_75_AUDIT_SCRIPT =
  "scripts/audit-demo-tenant-seed-p3-75.ts" as const;

export const DEMO_TENANT_SEED_P3_75_NPM_SCRIPT = "audit:demo-tenant-seed-p3-75" as const;

export const DEMO_TENANT_SEED_P3_75_CHECK_NPM_SCRIPT =
  "check:demo-tenant-seed-p3-75" as const;

export const DEMO_TENANT_SEED_P3_75_UNIT_TEST =
  "tests/unit/demo-tenant-seed-p3-75.test.ts" as const;

export const DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID = DEMO_TENANT_SEED_POLICY_ID;

export const DEMO_TENANT_SEED_P3_75_UPSTREAM_TEST = "tests/unit/demo-tenant-seed.test.ts" as const;

export const DEMO_TENANT_SEED_P3_75_DEMO_IMPORT_ACTION = "actions/demo.ts" as const;

export const DEMO_TENANT_SEED_P3_75_NPM_SCRIPTS = [
  "test:ci:demo-tenant-seed",
  "test:ci:demo-tenant-seed-p3-75:cert",
  "db:seed-demo",
] as const;

export const DEMO_TENANT_SEED_P3_75_WIRING_PATHS = [
  DEMO_TENANT_SEED_P3_75_DOC,
  DEMO_TENANT_SEED_SERVICE_PATH,
  DEMO_TENANT_SEED_COMMERCIAL_PATH,
  DEMO_TENANT_SEED_CLI_PATH,
  DEMO_TENANT_SEED_P3_75_DEMO_IMPORT_ACTION,
  "lib/demo/demo-tenant-seed-p3-75-measurement.ts",
  "lib/demo/demo-tenant-seed-p3-75-audit.ts",
  DEMO_TENANT_SEED_P3_75_UNIT_TEST,
  DEMO_TENANT_SEED_P3_75_UPSTREAM_TEST,
  DEMO_TENANT_SEED_P3_75_ARTIFACT,
] as const;

export const DEMO_TENANT_SEED_P3_75_TARGETS = {
  orders: DEMO_TENANT_ORDER_COUNT,
  vendors: DEMO_TENANT_VENDOR_COUNT,
  inventory: DEMO_TENANT_INVENTORY_ITEM_COUNT,
} as const;
