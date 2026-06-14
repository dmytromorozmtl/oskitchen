import type { Prisma } from "@prisma/client";

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

/** Pre-resolved owner scopes for Today command center — one workspace lookup for all filters. */
export type TodayWorkspaceScopes = {
  workspaceId: string | null;
  externalOrderWhere: Prisma.ExternalOrderWhereInput;
  externalProductWhere: Prisma.ExternalProductWhereInput;
  orderWhere: Prisma.OrderWhereInput;
  productWhere: Prisma.ProductWhereInput;
  menuWhere: Prisma.MenuWhereInput;
  integrationWhere: Prisma.IntegrationConnectionWhereInput;
  kitchenTaskWhere: Prisma.KitchenTaskWhereInput;
  deliveryRouteWhere: Prisma.DeliveryRouteWhereInput;
  supportTicketWhere: Prisma.SupportTicketWhereInput;
  posTransactionWhere: Prisma.POSTransactionWhereInput;
  staffMemberWhere: Prisma.StaffMemberWhereInput;
  orderChannelWhere: Prisma.OrderChannelWhereInput;
  webhookEventWhere: Prisma.WebhookEventWhereInput;
};

export async function resolveTodayWorkspaceScopes(userId: string): Promise<TodayWorkspaceScopes> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const scope = buildOwnerScopedWhere(userId, workspaceId);
  return {
    workspaceId,
    externalOrderWhere: scope as Prisma.ExternalOrderWhereInput,
    externalProductWhere: scope as Prisma.ExternalProductWhereInput,
    orderWhere: scope as Prisma.OrderWhereInput,
    productWhere: scope as Prisma.ProductWhereInput,
    menuWhere: scope as Prisma.MenuWhereInput,
    integrationWhere: scope as Prisma.IntegrationConnectionWhereInput,
    kitchenTaskWhere: scope as Prisma.KitchenTaskWhereInput,
    deliveryRouteWhere: scope as Prisma.DeliveryRouteWhereInput,
    supportTicketWhere: scope as Prisma.SupportTicketWhereInput,
    posTransactionWhere: scope as Prisma.POSTransactionWhereInput,
    staffMemberWhere: scope as Prisma.StaffMemberWhereInput,
    orderChannelWhere: scope as Prisma.OrderChannelWhereInput,
    webhookEventWhere: scope as Prisma.WebhookEventWhereInput,
  };
}
