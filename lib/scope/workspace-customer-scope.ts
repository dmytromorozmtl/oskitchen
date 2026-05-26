import type { Prisma } from "@prisma/client";

import {
  buildOwnerScopedWhere,
  resolveOwnerScopedWhere,
} from "@/lib/scope/workspace-resource-scope";

/** CRM list/filter — workspace OR legacy owner rows during migration. */
export async function kitchenCustomerListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.KitchenCustomerWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.KitchenCustomerWhereInput;
}

export async function kitchenCustomerByIdWhereForOwner(
  ownerUserId: string,
  customerId: string,
): Promise<Prisma.KitchenCustomerWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: customerId }] } as Prisma.KitchenCustomerWhereInput;
}

export async function kitchenCustomerByEmailWhereForOwner(
  ownerUserId: string,
  email: string,
): Promise<Prisma.KitchenCustomerWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { email }] } as Prisma.KitchenCustomerWhereInput;
}

/** Sync helper when workspaceId is already on the tenant actor. */
export function kitchenCustomerScopeWhere(
  ownerUserId: string,
  workspaceId: string | null,
): Prisma.KitchenCustomerWhereInput {
  return buildOwnerScopedWhere(ownerUserId, workspaceId) as Prisma.KitchenCustomerWhereInput;
}
