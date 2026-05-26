import { prisma } from "@/lib/prisma";

export async function listPlatformAuditTail(limit = 150) {
  return prisma.auditLog.findMany({
    where: {
      OR: [{ category: "PLATFORM" }, { action: { startsWith: "platform." } }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      actorEmail: true,
      action: true,
      category: true,
      entityType: true,
      entityLabel: true,
      workspaceId: true,
    },
  });
}

export { recordPlatformAudit, type PlatformAuditPayload } from "@/lib/platform/platform-audit";
