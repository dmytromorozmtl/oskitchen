import { addDays, differenceInCalendarDays } from "date-fns";

import {
  assembleAiPurchasingResult,
  buildPurchaseRecommendation,
} from "@/lib/ai/ai-purchasing-builders";
import type {
  AiPurchasingDailyBrief,
  AiPurchasingResult,
  IngredientPurchasingInput,
  PurchaseRecommendation,
  SupplierOfferInput,
} from "@/lib/ai/ai-purchasing-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

export type {
  AiPurchasingDailyBrief,
  AiPurchasingResult,
  PriceOptimization,
  PurchaseRecommendation,
  PurchaseAlternativeSupplier,
  PurchaseSupplierChoice,
  ShortagePrediction,
} from "@/lib/ai/ai-purchasing-types";

/**
 * AI Purchasing — daily usage, 14-day demand forecast, EOQ order quantities,
 * best/alternative supplier with savings. Deterministic engine using demand, suppliers, and forecasts.
 */
export async function generatePurchaseRecommendations(workspaceId: string): Promise<AiPurchasingResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [demand, ingredientScope, supplierScope] = await Promise.all([
    loadDemandCommandCenterPayload(ownerUserId),
    ingredientListWhereForOwner(ownerUserId),
    supplierListWhereForOwner(ownerUserId),
  ]);

  const windowDays = Math.max(
    1,
    differenceInCalendarDays(new Date(demand.window.to), new Date(demand.window.from)) + 1,
  );

  const demandByIngredient = new Map<string, number>();
  for (const row of demand.rows) {
    demandByIngredient.set(
      row.ingredientId,
      (demandByIngredient.get(row.ingredientId) ?? 0) + row.required,
    );
  }

  const ingredientIds = [...new Set([...demandByIngredient.keys()])];
  const ingredients =
    ingredientIds.length === 0
      ? await prisma.ingredient.findMany({
          where: { AND: [ingredientScope, { active: true }] },
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            currentStock: true,
            parLevel: true,
            reorderPoint: true,
            supplier: true,
            costPerUnit: true,
          },
          take: 200,
          orderBy: { name: "asc" },
        })
      : await prisma.ingredient.findMany({
          where: { AND: [ingredientScope, { id: { in: ingredientIds }, active: true }] },
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            currentStock: true,
            parLevel: true,
            reorderPoint: true,
            supplier: true,
            costPerUnit: true,
          },
        });

  const allIngredientIds = ingredients.map((i) => i.id);
  const forecastEnd = addDays(new Date(), 14);

  const [supplierItems, forecastLines] = await Promise.all([
    allIngredientIds.length === 0
      ? []
      : prisma.supplierItem.findMany({
          where: {
            ingredientId: { in: allIngredientIds },
            active: true,
            supplier: { AND: [supplierScope, { active: true }] },
          },
          include: {
            supplier: { select: { id: true, name: true, leadTimeDays: true } },
          },
        }),
    allIngredientIds.length === 0
      ? []
      : prisma.forecastLine.findMany({
          where: {
            ingredientId: { in: allIngredientIds },
            forecastDate: { lte: forecastEnd, gte: new Date() },
          },
          select: { ingredientId: true, recommendedQuantity: true },
        }),
  ]);

  const offersByIngredient = new Map<string, SupplierOfferInput[]>();
  for (const item of supplierItems) {
    const list = offersByIngredient.get(item.ingredientId) ?? [];
    list.push({
      supplierId: item.supplier.id,
      supplierName: item.supplier.name,
      supplierItemId: item.id,
      unitCost: Number(item.unitCost),
      purchaseUnit: item.purchaseUnit,
      packSize: item.packSize != null ? Number(item.packSize) : null,
      minimumQuantity: item.minimumQuantity != null ? Number(item.minimumQuantity) : null,
      leadTimeDays: item.leadTimeDays ?? item.supplier.leadTimeDays ?? 3,
    });
    offersByIngredient.set(item.ingredientId, list);
  }

  const forecastByIngredient = new Map<string, number>();
  for (const line of forecastLines) {
    if (!line.ingredientId) continue;
    forecastByIngredient.set(
      line.ingredientId,
      (forecastByIngredient.get(line.ingredientId) ?? 0) + Number(line.recommendedQuantity),
    );
  }

  const purchasingInputs: IngredientPurchasingInput[] = ingredients.map((ing) => ({
    ingredientId: ing.id,
    name: ing.name,
    unit: ing.unit,
    category: ing.category,
    currentStock: Number(ing.currentStock),
    reorderPoint: ing.reorderPoint != null ? Number(ing.reorderPoint) : null,
    parLevel: Number(ing.parLevel),
    defaultSupplierName: ing.supplier,
    defaultUnitCost: Number(ing.costPerUnit),
    demandRequired: demandByIngredient.get(ing.id) ?? 0,
    forecast14d: forecastByIngredient.get(ing.id) ?? null,
    supplierOffers: offersByIngredient.get(ing.id) ?? [],
  }));

  const recommendations: PurchaseRecommendation[] = [];
  for (const input of purchasingInputs) {
    const rec = buildPurchaseRecommendation(input, windowDays);
    if (rec) recommendations.push(rec);
  }

  return assembleAiPurchasingResult({
    workspaceId,
    recommendations,
  });
}

export async function generatePurchaseRecommendationsForUser(userId: string): Promise<AiPurchasingResult> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return generatePurchaseRecommendations(workspaceId);
}

/** Critical purchase recommendations — stock below lead time coverage. */
export async function generateCriticalPurchaseRecommendations(
  workspaceId: string,
): Promise<PurchaseRecommendation[]> {
  const result = await generatePurchaseRecommendations(workspaceId);
  return result.recommendations.filter((r) => r.urgency === "critical" || r.urgency === "high");
}

/** Daily purchasing brief — shortage prediction, price optimization, supplier switches. */
export async function generateAiPurchasingDailyBrief(
  workspaceId: string,
): Promise<AiPurchasingDailyBrief> {
  const result = await generatePurchaseRecommendations(workspaceId);
  return result.dailyBrief;
}

export async function generateAiPurchasingDailyBriefForUser(
  userId: string,
): Promise<AiPurchasingDailyBrief> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return generateAiPurchasingDailyBrief(workspaceId);
}
