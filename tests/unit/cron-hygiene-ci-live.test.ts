import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ALLOWED_PRODUCTION_CRON_SLUGS } from "@/services/cron/production-manifest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const TIER_MATRIX = join(ROOT, "docs/ci-e2e-tier-matrix.md");

const REQUIRED_SCRIPTS = [
  "validate:production-crons",
  "validate:cron-inventory",
  "test:ci:cron-hygiene",
  "test:ci:cron-hygiene:cert",
] as const;

const REQUIRED_FILES = [
  "tests/unit/cron-hygiene-live.test.ts",
  "tests/unit/cron-reconciliation-live.test.ts",
  "tests/unit/cron-route-inventory-live.test.ts",
  "tests/unit/cron-archive-era4-cert-live.test.ts",
  "tests/unit/cron-surface-era9-cert-live.test.ts",
  "tests/unit/cron-surface-era14-cert-live.test.ts",
  "lib/cron/cron-surface-era9-policy.ts",
  "lib/cron/cron-surface-era14-policy.ts",
  "tests/unit/run-cron-production-gate.test.ts",
  "tests/unit/cron-experimental-skip.test.ts",
  "lib/cron/cron-surface-policy.ts",
  "config/cron-archive-manifest.json",
  "services/cron/production-manifest.ts",
  "services/cron/cron-reconciliation.ts",
  "services/cron/cron-route-inventory-validation.ts",
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

describe("cron hygiene CI certification (live repo)", () => {
  it("defines production validation, inventory validation, hygiene bundle, and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["validate:production-crons"]).toContain("cron-reconciliation-live.test.ts");
    expect(scripts["validate:production-crons"]).toContain("cron-hygiene-live.test.ts");
    expect(scripts["validate:cron-inventory"]).toContain("cron-route-inventory-live.test.ts");
    expect(scripts["validate:cron-inventory"]).toContain("cron-hygiene-live.test.ts");
    expect(scripts["test:ci:cron-hygiene"]).toContain("cron-hygiene-live.test.ts");
    expect(scripts["test:ci:cron-hygiene"]).toContain("run-cron-production-gate.test.ts");
  });

  it("wires cron validators into default quality CI job", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const quality = extractJobBlock(workflow, "quality");
    expect(quality).toContain("validate:production-crons");
    expect(quality).toContain("validate:cron-inventory");
  });

  it("includes cron hygiene cert in governance platform partition (full bundle composition)", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles:partition-platform"]).toContain(
      "test:ci:cron-hygiene:cert",
    );
    const full = scripts["test:ci:governance-bundles"] ?? "";
    expect(full).toContain("partition-platform");
  });

  it("keeps production allowlist count honest and documented", () => {
    expect(ALLOWED_PRODUCTION_CRON_SLUGS.length).toBe(21);
    expect(existsSync(TIER_MATRIX)).toBe(true);
    const matrix = readFileSync(TIER_MATRIX, "utf8");
    expect(matrix).toContain("Tier 1b — Cron hygiene");
    expect(matrix).toContain("validate:production-crons");
    expect(matrix).toContain("validate:cron-inventory");
    expect(matrix).toContain("21 allowlisted slugs");
  });

  it("requires cron hygiene artifacts on disk", () => {
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
