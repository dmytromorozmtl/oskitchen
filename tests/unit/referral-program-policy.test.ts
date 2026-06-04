import { describe, expect, it } from "vitest";

import {
  auditReferralProgramDoc,
  calculatePortfolioNps,
  getReferralGtmTierByRefereeCount,
  isReferralProgramGtmEnabled,
  lintReferralProgramCopy,
  REFERRAL_PROGRAM_GTM_STATUS,
  REFERRAL_PROGRAM_MIN_NPS,
  REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS,
  REFERRAL_PROGRAM_POLICY_ID,
} from "@/lib/marketing/referral-program-policy";

describe("referral program policy (MKT-32)", () => {
  it("locks MKT-32 policy id, NPS gate, and PRE-LAUNCH GTM status", () => {
    expect(REFERRAL_PROGRAM_POLICY_ID).toBe("referral-program-mkt32-v1");
    expect(REFERRAL_PROGRAM_MIN_NPS).toBe(40);
    expect(REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS).toBe(3);
    expect(REFERRAL_PROGRAM_GTM_STATUS).toBe("PRE-LAUNCH");
  });

  it("enables referral GTM only at NPS ≥40 with ≥3 pilot surveys", () => {
    expect(isReferralProgramGtmEnabled(null, 3)).toBe(false);
    expect(isReferralProgramGtmEnabled(39, 3)).toBe(false);
    expect(isReferralProgramGtmEnabled(40, 2)).toBe(false);
    expect(isReferralProgramGtmEnabled(40, 3)).toBe(true);
    expect(isReferralProgramGtmEnabled(67, 5)).toBe(true);
  });

  it("calculates portfolio NPS from promoter/detractor counts", () => {
    expect(calculatePortfolioNps(2, 0, 3)).toBe(67);
    expect(calculatePortfolioNps(0, 0, 0)).toBeNull();
  });

  it("passes audit on canonical referral program doc", () => {
    const audit = auditReferralProgramDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.npsThresholdDocumented).toBe(true);
  });

  it("maps referee count to GTM tier", () => {
    expect(getReferralGtmTierByRefereeCount(1)).toBe("Starter");
    expect(getReferralGtmTierByRefereeCount(3)).toBe("Advocate");
    expect(getReferralGtmTierByRefereeCount(5)).toBe("Champion");
  });

  it("flags forbidden referral program claims", () => {
    const result = lintReferralProgramCopy(
      "Unlimited free months for thousands of operators — guaranteed income affiliate pyramid.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest PRE-LAUNCH referral copy", () => {
    const result = lintReferralProgramCopy(
      "Owner referral link BETA in-app; public GTM PRE-LAUNCH until portfolio NPS ≥40 from 3 pilots.",
    );
    expect(result.passed).toBe(true);
  });
});
