import type { OrderStatus, Prisma, ProductCategory } from "@prisma/client";

import { computeRecipeCostPerOutputUnit } from "@/lib/costing/costing-calculations";
import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import {
  laborRateListWhereForOwner,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { summarizeActualVsTheoretical, type AvtConfidence } from "@/services/costing/actual-vs-theoretical-service";

export type AvtReportConfidence = AvtConfidence;

export type AvtReportFilters = {
  from: Date;
  to: Date;
  brandId?: string | null;
  locationId?: string | null;
  category?: string | null;
  confidence?: AvtReportConfidence | null;
};

export type AvtReportRow = {
  productId: string;
  title: string;
  category: string;
  brandId: string | null;
  locationId: string | null;
  recipeCoverage: boolean;
  theoreticalIngredientCostPerUnit: number | null;
  soldQuantity: number;
  estimatedTheoreticalUsage: number | null;
  receivingConfidenceNote: string;
  confidence: AvtReportConfidence;
  missingDataReasons: string[];
  fixHref: string;
  varianceNote: string | null;
};

export type AvtReportPayload = {
  workspaceSummary: Awaited<ReturnType<typeof summarizeActualVsTheoretical>>;
  rows: AvtReportRow[];
  honestyBanner: string;
};

function rowConfidence(
  hasRecipe: boolean,
  ingredientLines: number,
  workspace: AvtConfidence,
): { confidence: AvtConfidence; missing: string[]; receivingNote: string } {
  const missing: string[] = [];
  if (!hasRecipe) missing.push("No active recipe on this menu item.");
  if (ingredientLines === 0 && hasRecipe) missing.push("Recipe has no ingredient lines.");
  let confidence: AvtConfidence = "LOW";
  if (hasRecipe && ingredientLines > 0 && workspace === "HIGH") confidence = "HIGH";
  else if (hasRecipe && ingredientLines > 0 && workspace === "MEDIUM") confidence = "MEDIUM";
  else if (hasRecipe && ingredientLines > 0) confidence = "LOW";

  const receivingNote =
    workspace === "HIGH"
      ? "Receiving events exist in workspace — theoretical usage can be compared cautiously to depletion once periods align."
      : workspace === "MEDIUM"
        ? "Receiving history is thin — treat theoretical usage as directional."
        : "Add receiving and supplier pricing discipline before trusting actual variance.";

  return { confidence, missing, receivingNote };
}

export async function loadAvtReport(userId: string, filters: AvtReportFilters): Promise<AvtReportPayload> {
  const [workspaceSummary, kitchen, laborRates] = await Promise.all([
    summarizeActualVsTheoretical(userId),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.laborRate.findMany({
      where: { AND: [await laborRateListWhereForOwner(userId), { active: true }] },
      orderBy: { createdAt: "asc" },
      take: 1,
    }),
  ]);

  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const laborRatePerMinute =
    laborRates.length > 0 ? Number(laborRates[0]!.hourlyRate) / 60 : settings.defaultLaborRatePerMinute;

  const orderWhere: Prisma.OrderWhereInput = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: filters.from, lte: filters.to },
    status: { in: ["COMPLETED", "READY", "CONFIRMED", "PREPARING"] as OrderStatus[] },
  });

  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { not: null },
      order: orderWhere,
    },
    _sum: { quantity: true },
  });

  const productIds = grouped.map((g) => g.productId).filter((id): id is string => id != null);
  if (productIds.length === 0) {
    return {
      workspaceSummary,
      rows: [],
      honestyBanner:
        "No catalog-linked order lines in this window. Actual variance requires receiving and stock adjustments; this report currently shows theoretical usage and confidence only.",
    };
  }

  const products = await prisma.product.findMany({
    where: await productListWhereForOwnerAnd(userId, {
      id: { in: productIds },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.category ? { category: filters.category as ProductCategory } : {}),
      ...(filters.locationId
        ? { menu: { locationId: filters.locationId } }
        : {}),
    }),
    include: {
      menu: { select: { id: true, locationId: true } },
      recipe: { include: { ingredients: { include: { ingredient: true } } } },
    },
  });

  const productById = new Map(products.map((p) => [p.id, p]));

  const ingredientIds = [...new Set(products.flatMap((p) => p.recipe?.ingredients.map((i) => i.ingredientId) ?? []))];
  const historyRows =
    ingredientIds.length === 0
      ? []
      : await prisma.supplierPriceHistory.findMany({
          where: { ingredientId: { in: ingredientIds } },
          orderBy: { effectiveAt: "desc" },
          select: { ingredientId: true, newUnitCost: true },
        });
  const latestPrice = new Map<string, number>();
  for (const h of historyRows) {
    if (!latestPrice.has(h.ingredientId)) latestPrice.set(h.ingredientId, Number(h.newUnitCost));
  }

  const rowsUncoalesced: AvtReportRow[] = [];

  for (const g of grouped) {
    if (!g.productId) continue;
    const p = productById.get(g.productId);
    if (!p) continue;
    const qty = g._sum.quantity ?? 0;
    const hasRecipe = Boolean(p.recipe?.active);
    const ingLines = p.recipe?.ingredients ?? [];
    const { confidence, missing, receivingNote } = rowConfidence(
      hasRecipe,
      ingLines.length,
      workspaceSummary.confidence,
    );

    if (filters.confidence && confidence !== filters.confidence) continue;

    let theoreticalPerUnit: number | null = null;
    let theoreticalUsage: number | null = null;
    if (p.recipe?.active && ingLines.length > 0) {
      const ing = ingLines.map((li) => {
        const hist = latestPrice.get(li.ingredientId);
        const card = Number(li.ingredient.costPerUnit);
        const costPerUnit = hist ?? card;
        return {
          quantity: Number(li.quantity),
          wastePercent: Number(li.wastePercent),
          costPerUnit,
          ingredientId: li.ingredientId,
          ingredientName: li.ingredient.name,
        };
      });
      const breakdown = computeRecipeCostPerOutputUnit(
        {
          yieldQuantity: Number(p.recipe.yieldQuantity),
          laborMinutes: p.recipe.laborMinutes,
          recipePackagingCost: Number(p.recipe.packagingCost),
          packagingRulesCost: 0,
          ingredients: ing,
        },
        laborRatePerMinute,
      );
      theoreticalPerUnit = breakdown.ingredientCostPerUnit;
      theoreticalUsage = breakdown.ingredientCostPerUnit * qty;
    }

    const varianceNote =
      workspaceSummary.confidence === "HIGH" && theoreticalUsage != null
        ? "Actual vs theoretical variance can be explored once inventory periods match sales — numbers are not posted as accounting truth."
        : null;

    rowsUncoalesced.push({
      productId: p.id,
      title: p.title,
      category: p.category,
      brandId: p.brandId,
      locationId: p.menu.locationId,
      recipeCoverage: hasRecipe && ingLines.length > 0,
      theoreticalIngredientCostPerUnit: theoreticalPerUnit,
      soldQuantity: qty,
      estimatedTheoreticalUsage: theoreticalUsage,
      receivingConfidenceNote: receivingNote,
      confidence,
      missingDataReasons: missing,
      fixHref: p.recipe ? `/dashboard/menus/${p.menuId}` : `/dashboard/products/${p.id}`,
      varianceNote,
    });
  }

  rowsUncoalesced.sort((a, b) => b.soldQuantity - a.soldQuantity);

  const honestyBanner =
    workspaceSummary.confidence === "HIGH"
      ? "Actual variance requires receiving and stock adjustments. This report shows theoretical usage, confidence, and cautious variance notes only where data exists."
      : "Actual variance requires receiving and stock adjustments. This report currently shows theoretical usage and confidence — add receiving to strengthen signals.";

  return { workspaceSummary, rows: rowsUncoalesced, honestyBanner };
}
