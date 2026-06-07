import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditLighthouse95Wiring } from "@/lib/performance/absolute-final-lighthouse-95-audit";
import {
  LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID,
  LIGHTHOUSE_95_CWV_CEILINGS,
  LIGHTHOUSE_95_DOC_PATH,
  LIGHTHOUSE_95_MANUAL_GATE_NOTE,
  LIGHTHOUSE_95_MIN_SCORE,
  lighthousePerformanceScorePass,
} from "@/lib/performance/absolute-final-lighthouse-95-policy";
import {
  LIGHTHOUSE_CWV_CONFIG_PATH,
  LIGHTHOUSE_CWV_FCP_MAX_MS,
  LIGHTHOUSE_CWV_LCP_MAX_MS,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";

const ROOT = process.cwd();
/** Absolute Final Task 148 — full performance audit Lighthouse 95+ */
const TASK = 148;

describe(`Lighthouse 95+ performance (Absolute Final Task ${TASK})`, () => {
  it("locks absolute final Lighthouse 95+ policy id and min score", () => {
    expect(LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-lighthouse-95-v1");
    expect(LIGHTHOUSE_95_MIN_SCORE).toBe(0.95);
    expect(lighthousePerformanceScorePass(0.95)).toBe(true);
    expect(lighthousePerformanceScorePass(0.94)).toBe(false);
  });

  it("inherits Core Web Vitals ceilings from Task 50 policy", () => {
    expect(LIGHTHOUSE_95_CWV_CEILINGS.fcpMs).toBe(LIGHTHOUSE_CWV_FCP_MAX_MS);
    expect(LIGHTHOUSE_95_CWV_CEILINGS.lcpMs).toBe(LIGHTHOUSE_CWV_LCP_MAX_MS);
    expect(LIGHTHOUSE_95_CWV_CEILINGS.cls).toBe(0.1);
    expect(LIGHTHOUSE_95_CWV_CEILINGS.paths.length).toBeGreaterThanOrEqual(4);
  });

  it("documents manual release gate alongside LHCI automation", () => {
    expect(LIGHTHOUSE_95_MANUAL_GATE_NOTE).toContain("production traffic");
  });

  it("references performance review doc with Lighthouse 95+ target", () => {
    const doc = readFileSync(join(ROOT, LIGHTHOUSE_95_DOC_PATH), "utf8");
    expect(doc).toContain("Lighthouse 95+");
    expect(doc).toContain(LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("enforces Lighthouse 95+ performance category in LHCI config", () => {
    const config = readFileSync(join(ROOT, LIGHTHOUSE_CWV_CONFIG_PATH), "utf8");
    expect(config).toContain("categories:performance");
    expect(config).toContain("minScore: 0.95");
    expect(config).toContain("maxNumericValue: 2000");
    expect(config).toContain("maxNumericValue: 3500");
  });

  it("references policy in lighthouse performance module", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/performance/absolute-final-lighthouse-95-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 148");
    expect(policySource).toContain("lighthouse-core-web-vitals-policy");
  });

  it("passes Lighthouse 95+ wiring audit", () => {
    const audit = auditLighthouse95Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for Lighthouse 95+ gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:lighthouse-95-absolute-final:cert"]).toContain(
      "absolute-final-lighthouse-95-performance.test.ts",
    );
  });
});
