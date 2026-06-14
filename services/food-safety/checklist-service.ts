import type { FoodSafetyCheckFrequency } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { foodSafetyChecklistListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listChecklists(userId: string) {
  return prisma.foodSafetyChecklist.findMany({
    where: await foodSafetyChecklistListWhereForOwner(userId),
    include: { _count: { select: { items: true, audits: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChecklistDetail(checklistId: string, userId: string) {
  const scope = await foodSafetyChecklistListWhereForOwner(userId);
  return prisma.foodSafetyChecklist.findFirst({
    where: { AND: [scope, { id: checklistId }] },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createChecklist(
  userId: string,
  data: { name: string; frequency: FoodSafetyCheckFrequency; questions: string[] },
) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.foodSafetyChecklist.create({
    data: {
      userId,
      workspaceId,
      name: data.name,
      frequency: data.frequency,
      items: {
        create: data.questions.map((question, i) => ({
          question,
          sortOrder: i,
        })),
      },
    },
    include: { items: true },
  });
}
