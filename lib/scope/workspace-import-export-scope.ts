import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export async function importJobListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ImportJobWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ImportJobWhereInput;
}

export async function importJobByIdWhereForOwner(
  ownerUserId: string,
  jobId: string,
): Promise<Prisma.ImportJobWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: jobId }] } as Prisma.ImportJobWhereInput;
}

export async function exportJobListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ExportJobWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ExportJobWhereInput;
}
