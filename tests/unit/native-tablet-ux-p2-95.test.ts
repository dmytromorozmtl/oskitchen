import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativeTabletUxP2_95,
  formatNativeTabletUxP2_95AuditLines,
} from "@/lib/pos/native-tablet-ux-p2-95-audit";
import { NATIVE_TABLET_UX_P2_95_CAPABILITIES } from "@/lib/pos/native-tablet-ux-p2-95-content";
import {
  buildNativeTabletUxReport,
  meetsNativeTabletTouchFloor,
  NATIVE_TABLET_UX_MIN_TOUCH_PX,
  resolveNativeTabletLayoutSnapshot,
  resolveNativeTabletRecommendedRoute,
} from "@/lib/pos/native-tablet-ux-p2-95-operations";
import {
  NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P2_95_CI_WORKFLOW,
  NATIVE_TABLET_UX_P2_95_DOC,
  NATIVE_TABLET_UX_P2_95_NPM_SCRIPT,
  NATIVE_TABLET_UX_P2_95_POLICY_ID,
  NATIVE_TABLET_UX_P2_95_ROUTE,
  NATIVE_TABLET_UX_P2_95_UNIT_TEST,
} from "@/lib/pos/native-tablet-ux-p2-95-policy";

const ROOT = process.cwd();

describe("Native tablet UX (P2-95)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(NATIVE_TABLET_UX_P2_95_POLICY_ID).toBe("native-tablet-ux-p2-95-v1");
    expect(NATIVE_TABLET_UX_P2_95_ROUTE).toBe("/dashboard/pos/native-tablet");
    expect(NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT).toBe(3);
    expect(NATIVE_TABLET_UX_P2_95_CAPABILITIES).toHaveLength(3);
  });

  it("passes full native tablet UX audit", () => {
    const summary = auditNativeTabletUxP2_95(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.tabletLayoutLinked).toBe(true);
    expect(summary.touchTargetsLinked).toBe(true);
    expect(summary.legacyPolicyLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("resolves portrait and landscape layout snapshots", () => {
    const portrait = resolveNativeTabletLayoutSnapshot("portrait");
    expect(portrait.stickyCart).toBe(true);
    expect(portrait.shellClass).toContain("pos-tablet-portrait");

    const landscape = resolveNativeTabletLayoutSnapshot("landscape");
    expect(landscape.stickyCart).toBe(false);
  });

  it("enforces 44px touch floor", () => {
    expect(NATIVE_TABLET_UX_MIN_TOUCH_PX).toBe(44);
    expect(meetsNativeTabletTouchFloor(44)).toBe(true);
    expect(meetsNativeTabletTouchFloor(40)).toBe(false);
  });

  it("builds native tablet UX report with bar quick items", () => {
    const report = buildNativeTabletUxReport({ orientation: "landscape", openTabCount: 2 });
    expect(report.barQuickItems.length).toBeGreaterThan(0);
    expect(report.tableTabsHints.length).toBe(4);
    expect(resolveNativeTabletRecommendedRoute(2)).toBe("/dashboard/pos/tabs");
    expect(resolveNativeTabletRecommendedRoute(0)).toBe("/dashboard/pos/tablet");
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[NATIVE_TABLET_UX_P2_95_NPM_SCRIPT]).toContain(
      "audit-native-tablet-ux-p2-95.ts",
    );
    expect(pkg.scripts["test:ci:native-tablet-ux-p2-95"]).toContain(NATIVE_TABLET_UX_P2_95_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, NATIVE_TABLET_UX_P2_95_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(NATIVE_TABLET_UX_P2_95_NPM_SCRIPT);

    expect(existsSync(join(ROOT, NATIVE_TABLET_UX_P2_95_DOC))).toBe(true);
    expect(formatNativeTabletUxP2_95AuditLines(auditNativeTabletUxP2_95(ROOT)).length).toBeGreaterThan(5);
  });
});
