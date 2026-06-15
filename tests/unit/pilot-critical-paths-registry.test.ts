/**
 * Documents pilot-critical paths and asserts registry entries stay wired to existing tests.
 * Happy-path logic lives in domain services; this file prevents silent removal of coverage.
 */
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const CRITICAL_PATHS: { id: string; testFile: string }[] = [
  { id: "cron_webhook_jobs", testFile: "tests/unit/run-cron-production-gate.test.ts" },
  { id: "cron_production_manifest", testFile: "tests/unit/cron-production-manifest.test.ts" },
  { id: "tenant_workspace_scope", testFile: "tests/unit/with-workspace-scope.test.ts" },
  { id: "impersonation_mfa", testFile: "tests/unit/impersonation-mfa.test.ts" },
  { id: "dsr_export_bundle", testFile: "tests/unit/user-data-export-service.test.ts" },
  { id: "csrf_origin_guard", testFile: "tests/unit/mutation-origin-guard.test.ts" },
  { id: "storefront_stripe_matrix", testFile: "tests/unit/storefront-stripe-matrix.test.ts" },
  { id: "public_api_auth", testFile: "tests/unit/public-api-auth.test.ts" },
  { id: "cross_tenant_denial", testFile: "tests/unit/cross-tenant-denial.test.ts" },
  { id: "staging_env_placeholders", testFile: "tests/unit/staging-env-placeholders.test.ts" },
];

describe("pilot critical paths registry", () => {
  it("maps each critical path to an on-disk unit test file", () => {
    for (const entry of CRITICAL_PATHS) {
      expect(existsSync(join(ROOT, entry.testFile)), `${entry.id} → ${entry.testFile}`).toBe(true);
    }
    expect(CRITICAL_PATHS.length).toBeGreaterThanOrEqual(8);
  });
});
