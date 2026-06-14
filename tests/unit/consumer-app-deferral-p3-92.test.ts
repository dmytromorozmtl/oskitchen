import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditConsumerAppDeferralP392,
  formatConsumerAppDeferralP392AuditLines,
} from "@/lib/marketing/consumer-app-deferral-p3-92-audit";
import {
  CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES,
  CONSUMER_APP_DEFERRAL_P3_92_PUBLIC_LINE,
  consumerAppDeferralMeetsThreshold,
} from "@/lib/marketing/consumer-app-deferral-p3-92-content";
import {
  CONSUMER_APP_DEFERRAL_P3_92_ARTIFACT,
  CONSUMER_APP_DEFERRAL_P3_92_CHECK_NPM_SCRIPT,
  CONSUMER_APP_DEFERRAL_P3_92_CI_WORKFLOW,
  CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD,
  CONSUMER_APP_DEFERRAL_P3_92_DOC,
  CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID,
  CONSUMER_APP_DEFERRAL_P3_92_UNIT_TEST,
  CONSUMER_APP_DEFERRAL_P3_92_WIRING_PATHS,
} from "@/lib/marketing/consumer-app-deferral-p3-92-policy";

const ROOT = process.cwd();

describe("Consumer app deferral (P3-92)", () => {
  it("locks policy with 500+ customer gate", () => {
    expect(CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID).toBe("consumer-app-deferral-p3-92-v1");
    expect(CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD).toBe(500);
    expect(consumerAppDeferralMeetsThreshold(499)).toBe(false);
    expect(consumerAppDeferralMeetsThreshold(500)).toBe(true);
    expect(CONSUMER_APP_DEFERRAL_P3_92_PUBLIC_LINE).toContain("500");
    expect(CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-92 consumer app deferral audit", () => {
    const summary = auditConsumerAppDeferralP392(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-92 wiring paths, CI gate, and artifact", () => {
    for (const path of CONSUMER_APP_DEFERRAL_P3_92_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CONSUMER_APP_DEFERRAL_P3_92_CHECK_NPM_SCRIPT]).toContain(
      CONSUMER_APP_DEFERRAL_P3_92_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, CONSUMER_APP_DEFERRAL_P3_92_CI_WORKFLOW), "utf8");
    expect(ci).toContain(CONSUMER_APP_DEFERRAL_P3_92_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, CONSUMER_APP_DEFERRAL_P3_92_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID);
    expect(artifact.customerThreshold).toBe(500);

    const doc = readFileSync(join(ROOT, CONSUMER_APP_DEFERRAL_P3_92_DOC), "utf8");
    expect(doc).toContain(CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditConsumerAppDeferralP392(ROOT);
    const lines = formatConsumerAppDeferralP392AuditLines(summary);
    expect(lines.some((line) => line.includes(CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
