import { describe, expect, it } from "vitest";

import { validateLaunch } from "@/lib/go-live/launch-validator";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

function baseInputs(): ReadinessInputs {
  return {
    hasBusinessProfile: true,
    hasFulfillmentRules: true,
    hasMenu: true,
    productCount: 12,
    mappedProductCount: 12,
    unmappedProductCount: 0,
    customerCount: 8,
    connectionsConnected: 1,
    connectionsBroken: 0,
    testOrderCount: 2,
    productionRuns: 2,
    packingTaskCount: 2,
    packingValidatedCount: 2,
    labelsPrinted: 5,
    deliveryRoutes: 1,
    staffActive: 5,
    trainingCompletions: 2,
    hasBilling: true,
    hasBackup: true,
    hasSupportContact: true,
    hasAnalytics: true,
    storefrontPublished: true,
    webhooksHealthy: true,
    approvalsCount: 5,
    approvalsRequired: 5,
    externalCertificationRequired: true,
    externalTargetProviderCount: 1,
    externalCertifiedProviderCount: 1,
    externalMissingProviderCount: 0,
    externalMissingProviderLabels: [],
    placeholderIntegrationScopeCount: 0,
    placeholderIntegrationScopeLabels: [],
    trainingProgramsActive: 1,
    trainingAssignmentsTotal: 1,
    trainingAssignmentsCompleted: 1,
    certificationsActive: 1,
    certificationsExpiringSoon: 0,
    staffHasOwner: true,
    staffHasManager: true,
    staffKitchen: 2,
    staffPackers: 1,
    staffDrivers: 1,
    staffShiftsToday: 2,
    billingStripeConfigured: true,
    billingPlanActive: true,
    billingHasCustomer: true,
    billingMode: "LIVE",
    billingTrialDaysRemaining: 0,
  };
}

describe("go-live launch validator", () => {
  it("blocks approval when an external provider is still uncertified", () => {
    const report = validateLaunch(
      {
        ...baseInputs(),
        externalCertifiedProviderCount: 0,
        externalMissingProviderCount: 1,
        externalMissingProviderLabels: ["Shopify"],
      },
      "GHOST_KITCHEN",
      "IN_PROGRESS",
    );

    expect(report.canApprove).toBe(false);
    expect(report.recommendedStatus).toBe("BLOCKED");
    expect(report.blockers.some((blocker) => blocker.key === "external_integrations_uncertified")).toBe(true);
  });

  it("keeps placeholder scope as a warning without blocking approval", () => {
    const report = validateLaunch(
      {
        ...baseInputs(),
        placeholderIntegrationScopeCount: 1,
        placeholderIntegrationScopeLabels: ["Uber Direct"],
      },
      "GHOST_KITCHEN",
      "IN_PROGRESS",
    );

    expect(report.canApprove).toBe(true);
    expect(report.recommendedStatus).toBe("APPROVED");
    expect(report.blockers.some((blocker) => blocker.key === "placeholder_integrations_in_scope")).toBe(true);
    expect(report.blockers.some((blocker) => blocker.severity === "CRITICAL")).toBe(false);
  });

  it("does not mark a high-score project ready when a required signal is still missing", () => {
    const report = validateLaunch(
      {
        ...baseInputs(),
        testOrderCount: 0,
      },
      "RESTAURANT",
      "IN_PROGRESS",
    );

    expect(report.readiness.score).toBeGreaterThanOrEqual(80);
    expect(report.readiness.required.missing.some((signal) => signal.key === "test_order")).toBe(true);
    expect(report.canApprove).toBe(false);
    expect(report.recommendedStatus).toBe("IN_PROGRESS");
  });

  it("blocks approval when enterprise SSO entitlement exists but pilot is inactive", () => {
    const report = validateLaunch(
      {
        ...baseInputs(),
        ssoOidcEntitlementEnabled: true,
        ssoPilotConfigured: true,
        ssoPilotActive: false,
      },
      "RESTAURANT",
      "IN_PROGRESS",
    );

    expect(report.canApprove).toBe(false);
    expect(report.blockers.some((blocker) => blocker.key === "sso_pilot_incomplete")).toBe(true);
    expect(report.readiness.required.missing.some((signal) => signal.key === "sso_pilot_active")).toBe(true);
  });
});
