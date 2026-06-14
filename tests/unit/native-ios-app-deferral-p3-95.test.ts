import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativeIosAppDeferralP395,
  formatNativeIosAppDeferralP395AuditLines,
} from "@/lib/marketing/native-ios-app-deferral-p3-95-audit";
import {
  NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES,
  NATIVE_IOS_APP_DEFERRAL_P3_95_PUBLIC_LINE,
} from "@/lib/marketing/native-ios-app-deferral-p3-95-content";
import {
  NATIVE_IOS_APP_DEFERRAL_P3_95_ARTIFACT,
  NATIVE_IOS_APP_DEFERRAL_P3_95_CHECK_NPM_SCRIPT,
  NATIVE_IOS_APP_DEFERRAL_P3_95_CI_WORKFLOW,
  NATIVE_IOS_APP_DEFERRAL_P3_95_DOC,
  NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UNIT_TEST,
  NATIVE_IOS_APP_DEFERRAL_P3_95_WIRING_PATHS,
} from "@/lib/marketing/native-ios-app-deferral-p3-95-policy";

const ROOT = process.cwd();

describe("Native iOS app deferral (P3-95)", () => {
  it("locks deferred native iOS operator app policy", () => {
    expect(NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID).toBe("native-ios-app-deferral-p3-95-v1");
    expect(NATIVE_IOS_APP_DEFERRAL_P3_95_PUBLIC_LINE).toContain("iOS");
    expect(NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-95 native iOS app deferral audit", () => {
    const summary = auditNativeIosAppDeferralP395(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-95 wiring paths, CI gate, and artifact", () => {
    for (const path of NATIVE_IOS_APP_DEFERRAL_P3_95_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NATIVE_IOS_APP_DEFERRAL_P3_95_CHECK_NPM_SCRIPT]).toContain(
      NATIVE_IOS_APP_DEFERRAL_P3_95_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, NATIVE_IOS_APP_DEFERRAL_P3_95_CI_WORKFLOW), "utf8");
    expect(ci).toContain(NATIVE_IOS_APP_DEFERRAL_P3_95_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, NATIVE_IOS_APP_DEFERRAL_P3_95_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID);
    expect(artifact.roadmapItemId).toBe("native-ios-app");

    const doc = readFileSync(join(ROOT, NATIVE_IOS_APP_DEFERRAL_P3_95_DOC), "utf8");
    expect(doc).toContain(NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditNativeIosAppDeferralP395(ROOT);
    const lines = formatNativeIosAppDeferralP395AuditLines(summary);
    expect(lines.some((line) => line.includes(NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
