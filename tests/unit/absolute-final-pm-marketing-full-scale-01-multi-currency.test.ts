import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
  PM_MARKETING_FULL_SCALE_SLOTS,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import { auditMultiCurrencyGtmScaleWiring } from "@/lib/marketing/multi-currency-gtm-scale-audit";
import {
  MULTI_CURRENCY_GTM_SCALE_DOC_PATH,
  MULTI_CURRENCY_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/multi-currency-gtm-scale-absolute-final-policy";
import {
  MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  MULTI_CURRENCY_SETTINGS_ROUTE,
} from "@/lib/finance/multi-currency-policy";

const ROOT = process.cwd();
/** Absolute Final Task 131 — PM marketing full scale for feature 86 multi-currency */
const TASK = 131;
const FEATURE = 86;

describe(`PM marketing full scale — multi-currency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 131 → feature 86 multi-currency", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    expect(PM_MARKETING_FULL_SCALE_SLOTS).toHaveLength(15);
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("multi-currency-support");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(MULTI_CURRENCY_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the multi-currency GTM playbook", () => {
    const doc = readFileSync(join(ROOT, MULTI_CURRENCY_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, MULTI_CURRENCY_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with Lightspeed and No FX conversion markers", () => {
    const doc = readFileSync(join(ROOT, MULTI_CURRENCY_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of MULTI_CURRENCY_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(MULTI_CURRENCY_NETWORK_ROLLUP_LABEL);
    expect(MULTI_CURRENCY_SETTINGS_ROUTE).toBe("/dashboard/settings/currency");
  });

  it("exports shared pm-gtm token registry for slots 131–145", () => {
    const tokens = readFileSync(
      join(ROOT, "lib/marketing/absolute-final-pm-marketing-full-scale-tokens.ts"),
      "utf8",
    );
    expect(tokens).toContain("docUsesPmGtmTokens");
    expect(tokens).toContain("componentUsesPmGtmTokens");
    expect(tokens).toContain("PM_GTM_DOC_HERO_MARKER");
  });

  it("links GTM playbook to currency settings product surface", () => {
    const doc = readFileSync(join(ROOT, MULTI_CURRENCY_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(MULTI_CURRENCY_SETTINGS_ROUTE);
    expect(doc).toContain("multi-currency-gtm-scale-absolute-final-v1");
    expect(doc).toContain("task-131 feature-86");
  });

  it("passes base multi-currency GTM wiring audit", () => {
    const wiring = auditMultiCurrencyGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 131 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-01-multi-currency.test.ts",
    );
  });
});
