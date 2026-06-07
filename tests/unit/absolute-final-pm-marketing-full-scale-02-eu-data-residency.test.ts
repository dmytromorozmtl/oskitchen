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
import { auditEuDataResidencyGtmScaleWiring } from "@/lib/marketing/eu-data-residency-gtm-scale-audit";
import {
  EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH,
  EU_DATA_RESIDENCY_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/eu-data-residency-gtm-scale-absolute-final-policy";
import { EU_DATA_RESIDENCY_ROADMAP_DOC_PATH } from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 132 — PM marketing full scale for feature 87 EU data residency */
const TASK = 132;
const FEATURE = 87;

describe(`PM marketing full scale — EU data residency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 132 → feature 87 EU data residency", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("eu-data-residency-roadmap");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the EU residency GTM playbook", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with US-primary and GDPR markers", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of EU_DATA_RESIDENCY_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(EU_DATA_RESIDENCY_ROADMAP_DOC_PATH);
  });

  it("links GTM playbook to /trust and feature roadmap", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("/trust");
    expect(doc).toContain("eu-data-residency-gtm-scale-absolute-final-v1");
    expect(doc).toContain("eu-data-residency-roadmap-absolute-final-v1");
    expect(doc).toContain("task-132 feature-87");
  });

  it("references upstream EU residency roadmap doc", () => {
    const roadmap = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(roadmap).toContain("Phase 5 — General availability");
    expect(roadmap).toContain("US-primary");
  });

  it("passes base EU data residency GTM wiring audit", () => {
    const wiring = auditEuDataResidencyGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 132 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-02-eu-data-residency.test.ts",
    );
  });
});
