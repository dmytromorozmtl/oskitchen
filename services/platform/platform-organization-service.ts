import { prisma } from "@/lib/prisma";

export async function platformOrganizationCount(): Promise<number> {
  return prisma.organization.count().catch(() => 0);
}
