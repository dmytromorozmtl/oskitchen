import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CROSS_TENANT_E2E_ARTIFACT,
  CROSS_TENANT_E2E_BENCHMARK_NPM_SCRIPT,
  CROSS_TENANT_E2E_BENCHMARK_SCRIPT,
  CROSS_TENANT_E2E_KEY_API_ROUTES,
  CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS,
  CROSS_TENANT_E2E_NPM_SCRIPT,
  CROSS_TENANT_E2E_PLAYWRIGHT_SPEC,
  CROSS_TENANT_E2E_POLICY_ID,
  CROSS_TENANT_E2E_UNIT_TEST,
  CROSS_TENANT_E2E_WORKSPACE_COUNT,
  CROSS_TENANT_E2E_WIRING_PATHS,
} from "@/lib/qa/cross-tenant-e2e-policy";
import {
  runCrossTenantE2eContract,
  runCrossTenantE2eKeyRouteContract,
} from "@/lib/qa/cross-tenant-e2e-contract";
import { CROSS_TENANT_API_IDOR_ROUTE_FAMILIES } from "@/lib/qa/cross-tenant-api-idor-contract";
import { scoreCrossTenantIsolationContract } from "@/lib/qa/cross-tenant-isolation-contract";

const ROOT = process.cwd();

describe("cross-tenant E2E IDOR (P1-14)", () => {
  it("locks policy id, 2 workspaces, and key API route matrix", () => {
    expect(CROSS_TENANT_E2E_POLICY_ID).toBe("cross-tenant-e2e-p1-14-v1");
    expect(CROSS_TENANT_E2E_WORKSPACE_COUNT).toBe(2);
    expect(CROSS_TENANT_E2E_KEY_API_ROUTES.length).toBeGreaterThanOrEqual(10);

    const families = new Set(CROSS_TENANT_E2E_KEY_API_ROUTES.map((row) => row.family));
    for (const family of CROSS_TENANT_API_IDOR_ROUTE_FAMILIES) {
      expect(families.has(family)).toBe(true);
    }
    expect(families.has("inventory")).toBe(true);
    expect(families.has("staff")).toBe(true);
    expect(families.has("pos")).toBe(true);
    expect(families.has("kitchen")).toBe(true);
  });

  it("passes extended key-route IDOR contract scenarios", () => {
    const keyRoutes = runCrossTenantE2eKeyRouteContract();
    expect(keyRoutes.length).toBeGreaterThanOrEqual(8);
    const failed = keyRoutes.filter((row) => !row.passed);
    expect(failed, failed.map((f) => f.detail).join("; ")).toEqual([]);
  });

  it("passes full P1-14 contract including P0-6 API IDOR families", () => {
    const scenarios = runCrossTenantE2eContract();
    const result = scoreCrossTenantIsolationContract(
      scenarios,
      CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS,
    );
    expect(result.passed).toBe(true);
    expect(result.passPct).toBe(100);
    expect(result.scenarioCount).toBeGreaterThanOrEqual(14);
  });

  it("registers npm scripts, benchmark script, and Playwright spec", () => {
    expect(existsSync(join(ROOT, CROSS_TENANT_E2E_BENCHMARK_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CROSS_TENANT_E2E_PLAYWRIGHT_SPEC))).toBe(true);
    expect(CROSS_TENANT_E2E_UNIT_TEST).toBe("tests/unit/cross-tenant-e2e.test.ts");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CROSS_TENANT_E2E_NPM_SCRIPT]).toContain(CROSS_TENANT_E2E_UNIT_TEST);
    expect(pkg.scripts?.[CROSS_TENANT_E2E_BENCHMARK_NPM_SCRIPT]).toContain(
      "run-cross-tenant-e2e-benchmark.ts",
    );
    expect(CROSS_TENANT_E2E_ARTIFACT).toBe("artifacts/cross-tenant-e2e-summary.json");

    for (const path of CROSS_TENANT_E2E_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });
});
