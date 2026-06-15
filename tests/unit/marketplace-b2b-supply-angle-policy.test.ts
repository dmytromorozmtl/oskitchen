import { describe, expect, it } from "vitest";

import {
  auditMarketplaceB2bSupplyAngleDoc,
  lintMarketplaceB2bSupplyAngleCopy,
  MARKETPLACE_B2B_SUPPLY_ANGLE_POLICY_ID,
  MARKETPLACE_B2B_SUPPLY_ONE_LINE_PITCH,
  MARKETPLACE_B2B_SUPPLY_ROUTES,
  MARKETPLACE_B2B_SUPPLY_STORY_BEATS,
  totalMarketplaceB2bSupplyStoryDurationSec,
} from "@/lib/marketing/marketplace-b2b-supply-angle-policy";

describe("marketplace B2B supply angle policy (MKT-16)", () => {
  it("locks MKT-16 policy id and 2-minute B2B supply story arc", () => {
    expect(MARKETPLACE_B2B_SUPPLY_ANGLE_POLICY_ID).toBe(
      "marketplace-b2b-supply-angle-mkt16-v1",
    );
    expect(MARKETPLACE_B2B_SUPPLY_STORY_BEATS).toHaveLength(5);
    expect(totalMarketplaceB2bSupplyStoryDurationSec()).toBe(120);
    expect(MARKETPLACE_B2B_SUPPLY_ONE_LINE_PITCH).toContain("B2B");
  });

  it("maps three buyer-facing marketplace routes", () => {
    expect(MARKETPLACE_B2B_SUPPLY_ROUTES).toContain("/dashboard/marketplace/catalog");
    expect(MARKETPLACE_B2B_SUPPLY_ROUTES).toHaveLength(3);
  });

  it("passes audit on canonical B2B supply angle doc", () => {
    const audit = auditMarketplaceB2bSupplyAngleDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden marketplace scale claims in copy", () => {
    const result = lintMarketplaceB2bSupplyAngleCopy(
      "Join our national marketplace network live with thousands of vendors — Faire parity and guaranteed GMV.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest qualified beta supply copy", () => {
    const result = lintMarketplaceB2bSupplyAngleCopy(
      "HoReCa B2B catalog in qualified beta — founding vendors onboarded on staging before external PO proof.",
    );
    expect(result.passed).toBe(true);
  });
});
