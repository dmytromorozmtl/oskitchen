import { prisma } from "@/lib/prisma";

export async function countDemosByStatus() {
  return prisma.demoRequest.groupBy({
    by: ["status"],
    _count: { status: true },
  });
}

export async function listRecentDemos(take = 100) {
  return prisma.demoRequest.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      fullName: true,
      email: true,
      businessName: true,
      status: true,
      qualificationScore: true,
      followUpAt: true,
      meetingUrl: true,
      createdAt: true,
    },
  });
}
