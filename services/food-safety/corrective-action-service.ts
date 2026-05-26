import { prisma } from "@/lib/prisma";

export async function addCorrectiveAction(params: {
  userId: string;
  auditId: string;
  description: string;
  dueAt?: Date | null;
}) {
  const audit = await prisma.foodSafetyAudit.findFirst({
    where: { id: params.auditId, userId: params.userId },
  });
  if (!audit) throw new Error("Audit not found");

  const action = await prisma.foodSafetyCorrectiveAction.create({
    data: {
      auditId: params.auditId,
      userId: params.userId,
      description: params.description,
      dueAt: params.dueAt ?? null,
      status: "OPEN",
    },
  });

  await prisma.foodSafetyAudit.update({
    where: { id: params.auditId },
    data: {
      correctiveActionRequired: true,
      status: "NEEDS_CORRECTIVE",
      correctiveActionNotes: params.description,
      correctiveDueAt: params.dueAt ?? null,
    },
  });

  return action;
}

export async function verifyAudit(params: {
  userId: string;
  auditId: string;
  verifiedById: string;
}) {
  const audit = await prisma.foodSafetyAudit.findFirst({
    where: { id: params.auditId, userId: params.userId },
    include: { correctiveActions: { where: { status: { not: "VERIFIED" } } } },
  });
  if (!audit) throw new Error("Audit not found");
  if (audit.correctiveActions.some((a) => a.status === "OPEN")) {
    throw new Error("Open corrective actions must be completed first");
  }

  const now = new Date();
  await prisma.foodSafetyAudit.update({
    where: { id: params.auditId },
    data: {
      status: "VERIFIED",
      verifiedAt: now,
      verifiedById: params.verifiedById,
    },
  });

  return { ok: true as const, verifiedAt: now };
}
