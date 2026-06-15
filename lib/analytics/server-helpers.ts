import { prisma } from "@/lib/prisma";

export async function loadFilterableBrandsAndLocations(userId: string) {
  const [brands, locations] = await Promise.all([
    prisma.brand.findMany({ where: { workspaceId: userId }, select: { id: true, name: true }, take: 12, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { userId }, select: { id: true, name: true }, take: 12, orderBy: { name: "asc" } }),
  ]);
  return { brands, locations };
}
