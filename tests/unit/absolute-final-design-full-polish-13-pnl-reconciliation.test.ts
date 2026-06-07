import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PNL_RECONCILIATION_VIEW_COMPONENT_PATH,
  PNL_RECONCILIATION_VIEW_HONESTY_MARKERS,
  PNL_RECONCILIATION_VIEW_PAGE_PATH,
  PNL_RECONCILIATION_VIEW_ROUTE,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";
import { auditPnlReconciliationViewWiring } from "@/lib/accounting/pnl-reconciliation-view-audit";
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
/** Absolute Final Task 128 — Design full polish for feature 98 P&L reconciliation view */
const TASK = 128;
const FEATURE = 98;

describe(`Design full polish — P&L reconciliation view (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 128 → feature 98 P&L reconciliation view", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("pnl-reconciliation-view");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(PNL_RECONCILIATION_VIEW_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the reconciliation panel", () => {
    const panel = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on summary cards and reconciliation table", () => {
    const panel = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with operational P&L and certified GL honesty", () => {
    const panel = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
    for (const marker of PNL_RECONCILIATION_VIEW_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(panel).toContain("PNL_RECONCILIATION_SEVERITY_META");
  });

  it("wires pnl-reconciliation page to the polished view panel", () => {
    const page = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_PAGE_PATH), "utf8");
    expect(page).toContain("PnlReconciliationViewPanel");
    expect(PNL_RECONCILIATION_VIEW_ROUTE).toBe("/dashboard/accounting/pnl-reconciliation");
  });

  it("preserves reconciliation UI test ids and export wiring after polish", () => {
    const panel = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
    expect(panel).toContain('data-testid="pnl-reconciliation-view-panel"');
    expect(panel).toContain('data-testid="pnl-reconciliation-view-row"');
    expect(panel).toContain("PnlReconciliationViewPanel");
    expect(panel).toContain("PNL_RECONCILIATION_VIEW_EXPORT_ROUTE");
    expect(panel).toContain("GL_DEPTH_ACCOUNTING_ROUTE");
    expect(panel).toContain("JOURNAL_ENTRY_EXPORT_ROUTE");
  });

  it("passes base P&L reconciliation view wiring audit after component polish", () => {
    const wiring = auditPnlReconciliationViewWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 128 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-13-pnl-reconciliation.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
