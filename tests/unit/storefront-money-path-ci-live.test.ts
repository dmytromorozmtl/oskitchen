import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const TIER_MATRIX = join(ROOT, "docs/ci-e2e-tier-matrix.md");

const REQUIRED_SCRIPTS = [
  "storefront:seed-ci-checkout",
  "test:ci:storefront-money-path:unit",
  "test:ci:storefront-money-path:e2e",
  "test:ci:storefront-money-path:cert",
] as const;

const REQUIRED_FILES = [
  "scripts/seed-ci-storefront-checkout.ts",
  "e2e/storefront-checkout-pay-later.spec.ts",
  "tests/unit/storefront/storefront-payment-recovery.test.ts",
  "tests/unit/storefront-stripe-matrix.test.ts",
  "tests/integration/storefront-order-pii.integration.test.ts",
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

describe("storefront money-path CI certification (live repo)", () => {
  it("defines focused npm scripts for seed, unit, e2e, and wiring cert", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:storefront-money-path:unit"]).toContain(
      "storefront-payment-recovery.test.ts",
    );
    expect(scripts["test:ci:storefront-money-path:unit"]).toContain("storefront-stripe-matrix.test.ts");
    expect(scripts["test:ci:storefront-money-path:e2e"]).toContain(
      "storefront-checkout-pay-later.spec.ts",
    );
  });

  it("wires storefront-money-path job in CI with seed, unit, build, and pay-later E2E", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const job = extractJobBlock(workflow, "storefront-money-path");

    expect(job).toContain("postgres:");
    expect(job).toContain("storefront:seed-ci-checkout");
    expect(job).toContain("test:ci:storefront-money-path:unit");
    expect(job).toContain("test:ci:storefront-money-path:e2e");
    expect(job).toContain("test:ci:storefront-stripe-e2e:policy");
    expect(job).toContain("storefront-stripe-e2e-summary");
    expect(job).toContain("secrets.STRIPE_SECRET_KEY != ''");
    expect(job).toContain("npm run build");
    expect(job).toContain("npm run start");
  });

  it("keeps tier-1 payment failure recovery in security-db test:security bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:security"]).toContain("storefront-order-pii.integration.test.ts");
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const securityDb = extractJobBlock(workflow, "security-db");
    expect(securityDb).toContain("test:security");
  });

  it("includes storefront money-path cert in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:storefront-money-path:cert");
  });

  it("documents tier 2 storefront money path and required artifacts exist", () => {
    expect(existsSync(TIER_MATRIX)).toBe(true);
    const matrix = readFileSync(TIER_MATRIX, "utf8");
    expect(matrix).toContain("storefront-money-path");
    expect(matrix).toContain("test:ci:storefront-money-path:unit");
    expect(matrix).toContain("test:ci:storefront-money-path:e2e");

    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
