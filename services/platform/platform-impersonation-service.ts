import { prisma } from "@/lib/prisma";

export async function platformActiveImpersonationForAdmin(adminUserId: string) {
  return prisma.impersonationSession.findFirst({
    where: { adminUserId, endedAt: null },
    orderBy: { startedAt: "desc" },
    include: { target: { select: { email: true, id: true } } },
  });
}
