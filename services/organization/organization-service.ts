import { prisma } from "@/lib/prisma";
import { locationListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

import type { FoodOpsHierarchy } from "@/lib/organization/org-types";

export async function loadFoodOpsHierarchyForUser(userId: string): Promise<FoodOpsHierarchy> {
  const workspace = await prisma.workspace.findFirst({
    where: { OR: [{ ownerUserId: userId }, { members: { some: { userId } } }] },
    select: {
      id: true,
      organizationId: true,
      brands: { select: { id: true, name: true, slug: true } },
    },
  });
  const locationScope = await locationListWhereForOwner(userId);
  const locations = await prisma.location.findMany({
    where: locationScope,
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });
  return {
    organizationId: workspace?.organizationId ?? null,
    workspaceId: workspace?.id ?? null,
    brands: workspace?.brands ?? [],
    locations,
  };
}
