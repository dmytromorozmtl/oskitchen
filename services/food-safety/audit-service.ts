import { prisma } from "@/lib/prisma";
import {
  foodSafetyAuditListWhereForOwner,
  foodSafetyChecklistListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function listAudits(userId: string, take = 30) {
  const scope = await foodSafetyAuditListWhereForOwner(userId);
  return prisma.foodSafetyAudit.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      checklist: { select: { id: true, name: true } },
      _count: { select: { responses: true } },
    },
  });
}

export async function startAudit(userId: string, checklistId: string, completedById: string) {
  const checklistScope = await foodSafetyChecklistListWhereForOwner(userId);
  const checklist = await prisma.foodSafetyChecklist.findFirst({
    where: { AND: [checklistScope, { id: checklistId }] },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!checklist) throw new Error("Checklist not found");

  return prisma.foodSafetyAudit.create({
    data: {
      userId,
      checklistId,
      completedById,
      responses: {
        create: checklist.items.map((item) => ({
          itemId: item.id,
          pass: false,
        })),
      },
    },
    include: {
      checklist: { select: { name: true } },
      responses: true,
    },
  });
}

export async function getAuditDetail(auditId: string, userId: string) {
  const scope = await foodSafetyAuditListWhereForOwner(userId);
  const audit = await prisma.foodSafetyAudit.findFirst({
    where: { AND: [scope, { id: auditId }] },
    include: {
      checklist: {
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
      responses: true,
    },
  });
  return audit;
}

export async function submitAuditResponse(
  auditId: string,
  userId: string,
  responseId: string,
  pass: boolean,
  notes?: string,
) {
  const auditScope = await foodSafetyAuditListWhereForOwner(userId);
  const response = await prisma.foodSafetyAuditResponse.findFirst({
    where: { id: responseId, audit: auditScope },
  });
  if (!response) throw new Error("Response not found");

  return prisma.foodSafetyAuditResponse.update({
    where: { id: responseId },
    data: { pass, notes: notes ?? null },
  });
}
