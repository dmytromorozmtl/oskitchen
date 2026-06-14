import { endOfDay, startOfDay } from "date-fns";

import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  orderListWhereForOwnerAnd,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { getAIOrderForecast as getBaselineForecast } from "@/services/forecast/ai-forecast-service";

const DEFAULT_MODEL = "gpt-4o-mini";

async function chatJson<T>(prompt: string, fallback: T): Promise<T> {
  const { OPENAI_API_KEY } = getServerEnv();
  if (!OPENAI_API_KEY?.trim()) return fallback;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content;
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function getHistoricalOrders(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const rows = workspaceId
    ? await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS count
        FROM orders
        WHERE workspace_id = ${workspaceId}::uuid
          AND created_at >= ${since}
          AND status::text != 'CANCELLED'
        GROUP BY 1
        ORDER BY 1 ASC
      `
    : await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS count
        FROM orders
        WHERE user_id = ${userId}::uuid
          AND created_at >= ${since}
          AND status::text != 'CANCELLED'
        GROUP BY 1
        ORDER BY 1 ASC
      `;

  return rows.map((r) => ({
    date: r.day.toISOString().slice(0, 10),
    count: Number(r.count),
  }));
}

async function getProductMargins(userId: string) {
  const productWhere = await productListWhereForOwner(userId);
  const products = await prisma.product.findMany({
    where: { AND: [productWhere, { active: true }] },
    select: { title: true, price: true },
    take: 40,
  });
  return products.map((p) => ({
    title: p.title,
    price: Number(p.price),
  }));
}

function getCurrentSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
}

async function getTrendingItems(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: since },
    status: { not: "CANCELLED" },
  });
  const items = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: orderWhere,
      productId: { not: null },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });
  const ids = items.map((i) => i.productId!).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  const titleById = new Map(products.map((p) => [p.id, p.title]));
  return items.map((i) => ({
    title: titleById.get(i.productId!) ?? "Item",
    quantity: i._sum.quantity ?? 0,
  }));
}

async function getLowStockItems(userId: string) {
  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const rows = await prisma.ingredient.findMany({
    where: { AND: [ingredientWhere, { active: true }] },
    select: { name: true, unit: true, currentStock: true, parLevel: true },
    take: 50,
  });
  return rows
    .filter((r) => Number(r.currentStock) < Number(r.parLevel))
    .map((r) => ({
      ingredient: r.name,
      current: Number(r.currentStock),
      par: Number(r.parLevel),
      unit: r.unit,
    }));
}

async function getUpcomingOrders(userId: string, days: number) {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  end.setDate(end.getDate() + days);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: start, lte: end },
    status: { notIn: ["CANCELLED", "COMPLETED"] },
  });
  const count = await prisma.order.count({ where: orderWhere });
  return { days, estimatedActiveOrders: count };
}

export async function getAIOrderForecast(userId: string, days = 7) {
  const baseline = await getBaselineForecast(userId, days);
  const history = await getHistoricalOrders(userId, 90);

  const ai = await chatJson<{
    days?: Array<{ date: string; predicted: number; predictedRevenue?: number }>;
  }>(
    `You are a kitchen operations AI. Based on 90-day order history, predict daily order counts for the next ${days} days.
Consider day-of-week patterns and recent trends.
History: ${JSON.stringify(history)}
Return JSON: { "days": [{ "date": "YYYY-MM-DD", "predicted": number, "predictedRevenue": number }] }`,
    { days: [] },
  );

  if (ai.days?.length) {
    return {
      days: ai.days.map((d) => ({
        date: d.date,
        predictedOrders: Math.max(0, Math.round(d.predicted)),
        predictedRevenue: Math.max(0, Number(d.predictedRevenue ?? 0)),
      })),
      confidence: history.length >= 14 ? 0.82 : 0.55,
      method: "openai_gpt4o_mini" as const,
      note: "Forecast generated with OpenAI using your order history.",
    };
  }

  return {
    ...baseline,
    method: baseline.method,
    note: baseline.note + (getServerEnv().OPENAI_API_KEY ? "" : " Set OPENAI_API_KEY for AI-enhanced forecasts."),
  };
}

export async function getAIMenuSuggestions(userId: string) {
  const products = await getProductMargins(userId);
  const seasons = getCurrentSeason();
  const trends = await getTrendingItems(userId);

  const fallback = {
    suggestions: [
      {
        action: "reprice" as const,
        item: products[0]?.title ?? "Top seller",
        reason: "Review margin on highest-volume item",
        projectedImpact: "Improve prime cost by 1–2%",
      },
    ],
  };

  return chatJson<typeof fallback>(
    `Menu optimization AI. Menu margins: ${JSON.stringify(products.slice(0, 20))}. Season: ${seasons}. Trending: ${JSON.stringify(trends)}.
Suggest 3 changes (add|remove|reprice) to improve profitability.
Return JSON: { "suggestions": [{ "action": "add|remove|reprice", "item": string, "reason": string, "projectedImpact": string }] }`,
    fallback,
  );
}

export async function getAIWhatToOrder(userId: string) {
  const inventory = await getLowStockItems(userId);
  const upcoming = await getUpcomingOrders(userId, 7);

  const fallback = {
    orders: inventory.slice(0, 5).map((i) => ({
      ingredient: i.ingredient,
      quantity: Math.max(1, Math.ceil(i.par - i.current)),
      unit: i.unit,
      reason: "Below par level",
    })),
  };

  return chatJson<typeof fallback>(
    `Purchasing AI. Low stock: ${JSON.stringify(inventory)}. Upcoming workload: ${JSON.stringify(upcoming)}.
Recommend weekly purchase orders with quantities.
Return JSON: { "orders": [{ "ingredient": string, "quantity": number, "unit": string, "reason": string }] }`,
    fallback,
  );
}
