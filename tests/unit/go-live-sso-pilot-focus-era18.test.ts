import { describe, expect, it } from "vitest";

import { detectBlockers } from "@/lib/go-live/blocker-engine";
import {
  GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR,
  GO_LIVE_SSO_PILOT_BLOCKER_KEY,
  GO_LIVE_SSO_PILOT_CONFIGURATION_ANCHOR,
  GO_LIVE_SSO_PILOT_FOCUS_ERA18_BACKLOG_ID,
  GO_LIVE_SSO_PILOT_FOCUS_ERA18_POLICY_ID,
  GO_LIVE_SSO_PILOT_FOCUS_ERA18_PROOF_STATUS,
  GO_LIVE_SSO_PILOT_SETTINGS_ROUTE,
} from "@/lib/go-live/go-live-sso-pilot-focus-era18-policy";
import {
  detectGoLiveSsoPilotBlocker,
  goLiveSsoPilotActionRoute,
  resolveGoLiveSsoPilotBlockerRowNextAction,
} from "@/lib/go-live/go-live-sso-pilot-focus-era18";
import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import { calculateReadiness } from "@/lib/go-live/readiness-engine";
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
    externalCertificationRequired: false,
    externalTargetProviderCount: 0,
    externalCertifiedProviderCount: 0,
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

describe("go-live-sso-pilot-focus-era18 policy", () => {
  it("registers era18 go-live SSO pilot gate proof", () => {
    expect(GO_LIVE_SSO_PILOT_FOCUS_ERA18_POLICY_ID).toBe("era18-go-live-sso-pilot-focus-v1");
    expect(GO_LIVE_SSO_PILOT_FOCUS_ERA18_PROOF_STATUS).toBe("go_live_sso_pilot_gate_wired");
    expect(GO_LIVE_SSO_PILOT_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-045");
  });
});

describe("detectGoLiveSsoPilotBlocker", () => {
  it("returns HIGH_RISK blocker when entitled but SSO pilot is not configured", () => {
    const blocker = detectGoLiveSsoPilotBlocker({
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: false,
      ssoPilotActive: false,
    });

    expect(blocker?.key).toBe(GO_LIVE_SSO_PILOT_BLOCKER_KEY);
    expect(blocker?.severity).toBe("HIGH_RISK");
    expect(blocker?.stage).toBe("STAFF_TRAINING");
    expect(blocker?.actionRoute).toBe(
      `${GO_LIVE_SSO_PILOT_SETTINGS_ROUTE}${GO_LIVE_SSO_PILOT_CONFIGURATION_ANCHOR}`,
    );
  });

  it("routes configured-but-inactive pilots to activation anchor", () => {
    const blocker = detectGoLiveSsoPilotBlocker({
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: true,
      ssoPilotActive: false,
    });

    expect(blocker?.title).toContain("not activated");
    expect(blocker?.actionRoute).toBe(
      `${GO_LIVE_SSO_PILOT_SETTINGS_ROUTE}${GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR}`,
    );
  });

  it("returns null when entitlement is absent or pilot is active", () => {
    expect(
      detectGoLiveSsoPilotBlocker({
        ssoOidcEntitlementEnabled: false,
        ssoPilotConfigured: false,
        ssoPilotActive: false,
      }),
    ).toBeNull();
    expect(
      detectGoLiveSsoPilotBlocker({
        ssoOidcEntitlementEnabled: true,
        ssoPilotConfigured: true,
        ssoPilotActive: true,
      }),
    ).toBeNull();
  });
});

describe("go-live SSO pilot launch validation", () => {
  it("adds required readiness signal and HIGH_RISK blocker when entitled but inactive", () => {
    const inputs: ReadinessInputs = {
      ...baseInputs(),
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: false,
      ssoPilotActive: false,
    };

    const readiness = calculateReadiness(inputs, "RESTAURANT");
    expect(readiness.required.missing.some((signal) => signal.key === "sso_pilot_active")).toBe(true);

    const blockers = detectBlockers(inputs);
    expect(blockers.some((blocker) => blocker.key === GO_LIVE_SSO_PILOT_BLOCKER_KEY)).toBe(true);

    const report = validateLaunch(inputs, "RESTAURANT", "IN_PROGRESS");
    expect(report.canApprove).toBe(false);
    expect(report.reasons.some((reason) => reason.includes("required readiness"))).toBe(true);
  });

  it("clears SSO gate when pilot is active", () => {
    const inputs: ReadinessInputs = {
      ...baseInputs(),
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: true,
      ssoPilotActive: true,
    };

    const report = validateLaunch(inputs, "RESTAURANT", "IN_PROGRESS");
    expect(report.blockers.some((blocker) => blocker.key === GO_LIVE_SSO_PILOT_BLOCKER_KEY)).toBe(
      false,
    );
    expect(report.readiness.required.missing.some((signal) => signal.key === "sso_pilot_active")).toBe(
      false,
    );
  });
});

describe("resolveGoLiveSsoPilotBlockerRowNextAction", () => {
  it("maps configuration blocker to wizard CTA", () => {
    const blocker = detectGoLiveSsoPilotBlocker({
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: false,
      ssoPilotActive: false,
    })!;

    const action = resolveGoLiveSsoPilotBlockerRowNextAction(blocker);
    expect(action?.label).toBe("Open SSO pilot wizard");
    expect(action?.tone).toBe("urgent");
  });

  it("maps activation blocker through go-live focus resolver", () => {
    const blocker = detectGoLiveSsoPilotBlocker({
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: true,
      ssoPilotActive: false,
    })!;

    const action = resolveGoLiveBlockerRowNextAction(blocker);
    expect(action?.label).toBe("Activate SSO pilot");
    expect(action?.href).toBe(goLiveSsoPilotActionRoute(true));
  });
});
