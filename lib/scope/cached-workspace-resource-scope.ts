import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { getTenantDataUserId } from "@/lib/scope/cached-tenant";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  webhookEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  orderByIdWhereForOwner,
  orderListWhereForOwner,
} from "@/lib/scope/workspace-order-scope";

/** Per-request cached order list filter (workspace-aware). */
export const getCachedOrderListWhere = cache(async (): Promise<Prisma.OrderWhereInput> => {
  const ownerUserId = await getTenantDataUserId();
  return orderListWhereForOwner(ownerUserId);
});

export async function getCachedOrderByIdWhere(orderId: string): Promise<Prisma.OrderWhereInput> {
  const ownerUserId = await getTenantDataUserId();
  return orderByIdWhereForOwner(ownerUserId, orderId);
}

/** Per-request cached menu list filter. */
export const getCachedMenuListWhere = cache(async (): Promise<Prisma.MenuWhereInput> => {
  const ownerUserId = await getTenantDataUserId();
  return menuListWhereForOwner(ownerUserId);
});

/** Per-request cached integration connection list filter. */
export const getCachedIntegrationConnectionListWhere = cache(
  async (): Promise<Prisma.IntegrationConnectionWhereInput> => {
    const ownerUserId = await getTenantDataUserId();
    return integrationConnectionListWhereForOwner(ownerUserId);
  },
);

/** Per-request cached webhook event list filter. */
export const getCachedWebhookEventListWhere = cache(async (): Promise<Prisma.WebhookEventWhereInput> => {
  const ownerUserId = await getTenantDataUserId();
  return webhookEventListWhereForOwner(ownerUserId);
});
