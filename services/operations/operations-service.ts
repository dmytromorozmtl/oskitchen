import type { OperationsCheckFrequency } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  operationsAuditByIdWhereForOwner,
  operationsAuditListWhereForOwner,
  operationsChecklistByIdWhereForOwner,
  operationsChecklistListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function listOperationsChecklists(userId: string) {
  const where = await operationsChecklistListWhereForOwner(userId);
  return prisma.operationsChecklist.findMany({
    where,
    include: { _count: { select: { items: true, audits: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOperationsChecklist(
  userId: string,
  data: { name: string; frequency: OperationsCheckFrequency; questions: string[] },
) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.operationsChecklist.create({
    data: {
      userId,
      workspaceId,
      name: data.name,
      frequency: data.frequency,
      items: {
        create: data.questions.map((q, i) => ({ question: q, sortOrder: i })),
      },
    },
    include: { items: true },
  });
}

export async function listOperationsAudits(userId: string, take = 50) {
  const where = await operationsAuditListWhereForOwner(userId);
  return prisma.operationsAudit.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      checklist: { select: { id: true, name: true } },
      _count: { select: { responses: true } },
    },
  });
}

export async function startOperationsAudit(
  userId: string,
  checklistId: string,
  completedById: string,
) {
  const checklistWhere = await operationsChecklistByIdWhereForOwner(userId, checklistId);
  const checklist = await prisma.operationsChecklist.findFirst({
    where: checklistWhere,
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!checklist) throw new Error("Checklist not found");

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.operationsAudit.create({
    data: {
      userId,
      workspaceId,
      checklistId,
      completedById,
      responses: {
        create: checklist.items.map((item) => ({
          itemId: item.id,
          pass: false,
        })),
      },
    },
  });
}

export async function getOperationsAudit(auditId: string, userId: string) {
  const where = await operationsAuditByIdWhereForOwner(userId, auditId);
  return prisma.operationsAudit.findFirst({
    where,
    include: {
      checklist: { include: { items: { orderBy: { sortOrder: "asc" } } } },
      responses: true,
    },
  });
}

export async function submitOperationsResponse(
  auditId: string,
  userId: string,
  responseId: string,
  pass: boolean,
  notes?: string,
  photoUrl?: string,
) {
  const auditWhere = await operationsAuditByIdWhereForOwner(userId, auditId);
  const row = await prisma.operationsAuditResponse.findFirst({
    where: { id: responseId, audit: auditWhere },
  });
  if (!row) throw new Error("Response not found");

  return prisma.operationsAuditResponse.update({
    where: { id: responseId },
    data: { pass, notes: notes ?? null, photoUrl: photoUrl ?? null },
  });
}

export async function getOperationsCompliance(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const scope = await operationsAuditListWhereForOwner(userId);
  const audits = await prisma.operationsAudit.findMany({
    where: { AND: [scope, { createdAt: { gte: since } }] },
    include: { responses: true, checklist: { select: { name: true } } },
  });

  let total = 0;
  let passed = 0;
  for (const a of audits) {
    for (const r of a.responses) {
      total++;
      if (r.pass) passed++;
    }
  }

  const compliancePct = total > 0 ? Math.round((passed / total) * 1000) / 10 : 100;

  return { audits: audits.length, totalResponses: total, passed, compliancePct };
}
