import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditErrorTemplateDesignTokens,
  formatErrorTemplateDesignTokensAuditLines,
} from "@/lib/design/error-template-design-tokens-audit";
import {
  ERROR_TEMPLATE_AUDIT_SCRIPT,
  ERROR_TEMPLATE_BOUNDARY_MODULE,
  ERROR_TEMPLATE_CI_WORKFLOW,
  ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID,
  ERROR_TEMPLATE_DARK_MODE_TOKENS,
  ERROR_TEMPLATE_NPM_SCRIPT,
  ERROR_TEMPLATE_REQUIRED_ELEMENTS,
  ERROR_TEMPLATE_STATE_MODULE,
  ERROR_TEMPLATE_UNIT_TEST,
} from "@/lib/design/error-template-design-tokens-policy";

const ROOT = process.cwd();

describe("error template design tokens (P1-60)", () => {
  it("locks policy id and required template elements", () => {
    expect(ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID).toBe(
      "error-template-design-tokens-p1-60-v1",
    );
    expect(ERROR_TEMPLATE_REQUIRED_ELEMENTS).toEqual([
      "illustration",
      "title",
      "description",
      "actions",
      "dark_mode",
    ]);
    expect(ERROR_TEMPLATE_DARK_MODE_TOKENS.length).toBeGreaterThanOrEqual(3);
  });

  it("ships illustration, title, description, and actions in state module", () => {
    const source = readFileSync(join(ROOT, ERROR_TEMPLATE_STATE_MODULE), "utf8");
    expect(source).toContain("ErrorStateIllustration");
    expect(source).toContain("ERROR_TEMPLATE_TITLE_CLASS");
    expect(source).toContain("ERROR_TEMPLATE_DESCRIPTION_CLASS");
    expect(source).toContain("ERROR_TEMPLATE_ACTIONS_CLASS");
    expect(source).toContain("ERROR_TEMPLATE_CARD_CLASS");
  });

  it("ships RouteError chain in boundary module", () => {
    const source = readFileSync(join(ROOT, ERROR_TEMPLATE_BOUNDARY_MODULE), "utf8");
    expect(source).toContain("RouteError");
    expect(source).toContain("ErrorBoundaryTemplate");
    expect(source).toContain("ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID");
  });

  it("passes full error template design tokens audit", () => {
    const summary = auditErrorTemplateDesignTokens(ROOT);
    expect(summary.boundaryModulePresent).toBe(true);
    expect(summary.stateModulePresent).toBe(true);
    expect(summary.illustrationModulePresent).toBe(true);
    expect(summary.illustrationWired).toBe(true);
    expect(summary.titleWired).toBe(true);
    expect(summary.descriptionWired).toBe(true);
    expect(summary.actionsWired).toBe(true);
    expect(summary.darkModeWired).toBe(true);
    expect(summary.boundaryUsesStateChain).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, ERROR_TEMPLATE_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, ERROR_TEMPLATE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ERROR_TEMPLATE_NPM_SCRIPT]).toContain(
      "audit-error-template-design-tokens.ts",
    );
    expect(pkg.scripts?.["test:ci:error-template-design-tokens"]).toContain(
      ERROR_TEMPLATE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ERROR_TEMPLATE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:error-template-design-tokens");
  });

  it("formats audit lines", () => {
    const summary = auditErrorTemplateDesignTokens(ROOT);
    const lines = formatErrorTemplateDesignTokensAuditLines(summary);
    expect(lines.some((line) => line.includes(ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
