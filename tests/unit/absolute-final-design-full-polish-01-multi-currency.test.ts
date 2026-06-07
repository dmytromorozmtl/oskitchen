import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_FULL_POLISH_SLOTS,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DARK_MODE_TOKENS,
  DESIGN_POLISH_TOKEN_NAMES,
} from "@/lib/design/absolute-final-design-polish-tokens";
import {
  MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  MULTI_CURRENCY_SETTINGS_PAGE_PATH,
  MULTI_CURRENCY_SETTINGS_PANEL_PATH,
} from "@/lib/finance/multi-currency-policy";

const ROOT = process.cwd();
/** Absolute Final Task 116 — Design full polish for feature 86 multi-currency */
const TASK = 116;
const FEATURE = 86;

describe(`Design full polish — multi-currency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 116 → feature 86 multi-currency", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    expect(DESIGN_FULL_POLISH_SLOTS).toHaveLength(15);
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("multi-currency-support");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(MULTI_CURRENCY_SETTINGS_PANEL_PATH);
  });

  it("applies design polish card, hero, and row tokens to the settings panel", () => {
    const panel = readFileSync(join(ROOT, MULTI_CURRENCY_SETTINGS_PANEL_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
  });

  it("includes dark mode polish tokens on interactive surfaces", () => {
    const panel = readFileSync(join(ROOT, MULTI_CURRENCY_SETTINGS_PANEL_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/60");
    expect(panel).toContain("dark:bg-background/95");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(tokens).toContain("dark:bg-card/90");
    expect(tokens).toContain("dark:text-emerald-400");
  });

  it("shows hero banner with Lightspeed parity and network rollup honesty", () => {
    const panel = readFileSync(join(ROOT, MULTI_CURRENCY_SETTINGS_PANEL_PATH), "utf8");
    expect(panel).toContain("Lightspeed-style");
    expect(panel).toContain("MULTI_CURRENCY_NETWORK_ROLLUP_LABEL");
    expect(panel).toContain("do not auto-convert");
    expect(panel).toContain('role="note"');
  });

  it("wires currency settings page to the polished panel", () => {
    const page = readFileSync(join(ROOT, MULTI_CURRENCY_SETTINGS_PAGE_PATH), "utf8");
    expect(page).toContain("MultiCurrencySettingsPanel");
    expect(page).toContain('sectionKey="currency"');
  });

  it("exports shared design polish token registry for slots 116–130", () => {
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
    expect(DESIGN_POLISH_DARK_MODE_TOKENS.length).toBeGreaterThanOrEqual(4);
    expect(MULTI_CURRENCY_NETWORK_ROLLUP_LABEL).toContain("No FX conversion");
  });

  it("maps design polish slots to features 86–100 (+30 offset)", () => {
    for (const slot of DESIGN_FULL_POLISH_SLOTS) {
      expect(slot.taskNumber).toBe(slot.featureTaskNumber + 30);
    }
  });

  it("passes design polish slot 116 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-01-multi-currency.test.ts",
    );
  });
});
