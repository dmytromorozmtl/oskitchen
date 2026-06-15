import type { GoLiveLaunchStage } from "@prisma/client";

import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  channelPilotLiveProofSetupHref,
  channelPilotProviderLabel,
  type ChannelPilotLiveProofSlice,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import {
  GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX,
  GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX,
} from "@/lib/go-live/go-live-channel-pilot-focus-era18-policy";

export type GoLiveChannelPilotReadinessSlice = {
  channelPilotLiveProofSlices?: readonly ChannelPilotLiveProofSlice[];
};

export function connectedChannelPilotSlices(
  slices: readonly ChannelPilotLiveProofSlice[] | undefined,
): ChannelPilotLiveProofSlice[] {
  return (slices ?? []).filter((slice) => slice.card !== null);
}

/** HIGH_RISK / WARNING launch blockers for connected Woo/Shopify pilot channels. */
export function detectGoLiveChannelPilotBlockers(
  inputs: GoLiveChannelPilotReadinessSlice,
): LaunchBlocker[] {
  const blockers: LaunchBlocker[] = [];
  const stage: GoLiveLaunchStage = "CHANNEL_INTEGRATIONS";

  for (const slice of connectedChannelPilotSlices(inputs.channelPilotLiveProofSlices)) {
    const label = channelPilotProviderLabel(slice.provider);
    const providerKey = slice.provider.toLowerCase();

    if (!slice.progress.pilotReady) {
      const step = slice.progress.currentStepId ?? "save_credentials";
      blockers.push({
        key: `${GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX}${providerKey}`,
        severity: "HIGH_RISK",
        stage,
        title: `${label} pilot wizard incomplete`,
        impact:
          "Launch would scale channel orders before the in-app pilot setup path is complete.",
        resolution: `Finish the ${label} pilot wizard — credentials, webhooks, and in-app certification.`,
        actionRoute: channelPilotLiveProofSetupHref(slice.provider, step),
      });
      continue;
    }

    if (slice.operatorStatus === "awaiting_engineering_live_smoke") {
      blockers.push({
        key: `${GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX}${providerKey}`,
        severity: "WARNING",
        stage,
        title: `${label} in-app ready — engineering live smoke pending`,
        impact:
          "Operator certification is complete in-app. Engineering live smoke must PASS before commercial live-proof claims.",
        resolution:
          "Review live proof status and run npm run smoke:woo-shopify-live when staging credentials are configured.",
        actionRoute: `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`,
      });
    }
  }

  return blockers;
}

export function resolveGoLiveChannelPilotBlockerRowNextAction(blocker: LaunchBlocker): {
  label: string;
  href: string;
  tone: "urgent" | "normal";
} | null {
  if (!blocker.actionRoute) return null;

  if (blocker.key.startsWith(GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX)) {
    return {
      label: "Continue pilot setup",
      href: blocker.actionRoute,
      tone: "urgent",
    };
  }

  if (blocker.key.startsWith(GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX)) {
    return {
      label: "Review live proof status",
      href: blocker.actionRoute,
      tone: "normal",
    };
  }

  return null;
}

export function resolveGoLiveExternalIntegrationsBlockerRowNextAction(
  blocker: LaunchBlocker,
  slices: readonly ChannelPilotLiveProofSlice[] | undefined,
): {
  label: string;
  href: string;
  tone: "urgent" | "normal";
} | null {
  if (blocker.key !== "external_integrations_uncertified" || !blocker.detail) {
    return null;
  }

  const detail = blocker.detail.toLowerCase();
  const wooSlice = (slices ?? []).find((slice) => slice.provider === "WOOCOMMERCE");
  const shopifySlice = (slices ?? []).find((slice) => slice.provider === "SHOPIFY");

  if (detail.includes("woocommerce") && wooSlice?.card) {
    const step = wooSlice.progress.currentStepId ?? "save_credentials";
    return {
      label: "Open Woo pilot wizard",
      href: channelPilotLiveProofSetupHref("WOOCOMMERCE", step),
      tone: "urgent",
    };
  }

  if (detail.includes("shopify") && shopifySlice?.card) {
    const step = shopifySlice.progress.currentStepId ?? "save_credentials";
    return {
      label: "Open Shopify pilot wizard",
      href: channelPilotLiveProofSetupHref("SHOPIFY", step),
      tone: "urgent",
    };
  }

  return {
    label: "Open live proof panel",
    href: `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`,
    tone: "urgent",
  };
}
