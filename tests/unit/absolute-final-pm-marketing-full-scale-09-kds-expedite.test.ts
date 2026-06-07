import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
  KDS_EXPEDITE_SCREEN_COMPONENT_PATH,
  KDS_EXPEDITE_SCREEN_ROUTE,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import { auditKdsExpediteGtmScaleWiring } from "@/lib/marketing/kds-expedite-gtm-scale-audit";
import {
  KDS_EXPEDITE_GTM_SCALE_DOC_PATH,
  KDS_EXPEDITE_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/kds-expedite-gtm-scale-absolute-final-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 139 — PM marketing full scale for feature 94 KDS expedite screen */
const TASK = 139;
const FEATURE = 94;

describe(`PM marketing full scale — KDS expedite screen (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 139 → feature 94 KDS expedite screen", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("kds-expedite-screen");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(KDS_EXPEDITE_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the KDS expedite GTM playbook", () => {
    const doc = readFileSync(join(ROOT, KDS_EXPEDITE_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, KDS_EXPEDITE_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with BETA and rush-hour markers", () => {
    const doc = readFileSync(join(ROOT, KDS_EXPEDITE_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of KDS_EXPEDITE_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(KDS_EXPEDITE_SCREEN_COMPONENT_PATH);
  });

  it("links GTM playbook to expedite route and feature policy", () => {
    const doc = readFileSync(join(ROOT, KDS_EXPEDITE_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(KDS_EXPEDITE_SCREEN_ROUTE);
    expect(doc).toContain("/dashboard/kitchen/expo");
    expect(doc).toContain("kds-expedite-gtm-scale-absolute-final-v1");
    expect(doc).toContain(KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-139 feature-94");
  });

  it("references upstream KDS expedite screen component", () => {
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    expect(component).toContain("Expedite screen");
    expect(component).toContain("not rush-hour certified");
  });

  it("passes base KDS expedite GTM wiring audit", () => {
    const wiring = auditKdsExpediteGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 139 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-09-kds-expedite.test.ts",
    );
  });
});
