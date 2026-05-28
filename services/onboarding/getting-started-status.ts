import { LIVE_CAPABLE_INTEGRATION_PROVIDERS } from "@/lib/channels/channel-registry";
import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { connectedPilotChannelsPilotReady } from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontSettingsListWhereForOwner,
  usageEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { listChannelPilotLiveProofSlices } from "@/services/developer/integration-health-service";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";

export type GettingStartedItem = {
  id: string;
  label: string;
  href: string | null;
  done: boolean;
};

export type GettingStartedPayload = {
  items: GettingStartedItem[];
  allDone: boolean;
  showChecklist: boolean;
  accountAgeDays: number;
  pilotChannel: {
    connectedCount: number;
    errorCount: number;
  };
  pilotChannelLiveProof: {
    slices: ChannelPilotLiveProofSlice[];
  };
  pilotSso: {
    entitlementEnabled: boolean;
    configured: boolean;
    active: boolean;
    workspaceId: string | null;
  };
};

export async function loadGettingStartedStatus(
  userId: string,
  accountCreatedAt: Date,
): Promise<GettingStartedPayload> {
  const [menuScope, orderScope, staffScope, storefrontScope, usageScope, connectionScope] =
    await Promise.all([
    menuListWhereForOwner(userId),
    orderListWhereForOwner(userId),
    staffMemberListWhereForOwner(userId),
    storefrontSettingsListWhereForOwner(userId),
    usageEventListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);

  const liveProviderFilter = {
    provider: { in: [...LIVE_CAPABLE_INTEGRATION_PROVIDERS] },
  };

  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const [
    activation,
    menuCount,
    orderCount,
    staffCount,
    storefrontLive,
    posUseCount,
    channelConnectedCount,
    channelErrorCount,
    ssoView,
    pilotChannelLiveProofSlices,
  ] = await Promise.all([
    prisma.activationState.findUnique({ where: { userId } }),
    prisma.menu.count({ where: menuScope }),
    prisma.order.count({ where: orderScope }),
    prisma.staffMember.count({ where: { AND: [staffScope, { active: true }] } }),
    prisma.storefrontSettings.count({
      where: { AND: [storefrontScope, { enabled: true, published: true }] },
    }),
    prisma.usageEvent.count({
      where: { AND: [usageScope, { eventName: "pos_first_use" }] },
    }),
    prisma.integrationConnection.count({
      where: {
        AND: [connectionScope, liveProviderFilter, { status: "CONNECTED" }],
      },
    }),
    prisma.integrationConnection.count({
      where: {
        AND: [connectionScope, liveProviderFilter, { status: "ERROR" }],
      },
    }),
    workspaceId
      ? getWorkspaceSsoAdminView({ workspaceId, ownerUserId: userId })
      : Promise.resolve(null),
    listChannelPilotLiveProofSlices(userId),
  ]);

  const pilotSso = {
    entitlementEnabled: ssoView?.ssoEntitlementEnabled ?? false,
    configured: ssoView?.configured ?? false,
    active: ssoView?.active ?? false,
    workspaceId,
  };

  const items: GettingStartedItem[] = [
    {
      id: "menu",
      label: "Create your first menu",
      href: "/dashboard/menus/new",
      done: menuCount > 0 || Boolean(activation?.firstMenuCreated),
    },
  ];

  if (pilotSso.entitlementEnabled) {
    items.push({
      id: "sso_pilot",
      label: "Configure enterprise SSO pilot",
      href: "/dashboard/settings/security/sso",
      done: pilotSso.active,
    });
  }

  items.push(
    {
      id: "integration",
      label: "Connect a sales channel",
      href: "/dashboard/integrations",
      done:
        channelConnectedCount > 0 &&
        connectedPilotChannelsPilotReady(pilotChannelLiveProofSlices),
    },
    {
      id: "order",
      label: "Receive your first order",
      href: "/dashboard/orders/new",
      done: orderCount > 0 || Boolean(activation?.firstOrderCreated),
    },
    {
      id: "pos",
      label: "Try the POS",
      href: "/dashboard/pos/terminal",
      done: posUseCount > 0,
    },
    {
      id: "staff",
      label: "Add a team member",
      href: "/dashboard/staff/new",
      done: staffCount > 1,
    },
    {
      id: "storefront",
      label: "Publish your storefront",
      href: "/dashboard/storefront",
      done: storefrontLive > 0,
    },
  );

  const allDone = items.every((i) => i.done);
  const accountAgeDays = Math.floor(
    (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const showChecklist =
    !activation?.checklistDismissed && !allDone && accountAgeDays <= 30;

  return {
    items,
    allDone,
    showChecklist,
    accountAgeDays,
    pilotChannel: {
      connectedCount: channelConnectedCount,
      errorCount: channelErrorCount,
    },
    pilotChannelLiveProof: {
      slices: pilotChannelLiveProofSlices,
    },
    pilotSso,
  };
}
