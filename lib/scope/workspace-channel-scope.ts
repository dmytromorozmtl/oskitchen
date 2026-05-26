import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export async function externalOrderListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ExternalOrderWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ExternalOrderWhereInput;
}

export async function externalOrderByIdWhereForOwner(
  ownerUserId: string,
  externalOrderId: string,
): Promise<Prisma.ExternalOrderWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: externalOrderId }] } as Prisma.ExternalOrderWhereInput;
}

export async function channelConflictListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ChannelConflictWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ChannelConflictWhereInput;
}

export async function channelSyncJobListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ChannelSyncJobWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ChannelSyncJobWhereInput;
}

export async function externalProductListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ExternalProductWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ExternalProductWhereInput;
}

export async function externalProductByIdWhereForOwner(
  ownerUserId: string,
  externalProductId: string,
): Promise<Prisma.ExternalProductWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: externalProductId }] } as Prisma.ExternalProductWhereInput;
}
