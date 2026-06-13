import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditHardwareCompatibilityCenter } from "@/lib/hardware/hardware-compatibility-center-audit";
import {
  auditHardwareCompatibilityCenterP3_80,
  formatHardwareCompatibilityCenterP3_80AuditLines,
} from "@/lib/hardware/hardware-compatibility-center-p3-80-audit";
import { validateHardwareCompatibilityCenterContract } from "@/lib/hardware/hardware-compatibility-center-p3-80-measurement";
import {
  HARDWARE_COMPATIBILITY_CENTER_P3_80_AUDIT_SCRIPT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_CHECK_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPTS,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UNIT_TEST,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_TEST,
} from "@/lib/hardware/hardware-compatibility-center-p3-80-policy";

const ROOT = process.cwd();

describe("Hardware compatibility center (P3-80)", () => {
  it("locks P3-80 policy, route, and four diagnostics", () => {
    expect(HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID).toBe(
      "hardware-compatibility-center-p3-80-v1",
    );
    expect(HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID).toBe(
      "hardware-compatibility-center-p2-87-v1",
    );
    expect(HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE).toBe("/works-with-os-kitchen");
    expect(HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE).toBe("Works with OS Kitchen");
    expect(HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT).toBe(4);
  });

  it("validates upstream center + roadmap + certified devices cross-refs", () => {
    const validation = validateHardwareCompatibilityCenterContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamCenterOk).toBe(true);
    expect(validation.publicPageWired).toBe(true);
    expect(validation.roadmapLinked).toBe(true);
    expect(validation.certifiedDevicesLinked).toBe(true);
  });

  it("passes full hardware compatibility center P3-80 audit", () => {
    const summary = auditHardwareCompatibilityCenterP3_80(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatHardwareCompatibilityCenterP3_80AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, public page, and npm wiring", () => {
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_P3_80_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_P3_80_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_TEST))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE))).toBe(true);

    const upstream = auditHardwareCompatibilityCenter(ROOT);
    expect(upstream.passed).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPT]).toContain(
      "audit-hardware-compatibility-center-p3-80.ts",
    );
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_CENTER_P3_80_CHECK_NPM_SCRIPT]).toContain(
      HARDWARE_COMPATIBILITY_CENTER_P3_80_UNIT_TEST,
    );
    for (const script of HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
