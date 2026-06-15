import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativeTabletUxP3_145,
  formatNativeTabletUxP3_145AuditLines,
} from "@/lib/design/native-tablet-ux-p3-145-audit";
import { assertNativeTabletUxTouchbistroCapabilityCount } from "@/lib/design/native-tablet-ux-p3-145-content";
import {
  loadNativeTabletUxTouchbistroRegistry,
  validateNativeTabletUxTouchbistroRegistry,
} from "@/lib/design/native-tablet-ux-p3-145-operations";
import {
  NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS,
  NATIVE_TABLET_UX_P3_145_CI_WORKFLOW,
  NATIVE_TABLET_UX_P3_145_COMPETITOR,
  NATIVE_TABLET_UX_P3_145_DOC,
  NATIVE_TABLET_UX_P3_145_HEADLINE,
  NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF,
  NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX,
  NATIVE_TABLET_UX_P3_145_NPM_SCRIPT,
  NATIVE_TABLET_UX_P3_145_POLICY_ID,
  NATIVE_TABLET_UX_P3_145_ROUTE,
  NATIVE_TABLET_UX_P3_145_UNIT_TEST,
} from "@/lib/design/native-tablet-ux-p3-145-policy";

const ROOT = process.cwd();

describe("Native tablet UX TouchBistro (P3-145)", () => {
  it("locks policy id, TouchBistro competitor, and 44px touch floor", () => {
    expect(NATIVE_TABLET_UX_P3_145_POLICY_ID).toBe("native-tablet-ux-p3-145-v1");
    expect(NATIVE_TABLET_UX_P3_145_COMPETITOR).toBe("touchbistro");
    expect(NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX).toBe(44);
    expect(NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT).toBe(3);
    expect(NATIVE_TABLET_UX_P3_145_ROUTE).toBe("/dashboard/design/native-tablet-ux");
    expect(NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF).toBe("native-tablet-ux-p2-95-v1");
    expect(NATIVE_TABLET_UX_P3_145_HEADLINE).toBe(
      "Native tablet UX — TouchBistro parity baseline",
    );
    expect(NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS).toEqual([
      "ipad_layouts",
      "bar_mode",
      "table_tabs",
    ]);
    expect(assertNativeTabletUxTouchbistroCapabilityCount()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadNativeTabletUxTouchbistroRegistry(ROOT);
    const validation = validateNativeTabletUxTouchbistroRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(validation.touchFloorMatches).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.capabilities).toHaveLength(3);
  });

  it("passes full native tablet UX TouchBistro audit", () => {
    const summary = auditNativeTabletUxP3_145(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.p2BaselineAuditPassed).toBe(true);
    expect(summary.liveTouchbistroWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.capabilitiesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, NATIVE_TABLET_UX_P3_145_DOC))).toBe(true);
    expect(existsSync(join(ROOT, NATIVE_TABLET_UX_P3_145_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NATIVE_TABLET_UX_P3_145_NPM_SCRIPT]).toContain(
      "audit-native-tablet-ux-p3-145.ts",
    );
    expect(pkg.scripts?.["test:ci:native-tablet-ux-p3-145"]).toContain(
      NATIVE_TABLET_UX_P3_145_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, NATIVE_TABLET_UX_P3_145_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:native-tablet-ux-p3-145");
  });

  it("formats audit lines", () => {
    const summary = auditNativeTabletUxP3_145(ROOT);
    const lines = formatNativeTabletUxP3_145AuditLines(summary);
    expect(lines.some((line) => line.includes(NATIVE_TABLET_UX_P3_145_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
