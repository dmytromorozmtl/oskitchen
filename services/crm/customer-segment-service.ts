import { prisma } from "@/lib/prisma";
import { customerSegmentListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listCustomerSegments(userId: string) {
  const scope = await customerSegmentListWhereForOwner(userId);
  return prisma.customerSegment.findMany({
    where: scope,
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, active: true },
  });
}
