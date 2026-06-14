import { prisma } from "@/lib/prisma";

export async function listStorefrontCampaigns(storefrontId: string) {
  return prisma.storefrontCampaign.findMany({
    where: { storefrontId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}

export async function listStorefrontReviews(storefrontId: string) {
  return prisma.storefrontReview.findMany({
    where: { storefrontId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function listStorefrontReferrals(storefrontId: string) {
  return prisma.storefrontReferral.findMany({
    where: { storefrontId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function listStorefrontMenuSchedules(storefrontId: string) {
  return prisma.storefrontMenuSchedule.findMany({
    where: { storefrontId },
    orderBy: { startsAt: "asc" },
    take: 50,
  });
}

export async function listStorefrontInventoryItems(storefrontId: string) {
  return prisma.storefrontInventoryItem.findMany({
    where: { storefrontId },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}
