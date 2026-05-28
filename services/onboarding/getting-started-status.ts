import { LIVE_CAPABLE_INTEGRATION_PROVIDERS } from "@/lib/channels/channel-registry";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontSettingsListWhereForOwner,
  usageEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

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

  const [
    activation,
    menuCount,
    orderCount,
    staffCount,
    storefrontLive,
    posUseCount,
    channelConnectedCount,
    channelErrorCount,
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
  ]);

  const items: GettingStartedItem[] = [
    {
      id: "menu",
      label: "Create your first menu",
      href: "/dashboard/menus/new",
      done: menuCount > 0 || Boolean(activation?.firstMenuCreated),
    },
    {
      id: "integration",
      label: "Connect a sales channel",
      href: "/dashboard/integrations",
      done: channelConnectedCount > 0,
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
  ];

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
  };
}
