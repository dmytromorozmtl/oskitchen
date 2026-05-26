import type { IngredientDemandSettings } from "./settings";
import { convertIngredientQuantity } from "./unit-conversion";
import { applyBatchRounding, resolveGlobalBufferMultiplier } from "./waste-buffer";
import type {
  DemandContribution,
  DemandSourceType,
  DemandWarning,
  IngredientDemandRow,
  MissingRecipeSignal,
  OrderWithItems,
  RecipeWithLines,
} from "./types";

export type ProductionWorkItemForDemand = {
  id: string;
  quantity: number;
  productId: string | null;
  brandId: string | null;
  locationId: string | null;
  batch: {
    id: string;
    title: string;
    productionDate: Date;
    menuId: string | null;
    status: string;
  } | null;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function inDateRange(dateKey: string, from: Date, to: Date): boolean {
  const k = dateKey.slice(0, 10);
  const a = toDateKey(from);
  const b = toDateKey(to);
  return k >= a && k <= b;
}

function dateKeyForOrder(o: OrderWithItems): string {
  const d = o.pickupDate ?? o.createdAt;
  return toDateKey(d);
}

function confirmedLike(status: string): boolean {
  return status === "CONFIRMED" || status === "PREPARING" || status === "READY" || status === "COMPLETED";
}

export function ordersToContributions(
  orders: (OrderWithItems & { storefrontOrder?: { id: string } | null })[],
  settings: IngredientDemandSettings,
  dateFrom: Date,
  dateTo: Date,
  filters: { brandId?: string | null; locationId?: string | null },
): DemandContribution[] {
  const out: DemandContribution[] = [];
  const srcConfirmed = settings.enabledSources.CONFIRMED_ORDERS;
  const srcDraft = settings.enabledSources.DRAFT_ORDERS;
  const srcSf = settings.enabledSources.STOREFRONT_PREORDERS;

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    if (filters.brandId && order.brandId && order.brandId !== filters.brandId) continue;
    if (filters.locationId && order.locationId && order.locationId !== filters.locationId) continue;

    const dk = dateKeyForOrder(order);
    if (!inDateRange(dk, dateFrom, dateTo)) continue;

    let source: DemandSourceType | null = null;
    let confidence = 1;
    if (order.status === "PENDING") {
      if (!srcDraft?.enabled) continue;
      source = "DRAFT_ORDERS";
      confidence = srcDraft.confidence;
    } else if (confirmedLike(order.status)) {
      const hasStorefront = Boolean(order.storefrontOrder?.id);
      if (hasStorefront && srcSf?.enabled) {
        source = "STOREFRONT_PREORDERS";
        confidence = srcSf.confidence;
      } else if (srcConfirmed?.enabled) {
        source = "CONFIRMED_ORDERS";
        confidence = srcConfirmed.confidence;
      } else {
        continue;
      }
    } else {
      continue;
    }

    for (const line of order.orderItems) {
      if (!line.productId) continue;
      out.push({
        productId: line.productId,
        quantity: line.quantity * confidence,
        dateKey: dk,
        source,
        confidence: 1,
        orderId: order.id,
        brandId: order.brandId ?? null,
        locationId: order.locationId ?? null,
      });
    }
  }
  return out;
}

export function productionItemsToContributions(
  items: ProductionWorkItemForDemand[],
  settings: IngredientDemandSettings,
  dateFrom: Date,
  dateTo: Date,
  filters: { brandId?: string | null; locationId?: string | null },
): DemandContribution[] {
  const src = settings.enabledSources.PRODUCTION_PLAN;
  if (!src?.enabled) return [];
  const out: DemandContribution[] = [];
  for (const wi of items) {
    if (!wi.productId || !wi.batch) continue;
    if (wi.batch.status === "ARCHIVED") continue;
    if (filters.brandId && wi.brandId && wi.brandId !== filters.brandId) continue;
    if (filters.locationId && wi.locationId && wi.locationId !== filters.locationId) continue;
    const dk = toDateKey(wi.batch.productionDate);
    if (!inDateRange(dk, dateFrom, dateTo)) continue;
    out.push({
      productId: wi.productId,
      quantity: wi.quantity * src.confidence,
      dateKey: dk,
      source: "PRODUCTION_PLAN",
      confidence: 1,
      productionBatchId: wi.batch.id,
      productionBatchTitle: wi.batch.title,
      menuId: wi.batch.menuId,
      brandId: wi.brandId,
      locationId: wi.locationId,
    });
  }
  return out;
}

export type DemandRollupResult = {
  rows: IngredientDemandRow[];
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
};

type Acc = {
  ingredientId: string;
  name: string;
  category: string | null;
  storageUnit: string;
  dateKey: string;
  sumConverted: number;
  sumUnconvertedRecipeUnits: number;
  unconvertedUnit: string | null;
  anyConversionFail: boolean;
  supplier: string | null;
  stock: number;
  costPerStorageUnit: number;
  products: Set<string>;
};

export function rollupDemandFromContributions(params: {
  contributions: DemandContribution[];
  recipesByProductId: Map<string, RecipeWithLines>;
  productTitles: Map<string, string>;
  settings: IngredientDemandSettings;
  stockByIngredientId: Map<string, number>;
}): DemandRollupResult {
  const warnings: DemandWarning[] = [];
  const missingRecipes: MissingRecipeSignal[] = [];
  const seenMissing = new Set<string>();

  const acc = new Map<string, Acc>();

  const noteMissing = (productId: string, title: string, reason: MissingRecipeSignal["reason"]) => {
    const k = `${productId}:${reason}`;
    if (seenMissing.has(k)) return;
    seenMissing.add(k);
    missingRecipes.push({ productId, productTitle: title, reason });
  };

  for (const c of params.contributions) {
    const recipe = params.recipesByProductId.get(c.productId);
    const title = params.productTitles.get(c.productId) ?? recipe?.name ?? "Menu item";
    if (!recipe || recipe.active === false) {
      noteMissing(c.productId, title, !recipe ? "NO_RECIPE" : "RECIPE_INACTIVE");
      continue;
    }
    if (!recipe.ingredients.length) {
      noteMissing(c.productId, title, "NO_INGREDIENTS");
      continue;
    }

    const yieldQty = Math.max(Number(recipe.yieldQuantity), 0.0001);
    const portions = c.quantity / yieldQty;

    for (const ri of recipe.ingredients) {
      if (ri.ingredient.active === false) continue;
      const ing = ri.ingredient;
      const buffer = resolveGlobalBufferMultiplier(params.settings, ing.id);
      const waste = 1 + Number(ri.wastePercent) / 100;
      const baseInRecipeUnit = Number(ri.quantity) * portions * waste * buffer;

      const conv = convertIngredientQuantity(
        baseInRecipeUnit,
        ri.unit,
        ing.unit,
        ing.conversionJson as Record<string, number> | null,
      );

      const key = `${ri.ingredientId}::${c.dateKey}`;
      const prev = acc.get(key);
      const productLabel = params.productTitles.get(c.productId) ?? recipe.name;

      if (!conv.ok) {
        warnings.push({
          code: "CONVERSION_REQUIRED",
          severity: "warning",
          message: conv.message,
          context: { ingredientId: ing.id, ingredientName: ing.name, fromUnit: ri.unit, toUnit: ing.unit },
        });
      }

      if (!prev) {
        acc.set(key, {
          ingredientId: ri.ingredientId,
          name: ing.name,
          category: ing.category ?? null,
          storageUnit: ing.unit,
          dateKey: c.dateKey,
          sumConverted: conv.ok ? conv.value : 0,
          sumUnconvertedRecipeUnits: conv.ok ? 0 : baseInRecipeUnit,
          unconvertedUnit: conv.ok ? null : ri.unit,
          anyConversionFail: !conv.ok,
          supplier: ing.supplier ?? null,
          stock: params.stockByIngredientId.get(ing.id) ?? Number(ing.currentStock),
          costPerStorageUnit: Number(ing.costPerUnit),
          products: new Set([productLabel]),
        });
      } else {
        if (!conv.ok) {
          if (prev.sumConverted > 0) {
            warnings.push({
              code: "CONVERSION_ROLLUP_SPLIT",
              severity: "warning",
              message: `Ingredient ${ing.name} on ${c.dateKey} mixed convertible and blocked lines — rolled up in recipe units only for safety.`,
              context: { ingredientId: ing.id, dateKey: c.dateKey },
            });
            prev.sumConverted = 0;
          }
          prev.anyConversionFail = true;
          prev.sumUnconvertedRecipeUnits += baseInRecipeUnit;
          prev.unconvertedUnit = prev.unconvertedUnit ?? ri.unit;
        } else if (!prev.anyConversionFail) {
          prev.sumConverted += conv.value;
        } else {
          prev.sumUnconvertedRecipeUnits += baseInRecipeUnit;
        }
        prev.products.add(productLabel);
      }
    }
  }

  const rows: IngredientDemandRow[] = [];
  for (const v of acc.values()) {
    const useBroken = v.anyConversionFail;
    const rawRequired = useBroken ? v.sumUnconvertedRecipeUnits : v.sumConverted;
    const required = applyBatchRounding(rawRequired, params.settings.batchRounding);
    const unit = useBroken ? v.unconvertedUnit ?? v.storageUnit : v.storageUnit;
    const shortage = useBroken ? 0 : Math.max(0, required - v.stock);
    const estimatedCost = useBroken ? null : Math.round(required * v.costPerStorageUnit * 100) / 100;

    rows.push({
      ingredientId: v.ingredientId,
      name: v.name,
      category: v.category,
      unit,
      dateKey: v.dateKey,
      required: Math.round(required * 1000) / 1000,
      stock: Math.round(v.stock * 1000) / 1000,
      shortage: Math.round(shortage * 1000) / 1000,
      supplier: v.supplier,
      relatedProducts: [...v.products],
      conversionRequired: useBroken,
      estimatedCost,
    });
  }

  rows.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.name.localeCompare(b.name));

  const shortageLineCount = rows.filter((r) => r.shortage > 0 || r.conversionRequired).length;
  const estimatedCostTotal = rows.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
  const suppliersDistinct = new Set(rows.map((r) => r.supplier ?? "")).size;

  return {
    rows,
    warnings,
    missingRecipes,
    contributions: params.contributions,
    totals: {
      ingredientLineCount: rows.length,
      shortageLineCount,
      estimatedCostTotal: Math.round(estimatedCostTotal * 100) / 100,
      recipesMissingCount: missingRecipes.length,
      suppliersDistinct,
      wasteBufferPercent: params.settings.globalWasteBufferPercent,
      purchaseNeededLines: rows.filter((r) => r.shortage > 0).length,
    },
  };
}

/** Legacy helper for unit tests — wide date window, orders only, optional global waste %. */
export function buildRowsLegacyOrderShape(params: {
  orders: OrderWithItems[];
  recipesByProductId: Map<string, RecipeWithLines>;
  productTitles: Map<string, string>;
  wasteBufferPercent?: number;
}): IngredientDemandRow[] {
  const settings: IngredientDemandSettings = {
    globalWasteBufferPercent: params.wasteBufferPercent ?? 5,
    ingredientWasteBufferPercentById: {},
    batchRounding: "none",
    enabledSources: {
      CONFIRMED_ORDERS: { enabled: true, confidence: 1 },
      DRAFT_ORDERS: { enabled: true, confidence: 1 },
      STOREFRONT_PREORDERS: { enabled: true, confidence: 1 },
    } as IngredientDemandSettings["enabledSources"],
  };
  const from = new Date("2000-01-01");
  const to = new Date("2100-01-01");
  const contributions = ordersToContributions(
    params.orders as (OrderWithItems & { storefrontOrder?: { id: string } | null })[],
    settings,
    from,
    to,
    {},
  );
  return rollupDemandFromContributions({
    contributions,
    recipesByProductId: params.recipesByProductId,
    productTitles: params.productTitles,
    settings,
    stockByIngredientId: new Map(),
  }).rows;
}
