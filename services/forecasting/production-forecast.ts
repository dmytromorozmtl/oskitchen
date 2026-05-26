/**
 * Deterministic production forecast — does not guarantee demand.
 * Optional AI narrative can wrap this output when OPENAI_API_KEY is configured (see copilot).
 */

import type { Menu, Order, Product } from "@prisma/client";

export type ForecastLine = {
  productId: string;
  title: string;
  expectedOrders: number;
  expectedQuantity: number;
  confidence: "low" | "medium" | "high";
  bufferUnits: number;
  riskFlags: string[];
};

export type ProductionForecastResult = {
  horizonDays: number;
  expectedTotalOrders: number;
  lines: ForecastLine[];
  notes: string[];
};

function weekdayIndex(d: Date) {
  return d.getDay();
}

/** Simple moving average of units sold per product from recent confirmed orders. */
export function buildProductionForecast(params: {
  recentOrders: (Pick<Order, "createdAt" | "status"> & {
    orderItems: { quantity: number; productId: string }[];
  })[];
  activeMenuProducts: Pick<Product, "id" | "title">[];
  horizonDays?: number;
}): ProductionForecastResult {
  const horizonDays = params.horizonDays ?? 7;
  const notes: string[] = [
    "Forecast uses recent KitchenOS order history only — not medical or nutritional advice.",
    "External channels without history here may skew lower until integrations sync.",
  ];

  const productIds = new Set(params.activeMenuProducts.map((p) => p.id));
  const qtyByProduct = new Map<string, number>();
  let orderCount = 0;

  const cutoff = Date.now() - horizonDays * 86400000;
  for (const o of params.recentOrders) {
    if (o.status === "CANCELLED") continue;
    if (o.createdAt.getTime() < cutoff) continue;
    orderCount++;
    for (const li of o.orderItems) {
      if (!productIds.has(li.productId)) continue;
      qtyByProduct.set(li.productId, (qtyByProduct.get(li.productId) ?? 0) + li.quantity);
    }
  }

  const denom = Math.max(1, horizonDays / 7); // scale weekly-ish
  const lines: ForecastLine[] = params.activeMenuProducts.map((p) => {
    const weeklyQty = (qtyByProduct.get(p.id) ?? 0) / denom;
    const expectedQuantity = Math.max(1, Math.round(weeklyQty * 1.08));
    const expectedOrders = Math.max(1, Math.round(orderCount / Math.max(1, productIds.size)));
    const confidence: ForecastLine["confidence"] =
      orderCount >= 10 ? "medium" : orderCount >= 3 ? "low" : "low";
    const riskFlags: string[] = [];
    if (orderCount < 5) riskFlags.push("thin_history");
    const dow = weekdayIndex(new Date());
    if (dow === 0 || dow === 6) riskFlags.push("weekend_effect_unmodeled");
    return {
      productId: p.id,
      title: p.title,
      expectedOrders,
      expectedQuantity,
      confidence,
      bufferUnits: Math.ceil(expectedQuantity * 0.1),
      riskFlags,
    };
  });

  return {
    horizonDays,
    expectedTotalOrders: Math.max(orderCount, Math.round(orderCount * 1.05)),
    lines,
    notes,
  };
}
