import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import { auditFloorPlanGtmScaleWiring } from "@/lib/marketing/floor-plan-gtm-scale-audit";
import {
  FLOOR_PLAN_GTM_SCALE_DOC_PATH,
  FLOOR_PLAN_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/floor-plan-gtm-scale-absolute-final-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import {
  VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID,
  VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 137 — PM marketing full scale for feature 92 visual floor plan editor */
const TASK = 137;
const FEATURE = 92;

describe(`PM marketing full scale — visual floor plan editor (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 137 → feature 92 visual floor plan editor", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("visual-floor-plan-editor");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(FLOOR_PLAN_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the floor plan GTM playbook", () => {
    const doc = readFileSync(join(ROOT, FLOOR_PLAN_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, FLOOR_PLAN_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with MICROS parity and occupancy markers", () => {
    const doc = readFileSync(join(ROOT, FLOOR_PLAN_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of FLOOR_PLAN_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH);
  });

  it("links GTM playbook to floor plan route and feature policy", () => {
    const doc = readFileSync(join(ROOT, FLOOR_PLAN_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(VISUAL_FLOOR_PLAN_EDITOR_ROUTE);
    expect(doc).toContain("floor-plan-gtm-scale-absolute-final-v1");
    expect(doc).toContain(VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-137 feature-92");
  });

  it("references upstream floor plan editor component", () => {
    const component = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
    expect(component).toContain("Oracle MICROS parity");
    expect(component).toContain("not certified live occupancy");
  });

  it("passes base floor plan GTM wiring audit", () => {
    const wiring = auditFloorPlanGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 137 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-07-floor-plan.test.ts",
    );
  });
});
