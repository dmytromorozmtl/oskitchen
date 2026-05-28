import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";
import { shouldSuppressGenericChannelHealthItem } from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18";

export type GettingStartedPilotChannelFocus = {
  menuComplete: boolean;
  integrationIncomplete: boolean;
  integrationErrorCount: number;
  channelConnectedCount: number;
};

export type GettingStartedPilotChannelAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export function buildGettingStartedPilotChannelFocus(
  payload: GettingStartedPayload,
): GettingStartedPilotChannelFocus {
  const menuComplete = payload.items.find((item) => item.id === "menu")?.done ?? false;
  const integrationIncomplete = !(payload.items.find((item) => item.id === "integration")?.done ?? false);

  return {
    menuComplete,
    integrationIncomplete,
    integrationErrorCount: payload.pilotChannel.errorCount,
    channelConnectedCount: payload.pilotChannel.connectedCount,
  };
}

export function summarizeGettingStartedPilotChannelFocus(
  focus: GettingStartedPilotChannelFocus,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    (focus.integrationErrorCount > 0 ? 1 : 0) +
    (focus.menuComplete && focus.integrationIncomplete ? 1 : 0);

  return {
    totalSignals,
    hasUrgent: focus.integrationErrorCount > 0,
  };
}

/** Pilot onboarding — channel connection and integration health before order volume. */
export function pickGettingStartedPilotChannelAttentionItems(
  focus: GettingStartedPilotChannelFocus,
  liveProofSlices: readonly ChannelPilotLiveProofSlice[] = [],
): GettingStartedPilotChannelAttentionItem[] {
  const items: GettingStartedPilotChannelAttentionItem[] = [];

  if (focus.integrationErrorCount > 0) {
    items.push({
      id: "integration-errors",
      title: `${focus.integrationErrorCount} channel connection error${focus.integrationErrorCount === 1 ? "" : "s"}`,
      detail: "Fix OAuth or webhook issues before pilot orders stop flowing.",
      href: "/dashboard/integration-health",
      priority: 1,
      tone: "urgent",
    });
  }

  if (focus.menuComplete && focus.integrationIncomplete) {
    items.push({
      id: "connect-channel",
      title: "Connect WooCommerce or Shopify",
      detail: "Most pilots connect a sales channel after the menu is ready — optional for POS-only.",
      href: "/dashboard/integrations",
      priority: 2,
      tone: focus.integrationErrorCount > 0 ? "normal" : "urgent",
    });
  }

  if (
    focus.channelConnectedCount > 0 &&
    focus.integrationErrorCount === 0 &&
    !shouldSuppressGenericChannelHealthItem(focus, liveProofSlices) &&
    items.length < 4
  ) {
    items.push({
      id: "channel-health",
      title: `${focus.channelConnectedCount} channel${focus.channelConnectedCount === 1 ? "" : "s"} connected`,
      detail: "Review integration health before your first live channel order.",
      href: "/dashboard/sales-channels/health",
      priority: 3,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}
