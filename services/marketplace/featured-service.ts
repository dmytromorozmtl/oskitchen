import { randomUUID } from "crypto";
import { addDays, subDays } from "date-fns";

import {
  applyFeaturedPerformanceEvent,
  defaultFeaturedPlacementsDocument,
  featuredSlotPriceUsd,
  isFeaturedPlacementActive,
  mergeFeaturedPlacementsIntoDocuments,
  parseFeaturedPlacementsDocument,
  resolveFeaturedPlacementStatus,
  sumFeaturedPlacementRevenue,
  toFeaturedPromotion,
  type MarketplaceFeaturedPerformanceEvent,
  type MarketplaceFeaturedPlacement,
  type MarketplaceFeaturedPlacementsDocument,
  type MarketplaceFeaturedPromotion,
  type MarketplaceFeaturedSlot,
} from "@/lib/marketplace/featured-placement-types";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

async function loadVendorFeaturedDocument(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, companyName: true, status: true, workspaceId: true, documents: true },
  });
  if (!vendor) return null;
  const featured = parseFeaturedPlacementsDocument(vendor.documents, vendor.id);
  return { vendor, featured };
}

async function persistVendorFeaturedDocument(
  vendorId: string,
  featured: MarketplaceFeaturedPlacementsDocument,
): Promise<void> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { documents: true },
  });
  if (!vendor) throw new Error("Vendor not found.");

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      documents: toInputJsonValue(
        mergeFeaturedPlacementsIntoDocuments(vendor.documents, {
          ...featured,
          updatedAt: new Date().toISOString(),
        }),
      ),
    },
  });
}

async function loadProductSnapshot(productId: string | null | undefined) {
  if (!productId) return { productId: null, productSlug: null, productName: null };
  const product = await prisma.vendorProduct.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true, vendorId: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") {
    return { productId: null, productSlug: null, productName: null };
  }
  return {
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
  };
}

function normalizePlacements(
  placements: MarketplaceFeaturedPlacement[],
  now = new Date(),
): MarketplaceFeaturedPlacement[] {
  return placements.map((placement) => ({
    ...placement,
    status: resolveFeaturedPlacementStatus(placement, now),
  }));
}

export async function createFeaturedPlacement(input: {
  vendorId: string;
  slot: MarketplaceFeaturedSlot;
  productId?: string | null;
  periodStart?: Date;
  weeks?: number;
  label?: string | null;
  activate?: boolean;
}): Promise<
  | { ok: true; placement: MarketplaceFeaturedPlacement }
  | { ok: false; error: string }
> {
  const context = await loadVendorFeaturedDocument(input.vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };
  if (context.vendor.status !== "APPROVED") {
    return { ok: false, error: "Only approved vendors can create featured placements." };
  }

  const weeks = input.weeks ?? 1;
  const periodStart = input.periodStart ?? new Date();
  const periodEnd = addDays(periodStart, weeks * 7);
  const product = await loadProductSnapshot(input.productId);
  if (input.productId && !product.productId) {
    return { ok: false, error: "Featured product not found or inactive." };
  }

  const now = new Date().toISOString();
  const placement: MarketplaceFeaturedPlacement = {
    id: randomUUID(),
    vendorId: input.vendorId,
    productId: product.productId,
    productSlug: product.productSlug,
    productName: product.productName,
    slot: input.slot,
    status: input.activate ? "active" : "draft",
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    paidAmountUsd: 0,
    currency: "USD",
    label: input.label?.trim() || MARKETPLACE_FEATURED_SLOT_LABEL(input.slot),
    performance: { views: 0, clicks: 0, conversions: 0 },
    createdAt: now,
    updatedAt: now,
  };

  const next: MarketplaceFeaturedPlacementsDocument = {
    kind: "featured_placements",
    placements: normalizePlacements([placement, ...context.featured.placements]).slice(0, 40),
    updatedAt: now,
  };

  await persistVendorFeaturedDocument(input.vendorId, next);

  await auditLog({
    workspaceId: context.vendor.workspaceId,
    actor: { userId: null, email: null, role: "SYSTEM" },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "MarketplaceFeaturedPlacement", id: placement.id, label: placement.slot },
    metadata: {
      operation: "marketplace.featured.create",
      vendorId: input.vendorId,
      slot: input.slot,
      productId: placement.productId,
    },
  }).catch(() => undefined);

  return { ok: true, placement };
}

function MARKETPLACE_FEATURED_SLOT_LABEL(slot: MarketplaceFeaturedSlot): string {
  return slot.replace(/_/g, " ");
}

export async function getActivePromotions(input?: {
  slot?: MarketplaceFeaturedSlot;
  limit?: number;
}): Promise<MarketplaceFeaturedPromotion[]> {
  const limit = input?.limit ?? 12;
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    select: { id: true, companyName: true, documents: true },
    take: 200,
  });

  const promotions: MarketplaceFeaturedPromotion[] = [];
  for (const vendor of vendors) {
    const featured = parseFeaturedPlacementsDocument(vendor.documents, vendor.id);
    for (const placement of normalizePlacements(featured.placements)) {
      if (!isFeaturedPlacementActive(placement)) continue;
      if (input?.slot && placement.slot !== input.slot) continue;
      promotions.push(toFeaturedPromotion(placement, vendor.companyName));
    }
  }

  return promotions
    .sort(
      (a, b) =>
        b.performance.clicks - a.performance.clicks ||
        b.performance.views - a.performance.views ||
        new Date(a.periodEnd).getTime() - new Date(b.periodEnd).getTime(),
    )
    .slice(0, limit);
}

export async function purchaseFeaturedSlot(input: {
  vendorId: string;
  placementId: string;
  weeks?: number;
}): Promise<
  | { ok: true; placement: MarketplaceFeaturedPlacement; chargedUsd: number }
  | { ok: false; error: string }
> {
  const context = await loadVendorFeaturedDocument(input.vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const index = context.featured.placements.findIndex((row) => row.id === input.placementId);
  if (index < 0) return { ok: false, error: "Featured placement not found." };

  const current = context.featured.placements[index];
  const weeks = input.weeks ?? Math.max(1, Math.ceil(
    (new Date(current.periodEnd).getTime() - new Date(current.periodStart).getTime()) /
      (7 * 86_400_000),
  ));
  const chargedUsd = featuredSlotPriceUsd(current.slot, weeks);
  const now = new Date();
  const periodEnd = addDays(now, weeks * 7);

  const updated: MarketplaceFeaturedPlacement = {
    ...current,
    status: "active",
    periodStart: now.toISOString(),
    periodEnd: periodEnd.toISOString(),
    paidAmountUsd: chargedUsd,
    updatedAt: now.toISOString(),
  };

  const placements = [...context.featured.placements];
  placements[index] = updated;

  await persistVendorFeaturedDocument(input.vendorId, {
    kind: "featured_placements",
    placements: normalizePlacements(placements),
    updatedAt: now.toISOString(),
  });

  await auditLog({
    workspaceId: context.vendor.workspaceId,
    actor: { userId: null, email: null, role: "SYSTEM" },
    action: AUDIT_ACTIONS.BILLING_PLAN_CHANGED,
    category: "BILLING",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "MarketplaceFeaturedPlacement", id: updated.id, label: updated.slot },
    metadata: {
      operation: "marketplace.featured.purchase",
      vendorId: input.vendorId,
      chargedUsd,
      weeks,
    },
  }).catch(() => undefined);

  return { ok: true, placement: updated, chargedUsd };
}

export async function trackPerformance(input: {
  vendorId: string;
  placementId: string;
  event: MarketplaceFeaturedPerformanceEvent;
}): Promise<
  | { ok: true; performance: MarketplaceFeaturedPlacement["performance"] }
  | { ok: false; error: string }
> {
  const context = await loadVendorFeaturedDocument(input.vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const index = context.featured.placements.findIndex((row) => row.id === input.placementId);
  if (index < 0) return { ok: false, error: "Featured placement not found." };

  const current = context.featured.placements[index];
  const performance = applyFeaturedPerformanceEvent(current.performance, input.event);
  const placements = [...context.featured.placements];
  placements[index] = {
    ...current,
    performance,
    updatedAt: new Date().toISOString(),
  };

  await persistVendorFeaturedDocument(input.vendorId, {
    kind: "featured_placements",
    placements,
    updatedAt: new Date().toISOString(),
  });

  return { ok: true, performance };
}

export async function loadAllFeaturedPlacements(): Promise<MarketplaceFeaturedPlacement[]> {
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    select: { id: true, documents: true },
    take: 300,
  });

  return vendors.flatMap((vendor) =>
    normalizePlacements(parseFeaturedPlacementsDocument(vendor.documents, vendor.id).placements),
  );
}

export async function loadFeaturedPlacementRevenue30d(): Promise<number> {
  const placements = await loadAllFeaturedPlacements();
  return sumFeaturedPlacementRevenue(placements, subDays(new Date(), 30));
}

export async function loadVendorFeaturedPlacements(
  vendorId: string,
): Promise<MarketplaceFeaturedPlacement[]> {
  const context = await loadVendorFeaturedDocument(vendorId);
  if (!context) return [];
  return normalizePlacements(context.featured.placements);
}
