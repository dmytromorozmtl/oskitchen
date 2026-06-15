import { describe, expect, it } from "vitest";

import { evaluateChannelPilotSetupProgress } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import {
  buildGettingStartedPilotChannelFocus,
} from "@/lib/onboarding/getting-started-pilot-channel-era18";
import {
  GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_BACKLOG_ID,
  GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_POLICY_ID,
  GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_PROOF_STATUS,
} from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18-policy";
import {
  connectedPilotChannelsPilotReady,
  pickGettingStartedPilotChannelLiveProofAttentionItems,
  shouldSuppressGenericChannelHealthItem,
  shouldSurfaceGettingStartedPilotChannelLiveProof,
  summarizeGettingStartedPilotChannelLiveProof,
} from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18";

function slice(over: Partial<ChannelPilotLiveProofSlice> = {}): ChannelPilotLiveProofSlice {
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
    ...over,
  };
}

describe("getting-started-pilot-channel-live-proof-era18 policy", () => {
  it("registers era18 getting started pilot channel live proof proof", () => {
    expect(GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_POLICY_ID).toBe(
      "era18-getting-started-pilot-channel-live-proof-v1",
    );
    expect(GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_PROOF_STATUS).toBe(
      "getting_started_pilot_channel_live_proof_wired",
    );
    expect(GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_BACKLOG_ID).toBe("KOS-E18-048");
  });
});

describe("connectedPilotChannelsPilotReady", () => {
  it("requires connected pilot channels to finish the in-app wizard", () => {
    expect(connectedPilotChannelsPilotReady([slice()])).toBe(false);
    expect(
      connectedPilotChannelsPilotReady([
        slice({
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
        }),
      ]),
    ).toBe(true);
  });

  it("returns true when no pilot channels are connected", () => {
    expect(connectedPilotChannelsPilotReady([])).toBe(true);
  });
});

describe("pickGettingStartedPilotChannelLiveProofAttentionItems", () => {
  it("surfaces live proof rows after menu is complete", () => {
    const focus = buildGettingStartedPilotChannelFocus({
      items: [
        { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: true },
        { id: "integration", label: "Integration", href: "/dashboard/integrations", done: false },
      ],
      allDone: false,
      showChecklist: true,
      accountAgeDays: 3,
      pilotChannel: { connectedCount: 1, errorCount: 0 },
      pilotChannelLiveProof: { slices: [slice()] },
      pilotSso: {
        entitlementEnabled: false,
        configured: false,
        active: false,
        workspaceId: null,
      },
    });

    const items = pickGettingStartedPilotChannelLiveProofAttentionItems(focus, [slice()]);
    expect(items.some((item) => item.id === "woocommerce-pilot-setup")).toBe(true);
    expect(items[0]?.tone).toBe("urgent");
  });

  it("stays hidden before menu completion when no channels are connected", () => {
    const focus = buildGettingStartedPilotChannelFocus({
      items: [
        { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: false },
        { id: "integration", label: "Integration", href: "/dashboard/integrations", done: false },
      ],
      allDone: false,
      showChecklist: true,
      accountAgeDays: 3,
      pilotChannel: { connectedCount: 0, errorCount: 0 },
      pilotChannelLiveProof: { slices: [slice({ card: null, operatorStatus: "no_connection" })] },
      pilotSso: {
        entitlementEnabled: false,
        configured: false,
        active: false,
        workspaceId: null,
      },
    });

    expect(
      pickGettingStartedPilotChannelLiveProofAttentionItems(focus, [
        slice({ card: null, operatorStatus: "no_connection" }),
      ]),
    ).toEqual([]);
    expect(shouldSurfaceGettingStartedPilotChannelLiveProof(focus)).toBe(false);
  });
});

describe("shouldSuppressGenericChannelHealthItem", () => {
  it("replaces generic channel-health copy when live proof rows exist", () => {
    const focus = buildGettingStartedPilotChannelFocus({
      items: [
        { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: true },
        { id: "integration", label: "Integration", href: "/dashboard/integrations", done: false },
      ],
      allDone: false,
      showChecklist: true,
      accountAgeDays: 3,
      pilotChannel: { connectedCount: 1, errorCount: 0 },
      pilotChannelLiveProof: { slices: [slice()] },
      pilotSso: {
        entitlementEnabled: false,
        configured: false,
        active: false,
        workspaceId: null,
      },
    });

    expect(shouldSuppressGenericChannelHealthItem(focus, [slice()])).toBe(true);
    expect(summarizeGettingStartedPilotChannelLiveProof(focus, [slice()]).hasUrgent).toBe(true);
  });
});
