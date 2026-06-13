import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCertifiedDevicesIpadP2_39,
  formatCertifiedDevicesIpadP2_39AuditLines,
} from "@/lib/hardware/certified-devices-ipad-p2-39-audit";
import {
  CERTIFIED_DEVICES_IPAD_P2_39_MODELS,
  assertCertifiedDevicesIpadP2_39ModelCount,
  countCertifiedDevicesIpadP2_39ByTier,
} from "@/lib/hardware/certified-devices-ipad-p2-39-content";
import {
  CERTIFIED_DEVICES_IPAD_P2_39_AUDIT_SCRIPT,
  CERTIFIED_DEVICES_IPAD_P2_39_CHECK_NPM_SCRIPT,
  CERTIFIED_DEVICES_IPAD_P2_39_CI_WORKFLOW,
  CERTIFIED_DEVICES_IPAD_P2_39_DOC,
  CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
  CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT,
  CERTIFIED_DEVICES_IPAD_P2_39_NPM_SCRIPT,
  CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID,
  CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
  CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST,
} from "@/lib/hardware/certified-devices-ipad-p2-39-policy";

const ROOT = process.cwd();

describe("Certified iPad devices (P2-39)", () => {
  it("locks policy id and ten iPad models", () => {
    expect(CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID).toBe("certified-devices-ipad-p2-39-v1");
    expect(CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT).toBe(10);
    expect(CERTIFIED_DEVICES_IPAD_P2_39_MODELS).toHaveLength(10);
    expect(assertCertifiedDevicesIpadP2_39ModelCount()).toBe(true);
    expect(CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS).toBe("16");
  });

  it("covers certified, baseline, and legacy tiers with POS routes", () => {
    expect(countCertifiedDevicesIpadP2_39ByTier("certified")).toBeGreaterThanOrEqual(6);
    expect(countCertifiedDevicesIpadP2_39ByTier("baseline")).toBeGreaterThanOrEqual(2);
    expect(countCertifiedDevicesIpadP2_39ByTier("legacy")).toBeGreaterThanOrEqual(1);
    expect(
      CERTIFIED_DEVICES_IPAD_P2_39_MODELS.some(
        (m) => m.route === CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
      ),
    ).toBe(true);
    expect(CERTIFIED_DEVICES_IPAD_P2_39_MODELS.some((m) => m.model.includes("iPad Pro"))).toBe(
      true,
    );
    expect(CERTIFIED_DEVICES_IPAD_P2_39_MODELS.some((m) => m.model.includes("iPad mini"))).toBe(
      true,
    );
  });

  it("passes full certified iPad devices audit", () => {
    const summary = auditCertifiedDevicesIpadP2_39(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryPresent).toBe(true);
    expect(summary.modelCountCorrect).toBe(true);
    expect(summary.allModelsInDoc).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, CERTIFIED_DEVICES_IPAD_P2_39_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CERTIFIED_DEVICES_IPAD_P2_39_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CERTIFIED_DEVICES_IPAD_P2_39_NPM_SCRIPT]).toContain(
      "audit-certified-devices-ipad-p2-39.ts",
    );
    expect(pkg.scripts?.[CERTIFIED_DEVICES_IPAD_P2_39_CHECK_NPM_SCRIPT]).toContain(
      CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:certified-devices-ipad-p2-39"]).toContain(
      CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CERTIFIED_DEVICES_IPAD_P2_39_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("certified-devices-ipad-p2-39");
  });

  it("formats audit lines", () => {
    const summary = auditCertifiedDevicesIpadP2_39(ROOT);
    const lines = formatCertifiedDevicesIpadP2_39AuditLines(summary);
    expect(lines.some((line) => line.includes(CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
