import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_HONEST_SCOPE,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
} from "@/lib/api-public/public-api-partner-confidence-era16-policy";
import {
  PUBLIC_API_PARTNER_CHECKLIST,
  PUBLIC_API_STANDARD_ERRORS,
  buildPublicApiPartnerConfidenceSummary,
  evaluatePublicApiPartnerReadiness,
  validatePublicApiPartnerConfidenceStructure,
} from "@/lib/api-public/public-api-partner-confidence-pack";

describe("public API partner confidence pack", () => {
  it("locks era16 partner confidence policy id", () => {
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID).toBe(
      "era16-public-api-partner-confidence-v1",
    );
  });

  it("does not claim production SLA or unlimited rate limits", () => {
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_HONEST_SCOPE.claimsProductionSla).toBe(false);
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_HONEST_SCOPE.claimsUnlimitedRateLimits).toBe(false);
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_HONEST_SCOPE.v1ResourceCount).toBe(8);
  });

  it("validates pack structure", () => {
    expect(validatePublicApiPartnerConfidenceStructure().ok).toBe(true);
  });

  it("returns NOT_READY when contract tests fail", () => {
    const result = evaluatePublicApiPartnerReadiness({
      contractTestsPass: false,
      wiringCertPass: true,
      partnerConfidenceCertPass: true,
    });
    expect(result.decision).toBe("NOT_READY");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("returns CONDITIONAL when live smoke skipped", () => {
    const result = evaluatePublicApiPartnerReadiness({
      contractTestsPass: true,
      wiringCertPass: true,
      partnerConfidenceCertPass: true,
      liveSmokeSkipped: true,
    });
    expect(result.decision).toBe("CONDITIONAL");
    expect(result.warnings.some((warning) => warning.includes("skipped"))).toBe(true);
  });

  it("builds summary with standard errors and checklist", () => {
    const summary = buildPublicApiPartnerConfidenceSummary();
    expect(summary.resourceCount).toBe(8);
    expect(summary.standardErrors.length).toBe(PUBLIC_API_STANDARD_ERRORS.length);
    expect(summary.partnerChecklistCount).toBe(PUBLIC_API_PARTNER_CHECKLIST.length);
    expect(summary.forbiddenClaimCount).toBe(
      PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS.length,
    );
  });
});
