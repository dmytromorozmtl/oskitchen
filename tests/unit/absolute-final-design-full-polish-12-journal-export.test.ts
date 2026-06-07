import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditJournalEntryExportWiring } from "@/lib/accounting/journal-entry-export-audit";
import {
  JOURNAL_ENTRY_EXPORT_COMPONENT_PATH,
  JOURNAL_ENTRY_EXPORT_FORMATS,
  JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS,
  JOURNAL_ENTRY_EXPORT_PAGE_PATH,
  JOURNAL_ENTRY_EXPORT_ROUTE,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
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
/** Absolute Final Task 127 — Design full polish for feature 97 journal entry export */
const TASK = 127;
const FEATURE = 97;

describe(`Design full polish — journal entry export (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 127 → feature 97 journal entry export", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("journal-entry-export");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(JOURNAL_ENTRY_EXPORT_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the journal export panel", () => {
    const panel = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on preview table and format cards", () => {
    const panel = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with certified GL and accountant review honesty", () => {
    const panel = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
    for (const marker of JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(JOURNAL_ENTRY_EXPORT_FORMATS.length).toBe(3);
  });

  it("wires journal-export page to the polished export panel", () => {
    const page = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_PAGE_PATH), "utf8");
    expect(page).toContain("JournalEntryExportPanel");
    expect(JOURNAL_ENTRY_EXPORT_ROUTE).toBe("/dashboard/accounting/journal-export");
  });

  it("preserves journal export UI test ids and format wiring after polish", () => {
    const panel = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
    expect(panel).toContain('data-testid="journal-entry-export-panel"');
    expect(panel).toContain('data-testid="journal-export-format"');
    expect(panel).toContain('data-testid="journal-export-preview-row"');
    expect(panel).toContain("JournalEntryExportPanel");
    expect(panel).toContain("CHART_OF_ACCOUNTS_MAPPING_ROUTE");
    expect(panel).toContain("quickbooks_csv");
  });

  it("passes base journal entry export wiring audit after component polish", () => {
    const wiring = auditJournalEntryExportWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 127 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-12-journal-export.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
