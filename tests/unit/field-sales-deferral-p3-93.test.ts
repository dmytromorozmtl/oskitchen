import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditFieldSalesDeferralP393,
  formatFieldSalesDeferralP393AuditLines,
} from "@/lib/marketing/field-sales-deferral-p3-93-audit";
import {
  FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES,
  FIELD_SALES_DEFERRAL_P3_93_PUBLIC_LINE,
} from "@/lib/marketing/field-sales-deferral-p3-93-content";
import {
  FIELD_SALES_DEFERRAL_P3_93_ARTIFACT,
  FIELD_SALES_DEFERRAL_P3_93_CHECK_NPM_SCRIPT,
  FIELD_SALES_DEFERRAL_P3_93_CI_WORKFLOW,
  FIELD_SALES_DEFERRAL_P3_93_DOC,
  FIELD_SALES_DEFERRAL_P3_93_POLICY_ID,
  FIELD_SALES_DEFERRAL_P3_93_UNIT_TEST,
  FIELD_SALES_DEFERRAL_P3_93_WIRING_PATHS,
} from "@/lib/marketing/field-sales-deferral-p3-93-policy";

const ROOT = process.cwd();

describe("Field sales deferral (P3-93)", () => {
  it("locks digital-only GTM policy", () => {
    expect(FIELD_SALES_DEFERRAL_P3_93_POLICY_ID).toBe("field-sales-deferral-p3-93-v1");
    expect(FIELD_SALES_DEFERRAL_P3_93_PUBLIC_LINE).toContain("field sales");
    expect(FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-93 field sales deferral audit", () => {
    const summary = auditFieldSalesDeferralP393(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-93 wiring paths, CI gate, and artifact", () => {
    for (const path of FIELD_SALES_DEFERRAL_P3_93_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FIELD_SALES_DEFERRAL_P3_93_CHECK_NPM_SCRIPT]).toContain(
      FIELD_SALES_DEFERRAL_P3_93_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, FIELD_SALES_DEFERRAL_P3_93_CI_WORKFLOW), "utf8");
    expect(ci).toContain(FIELD_SALES_DEFERRAL_P3_93_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, FIELD_SALES_DEFERRAL_P3_93_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(FIELD_SALES_DEFERRAL_P3_93_POLICY_ID);
    expect(artifact.gtmModel).toBe("digital-only");

    const doc = readFileSync(join(ROOT, FIELD_SALES_DEFERRAL_P3_93_DOC), "utf8");
    expect(doc).toContain(FIELD_SALES_DEFERRAL_P3_93_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditFieldSalesDeferralP393(ROOT);
    const lines = formatFieldSalesDeferralP393AuditLines(summary);
    expect(lines.some((line) => line.includes(FIELD_SALES_DEFERRAL_P3_93_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
