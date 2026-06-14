import { prisma } from "@/lib/prisma";

export async function listOpenPartnerTickets(accountIds: string[], take = 50) {
  if (accountIds.length === 0) return [];
  return prisma.partnerManagedTicket.findMany({
    where: {
      partnerAccountId: { in: accountIds },
      status: { in: ["NEW", "OPEN", "WAITING"] },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: { workspace: { select: { name: true } }, partnerClient: { select: { businessName: true } } },
  });
}
