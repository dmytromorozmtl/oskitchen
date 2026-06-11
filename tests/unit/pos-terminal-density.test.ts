import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPosTerminalDensity,
  formatPosTerminalDensityAuditLines,
} from "@/lib/design/pos-terminal-density-audit";
import {
  POS_TERMINAL_DENSITY_AUDIT_SCRIPT,
  POS_TERMINAL_DENSITY_CI_WORKFLOW,
  POS_TERMINAL_DENSITY_MIN_TOUCH_PX,
  POS_TERMINAL_DENSITY_NPM_SCRIPT,
  POS_TERMINAL_DENSITY_POLICY_ID,
  POS_TERMINAL_DENSITY_RECEIPT_MODULE,
  POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS,
  POS_TERMINAL_DENSITY_TERMINAL_MODULE,
  POS_TERMINAL_DENSITY_UNIT_TEST,
} from "@/lib/design/pos-terminal-density-policy";

const ROOT = process.cwd();

describe("POS terminal density (P1-61)", () => {
  it("locks policy id, 44px floor, and required density elements", () => {
    expect(POS_TERMINAL_DENSITY_POLICY_ID).toBe("pos-terminal-density-p1-61-v1");
    expect(POS_TERMINAL_DENSITY_MIN_TOUCH_PX).toBe(44);
    expect(POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS).toEqual([
      "touch_targets_44px",
      "contrast",
      "spacing",
      "checkout_prominent",
    ]);
  });

  it("ships contrast, spacing, and touch targets in terminal module", () => {
    const source = readFileSync(join(ROOT, POS_TERMINAL_DENSITY_TERMINAL_MODULE), "utf8");
    expect(source).toContain("POS_TERMINAL_DENSITY_PRODUCT_TITLE_CLASS");
    expect(source).toContain("POS_TERMINAL_DENSITY_PRODUCT_PRICE_CLASS");
    expect(source).toContain("POS_TERMINAL_DENSITY_PRODUCT_GRID_CLASS");
    expect(source).toContain("posTouchCompactClass");
    expect(source).toContain("posTouchTileClass");
  });

  it("ships prominent checkout CTA in receipt module", () => {
    const source = readFileSync(join(ROOT, POS_TERMINAL_DENSITY_RECEIPT_MODULE), "utf8");
    expect(source).toContain("POS_TERMINAL_DENSITY_CHECKOUT_BUTTON_CLASS");
    expect(source).toContain("POS_TERMINAL_DENSITY_CHECKOUT_WRAPPER_CLASS");
    expect(source).toContain("POS_TERMINAL_DENSITY_CHECKOUT_TEST_ID");
  });

  it("passes full POS terminal density audit", () => {
    const summary = auditPosTerminalDensity(ROOT);
    expect(summary.terminalModulePresent).toBe(true);
    expect(summary.receiptModulePresent).toBe(true);
    expect(summary.cartModulePresent).toBe(true);
    expect(summary.touchTargets44pxWired).toBe(true);
    expect(summary.contrastWired).toBe(true);
    expect(summary.spacingWired).toBe(true);
    expect(summary.checkoutProminentWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POS_TERMINAL_DENSITY_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, POS_TERMINAL_DENSITY_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POS_TERMINAL_DENSITY_NPM_SCRIPT]).toContain(
      "audit-pos-terminal-density.ts",
    );
    expect(pkg.scripts?.["test:ci:pos-terminal-density"]).toContain(
      POS_TERMINAL_DENSITY_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, POS_TERMINAL_DENSITY_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pos-terminal-density");
  });

  it("formats audit lines", () => {
    const summary = auditPosTerminalDensity(ROOT);
    const lines = formatPosTerminalDensityAuditLines(summary);
    expect(lines.some((line) => line.includes(POS_TERMINAL_DENSITY_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
