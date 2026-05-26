import {
  Prisma,
  type ForecastConfidence,
  type ForecastSourceType,
  type ForecastType,
} from "@prisma/client";

import {
  applyBuffer,
  combineContributions,
  dayRange,
  isoDate,
  sameWeekdayAverage,
  simpleMovingAverage,
  startOfDay,
} from "@/lib/forecast/forecast-calculations";
import { deriveConfidence, deriveRunConfidence } from "@/lib/forecast/forecast-confidence";
import {
  bufferDefaultForMode,
  clampBufferPercent,
} from "@/lib/forecast/forecast-buffers";
import type { ForecastSourceContribution } from "@/lib/forecast/forecast-sources";
import { mergeContributions } from "@/lib/forecast/forecast-sources";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  forecastRunByIdWhereForOwner,
  forecastRunListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type RunForecastInput = {
  userId: string;
  title: string;
  forecastType: ForecastType;
  dateFrom: Date;
  dateTo: Date;
  sources: ForecastSourceType[];
  bufferPercent?: number;
  brandId?: string | null;
  locationId?: string | null;
  menuId?: string | null;
  channel?: string | null;
  fulfillmentType?: "PICKUP" | "DELIVERY" | null;
  createdBy?: string | null;
};

const HISTORY_LOOKBACK_DAYS = 90;

/* ============================ orchestration ============================ */

export async function createForecastRun(input: RunForecastInput) {
  const dateFrom = startOfDay(input.dateFrom);
  const dateTo = startOfDay(input.dateTo);
  if (dateTo < dateFrom) throw new Error("dateTo must be on or after dateFrom");

  const profile = await prisma.userProfile.findUnique({
    where: { id: input.userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const businessMode = profile?.kitchenSettings?.businessType ?? null;
  const bufferPercent = clampBufferPercent(input.bufferPercent ?? bufferDefaultForMode(businessMode));

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const run = await prisma.forecastRun.create({
    data: {
      userId: input.userId,
      workspaceId,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      title: input.title,
      forecastType: input.forecastType,
      dateFrom,
      dateTo,
      sourceTypesJson: input.sources as unknown as Prisma.InputJsonValue,
      filtersJson: {
        menuId: input.menuId ?? null,
        channel: input.channel ?? null,
        fulfillmentType: input.fulfillmentType ?? null,
      } as Prisma.InputJsonValue,
      status: "DRAFT",
      confidence: "LOW",
      bufferPercent: new Prisma.Decimal(bufferPercent),
      createdBy: input.createdBy ?? null,
    },
  });

  await prisma.forecastEvent.create({
    data: {
      forecastRunId: run.id,
      eventType: "RUN_CREATED",
      performedBy: input.createdBy ?? null,
      metadataJson: { sources: input.sources, dateFrom, dateTo } as Prisma.InputJsonValue,
    },
  });

  // Build product-level lines. For non-PRODUCT_DEMAND types, we still
  // produce product-level lines and let the UI label them; INGREDIENT_DEMAND
  // additionally expands to ingredient lines.
  const productLines = await buildProductDemandLines(input, bufferPercent);

  const linesToCreate = productLines.map((l) => ({
    forecastRunId: run.id,
    productId: l.productId ?? null,
    menuId: l.menuId ?? null,
    ingredientId: null,
    label: l.label,
    sourceType: l.dominantSource,
    forecastDate: l.forecastDate ?? null,
    forecastQuantity: new Prisma.Decimal(l.forecastQuantity),
    unit: l.unit ?? "ea",
    confidence: l.confidence,
    bufferQuantity: new Prisma.Decimal(l.bufferQuantity),
    recommendedQuantity: new Prisma.Decimal(l.recommendedQuantity),
    sourceSummaryJson: l.sourceSummary as unknown as Prisma.InputJsonValue,
    notes: l.notes ?? null,
  }));

  if (linesToCreate.length > 0) {
    await prisma.forecastLine.createMany({ data: linesToCreate });
  }

  if (input.forecastType === "INGREDIENT_DEMAND" && productLines.length > 0) {
    const ingredientLines = await expandToIngredientLines(input.userId, productLines, bufferPercent);
    if (ingredientLines.length > 0) {
      await prisma.forecastLine.createMany({
        data: ingredientLines.map((il) => ({
          forecastRunId: run.id,
          productId: null,
          menuId: null,
          ingredientId: il.ingredientId,
          label: il.label,
          sourceType: "PRODUCTION_PLAN" as ForecastSourceType,
          forecastDate: null,
          forecastQuantity: new Prisma.Decimal(il.forecastQuantity),
          unit: il.unit,
          confidence: il.confidence,
          bufferQuantity: new Prisma.Decimal(il.bufferQuantity),
          recommendedQuantity: new Prisma.Decimal(il.recommendedQuantity),
          sourceSummaryJson: il.sourceSummary as unknown as Prisma.InputJsonValue,
          notes: null,
        })),
      });
    }
  }

  const runConfidence = deriveRunConfidence(productLines.map((l) => ({ confidence: l.confidence })));
  const completed = await prisma.forecastRun.update({
    where: { id: run.id },
    data: { status: "COMPLETED", confidence: runConfidence, completedAt: new Date() },
  });
  await prisma.forecastEvent.create({
    data: {
      forecastRunId: run.id,
      eventType: "RUN_COMPLETED",
      performedBy: input.createdBy ?? null,
      metadataJson: { lineCount: linesToCreate.length, confidence: runConfidence } as Prisma.InputJsonValue,
    },
  });

  return completed;
}

/* ============================ product-level lines ============================ */

export type BuiltProductLine = {
  productId: string | null;
  menuId: string | null;
  label: string;
  forecastDate: Date | null;
  forecastQuantity: number;
  unit: string;
  confidence: ForecastConfidence;
  bufferQuantity: number;
  recommendedQuantity: number;
  dominantSource: ForecastSourceType;
  sourceSummary: ForecastSourceContribution[];
  notes?: string;
};

async function buildProductDemandLines(
  input: RunForecastInput,
  bufferPercent: number,
): Promise<BuiltProductLine[]> {
  const dateFrom = startOfDay(input.dateFrom);
  const dateTo = startOfDay(input.dateTo);

  const wantsHistory = input.sources.includes("HISTORICAL_ORDERS") || input.sources.includes("SALES_CHANNELS");
  const wantsMealPlans = input.sources.includes("MEAL_PLANS");
  const wantsCatering = input.sources.includes("ACCEPTED_CATERING_EVENTS");
  const wantsMenu = input.sources.includes("ACTIVE_MENU") || input.sources.includes("UPCOMING_MENU") || input.sources.includes("MENU_PLANNER");

  const productAccumulator = new Map<
    string,
    {
      label: string;
      menuId: string | null;
      contributions: ForecastSourceContribution[];
      historyDataPoints: number;
      hasMealPlanContribution: boolean;
      hasCateringContribution: boolean;
    }
  >();

  function bump(
    productId: string,
    label: string,
    menuId: string | null,
    contribution: ForecastSourceContribution,
    historyAdd: number,
  ): void {
    const prev = productAccumulator.get(productId);
    if (prev) {
      prev.contributions.push(contribution);
      prev.historyDataPoints += historyAdd;
      if (contribution.source === "MEAL_PLANS") prev.hasMealPlanContribution = true;
      if (contribution.source === "ACCEPTED_CATERING_EVENTS") prev.hasCateringContribution = true;
    } else {
      productAccumulator.set(productId, {
        label,
        menuId,
        contributions: [contribution],
        historyDataPoints: historyAdd,
        hasMealPlanContribution: contribution.source === "MEAL_PLANS",
        hasCateringContribution: contribution.source === "ACCEPTED_CATERING_EVENTS",
      });
    }
  }

  /* ---- HISTORICAL_ORDERS / SALES_CHANNELS ---- */
  if (wantsHistory) {
    const lookbackFrom = new Date(dateFrom);
    lookbackFrom.setDate(lookbackFrom.getDate() - HISTORY_LOOKBACK_DAYS);
    const historyOrders = await prisma.order.findMany({
      where: {
        userId: input.userId,
        createdAt: { gte: lookbackFrom, lte: new Date() },
        status: { notIn: ["CANCELLED"] },
        ...(input.brandId ? { brandId: input.brandId } : {}),
        ...(input.locationId ? { locationId: input.locationId } : {}),
        ...(input.fulfillmentType ? { fulfillmentType: input.fulfillmentType } : {}),
      },
      select: {
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            productId: true,
            product: { select: { id: true, title: true, menuId: true } },
          },
        },
      },
    });

    type DailyByProduct = Map<string, Map<string, number>>; // dateISO → productId → qty
    const daily: DailyByProduct = new Map();
    const products = new Map<string, { title: string; menuId: string }>();
    for (const o of historyOrders) {
      const dateKey = isoDate(o.createdAt);
      const dayMap = daily.get(dateKey) ?? new Map();
      for (const li of o.orderItems) {
        if (!li.product) continue;
        products.set(li.product.id, { title: li.product.title, menuId: li.product.menuId });
        dayMap.set(li.productId, (dayMap.get(li.productId) ?? 0) + li.quantity);
      }
      daily.set(dateKey, dayMap);
    }

    products.forEach((info, productId) => {
      // Build dense same-weekday series for the forecast window.
      const seriesByWeekday = new Map<number, { date: Date; value: number }[]>();
      for (let i = 0; i < HISTORY_LOOKBACK_DAYS; i++) {
        const d = new Date(lookbackFrom);
        d.setDate(d.getDate() + i);
        const key = isoDate(d);
        const value = daily.get(key)?.get(productId) ?? 0;
        const wd = d.getDay();
        const bucket = seriesByWeekday.get(wd) ?? [];
        bucket.push({ date: d, value });
        seriesByWeekday.set(wd, bucket);
      }
      const overallSeries = [...seriesByWeekday.values()].flat();
      const overallMa = simpleMovingAverage(overallSeries.slice(-Math.min(28, overallSeries.length)));
      const horizonDates = dayRange(dateFrom, dateTo);
      let projected = 0;
      let historyPoints = 0;
      for (const day of horizonDates) {
        const weekdayMa = sameWeekdayAverage(overallSeries, day.getDay());
        const blend = weekdayMa > 0 ? weekdayMa : overallMa;
        projected += blend;
        historyPoints += 1;
      }
      const note = overallSeries.length < 14 ? "Thin history — confidence low" : undefined;
      if (projected > 0) {
        bump(productId, info.title, info.menuId, {
          source: "HISTORICAL_ORDERS",
          quantity: Math.round(projected),
          note,
        }, historyPoints);
      }
    });
  }

  /* ---- ACTIVE_MENU / UPCOMING_MENU ---- */
  if (wantsMenu) {
    const menuWhere: Prisma.MenuWhereInput = {
      userId: input.userId,
      catalogOnly: false,
      ...(input.menuId ? { id: input.menuId } : {}),
      ...(input.sources.includes("ACTIVE_MENU") ? { active: true } : {}),
      ...(input.sources.includes("UPCOMING_MENU") ? { startDate: { gte: new Date() } } : {}),
    };
    const menus = await prisma.menu.findMany({
      where: menuWhere,
      include: { products: { where: { active: true }, select: { id: true, title: true, menuId: true } } },
      take: 10,
    });
    // Menu inclusion contributes 0 quantity but enriches with the menu's products.
    for (const menu of menus) {
      for (const p of menu.products) {
        if (!productAccumulator.has(p.id)) {
          bump(p.id, p.title, p.menuId, {
            source: "ACTIVE_MENU",
            quantity: 0,
            note: "Listed on selected menu — no historical demand yet.",
          }, 0);
        }
      }
    }
  }

  /* ---- MEAL_PLANS ---- */
  if (wantsMealPlans) {
    const cycles = await prisma.mealPlanCycle.findMany({
      where: {
        cycleStartDate: { gte: dateFrom, lte: dateTo },
        status: { in: ["UPCOMING", "NEEDS_SELECTION", "READY_TO_GENERATE"] },
        mealPlan: {
          userId: input.userId,
          status: "ACTIVE",
          ...(input.brandId ? { brandId: input.brandId } : {}),
          ...(input.locationId ? { locationId: input.locationId } : {}),
        },
      },
      include: {
        selections: { select: { productId: true, quantity: true, product: { select: { id: true, title: true, menuId: true } } } },
        mealPlan: { select: { mealsPerCycle: true, servingsPerMeal: true, name: true } },
      },
    });
    for (const cycle of cycles) {
      for (const sel of cycle.selections) {
        if (!sel.product || !sel.productId) continue;
        const qty = sel.quantity * (cycle.mealPlan.servingsPerMeal ?? 1);
        bump(sel.productId, sel.product.title, sel.product.menuId, {
          source: "MEAL_PLANS",
          quantity: qty,
          note: `Committed via meal plan "${cycle.mealPlan.name}"`,
        }, 0);
      }
    }
  }

  /* ---- ACCEPTED_CATERING_EVENTS ---- */
  if (wantsCatering) {
    const quotes = await prisma.cateringQuote.findMany({
      where: {
        userId: input.userId,
        status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] },
        eventDate: { gte: dateFrom, lte: dateTo },
        ...(input.brandId ? { brandId: input.brandId } : {}),
        ...(input.locationId ? { locationId: input.locationId } : {}),
      },
      include: {
        items: { select: { productId: true, quantity: true, title: true, product: { select: { id: true, title: true, menuId: true } } } },
      },
    });
    for (const quote of quotes) {
      for (const item of quote.items) {
        if (item.productId && item.product) {
          bump(item.productId, item.product.title, item.product.menuId, {
            source: "ACCEPTED_CATERING_EVENTS",
            quantity: item.quantity,
            note: `Accepted event ${quote.eventName ?? quote.customerName}`,
          }, 0);
        } else {
          // Free-text catering line — keyed by quote+title.
          const pseudoId = `catering:${quote.id}:${item.title}`;
          bump(pseudoId, item.title, null, {
            source: "ACCEPTED_CATERING_EVENTS",
            quantity: item.quantity,
            note: `Accepted event ${quote.eventName ?? quote.customerName}`,
          }, 0);
        }
      }
    }
  }

  // Materialise into BuiltProductLine[].
  const lines: BuiltProductLine[] = [];
  productAccumulator.forEach((info, productId) => {
    const merged = mergeContributions(info.contributions);
    const totalQty = combineContributions(merged);
    const dominantSource = merged.reduce<{ source: ForecastSourceType; qty: number } | null>(
      (best, c) => (c.quantity > (best?.qty ?? -1) ? { source: c.source, qty: c.quantity } : best),
      null,
    )?.source ?? "HISTORICAL_ORDERS";
    const confidence = deriveConfidence({
      historyDataPoints: info.historyDataPoints,
      hasMealPlanContribution: info.hasMealPlanContribution,
      hasCateringContribution: info.hasCateringContribution,
    });
    const buffer = applyBuffer(totalQty, bufferPercent);
    const note = totalQty === 0
      ? "No demand signal — listed for visibility only."
      : merged.find((c) => c.note)?.note;
    lines.push({
      productId: productId.startsWith("catering:") ? null : productId,
      menuId: info.menuId,
      label: info.label,
      forecastDate: null,
      forecastQuantity: totalQty,
      unit: "ea",
      confidence,
      bufferQuantity: buffer,
      recommendedQuantity: totalQty + buffer,
      dominantSource,
      sourceSummary: merged,
      notes: note,
    });
  });

  // Sort by recommended quantity desc.
  lines.sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);
  // Cap to bound result size while still being comprehensive.
  return lines.slice(0, 250);
}

/* ============================ ingredient expansion ============================ */

export type BuiltIngredientLine = {
  ingredientId: string;
  label: string;
  unit: string;
  forecastQuantity: number;
  bufferQuantity: number;
  recommendedQuantity: number;
  confidence: ForecastConfidence;
  sourceSummary: ForecastSourceContribution[];
};

async function expandToIngredientLines(
  userId: string,
  productLines: BuiltProductLine[],
  bufferPercent: number,
): Promise<BuiltIngredientLine[]> {
  const productIds = productLines.map((l) => l.productId).filter((v): v is string => !!v);
  if (productIds.length === 0) return [];

  const recipeScope = await recipeListWhereForOwner(userId);
  const recipes = await prisma.recipe.findMany({
    where: { AND: [recipeScope, { productId: { in: productIds }, active: true }] },
    include: {
      ingredients: { include: { ingredient: { select: { id: true, name: true, unit: true } } } },
    },
  });

  const recipeByProduct = new Map<string, (typeof recipes)[number]>();
  for (const r of recipes) recipeByProduct.set(r.productId, r);

  const byIngredient = new Map<string, {
    label: string;
    unit: string;
    quantity: number;
    contributions: ForecastSourceContribution[];
  }>();

  for (const pl of productLines) {
    if (!pl.productId) continue;
    const recipe = recipeByProduct.get(pl.productId);
    if (!recipe) continue;
    const yieldQuantity = Number(recipe.yieldQuantity);
    if (yieldQuantity <= 0) continue;
    const scale = pl.recommendedQuantity / yieldQuantity;
    for (const ri of recipe.ingredients) {
      const required = Number(ri.quantity) * scale * (1 + Number(ri.wastePercent) / 100);
      const prev = byIngredient.get(ri.ingredientId);
      const note = `From ${pl.label}`;
      if (prev) {
        prev.quantity += required;
        prev.contributions.push({ source: "PRODUCTION_PLAN", quantity: required, note });
      } else {
        byIngredient.set(ri.ingredientId, {
          label: ri.ingredient.name,
          unit: ri.unit || ri.ingredient.unit,
          quantity: required,
          contributions: [{ source: "PRODUCTION_PLAN", quantity: required, note }],
        });
      }
    }
  }

  const lines: BuiltIngredientLine[] = [];
  byIngredient.forEach((row, ingredientId) => {
    const merged = mergeContributions(row.contributions);
    const forecastQuantity = Math.round(row.quantity * 100) / 100;
    const bufferQuantity = applyBuffer(forecastQuantity, bufferPercent);
    lines.push({
      ingredientId,
      label: row.label,
      unit: row.unit,
      forecastQuantity,
      bufferQuantity,
      recommendedQuantity: forecastQuantity + bufferQuantity,
      confidence: "MEDIUM",
      sourceSummary: merged,
    });
  });
  return lines.sort((a, b) => b.recommendedQuantity - a.recommendedQuantity).slice(0, 500);
}

/* ============================ adjustments ============================ */

export type AddAdjustmentInput = {
  forecastRunId: string;
  userId: string;
  targetType: "global" | "product" | "category";
  targetId?: string | null;
  adjustmentType: "PERCENT" | "FIXED_QUANTITY" | "OVERRIDE";
  value: number;
  reason?: string | null;
  performedBy?: string | null;
};

export async function addForecastAdjustment(input: AddAdjustmentInput) {
  const run = await assertOwnedRun(input.userId, input.forecastRunId);

  const adjustment = await prisma.forecastAdjustment.create({
    data: {
      forecastRunId: run.id,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      adjustmentType: input.adjustmentType,
      value: new Prisma.Decimal(input.value),
      reason: input.reason ?? null,
      createdBy: input.performedBy ?? null,
    },
  });

  // Apply the adjustment to matching lines and write back recommended quantity.
  const lines = await prisma.forecastLine.findMany({ where: { forecastRunId: run.id } });
  const bufferPercent = Number(run.bufferPercent);
  const updates: Promise<unknown>[] = [];
  for (const line of lines) {
    const applies =
      input.targetType === "global"
        ? true
        : input.targetType === "product"
          ? line.productId === input.targetId
          : false;
    if (!applies) continue;
    const currentQty = Number(line.forecastQuantity);
    let nextQty = currentQty;
    if (input.adjustmentType === "PERCENT") nextQty = Math.max(0, currentQty * (1 + input.value / 100));
    else if (input.adjustmentType === "FIXED_QUANTITY") nextQty = Math.max(0, currentQty + input.value);
    else if (input.adjustmentType === "OVERRIDE") nextQty = Math.max(0, input.value);
    const buffer = applyBuffer(nextQty, bufferPercent);
    const prevSummary = (line.sourceSummaryJson as ForecastSourceContribution[] | null) ?? [];
    const summary = mergeContributions([
      ...prevSummary,
      {
        source: "MANUAL_ADJUSTMENT",
        quantity: nextQty - currentQty,
        note: input.reason ?? "Manual adjustment",
      },
    ]);
    updates.push(
      prisma.forecastLine.update({
        where: { id: line.id },
        data: {
          forecastQuantity: new Prisma.Decimal(Math.round(nextQty * 100) / 100),
          bufferQuantity: new Prisma.Decimal(buffer),
          recommendedQuantity: new Prisma.Decimal(Math.round((nextQty + buffer) * 100) / 100),
          sourceSummaryJson: summary as unknown as Prisma.InputJsonValue,
          confidence: input.adjustmentType === "OVERRIDE" ? "MANUAL" : line.confidence,
        },
      }),
    );
  }
  await Promise.all(updates);

  await prisma.forecastEvent.create({
    data: {
      forecastRunId: run.id,
      eventType: "ADJUSTMENT_ADDED",
      performedBy: input.performedBy ?? null,
      metadataJson: {
        targetType: input.targetType,
        targetId: input.targetId,
        adjustmentType: input.adjustmentType,
        value: input.value,
      } as Prisma.InputJsonValue,
    },
  });

  return adjustment;
}

/* ============================ downstream actions ============================ */

export type SendToProductionInput = {
  forecastRunId: string;
  userId: string;
  productionDate: Date;
  title: string;
  performedBy?: string | null;
};

export async function sendForecastToProduction(input: SendToProductionInput) {
  const run = await assertOwnedRun(input.userId, input.forecastRunId);
  const lines = await prisma.forecastLine.findMany({
    where: { forecastRunId: run.id, productId: { not: null } },
    orderBy: { recommendedQuantity: "desc" },
    take: 200,
  });
  const totalItems = lines.reduce((acc, l) => acc + Math.round(Number(l.recommendedQuantity)), 0);
  const batch = await prisma.productionBatch.create({
    data: {
      userId: input.userId,
      brandId: run.brandId ?? null,
      locationId: run.locationId ?? null,
      productionDate: input.productionDate,
      title: input.title,
      mode: "DAILY_PREP",
      status: "DRAFT",
      sourceType: "MANUAL",
      totalItems,
      completedItems: 0,
      notes: `Generated from forecast run "${run.title}".`,
    },
  });
  await prisma.forecastEvent.create({
    data: {
      forecastRunId: run.id,
      eventType: "SENT_TO_PRODUCTION",
      performedBy: input.performedBy ?? null,
      metadataJson: { batchId: batch.id, totalItems } as Prisma.InputJsonValue,
    },
  });
  return batch;
}

export type SendToDemandInput = {
  forecastRunId: string;
  userId: string;
  title: string;
  performedBy?: string | null;
};

export async function sendForecastToIngredientDemand(input: SendToDemandInput) {
  const run = await assertOwnedRun(input.userId, input.forecastRunId);

  // Ensure we have ingredient-level lines; otherwise expand on the fly.
  let ingredientLines = await prisma.forecastLine.findMany({
    where: { forecastRunId: run.id, ingredientId: { not: null } },
  });
  if (ingredientLines.length === 0) {
    const productLines = await prisma.forecastLine.findMany({
      where: { forecastRunId: run.id, productId: { not: null } },
    });
    if (productLines.length === 0) throw new Error("No product lines on this forecast to expand.");
    const builtProductLines: BuiltProductLine[] = productLines.map((p) => ({
      productId: p.productId,
      menuId: p.menuId,
      label: p.label,
      forecastDate: p.forecastDate,
      forecastQuantity: Number(p.forecastQuantity),
      unit: p.unit,
      confidence: p.confidence,
      bufferQuantity: Number(p.bufferQuantity),
      recommendedQuantity: Number(p.recommendedQuantity),
      dominantSource: p.sourceType,
      sourceSummary: (p.sourceSummaryJson as ForecastSourceContribution[] | null) ?? [],
    }));
    const expanded = await expandToIngredientLines(input.userId, builtProductLines, Number(run.bufferPercent));
    if (expanded.length > 0) {
      await prisma.forecastLine.createMany({
        data: expanded.map((il) => ({
          forecastRunId: run.id,
          ingredientId: il.ingredientId,
          label: il.label,
          sourceType: "PRODUCTION_PLAN" as ForecastSourceType,
          forecastQuantity: new Prisma.Decimal(il.forecastQuantity),
          unit: il.unit,
          confidence: il.confidence,
          bufferQuantity: new Prisma.Decimal(il.bufferQuantity),
          recommendedQuantity: new Prisma.Decimal(il.recommendedQuantity),
          sourceSummaryJson: il.sourceSummary as unknown as Prisma.InputJsonValue,
        })),
      });
      ingredientLines = await prisma.forecastLine.findMany({
        where: { forecastRunId: run.id, ingredientId: { not: null } },
      });
    }
  }

  const ingredientIds = [...new Set(ingredientLines.map((l) => l.ingredientId).filter((v): v is string => !!v))];
  const stockMap = new Map<string, number>();
  if (ingredientIds.length > 0) {
    const ingredients = await prisma.ingredient.findMany({ where: { id: { in: ingredientIds }, userId: input.userId } });
    for (const ing of ingredients) stockMap.set(ing.id, Number(ing.currentStock));
  }

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const demandRun = await prisma.ingredientDemandRun.create({
    data: {
      userId: input.userId,
      workspaceId,
      title: input.title,
      dateFrom: run.dateFrom,
      dateTo: run.dateTo,
      sourceTypesJson: ["FORECAST_RUN"] as unknown as Prisma.InputJsonValue,
      filterBrandId: run.brandId ?? null,
      filterLocationId: run.locationId ?? null,
      status: "DRAFT",
      totalLines: ingredientLines.length,
      shortageLines: 0,
    },
  });

  let shortageCount = 0;
  if (ingredientLines.length > 0) {
    await prisma.ingredientDemandRunLine.createMany({
      data: ingredientLines.map((il) => {
        const required = Number(il.recommendedQuantity);
        const stock = il.ingredientId ? stockMap.get(il.ingredientId) ?? null : null;
        const shortage = stock != null ? Math.max(0, required - stock) : null;
        if (shortage && shortage > 0) shortageCount += 1;
        return {
          demandRunId: demandRun.id,
          ingredientId: il.ingredientId!,
          demandDate: run.dateFrom,
          requiredQuantity: new Prisma.Decimal(required),
          unit: il.unit,
          availableQuantity: stock != null ? new Prisma.Decimal(stock) : null,
          shortageQuantity: shortage != null ? new Prisma.Decimal(shortage) : null,
          wastePercentApplied: new Prisma.Decimal(0),
          sourceSummaryJson: il.sourceSummaryJson ?? Prisma.JsonNull,
        };
      }),
    });
  }
  if (shortageCount > 0) {
    await prisma.ingredientDemandRun.update({ where: { id: demandRun.id }, data: { shortageLines: shortageCount } });
  }

  await prisma.forecastEvent.create({
    data: {
      forecastRunId: run.id,
      eventType: "SENT_TO_INGREDIENT_DEMAND",
      performedBy: input.performedBy ?? null,
      metadataJson: { demandRunId: demandRun.id, shortageCount } as Prisma.InputJsonValue,
    },
  });
  return demandRun;
}

/* ============================ helpers / read ============================ */

async function assertOwnedRun(userId: string, runId: string) {
  const where = await forecastRunByIdWhereForOwner(userId, runId);
  const run = await prisma.forecastRun.findFirst({ where });
  if (!run) throw new Error("Forecast run not found.");
  return run;
}

export async function listForecastRuns(userId: string) {
  const where = await forecastRunListWhereForOwner(userId);
  return prisma.forecastRun.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { lines: true, adjustments: true } } },
  });
}

export async function getForecastRunDetail(userId: string, runId: string) {
  const where = await forecastRunByIdWhereForOwner(userId, runId);
  const run = await prisma.forecastRun.findFirst({
    where,
    include: {
      lines: { orderBy: { recommendedQuantity: "desc" } },
      adjustments: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });
  return run;
}

export async function archiveForecastRun(userId: string, runId: string) {
  const run = await assertOwnedRun(userId, runId);
  const updated = await prisma.forecastRun.update({
    where: { id: run.id },
    data: { status: "ARCHIVED" },
  });
  await prisma.forecastEvent.create({
    data: { forecastRunId: run.id, eventType: "ARCHIVED", metadataJson: {} as Prisma.InputJsonValue },
  });
  return updated;
}

export async function restoreForecastRun(userId: string, runId: string) {
  const run = await assertOwnedRun(userId, runId);
  const updated = await prisma.forecastRun.update({
    where: { id: run.id },
    data: { status: "COMPLETED" },
  });
  await prisma.forecastEvent.create({
    data: { forecastRunId: run.id, eventType: "RESTORED", metadataJson: {} as Prisma.InputJsonValue },
  });
  return updated;
}
