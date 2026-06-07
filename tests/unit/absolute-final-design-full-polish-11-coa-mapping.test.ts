import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS,
  CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH,
  CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { auditChartOfAccountsMappingWiring } from "@/lib/accounting/chart-of-accounts-mapping-audit";
import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DARK_MODE_TOKENS,
  DESIGN_POLISH_TOKEN_NAMES,
} from "@/lib/design/absolute-final-design-polish-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 126 — Design full polish for feature 96 chart of accounts mapping */
const TASK = 126;
const FEATURE = 96;

describe(`Design full polish — chart of accounts mapping (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 126 → feature 96 chart of accounts mapping", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("chart-of-accounts-mapping");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the COA mapping panel", () => {
    const panel = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on table and hero surfaces", () => {
    const panel = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with certified GL and accountant review honesty", () => {
    const panel = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
    for (const marker of CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS.length).toBe(8);
  });

  it("wires chart-of-accounts page to the polished mapping panel", () => {
    const page = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH), "utf8");
    expect(page).toContain("ChartOfAccountsMappingPanel");
    expect(CHART_OF_ACCOUNTS_MAPPING_ROUTE).toBe("/dashboard/accounting/chart-of-accounts");
  });

  it("preserves COA mapping UI wiring after polish", () => {
    const panel = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
    expect(panel).toContain('data-testid="chart-of-accounts-mapping-panel"');
    expect(panel).toContain("ChartOfAccountsMappingPanel");
    expect(panel).toContain("ChartOfAccountsMappingRowForm");
    expect(panel).toContain("GL_DEPTH_ACCOUNTING_ROUTE");
    expect(panel).toContain("/dashboard/integrations/quickbooks/live");
  });

  it("passes base chart of accounts mapping wiring audit after component polish", () => {
    const wiring = auditChartOfAccountsMappingWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 126 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-11-coa-mapping.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
