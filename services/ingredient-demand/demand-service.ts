import { subDays } from "date-fns";

import {
  ordersToContributions,
  productionItemsToContributions,
  rollupDemandFromContributions,
  type ProductionWorkItemForDemand,
} from "@/lib/ingredient-demand/demand-calculation";
import type { IngredientDemandSettings } from "@/lib/ingredient-demand/settings";
import { loadIngredientDemandSettingsForUser } from "@/lib/ingredient-demand/settings";
import type {
  DemandContribution,
  DemandSourceType,
  DemandWarning,
  IngredientDemandRow,
  MissingRecipeSignal,
  OrderWithItems,
  RecipeWithLines,
} from "@/lib/ingredient-demand/types";
import { normalizeUnit } from "@/lib/ingredient-demand/unit-conversion";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientDemandRunListWhereForOwner,
  ingredientListWhereForOwner,
  ingredientSubstitutionListWhereForOwner,
  inventoryStockListWhereForOwner,
  locationListWhereForOwner,
  orderListWhereForOwnerAnd,
  productListWhereForOwner,
  productionWorkItemListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type DemandCommandCenterPayload = {
  rows: IngredientDemandRow[];
  ordersConsidered: number;
  recipesLinked: number;
  productionItemsConsidered: number;
  warnings: DemandWarning[];
  missingRecipes: MissingRecipeSignal[];
  contributions: DemandContribution[];
  totals: {
    ingredientLineCount: number;
    shortageLineCount: number;
    estimatedCostTotal: number;
    recipesMissingCount: number;
    suppliersDistinct: number;
    wasteBufferPercent: number;
    purchaseNeededLines: number;
  };
  settings: IngredientDemandSettings;
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  substitutions: {
    id: string;
    ingredientId: string;
    substituteIngredientId: string;
    conversionRatio: number | null;
    notes: string | null;
  }[];
  latestRun: { id: string; title: string; status: string; createdAt: string } | null;
  stubSourcesEnabled: DemandSourceType[];
  window: { from: string; to: string };
};

const STUB_SOURCES: DemandSourceType[] = [
  "MENU_FORECAST",
  "CATERING_EVENTS",
  "BAKERY_BATCHES",
  "BAR_PREP",
  "CAFE_SPECIALS",
  "MANUAL_PLAN",
  "HISTORICAL_FORECAST",
];

function stubWarnings(settings: IngredientDemandSettings): DemandWarning[] {
  const w: DemandWarning[] = [];
  for (const id of STUB_SOURCES) {
    if (settings.enabledSources[id]?.enabled) {
      w.push({
        code: "SOURCE_STUB",
        severity: "info",
        message: `${id.replace(/_/g, " ")} is enabled but not wired to data yet — toggle off or expect zero contribution.`,
        context: { source: id },
      });
    }
  }
  return w;
}

function buildStockMap(
  ingredients: { id: string; unit: string; currentStock: unknown }[],
  stockRows: { ingredientId: string; quantityOnHand: unknown; unit: string }[],
): Map<string, number> {
  const map = new Map<string, string>();
  for (const ing of ingredients) {
    map.set(ing.id, ing.unit);
  }
  const sums = new Map<string, number>();
  for (const row of stockRows) {
    const ingUnit = map.get(row.ingredientId);
    if (!ingUnit) continue;
    if (normalizeUnit(row.unit) !== normalizeUnit(ingUnit)) continue;
    const prev = sums.get(row.ingredientId) ?? 0;
    sums.set(row.ingredientId, prev + Number(row.quantityOnHand));
  }
  return sums;
}

export async function loadDemandCommandCenterPayload(
  userId: string,
  overrides?: Partial<{ dateFrom: Date; dateTo: Date; brandId: string | null; locationId: string | null }>,
): Promise<DemandCommandCenterPayload> {
  const settings = await loadIngredientDemandSettingsForUser(userId);
  const start = overrides?.dateFrom ? new Date(overrides.dateFrom) : new Date();
  if (!overrides?.dateFrom) start.setHours(0, 0, 0, 0);
  const end = overrides?.dateTo ? new Date(overrides.dateTo) : new Date(start);
  if (!overrides?.dateTo) end.setDate(end.getDate() + 21);
  end.setHours(23, 59, 59, 999);

  const brandId = overrides?.brandId ?? null;
  const locationId = overrides?.locationId ?? null;

  const [orderWhere, productWhere, recipeScope, locationScope, stockScope, ingredientScope, workItemScope] =
    await Promise.all([
      orderListWhereForOwnerAnd(userId, {
        status: { not: "CANCELLED" },
        OR: [
          { pickupDate: { gte: start, lte: end } },
          { pickupDate: null, createdAt: { gte: subDays(new Date(), 14) } },
        ],
      }),
      productListWhereForOwner(userId),
      recipeListWhereForOwner(userId),
      locationListWhereForOwner(userId),
      inventoryStockListWhereForOwner(userId),
      ingredientListWhereForOwner(userId),
      productionWorkItemListWhereForOwner(userId),
    ]);

  const [
    orders,
    recipes,
    products,
    workItems,
    locations,
    substitutions,
    latestRun,
    stockRows,
    ingredientsList,
  ] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      take: 500,
      orderBy: { createdAt: "desc" },
      include: { orderItems: true, storefrontOrder: { select: { id: true } } },
    }),
    prisma.recipe.findMany({
      where: recipeScope,
      include: { ingredients: { include: { ingredient: true } } },
    }),
    prisma.product.findMany({
      where: productWhere,
      select: { id: true, title: true },
    }),
    prisma.productionWorkItem.findMany({
      where: {
        AND: [
          workItemScope,
          {
            productId: { not: null },
            batchId: { not: null },
            status: { not: "CANCELLED" },
            batch: { productionDate: { gte: start, lte: end }, status: { in: ["DRAFT", "ACTIVE"] } },
          },
        ],
      },
      take: 800,
      include: {
        batch: { select: { id: true, title: true, productionDate: true, menuId: true, status: true } },
      },
    }),
    prisma.location.findMany({
      where: { AND: [locationScope, { active: true }] },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.ingredientSubstitution.findMany({
      where: { AND: [await ingredientSubstitutionListWhereForOwner(userId), { active: true }] },
      select: { id: true, ingredientId: true, substituteIngredientId: true, conversionRatio: true, notes: true },
    }),
    prisma.ingredientDemandRun.findFirst({
      where: await ingredientDemandRunListWhereForOwner(userId),
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.inventoryStock.findMany({
      where: stockScope,
      select: { ingredientId: true, quantityOnHand: true, unit: true },
    }),
    prisma.ingredient.findMany({
      where: ingredientScope,
      select: { id: true, unit: true, currentStock: true },
    }),
  ]);

  const brandIds = new Set<string>();
  for (const o of orders) {
    if (o.brandId) brandIds.add(o.brandId);
  }
  for (const w of workItems) {
    if (w.brandId) brandIds.add(w.brandId);
  }
  const brands =
    brandIds.size > 0
      ? await prisma.brand.findMany({
          where: { id: { in: [...brandIds] }, lifecycleStatus: { not: "ARCHIVED" } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  const recipesByProductId = new Map<string, RecipeWithLines>(
    recipes.map((r) => [r.productId, r as unknown as RecipeWithLines]),
  );
  const productTitles = new Map(products.map((p) => [p.id, p.title]));

  const orderContribs = ordersToContributions(
    orders as (OrderWithItems & { storefrontOrder?: { id: string } | null })[],
    settings,
    start,
    end,
    { brandId, locationId },
  );

  const prodContribs = productionItemsToContributions(
    workItems as unknown as ProductionWorkItemForDemand[],
    settings,
    start,
    end,
    { brandId, locationId },
  );

  const contributions = [...orderContribs, ...prodContribs];
  const stockByIngredientId = buildStockMap(ingredientsList, stockRows);

  const rolled = rollupDemandFromContributions({
    contributions,
    recipesByProductId,
    productTitles,
    settings,
    stockByIngredientId,
  });

  const warnings = [...stubWarnings(settings), ...rolled.warnings];
  const stubSourcesEnabled = STUB_SOURCES.filter((s) => settings.enabledSources[s]?.enabled);

  return {
    rows: rolled.rows,
    ordersConsidered: orders.length,
    recipesLinked: recipes.length,
    productionItemsConsidered: workItems.length,
    warnings,
    missingRecipes: rolled.missingRecipes,
    contributions: rolled.contributions,
    totals: rolled.totals,
    settings,
    brands,
    locations,
    substitutions: substitutions.map((s) => ({
      id: s.id,
      ingredientId: s.ingredientId,
      substituteIngredientId: s.substituteIngredientId,
      conversionRatio: s.conversionRatio != null ? Number(s.conversionRatio) : null,
      notes: s.notes,
    })),
    latestRun: latestRun
      ? {
          id: latestRun.id,
          title: latestRun.title,
          status: latestRun.status,
          createdAt: latestRun.createdAt.toISOString(),
        }
      : null,
    stubSourcesEnabled,
    window: { from: start.toISOString(), to: end.toISOString() },
  };
}

export async function persistIngredientDemandRun(params: {
  userId: string;
  createdById?: string | null;
  title: string;
  dateFrom: Date;
  dateTo: Date;
  payload: Omit<DemandCommandCenterPayload, "settings" | "brands" | "locations" | "substitutions" | "latestRun" | "stubSourcesEnabled">;
  filterBrandId?: string | null;
  filterLocationId?: string | null;
}) {
  const { rows, totals, warnings, missingRecipes, contributions } = params.payload;
  const sourceTypesJson = [...new Set(contributions.map((c) => c.source))];

  const workspaceId = await resolveOwnerWorkspaceId(params.userId);
  const run = await prisma.ingredientDemandRun.create({
    data: {
      userId: params.userId,
      workspaceId,
      title: params.title,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sourceTypesJson,
      filterBrandId: params.filterBrandId ?? null,
      filterLocationId: params.filterLocationId ?? null,
      status: "COMPLETED",
      totalLines: totals.ingredientLineCount,
      shortageLines: totals.shortageLineCount,
      estimatedCost: totals.estimatedCostTotal,
      warningsJson: [...warnings, ...missingRecipes.map((m) => ({ type: "missing_recipe", ...m }))],
      createdById: params.createdById ?? null,
    },
  });

  if (rows.length) {
    await prisma.ingredientDemandRunLine.createMany({
      data: rows.map((r) => ({
        demandRunId: run.id,
        ingredientId: r.ingredientId,
        demandDate: new Date(`${r.dateKey}T12:00:00.000Z`),
        requiredQuantity: r.required,
        unit: r.unit,
        availableQuantity: r.stock,
        shortageQuantity: r.shortage,
        wastePercentApplied: totals.wasteBufferPercent,
        estimatedCost: r.estimatedCost ?? null,
        relatedProductsJson: r.relatedProducts,
        supplierLabel: r.supplier,
        status: "OPEN",
        notes: r.conversionRequired ? "conversion_required" : null,
      })),
    });
  }

  return run;
}
