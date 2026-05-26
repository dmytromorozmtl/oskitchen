import type { Prisma } from "@prisma/client";

import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";

/** Standard `findFirst` / `updateMany` filter for user-owned rows. */
export function whereOwnedByUser(userId: string, id: string): { id: string; userId: string } {
  return { id, userId };
}

/** Playbook / training / CRM style ownership check after load. */
export function assertOwnedByUser<T extends { userId: string }>(
  resource: T | null,
  userId: string,
): asserts resource is T {
  if (!resource || resource.userId !== userId) {
    throw new WorkspaceAccessDeniedError();
  }
}

export type UserScopedListArgs = {
  userId: string;
  take?: number;
  orderBy?: Prisma.OrderOrderByWithRelationInput;
};

/** Lean order list query — avoids N+1 and heavy joins on `/dashboard/orders`. */
export const orderListSelect = {
  id: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  total: true,
  status: true,
  fulfillmentType: true,
  pickupDate: true,
  createdAt: true,
  publicLookupToken: true,
} as const satisfies Prisma.OrderSelect;
