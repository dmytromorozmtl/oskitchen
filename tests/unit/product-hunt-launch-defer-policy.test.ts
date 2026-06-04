import { describe, expect, it } from "vitest";

import {
  auditProductHuntLaunchDeferDoc,
  isProductHuntLaunchAllowed,
  lintProductHuntLaunchDeferCopy,
  PRODUCT_HUNT_LAUNCH_DECISION,
  PRODUCT_HUNT_LAUNCH_DEFER_POLICY_ID,
  PRODUCT_HUNT_MIN_PILOTS_REQUIRED,
} from "@/lib/marketing/product-hunt-launch-defer-policy";

describe("Product Hunt launch defer policy (MKT-30)", () => {
  it("locks MKT-30 policy id, defer decision, and 3-pilot gate", () => {
    expect(PRODUCT_HUNT_LAUNCH_DEFER_POLICY_ID).toBe(
      "product-hunt-launch-defer-mkt30-v1",
    );
    expect(PRODUCT_HUNT_LAUNCH_DECISION).toBe("DEFER");
    expect(PRODUCT_HUNT_MIN_PILOTS_REQUIRED).toBe(3);
  });

  it("blocks PH launch until minimum pilots met", () => {
    expect(isProductHuntLaunchAllowed(0)).toBe(false);
    expect(isProductHuntLaunchAllowed(2)).toBe(false);
    expect(isProductHuntLaunchAllowed(3)).toBe(true);
  });

  it("passes audit on canonical Product Hunt defer doc", () => {
    const audit = auditProductHuntLaunchDeferDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.minPilotsDocumented).toBe(true);
    expect(audit.gateCount).toBeGreaterThanOrEqual(6);
  });

  it("flags forbidden Product Hunt launch copy", () => {
    const result = lintProductHuntLaunchDeferCopy(
      "The Toast killer with thousands of restaurants and all integrations live — enterprise-ready SOC 2 guaranteed ROI.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest deferred-launch copy", () => {
    const result = lintProductHuntLaunchDeferCopy(
      "DEFER Product Hunt until 3 design-partner pilots with honest BETA labels and /trust linked.",
    );
    expect(result.passed).toBe(true);
  });
});
