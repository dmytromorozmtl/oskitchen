import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCafeModeP3_143,
  formatCafeModeP3_143AuditLines,
} from "@/lib/pos/cafe-mode-p3-143-audit";
import {
  loadCafeModePosRegistry,
  validateCafeModePosRegistry,
} from "@/lib/pos/cafe-mode-p3-143-operations";
import { assertCafeModeScreenCount } from "@/lib/pos/cafe-mode-p3-143-content";
import {
  CAFE_MODE_P3_143_CI_WORKFLOW,
  CAFE_MODE_P3_143_COMPETITOR,
  CAFE_MODE_P3_143_DOC,
  CAFE_MODE_P3_143_HEADLINE,
  CAFE_MODE_P3_143_MAX_SCREENS,
  CAFE_MODE_P3_143_NPM_SCRIPT,
  CAFE_MODE_P3_143_POLICY_ID,
  CAFE_MODE_P3_143_ROUTE,
  CAFE_MODE_P3_143_SCREEN_IDS,
  CAFE_MODE_P3_143_UNIT_TEST,
} from "@/lib/pos/cafe-mode-p3-143-policy";
import { resolveCafeMode } from "@/lib/pos/cafe-mode-p3-143";

const ROOT = process.cwd();

describe("Café mode POS (P3-143)", () => {
  it("locks policy id, Square competitor, and 5-screen max", () => {
    expect(CAFE_MODE_P3_143_POLICY_ID).toBe("cafe-mode-p3-143-v1");
    expect(CAFE_MODE_P3_143_COMPETITOR).toBe("square");
    expect(CAFE_MODE_P3_143_MAX_SCREENS).toBe(5);
    expect(CAFE_MODE_P3_143_ROUTE).toBe("/dashboard/pos/cafe");
    expect(CAFE_MODE_P3_143_HEADLINE).toBe("Café mode — 5 screens, counter-first");
    expect(CAFE_MODE_P3_143_SCREEN_IDS).toEqual([
      "menu",
      "cart",
      "modifiers",
      "payment",
      "receipt",
    ]);
    expect(assertCafeModeScreenCount()).toBe(true);
  });

  it("resolves café mode from query param and business type", () => {
    expect(resolveCafeMode({ cafeParam: "1" })).toBe(true);
    expect(resolveCafeMode({ cafeParam: "0" })).toBe(false);
    expect(resolveCafeMode({ businessType: "CAFE" })).toBe(true);
    expect(resolveCafeMode({ businessType: "RESTAURANT" })).toBe(false);
  });

  it("validates registry with zero active sessions", () => {
    const registry = loadCafeModePosRegistry(ROOT);
    const validation = validateCafeModePosRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActiveSessions).toBe(true);
    expect(registry.activeSessionCount).toBe(0);
    expect(registry.screens).toHaveLength(5);
  });

  it("passes full café mode audit", () => {
    const summary = auditCafeModeP3_143(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveTerminalWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.screensDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, CAFE_MODE_P3_143_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CAFE_MODE_P3_143_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CAFE_MODE_P3_143_NPM_SCRIPT]).toContain("audit-cafe-mode-p3-143.ts");
    expect(pkg.scripts?.["test:ci:cafe-mode-p3-143"]).toContain(CAFE_MODE_P3_143_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, CAFE_MODE_P3_143_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:cafe-mode-p3-143");
  });

  it("formats audit lines", () => {
    const summary = auditCafeModeP3_143(ROOT);
    const lines = formatCafeModeP3_143AuditLines(summary);
    expect(lines.some((line) => line.includes(CAFE_MODE_P3_143_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
