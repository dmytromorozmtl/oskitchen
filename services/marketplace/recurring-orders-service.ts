import type { MarketplaceRecurringFrequency } from "@prisma/client";
import { addDays, addMonths, addWeeks } from "date-fns";

import { prisma } from "@/lib/prisma";
import { checkoutMarketplaceCart } from "@/services/marketplace/checkout-service";
import {
  addToCart,
  clearCart,
  type MarketplaceCartItem,
} from "@/services/marketplace/cart-service";

export type RecurringOrderItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  variantId?: string;
};

export type MarketplaceRecurringOrderRow = {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  frequency: MarketplaceRecurringFrequency;
  nextRunAt: string;
  lastRunAt: string | null;
  isActive: boolean;
  approvalRequired: boolean;
  itemCount: number;
};

function parseRecurringItems(raw: unknown): RecurringOrderItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is RecurringOrderItem =>
      typeof entry === "object" &&
      entry != null &&
      typeof (entry as RecurringOrderItem).productId === "string" &&
      typeof (entry as RecurringOrderItem).quantity === "number",
  );
}

export function computeNextRecurringRunAt(
  from: Date,
  frequency: MarketplaceRecurringFrequency,
): Date {
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(from, 1);
    case "BIWEEKLY":
      return addWeeks(from, 2);
    case "MONTHLY":
      return addMonths(from, 1);
    default:
      return addDays(from, 7);
  }
}

export async function loadMarketplaceRecurringOrders(
  workspaceId: string,
): Promise<MarketplaceRecurringOrderRow[]> {
  const rows = await prisma.marketplaceRecurringOrder.findMany({
    where: { workspaceId },
    orderBy: [{ isActive: "desc" }, { nextRunAt: "asc" }],
    include: { vendor: { select: { companyName: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    vendorId: row.vendorId,
    vendorName: row.vendor.companyName,
    frequency: row.frequency,
    nextRunAt: row.nextRunAt.toISOString(),
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    isActive: row.isActive,
    approvalRequired: row.approvalRequired,
    itemCount: parseRecurringItems(row.items).length,
  }));
}

export async function createMarketplaceRecurringOrder(input: {
  workspaceId: string;
  vendorId: string;
  name: string;
  items: RecurringOrderItem[];
  frequency: MarketplaceRecurringFrequency;
  approvalRequired?: boolean;
  startAt?: Date;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (input.items.length === 0) {
    return { ok: false, error: "Add at least one line item." };
  }

  const vendor = await prisma.vendor.findFirst({
    where: { id: input.vendorId, status: "APPROVED" },
    select: { id: true },
  });
  if (!vendor) return { ok: false, error: "Vendor not found." };

  const startAt = input.startAt ?? new Date();
  const row = await prisma.marketplaceRecurringOrder.create({
    data: {
      workspaceId: input.workspaceId,
      vendorId: input.vendorId,
      name: input.name.trim(),
      items: input.items,
      frequency: input.frequency,
      nextRunAt: startAt,
      isActive: true,
      approvalRequired: input.approvalRequired ?? false,
    },
  });

  return { ok: true, id: row.id };
}

export async function updateMarketplaceRecurringOrder(input: {
  workspaceId: string;
  recurringOrderId: string;
  name?: string;
  items?: RecurringOrderItem[];
  frequency?: MarketplaceRecurringFrequency;
  approvalRequired?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.marketplaceRecurringOrder.findFirst({
    where: { id: input.recurringOrderId, workspaceId: input.workspaceId },
  });
  if (!existing) return { ok: false, error: "Recurring order not found." };

  await prisma.marketplaceRecurringOrder.update({
    where: { id: existing.id },
    data: {
      name: input.name?.trim() ?? existing.name,
      items: input.items ?? existing.items,
      frequency: input.frequency ?? existing.frequency,
      approvalRequired: input.approvalRequired ?? existing.approvalRequired,
    },
  });

  return { ok: true };
}

export async function setMarketplaceRecurringOrderActive(input: {
  workspaceId: string;
  recurringOrderId: string;
  isActive: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.marketplaceRecurringOrder.findFirst({
    where: { id: input.recurringOrderId, workspaceId: input.workspaceId },
  });
  if (!existing) return { ok: false, error: "Recurring order not found." };

  await prisma.marketplaceRecurringOrder.update({
    where: { id: existing.id },
    data: {
      isActive: input.isActive,
      nextRunAt: input.isActive ? existing.nextRunAt : existing.nextRunAt,
    },
  });

  return { ok: true };
}

async function recurringItemsToCartItems(items: RecurringOrderItem[]): Promise<MarketplaceCartItem[]> {
  return items.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    sku: item.sku,
    vendorId: item.vendorId,
    vendorName: item.vendorName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    currency: item.currency,
    variantId: item.variantId,
  }));
}

export async function runMarketplaceRecurringOrder(input: {
  recurringOrderId: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
  deliveryAddress: Record<string, unknown>;
}): Promise<{ ok: true; orderIds: string[] } | { ok: false; error: string }> {
  const recurring = await prisma.marketplaceRecurringOrder.findUnique({
    where: { id: input.recurringOrderId },
    include: { vendor: { select: { companyName: true } } },
  });
  if (!recurring || !recurring.isActive) {
    return { ok: false, error: "Recurring order not found or paused." };
  }

  const items = parseRecurringItems(recurring.items);
  if (items.length === 0) {
    return { ok: false, error: "Recurring order has no items." };
  }

  await clearCart(recurring.workspaceId, {
    userId: input.actorUserId,
    email: input.actorEmail,
    role: input.actorRole,
  });

  for (const item of items) {
    await addToCart(recurring.workspaceId, item, {
      userId: input.actorUserId,
      email: input.actorEmail,
      role: input.actorRole,
    });
  }

  const result = await checkoutMarketplaceCart({
    workspaceId: recurring.workspaceId,
    userId: input.actorUserId,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    paymentMethod: "NET_TERMS",
    deliveryAddress: input.deliveryAddress,
    notes: `Recurring order: ${recurring.name}`,
  });

  await prisma.marketplaceRecurringOrder.update({
    where: { id: recurring.id },
    data: {
      lastRunAt: new Date(),
      nextRunAt: computeNextRecurringRunAt(new Date(), recurring.frequency),
    },
  });

  return { ok: true, orderIds: result.orderIds };
}

export async function runDueMarketplaceRecurringOrders(): Promise<{
  processed: number;
  skipped: number;
  errors: string[];
}> {
  const due = await prisma.marketplaceRecurringOrder.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: new Date() },
    },
    include: {
      workspace: {
        select: {
          id: true,
          ownerUserId: true,
          owner: { select: { email: true } },
        },
      },
    },
    take: 50,
  });

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of due) {
    if (row.approvalRequired) {
      skipped += 1;
      continue;
    }

    try {
      const items = await recurringItemsToCartItems(parseRecurringItems(row.items));
      if (items.length === 0) {
        skipped += 1;
        continue;
      }

      await clearCart(row.workspaceId, {
        userId: row.workspace.ownerUserId,
        email: row.workspace.owner?.email ?? null,
        role: "OWNER",
      });

      for (const item of items) {
        await addToCart(row.workspaceId, item, {
          userId: row.workspace.ownerUserId,
          email: row.workspace.owner?.email ?? null,
          role: "OWNER",
        });
      }

      await checkoutMarketplaceCart({
        workspaceId: row.workspaceId,
        userId: row.workspace.ownerUserId,
        actorUserId: row.workspace.ownerUserId,
        actorEmail: row.workspace.owner?.email ?? null,
        actorRole: "OWNER",
        paymentMethod: "NET_TERMS",
        deliveryAddress: { source: "recurring-order", recurringOrderId: row.id },
        notes: `Auto recurring: ${row.name}`,
      });

      await prisma.marketplaceRecurringOrder.update({
        where: { id: row.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: computeNextRecurringRunAt(new Date(), row.frequency),
        },
      });

      processed += 1;
    } catch (error) {
      errors.push(
        `${row.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return { processed, skipped, errors };
}
