import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_UNIFIED_STOCK_CLAIM_ALLOWED,
} from "@/lib/inventory/inventory-depletion-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const TIER_MATRIX = join(ROOT, "docs/ci-e2e-tier-matrix.md");
const FEATURE_MATRIX = join(ROOT, "docs/feature-maturity-matrix.md");
const PRODUCT_POSITIONING = join(ROOT, "docs/product-positioning.md");

const POS_CHECKOUT_SERVICE = join(ROOT, "services/pos/pos-checkout-service.ts");
const STOREFRONT_ORDER_ACTION = join(ROOT, "actions/storefront-order.ts");

const REQUIRED_SCRIPTS = [
  "test:ci:pos-money-path:unit",
  "test:ci:pos-money-path:inventory",
  "test:ci:inventory-depletion:cert",
] as const;

const REQUIRED_FILES = [
  "tests/unit/pos-recipe-depletion.test.ts",
  "tests/integration/pos-inventory-depletion.integration.test.ts",
  "services/pos/pos-inventory-impact-service.ts",
  "services/inventory/pos-recipe-depletion.ts",
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

describe("inventory depletion certification (live repo)", () => {
  it("defines POS depletion unit + integration scripts and wiring cert", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:unit"]).toContain("pos-recipe-depletion.test.ts");
    expect(scripts["test:ci:pos-money-path:inventory"]).toContain(
      "pos-inventory-depletion.integration.test.ts",
    );
  });

  it("wires POS inventory depletion integration into pos-money-path CI job", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const job = extractJobBlock(workflow, "pos-money-path");
    expect(job).toContain("test:ci:pos-money-path:inventory");
  });

  it("hooks POS checkout into inventory impact recording", () => {
    const checkoutSource = readFileSync(POS_CHECKOUT_SERVICE, "utf8");
    expect(checkoutSource).toContain("recordPendingInventoryImpactsForPosOrder");
  });

  it("does not hook storefront checkout submit into POS inventory depletion yet", () => {
    const storefrontSource = readFileSync(STOREFRONT_ORDER_ACTION, "utf8");
    expect(storefrontSource).not.toContain("recordPendingInventoryImpactsForPosOrder");
    expect(storefrontSource).not.toContain("pos-inventory-impact-service");
    expect(storefrontSource).not.toContain("applyRecipeDepletionForPosLine");
  });

  it("includes inventory depletion cert in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:inventory-depletion:cert");
  });

  it("includes POS recipe depletion unit in vitest.pos.config allowlist", () => {
    const posConfig = readFileSync(join(ROOT, "vitest.pos.config.ts"), "utf8");
    expect(posConfig).toContain("pos-recipe-depletion.test.ts");
  });

  it("locks Era 4 POS-only depletion policy (no unified cross-channel stock claim)", () => {
    expect(INVENTORY_DEPLETION_POLICY_ID).toBe("era4-pos-only-v1");
    expect(INVENTORY_DEPLETION_UNIFIED_STOCK_CLAIM_ALLOWED).toBe(false);
  });

  it("documents POS certified path and POS-only storefront policy in canonical docs", () => {
    expect(existsSync(TIER_MATRIX)).toBe(true);
    const tierMatrix = readFileSync(TIER_MATRIX, "utf8");
    expect(tierMatrix).toContain("pos-inventory-depletion.integration.test.ts");
    expect(tierMatrix).toContain("pos-recipe-depletion.test.ts");
    expect(tierMatrix).toMatch(/POS-only/i);
    expect(tierMatrix).toContain("inventory-depletion-policy.ts");

    const featureMatrix = readFileSync(FEATURE_MATRIX, "utf8");
    expect(featureMatrix).toMatch(/POS-only/i);
    expect(featureMatrix).not.toMatch(/unified inventory depletion/i);

    const positioning = readFileSync(PRODUCT_POSITIONING, "utf8");
    expect(positioning).toMatch(/POS checkout depletes/i);
    expect(positioning).toMatch(/storefront, public API, and manual orders do not/i);
    expect(positioning).toContain("era4-pos-only-v1");

    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
