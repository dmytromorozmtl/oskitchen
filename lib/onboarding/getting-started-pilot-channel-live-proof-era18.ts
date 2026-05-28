import {
  buildPilotIntegrationLiveProofRows,
} from "@/lib/integrations/pilot-integration-health-live-proof-era18";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import type { GettingStartedPilotChannelFocus } from "@/lib/onboarding/getting-started-pilot-channel-era18";

export type GettingStartedPilotChannelLiveProofAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

/** Connected Woo/Shopify rows must finish the in-app pilot wizard before integration checklist passes. */
export function connectedPilotChannelsPilotReady(
  slices: readonly ChannelPilotLiveProofSlice[],
): boolean {
  const connected = slices.filter((slice) => slice.card !== null);
  if (connected.length === 0) {
    return true;
  }

  return connected.every((slice) => slice.progress.pilotReady);
}

export function shouldSurfaceGettingStartedPilotChannelLiveProof(
  focus: GettingStartedPilotChannelFocus,
): boolean {
  return focus.menuComplete || focus.channelConnectedCount > 0 || focus.integrationErrorCount > 0;
}

export function pickGettingStartedPilotChannelLiveProofAttentionItems(
  focus: GettingStartedPilotChannelFocus,
  slices: readonly ChannelPilotLiveProofSlice[],
): GettingStartedPilotChannelLiveProofAttentionItem[] {
  if (!shouldSurfaceGettingStartedPilotChannelLiveProof(focus)) {
    return [];
  }

  return buildPilotIntegrationLiveProofRows(slices)
    .map((row) => ({
      id: row.id,
      title: `${row.label} — ${row.statusLabel}`,
      detail: row.detail,
      href: row.href,
      priority: row.tone === "urgent" ? 2 : row.id.endsWith("-awaiting-live-smoke") ? 4 : 3,
      tone: row.tone,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);
}

export function summarizeGettingStartedPilotChannelLiveProof(
  focus: GettingStartedPilotChannelFocus,
  slices: readonly ChannelPilotLiveProofSlice[],
): { totalSignals: number; hasUrgent: boolean } {
  const items = pickGettingStartedPilotChannelLiveProofAttentionItems(focus, slices);

  return {
    totalSignals: items.length,
    hasUrgent: items.some((item) => item.tone === "urgent"),
  };
}

export function shouldSuppressGenericChannelHealthItem(
  focus: GettingStartedPilotChannelFocus,
  slices: readonly ChannelPilotLiveProofSlice[],
): boolean {
  if (!shouldSurfaceGettingStartedPilotChannelLiveProof(focus)) {
    return false;
  }

  return pickGettingStartedPilotChannelLiveProofAttentionItems(focus, slices).length > 0;
}
