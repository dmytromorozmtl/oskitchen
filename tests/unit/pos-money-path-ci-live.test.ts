import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const TIER_MATRIX = join(ROOT, "docs/ci-e2e-tier-matrix.md");

const REQUIRED_SCRIPTS = [
  "pos:seed-ci-checkout",
  "test:ci:pos-money-path:unit",
  "test:ci:pos-money-path:integration",
  "test:ci:pos-money-path:inventory",
  "test:ci:pos-money-path:e2e",
  "test:ci:pos-money-path:cert",
] as const;

const REQUIRED_FILES = [
  "scripts/seed-ci-pos-checkout.ts",
  "e2e/auth.setup.ts",
  "e2e/pos-checkout-flow.spec.ts",
  "tests/unit/pos-checkout-canonical.test.ts",
  "tests/unit/pos-terminal-checkout-lifecycle.test.ts",
  "tests/unit/actions-pos-rbac.test.ts",
  "tests/integration/order-entrypoint-pii.integration.test.ts",
  "tests/integration/pos-inventory-depletion.integration.test.ts",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function extractJobBlock(workflow: string, jobName: string): string {
  const marker = `${jobName}:`;
  const start = workflow.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = workflow.slice(start + marker.length);
  const nextJob = rest.search(/\n  [a-z][a-z0-9-]+:\n/);
  return nextJob === -1 ? rest : rest.slice(0, nextJob);
}

describe("POS money-path CI certification (live repo)", () => {
  it("defines focused npm scripts for seed, unit, integration, inventory, e2e, and wiring cert", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:unit"]).toContain("pos-checkout-canonical.test.ts");
    expect(scripts["test:ci:pos-money-path:unit"]).toContain("pos-terminal-checkout-lifecycle.test.ts");
    expect(scripts["test:ci:pos-money-path:integration"]).toContain("order-entrypoint-pii.integration.test.ts");
    expect(scripts["test:ci:pos-money-path:inventory"]).toContain(
      "pos-inventory-depletion.integration.test.ts",
    );
    expect(scripts["test:ci:pos-money-path:e2e"]).toContain("pos-checkout-flow.spec.ts");
  });

  it("wires pos-money-path job in CI with seed, unit, integration, inventory, and optional auth E2E", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const job = extractJobBlock(workflow, "pos-money-path");

    expect(job).toContain("postgres:");
    expect(job).toContain("pos:seed-ci-checkout");
    expect(job).toContain("test:ci:pos-money-path:unit");
    expect(job).toContain("test:ci:pos-money-path:integration");
    expect(job).toContain("test:ci:pos-money-path:inventory");
    expect(job).toContain("test:ci:pos-money-path:e2e");
    expect(job).toContain("E2E_LOGIN_EMAIL");
    expect(job).toContain("E2E_LOGIN_PASSWORD");
    expect(job).toContain("npm run build");
    expect(job).toContain("npm run start");
  });

  it("keeps tier-1 POS checkout integration in security-db test:security bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:security"]).toContain("order-entrypoint-pii.integration.test.ts");
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const securityDb = extractJobBlock(workflow, "security-db");
    expect(securityDb).toContain("test:security");
  });

  it("includes POS money-path cert in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:pos-money-path:cert");
  });

  it("documents tier 2b POS money path, software-only scope, and required artifacts exist", () => {
    expect(existsSync(TIER_MATRIX)).toBe(true);
    const matrix = readFileSync(TIER_MATRIX, "utf8");
    expect(matrix).toContain("pos-money-path");
    expect(matrix).toContain("test:ci:pos-money-path:unit");
    expect(matrix).toContain("test:ci:pos-money-path:integration");
    expect(matrix).toContain("test:ci:pos-money-path:inventory");
    expect(matrix).toContain("test:ci:pos-money-path:e2e");
    expect(matrix).toMatch(/hardware|software POS/i);

    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
