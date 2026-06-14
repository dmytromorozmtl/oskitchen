import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditHardwareEcosystemDeferralP396,
  formatHardwareEcosystemDeferralP396AuditLines,
} from "@/lib/marketing/hardware-ecosystem-deferral-p3-96-audit";
import {
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_PUBLIC_LINE,
} from "@/lib/marketing/hardware-ecosystem-deferral-p3-96-content";
import {
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ARTIFACT,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CHECK_NPM_SCRIPT,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CI_WORKFLOW,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UNIT_TEST,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_WIRING_PATHS,
} from "@/lib/marketing/hardware-ecosystem-deferral-p3-96-policy";

const ROOT = process.cwd();

describe("Hardware ecosystem deferral (P3-96)", () => {
  it("locks deferred hardware ecosystem policy", () => {
    expect(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID).toBe(
      "hardware-ecosystem-deferral-p3-96-v1",
    );
    expect(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_PUBLIC_LINE).toContain("hardware ecosystem");
    expect(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES.length).toBeGreaterThanOrEqual(3);
  });

  it("passes full P3-96 hardware ecosystem deferral audit", () => {
    const summary = auditHardwareEcosystemDeferralP396(ROOT);
    expect(summary.roadmapDeferred, summary.failures.join("; ")).toBe(true);
    expect(summary.productRoadmapDeferred).toBe(true);
    expect(summary.marketingClean).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-96 wiring paths, CI gate, and artifact", () => {
    for (const path of HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CHECK_NPM_SCRIPT]).toContain(
      HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CI_WORKFLOW), "utf8");
    expect(ci).toContain(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID);
    expect(artifact.roadmapItemId).toBe("hardware-ecosystem");

    const doc = readFileSync(join(ROOT, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC), "utf8");
    expect(doc).toContain(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditHardwareEcosystemDeferralP396(ROOT);
    const lines = formatHardwareEcosystemDeferralP396AuditLines(summary);
    expect(lines.some((line) => line.includes(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
