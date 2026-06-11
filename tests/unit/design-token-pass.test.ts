import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDesignTokenPass,
  formatDesignTokenPassAuditLines,
} from "@/lib/design/design-token-pass-audit";
import {
  DESIGN_TOKEN_PASS_AUDIT_SCRIPT,
  DESIGN_TOKEN_PASS_BASELINE_PERCENT,
  DESIGN_TOKEN_PASS_CI_WORKFLOW,
  DESIGN_TOKEN_PASS_MODULES,
  DESIGN_TOKEN_PASS_NPM_SCRIPT,
  DESIGN_TOKEN_PASS_POLICY_ID,
  DESIGN_TOKEN_PASS_TARGET_PERCENT,
  DESIGN_TOKEN_PASS_UNIT_TEST,
} from "@/lib/design/design-token-pass-policy";

const ROOT = process.cwd();

describe("design token pass (P1-63)", () => {
  it("locks policy id and 85→95 coverage thresholds", () => {
    expect(DESIGN_TOKEN_PASS_POLICY_ID).toBe("design-token-pass-p1-63-v1");
    expect(DESIGN_TOKEN_PASS_BASELINE_PERCENT).toBe(85);
    expect(DESIGN_TOKEN_PASS_TARGET_PERCENT).toBe(95);
  });

  it("ships unified typography tokens in dashboard nav", () => {
    const source = readFileSync(
      join(ROOT, "components/dashboard/dashboard-nav.tsx"),
      "utf8",
    );
    expect(source).toContain("DESIGN_TOKEN_CAPTION_CLASS");
    expect(source).toContain("DESIGN_TOKEN_MICRO_LABEL_CLASS");
    expect(source).not.toMatch(/text-\[\d+px\]/);
  });

  it("ships layout tokens in page shell", () => {
    const source = readFileSync(join(ROOT, "components/layout/page-shell.tsx"), "utf8");
    expect(source).toContain("DESIGN_TOKEN_PAGE_SHELL_PADDING_CLASS");
    expect(source).toContain("layout.contentMaxClass");
  });

  it("passes full design token pass audit", () => {
    const summary = auditDesignTokenPass(ROOT);
    expect(summary.colorCoveragePercent).toBeGreaterThanOrEqual(DESIGN_TOKEN_PASS_TARGET_PERCENT);
    expect(summary.colorPassed).toBe(true);
    expect(summary.modules.length).toBe(DESIGN_TOKEN_PASS_MODULES.length);
    expect(summary.modules.every((module) => module.passed)).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, DESIGN_TOKEN_PASS_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, DESIGN_TOKEN_PASS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DESIGN_TOKEN_PASS_NPM_SCRIPT]).toContain(
      "audit-design-token-pass.ts",
    );
    expect(pkg.scripts?.["test:ci:design-token-pass"]).toContain(DESIGN_TOKEN_PASS_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, DESIGN_TOKEN_PASS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:design-token-pass");
  });

  it("formats audit lines", () => {
    const summary = auditDesignTokenPass(ROOT);
    const lines = formatDesignTokenPassAuditLines(summary);
    expect(lines.some((line) => line.includes(DESIGN_TOKEN_PASS_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
