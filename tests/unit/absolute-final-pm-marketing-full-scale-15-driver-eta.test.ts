import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
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
import { auditKdsDriverEtaGtmScaleWiring } from "@/lib/marketing/kds-driver-eta-gtm-scale-audit";
import {
  KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH,
  KDS_DRIVER_ETA_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/kds-driver-eta-gtm-scale-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 145 — PM marketing full scale for feature 100 driver ETA tracking in KDS */
const TASK = 145;
const FEATURE = 100;

describe(`PM marketing full scale — driver ETA tracking in KDS (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 145 → feature 100 driver ETA tracking", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("kds-driver-eta-tracking");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the driver ETA GTM playbook", () => {
    const doc = readFileSync(join(ROOT, KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with estimated ETA and GPS markers", () => {
    const doc = readFileSync(join(ROOT, KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of KDS_DRIVER_ETA_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH);
  });

  it("links GTM playbook to driver ETA route and feature policy", () => {
    const doc = readFileSync(join(ROOT, KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(KDS_DRIVER_ETA_TRACKING_ROUTE);
    expect(doc).toContain("/dashboard/kitchen/expo");
    expect(doc).toContain("kds-driver-eta-gtm-scale-absolute-final-v1");
    expect(doc).toContain(KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-145 feature-100");
  });

  it("references upstream KDS driver ETA screen component", () => {
    const component = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    expect(component).toContain("estimated ETA");
    expect(component).toContain("not live GPS certified");
    expect(component).toContain("Do not claim");
  });

  it("passes base driver ETA GTM wiring audit", () => {
    const wiring = auditKdsDriverEtaGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 145 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-15-driver-eta.test.ts",
    );
  });
});
