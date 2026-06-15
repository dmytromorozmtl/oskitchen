import {
  channelPilotLiveProofSetupHref,
  channelPilotProviderLabel,
  channelPilotSetupPageHref,
  formatChannelLiveProofOperatorStatus,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

export type PilotIntegrationLiveProofRow = {
  id: string;
  provider: "WOOCOMMERCE" | "SHOPIFY";
  label: string;
  statusLabel: string;
  detail: string;
  href: string;
  tone: "urgent" | "normal";
};

export function buildPilotIntegrationLiveProofRows(
  slices: readonly ChannelPilotLiveProofSlice[],
): PilotIntegrationLiveProofRow[] {
  const rows: PilotIntegrationLiveProofRow[] = [];

  for (const slice of slices) {
    const label = channelPilotProviderLabel(slice.provider);
    const statusLabel = formatChannelLiveProofOperatorStatus(slice.operatorStatus);
    const step = slice.progress.currentStepId ?? "save_credentials";

    if (slice.operatorStatus === "connection_blocked") {
      continue;
    }

    if (slice.operatorStatus === "no_connection") {
      rows.push({
        id: `${slice.provider.toLowerCase()}-not-connected`,
        provider: slice.provider,
        label,
        statusLabel,
        detail: "No saved connection — start the pilot setup wizard.",
        href: channelPilotSetupPageHref(slice.provider),
        tone: "normal",
      });
      continue;
    }

    if (slice.operatorStatus === "wizard_incomplete") {
      rows.push({
        id: `${slice.provider.toLowerCase()}-pilot-setup`,
        provider: slice.provider,
        label,
        statusLabel,
        detail: `${slice.progress.completedCount}/${slice.progress.totalCount} wizard steps complete.`,
        href: channelPilotLiveProofSetupHref(slice.provider, step),
        tone: slice.progress.completedCount > 0 ? "urgent" : "normal",
      });
      continue;
    }

    if (slice.operatorStatus === "awaiting_engineering_live_smoke") {
      rows.push({
        id: `${slice.provider.toLowerCase()}-awaiting-live-smoke`,
        provider: slice.provider,
        label,
        statusLabel,
        detail:
          "In-app pilot ready. Engineering live smoke must PASS before commercial live-proof claims.",
        href: `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`,
        tone: "normal",
      });
    }
  }

  return rows;
}

export function refinePilotIntegrationHealthHeadlineForLiveProof(input: {
  overall: PilotIntegrationHealthStripModel["overall"];
  headline: string;
  liveProofRows: readonly PilotIntegrationLiveProofRow[];
}): string {
  if (input.liveProofRows.some((row) => row.tone === "urgent")) {
    return "Channel pilot setup incomplete — finish Woo/Shopify wizard before scaling pilot orders.";
  }

  if (input.liveProofRows.some((row) => row.id.endsWith("-awaiting-live-smoke"))) {
    if (input.overall === "healthy") {
      return "In-app pilot channels ready — engineering live smoke still pending (not a live PASS claim).";
    }
    return "Fix integration errors, then complete engineering live smoke before commercial live-proof claims.";
  }

  return input.headline;
}

export function augmentPilotIntegrationHealthStripWithLiveProof(
  model: PilotIntegrationHealthStripModel,
  slices: readonly ChannelPilotLiveProofSlice[],
): PilotIntegrationHealthStripModel {
  const liveProofRows = buildPilotIntegrationLiveProofRows(slices);

  return {
    ...model,
    liveProofRows,
    hasLiveProofAttention: liveProofRows.length > 0,
    headline: refinePilotIntegrationHealthHeadlineForLiveProof({
      overall: model.overall,
      headline: model.headline,
      liveProofRows,
    }),
  };
}

export function summarizePilotIntegrationLiveProof(
  rows: readonly PilotIntegrationLiveProofRow[],
): { urgentCount: number; pendingLiveSmokeCount: number } {
  return {
    urgentCount: rows.filter((row) => row.tone === "urgent").length,
    pendingLiveSmokeCount: rows.filter((row) => row.id.endsWith("-awaiting-live-smoke")).length,
  };
}
