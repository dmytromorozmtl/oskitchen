import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  runCrossTenantE2eContract,
  runCrossTenantE2eKeyRouteContract,
} from "@/lib/qa/cross-tenant-e2e-contract";
import { CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS } from "@/lib/qa/cross-tenant-e2e-policy";
import {
  isAcceptedDenialStatus,
  scoreCrossTenantIsolationContract,
  TENANT_A,
  TENANT_B,
} from "@/lib/qa/cross-tenant-isolation-contract";
import {
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_ACCEPTED_DENIAL_STATUSES,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_ARTIFACT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_BENCHMARK_NPM_SCRIPT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_CHECK_NPM_SCRIPT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_CI_NPM_SCRIPT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_CONTRACT_ARTIFACT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_DOC,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_NPM_SCRIPT,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_EXTENDS_POLICY_ID,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_POLICY_ID,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_REQUIRED_E2E_SCENARIOS,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_WIRING_PATHS,
  CROSS_TENANT_DATA_LEAK_E2E_P0_15_WORKSPACE_COUNT,
} from "@/lib/security/cross-tenant-data-leak-e2e-p0-15-policy";

const ROOT = process.cwd();

describe("cross-tenant data leak E2E (P0-15)", () => {
  it("locks P0-15 policy, 2 workspaces, and 403/404 denial contract", () => {
    expect(CROSS_TENANT_DATA_LEAK_E2E_P0_15_POLICY_ID).toBe(
      "p0-15-cross-tenant-data-leak-e2e-v1",
    );
    expect(CROSS_TENANT_DATA_LEAK_E2E_P0_15_EXTENDS_POLICY_ID).toBe(
      "cross-tenant-e2e-p1-14-v1",
    );
    expect(CROSS_TENANT_DATA_LEAK_E2E_P0_15_WORKSPACE_COUNT).toBe(2);
    expect(CROSS_TENANT_DATA_LEAK_E2E_P0_15_ACCEPTED_DENIAL_STATUSES).toEqual([403, 404]);
    expect(CROSS_TENANT_DATA_LEAK_E2E_P0_15_REQUIRED_E2E_SCENARIOS).toHaveLength(4);
    expect(TENANT_A.workspaceId).not.toBe(TENANT_B.workspaceId);
    expect(isAcceptedDenialStatus(403)).toBe(true);
    expect(isAcceptedDenialStatus(404)).toBe(true);
    expect(isAcceptedDenialStatus(200)).toBe(false);
  });

  it("passes User A → User B contract scenarios (403/404, no leak)", () => {
    const keyRoutes = runCrossTenantE2eKeyRouteContract();
    expect(keyRoutes.every((row) => row.passed)).toBe(true);

    const scenarios = runCrossTenantE2eContract();
    const result = scoreCrossTenantIsolationContract(
      scenarios,
      CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS,
    );
    expect(result.passed).toBe(true);
    expect(result.passPct).toBe(100);
    expect(result.scenarioCount).toBeGreaterThanOrEqual(14);
  });

  it("documents P0-15 and wires Playwright E2E spec", () => {
    const doc = readFileSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_DOC), "utf8");
    expect(doc).toContain(CROSS_TENANT_DATA_LEAK_E2E_P0_15_POLICY_ID);
    expect(doc).toContain("403");
    expect(existsSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC))).toBe(true);

    const spec = readFileSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC), "utf8");
    expect(spec).toContain("seedTenantBResources");
    expect(spec).toContain("403, 404");
  });

  it("wires npm scripts, artifacts, and contract summary", () => {
    for (const rel of CROSS_TENANT_DATA_LEAK_E2E_P0_15_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CROSS_TENANT_DATA_LEAK_E2E_P0_15_CHECK_NPM_SCRIPT]).toContain(
      "cross-tenant-data-leak-e2e-p0-15.test.ts",
    );
    expect(pkg.scripts?.[CROSS_TENANT_DATA_LEAK_E2E_P0_15_CI_NPM_SCRIPT]).toContain(
      "cross-tenant-data-leak-e2e-p0-15.test.ts",
    );
    expect(pkg.scripts?.[CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_NPM_SCRIPT]).toContain(
      CROSS_TENANT_DATA_LEAK_E2E_P0_15_E2E_SPEC,
    );
    expect(pkg.scripts?.[CROSS_TENANT_DATA_LEAK_E2E_P0_15_BENCHMARK_NPM_SCRIPT]).toContain(
      "run-cross-tenant-e2e-benchmark.ts",
    );

    const artifact = JSON.parse(
      readFileSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_ARTIFACT), "utf8"),
    ) as { policyId: string; workspaceCount: number };
    expect(artifact.policyId).toBe(CROSS_TENANT_DATA_LEAK_E2E_P0_15_POLICY_ID);
    expect(artifact.workspaceCount).toBe(2);

    expect(existsSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_CONTRACT_ARTIFACT))).toBe(
      true,
    );
    const contract = JSON.parse(
      readFileSync(join(ROOT, CROSS_TENANT_DATA_LEAK_E2E_P0_15_CONTRACT_ARTIFACT), "utf8"),
    ) as { passed: boolean; passPct: number };
    expect(contract.passed).toBe(true);
    expect(contract.passPct).toBe(100);
  });
});
