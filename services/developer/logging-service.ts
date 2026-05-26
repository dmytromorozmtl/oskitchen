import { prisma } from "@/lib/prisma";

export type DeveloperLogRow = {
  id: string;
  createdAt: Date;
  action: string;
  category: string | null;
  severity: string | null;
  entityType: string;
  entityLabel: string | null;
  route: string | null;
};

export async function listDeveloperAuditLogs(params: {
  userId: string;
  platformSuper: boolean;
  take?: number;
}) {
  const take = params.take ?? 80;
  return prisma.auditLog.findMany({
    where: {
      ...(params.platformSuper ? {} : { userId: params.userId }),
      OR: [
        { category: "DEVELOPER" },
        { action: { startsWith: "developer." } },
        { action: { startsWith: "platform.incident" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      action: true,
      category: true,
      severity: true,
      entityType: true,
      entityLabel: true,
      route: true,
    },
  });
}
