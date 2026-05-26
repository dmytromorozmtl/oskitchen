import type { IntegrationConnection, IntegrationStatus } from "@prisma/client";

import {
  CHANNEL_DEFINITIONS,
} from "@/lib/channels/channel-registry";
import { enrichChannelRegistryEntry } from "@/lib/channels/enrich-channel-registry-entry";
import type { ChannelDefinition, ChannelRegistryEntry, ChannelStatusType } from "@/lib/channels/channel-types";
import { integrationLaunchLabel } from "@/lib/integration-launch-status";

export type ResolvedChannel = ChannelRegistryEntry & {
  connection: IntegrationConnection | null;
  effectiveStatus: ChannelStatusType;
  nextAction: string;
};

function statusFromIntegration(
  def: ChannelDefinition,
  status: IntegrationStatus | undefined,
  lastError: string | null | undefined,
  workspaceDemo: boolean,
): ChannelStatusType {
  if (def.isPlaceholder && def.statusType === "COMING_SOON") {
    return "COMING_SOON";
  }
  if (def.requiresPartnerApproval && def.mapsToIntegrationProvider && status !== "CONNECTED") {
    return "PARTNER_ACCESS_REQUIRED";
  }

  if (!def.mapsToIntegrationProvider) {
    if (def.providerKey === "email-orders") return "NEEDS_SETUP";
    if (def.providerKey === "kitchenos-storefront" || def.providerKey === "manual-orders") return "LIVE";
    if (def.isPlaceholder) return def.statusType;
    return "LIVE";
  }

  if (!status) return "NEEDS_CREDENTIALS";

  const launch = integrationLaunchLabel({
    status,
    lastError: lastError ?? null,
    workspaceDemoMode: workspaceDemo,
    partnerGate: def.requiresPartnerApproval,
    supportsLiveMode: def.supportsLiveMode,
    isPlaceholder: def.isPlaceholder,
  });

  switch (launch.label) {
    case "live_ready":
      return "LIVE";
    case "credentials_required":
      return "NEEDS_CREDENTIALS";
    case "partner_access_required":
      return "PARTNER_ACCESS_REQUIRED";
    case "simulated_demo":
      return "SIMULATED_DEMO";
    case "disabled":
      return "DISABLED";
    case "error":
      return "ERROR";
    default:
      return "NEEDS_SETUP";
  }
}

export function resolveChannel(
  def: ChannelDefinition,
  connections: IntegrationConnection[],
  workspaceDemo: boolean,
): ResolvedChannel {
  const connection = def.mapsToIntegrationProvider
    ? connections.find((c) => c.provider === def.mapsToIntegrationProvider) ?? null
    : null;

  const effectiveStatus = statusFromIntegration(
    def,
    connection?.status,
    connection?.lastError,
    workspaceDemo,
  );

  let nextAction = "Review capabilities";
  if (effectiveStatus === "COMING_SOON") {
    nextAction = "Request integration roadmap";
  } else if (effectiveStatus === "PARTNER_ACCESS_REQUIRED") {
    nextAction = "Complete partner checklist";
  } else if (effectiveStatus === "NEEDS_CREDENTIALS") {
    nextAction = "Open setup and add credentials";
  } else if (effectiveStatus === "ERROR") {
    nextAction = "Fix errors and test connection";
  } else if (effectiveStatus === "LIVE" || effectiveStatus === "CONNECTED") {
    nextAction = "Monitor webhooks and sync health";
  } else if (def.setupRoute.includes("storefront") || def.setupRoute.includes("orders")) {
    nextAction = "Configure channel";
  }

  const base = enrichChannelRegistryEntry(def);

  return {
    ...base,
    connection,
    effectiveStatus,
    nextAction,
  };
}

export function resolveAllChannels(
  connections: IntegrationConnection[],
  workspaceDemo: boolean,
): ResolvedChannel[] {
  return CHANNEL_DEFINITIONS.map((d) => resolveChannel(d, connections, workspaceDemo));
}
