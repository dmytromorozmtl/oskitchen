import { prisma } from "@/lib/prisma";
import { customerHealthSnapshotListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

/** Workspace-level health snapshot (not per-kitchen-customer in schema yet). */
export async function loadLatestCustomerHealthSnapshot(userId: string) {
  const scope = await customerHealthSnapshotListWhereForOwner(userId);
  return prisma.customerHealthSnapshot.findFirst({
    where: scope,
    orderBy: { createdAt: "desc" },
  });
}
