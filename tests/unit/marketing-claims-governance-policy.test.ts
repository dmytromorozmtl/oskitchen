import { describe, expect, it } from "vitest";

import {
  MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
  contextHasSafeQualifier,
  exitCodeForMarketingClaimViolations,
  findForbiddenPhraseViolations,
  findRoadmapTermViolations,
  scanMarketingText,
} from "@/lib/governance/marketing-claims-governance-policy";

describe("marketing claims governance policy", () => {
  it("locks era7 marketing claims governance policy", () => {
    expect(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID).toBe("era7-marketing-claims-governance-v1");
  });

  it("accepts roadmap terms with honest qualifiers", () => {
    expect(
      contextHasSafeQualifier("DoorDash native sync is not sold as live today — roadmap only"),
    ).toBe(true);
    expect(
      contextHasSafeQualifier("Stripe Terminal hardware is not integrated; see product page"),
    ).toBe(true);
    const violations = findRoadmapTermViolations(
      "Uber Eats / DoorDash native sync is not sold as live today.",
    );
    expect(violations).toHaveLength(0);
  });

  it("flags unqualified roadmap terms", () => {
    const violations = findRoadmapTermViolations("We offer live DoorDash integration today.");
    expect(violations.some((v) => v.termId === "doordash")).toBe(true);
    expect(exitCodeForMarketingClaimViolations(violations, false)).toBe(0);
    expect(exitCodeForMarketingClaimViolations(violations, true)).toBe(1);
  });

  it("fails on forbidden matrix-conflict phrases", () => {
    const violations = findForbiddenPhraseViolations(
      "OS Kitchen offers enterprise SSO included in every plan.",
    );
    expect(violations.length).toBeGreaterThan(0);
    expect(exitCodeForMarketingClaimViolations(violations, false)).toBe(1);
  });

  it("aggregates scan results", () => {
    const violations = scanMarketingText("rush-hour KDS certified for every site.");
    expect(violations[0]?.kind).toBe("forbidden");
  });
});
