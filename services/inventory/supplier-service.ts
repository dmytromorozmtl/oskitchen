import { prisma } from "@/lib/prisma";
import { supplierListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { SERVICE_DEFAULT_TAKE } from "@/lib/scope/tenant-scope";

export async function listSuppliersForUser(userId: string, activeOnly = true, take = SERVICE_DEFAULT_TAKE) {
  const scope = await supplierListWhereForOwner(userId);
  return prisma.supplier.findMany({
    where: activeOnly ? { AND: [scope, { active: true }] } : scope,
    orderBy: { name: "asc" },
    take,
    select: { id: true, name: true, email: true, phone: true, active: true },
  });
}
