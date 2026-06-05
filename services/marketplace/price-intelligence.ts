import type { Prisma } from "@prisma/client";
import { subDays } from "date-fns";

import { buildPriceIntelligenceSnapshot } from "@/lib/marketplace/price-intelligence-builders";
import {
  PRICE_INTELLIGENCE_HISTORY_DAYS,
  PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT,
  PRICE_INTELLIGENCE_MIN_SAVINGS_USD,
} from "@/lib/marketplace/price-intelligence-policy";
import {
  mergePriceIntelligenceIntoSettingsCenter,
  priceIntelligenceFromSettingsCenter,
  type PriceIntelligenceAutoSwitchPolicy,
} from "@/lib/marketplace/price-intelligence-preferences";
import type {
  PriceIntelligenceCheapestLeader,
  PriceIntelligenceSnapshot,
  PriceIntelligenceSwitchRecommendation,
} from "@/lib/marketplace/price-intelligence-types";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  buildAutoVendorOpportunityId,
  estimateMonthlySavings,
  normalizeSearchTokens,
} from "@/services/marketplace/auto-vendor-service";

export type { PriceIntelligenceSnapshot } from "@/lib/marketplace/price-intelligence-types";

type SpendRow = {
  productId: string;
  productName: string;
  productSlug: string;
  categoryId: string;
  categoryLabel: string;
  vendorId: string;
  vendorName: string;
  avgUnitPrice: number;
  currency: string;
  quantity: number;
  gtin: string | null;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function recommendationId(parts: string[]): string {
  return buildAutoVendorOpportunityId(parts);
}

async function loadSpendRows(workspaceId: string): Promise<SpendRow[]> {
  const since = subDays(new Date(), PRICE_INTELLIGENCE_HISTORY_DAYS);
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
          gtin: true,
          currency: true,
          categoryId: true,
          vendorId: true,
          category: { select: { name: true } },
          vendor: { select: { companyName: true } },
        },
      },
    },
    take: 600,
  });

  const map = new Map<string, SpendRow>();
  for (const line of lines) {
    const p = line.product;
    const unit = decimalToNumber(line.unitPrice);
    const existing = map.get(line.productId);
    if (!existing) {
      map.set(line.productId, {
        productId: line.productId,
        productName: p.name,
        productSlug: p.slug,
        categoryId: p.categoryId,
        categoryLabel: p.category.name,
        vendorId: p.vendorId,
        vendorName: p.vendor.companyName,
        avgUnitPrice: unit,
        currency: p.currency,
        quantity: line.quantity,
        gtin: p.gtin,
      });
      continue;
    }
    const totalQty = existing.quantity + line.quantity;
    existing.avgUnitPrice =
      (existing.avgUnitPrice * existing.quantity + unit * line.quantity) / totalQty;
    existing.quantity = totalQty;
  }

  return [...map.values()].sort((a, b) => b.avgUnitPrice * b.quantity - a.avgUnitPrice * a.quantity);
}

async function findCheapestSupplier(input: {
  categoryId: string;
  excludeVendorId: string;
  maxUnitPrice: number;
  nameTokens: string[];
  gtin: string | null;
}): Promise<{
  productId: string;
  slug: string;
  name: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
} | null> {
  const baseWhere: Prisma.VendorProductWhereInput = {
    status: "ACTIVE",
    vendor: { status: "APPROVED" },
    vendorId: { not: input.excludeVendorId },
    basePrice: { lt: input.maxUnitPrice },
  };

  if (input.gtin) {
    const byGtin = await prisma.vendorProduct.findFirst({
      where: { ...baseWhere, gtin: input.gtin },
      orderBy: { basePrice: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        basePrice: true,
        vendorId: true,
        vendor: { select: { companyName: true } },
      },
    });
    if (byGtin) {
      return {
        productId: byGtin.id,
        slug: byGtin.slug,
        name: byGtin.name,
        vendorId: byGtin.vendorId,
        vendorName: byGtin.vendor.companyName,
        unitPrice: decimalToNumber(byGtin.basePrice),
      };
    }
  }

  const byCategory = await prisma.vendorProduct.findMany({
    where: { ...baseWhere, categoryId: input.categoryId },
    orderBy: { basePrice: "asc" },
    take: 5,
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true,
      vendorId: true,
      vendor: { select: { companyName: true } },
    },
  });
  if (byCategory.length > 0) {
    const best = byCategory[0]!;
    return {
      productId: best.id,
      slug: best.slug,
      name: best.name,
      vendorId: best.vendorId,
      vendorName: best.vendor.companyName,
      unitPrice: decimalToNumber(best.basePrice),
    };
  }

  if (input.nameTokens.length === 0) return null;

  const byName = await prisma.vendorProduct.findMany({
    where: {
      ...baseWhere,
      OR: input.nameTokens.map((token) => ({
        name: { contains: token, mode: "insensitive" as const },
      })),
    },
    orderBy: { basePrice: "asc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true,
      vendorId: true,
      vendor: { select: { companyName: true } },
    },
  });
  if (byName.length === 0) return null;
  const best = byName[0]!;
  return {
    productId: best.id,
    slug: best.slug,
    name: best.name,
    vendorId: best.vendorId,
    vendorName: best.vendor.companyName,
    unitPrice: decimalToNumber(best.basePrice),
  };
}

async function loadCheapestLeaders(): Promise<PriceIntelligenceCheapestLeader[]> {
  const products = await prisma.vendorProduct.findMany({
    where: { status: "ACTIVE", vendor: { status: "APPROVED" } },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      currency: true,
      gtin: true,
      categoryId: true,
      vendor: { select: { companyName: true } },
    },
    take: 400,
  });

  const clusters = new Map<string, typeof products>();
  for (const product of products) {
    const key = product.gtin?.trim() || `${product.categoryId}:${normalizeSearchTokens(product.name).join("-")}`;
    if (!key) continue;
    const bucket = clusters.get(key) ?? [];
    bucket.push(product);
    clusters.set(key, bucket);
  }

  const leaders: PriceIntelligenceCheapestLeader[] = [];
  for (const bucket of clusters.values()) {
    if (bucket.length < 2) continue;
    const sorted = [...bucket].sort(
      (a, b) => decimalToNumber(a.basePrice) - decimalToNumber(b.basePrice),
    );
    const cheapest = sorted[0]!;
    const expensive = sorted[sorted.length - 1]!;
    const cheapPrice = decimalToNumber(cheapest.basePrice);
    const highPrice = decimalToNumber(expensive.basePrice);
    if (highPrice <= cheapPrice) continue;
    const spreadPercent = Math.round(((highPrice - cheapPrice) / highPrice) * 1000) / 10;
    if (spreadPercent < PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT) continue;

    leaders.push({
      productId: cheapest.id,
      productName: cheapest.name,
      slug: cheapest.slug,
      vendorName: cheapest.vendor.companyName,
      unitPrice: cheapPrice,
      currency: cheapest.currency,
      spreadPercent,
      offerCount: bucket.length,
    });
  }

  return leaders.sort((a, b) => b.spreadPercent - a.spreadPercent).slice(0, 8);
}

export async function loadPriceIntelligenceAutoSwitchPolicy(
  workspaceId: string,
): Promise<PriceIntelligenceAutoSwitchPolicy> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return priceIntelligenceFromSettingsCenter(kitchen?.settingsCenterJson ?? null);
}

export async function savePriceIntelligenceAutoSwitchPolicy(
  workspaceId: string,
  policy: PriceIntelligenceAutoSwitchPolicy,
): Promise<void> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = mergePriceIntelligenceIntoSettingsCenter(kitchen?.settingsCenterJson ?? null, policy);
  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });
}

export async function loadPriceIntelligenceSnapshot(
  workspaceId: string,
): Promise<PriceIntelligenceSnapshot> {
  const [autoSwitch, spendRows, cheapestLeaders] = await Promise.all([
    loadPriceIntelligenceAutoSwitchPolicy(workspaceId),
    loadSpendRows(workspaceId),
    loadCheapestLeaders(),
  ]);

  const recommendations: PriceIntelligenceSwitchRecommendation[] = [];

  for (const row of spendRows.slice(0, 20)) {
    const tokens = normalizeSearchTokens(row.productName);
    const maxAltPrice = row.avgUnitPrice * (1 - PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT / 100);
    const cheapest = await findCheapestSupplier({
      categoryId: row.categoryId,
      excludeVendorId: row.vendorId,
      maxUnitPrice: maxAltPrice,
      nameTokens: tokens,
      gtin: row.gtin,
    });
    if (!cheapest) continue;

    const monthlySavingsUsd = estimateMonthlySavings({
      currentUnitPrice: row.avgUnitPrice,
      alternativeUnitPrice: cheapest.unitPrice,
      quantityLast90Days: row.quantity,
    });
    if (monthlySavingsUsd < PRICE_INTELLIGENCE_MIN_SAVINGS_USD) continue;

    const savingsPercent =
      Math.round(((row.avgUnitPrice - cheapest.unitPrice) / row.avgUnitPrice) * 1000) / 10;
    const autoSwitchEligible =
      autoSwitch.enabled && savingsPercent >= autoSwitch.minSavingsPercent;

    recommendations.push({
      id: recommendationId(["switch", row.productId, cheapest.productId]),
      productName: row.productName,
      categoryLabel: row.categoryLabel,
      currentProductId: row.productId,
      currentProductSlug: row.productSlug,
      currentVendorId: row.vendorId,
      currentVendorName: row.vendorName,
      currentUnitPrice: Math.round(row.avgUnitPrice * 100) / 100,
      cheapestProductId: cheapest.productId,
      cheapestProductSlug: cheapest.slug,
      cheapestVendorId: cheapest.vendorId,
      cheapestVendorName: cheapest.vendorName,
      cheapestUnitPrice: cheapest.unitPrice,
      currency: row.currency,
      quantityLast90Days: row.quantity,
      savingsPercent,
      monthlySavingsUsd,
      autoSwitchEligible,
      compareHref: `/dashboard/marketplace/compare?q=${encodeURIComponent(row.productName)}`,
    });
  }

  recommendations.sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd);

  return buildPriceIntelligenceSnapshot({
    workspaceId,
    autoSwitch,
    recommendations,
    cheapestLeaders,
    itemsScanned: spendRows.length,
  });
}

export async function resolvePriceIntelligenceSwitchProduct(input: {
  workspaceId: string;
  recommendationId: string;
}): Promise<{
  productId: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
} | null> {
  const snapshot = await loadPriceIntelligenceSnapshot(input.workspaceId);
  const rec = snapshot.recommendations.find((row) => row.id === input.recommendationId);
  if (!rec) return null;

  const product = await prisma.vendorProduct.findUnique({
    where: { id: rec.cheapestProductId },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      basePrice: true,
      currency: true,
      moq: true,
      vendorId: true,
      vendor: { select: { companyName: true } },
    },
  });
  if (!product) return null;

  const quantity = Math.max(product.moq, Math.max(1, Math.round(rec.quantityLast90Days / 3)));

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    vendorId: product.vendorId,
    vendorName: product.vendor.companyName,
    quantity,
    unitPrice: decimalToNumber(product.basePrice),
    currency: product.currency,
  };
}
