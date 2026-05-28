import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  PAGE_MATURITY_SWEEP_CI_SCRIPTS,
  PAGE_MATURITY_SWEEP_POLICY_ID,
  PAGE_MATURITY_SWEEP_UNIT_TESTS,
} from "@/lib/navigation/page-maturity-sweep-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("page maturity sweep CI certification (live repo)", () => {
  it("locks era4 page maturity sweep policy id", () => {
    expect(PAGE_MATURITY_SWEEP_POLICY_ID).toBe("era4-page-maturity-sweep-v1");
  });

  it("defines page maturity sweep CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PAGE_MATURITY_SWEEP_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:page-maturity-sweep"]).toContain("page-maturity-honesty");
  });

  it("includes page maturity sweep cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(governanceBundlesIncludesCert(scripts, "test:ci:page-maturity-sweep:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:page-maturity-sweep")).toBe(true);
  });

  it("wires PageMaturityRouteNotice into dashboard layout", () => {
    const layout = readFileSync(join(ROOT, "app/dashboard/layout.tsx"), "utf8");
    expect(layout).toContain("PageMaturityRouteNotice");
  });

  it("has policy, honesty module, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/navigation/page-maturity-honesty.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "components/dashboard/page-maturity-route-notice.tsx"))).toBe(
      true,
    );
    for (const rel of PAGE_MATURITY_SWEEP_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents page maturity sweep in feature maturity matrix", () => {
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).toContain("era4-page-maturity-sweep-v1");
    expect(matrix).toMatch(/page-maturity|PageMaturityRouteNotice/i);
  });
});
