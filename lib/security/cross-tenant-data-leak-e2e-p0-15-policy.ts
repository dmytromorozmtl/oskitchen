/**
 * P0-15 — Cross-tenant data leak E2E: 2 workspaces, User A → User B data → 403/404.
 *
 * @see docs/cross-tenant-data-leak-e2e-p0-15.md
 * @see e2e/cross-tenant-e2e.spec.ts
 */

import {
  CROSS_TENANT_E2E_ARTIFACT,
  CROSS_TENANT_E2E_PLAYWRIGHT_SPEC,
  CROSS_TENANT_E2E_POLICY_ID,
  CROSS_TENANT_E2E_WORKSPACE_COUNT,
} from "@/lib/qa/cross-tenant-e2e-policy";
import { CROSS_TENANT_ACCEPTED_DENIAL_STATUSES } from "@/lib/qa/cross-tenant-isolation-e2e-policy";

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_POLICY_ID =
  "p0-15-cross-tenant-data-leak-e2e-v1" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_DOC =
  "docs/cross-tenant-data-leak-e2e-p0-15.md" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_ARTIFACT =
  "artifacts/cross-tenant-data-leak-e2e.json" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_CONTRACT_ARTIFACT = CROSS_TENANT_E2E_ARTIFACT;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC = CROSS_TENANT_E2E_PLAYWRIGHT_SPEC;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_WORKSPACE_COUNT = CROSS_TENANT_E2E_WORKSPACE_COUNT;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_ACCEPTED_DENIAL_STATUSES =
  CROSS_TENANT_ACCEPTED_DENIAL_STATUSES;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_REQUIRED_E2E_SCENARIOS = [
  "tenant_a_dashboard_foreign_order_not_found",
  "tenant_a_marketplace_invoice_foreign_po_403_or_404",
  "tenant_a_audit_export_foreign_workspace_no_leak",
  "tenant_a_public_api_foreign_workspace_403_or_empty",
] as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_CHECK_NPM_SCRIPT =
  "check:cross-tenant-data-leak-e2e-p0-15" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_CI_NPM_SCRIPT =
  "test:ci:cross-tenant-data-leak-e2e-p0-15" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_NPM_SCRIPT =
  "test:e2e:cross-tenant-data-leak-e2e" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_BENCHMARK_NPM_SCRIPT =
  "benchmark:cross-tenant-data-leak-e2e-p0-15" as const;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_EXTENDS_POLICY_ID = CROSS_TENANT_E2E_POLICY_ID;

export const CROSS_TENANT_DATA_LEAK_E2E_P0_15_WIRING_PATHS = [
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_DOC,
  "lib/qa/cross-tenant-e2e-policy.ts",
  "lib/qa/cross-tenant-e2e-contract.ts",
  "lib/qa/cross-tenant-isolation-contract.ts",
  "scripts/run-cross-tenant-e2e-benchmark.ts",
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC,
  "tests/unit/cross-tenant-data-leak-e2e-p0-15.test.ts",
  "tests/unit/cross-tenant-e2e.test.ts",
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_ARTIFACT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_CONTRACT_ARTIFACT,
] as const;
