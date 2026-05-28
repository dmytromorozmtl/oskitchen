import { describe, expect, it } from "vitest";

import { detectBlockers } from "@/lib/go-live/blocker-engine";
import {
  GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX,
  GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_BACKLOG_ID,
  GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_POLICY_ID,
  GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_PROOF_STATUS,
  GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX,
} from "@/lib/go-live/go-live-channel-pilot-focus-era18-policy";
import {
  detectGoLiveChannelPilotBlockers,
  resolveGoLiveChannelPilotBlockerRowNextAction,
  resolveGoLiveExternalIntegrationsBlockerRowNextAction,
} from "@/lib/go-live/go-live-channel-pilot-focus-era18";
import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import { calculateReadiness } from "@/lib/go-live/readiness-engine";
import { validateLaunch } from "@/lib/go-live/launch-validator";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";
import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";

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

function incompleteSlice(): ChannelPilotLiveProofSlice {
  const progress = evaluateChannelPilotSetupProgress({
    provider: "woocommerce",
    hasConnection: true,
    hasCredentials: true,
    hasWebhookSecret: true,
    hasStoreIdentity: true,
    certification: null,
  });

  return {
    provider: "WOOCOMMERCE",
    card: {
      id: "c1",
      provider: "WOOCOMMERCE",
      name: "Pilot Woo",
      status: "CONNECTED",
      lastSyncAt: new Date("2026-05-28T11:00:00.000Z"),
      lastError: null,
      hasWebhookSecret: true,
    },
    progress,
    operatorStatus: "wizard_incomplete",
  };
}

describe("go-live-channel-pilot-focus-era18 policy", () => {
  it("registers era18 go-live channel pilot gate proof", () => {
    expect(GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_POLICY_ID).toBe("era18-go-live-channel-pilot-focus-v1");
    expect(GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_PROOF_STATUS).toBe("go_live_channel_pilot_gate_wired");
    expect(GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-049");
  });
});

describe("detectGoLiveChannelPilotBlockers", () => {
  it("returns HIGH_RISK blocker when connected Woo pilot wizard is incomplete", () => {
    const blockers = detectGoLiveChannelPilotBlockers({
      channelPilotLiveProofSlices: [incompleteSlice()],
    });

    expect(blockers[0]?.key).toBe(`${GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX}woocommerce`);
    expect(blockers[0]?.severity).toBe("HIGH_RISK");
  });

  it("returns WARNING when in-app pilot is ready but engineering live smoke is pending", () => {
    const blockers = detectGoLiveChannelPilotBlockers({
      channelPilotLiveProofSlices: [
        {
          ...incompleteSlice(),
          operatorStatus: "awaiting_engineering_live_smoke",
          progress: evaluateChannelPilotSetupProgress({
            provider: "woocommerce",
            hasConnection: true,
            hasCredentials: true,
            hasWebhookSecret: true,
            hasStoreIdentity: true,
            certification: {
              provider: "woocommerce",
              lastRunAt: "2026-05-28T12:00:00.000Z",
              overall: "PASS",
              checks: [
                {
                  id: "rest_api_reachable",
                  label: "REST API reachable",
                  status: "pass",
                  message: "ok",
                },
                {
                  id: "recent_valid_webhooks",
                  label: "Recent valid webhooks",
                  status: "pass",
                  message: "ok",
                },
              ],
              productStatus: "BETA",
            },
          }),
        },
      ],
    });

    expect(blockers[0]?.key).toBe(`${GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX}woocommerce`);
    expect(blockers[0]?.severity).toBe("WARNING");
  });
});

describe("go-live channel pilot launch validation", () => {
  it("adds required readiness signal and HIGH_RISK blocker for incomplete connected pilots", () => {
    const inputs: ReadinessInputs = {
      ...baseInputs(),
      channelPilotLiveProofSlices: [incompleteSlice()],
    };

    const readiness = calculateReadiness(inputs, "GHOST_KITCHEN");
    expect(
      readiness.required.missing.some((signal) => signal.key === "channel_pilot_in_app_ready"),
    ).toBe(true);

    const blockers = detectBlockers(inputs);
    expect(
      blockers.some((blocker) => blocker.key === `${GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX}woocommerce`),
    ).toBe(true);

    const report = validateLaunch(inputs, "GHOST_KITCHEN", "IN_PROGRESS");
    expect(report.canApprove).toBe(false);
  });
});

describe("resolveGoLiveChannelPilotBlockerRowNextAction", () => {
  it("routes incomplete pilot blockers to wizard CTA", () => {
    const blocker = detectGoLiveChannelPilotBlockers({
      channelPilotLiveProofSlices: [incompleteSlice()],
    })[0]!;

    const action = resolveGoLiveChannelPilotBlockerRowNextAction(blocker);
    expect(action?.label).toBe("Continue pilot setup");
    expect(action?.href).toContain("/dashboard/integrations/woocommerce");
  });

  it("routes external integration blockers to live proof panel when no connected slice match", () => {
    const action = resolveGoLiveExternalIntegrationsBlockerRowNextAction(
      {
        key: "external_integrations_uncertified",
        severity: "CRITICAL",
        stage: "CHANNEL_INTEGRATIONS",
        title: "External integrations are not certified",
        impact: "test",
        resolution: "test",
        actionRoute: "/dashboard/integrations/health",
        detail: "Shopify",
      },
      [],
    );

    expect(action?.label).toBe("Open live proof panel");
    expect(action?.href).toContain("#channel-live-proof");
  });

  it("maps external integration blockers through go-live focus resolver", () => {
    const blocker = detectGoLiveChannelPilotBlockers({
      channelPilotLiveProofSlices: [incompleteSlice()],
    })[0]!;

    const action = resolveGoLiveBlockerRowNextAction(blocker, {
      channelPilotLiveProofSlices: [incompleteSlice()],
    });
    expect(action?.label).toBe("Continue pilot setup");
  });
});
