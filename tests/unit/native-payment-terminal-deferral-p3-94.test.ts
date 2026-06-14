import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativePaymentTerminalDeferralP394,
  formatNativePaymentTerminalDeferralP394AuditLines,
} from "@/lib/marketing/native-payment-terminal-deferral-p3-94-audit";
import {
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_PUBLIC_LINE,
} from "@/lib/marketing/native-payment-terminal-deferral-p3-94-content";
import {
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ARTIFACT,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CHECK_NPM_SCRIPT,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CI_WORKFLOW,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UNIT_TEST,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_WIRING_PATHS,
} from "@/lib/marketing/native-payment-terminal-deferral-p3-94-policy";

const ROOT = process.cwd();

describe("Native payment terminal deferral (P3-94)", () => {
  it("locks deferred native terminal policy", () => {
    expect(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID).toBe(
      "native-payment-terminal-deferral-p3-94-v1",
    );
    expect(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_PUBLIC_LINE).toContain("native");
    expect(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-94 native payment terminal deferral audit", () => {
    const summary = auditNativePaymentTerminalDeferralP394(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-94 wiring paths, CI gate, and artifact", () => {
    for (const path of NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CHECK_NPM_SCRIPT]).toContain(
      NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CI_WORKFLOW), "utf8");
    expect(ci).toContain(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID);
    expect(artifact.roadmapItemId).toBe("stripe-terminal");

    const doc = readFileSync(join(ROOT, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC), "utf8");
    expect(doc).toContain(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditNativePaymentTerminalDeferralP394(ROOT);
    const lines = formatNativePaymentTerminalDeferralP394AuditLines(summary);
    expect(lines.some((line) => line.includes(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
