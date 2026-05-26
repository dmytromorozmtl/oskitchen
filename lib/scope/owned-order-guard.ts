import type { Prisma } from "@prisma/client";

import { orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";

/** Detail/single-order fetch filter (workspace preferred). */
export async function whereOwnedOrderForOwner(
  ownerUserId: string,
  orderId: string,
): Promise<Prisma.OrderWhereInput> {
  return orderByIdWhereForOwner(ownerUserId, orderId);
}
