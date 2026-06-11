import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommandCenterBrand,
  formatCommandCenterBrandAuditLines,
} from "@/lib/design/command-center-brand-audit";
import {
  COMMAND_CENTER_BRAND_AUDIT_SCRIPT,
  COMMAND_CENTER_BRAND_CI_WORKFLOW,
  COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES,
  COMMAND_CENTER_BRAND_NPM_SCRIPT,
  COMMAND_CENTER_BRAND_PAGE_MODULE,
  COMMAND_CENTER_BRAND_PANEL_MODULE,
  COMMAND_CENTER_BRAND_POLICY_ID,
  COMMAND_CENTER_BRAND_UNIT_TEST,
} from "@/lib/design/command-center-brand-policy";

const ROOT = process.cwd();

describe("Command Center brand (P1-66)", () => {
  it("locks policy id and forbidden terminal chrome", () => {
    expect(COMMAND_CENTER_BRAND_POLICY_ID).toBe("command-center-brand-p1-66-v1");
    expect(COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES).toContain("bg-slate-950");
  });

  it("uses Today-aligned title tokens on page", () => {
    const source = readFileSync(join(ROOT, COMMAND_CENTER_BRAND_PAGE_MODULE), "utf8");
    expect(source).toContain("COMMAND_CENTER_BRAND_PAGE_TITLE_CLASS");
    expect(source).toContain("COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID");
    expect(source).not.toContain("Operations Terminal");
  });

  it("uses card surface tokens in panel", () => {
    const source = readFileSync(join(ROOT, COMMAND_CENTER_BRAND_PANEL_MODULE), "utf8");
    expect(source).toContain("COMMAND_CENTER_BRAND_PANEL_CLASS");
    expect(source).toContain("COMMAND_CENTER_BRAND_TICKER_CELL_CLASS");
    for (const forbidden of COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("passes full Command Center brand audit", () => {
    const summary = auditCommandCenterBrand(ROOT);
    expect(summary.pagePresent).toBe(true);
    expect(summary.panelPresent).toBe(true);
    expect(summary.stickyHeaderWired).toBe(true);
    expect(summary.todayTitleWired).toBe(true);
    expect(summary.cardTokensWired).toBe(true);
    expect(summary.terminalChromeRemoved).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, COMMAND_CENTER_BRAND_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, COMMAND_CENTER_BRAND_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMMAND_CENTER_BRAND_NPM_SCRIPT]).toContain(
      "audit-command-center-brand.ts",
    );
    expect(pkg.scripts?.["test:ci:command-center-brand"]).toContain(COMMAND_CENTER_BRAND_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, COMMAND_CENTER_BRAND_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:command-center-brand");
  });

  it("formats audit lines", () => {
    const summary = auditCommandCenterBrand(ROOT);
    const lines = formatCommandCenterBrandAuditLines(summary);
    expect(lines.some((line) => line.includes(COMMAND_CENTER_BRAND_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
