import { describe, expect, it } from "vitest";

import {
  auditPressReleaseFirstDesignPartnerDoc,
  lintPressReleaseFirstDesignPartnerCopy,
  PRESS_RELEASE_FIRST_DESIGN_PARTNER_POLICY_ID,
  PRESS_RELEASE_HEADLINE_OPTIONS,
  PRESS_RELEASE_LOI_SKU,
  PRESS_RELEASE_PUBLISH_GATES,
} from "@/lib/marketing/press-release-first-design-partner-policy";

describe("press release first design partner policy (MKT-29)", () => {
  it("locks MKT-29 policy id, LOI SKU, and publish gates", () => {
    expect(PRESS_RELEASE_FIRST_DESIGN_PARTNER_POLICY_ID).toBe(
      "press-release-first-design-partner-mkt29-v1",
    );
    expect(PRESS_RELEASE_LOI_SKU).toBe("LOI-DP-001");
    expect(PRESS_RELEASE_PUBLISH_GATES.length).toBeGreaterThanOrEqual(5);
    expect(PRESS_RELEASE_HEADLINE_OPTIONS).toEqual(["H1", "H2", "H3"]);
  });

  it("passes audit on canonical press release doc", () => {
    const audit = auditPressReleaseFirstDesignPartnerDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.headlineCount).toBe(3);
  });

  it("flags forbidden press release claims", () => {
    const result = lintPressReleaseFirstDesignPartnerCopy(
      "OS Kitchen serves thousands of restaurants with production-certified live nationwide integrations and SOC 2 certified enterprise-ready day one.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest design-partner press copy", () => {
    const result = lintPressReleaseFirstDesignPartnerCopy(
      "Non-binding LOI-DP-001 design partner pilot with BETA modules and honest SKIPPED integration labels.",
    );
    expect(result.passed).toBe(true);
  });
});
