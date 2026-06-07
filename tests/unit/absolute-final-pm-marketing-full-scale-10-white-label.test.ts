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
import { auditWhiteLabelStorefrontGtmScaleWiring } from "@/lib/marketing/white-label-storefront-gtm-scale-audit";
import {
  WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH,
  WHITE_LABEL_STOREFRONT_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/white-label-storefront-gtm-scale-absolute-final-policy";
import {
  WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
  WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 140 — PM marketing full scale for feature 95 white-label storefront depth */
const TASK = 140;
const FEATURE = 95;

describe(`PM marketing full scale — white-label storefront depth (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 140 → feature 95 white-label storefront depth", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("white-label-storefront-depth");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the white-label storefront GTM playbook", () => {
    const doc = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with ChowNow parity and DNS markers", () => {
    const doc = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of WHITE_LABEL_STOREFRONT_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH);
  });

  it("links GTM playbook to white-label route and feature policy", () => {
    const doc = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE);
    expect(doc).toContain("/dashboard/settings/white-label");
    expect(doc).toContain("white-label-storefront-gtm-scale-absolute-final-v1");
    expect(doc).toContain(WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-140 feature-95");
  });

  it("references upstream white-label storefront depth component", () => {
    const component = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
    expect(component).toContain("ChowNow parity");
    expect(component).toContain("Do not promise custom domains");
    expect(component).toContain("DNS is not automatic");
  });

  it("passes base white-label storefront GTM wiring audit", () => {
    const wiring = auditWhiteLabelStorefrontGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 140 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-10-white-label.test.ts",
    );
  });
});
