import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import { NAV_MATURITY_RULES } from "@/lib/navigation/nav-maturity-governance";

const ROOT = process.cwd();
const NAV_GOVERNANCE = join(ROOT, "lib/navigation/nav-maturity-governance.ts");
const BUSINESS_MODES = join(ROOT, "lib/business-modes.ts");
const DASHBOARD_NAV = join(ROOT, "components/dashboard/dashboard-nav.tsx");
const MATURITY_MATRIX = join(ROOT, "docs/feature-maturity-matrix.md");

const REQUIRED_SCRIPTS = ["test:ci:nav-governance", "test:ci:nav-governance:cert"] as const;

const REQUIRED_FILES = [
  "lib/navigation/nav-maturity-governance.ts",
  "tests/unit/nav-maturity-governance.test.ts",
  "tests/unit/release-navigation.test.ts",
  "components/dashboard/dashboard-nav.tsx",
  "lib/business-modes.ts",
] as const;

const PLACEHOLDER_PREFIXES = [
  "/dashboard/integrations/doordash",
  "/dashboard/integrations/grubhub",
  "/dashboard/integrations/uber-eats",
] as const;

const PREVIEW_PREFIXES = ["/dashboard/pos/tabs", "/dashboard/pos/handheld"] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("nav maturity governance CI certification (live repo)", () => {
  it("defines nav governance unit bundle and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:nav-governance"]).toContain("nav-maturity-governance.test.ts");
    expect(scripts["test:ci:nav-governance"]).toContain("release-navigation.test.ts");
  });

  it("includes nav governance cert and unit bundle in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(governanceBundlesIncludesCert(scripts, "test:ci:nav-governance:cert")).toBe(true);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:nav-governance")).toBe(true);
  });

  it("classifies marketplace placeholders and preview surfaces in NAV_MATURITY_RULES", () => {
    for (const prefix of PLACEHOLDER_PREFIXES) {
      const rule = NAV_MATURITY_RULES.find((r) => r.prefix === prefix);
      expect(rule, prefix).toBeDefined();
      expect(rule?.exposure).toBe("placeholder");
    }
    for (const prefix of PREVIEW_PREFIXES) {
      const rule = NAV_MATURITY_RULES.find((r) => r.prefix === prefix);
      expect(rule, prefix).toBeDefined();
      expect(rule?.exposure).toBe("preview");
    }
  });

  it("filters focused nav through maturity governance and renders preview badges", () => {
    const businessModes = readFileSync(BUSINESS_MODES, "utf8");
    expect(businessModes).toContain("filterNavGroupsByMaturityGovernance");

    const dashboardNav = readFileSync(DASHBOARD_NAV, "utf8");
    expect(dashboardNav).toContain("navMaturityBadgeForHref");
  });

  it("documents nav maturity governance in feature maturity matrix", () => {
    expect(existsSync(MATURITY_MATRIX)).toBe(true);
    const matrix = readFileSync(MATURITY_MATRIX, "utf8");
    expect(matrix).toContain("nav-maturity-governance.ts");
    expect(matrix).toContain("NAV_MATURITY_RULES");
  });

  it("requires nav governance artifacts on disk", () => {
    expect(existsSync(NAV_GOVERNANCE)).toBe(true);
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
