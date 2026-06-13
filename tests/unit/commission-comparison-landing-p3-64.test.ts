import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissionComparisonLandingP3_64,
  formatCommissionComparisonLandingP3_64AuditLines,
} from "@/lib/marketing/commission-comparison-landing-p3-64-audit";
import { validateCommissionComparisonLandingContract } from "@/lib/marketing/commission-comparison-landing-p3-64-measurement";
import {
  COMMISSION_COMPARISON_LANDING_P3_64_AUDIT_SCRIPT,
  COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH,
  COMMISSION_COMPARISON_LANDING_P3_64_CHECK_NPM_SCRIPT,
  COMMISSION_COMPARISON_LANDING_P3_64_DOC,
  COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPT,
  COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPTS,
  COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID,
  COMMISSION_COMPARISON_LANDING_P3_64_PRIMARY_KEYWORD,
  COMMISSION_COMPARISON_LANDING_P3_64_UNIT_TEST,
  commissionComparisonLandingPathsAligned,
} from "@/lib/marketing/commission-comparison-landing-p3-64-policy";

const ROOT = process.cwd();

describe("Commission comparison landing (P3-64)", () => {
  it("locks canonical /commission-comparison path", () => {
    expect(COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID).toBe(
      "commission-comparison-landing-p3-64-v1",
    );
    expect(COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_LANDING_P3_64_PRIMARY_KEYWORD).toBe(
      "commission comparison calculator",
    );
    expect(commissionComparisonLandingPathsAligned()).toBe(true);
  });

  it("validates commission comparison landing contract", () => {
    const validation = validateCommissionComparisonLandingContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.sitemapWired).toBe(true);
    expect(validation.upstreamP2_46Ok).toBe(true);
  });

  it("passes full commission comparison landing audit", () => {
    const summary = auditCommissionComparisonLandingP3_64(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCommissionComparisonLandingP3_64AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_LANDING_P3_64_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_LANDING_P3_64_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_LANDING_P3_64_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPT]).toContain(
      "audit-commission-comparison-landing-p3-64.ts",
    );
    expect(pkg.scripts?.[COMMISSION_COMPARISON_LANDING_P3_64_CHECK_NPM_SCRIPT]).toContain(
      COMMISSION_COMPARISON_LANDING_P3_64_UNIT_TEST,
    );
    for (const script of COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
