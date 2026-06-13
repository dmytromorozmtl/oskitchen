import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertNoBundleSizeViolations,
  BUNDLE_FIRST_LOAD_FAIL_KB,
  BUNDLE_FIRST_LOAD_WARN_KB,
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  BUNDLE_SIZE_BUDGET_POLICY_ID,
  BUNDLE_SIZE_DEFAULT_TOLERANCE_PERCENT,
  BUNDLE_SHARED_MAX_KB,
  BUNDLE_SURFACE_MAX_KB,
  findAbsoluteBundleBudgetFails,
  findAbsoluteBundleBudgetWarnings,
  findBundleSizeViolations,
  parseFirstLoadJsFromBuildLog,
  parseSizeToKb,
  type BundleSizeBaseline,
} from "@/lib/performance/bundle-size-budget-policy";

const ROOT = process.cwd();

const SAMPLE_BUILD_LOG = `
Route (app)                                 Size  First Load JS
┌ ƒ /                                      4.2 kB         194 kB
├ ƒ /pricing                               8.5 kB         211 kB
├ ƒ /login                                 3.67 kB        129 kB
├ ƒ /dashboard/today                       14.9 kB        139 kB
├ ƒ /dashboard/pos/terminal              20.8 kB        165 kB
├ ƒ /dashboard/analytics/benchmarks      9.62 kB        238 kB
├ ƒ /dashboard/marketplace/catalog         5.02 kB        118 kB
+ First Load JS shared by all              102 kB
`;

function loadBaseline(): BundleSizeBaseline {
  const path = join(ROOT, BUNDLE_SIZE_BASELINE_ARTIFACT);
  return JSON.parse(readFileSync(path, "utf8")) as BundleSizeBaseline;
}

describe("bundle size regression", () => {
  it("locks bundle size budget policy", () => {
    expect(BUNDLE_SIZE_BUDGET_POLICY_ID).toBe("bundle-size-budget-v1");
    expect(BUNDLE_SIZE_DEFAULT_TOLERANCE_PERCENT).toBe(15);
    expect(BUNDLE_SHARED_MAX_KB).toBe(130);
    expect(BUNDLE_FIRST_LOAD_WARN_KB).toBe(500);
    expect(BUNDLE_FIRST_LOAD_FAIL_KB).toBe(1000);
    expect(BUNDLE_SURFACE_MAX_KB.marketing).toBeGreaterThanOrEqual(200);
  });

  it("parses First Load JS sizes from next build log lines", () => {
    expect(parseSizeToKb("102 kB")).toBe(102);
    expect(parseSizeToKb("1.5 MB")).toBe(1536);

    const parsed = parseFirstLoadJsFromBuildLog(SAMPLE_BUILD_LOG);
    expect(parsed.sharedKb).toBe(102);
    expect(parsed.routes.get("/")).toBe(194);
    expect(parsed.routes.get("/pricing")).toBe(211);
    expect(parsed.routes.get("/dashboard/pos/terminal")).toBe(165);
  });

  it("has a committed baseline artifact for representative routes", () => {
    const baseline = loadBaseline();
    expect(baseline.policyId).toBe(BUNDLE_SIZE_BUDGET_POLICY_ID);
    expect(baseline.sharedFirstLoadJsKb).toBe(102);
    expect(baseline.routes.length).toBeGreaterThanOrEqual(7);

    for (const route of baseline.routes) {
      expect(route.firstLoadJsKb).toBeLessThanOrEqual(BUNDLE_SURFACE_MAX_KB[route.surface]);
    }
  });

  it("passes regression check for baseline snapshot build log", () => {
    const baseline = loadBaseline();
    const measured = parseFirstLoadJsFromBuildLog(SAMPLE_BUILD_LOG);
    expect(findBundleSizeViolations(measured, baseline)).toEqual([]);
    expect(() => assertNoBundleSizeViolations(measured, baseline)).not.toThrow();
  });

  it("detects baseline regression when a route grows beyond tolerance", () => {
    const baseline = loadBaseline();
    const regressedLog = SAMPLE_BUILD_LOG.replace("211 kB", "260 kB");
    const measured = parseFirstLoadJsFromBuildLog(regressedLog);
    const violations = findBundleSizeViolations(measured, baseline);
    expect(violations.some((v) => v.route === "/pricing" && v.kind === "baseline_regression")).toBe(
      true,
    );
  });

  it("detects surface budget violations independently of baseline", () => {
    const baseline = loadBaseline();
    const heavyLog = `
├ ƒ /dashboard/analytics/benchmarks      9.62 kB        520 kB
+ First Load JS shared by all              102 kB
`;
    const measured = parseFirstLoadJsFromBuildLog(heavyLog);
    const violations = findBundleSizeViolations(measured, baseline);
    expect(
      violations.some((v) => v.route === "/dashboard/analytics/benchmarks" && v.kind === "surface_budget"),
    ).toBe(true);
  });

  it("warns above 500 kB and fails above 1000 kB First Load JS", () => {
    const warnLog = `
├ ƒ /dashboard/heavy                       1 kB           550 kB
+ First Load JS shared by all              102 kB
`;
    const failLog = `
├ ƒ /dashboard/too-heavy                   1 kB         1.1 MB
+ First Load JS shared by all              102 kB
`;

    const warnMeasured = parseFirstLoadJsFromBuildLog(warnLog);
    const failMeasured = parseFirstLoadJsFromBuildLog(failLog);

    expect(findAbsoluteBundleBudgetWarnings(warnMeasured)).toHaveLength(1);
    expect(findAbsoluteBundleBudgetFails(warnMeasured)).toHaveLength(0);
    expect(findAbsoluteBundleBudgetFails(failMeasured)).toHaveLength(1);
    expect(findAbsoluteBundleBudgetFails(failMeasured)[0]?.kind).toBe("absolute_fail");
  });

  it("documents regression test in bundle analysis guide", () => {
    const doc = readFileSync(join(ROOT, "docs/bundle-analysis.md"), "utf8");
    expect(doc).toContain("tests/unit/bundle-size-regression.test.ts");
  });

  it("validates live build log when artifacts/build-route-sizes.log is present", () => {
    const logPath = join(ROOT, "artifacts/build-route-sizes.log");
    if (!existsSync(logPath)) return;

    const baseline = loadBaseline();
    const measured = parseFirstLoadJsFromBuildLog(readFileSync(logPath, "utf8"));
    assertNoBundleSizeViolations(measured, baseline);
  });

  it("wires bundle size regression gate in CI and package.json", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const scripts = pkg.scripts ?? {};
    expect(scripts["check:bundle-size-regression"]).toContain("check-bundle-size-regression.ts");
    expect(scripts["test:ci:bundle-size-regression"]).toContain("bundle-size-regression.test.ts");
    expect(scripts["test:ci:bundle-size-regression"]).toContain("check:bundle-size-regression");

    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("Performance regression (bundle size)");
    expect(ci).toContain("bundle-size-regression");
    expect(ci).toContain("build-route-sizes.log");

    const script = readFileSync(join(ROOT, "scripts/check-bundle-size-regression.ts"), "utf8");
    expect(script).toContain("BUNDLE_FIRST_LOAD_WARN_KB");
    expect(script).toContain("BUNDLE_FIRST_LOAD_FAIL_KB");
  });
});
