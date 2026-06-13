import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  runCrossTenantIsolationContract,
  scoreCrossTenantIsolationContract,
  TENANT_A,
  TENANT_B,
  isAcceptedDenialStatus,
  mockPublicOrdersGet,
  mockPublicOrdersPost,
} from "@/lib/qa/cross-tenant-isolation-contract";
import {
  CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT,
  CROSS_TENANT_ISOLATION_BENCHMARK_NPM_SCRIPT,
  CROSS_TENANT_ISOLATION_BENCHMARK_SCRIPT,
  CROSS_TENANT_ISOLATION_BENCHMARK_UNIT_TEST,
  CROSS_TENANT_ISOLATION_E2E_POLICY_ID,
  CROSS_TENANT_ISOLATION_E2E_SPEC,
  CROSS_TENANT_ISOLATION_MIN_SCENARIOS,
  CROSS_TENANT_ISOLATION_STAGING_SPEC,
  CROSS_TENANT_API_IDOR_E2E_SPEC,
  CROSS_TENANT_API_IDOR_UNIT_TEST,
  CROSS_TENANT_API_IDOR_CONTRACT,
} from "@/lib/qa/cross-tenant-isolation-e2e-policy";
import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { assertOwnedByUser } from "@/lib/scope/user-owned-guards";
import { scopedIdWhere } from "@/lib/scope/tenant-scope";

const ROOT = process.cwd();

describe("cross-tenant isolation E2E contract (P0-20)", () => {
  it("locks policy id and script paths", () => {
    expect(CROSS_TENANT_ISOLATION_E2E_POLICY_ID).toBe("cross-tenant-isolation-e2e-v1");
    expect(existsSync(join(ROOT, CROSS_TENANT_ISOLATION_BENCHMARK_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_ISOLATION_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_ISOLATION_STAGING_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_API_IDOR_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_API_IDOR_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_API_IDOR_CONTRACT))).toBe(true);
    expect(CROSS_TENANT_ISOLATION_BENCHMARK_UNIT_TEST).toBe(
      "tests/unit/cross-tenant-isolation-e2e.test.ts",
    );
  });

  it("tenant A scopedIdWhere cannot bind tenant B workspace", () => {
    const where = scopedIdWhere(
      { userId: TENANT_A.userId, workspaceId: TENANT_A.workspaceId },
      TENANT_B.orderId,
    );
    expect(where).toEqual({ id: TENANT_B.orderId, workspaceId: TENANT_A.workspaceId });
    expect(where.workspaceId).not.toBe(TENANT_B.workspaceId);
  });

  it("tenant A assertOwnedByUser rejects tenant B owner with WorkspaceAccessDeniedError", () => {
    expect(() => assertOwnedByUser({ userId: TENANT_B.userId }, TENANT_A.userId)).toThrow(
      WorkspaceAccessDeniedError,
    );
  });

  it("tenant A → tenant B public API GET returns 403", () => {
    const response = mockPublicOrdersGet(TENANT_B.workspaceId);
    expect(response.status).toBe(403);
    expect(isAcceptedDenialStatus(response.status)).toBe(true);
    expect(response.body.reason).toBe("cross_tenant_workspace_forbidden");
  });

  it("tenant A → tenant B public API POST returns 403", () => {
    const response = mockPublicOrdersPost({ locationId: TENANT_B.locationId });
    expect(response.status).toBe(403);
    expect(isAcceptedDenialStatus(response.status)).toBe(true);
    expect(response.body.reason).toBe("cross_tenant_location_rejected");
  });

  it("passes full contract with 6+ isolation scenarios", () => {
    const scenarios = runCrossTenantIsolationContract();
    expect(scenarios.length).toBeGreaterThanOrEqual(CROSS_TENANT_ISOLATION_MIN_SCENARIOS);

    const result = scoreCrossTenantIsolationContract(
      scenarios,
      CROSS_TENANT_ISOLATION_MIN_SCENARIOS,
    );
    expect(result.passed).toBe(true);
    expect(result.passPct).toBe(100);
    expect(result.failedCount).toBe(0);
  });

  it("registers npm benchmark script and artifact path", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CROSS_TENANT_ISOLATION_BENCHMARK_NPM_SCRIPT]).toContain(
      "cross-tenant-isolation-e2e.test.ts",
    );
    expect(pkg.scripts?.[CROSS_TENANT_ISOLATION_BENCHMARK_NPM_SCRIPT]).toContain(
      "cross-tenant-api-idor.test.ts",
    );
    expect(pkg.scripts?.["benchmark:cross-tenant-isolation-e2e"]).toContain(
      "run-cross-tenant-isolation-e2e-benchmark.ts",
    );
    expect(CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT).toBe(
      "artifacts/cross-tenant-isolation-e2e-benchmark-summary.json",
    );
  });
});
