import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceEmptyStatesDesign,
  formatMarketplaceEmptyStatesDesignAuditLines,
} from "@/lib/design/marketplace-empty-states-design-audit";
import {
  MARKETPLACE_EMPTY_STATES_DESIGN_AUDIT_SCRIPT,
  MARKETPLACE_EMPTY_STATES_DESIGN_CI_WORKFLOW,
  MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS,
  MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE,
  MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_NPM_SCRIPT,
  MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE,
  MARKETPLACE_EMPTY_STATES_DESIGN_UNIT_TEST,
  MARKETPLACE_EMPTY_STATE_ILLUSTRATION_BY_SCENARIO,
  resolveMarketplaceEmptyStateIllustrationKind,
} from "@/lib/design/marketplace-empty-states-design-policy";

const ROOT = process.cwd();

describe("marketplace empty states design (P1-67)", () => {
  it("locks policy id and core empty scenarios", () => {
    expect(MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID).toBe(
      "marketplace-empty-states-design-p1-67-v1",
    );
    expect(MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS).toEqual([
      "vendors_empty",
      "orders_empty",
      "catalog_empty",
      "cart_empty",
    ]);
  });

  it("maps core scenarios to distinct illustration kinds", () => {
    expect(resolveMarketplaceEmptyStateIllustrationKind("vendors_empty")).toBe("vendors");
    expect(resolveMarketplaceEmptyStateIllustrationKind("orders_empty")).toBe("orders");
    expect(resolveMarketplaceEmptyStateIllustrationKind("catalog_empty")).toBe("catalog");
    expect(resolveMarketplaceEmptyStateIllustrationKind("cart_empty")).toBe("cart");
    expect(Object.keys(MARKETPLACE_EMPTY_STATE_ILLUSTRATION_BY_SCENARIO).length).toBeGreaterThan(
      10,
    );
  });

  it("ships SVG illustration module", () => {
    const source = readFileSync(
      join(ROOT, MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE),
      "utf8",
    );
    expect(source).toContain("MarketplaceEmptyStateIllustration");
    expect(source).toContain('viewBox="0 0 96 96"');
  });

  it("wires illustration, value props, and CTA test ids in UI module", () => {
    const source = readFileSync(join(ROOT, MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE), "utf8");
    expect(source).toContain("MarketplaceEmptyStateIllustration");
    expect(source).toContain("MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID");
    expect(source).toContain("MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID");
    expect(source).toContain("MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID");
    expect(source).not.toContain("appIconHeroClass");
  });

  it("passes full marketplace empty states design audit", () => {
    const summary = auditMarketplaceEmptyStatesDesign(ROOT);
    expect(summary.uiModulePresent).toBe(true);
    expect(summary.illustrationModulePresent).toBe(true);
    expect(summary.illustrationWired).toBe(true);
    expect(summary.valuePropWired).toBe(true);
    expect(summary.ctaWired).toBe(true);
    expect(summary.coreScenariosIllustrated).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARKETPLACE_EMPTY_STATES_DESIGN_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_EMPTY_STATES_DESIGN_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARKETPLACE_EMPTY_STATES_DESIGN_NPM_SCRIPT]).toContain(
      "audit-marketplace-empty-states-design.ts",
    );
    expect(pkg.scripts?.["test:ci:marketplace-empty-states-design"]).toContain(
      MARKETPLACE_EMPTY_STATES_DESIGN_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_EMPTY_STATES_DESIGN_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marketplace-empty-states-design");
  });

  it("formats audit lines", () => {
    const summary = auditMarketplaceEmptyStatesDesign(ROOT);
    const lines = formatMarketplaceEmptyStatesDesignAuditLines(summary);
    expect(lines.some((line) => line.includes(MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
