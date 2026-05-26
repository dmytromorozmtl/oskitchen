import { startOfDay } from "date-fns";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPrimaryOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";
import { encryptStorefrontOrderPiiFields } from "@/lib/storefront/storefront-order-pii";
import { generateStorefrontPublicToken } from "@/lib/store-token";
import { sendOrderConfirmation } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

export async function createStorefrontTestOrder(input: {
  userId: string;
  sendTestEmail: boolean;
  countInAnalytics: boolean;
}) {
  const primary = await getPrimaryOwnerStorefront(input.userId);
  if (!primary) throw new Error("Storefront not configured.");
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: primary.id },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      storeSlug: true,
      currency: true,
      publicName: true,
      activeMenu: {
        select: {
          products: { where: { active: true, storefrontVisible: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
        },
      },
    },
  });
  if (!sf?.activeMenu?.products[0]) {
    return { error: "Link an active menu with at least one visible product." as const };
  }
  const p = sf.activeMenu.products[0]!;
  const qty = 1;
  const subtotal = Number(p.price) * qty;
  const total = subtotal;
  const pickupDate = startOfDay(new Date());
  const publicToken = generateStorefrontPublicToken();
  const orderNumber = `TEST-${Date.now().toString(36).toUpperCase()}`;
  const cartSnapshot = [{ productId: p.id, title: p.title, quantity: qty, unitPrice: Number(p.price) }];
  const storefrontOrderPii = encryptStorefrontOrderPiiFields({
    customerName: "Test customer",
    customerEmail: "test@example.invalid",
    customerPhone: null,
  });

  const { createdOrder, storefrontOrder } = await prisma.$transaction(async (tx) => {
    const created = await persistResolvedOrder(
      {
        userId: sf.userId,
        workspaceId: sf.workspaceId,
        db: tx,
      },
      {
        orderType: "STOREFRONT_ORDER",
        creationSource: "STOREFRONT_TEST",
        statusKey: "CONFIRMED",
        paymentMode: "PAY_LATER",
        workspaceId: sf.workspaceId,
        customerName: "Test customer",
        customerEmail: "test@example.invalid",
        fulfillmentDetail: "PICKUP",
        fulfillmentDate: pickupDate,
        notes: "Storefront test order (admin)",
        subtotal,
        total,
        lines: [
          {
            productId: p.id,
            title: p.title,
            sku: undefined,
            quantity: qty,
            unitPrice: Number(p.price),
            lineTotal: total,
            notes: undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          },
        ],
      },
    );
    const sfo = await tx.storefrontOrder.create({
      data: {
        userId: sf.userId,
        storefrontId: sf.id,
        orderNumber,
        customerName: storefrontOrderPii.customerName!,
        customerEmail: storefrontOrderPii.customerEmail!,
        fulfillmentType: "PICKUP",
        pickupDate,
        subtotal,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total,
        paymentMode: "PAY_LATER",
        paymentStatus: "NOT_REQUIRED",
        status: "SUBMITTED",
        publicToken,
        internalOrderId: created.orderId,
        cartJson: cartSnapshot,
        source: "storefront_test",
        isTestOrder: true,
        lineItems: {
          create: cartSnapshot.map((c) => ({
            productId: c.productId,
            title: c.title,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            total: c.unitPrice * c.quantity,
          })),
        },
      },
    });
    return { createdOrder: created, storefrontOrder: sfo };
  });

  if (input.countInAnalytics) {
    await prisma.storefrontConversionEvent.create({
      data: {
        storefrontId: sf.id,
        eventName: "order_created",
        metadataJson: { test: true, total, storefrontOrderId: storefrontOrder.id } as Prisma.InputJsonValue,
      },
    });
  }

  if (input.sendTestEmail) {
    const settings = await prisma.kitchenSettings.findUnique({ where: { userId: sf.userId } });
    if (settings?.notifyOrderConfirmation) {
      const lines = await prisma.orderItem.findMany({
        where: { orderId: createdOrder.orderId },
        include: { product: true },
      });
      await sendOrderConfirmation({
        to: "test@example.invalid",
        customerName: "Test customer",
        orderId: createdOrder.orderId,
        total: formatCurrency(total, sf.currency),
        lookupUrl: `${SITE_URL}/order/${createdOrder.lookupToken}`,
        businessName: sf.publicName ?? settings.businessName,
        fulfillmentLabel: "Pickup",
        fulfillmentDate: undefined,
        lines: lines.map((i) => ({ title: i.product?.title ?? i.title ?? "Item", quantity: i.quantity })),
      });
    }
  }

  return { ok: true as const, token: publicToken };
}

export async function purgeStorefrontTestOrdersForUser(userId: string) {
  const { findAdminStorefront } = await import("@/lib/storefront/load-admin-storefront");
  const sf = await findAdminStorefront(userId, { id: true });
  if (!sf) return { error: "Storefront not found." as const };
  const tests = await prisma.storefrontOrder.findMany({
    where: { storefrontId: sf.id, isTestOrder: true },
    select: { id: true, internalOrderId: true },
  });
  for (const t of tests) {
    await prisma.$transaction(async (tx) => {
      await tx.storefrontOrder.delete({ where: { id: t.id } });
      if (t.internalOrderId) {
        await tx.orderItem.deleteMany({ where: { orderId: t.internalOrderId } });
        await tx.order.delete({ where: { id: t.internalOrderId } }).catch(() => undefined);
      }
    });
  }
  return { ok: true as const, removed: tests.length };
}
