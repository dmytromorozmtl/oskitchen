import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  componentUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_CTA_MARKER,
  PM_GTM_DOC_DARK_MODE_MARKER,
  PM_GTM_DOC_DEMO_MARKER,
  PM_GTM_DOC_HERO_MARKER,
  PM_GTM_DOC_HONESTY_MARKER,
  PM_GTM_DOC_ICP_MARKER,
  PM_GTM_DOC_OBJECTIONS_MARKER,
  PM_GTM_DOC_PRICING_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import { auditAppMarketplaceGtmScaleWiring } from "@/lib/marketing/app-marketplace-gtm-scale-audit";
import {
  APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH,
  APP_MARKETPLACE_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/app-marketplace-gtm-scale-absolute-final-policy";
import {
  APP_MARKETPLACE_THIRD_PARTY_ROUTE,
  APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 134 — PM marketing full scale for feature 89 app marketplace */
const TASK = 134;
const FEATURE = 89;

describe(`PM marketing full scale — app marketplace (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 134 → feature 89 app marketplace", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("app-marketplace-third-party");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH);
  });

  it("applies pm-gtm tokens to the marketplace marketing component", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH), "utf8");
    expect(componentUsesPmGtmTokens(component)).toBe(true);
    expect(component).toContain("absolute-final-pm-marketing-full-scale-tokens");
    expect(component).toContain(PM_GTM_DOC_HERO_MARKER);
    expect(component).toContain(PM_GTM_DOC_ICP_MARKER);
    expect(component).toContain(PM_GTM_DOC_DEMO_MARKER);
    expect(component).toContain(PM_GTM_DOC_OBJECTIONS_MARKER);
    expect(component).toContain(PM_GTM_DOC_PRICING_MARKER);
    expect(component).toContain(PM_GTM_DOC_CTA_MARKER);
    expect(component).toContain(PM_GTM_DOC_HONESTY_MARKER);
    expect(component).toContain(PM_GTM_DOC_DARK_MODE_MARKER);
    expect(PM_GTM_ABSOLUTE_FINAL_POLICY_ID).toBe(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("includes GTM section markers and task comment on the component", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH), "utf8");
    expect(component).toContain("pm-gtm-icp-profile");
    expect(component).toContain("pm-gtm-demo-hook");
    expect(component).toContain("pm-gtm-objection-handling");
    expect(component).toContain("pm-gtm-pricing-talk-track");
    expect(component).toContain("pm-gtm-primary-cta");
    expect(component).toContain("pm-gtm-honesty-guardrails");
    expect(component).toContain("task-134 feature-89");
  });

  it("shows honesty guardrails with BETA and platform review markers", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH), "utf8");
    const content = readFileSync(
      join(ROOT, "lib/marketing/app-marketplace-gtm-scale-content.ts"),
      "utf8",
    );
    const combined = `${component}\n${content}`;
    for (const marker of APP_MARKETPLACE_GTM_SCALE_HONESTY_MARKERS) {
      expect(combined).toContain(marker);
    }
  });

  it("links GTM component to /app-marketplace and feature policy", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH), "utf8");
    expect(component).toContain(APP_MARKETPLACE_THIRD_PARTY_ROUTE);
    expect(component).toContain(APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID);
    expect(component).toContain("app-marketplace-gtm-scale-absolute-final-v1");
  });

  it("references upstream app marketplace content with 8 extensions", () => {
    const content = readFileSync(
      join(ROOT, "lib/platform/app-marketplace-third-party-content.ts"),
      "utf8",
    );
    expect(content).toContain("APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS");
    expect(content).toContain("70%");
  });

  it("passes base app marketplace GTM wiring audit", () => {
    const wiring = auditAppMarketplaceGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 134 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-04-app-marketplace.test.ts",
    );
  });
});
