import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();
const GUARD = join(ROOT, "lib/api-public/guard.ts");
const MATURITY_MATRIX = join(ROOT, "docs/feature-maturity-matrix.md");

const REQUIRED_SCRIPTS = ["test:ci:public-api-v1", "test:ci:public-api-v1:cert"] as const;

const V1_RESOURCES = [
  "products",
  "customers",
  "orders",
  "inventory",
  "locations",
  "recipes",
  "staff",
  "webhooks",
] as const;

const REQUIRED_UNIT_TESTS = [
  "tests/unit/public-api-v1-resources-contract.test.ts",
  "tests/unit/public-api-auth.test.ts",
  "tests/unit/public-api-orders-contract.test.ts",
  "tests/unit/public-api-orders-route-canonical.test.ts",
  "tests/unit/public-api-order-create.test.ts",
  "tests/unit/public-api-cross-tenant.test.ts",
  "tests/unit/public-api-tenant-isolation.test.ts",
] as const;

const REQUIRED_FILES = [
  "lib/api-public/guard.ts",
  "lib/api-public/auth.ts",
  "lib/orders/public-api-order-create.ts",
  ...V1_RESOURCES.map((r) => `app/api/public/v1/${r}/route.ts`),
  ...REQUIRED_UNIT_TESTS,
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("public API v1 CI certification (live repo)", () => {
  it("defines public API v1 unit bundle and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:public-api-v1"]).toContain("public-api-v1-resources-contract.test.ts");
    expect(scripts["test:ci:public-api-v1"]).toContain("public-api-auth.test.ts");
    expect(scripts["test:ci:public-api-v1"]).toContain("public-api-tenant-isolation.test.ts");
    expect(scripts["test:ci:public-api-v1:cert"]).toContain(
      "test:ci:public-api-partner-confidence-era16:cert",
    );
  });

  it("includes public API v1 cert before unit bundle in governance bundles partition", () => {
    const scripts = readPackageScripts();
    const partition = scripts["test:ci:governance-bundles:partition-platform"];
    expect(partition).toContain("test:ci:public-api-v1:cert");
    expect(partition).toContain("npm run test:ci:public-api-v1 &&");
    expect(partition.indexOf("test:ci:public-api-v1:cert")).toBeLessThan(
      partition.indexOf("npm run test:ci:public-api-v1 &&"),
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:public-api-v1:cert")).toBe(true);
  });

  it("guards all eight v1 resources with guardPublicApi fail-closed wiring", () => {
    for (const resource of V1_RESOURCES) {
      const routePath = join(ROOT, `app/api/public/v1/${resource}/route.ts`);
      expect(existsSync(routePath), resource).toBe(true);
      const source = readFileSync(routePath, "utf8");
      expect(source, resource).toContain("guardPublicApi");
      expect(source, resource).toContain("isGuardError");
    }

    const guard = readFileSync(GUARD, "utf8");
    expect(guard).toContain('status: 401');
    expect(guard).toContain("Unauthorized");
    expect(guard).toContain("resolveEnterpriseApiUserId");
  });

  it("covers auth, tenant isolation, and contract suites in the unit bundle script", () => {
    const scripts = readPackageScripts();
    const bundle = scripts["test:ci:public-api-v1"];
    for (const rel of REQUIRED_UNIT_TESTS) {
      expect(bundle, rel).toContain(rel.split("/").pop()!);
    }
  });

  it("documents public API v1 contract coverage in feature maturity matrix", () => {
    expect(existsSync(MATURITY_MATRIX)).toBe(true);
    const matrix = readFileSync(MATURITY_MATRIX, "utf8");
    expect(matrix).toContain("public-api-v1-resources-contract.test.ts");
    expect(matrix).toContain("test:ci:public-api-v1");
    expect(matrix).toMatch(/Public API v1 overall/i);
  });

  it("requires public API v1 artifacts on disk", () => {
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
