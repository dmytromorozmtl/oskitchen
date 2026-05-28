import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_SMOKE_CI_SCRIPTS,
  KDS_STAGING_SMOKE_POLICY_ID,
  KDS_STAGING_SMOKE_UNIT_TESTS,
} from "@/lib/kitchen/kds-staging-smoke-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("KDS staging smoke CI certification (live repo)", () => {
  it("locks era4 KDS staging smoke policy id", () => {
    expect(KDS_STAGING_SMOKE_POLICY_ID).toBe("era4-kds-staging-smoke-v1");
  });

  it("defines staging smoke CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_STAGING_SMOKE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-staging-smoke"]).toContain("kds-staging-smoke-wiring");
    expect(scripts["smoke:kds-daily"]).toContain("smoke-kds-daily-service");
  });

  it("includes staging smoke cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:kds-staging-smoke:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:kds-staging-smoke");
  });

  it("has policy, checklist, smoke script, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/kitchen/kds-staging-smoke-policy.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "docs/kds-staging-smoke-checklist.md"))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/smoke-kds-daily-service.ts"))).toBe(true);
    for (const rel of KDS_STAGING_SMOKE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents staging smoke in feature maturity matrix without rush-hour claim", () => {
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).toContain("era4-kds-staging-smoke-v1");
    expect(matrix).toMatch(/staging smoke|operational smoke/i);
    expect(matrix).not.toMatch(/rush[- ]?hour certified/i);
  });
});
