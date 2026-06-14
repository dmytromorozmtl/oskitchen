import { createHash } from "crypto";
import { subDays } from "date-fns";

import type {
  AutoVendorDashboard,
  AutoVendorOpportunity,
  AutoVendorOpportunityKind,
} from "@/lib/marketplace/auto-vendor-types";
import { ingredientListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

const HISTORY_DAYS = 90;
const MIN_SAVINGS_USD = 25;
const MIN_SAVINGS_PERCENT = 5;

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export function normalizeSearchTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 4);
}

export function estimateMonthlySavings(input: {
  currentUnitPrice: number;
  alternativeUnitPrice: number;
  quantityLast90Days: number;
}): number {
  const perUnit = input.currentUnitPrice - input.alternativeUnitPrice;
  if (perUnit <= 0) return 0;
  const monthlyQty = Math.max(1, Math.round(input.quantityLast90Days / 3));
  return Math.round(perUnit * monthlyQty * 100) / 100;
}

export function buildAutoVendorOpportunityId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

type SpendAggregate = {
  productId: string;
  productName: string;
  categoryId: string;
  categoryLabel: string;
  vendorId: string;
  vendorName: string;
  avgUnitPrice: number;
  catalogUnitPrice: number;
  currency: string;
  quantity: number;
  slug: string;
};

async function loadSpendAggregates(workspaceId: string): Promise<SpendAggregate[]> {
  const since = subDays(new Date(), HISTORY_DAYS);
  const lines = await prisma.marketplacePOLineItem.findMany({
    where: {
      purchaseOrder: {
        workspaceId,
        createdAt: { gte: since },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      productId: true,
      product: {
        select: {
          slug: true,
          name: true,
          basePrice: true,
          currency: true,
          categoryId: true,
          vendorId: true,
          category: { select: { name: true } },
          vendor: { select: { companyName: true } },
        },
      },
    },
    take: 500,
  });

  const map = new Map<string, SpendAggregate>();
  for (const line of lines) {
    const p = line.product;
    const key = line.productId;
    const unit = decimalToNumber(line.unitPrice);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        productId: line.productId,
        productName: p.name,
        categoryId: p.categoryId,
        categoryLabel: p.category.name,
        vendorId: p.vendorId,
        vendorName: p.vendor.companyName,
        avgUnitPrice: unit,
        catalogUnitPrice: decimalToNumber(p.basePrice),
        currency: p.currency,
        quantity: line.quantity,
        slug: p.slug,
      });
      continue;
    }
    const totalQty = existing.quantity + line.quantity;
    existing.avgUnitPrice =
      (existing.avgUnitPrice * existing.quantity + unit * line.quantity) / totalQty;
    existing.quantity = totalQty;
    existing.catalogUnitPrice = decimalToNumber(p.basePrice);
  }

  return [...map.values()].sort(
    (a, b) => b.avgUnitPrice * b.quantity - a.avgUnitPrice * a.quantity,
  );
}

async function findCheaperAlternative(input: {
  categoryId: string;
  excludeVendorId: string;
  maxUnitPrice: number;
  nameTokens: string[];
}): Promise<{
  name: string;
  slug: string;
  vendorName: string;
  unitPrice: number;
} | null> {
  const byCategory = await prisma.vendorProduct.findMany({
    where: {
      status: "ACTIVE",
      categoryId: input.categoryId,
      vendorId: { not: input.excludeVendorId },
      vendor: { status: "APPROVED" },
      basePrice: { lt: input.maxUnitPrice },
    },
    orderBy: { basePrice: "asc" },
    take: 8,
    select: {
      name: true,
      slug: true,
      basePrice: true,
      vendor: { select: { companyName: true } },
    },
  });

  if (byCategory.length > 0) {
    const best = byCategory[0]!;
    return {
      name: best.name,
      slug: best.slug,
      vendorName: best.vendor.companyName,
      unitPrice: decimalToNumber(best.basePrice),
    };
  }

  if (input.nameTokens.length === 0) return null;

  const byName = await prisma.vendorProduct.findMany({
    where: {
      status: "ACTIVE",
      vendorId: { not: input.excludeVendorId },
      vendor: { status: "APPROVED" },
      basePrice: { lt: input.maxUnitPrice },
      OR: input.nameTokens.map((token) => ({
        name: { contains: token, mode: "insensitive" as const },
      })),
    },
    orderBy: { basePrice: "asc" },
    take: 3,
    select: {
      name: true,
      slug: true,
      basePrice: true,
      vendor: { select: { companyName: true } },
    },
  });

  if (byName.length === 0) return null;
  const best = byName[0]!;
  return {
    name: best.name,
    slug: best.slug,
    vendorName: best.vendor.companyName,
    unitPrice: decimalToNumber(best.basePrice),
  };
}

function pushOpportunity(
  list: AutoVendorOpportunity[],
  opp: Omit<AutoVendorOpportunity, "id"> & { idSeed: string[] },
): void {
  list.push({
    ...opp,
    id: buildAutoVendorOpportunityId(opp.idSeed),
  });
}

async function scanPurchaseHistory(workspaceId: string): Promise<AutoVendorOpportunity[]> {
  const opportunities: AutoVendorOpportunity[] = [];
  const aggregates = await loadSpendAggregates(workspaceId);

  for (const row of aggregates.slice(0, 24)) {
    const tokens = normalizeSearchTokens(row.productName);
    const priceCreep =
      row.catalogUnitPrice > row.avgUnitPrice * (1 + MIN_SAVINGS_PERCENT / 100)
        ? Math.round(
            ((row.catalogUnitPrice - row.avgUnitPrice) / row.avgUnitPrice) * 1000,
          ) / 10
        : null;

    const maxAltPrice = row.avgUnitPrice * (1 - MIN_SAVINGS_PERCENT / 100);
    const alt = await findCheaperAlternative({
      categoryId: row.categoryId,
      excludeVendorId: row.vendorId,
      maxUnitPrice: maxAltPrice,
      nameTokens: tokens,
    });

    if (alt) {
      const monthlySavings = estimateMonthlySavings({
        currentUnitPrice: row.avgUnitPrice,
        alternativeUnitPrice: alt.unitPrice,
        quantityLast90Days: row.quantity,
      });
      if (monthlySavings >= MIN_SAVINGS_USD) {
        pushOpportunity(opportunities, {
          idSeed: ["savings", row.productId, alt.slug],
          kind: "savings",
          categoryLabel: row.categoryLabel,
          currentLabel: row.productName,
          currentVendorName: row.vendorName,
          currentUnitPrice: row.avgUnitPrice,
          currency: row.currency,
          priceChangePercent: priceCreep,
          alternativeVendorName: alt.vendorName,
          alternativeProductName: alt.name,
          alternativeProductSlug: alt.slug,
          alternativeUnitPrice: alt.unitPrice,
          monthlySavingsUsd: monthlySavings,
          confidence: priceCreep != null ? "high" : "medium",
          rationale: `Switching from ${row.vendorName} saves ~$${monthlySavings.toFixed(0)}/mo at your recent purchase volume.`,
        });
        continue;
      }
    }

    if (priceCreep != null && priceCreep >= MIN_SAVINGS_PERCENT) {
      pushOpportunity(opportunities, {
        idSeed: ["creep", row.productId],
        kind: "price_increase",
        categoryLabel: row.categoryLabel,
        currentLabel: row.productName,
        currentVendorName: row.vendorName,
        currentUnitPrice: row.catalogUnitPrice,
        currency: row.currency,
        priceChangePercent: priceCreep,
        alternativeVendorName: alt?.vendorName ?? "—",
        alternativeProductName: alt?.name ?? "Run compare search",
        alternativeProductSlug: alt?.slug ?? "",
        alternativeUnitPrice: alt?.unitPrice ?? row.avgUnitPrice,
        monthlySavingsUsd: alt
          ? estimateMonthlySavings({
              currentUnitPrice: row.catalogUnitPrice,
              alternativeUnitPrice: alt.unitPrice,
              quantityLast90Days: row.quantity,
            })
          : 0,
        confidence: alt ? "high" : "medium",
        rationale: `${row.productName} catalog price is +${priceCreep}% vs your 90-day average paid price.`,
      });
    }
  }

  return opportunities;
}

async function scanIngredientCatalogMatches(userId: string): Promise<AutoVendorOpportunity[]> {
  const opportunities: AutoVendorOpportunity[] = [];
  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const ingredients = await prisma.ingredient.findMany({
    where: ingredientWhere,
    select: { id: true, name: true, costPerUnit: true, unit: true },
    orderBy: { costPerUnit: "desc" },
    take: 12,
  });

  for (const ing of ingredients) {
    const tokens = normalizeSearchTokens(ing.name);
    if (tokens.length === 0) continue;

    const products = await prisma.vendorProduct.findMany({
      where: {
        status: "ACTIVE",
        vendor: { status: "APPROVED" },
        OR: tokens.map((token) => ({
          name: { contains: token, mode: "insensitive" },
        })),
      },
      orderBy: { basePrice: "asc" },
      take: 5,
      select: {
        name: true,
        slug: true,
        basePrice: true,
        currency: true,
        vendor: { select: { companyName: true } },
        category: { select: { name: true } },
      },
    });

    if (products.length < 2) continue;

    const currentCost = decimalToNumber(ing.costPerUnit);
    const cheapest = products[0]!;
    const expensive = products[products.length - 1]!;
    const cheapPrice = decimalToNumber(cheapest.basePrice);
    const expPrice = decimalToNumber(expensive.basePrice);

    if (expPrice <= cheapPrice * (1 + MIN_SAVINGS_PERCENT / 100)) continue;

    const referencePrice = currentCost > 0 ? currentCost : expPrice;
    const monthlySavings = estimateMonthlySavings({
      currentUnitPrice: referencePrice,
      alternativeUnitPrice: cheapPrice,
      quantityLast90Days: 30,
    });

    if (monthlySavings < MIN_SAVINGS_USD) continue;

    const spreadPercent = Math.round(((expPrice - cheapPrice) / expPrice) * 1000) / 10;

    pushOpportunity(opportunities, {
      idSeed: ["ingredient", ing.id, cheapest.slug],
      kind: "savings",
      categoryLabel: cheapest.category.name,
      currentLabel: ing.name,
      currentVendorName: expensive.vendor.companyName,
      currentUnitPrice: referencePrice,
      currency: cheapest.currency,
      priceChangePercent: spreadPercent >= MIN_SAVINGS_PERCENT ? spreadPercent : null,
      alternativeVendorName: cheapest.vendor.companyName,
      alternativeProductName: cheapest.name,
      alternativeProductSlug: cheapest.slug,
      alternativeUnitPrice: cheapPrice,
      monthlySavingsUsd: monthlySavings,
      confidence: "medium",
      rationale: `Marketplace spread on ${ing.name}: save ~$${monthlySavings.toFixed(0)}/mo vs highest listed offer (${expensive.vendor.companyName}).`,
    });
  }

  return opportunities.slice(0, 6);
}

function dedupeOpportunities(items: AutoVendorOpportunity[]): AutoVendorOpportunity[] {
  const seen = new Set<string>();
  const out: AutoVendorOpportunity[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out.sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd);
}

export async function scanAutoVendorOpportunities(input: {
  workspaceId: string;
  userId: string;
}): Promise<AutoVendorOpportunity[]> {
  const [fromHistory, fromIngredients] = await Promise.all([
    scanPurchaseHistory(input.workspaceId).catch(() => [] as AutoVendorOpportunity[]),
    scanIngredientCatalogMatches(input.userId).catch(() => [] as AutoVendorOpportunity[]),
  ]);
  return dedupeOpportunities([...fromHistory, ...fromIngredients]);
}

export async function loadAutoVendorDashboard(input: {
  workspaceId: string;
  userId: string;
}): Promise<AutoVendorDashboard> {
  const opportunities = await scanAutoVendorOpportunities(input);
  const savings = opportunities.filter((o) => o.kind === "savings");
  const priceIncreases = opportunities.filter((o) => o.kind === "price_increase");

  return {
    opportunities,
    summary: {
      totalMonthlySavingsUsd: Math.round(
        savings.reduce((sum, o) => sum + o.monthlySavingsUsd, 0) * 100,
      ) / 100,
      savingsCount: savings.length,
      priceIncreaseCount: priceIncreases.length,
      itemsScanned: opportunities.length,
    },
    scannedAt: new Date().toISOString(),
  };
}

/** @internal for tests */
export function classifyOpportunityKind(
  currentPrice: number,
  altPrice: number,
): AutoVendorOpportunityKind {
  return altPrice < currentPrice ? "savings" : "price_increase";
}
