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
  collectPublicApiRateLimitSnapshot,
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

  it("collects partner-facing rate limits from the v1 registry", () => {
    const snapshot = collectPublicApiRateLimitSnapshot();
    expect(snapshot.public_api_v1_get).toEqual({ windowMs: 60_000, max: 120 });
    expect(snapshot.public_api_orders_get).toEqual({ windowMs: 60_000, max: 120 });
    expect(snapshot.public_api_orders_post).toEqual({ windowMs: 60_000, max: 120 });
    expect(snapshot.public_api_customers_get).toEqual({ windowMs: 60_000, max: 60 });
    expect(Object.keys(snapshot).sort()).toEqual(
      [
        "public_api_customers_get",
        "public_api_orders_get",
        "public_api_orders_post",
        "public_api_v1_get",
        "public_api_v1_post",
      ].sort(),
    );
  });
});
