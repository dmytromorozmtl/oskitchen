import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
  CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
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
import { auditChartOfAccountsGtmScaleWiring } from "@/lib/marketing/chart-of-accounts-gtm-scale-audit";
import {
  CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH,
  CHART_OF_ACCOUNTS_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/chart-of-accounts-gtm-scale-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 141 — PM marketing full scale for feature 96 chart of accounts mapping */
const TASK = 141;
const FEATURE = 96;

describe(`PM marketing full scale — chart of accounts mapping (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 141 → feature 96 chart of accounts mapping", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("chart-of-accounts-mapping");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the chart of accounts GTM playbook", () => {
    const doc = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with certified GL and accountant review markers", () => {
    const doc = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of CHART_OF_ACCOUNTS_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH);
  });

  it("links GTM playbook to chart of accounts route and feature policy", () => {
    const doc = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(CHART_OF_ACCOUNTS_MAPPING_ROUTE);
    expect(doc).toContain("/dashboard/accounting/gl-sync");
    expect(doc).toContain("chart-of-accounts-gtm-scale-absolute-final-v1");
    expect(doc).toContain(CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-141 feature-96");
  });

  it("references upstream chart of accounts mapping component", () => {
    const component = readFileSync(join(ROOT, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
    expect(component).toContain("not a certified GL");
    expect(component).toContain("accountant review");
    expect(component).toContain("QuickBooks");
  });

  it("passes base chart of accounts GTM wiring audit", () => {
    const wiring = auditChartOfAccountsGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 141 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-11-coa-mapping.test.ts",
    );
  });
});
