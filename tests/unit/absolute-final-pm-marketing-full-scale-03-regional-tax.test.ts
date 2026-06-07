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
import { auditRegionalTaxComplianceGtmScaleWiring } from "@/lib/marketing/regional-tax-compliance-gtm-scale-audit";
import {
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/regional-tax-compliance-gtm-scale-absolute-final-policy";
import { REGIONAL_TAX_COMPLIANCE_DOC_PATH } from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 133 — PM marketing full scale for feature 88 regional tax compliance */
const TASK = 133;
const FEATURE = 88;

describe(`PM marketing full scale — regional tax compliance (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 133 → feature 88 regional tax compliance", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("regional-tax-compliance");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the regional tax GTM playbook", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with operator responsibility and readiness markers", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of REGIONAL_TAX_COMPLIANCE_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(REGIONAL_TAX_COMPLIANCE_DOC_PATH);
  });

  it("links GTM playbook to /trust and feature compliance guide", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("/trust");
    expect(doc).toContain("regional-tax-compliance-gtm-scale-absolute-final-v1");
    expect(doc).toContain("regional-tax-compliance-absolute-final-v1");
    expect(doc).toContain("task-133 feature-88");
  });

  it("references upstream regional tax compliance doc", () => {
    const featureDoc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(featureDoc).toContain("Phase 0 — Baseline");
    expect(featureDoc).toContain("operator responsibility");
  });

  it("passes base regional tax compliance GTM wiring audit", () => {
    const wiring = auditRegionalTaxComplianceGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 133 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-03-regional-tax.test.ts",
    );
  });
});
