import { describe, expect, it } from "vitest";

import {
  evaluatePilotContractReadiness,
  evaluatePilotIcpQualification,
  formatPilotIcpQualificationReport,
} from "@/lib/commercial/pilot-icp-contract-era17";

describe("pilot icp contract era17", () => {
  it("qualifies ideal pilot prospect", () => {
    const result = evaluatePilotIcpQualification({
      singleOrSmallMultiUnit: true,
      ownerOperatorEngaged: true,
      needsCoreKitchenOrderPath: true,
      acceptsQualifiedBetaLabels: true,
    });
    expect(result.qualified).toBe(true);
    expect(formatPilotIcpQualificationReport(result)).toContain("QUALIFIED");
  });

  it("disqualifies production SSO requirement", () => {
    const result = evaluatePilotIcpQualification({
      singleOrSmallMultiUnit: true,
      ownerOperatorEngaged: true,
      needsCoreKitchenOrderPath: true,
      acceptsQualifiedBetaLabels: true,
      requiresProductionSso: true,
    });
    expect(result.qualified).toBe(false);
    expect(result.disqualifiers.length).toBeGreaterThan(0);
  });

  it("evaluates contract readiness for legal review", () => {
    expect(
      evaluatePilotContractReadiness({
        icpQualified: true,
        forbiddenClaimsInContract: false,
        supportBoundariesAcknowledged: true,
        rollbackPlanAcknowledged: true,
        successMetricsDefined: true,
        durationDays: 90,
      }).readyForLegalReview,
    ).toBe(true);
    expect(
      evaluatePilotContractReadiness({
        icpQualified: false,
        forbiddenClaimsInContract: false,
        supportBoundariesAcknowledged: true,
        rollbackPlanAcknowledged: true,
        successMetricsDefined: true,
      }).blockers,
    ).toContain("Prospect fails Era 17 pilot ICP qualification");
  });
});
