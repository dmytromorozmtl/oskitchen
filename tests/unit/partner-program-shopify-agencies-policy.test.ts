import { describe, expect, it } from "vitest";

import {
  auditPartnerProgramShopifyAgenciesDoc,
  getPartnerTierByReferralCount,
  isPartnerProgramShopifyAgenciesEnabled,
  lintPartnerProgramShopifyAgenciesCopy,
  PARTNER_PROGRAM_SHOPIFY_AGENCIES_POLICY_ID,
  PARTNER_PROGRAM_STATUS,
  PARTNER_PROGRAM_TIERS,
} from "@/lib/marketing/partner-program-shopify-agencies-policy";

describe("Shopify agency partner program policy (MKT-31)", () => {
  it("locks MKT-31 policy id, PRE-LAUNCH status, and three tiers", () => {
    expect(PARTNER_PROGRAM_SHOPIFY_AGENCIES_POLICY_ID).toBe(
      "partner-program-shopify-agencies-mkt31-v1",
    );
    expect(PARTNER_PROGRAM_STATUS).toBe("PRE-LAUNCH");
    expect(PARTNER_PROGRAM_TIERS).toEqual(["Registered", "Certified", "Premier"]);
  });

  it("enables program only when Woo and Shopify live smokes both PASS", () => {
    expect(isPartnerProgramShopifyAgenciesEnabled(false, false)).toBe(false);
    expect(isPartnerProgramShopifyAgenciesEnabled(true, false)).toBe(false);
    expect(isPartnerProgramShopifyAgenciesEnabled(false, true)).toBe(false);
    expect(isPartnerProgramShopifyAgenciesEnabled(true, true)).toBe(true);
  });

  it("maps referral LOI count to partner tier", () => {
    expect(getPartnerTierByReferralCount(0)).toBe("Registered");
    expect(getPartnerTierByReferralCount(1)).toBe("Certified");
    expect(getPartnerTierByReferralCount(3)).toBe("Premier");
  });

  it("passes audit on canonical partner program doc", () => {
    const audit = auditPartnerProgramShopifyAgenciesDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.tierCount).toBe(3);
    expect(audit.criteriaDocumented).toBe(true);
  });

  it("flags forbidden partner program claims", () => {
    const result = lintPartnerProgramShopifyAgenciesCopy(
      "Official Shopify app with production-certified channel sync live for all tenants and guaranteed referral income.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest PRE-LAUNCH partner copy", () => {
    const result = lintPartnerProgramShopifyAgenciesCopy(
      "PRE-LAUNCH partner track until Woo and Shopify staging smokes PASS — honest BETA labels on /trust.",
    );
    expect(result.passed).toBe(true);
  });
});
