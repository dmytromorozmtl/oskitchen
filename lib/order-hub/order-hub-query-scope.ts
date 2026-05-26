import type { Prisma } from "@prisma/client";

import {
  orderListWhereForOwner,
  orderListWhereForOwnerAnd,
} from "@/lib/scope/workspace-order-scope";

/** Order hub list/count filter (workspace-aware Phase 3). */
export async function orderHubWhere(
  ownerUserId: string,
  extra?: Prisma.OrderWhereInput,
): Promise<Prisma.OrderWhereInput> {
  if (extra) return orderListWhereForOwnerAnd(ownerUserId, extra);
  return orderListWhereForOwner(ownerUserId);
}
