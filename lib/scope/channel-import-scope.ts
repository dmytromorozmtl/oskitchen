import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

/** Channel import batches use the same owner OR-scope as orders (workspaceId + legacy userId). */
export async function channelImportBatchListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ChannelImportBatchWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ChannelImportBatchWhereInput;
}

export async function channelImportBatchByIdWhereForOwner(
  ownerUserId: string,
  batchId: string,
): Promise<Prisma.ChannelImportBatchWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: batchId }] } as Prisma.ChannelImportBatchWhereInput;
}

/** Nested filter on `batch` relation (import records, export errors, etc.). */
export async function channelImportBatchRelationWhere(
  ownerUserId: string,
): Promise<Prisma.ChannelImportBatchWhereInput> {
  return channelImportBatchListWhereForOwner(ownerUserId);
}

/** Channel conflicts — workspace OR legacy owner rows (Phase 4). */
export async function channelConflictWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ChannelConflictWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ChannelConflictWhereInput;
}
