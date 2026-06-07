import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  coreWebVitalsPass,
  evaluateCoreWebVitals,
  LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID,
  LIGHTHOUSE_CWV_CI_SCRIPTS,
  LIGHTHOUSE_CWV_CLS_MAX,
  LIGHTHOUSE_CWV_CONFIG_PATH,
  LIGHTHOUSE_CWV_FCP_MAX_MS,
  LIGHTHOUSE_CWV_LCP_MAX_MS,
  LIGHTHOUSE_CWV_PATHS,
  LIGHTHOUSE_CWV_WORKFLOW_PATH,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";

const ROOT = process.cwd();

describe("Lighthouse Core Web Vitals policy (Absolute Final Task 50)", () => {
  it("locks FCP <2s, LCP <3.5s, CLS <0.1 thresholds", () => {
    expect(LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID).toBe(
      "lighthouse-core-web-vitals-absolute-final-v1",
    );
    expect(LIGHTHOUSE_CWV_FCP_MAX_MS).toBe(2000);
    expect(LIGHTHOUSE_CWV_LCP_MAX_MS).toBe(3500);
    expect(LIGHTHOUSE_CWV_CLS_MAX).toBe(0.1);
    expect(LIGHTHOUSE_CWV_PATHS).toEqual(["/", "/pricing", "/login", "/shopify"]);
  });

  it("evaluates metric bundles against policy limits", () => {
    expect(
      coreWebVitalsPass({ fcpMs: 1800, lcpMs: 3200, cls: 0.05 }),
    ).toBe(true);
    expect(evaluateCoreWebVitals({ fcpMs: 1800, lcpMs: 3200, cls: 0.05 })).toEqual([]);

    const violations = evaluateCoreWebVitals({ fcpMs: 2100, lcpMs: 3600, cls: 0.12 });
    expect(violations.map((v) => v.metric)).toEqual(["fcp", "lcp", "cls"]);
  });

  it("ships LHCI config, GHA workflow, and npm scripts", () => {
    const config = readFileSync(join(ROOT, LIGHTHOUSE_CWV_CONFIG_PATH), "utf8");
    expect(config).toContain("first-contentful-paint");
    expect(config).toContain("maxNumericValue: 2000");
    expect(config).toContain("maxNumericValue: 3500");
    expect(config).toContain("maxNumericValue: 0.1");

    const workflow = readFileSync(join(ROOT, LIGHTHOUSE_CWV_WORKFLOW_PATH), "utf8");
    expect(workflow).toContain("lighthouserc.core-web-vitals.cjs");
    expect(workflow).toContain("Core Web Vitals");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of LIGHTHOUSE_CWV_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["lighthouse:core-web-vitals"]).toContain(LIGHTHOUSE_CWV_CONFIG_PATH);
  });
});
