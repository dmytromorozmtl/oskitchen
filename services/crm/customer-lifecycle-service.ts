import { prisma } from "@/lib/prisma";

export async function loadKitchenCustomerSummary(userId: string, kitchenCustomerId: string) {
  return prisma.kitchenCustomer.findFirst({
    where: { id: kitchenCustomerId, userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      totalOrders: true,
      lifetimeValueCents: true,
      lastOrderAt: true,
      firstOrderAt: true,
      marketingConsent: true,
      allergiesJson: true,
      dietaryPreferencesJson: true,
      favoriteItemsJson: true,
      tagsJson: true,
    },
  });
}
