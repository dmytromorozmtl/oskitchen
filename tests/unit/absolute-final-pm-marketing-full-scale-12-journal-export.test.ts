import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
  JOURNAL_ENTRY_EXPORT_COMPONENT_PATH,
  JOURNAL_ENTRY_EXPORT_ROUTE,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import { auditJournalEntryExportGtmScaleWiring } from "@/lib/marketing/journal-entry-export-gtm-scale-audit";
import {
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH,
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/journal-entry-export-gtm-scale-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 142 — PM marketing full scale for feature 97 journal entry export */
const TASK = 142;
const FEATURE = 97;

describe(`PM marketing full scale — journal entry export (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 142 → feature 97 journal entry export", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("journal-entry-export");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the journal entry export GTM playbook", () => {
    const doc = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH), "utf8");
    expect(docUsesPmGtmTokens(doc)).toBe(true);
    expect(doc).toContain("pm-gtm-hero-banner");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
    expect(doc).toContain(PM_GTM_DOC_DARK_MODE_MARKER);
    expect(PM_GTM_ABSOLUTE_FINAL_POLICY_ID).toBe(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("includes ICP, demo, objections, pricing, and CTA sections", () => {
    const doc = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with certified GL and accountant review markers", () => {
    const doc = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of JOURNAL_ENTRY_EXPORT_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(JOURNAL_ENTRY_EXPORT_COMPONENT_PATH);
  });

  it("links GTM playbook to journal export route and feature policy", () => {
    const doc = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(JOURNAL_ENTRY_EXPORT_ROUTE);
    expect(doc).toContain("/dashboard/accounting/chart-of-accounts");
    expect(doc).toContain("/dashboard/accounting/gl-sync");
    expect(doc).toContain("journal-entry-export-gtm-scale-absolute-final-v1");
    expect(doc).toContain(JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-142 feature-97");
  });

  it("references upstream journal entry export component", () => {
    const component = readFileSync(join(ROOT, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
    expect(component).toContain("not a certified GL");
    expect(component).toContain("accountant review");
    expect(component).toContain("QuickBooks");
  });

  it("passes base journal entry export GTM wiring audit", () => {
    const wiring = auditJournalEntryExportGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 142 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-12-journal-export.test.ts",
    );
  });
});
