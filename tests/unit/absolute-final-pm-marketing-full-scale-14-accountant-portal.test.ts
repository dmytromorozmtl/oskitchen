import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
  ACCOUNTANT_PORTAL_COMPONENT_PATH,
  ACCOUNTANT_PORTAL_ROUTE,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
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
import { auditAccountantPortalGtmScaleWiring } from "@/lib/marketing/accountant-portal-gtm-scale-audit";
import {
  ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH,
  ACCOUNTANT_PORTAL_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/accountant-portal-gtm-scale-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 144 — PM marketing full scale for feature 99 accountant portal */
const TASK = 144;
const FEATURE = 99;

describe(`PM marketing full scale — accountant portal (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 144 → feature 99 accountant portal", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("accountant-portal");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the accountant portal GTM playbook", () => {
    const doc = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with read-only and certified GL markers", () => {
    const doc = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of ACCOUNTANT_PORTAL_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(ACCOUNTANT_PORTAL_COMPONENT_PATH);
  });

  it("links GTM playbook to accountant portal route and feature policy", () => {
    const doc = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(ACCOUNTANT_PORTAL_ROUTE);
    expect(doc).toContain("/dashboard/accounting/gl-sync");
    expect(doc).toContain("/dashboard/accounting/chart-of-accounts");
    expect(doc).toContain("accountant-portal-gtm-scale-absolute-final-v1");
    expect(doc).toContain(ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-144 feature-99");
  });

  it("references upstream accountant portal component", () => {
    const component = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
    expect(component).toContain("read-only");
    expect(component).toContain("not a certified GL");
    expect(component).toContain("accountant review");
  });

  it("passes base accountant portal GTM wiring audit", () => {
    const wiring = auditAccountantPortalGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 144 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-14-accountant-portal.test.ts",
    );
  });
});
