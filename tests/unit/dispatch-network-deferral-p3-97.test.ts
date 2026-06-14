import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDispatchNetworkDeferralP397,
  formatDispatchNetworkDeferralP397AuditLines,
} from "@/lib/marketing/dispatch-network-deferral-p3-97-audit";
import {
  DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES,
  DISPATCH_NETWORK_DEFERRAL_P3_97_PUBLIC_LINE,
} from "@/lib/marketing/dispatch-network-deferral-p3-97-content";
import {
  DISPATCH_NETWORK_DEFERRAL_P3_97_ARTIFACT,
  DISPATCH_NETWORK_DEFERRAL_P3_97_CHECK_NPM_SCRIPT,
  DISPATCH_NETWORK_DEFERRAL_P3_97_CI_WORKFLOW,
  DISPATCH_NETWORK_DEFERRAL_P3_97_DOC,
  DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UNIT_TEST,
  DISPATCH_NETWORK_DEFERRAL_P3_97_WIRING_PATHS,
} from "@/lib/marketing/dispatch-network-deferral-p3-97-policy";

const ROOT = process.cwd();

describe("Dispatch network deferral (P3-97)", () => {
  it("locks deferred dispatch network policy", () => {
    expect(DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID).toBe("dispatch-network-deferral-p3-97-v1");
    expect(DISPATCH_NETWORK_DEFERRAL_P3_97_PUBLIC_LINE).toContain("dispatch");
    expect(DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-97 dispatch network deferral audit", () => {
    const summary = auditDispatchNetworkDeferralP397(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-97 wiring paths, CI gate, and artifact", () => {
    for (const path of DISPATCH_NETWORK_DEFERRAL_P3_97_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DISPATCH_NETWORK_DEFERRAL_P3_97_CHECK_NPM_SCRIPT]).toContain(
      DISPATCH_NETWORK_DEFERRAL_P3_97_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, DISPATCH_NETWORK_DEFERRAL_P3_97_CI_WORKFLOW), "utf8");
    expect(ci).toContain(DISPATCH_NETWORK_DEFERRAL_P3_97_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, DISPATCH_NETWORK_DEFERRAL_P3_97_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID);
    expect(artifact.roadmapItemId).toBe("dispatch-network");

    const doc = readFileSync(join(ROOT, DISPATCH_NETWORK_DEFERRAL_P3_97_DOC), "utf8");
    expect(doc).toContain(DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditDispatchNetworkDeferralP397(ROOT);
    const lines = formatDispatchNetworkDeferralP397AuditLines(summary);
    expect(lines.some((line) => line.includes(DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
