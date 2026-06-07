import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  coreWebVitalsMetricsPass,
  CWV_PERFORMANCE_BASELINE_ARTIFACT,
  CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS,
  CWV_PERFORMANCE_REGRESSION_CHECK_SCRIPT,
  CWV_PERFORMANCE_REGRESSION_CI_SCRIPTS,
  CWV_PERFORMANCE_REGRESSION_POLICY_ID,
  CWV_PERFORMANCE_REGRESSION_REQUIRED_PATHS,
  CWV_PERFORMANCE_REGRESSION_TOLERANCE_PERCENT,
  CWV_PERFORMANCE_REGRESSION_WORKFLOW_PATH,
  assertNoCwvRegressions,
  cwvPerformanceRegressionPass,
  findAbsoluteCwvViolations,
  findCwvBaselineRegressions,
  mergeCwvViolations,
  parseLhciCwvManifest,
  type CwvPerformanceBaseline,
} from "@/lib/performance/cwv-performance-regression-policy";
import { LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID } from "@/lib/performance/lighthouse-core-web-vitals-policy";

const ROOT = process.cwd();

const SAMPLE_MANIFEST = [
  {
    url: "http://127.0.0.1:3000/",
    summary: {
      "first-contentful-paint": 1750,
      "largest-contentful-paint": 2900,
      "cumulative-layout-shift": 0.04,
    },
  },
  {
    url: "http://127.0.0.1:3000/pricing",
    summary: {
      "first-contentful-paint": 1850,
      "largest-contentful-paint": 3100,
      "cumulative-layout-shift": 0.05,
    },
  },
  {
    url: "http://127.0.0.1:3000/login",
    summary: {
      "first-contentful-paint": 1100,
      "largest-contentful-paint": 2400,
      "cumulative-layout-shift": 0.01,
    },
  },
  {
    url: "http://127.0.0.1:3000/shopify",
    summary: {
      "first-contentful-paint": 1650,
      "largest-contentful-paint": 3050,
      "cumulative-layout-shift": 0.03,
    },
  },
] as const;

function loadBaseline(): CwvPerformanceBaseline {
  return JSON.parse(
    readFileSync(join(ROOT, CWV_PERFORMANCE_BASELINE_ARTIFACT), "utf8"),
  ) as CwvPerformanceBaseline;
}

describe("CWV performance regression (Absolute Final Task 54)", () => {
  it("locks baseline tolerance and absolute ceilings", () => {
    expect(CWV_PERFORMANCE_REGRESSION_POLICY_ID).toBe(
      "cwv-performance-regression-absolute-final-v1",
    );
    expect(CWV_PERFORMANCE_REGRESSION_TOLERANCE_PERCENT).toBe(10);
    expect(CWV_PERFORMANCE_REGRESSION_REQUIRED_PATHS).toEqual([
      "/",
      "/pricing",
      "/login",
      "/shopify",
    ]);
    expect(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.fcpMs).toBe(2000);
    expect(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.lcpMs).toBe(3500);
    expect(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.cls).toBe(0.1);
  });

  it("parses LHCI manifest medians into route metrics", () => {
    const measured = parseLhciCwvManifest(SAMPLE_MANIFEST);
    expect(measured).toHaveLength(4);
    expect(measured[0]?.path).toBe("/");
    expect(measured[0]?.metrics.fcpMs).toBe(1750);
    expect(coreWebVitalsMetricsPass(measured[0]!.metrics)).toBe(true);
  });

  it("has a committed baseline aligned with Lighthouse CWV policy", () => {
    const baseline = loadBaseline();
    expect(baseline.policyId).toBe(CWV_PERFORMANCE_REGRESSION_POLICY_ID);
    expect(baseline.upstreamPolicyId).toBe(LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID);
    expect(baseline.routes).toHaveLength(4);
    for (const route of baseline.routes) {
      expect(route.fcpMs).toBeLessThanOrEqual(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.fcpMs);
      expect(route.lcpMs).toBeLessThanOrEqual(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.lcpMs);
      expect(route.cls).toBeLessThanOrEqual(CWV_PERFORMANCE_REGRESSION_ABSOLUTE_LIMITS.cls);
    }
  });

  it("passes regression check for sample manifest at baseline", () => {
    const baseline = loadBaseline();
    const measured = parseLhciCwvManifest(SAMPLE_MANIFEST);
    expect(findCwvBaselineRegressions(measured, baseline)).toEqual([]);
    expect(findAbsoluteCwvViolations(measured)).toEqual([]);
    expect(cwvPerformanceRegressionPass(measured, baseline)).toBe(true);
    expect(() => assertNoCwvRegressions(measured, baseline)).not.toThrow();
  });

  it("flags baseline and absolute regressions", () => {
    const baseline = loadBaseline();
    const regressed = parseLhciCwvManifest([
      {
        url: "http://127.0.0.1:3000/",
        summary: {
          "first-contentful-paint": 2100,
          "largest-contentful-paint": 3600,
          "cumulative-layout-shift": 0.12,
        },
      },
    ]);

    const violations = mergeCwvViolations(
      findCwvBaselineRegressions(regressed, baseline),
      findAbsoluteCwvViolations(regressed),
    );
    expect(violations.some((v) => v.kind === "baseline_regression")).toBe(true);
    expect(violations.some((v) => v.kind === "absolute_ceiling")).toBe(true);
  });

  it("wires regression gate in Lighthouse workflow and package.json", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of CWV_PERFORMANCE_REGRESSION_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["check:cwv-performance-regression"]).toContain(
      CWV_PERFORMANCE_REGRESSION_CHECK_SCRIPT,
    );

    const workflow = readFileSync(join(ROOT, CWV_PERFORMANCE_REGRESSION_WORKFLOW_PATH), "utf8");
    expect(workflow).toContain("Performance regression (Core Web Vitals)");
    expect(workflow).toContain("test:ci:performance-regression-cwv");

    const script = readFileSync(join(ROOT, CWV_PERFORMANCE_REGRESSION_CHECK_SCRIPT), "utf8");
    expect(script).toContain("parseLhciCwvManifest");
  });

  it("validates live LHCI manifest when present", () => {
    const manifestPath = join(ROOT, ".lighthouseci/manifest.json");
    if (!existsSync(manifestPath)) return;

    const baseline = loadBaseline();
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
    if (!Array.isArray(manifest)) return;

    assertNoCwvRegressions(parseLhciCwvManifest(manifest), baseline);
  });
});
