import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export async function productMappingListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductMappingWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ProductMappingWhereInput;
}

export async function productMappingByIdWhereForOwner(
  ownerUserId: string,
  mappingId: string,
): Promise<Prisma.ProductMappingWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: mappingId }] } as Prisma.ProductMappingWhereInput;
}

export async function productMappingAliasListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductMappingAliasWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ProductMappingAliasWhereInput;
}
