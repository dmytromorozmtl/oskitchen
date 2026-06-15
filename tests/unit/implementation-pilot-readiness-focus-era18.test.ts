import { describe, expect, it } from "vitest";

import {
  IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID,
  IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_POLICY_ID,
  IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18-policy";
import {
  buildImplementationPilotSsoFocusFromView,
  pickImplementationPilotReadinessAttentionItems,
  summarizeImplementationPilotReadiness,
  type ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import {
  evaluateChannelLiveProofOperatorStatus,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { type IntegrationHealthCard } from "@/lib/integrations/integration-health-focus-era18";
import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import { GO_LIVE_SSO_PILOT_BLOCKER_KEY } from "@/lib/go-live/go-live-sso-pilot-focus-era18-policy";
import { detectGoLiveSsoPilotBlocker } from "@/lib/go-live/go-live-sso-pilot-focus-era18";
import { detectGoLiveChannelPilotBlockers } from "@/lib/go-live/go-live-channel-pilot-focus-era18";
import type { ValidationReport } from "@/lib/go-live/launch-validator";

function card(over: Partial<IntegrationHealthCard> = {}): IntegrationHealthCard {
  return {
    id: "c1",
    provider: "WOOCOMMERCE",
    name: "Pilot Woo",
    status: "CONNECTED",
    lastSyncAt: new Date("2026-05-28T10:00:00Z"),
    lastError: null,
    hasWebhookSecret: true,
    ...over,
  };
}

function slice(over: Partial<ChannelPilotLiveProofSlice> = {}): ChannelPilotLiveProofSlice {
  const progress = evaluateChannelPilotSetupProgress({
    provider: "woocommerce",
    hasConnection: true,
    hasCredentials: true,
    hasWebhookSecret: false,
    hasStoreIdentity: true,
    certification: null,
  });
  const baseCard = card();
  return {
    provider: "WOOCOMMERCE",
    card: baseCard,
    progress,
    operatorStatus: evaluateChannelLiveProofOperatorStatus({ card: baseCard, progress }),
    ...over,
  };
}

function emptyModel(over: Partial<ImplementationPilotReadinessModel> = {}): ImplementationPilotReadinessModel {
  return {
    channelLiveProofSlices: [],
    pilotSso: buildImplementationPilotSsoFocusFromView({
      entitlementEnabled: false,
      configured: false,
      active: false,
      workspaceId: null,
    }),
    goLive: {
      projectId: null,
      validation: null,
      approvalsPending: 0,
    },
    ...over,
  };
}

function validationWithBlockers(blockers: ValidationReport["blockers"]): ValidationReport {
  return {
    blockers,
    readiness: {
      score: 40,
      signals: [],
      requiredSignals: [],
    },
    canApprove: false,
    recommendedStatus: "NOT_STARTED",
    riskLevel: "HIGH",
    reasons: [],
  };
}

describe("implementation-pilot-readiness-focus-era18 policy", () => {
  it("registers era18 implementation pilot readiness proof", () => {
    expect(IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-implementation-pilot-readiness-focus-v1",
    );
    expect(IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS).toBe(
      "implementation_pilot_readiness_attention_wired",
    );
    expect(IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-051");
  });
});

describe("pickImplementationPilotReadinessAttentionItems", () => {
  it("surfaces SSO pilot setup when entitled and inactive", () => {
    const items = pickImplementationPilotReadinessAttentionItems(
      emptyModel({
        pilotSso: buildImplementationPilotSsoFocusFromView({
          entitlementEnabled: true,
          configured: false,
          active: false,
          workspaceId: "ws-1",
        }),
      }),
    );

    expect(items.some((item) => item.id === "configure-sso-pilot")).toBe(true);
    expect(items[0]?.category).toBe("sso");
    expect(items[0]?.tone).toBe("urgent");
  });

  it("surfaces incomplete Woo pilot wizard from live proof slices", () => {
    const items = pickImplementationPilotReadinessAttentionItems(
      emptyModel({ channelLiveProofSlices: [slice()] }),
    );

    expect(items.some((item) => item.id === "woocommerce-pilot-setup")).toBe(true);
    expect(items.find((item) => item.id === "woocommerce-pilot-setup")?.category).toBe("channel");
  });

  it("dedupes SSO go-live blocker when SSO attention already shown", () => {
    const ssoInputs = {
      ssoOidcEntitlementEnabled: true,
      ssoPilotConfigured: false,
      ssoPilotActive: false,
    };
    const ssoBlocker = detectGoLiveSsoPilotBlocker(ssoInputs);
    const validation = validationWithBlockers(ssoBlocker ? [ssoBlocker] : []);

    expect(ssoBlocker?.key).toBe(GO_LIVE_SSO_PILOT_BLOCKER_KEY);

    const items = pickImplementationPilotReadinessAttentionItems(
      emptyModel({
        pilotSso: buildImplementationPilotSsoFocusFromView({
          entitlementEnabled: true,
          configured: false,
          active: false,
          workspaceId: "ws-1",
        }),
        goLive: {
          projectId: "proj-1",
          validation,
          approvalsPending: 5,
        },
      }),
    );

    expect(items.some((item) => item.id === "configure-sso-pilot")).toBe(true);
    expect(items.some((item) => item.id === `go-live-${GO_LIVE_SSO_PILOT_BLOCKER_KEY}`)).toBe(false);
  });

  it("surfaces go-live channel pilot blockers with actionable href", () => {
    const channelSlices = [slice()];
    const blockers = detectGoLiveChannelPilotBlockers({ channelPilotLiveProofSlices: channelSlices });
    const validation = validationWithBlockers(blockers);

    expect(blockers.length).toBeGreaterThan(0);

    const items = pickImplementationPilotReadinessAttentionItems(
      emptyModel({
        goLive: {
          projectId: "proj-42",
          validation,
          approvalsPending: 0,
        },
      }),
    );

    const goLiveItem = items.find((item) => item.category === "go-live");
    expect(goLiveItem).toBeDefined();
    expect(goLiveItem?.title.toLowerCase()).toContain("pilot");
    expect(goLiveItem?.href.startsWith("/dashboard/")).toBe(true);
  });

  it("returns empty when no pilot signals exist", () => {
    const items = pickImplementationPilotReadinessAttentionItems(emptyModel());
    expect(items).toEqual([]);
    expect(summarizeImplementationPilotReadiness(items).totalSignals).toBe(0);
  });
});
