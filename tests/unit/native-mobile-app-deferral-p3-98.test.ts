import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativeMobileAppDeferralP398,
  formatNativeMobileAppDeferralP398AuditLines,
} from "@/lib/marketing/native-mobile-app-deferral-p3-98-audit";
import {
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_ALTERNATIVES,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_PUBLIC_LINE,
  nativeMobileAppDeferralMeetsArrThreshold,
} from "@/lib/marketing/native-mobile-app-deferral-p3-98-content";
import {
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARR_THRESHOLD,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARTIFACT,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_CHECK_NPM_SCRIPT,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_CI_WORKFLOW,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_DOC,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_UNIT_TEST,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_WIRING_PATHS,
} from "@/lib/marketing/native-mobile-app-deferral-p3-98-policy";

const ROOT = process.cwd();

describe("Native mobile app deferral (P3-98)", () => {
  it("locks policy with $1M ARR gate", () => {
    expect(NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID).toBe("native-mobile-app-deferral-p3-98-v1");
    expect(NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARR_THRESHOLD).toBe(1_000_000);
    expect(nativeMobileAppDeferralMeetsArrThreshold(999_999)).toBe(false);
    expect(nativeMobileAppDeferralMeetsArrThreshold(1_000_000)).toBe(true);
    expect(NATIVE_MOBILE_APP_DEFERRAL_P3_98_PUBLIC_LINE).toContain("$1M ARR");
    expect(NATIVE_MOBILE_APP_DEFERRAL_P3_98_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-98 native mobile app deferral audit", () => {
    const summary = auditNativeMobileAppDeferralP398(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-98 wiring paths, CI gate, and artifact", () => {
    for (const path of NATIVE_MOBILE_APP_DEFERRAL_P3_98_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NATIVE_MOBILE_APP_DEFERRAL_P3_98_CHECK_NPM_SCRIPT]).toContain(
      NATIVE_MOBILE_APP_DEFERRAL_P3_98_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, NATIVE_MOBILE_APP_DEFERRAL_P3_98_CI_WORKFLOW), "utf8");
    expect(ci).toContain(NATIVE_MOBILE_APP_DEFERRAL_P3_98_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID);
    expect(artifact.arrThresholdUsd).toBe(1_000_000);

    const doc = readFileSync(join(ROOT, NATIVE_MOBILE_APP_DEFERRAL_P3_98_DOC), "utf8");
    expect(doc).toContain(NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditNativeMobileAppDeferralP398(ROOT);
    const lines = formatNativeMobileAppDeferralP398AuditLines(summary);
    expect(lines.some((line) => line.includes(NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
