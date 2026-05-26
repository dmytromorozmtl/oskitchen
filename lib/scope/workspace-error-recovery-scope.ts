import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export async function errorRecoveryItemListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ErrorRecoveryItemWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ErrorRecoveryItemWhereInput;
}

export async function errorRecoveryItemByIdWhereForOwner(
  ownerUserId: string,
  itemId: string,
): Promise<Prisma.ErrorRecoveryItemWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: itemId }] } as Prisma.ErrorRecoveryItemWhereInput;
}
