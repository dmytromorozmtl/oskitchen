import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";

/** Fallback when getting-started loaders fail — keeps Today renderable. */
export function emptyGettingStartedPayload(): GettingStartedPayload {
  return {
    items: [],
    allDone: true,
    showChecklist: false,
    accountAgeDays: 0,
    pilotChannel: { connectedCount: 0, errorCount: 0 },
    pilotChannelLiveProof: { slices: [] },
    pilotSso: {
      entitlementEnabled: false,
      configured: false,
      active: false,
      workspaceId: null,
    },
  };
}
