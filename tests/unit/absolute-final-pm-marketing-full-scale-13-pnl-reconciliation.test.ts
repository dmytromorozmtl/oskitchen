import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
import { auditPnlReconciliationGtmScaleWiring } from "@/lib/marketing/pnl-reconciliation-gtm-scale-audit";
import {
  PNL_RECONCILIATION_GTM_SCALE_DOC_PATH,
  PNL_RECONCILIATION_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/pnl-reconciliation-gtm-scale-absolute-final-policy";
import {
  PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID,
  PNL_RECONCILIATION_VIEW_COMPONENT_PATH,
  PNL_RECONCILIATION_VIEW_ROUTE,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 143 — PM marketing full scale for feature 98 P&L reconciliation view */
const TASK = 143;
const FEATURE = 98;

describe(`PM marketing full scale — P&L reconciliation view (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 143 → feature 98 P&L reconciliation view", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("pnl-reconciliation-view");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(PNL_RECONCILIATION_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the P&L reconciliation GTM playbook", () => {
    const doc = readFileSync(join(ROOT, PNL_RECONCILIATION_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, PNL_RECONCILIATION_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with operational P&L and certified GL markers", () => {
    const doc = readFileSync(join(ROOT, PNL_RECONCILIATION_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of PNL_RECONCILIATION_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(PNL_RECONCILIATION_VIEW_COMPONENT_PATH);
  });

  it("links GTM playbook to reconciliation route and feature policy", () => {
    const doc = readFileSync(join(ROOT, PNL_RECONCILIATION_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(PNL_RECONCILIATION_VIEW_ROUTE);
    expect(doc).toContain("/dashboard/accounting/gl-sync");
    expect(doc).toContain("/dashboard/accounting/journal-export");
    expect(doc).toContain("pnl-reconciliation-gtm-scale-absolute-final-v1");
    expect(doc).toContain(PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-143 feature-98");
  });

  it("references upstream P&L reconciliation view component", () => {
    const component = readFileSync(join(ROOT, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
    expect(component).toContain("operational P&L");
    expect(component).toContain("not a certified GL");
    expect(component).toContain("accountant review");
  });

  it("passes base P&L reconciliation GTM wiring audit", () => {
    const wiring = auditPnlReconciliationGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 143 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-13-pnl-reconciliation.test.ts",
    );
  });
});
