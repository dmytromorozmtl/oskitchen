import type { StorefrontFulfillmentRule, StorefrontSettings } from "@prisma/client";
import { startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import { evaluateFulfillmentRulesJson } from "@/lib/storefront/fulfillment-rules";

export async function runStorefrontFulfillmentRuleEngine(
  sf: Pick<StorefrontSettings, "id" | "timezone"> & { fulfillmentRules?: StorefrontFulfillmentRule[] },
  input: {
    fulfillmentType: "PICKUP" | "DELIVERY";
    fulfillmentDate: Date;
    productIds: string[];
    subtotal: number;
    matchedZoneName?: string | null;
    orderingNow?: Date;
  },
): Promise<Awaited<ReturnType<typeof evaluateFulfillmentRulesJson>>> {
  const rules =
    sf.fulfillmentRules ??
    (await prisma.storefrontFulfillmentRule.findMany({
      where: { storefrontId: sf.id, active: true },
      orderBy: { priority: "desc" },
    }));

  const dayStart = startOfDay(input.fulfillmentDate);

  const orderCountForDay = async (dayIso: string): Promise<number> => {
    const [y, m, d] = dayIso.split("-").map((x) => parseInt(x, 10));
    const from = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const to = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    return prisma.storefrontOrder.count({
      where: {
        storefrontId: sf.id,
        isTestOrder: false,
        OR: [{ pickupDate: { gte: from, lte: to } }, { deliveryDate: { gte: from, lte: to } }],
      },
    });
  };

  const orderCountBetween = async (from: Date, to: Date): Promise<number> => {
    return prisma.storefrontOrder.count({
      where: {
        storefrontId: sf.id,
        isTestOrder: false,
        OR: [{ pickupDate: { gte: from, lte: to } }, { deliveryDate: { gte: from, lte: to } }],
      },
    });
  };

  return evaluateFulfillmentRulesJson(
    rules,
    {
      fulfillmentType: input.fulfillmentType,
      fulfillmentDate: dayStart,
      productIds: input.productIds,
      subtotal: input.subtotal,
      matchedZoneName: input.matchedZoneName,
      orderingNow: input.orderingNow,
    },
    { orderCountForDay, orderCountBetween, storefrontTimeZone: sf.timezone || "UTC" },
  );
}
