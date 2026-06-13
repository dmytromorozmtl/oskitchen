import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBundleAnalysisP3_72,
  formatBundleAnalysisP3_72AuditLines,
} from "@/lib/performance/bundle-analysis-p3-72-audit";
import {
  auditBundleAnalysisWave2Targets,
  validateBundleAnalysisContract,
} from "@/lib/performance/bundle-analysis-p3-72-measurement";
import {
  BUNDLE_ANALYSIS_P3_72_AUDIT_SCRIPT,
  BUNDLE_ANALYSIS_P3_72_CHECK_NPM_SCRIPT,
  BUNDLE_ANALYSIS_P3_72_DOC,
  BUNDLE_ANALYSIS_P3_72_NPM_SCRIPT,
  BUNDLE_ANALYSIS_P3_72_NPM_SCRIPTS,
  BUNDLE_ANALYSIS_P3_72_POLICY_ID,
  BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_P3_72_UNIT_TEST,
  BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID,
  BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT,
  BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS,
} from "@/lib/performance/bundle-analysis-p3-72-policy";
import {
  BUNDLE_ANALYSIS_TOP_CHUNK_COUNT,
  BUNDLE_ANALYSIS_UNIT_TEST,
} from "@/lib/performance/bundle-analysis-policy";

const ROOT = process.cwd();

describe("Bundle analysis optimization (P3-72)", () => {
  it("locks P3-72 policy and wave 2 targets", () => {
    expect(BUNDLE_ANALYSIS_P3_72_POLICY_ID).toBe("bundle-analysis-p3-72-v1");
    expect(BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID).toBe("bundle-analysis-p1-39-v1");
    expect(BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS).toHaveLength(BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT);
    expect(BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS).toBe(
      BUNDLE_ANALYSIS_TOP_CHUNK_COUNT + BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT,
    );
  });

  it("wires wave 2 lazy recharts panels", () => {
    const wave2 = auditBundleAnalysisWave2Targets(ROOT);
    expect(wave2.wired).toBe(BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT);
    expect(wave2.total).toBe(BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT);
  });

  it("validates bundle analysis contract", () => {
    const validation = validateBundleAnalysisContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.wave1Wired).toBe(true);
    expect(validation.wave2Wired).toBe(true);
    expect(validation.upstreamAuditOk).toBe(true);
    expect(validation.bundleAnalyzerWired).toBe(true);
  });

  it("passes full bundle analysis P3-72 audit", () => {
    const summary = auditBundleAnalysisP3_72(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.totalCodeSplitTargets).toBe(BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatBundleAnalysisP3_72AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, BUNDLE_ANALYSIS_P3_72_DOC))).toBe(true);
    expect(existsSync(join(ROOT, BUNDLE_ANALYSIS_P3_72_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BUNDLE_ANALYSIS_P3_72_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, BUNDLE_ANALYSIS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BUNDLE_ANALYSIS_P3_72_NPM_SCRIPT]).toContain(
      "audit-bundle-analysis-p3-72.ts",
    );
    expect(pkg.scripts?.[BUNDLE_ANALYSIS_P3_72_CHECK_NPM_SCRIPT]).toContain(
      BUNDLE_ANALYSIS_P3_72_UNIT_TEST,
    );
    for (const script of BUNDLE_ANALYSIS_P3_72_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
