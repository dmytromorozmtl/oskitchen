import { describe, expect, it } from "vitest";

import { buildImplementationPilotSsoFocusFromView } from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  buildGoLiveSecondarySignalsSummary,
  goLiveReadinessProgressTone,
  goLiveSecondarySignalsSummaryLabel,
  shouldCollapseGoLiveSecondaryStrips,
} from "@/lib/go-live/go-live-command-center-focus-era18";
import {
  GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_BACKLOG_ID,
  GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_POLICY_ID,
  GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_PROOF_STATUS,
  GO_LIVE_SECONDARY_SIGNALS_ANCHOR,
} from "@/lib/go-live/go-live-command-center-focus-era18-policy";
import { buildGoLiveFocusSnapshot } from "@/lib/go-live/go-live-focus-era18";
import type { GoLiveProjectNextStepHero } from "@/lib/go-live/go-live-project-next-step-focus-era18";
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
    approvalsCount: 2,
    approvalsRequired: 5,
    externalCertificationRequired: true,
    externalTargetProviderCount: 1,
    externalCertifiedProviderCount: 0,
    externalMissingProviderCount: 1,
    externalMissingProviderLabels: ["WooCommerce"],
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

const hero: GoLiveProjectNextStepHero = {
  kind: "blocker",
  title: "Integration certification incomplete",
  detail: "Certify WooCommerce before launch.",
  href: "/dashboard/integrations/health",
  ctaLabel: "Fix blocker",
  tone: "urgent",
  readinessScore: 55,
};

describe("go-live-command-center-focus-era18 policy", () => {
  it("registers era18 command center progress collapse proof", () => {
    expect(GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_POLICY_ID).toBe("era18-go-live-command-center-focus-v1");
    expect(GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_PROOF_STATUS).toBe(
      "go_live_command_center_progress_collapse_wired",
    );
    expect(GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-060");
    expect(GO_LIVE_SECONDARY_SIGNALS_ANCHOR).toBe("#go-live-secondary-signals");
  });
});

describe("goLiveReadinessProgressTone", () => {
  it("maps readiness score bands", () => {
    expect(goLiveReadinessProgressTone(90)).toBe("success");
    expect(goLiveReadinessProgressTone(70)).toBe("caution");
    expect(goLiveReadinessProgressTone(40)).toBe("urgent");
  });
});

describe("shouldCollapseGoLiveSecondaryStrips", () => {
  it("collapses when next-step hero is active", () => {
    expect(shouldCollapseGoLiveSecondaryStrips(hero)).toBe(true);
    expect(shouldCollapseGoLiveSecondaryStrips(null)).toBe(false);
  });
});

describe("buildGoLiveSecondarySignalsSummary", () => {
  it("counts pilot and launch signals", () => {
    const validation = validateLaunch(baseInputs(), { status: "IN_PROGRESS" });
    const focus = buildGoLiveFocusSnapshot(validation, 3);
    const summary = buildGoLiveSecondarySignalsSummary({
      pilotReadiness: {
        channelLiveProofSlices: [],
        pilotSso: buildImplementationPilotSsoFocusFromView({
          entitlementEnabled: true,
          configured: false,
          active: false,
          workspaceId: "ws-1",
        }),
        goLive: { projectId: "proj-1", validation, approvalsPending: 3 },
      },
      focus,
      blockers: validation.blockers as LaunchBlocker[],
    });

    expect(summary.totalSignalCount).toBeGreaterThan(0);
    expect(goLiveSecondarySignalsSummaryLabel(summary)).toContain("signal");
  });
});
