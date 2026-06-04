import { describe, expect, it } from "vitest";

import {
  auditWebinarGhostKitchensDoc,
  lintWebinarGhostKitchensCopy,
  totalWebinarGhostKitchensRunOfShowMin,
  totalWebinarGhostKitchensStoryDurationSec,
  WEBINAR_GHOST_KITCHENS_DEMO_ROUTES,
  WEBINAR_GHOST_KITCHENS_ONE_LINE_PITCH,
  WEBINAR_GHOST_KITCHENS_POLICY_ID,
  WEBINAR_GHOST_KITCHENS_PRIMARY_CTA,
  WEBINAR_GHOST_KITCHENS_RUN_OF_SHOW,
  WEBINAR_GHOST_KITCHENS_UTM_CAMPAIGN,
} from "@/lib/marketing/webinar-ghost-kitchens-policy";

describe("webinar ghost kitchens policy (MKT-18)", () => {
  it("locks MKT-18 policy id and 45-minute run-of-show", () => {
    expect(WEBINAR_GHOST_KITCHENS_POLICY_ID).toBe("webinar-ghost-kitchens-mkt18-v1");
    expect(WEBINAR_GHOST_KITCHENS_RUN_OF_SHOW).toHaveLength(8);
    expect(totalWebinarGhostKitchensRunOfShowMin()).toBe(45);
    expect(totalWebinarGhostKitchensStoryDurationSec()).toBe(120);
    expect(WEBINAR_GHOST_KITCHENS_ONE_LINE_PITCH).toContain("virtual brands");
  });

  it("maps ghost kitchen demo routes and UTM campaign", () => {
    expect(WEBINAR_GHOST_KITCHENS_DEMO_ROUTES).toContain("/dashboard/kitchen");
    expect(WEBINAR_GHOST_KITCHENS_DEMO_ROUTES).toHaveLength(4);
    expect(WEBINAR_GHOST_KITCHENS_PRIMARY_CTA.href).toContain(WEBINAR_GHOST_KITCHENS_UTM_CAMPAIGN);
  });

  it("passes audit on canonical ghost kitchen webinar doc", () => {
    const audit = auditWebinarGhostKitchensDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden aggregator and scale claims", () => {
    const result = lintWebinarGhostKitchensCopy(
      "Trusted by thousands of ghost kitchens — Uber Eats official partner with Deliverect parity and SOC 2 certified.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest design partner webinar copy", () => {
    const result = lintWebinarGhostKitchensCopy(
      "Ghost kitchen design partner session — BETA integrations until staging smoke PASS.",
    );
    expect(result.passed).toBe(true);
  });
});
