import { prisma } from "@/lib/prisma";

export async function platformUserListPreview(take = 50) {
  return prisma.userProfile.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });
}
