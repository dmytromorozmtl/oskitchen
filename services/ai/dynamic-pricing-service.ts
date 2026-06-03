import { subDays } from "date-fns";

import {
  abVariantPrice,
  buildAbTestId,
  buildSignals,
  changePercent,
  combineMultipliers,
  computeSuggestedPrice,
  inferWeatherFromDate,
  suggestionConfidence,
} from "@/lib/ai/dynamic-pricing-builders";
import type {
  DynamicPricingDashboard,
  DynamicPricingStorage,
  DynamicPricingSuggestion,
  DynamicPricingWeather,
} from "@/lib/ai/dynamic-pricing-types";
import {
  assessDynamicPricingReadiness,
  assertDynamicPricingValidation,
  validateDynamicPricingAbLift,
  validateDynamicPricingPrice,
  validateDynamicPricingSuggestionIntegrity,
} from "@/lib/ai/dynamic-pricing-validation";
import {
  loadDynamicPricingStorage,
  saveDynamicPricingStorage,
} from "@/lib/ai/dynamic-pricing-storage";
import { prisma } from "@/lib/prisma";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const LOOKBACK_DAYS = 14;
const MAX_SUGGESTIONS = 20;

const HONESTY_NOTE =
  "Demand-based estimates use your order history, time-of-day, calendar events, and a weather proxy. Validate against your POS and local regulations before changing menu prices. A/B tests tag variant orders in source metadata until you end the experiment.";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function localHourInTimezone(date: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(date);
    const hour = parts.find((p) => p.type === "hour")?.value;
    return hour != null ? Number(hour) : date.getHours();
  } catch {
    return date.getHours();
  }
}

async function loadProductDemand(
  userId: string,
): Promise<{ byProduct: Map<string, number>; lineCount: number }> {
  const since = subDays(new Date(), LOOKBACK_DAYS);
  const lines = await prisma.orderItem.findMany({
    where: {
      order: {
        userId,
        createdAt: { gte: since },
        status: { not: "CANCELLED" },
      },
      productId: { not: null },
    },
    select: { productId: true, quantity: true },
    take: 2000,
  });

  const byProduct = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId) continue;
    byProduct.set(line.productId, (byProduct.get(line.productId) ?? 0) + line.quantity);
  }
  return { byProduct, lineCount: lines.length };
}

function buildProductSuggestion(input: {
  product: { id: string; title: string; category: string; price: { toString(): string } | number };
  productOrderCount: number;
  avgOrdersPerProduct: number;
  localHour: number;
  weather: DynamicPricingWeather;
  date: Date;
}): DynamicPricingSuggestion | null {
  const currentPrice = decimalToNumber(input.product.price);
  if (currentPrice <= 0) return null;

  const signals = buildSignals({
    localHour: input.localHour,
    weather: input.weather,
    date: input.date,
    productOrderCount: input.productOrderCount,
    avgOrdersPerProduct: input.avgOrdersPerProduct,
  });

  const combined = combineMultipliers(signals.map((s) => s.multiplier));
  const suggestedPrice = computeSuggestedPrice(currentPrice, combined);
  const pct = changePercent(currentPrice, suggestedPrice);

  if (Math.abs(pct) < 1) return null;

  return {
    productId: input.product.id,
    title: input.product.title,
    category: input.product.category,
    currentPrice,
    suggestedPrice,
    changePercent: pct,
    confidence: suggestionConfidence(pct, signals.length),
    signals,
    rationale:
      pct > 0
        ? `Raise price +${pct}% while demand signals are favorable.`
        : `Trim price ${pct}% to lift slow-period conversion.`,
  };
}

function buildActiveSignals(input: {
  localHour: number;
  weather: DynamicPricingWeather;
  date: Date;
}): DynamicPricingDashboard["activeSignals"] {
  return buildSignals({
    localHour: input.localHour,
    weather: input.weather,
    date: input.date,
    productOrderCount: 0,
    avgOrdersPerProduct: 1,
  }).filter((s) => s.kind !== "demand");
}

export async function loadDynamicPricingDashboard(userId: string): Promise<DynamicPricingDashboard> {
  const now = new Date();
  const [storage, kitchen, productWhere, demandSnapshot] = await Promise.all([
    loadDynamicPricingStorage(userId),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { currency: true, timezone: true },
    }),
    productListWhereForOwner(userId),
    loadProductDemand(userId),
  ]);

  const demand = demandSnapshot.byProduct;
  const readiness = assessDynamicPricingReadiness(demandSnapshot.lineCount);

  const timezone = kitchen?.timezone ?? "UTC";
  const currency = kitchen?.currency ?? "USD";
  const weather =
    storage.weatherOverride ?? inferWeatherFromDate(now);
  const localHour = localHourInTimezone(now, timezone);

  const products = await prisma.product.findMany({
    where: { ...productWhere, active: true },
    select: { id: true, title: true, category: true, price: true },
    orderBy: { sortOrder: "asc" },
    take: 80,
  });

  const orderCounts = [...demand.values()];
  const avgOrders =
    orderCounts.length > 0
      ? orderCounts.reduce((a, b) => a + b, 0) / orderCounts.length
      : 1;

  const suggestions: DynamicPricingSuggestion[] = [];

  for (const product of products) {
    const suggestion = buildProductSuggestion({
      product,
      productOrderCount: demand.get(product.id) ?? 0,
      avgOrdersPerProduct: avgOrders,
      localHour,
      weather,
      date: now,
    });
    if (suggestion) suggestions.push(suggestion);
  }

  suggestions.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  const top = suggestions.slice(0, MAX_SUGGESTIONS);

  const lifts = top.map((s) => s.changePercent);
  const avgLift =
    lifts.length > 0 ? Math.round((lifts.reduce((a, b) => a + b, 0) / lifts.length) * 10) / 10 : 0;

  return {
    enabled: storage.enabled,
    currency,
    timezone,
    weather,
    activeSignals: buildActiveSignals({ localHour, weather, date: now }),
    suggestions: top,
    abTests: storage.abTests.filter((t) => t.status === "running").slice(0, 10),
    summary: {
      itemsScanned: products.length,
      suggestionsCount: top.length,
      avgLiftPercent: avgLift,
      runningExperiments: storage.abTests.filter((t) => t.status === "running").length,
      orderLinesInLookback: demandSnapshot.lineCount,
    },
    readiness,
    scannedAt: now.toISOString(),
    honestyNote: HONESTY_NOTE,
  };
}

export async function setDynamicPricingEnabled(
  userId: string,
  enabled: boolean,
): Promise<DynamicPricingDashboard> {
  const storage = await loadDynamicPricingStorage(userId);
  await saveDynamicPricingStorage(userId, { ...storage, enabled });
  return loadDynamicPricingDashboard(userId);
}

export async function setDynamicPricingWeather(
  userId: string,
  weather: DynamicPricingWeather | null,
): Promise<DynamicPricingDashboard> {
  const storage = await loadDynamicPricingStorage(userId);
  await saveDynamicPricingStorage(userId, {
    ...storage,
    weatherOverride: weather,
  });
  return loadDynamicPricingDashboard(userId);
}

export async function applyDynamicPricingSuggestion(
  userId: string,
  productId: string,
  suggestedPrice: number,
): Promise<DynamicPricingDashboard> {
  const where = await productListWhereForOwner(userId);
  const product = await prisma.product.findFirst({
    where: { ...where, id: productId },
    select: { id: true, title: true, category: true, price: true },
  });
  if (!product) {
    throw new Error("Menu item not found.");
  }

  const currentPrice = decimalToNumber(product.price);
  const dashboard = await loadDynamicPricingDashboard(userId);
  const liveSuggestion = dashboard.suggestions.find((s) => s.productId === productId);

  const validation = liveSuggestion
    ? validateDynamicPricingSuggestionIntegrity({
        currentPrice,
        clientSuggestedPrice: suggestedPrice,
        serverSuggestedPrice: liveSuggestion.suggestedPrice,
      })
    : validateDynamicPricingPrice({ currentPrice, proposedPrice: suggestedPrice });

  assertDynamicPricingValidation(validation);

  await prisma.product.update({
    where: { id: productId },
    data: { price: validation.normalizedPrice },
  });

  return loadDynamicPricingDashboard(userId);
}

export async function startDynamicPricingAbTest(
  userId: string,
  productId: string,
  liftPercent = 5,
): Promise<DynamicPricingDashboard> {
  assertDynamicPricingValidation(validateDynamicPricingAbLift(liftPercent));

  const where = await productListWhereForOwner(userId);
  const product = await prisma.product.findFirst({
    where: { ...where, id: productId },
    select: { id: true, title: true, price: true },
  });
  if (!product) {
    throw new Error("Menu item not found.");
  }

  const storage = await loadDynamicPricingStorage(userId);
  const controlPrice = decimalToNumber(product.price);
  const startedAtIso = new Date().toISOString();
  const variantPrice = abVariantPrice(controlPrice, liftPercent);

  const test = {
    id: buildAbTestId(productId, startedAtIso),
    productId: product.id,
    productTitle: product.title,
    controlPrice,
    variantPrice,
    variantLabel: "B" as const,
    status: "running" as const,
    startedAtIso,
    ordersControl: 0,
    ordersVariant: 0,
    revenueControl: 0,
    revenueVariant: 0,
  };

  const abTests = [
    test,
    ...storage.abTests.filter((t) => t.productId !== productId || t.status === "completed"),
  ].slice(0, 12);

  await saveDynamicPricingStorage(userId, { ...storage, enabled: true, abTests });
  return loadDynamicPricingDashboard(userId);
}

export async function endDynamicPricingAbTest(
  userId: string,
  testId: string,
): Promise<DynamicPricingDashboard> {
  const storage = await loadDynamicPricingStorage(userId);
  const abTests = storage.abTests.map((t) =>
    t.id === testId ? { ...t, status: "completed" as const } : t,
  );
  await saveDynamicPricingStorage(userId, { ...storage, abTests });
  return loadDynamicPricingDashboard(userId);
}

export type { DynamicPricingDashboard, DynamicPricingStorage };
