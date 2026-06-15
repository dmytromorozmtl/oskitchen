import type { IntegrationProvider } from "@prisma/client";

import {
  CHANNEL_PILOT_CERTIFICATION_ANCHOR,
  CHANNEL_PILOT_CONNECTION_ANCHOR,
  CHANNEL_PILOT_TOOLS_ANCHOR,
  CHANNEL_PILOT_WEBHOOKS_ANCHOR,
  CHANNEL_PILOT_WEBHOOK_LOG_ROUTE,
} from "@/lib/integrations/channel-pilot-setup-focus-era18-policy";
import type {
  ChannelPilotSetupProgress,
  ChannelPilotSetupStepId,
} from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import { channelPilotSetupIncompleteStepCount } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import {
  INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR,
} from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import type {
  IntegrationHealthAttentionItem,
  IntegrationHealthFocusSnapshot,
  IntegrationHealthRowNextAction,
} from "@/lib/integrations/integration-health-focus-era18";
import {
  integrationConnectionSetupHref,
  isWebhookPilotProvider,
  pickIntegrationHealthAttentionItems,
  resolveIntegrationHealthRowNextAction,
  resolveSalesChannelHealthConnectionNextAction,
  type SalesChannelHealthProbe,
} from "@/lib/integrations/integration-health-focus-era18";
import { SALES_CHANNEL_HEALTH_LIVE_PROOF_ROUTE } from "@/lib/integrations/sales-channel-health-live-proof-focus-era18-policy";

export type IntegrationHealthCard = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: import("@prisma/client").IntegrationStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  hasWebhookSecret: boolean;
};

export type ChannelPilotLiveProofSlice = {
  provider: "WOOCOMMERCE" | "SHOPIFY";
  card: IntegrationHealthCard | null;
  progress: ChannelPilotSetupProgress;
  operatorStatus: ChannelLiveProofOperatorStatus;
};

export type ChannelLiveProofOperatorStatus =
  | "no_connection"
  | "connection_blocked"
  | "wizard_incomplete"
  | "awaiting_engineering_live_smoke";

const PILOT_PROVIDER_LABEL: Record<"WOOCOMMERCE" | "SHOPIFY", string> = {
  WOOCOMMERCE: "WooCommerce",
  SHOPIFY: "Shopify",
};

export function channelPilotProviderLabel(provider: "WOOCOMMERCE" | "SHOPIFY"): string {
  return PILOT_PROVIDER_LABEL[provider];
}

export function channelPilotSetupPageHref(provider: "WOOCOMMERCE" | "SHOPIFY"): string {
  return integrationConnectionSetupHref(provider);
}

function channelPilotSetupStepHref(stepId: ChannelPilotSetupStepId): string {
  switch (stepId) {
    case "save_credentials":
      return CHANNEL_PILOT_CONNECTION_ANCHOR;
    case "test_connection":
      return CHANNEL_PILOT_TOOLS_ANCHOR;
    case "configure_webhooks":
      return CHANNEL_PILOT_WEBHOOKS_ANCHOR;
    case "verify_webhook":
      return CHANNEL_PILOT_WEBHOOK_LOG_ROUTE;
    case "run_certification":
      return CHANNEL_PILOT_CERTIFICATION_ANCHOR;
    default:
      return `#channel-pilot-step-${stepId}`;
  }
}

export function channelPilotLiveProofSetupHref(
  provider: "WOOCOMMERCE" | "SHOPIFY",
  stepId: ChannelPilotSetupStepId,
): string {
  return `${channelPilotSetupPageHref(provider)}${channelPilotSetupStepHref(stepId)}`;
}

export function evaluateChannelLiveProofOperatorStatus(input: {
  card: IntegrationHealthCard | null;
  progress: ChannelPilotSetupProgress;
}): ChannelLiveProofOperatorStatus {
  if (!input.card) {
    return input.progress.completedCount === 0 ? "no_connection" : "wizard_incomplete";
  }

  if (input.card.status === "ERROR" || input.card.status === "NEEDS_AUTH") {
    return "connection_blocked";
  }

  if (!input.progress.pilotReady) {
    return "wizard_incomplete";
  }

  return "awaiting_engineering_live_smoke";
}

export function mergeLiveProofIntoIntegrationHealthSnapshot(
  snapshot: IntegrationHealthFocusSnapshot,
  slices: readonly ChannelPilotLiveProofSlice[],
): IntegrationHealthFocusSnapshot {
  return {
    ...snapshot,
    liveProofSlices: [...slices],
  };
}

export function salesChannelHealthLiveProofPanelHref(): string {
  return `${SALES_CHANNEL_HEALTH_LIVE_PROOF_ROUTE}${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`;
}

export function pickIntegrationHealthLiveProofAttentionItems(
  slices: readonly ChannelPilotLiveProofSlice[],
  options?: { liveProofPanelHref?: string },
): IntegrationHealthAttentionItem[] {
  const liveProofPanelHref =
    options?.liveProofPanelHref ??
    `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`;
  const items: IntegrationHealthAttentionItem[] = [];

  for (const slice of slices) {
    const label = channelPilotProviderLabel(slice.provider);

    if (slice.operatorStatus === "wizard_incomplete" && slice.progress.completedCount > 0) {
      const step = slice.progress.currentStepId ?? "save_credentials";
      const remainingSteps = channelPilotSetupIncompleteStepCount(slice.progress);
      items.push({
        id: `${slice.provider.toLowerCase()}-pilot-setup`,
        title: `${label} pilot setup incomplete`,
        detail: `${remainingSteps} step${remainingSteps === 1 ? "" : "s"} remain — finish the pilot wizard before scaling channel orders.`,
        href: channelPilotLiveProofSetupHref(slice.provider, step),
        priority: 2,
        tone: "urgent",
      });
      continue;
    }

    if (slice.operatorStatus === "wizard_incomplete" && !slice.card) {
      items.push({
        id: `${slice.provider.toLowerCase()}-not-connected`,
        title: `${label} not connected`,
        detail: "Save credentials and complete the pilot setup wizard for omnichannel pilot proof.",
        href: channelPilotSetupPageHref(slice.provider),
        priority: 8,
        tone: "normal",
      });
      continue;
    }

    if (slice.operatorStatus === "awaiting_engineering_live_smoke") {
      items.push({
        id: `${slice.provider.toLowerCase()}-awaiting-live-smoke`,
        title: `${label} in-app pilot ready — live smoke pending`,
        detail:
          "Operator certification is complete in-app. Engineering live smoke (npm run smoke:woo-shopify-live) must PASS before sales claims live Woo/Shopify proof.",
        href: liveProofPanelHref,
        priority: 9,
        tone: "normal",
      });
    }
  }

  return items;
}

export function pickIntegrationHealthAttentionItemsWithLiveProof(
  snapshot: IntegrationHealthFocusSnapshot,
  options?: { liveProofPanelHref?: string },
): IntegrationHealthAttentionItem[] {
  const merged = [
    ...pickIntegrationHealthAttentionItems(snapshot),
    ...pickIntegrationHealthLiveProofAttentionItems(snapshot.liveProofSlices ?? [], options),
  ];

  return merged.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/** Prefer connection blockers, then pilot wizard gaps, then live-smoke honesty. */
export function resolveIntegrationHealthRowNextActionWithLiveProof(
  card: IntegrationHealthCard,
  slice: ChannelPilotLiveProofSlice | null,
  options?: { liveProofPanelHref?: string },
): IntegrationHealthRowNextAction | null {
  const liveProofPanelHref =
    options?.liveProofPanelHref ??
    `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`;

  const base = resolveIntegrationHealthRowNextAction(card);
  if (base?.tone === "urgent") {
    return base;
  }

  if (
    slice &&
    isWebhookPilotProvider(card.provider) &&
    slice.operatorStatus === "wizard_incomplete" &&
    !slice.progress.pilotReady
  ) {
    const step = slice.progress.currentStepId ?? "save_credentials";
    return {
      label: "Continue pilot setup",
      href: channelPilotLiveProofSetupHref(slice.provider, step),
      tone: "urgent",
    };
  }

  if (base) {
    return base;
  }

  if (slice?.operatorStatus === "awaiting_engineering_live_smoke") {
    return {
      label: "Review live proof status",
      href: liveProofPanelHref,
      tone: "normal",
    };
  }

  if (slice?.operatorStatus === "no_connection" && isWebhookPilotProvider(card.provider)) {
    return {
      label: "Start channel setup",
      href: channelPilotSetupPageHref(slice.provider),
      tone: "normal",
    };
  }

  return null;
}

/** Sales channels health cards — live proof row CTAs plus manual probe fallback. */
export function resolveSalesChannelHealthConnectionNextActionWithLiveProof(
  card: IntegrationHealthCard,
  slice: ChannelPilotLiveProofSlice | null,
  probe?: SalesChannelHealthProbe | null,
): IntegrationHealthRowNextAction | null {
  const liveProof = resolveIntegrationHealthRowNextActionWithLiveProof(card, slice, {
    liveProofPanelHref: salesChannelHealthLiveProofPanelHref(),
  });
  if (liveProof?.tone === "urgent") {
    return liveProof;
  }

  const probeAction = resolveSalesChannelHealthConnectionNextAction(card, probe);
  if (probeAction?.tone === "urgent") {
    return probeAction;
  }

  if (liveProof) {
    return liveProof;
  }

  return probeAction;
}

export function formatChannelLiveProofOperatorStatus(
  status: ChannelLiveProofOperatorStatus,
): string {
  switch (status) {
    case "no_connection":
      return "Not connected";
    case "connection_blocked":
      return "Connection blocked";
    case "wizard_incomplete":
      return "Pilot wizard incomplete";
    case "awaiting_engineering_live_smoke":
      return "In-app ready — engineering live smoke pending";
    default:
      return status;
  }
}

export function liveProofSliceForProvider(
  slices: readonly ChannelPilotLiveProofSlice[],
  provider: IntegrationProvider,
): ChannelPilotLiveProofSlice | null {
  if (provider !== "WOOCOMMERCE" && provider !== "SHOPIFY") {
    return null;
  }
  return slices.find((slice) => slice.provider === provider) ?? null;
}
