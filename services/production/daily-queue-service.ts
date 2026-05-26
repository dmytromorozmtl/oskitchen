import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export type TodayOrderItem = {
  id: string;
  customerName: string;
  items: string[];
  status: string;
  createdAt: string;
  tableName?: string;
  priority: "high" | "normal" | "low";
  hasAllergenConflict?: boolean;
};

function priorityFromAge(createdAt: Date): TodayOrderItem["priority"] {
  const ageMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  if (ageMinutes > 20) return "high";
  if (ageMinutes > 10) return "normal";
  return "low";
}

/**
 * Active same-day orders for the daily production queue (restaurant / café / bar).
 */
export async function getTodayQueue(userId: string): Promise<TodayOrderItem[]> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(today);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: today, lte: tomorrow },
    status: { notIn: ["CANCELLED", "COMPLETED"] },
  });
  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      customerName: true,
      status: true,
      createdAt: true,
      sourceMetadataJson: true,
      customerId: true,
      orderItems: {
        select: {
          title: true,
          product: {
            select: {
              title: true,
              allergens: true,
              allergenProfile: { select: { containsJson: true } },
            },
          },
        },
      },
      kitchenCustomer: { select: { allergiesJson: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return orders.map((order) => {
    const meta = order.sourceMetadataJson as { table?: string; tableId?: string } | null;
    const tableName = meta?.table ?? meta?.tableId ?? undefined;
    const items = order.orderItems.map(
      (i) => i.title?.trim() || i.product?.title?.trim() || "Item",
    );

    const customerAllergies = Array.isArray(order.kitchenCustomer?.allergiesJson)
      ? (order.kitchenCustomer!.allergiesJson as string[]).filter((x) => typeof x === "string")
      : [];
    const orderAllergens = new Set<string>();
    for (const item of order.orderItems) {
      if (!item.product) continue;
      if (Array.isArray(item.product.allergenProfile?.containsJson)) {
        for (const a of item.product.allergenProfile.containsJson as string[]) {
          if (typeof a === "string") orderAllergens.add(a);
        }
      }
      if (item.product.allergens) {
        for (const part of item.product.allergens.split(/[,;]/)) {
          const t = part.trim();
          if (t) orderAllergens.add(t);
        }
      }
    }
    const hasAllergenConflict = customerAllergies.some((a) => orderAllergens.has(a));

    return {
      id: order.id,
      customerName: order.customerName?.trim() || "Walk-in",
      items,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      tableName,
      priority: priorityFromAge(order.createdAt),
      hasAllergenConflict,
    };
  });
}
