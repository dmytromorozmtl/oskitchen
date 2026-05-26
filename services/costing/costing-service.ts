import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  channelFeeRuleListWhereForOwner,
  costingRunListWhereForOwner,
  laborRateListWhereForOwner,
  marginRuleListWhereForOwner,
  productListWhereForOwnerAnd,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { allocateOverheadOnPrimeCost } from "@/lib/costing/cost-allocation";
import {
  computeRecipeCostPerOutputUnit,
  foodCostPercent,
  grossMarginPercent,
} from "@/lib/costing/costing-calculations";
import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import type { CostComponentDraft, CostingSourceSummary, CostingWarningReason } from "@/lib/costing/costing-types";
import { estimatePaymentProcessingFee, estimatePlatformFee } from "@/lib/costing/channel-fees";
import { evaluateProfitabilityWarning, resolveMarginThresholds } from "@/lib/costing/margin-rules";
import { suggestPriceFromTargetMargin } from "@/lib/costing/price-suggestions";

type RunCostingResult =
  | { ok: true; runId: string; linesWritten: number; snapshotsWritten: number }
  | { ok: false; error: string };

function latestPriceByIngredient(
  rows: { ingredientId: string; newUnitCost: Prisma.Decimal; effectiveAt: Date }[],
): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (!m.has(r.ingredientId)) {
      m.set(r.ingredientId, Number(r.newUnitCost));
    }
  }
  return m;
}

export async function runFullRecipeCosting(userId: string, createdById?: string | null): Promise<RunCostingResult> {
  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const businessType = kitchen?.businessType ?? null;

  const channelScope = await channelFeeRuleListWhereForOwner(userId);
  const [marginRules, channelRules, laborRates, recipes] = await Promise.all([
    prisma.marginRule.findMany({
      where: { AND: [await marginRuleListWhereForOwner(userId), { active: true }] },
    }),
    prisma.channelFeeRule.findMany({
      where: {
        AND: [
          channelScope,
          { active: true, channelProvider: settings.defaultChannelProvider },
        ],
      },
    }),
    prisma.laborRate.findMany({
      where: { AND: [await laborRateListWhereForOwner(userId), { active: true }] },
      orderBy: { createdAt: "asc" },
    }),
    prisma.recipe.findMany({
      where: { AND: [await recipeListWhereForOwner(userId), { active: true }] },
      include: {
        product: { include: { menu: true, brand: true } },
        ingredients: { include: { ingredient: true } },
      },
    }),
  ]);

  if (recipes.length === 0) {
    return { ok: false, error: "Add recipes on your menu items first — nothing to cost yet." };
  }

  const laborRatePerMinute =
    laborRates.length > 0
      ? Number(laborRates[0]!.hourlyRate) / 60
      : settings.defaultLaborRatePerMinute;

  const channelRule = channelRules[0] ?? null;

  const ingredientIds = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.ingredientId)))];
  const historyRows =
    ingredientIds.length === 0
      ? []
      : await prisma.supplierPriceHistory.findMany({
          where: { ingredientId: { in: ingredientIds } },
          orderBy: { effectiveAt: "desc" },
          select: { ingredientId: true, newUnitCost: true, effectiveAt: true },
        });
  const historyMap = latestPriceByIngredient(historyRows);

  const productIds = recipes.map((r) => r.productId);
  const packRules =
    productIds.length === 0
      ? []
      : await prisma.productPackagingRule.findMany({
          where: { productId: { in: productIds } },
          include: { packagingItem: true },
        });
  const packCostByProduct = new Map<string, number>();
  for (const pr of packRules) {
    if (!pr.packagingItem.active) continue;
    const add = Number(pr.quantity) * Number(pr.packagingItem.unitCost);
    packCostByProduct.set(pr.productId, (packCostByProduct.get(pr.productId) ?? 0) + add);
  }

  const runTitle = `Full costing — ${new Date().toISOString().slice(0, 10)}`;
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const run = await prisma.costingRun.create({
    data: {
      userId,
      workspaceId,
      title: runTitle,
      runType: "FULL",
      status: "RUNNING",
      createdById: createdById ?? undefined,
    },
  });

  let lines = 0;
  let snaps = 0;

  try {
    for (const r of recipes) {
      const p = r.product;
      const salePrice = Number(p.price);
      const packagingRulesCost = packCostByProduct.get(p.id) ?? 0;
      const ingLines = r.ingredients.map((li) => {
        const hist = historyMap.get(li.ingredientId);
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
          yieldQuantity: Number(r.yieldQuantity),
          laborMinutes: r.laborMinutes,
          recipePackagingCost: Number(r.packagingCost),
          packagingRulesCost,
          ingredients: ingLines,
        },
        laborRatePerMinute,
      );

      const prime = breakdown.primeCostPerUnit;
      const overhead = allocateOverheadOnPrimeCost(
        prime,
        settings.overheadPercentOfPrimeCost,
        settings.enableOverheadInTotalCost,
      );

      const deliveryCost =
        p.deliveryAvailable && kitchen?.deliveryFee != null ? Number(kitchen.deliveryFee) : 0;

      const platformFee = channelRule
        ? estimatePlatformFee(salePrice, {
            feeType: channelRule.feeType,
            percentage: Number(channelRule.percentage),
            fixedAmount: Number(channelRule.fixedAmount),
          })
        : 0;

      const paymentFee = estimatePaymentProcessingFee(salePrice, settings.defaultPaymentProcessingPercent);

      const totalCost = prime + overhead + deliveryCost + platformFee + paymentFee;
      const grossProfit = salePrice - totalCost;
      const gmPct = grossMarginPercent(grossProfit, salePrice);
      const fcPct = foodCostPercent(breakdown.ingredientCostPerUnit, salePrice);

      const thresholds = resolveMarginThresholds(marginRules, businessType, p.category, {
        targetMarginPercent: settings.targetMarginPercent,
        warningMarginPercent: settings.warningMarginPercent,
        foodCostTargetPercent: settings.foodCostTargetPercent,
      });

      const warnEval = evaluateProfitabilityWarning(gmPct, fcPct, thresholds);
      const allWarnings: CostingWarningReason[] = [...breakdown.warnings, ...warnEval.reasons];

      const feeRateForSuggest =
        (channelRule ? Number(channelRule.percentage) / 100 : 0) + settings.defaultPaymentProcessingPercent;
      const platformFixedForSuggest = channelRule
        ? channelRule.feeType === "FIXED" || channelRule.feeType === "MIXED"
          ? Number(channelRule.fixedAmount)
          : 0
        : 0;
      const fixedForSuggest = deliveryCost + overhead + platformFixedForSuggest;
      const suggested = suggestPriceFromTargetMargin(
        prime + fixedForSuggest,
        thresholds.targetMarginPercent,
        settings,
        feeRateForSuggest,
      );

      const usedHistoryCount = ingLines.filter((li) => historyMap.has(li.ingredientId)).length;
      const sourceSummary: CostingSourceSummary = {
        ingredientCostSource:
          usedHistoryCount === 0 ? "ingredient_card" : usedHistoryCount === ingLines.length ? "supplier_price_history" : "mixed",
        laborSource: laborRates.length > 0 ? "labor_rate_table" : "settings_default",
        packagingSource: breakdown.source.packagingSource,
        channelFeeSource: channelRule ? "channel_fee_rule" : "none_configured",
        notes: [
          "Costing is an operational estimate — verify with invoices and your accountant.",
          channelRule
            ? undefined
            : "No active channel fee rule for the default channel — platform fee modeled as zero.",
        ].filter(Boolean) as string[],
      };

      const line = await prisma.profitabilityLine.create({
        data: {
          runId: run.id,
          productId: p.id,
          menuId: p.menuId,
          brandId: p.brandId,
          locationId: p.menu.locationId,
          channelProvider: settings.defaultChannelProvider,
          sku: p.publicSlug,
          itemTitle: p.title,
          salePrice: new Prisma.Decimal(salePrice.toFixed(2)),
          ingredientCost: new Prisma.Decimal(breakdown.ingredientCostPerUnit.toFixed(4)),
          laborCost: new Prisma.Decimal(breakdown.laborCostPerUnit.toFixed(4)),
          packagingCost: new Prisma.Decimal(breakdown.packagingCostPerUnit.toFixed(4)),
          deliveryCost: new Prisma.Decimal(deliveryCost.toFixed(4)),
          platformFee: new Prisma.Decimal(platformFee.toFixed(4)),
          paymentFee: new Prisma.Decimal(paymentFee.toFixed(4)),
          overheadCost: new Prisma.Decimal(overhead.toFixed(4)),
          wasteCost: new Prisma.Decimal(0),
          totalCost: new Prisma.Decimal(totalCost.toFixed(4)),
          grossProfit: new Prisma.Decimal(grossProfit.toFixed(4)),
          grossMarginPercent: new Prisma.Decimal(gmPct.toFixed(4)),
          foodCostPercent: new Prisma.Decimal(fcPct.toFixed(4)),
          contributionMargin: new Prisma.Decimal(grossProfit.toFixed(4)),
          suggestedPrice: suggested != null ? new Prisma.Decimal(suggested.toFixed(2)) : null,
          warningLevel: warnEval.level,
          warningReasonsJson: allWarnings.length ? (allWarnings as unknown as Prisma.InputJsonValue) : undefined,
          sourceSummaryJson: sourceSummary as unknown as Prisma.InputJsonValue,
        },
      });

      const drafts: CostComponentDraft[] = [
        {
          type: "INGREDIENT",
          name: "Ingredients (rolled)",
          cost: breakdown.ingredientCostPerUnit,
          source: sourceSummary.ingredientCostSource,
        },
        { type: "LABOR", name: "Labor", amount: r.laborMinutes, unit: "min", cost: breakdown.laborCostPerUnit, source: "recipe" },
        {
          type: "PACKAGING",
          name: "Packaging",
          cost: breakdown.packagingCostPerUnit,
          source: breakdown.source.packagingSource,
        },
      ];
      if (overhead > 0) {
        drafts.push({
          type: "OVERHEAD",
          name: "Overhead allocation",
          cost: overhead,
          source: "settings",
        });
      }
      if (deliveryCost > 0) {
        drafts.push({ type: "DELIVERY", name: "Delivery estimate", cost: deliveryCost, source: "kitchen_settings" });
      }
      if (platformFee > 0) {
        drafts.push({
          type: "PLATFORM_FEE",
          name: `Platform fee (${settings.defaultChannelProvider})`,
          cost: platformFee,
          source: "channel_fee_rule",
        });
      }
      if (paymentFee > 0) {
        drafts.push({ type: "PAYMENT_FEE", name: "Payment processing estimate", cost: paymentFee, source: "settings" });
      }

      await prisma.costComponent.createMany({
        data: drafts.map((d) => ({
          productId: p.id,
          profitabilityLineId: line.id,
          type: d.type,
          name: d.name,
          amount: d.amount != null ? new Prisma.Decimal(d.amount) : null,
          unit: d.unit ?? null,
          cost: new Prisma.Decimal(d.cost.toFixed(4)),
          source: d.source ?? null,
        })),
      });

      await prisma.costSnapshot.create({
        data: {
          userId,
          workspaceId,
          productId: p.id,
          costingRunId: run.id,
          ingredientCost: new Prisma.Decimal(breakdown.ingredientCostPerUnit.toFixed(2)),
          laborCost: new Prisma.Decimal(breakdown.laborCostPerUnit.toFixed(2)),
          packagingCost: new Prisma.Decimal(breakdown.packagingCostPerUnit.toFixed(2)),
          totalCost: new Prisma.Decimal(totalCost.toFixed(2)),
          salePrice: new Prisma.Decimal(salePrice.toFixed(2)),
          grossMargin: new Prisma.Decimal(grossProfit.toFixed(2)),
          marginPercent: new Prisma.Decimal(gmPct.toFixed(2)),
        },
      });

      lines += 1;
      snaps += 1;
    }

    await prisma.costingRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED" },
    });

    return { ok: true, runId: run.id, linesWritten: lines, snapshotsWritten: snaps };
  } catch (e) {
    await prisma.costingRun.update({
      where: { id: run.id },
      data: { status: "FAILED" },
    });
    const msg = e instanceof Error ? e.message : "Costing run failed.";
    return { ok: false, error: msg };
  }
}

export type CostingOverviewKpis = {
  avgGrossMarginPct: number | null;
  itemsBelowTarget: number;
  missingRecipes: number;
  missingIngredientCosts: number;
  estimatedUnitProfitSum: number;
  highestMarginTitle: string | null;
  highestMarginPct: number | null;
  lowestMarginTitle: string | null;
  lowestMarginPct: number | null;
  channelFeesShareOfRevenuePct: number | null;
};

export type CostingOverviewData = {
  businessType: import("@prisma/client").BusinessType | null;
  settings: import("@/lib/costing/costing-settings").MergedCostingSettings;
  targetMarginPercent: number;
  warningMarginPercent: number;
  latestRun: { id: string; title: string; createdAt: Date } | null;
  kpis: CostingOverviewKpis;
  recipeCount: number;
  latestLines: Array<{
    id: string;
    productId: string;
    itemTitle: string;
    salePrice: number;
    ingredientCost: number;
    laborCost: number;
    packagingCost: number;
    platformFee: number;
    paymentFee: number;
    totalCost: number;
    grossMarginPercent: number;
    foodCostPercent: number;
    suggestedPrice: number | null;
    warningLevel: import("@prisma/client").ProfitabilityWarningLevel;
  }>;
};

export async function loadCostingOverviewData(userId: string): Promise<CostingOverviewData> {
  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const businessType = kitchen?.businessType ?? null;
  const marginRules = await prisma.marginRule.findMany({
    where: { AND: [await marginRuleListWhereForOwner(userId), { active: true }] },
  });
  const thresholds = resolveMarginThresholds(marginRules, businessType, "OTHER", {
    targetMarginPercent: settings.targetMarginPercent,
    warningMarginPercent: settings.warningMarginPercent,
    foodCostTargetPercent: settings.foodCostTargetPercent,
  });

  const costingScope = await costingRunListWhereForOwner(userId);
  const latestRun = await prisma.costingRun.findFirst({
    where: { AND: [costingScope, { status: "COMPLETED" }] },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  const lines = latestRun
    ? await prisma.profitabilityLine.findMany({
        where: { runId: latestRun.id },
        orderBy: { itemTitle: "asc" },
        take: 800,
      })
    : [];

  const avgGrossMarginPct =
    lines.length > 0 ? lines.reduce((s, l) => s + Number(l.grossMarginPercent), 0) / lines.length : null;

  const itemsBelowTarget = lines.filter((l) => Number(l.grossMarginPercent) < thresholds.targetMarginPercent).length;

  const recipeCount = await prisma.recipe.count({
    where: { AND: [await recipeListWhereForOwner(userId), { active: true }] },
  });

  const missingRecipes = await prisma.product.count({
    where: await productListWhereForOwnerAnd(userId, {
      active: true,
      recipe: { is: null },
    }),
  });

  const recipeScope = await recipeListWhereForOwner(userId);
  const missingIngredientCosts = await prisma.recipeIngredient.count({
    where: {
      recipe: { AND: [recipeScope, { active: true }] },
      ingredient: { costPerUnit: { lte: new Prisma.Decimal(0) } },
    },
  });

  const estimatedUnitProfitSum = lines.reduce((s, l) => s + Number(l.grossProfit), 0);

  let highest: (typeof lines)[0] | null = null;
  let lowest: (typeof lines)[0] | null = null;
  for (const l of lines) {
    const g = Number(l.grossMarginPercent);
    if (!highest || g > Number(highest.grossMarginPercent)) highest = l;
    if (!lowest || g < Number(lowest.grossMarginPercent)) lowest = l;
  }

  const rev = lines.reduce((s, l) => s + Number(l.salePrice), 0);
  const fees = lines.reduce((s, l) => s + Number(l.platformFee) + Number(l.paymentFee), 0);
  const channelFeesShareOfRevenuePct = rev > 0 ? (fees / rev) * 100 : null;

  return {
    businessType,
    settings,
    targetMarginPercent: thresholds.targetMarginPercent,
    warningMarginPercent: thresholds.warningMarginPercent,
    latestRun,
    recipeCount,
    latestLines: lines.map((l) => ({
      id: l.id,
      productId: l.productId,
      itemTitle: l.itemTitle,
      salePrice: Number(l.salePrice),
      ingredientCost: Number(l.ingredientCost),
      laborCost: Number(l.laborCost),
      packagingCost: Number(l.packagingCost),
      platformFee: Number(l.platformFee),
      paymentFee: Number(l.paymentFee),
      totalCost: Number(l.totalCost),
      grossMarginPercent: Number(l.grossMarginPercent),
      foodCostPercent: Number(l.foodCostPercent),
      suggestedPrice: l.suggestedPrice != null ? Number(l.suggestedPrice) : null,
      warningLevel: l.warningLevel,
    })),
    kpis: {
      avgGrossMarginPct,
      itemsBelowTarget,
      missingRecipes,
      missingIngredientCosts,
      estimatedUnitProfitSum,
      highestMarginTitle: highest?.itemTitle ?? null,
      highestMarginPct: highest ? Number(highest.grossMarginPercent) : null,
      lowestMarginTitle: lowest?.itemTitle ?? null,
      lowestMarginPct: lowest ? Number(lowest.grossMarginPercent) : null,
      channelFeesShareOfRevenuePct,
    },
  };
}
