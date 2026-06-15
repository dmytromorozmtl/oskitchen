import { describe, expect, it } from "vitest";

import {
  ANALYST_BRIEFING_MIN_ENTERPRISE_INTEREST,
  ANALYST_BRIEFING_SLIDES,
  auditAnalystBriefingDeckDoc,
  isAnalystBriefingDeckDistributable,
  lintAnalystBriefingDeckCopy,
  qualifiesEnterpriseInterest,
  ANALYST_BRIEFING_DECK_POLICY_ID,
} from "@/lib/marketing/analyst-briefing-deck-policy";

describe("analyst briefing deck policy (MKT-35)", () => {
  it("locks MKT-35 policy id and 12-slide AB outline", () => {
    expect(ANALYST_BRIEFING_DECK_POLICY_ID).toBe("analyst-briefing-deck-mkt35-v1");
    expect(ANALYST_BRIEFING_SLIDES).toHaveLength(12);
    expect(ANALYST_BRIEFING_MIN_ENTERPRISE_INTEREST).toBe(1);
  });

  it("requires enterprise interest and founder approval to distribute", () => {
    expect(isAnalystBriefingDeckDistributable(0, true)).toBe(false);
    expect(isAnalystBriefingDeckDistributable(1, false)).toBe(false);
    expect(isAnalystBriefingDeckDistributable(1, true)).toBe(true);
  });

  it("qualifies enterprise interest signal types", () => {
    expect(qualifiesEnterpriseInterest("security questionnaire SIG Lite")).toBe(true);
    expect(qualifiesEnterpriseInterest("random press blogger")).toBe(false);
  });

  it("passes audit on canonical analyst briefing deck doc", () => {
    const audit = auditAnalystBriefingDeckDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.slideCount).toBe(12);
  });

  it("flags forbidden analyst briefing claims", () => {
    const result = lintAnalystBriefingDeckCopy(
      "Thousands of customers with SOC 2 Type II certified enterprise-ready day one and Series A metrics.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest analyst briefing copy", () => {
    const result = lintAnalystBriefingDeckCopy(
      "Internal draft: 0 LIVE integrations, SSO pilot foundation, Integration Health SKIPPED rows on /trust.",
    );
    expect(result.passed).toBe(true);
  });
});
