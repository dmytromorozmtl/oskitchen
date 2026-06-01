import type { MarketplaceCurrency, MarketplacePaymentMethod } from "@prisma/client";

import { sendRawEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import {
  cartSubtotal,
  clearCart,
  getCart,
  type MarketplaceCartItem,
} from "@/services/marketplace/cart-service";
import {
  splitByVendor,
  type VendorCartGroup,
} from "@/lib/marketplace/checkout-utils";

export type { VendorCartGroup };
export { splitByVendor };

export type CartValidationIssue = {
  productId: string;
  sku: string;
  message: string;
};

export type MarketplaceCheckoutInput = {
  workspaceId: string;
  userId: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
  paymentMethod: MarketplacePaymentMethod;
  deliveryAddress: Record<string, unknown>;
  requestedDeliveryDate?: Date | null;
  notes?: string | null;
  paymentMethodId?: string | null;
};

export type MarketplaceCheckoutResult = {
  orderIds: string[];
  requiresApproval: boolean;
  paymentIntentClientSecret?: string | null;
  paymentIntentId?: string | null;
};

const DEFAULT_APPROVAL_LIMIT_USD = 2500;

export function approvalCheck(
  totalAmount: number,
  limitUsd: number = DEFAULT_APPROVAL_LIMIT_USD,
): boolean {
  return totalAmount > limitUsd;
}

export async function validateCart(
  workspaceId: string,
  items?: MarketplaceCartItem[],
): Promise<{ ok: true; items: MarketplaceCartItem[] } | { ok: false; issues: CartValidationIssue[] }> {
  const cartItems = items ?? (await getCart(workspaceId))?.items ?? [];
  if (cartItems.length === 0) {
    return { ok: false, issues: [{ productId: "", sku: "", message: "Cart is empty." }] };
  }

  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const products = await prisma.vendorProduct.findMany({
    where: {
      id: { in: productIds },
      status: "ACTIVE",
      vendor: { status: "APPROVED" },
    },
    include: {
      vendor: { select: { companyName: true, status: true } },
      variants: true,
    },
  });

  const byId = new Map(products.map((product) => [product.id, product]));
  const issues: CartValidationIssue[] = [];

  for (const line of cartItems) {
    const product = byId.get(line.productId);
    if (!product) {
      issues.push({
        productId: line.productId,
        sku: line.sku,
        message: "Product is no longer available.",
      });
      continue;
    }

    if (line.quantity < product.moq) {
      issues.push({
        productId: line.productId,
        sku: line.sku,
        message: `Minimum order quantity is ${product.moq}.`,
      });
    }

    if (line.quantity % product.orderIncrement !== 0) {
      issues.push({
        productId: line.productId,
        sku: line.sku,
        message: `Quantity must increment by ${product.orderIncrement}.`,
      });
    }

    const variant = line.variantId
      ? product.variants.find((entry) => entry.id === line.variantId)
      : null;
    if (line.variantId && !variant) {
      issues.push({
        productId: line.productId,
        sku: line.sku,
        message: "Selected variant is unavailable.",
      });
      continue;
    }

    const availableQty = variant?.stockQty ?? product.stockQty;
    if (availableQty < line.quantity && !product.allowBackorder) {
      issues.push({
        productId: line.productId,
        sku: line.sku,
        message: `Only ${availableQty} units in stock.`,
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, items: cartItems };
}

export async function createOrders(input: MarketplaceCheckoutInput): Promise<{
  orders: Array<{ id: string; vendorId: string; total: number; currency: MarketplaceCurrency }>;
  requiresApproval: boolean;
}> {
  const validation = await validateCart(input.workspaceId);
  if (!validation.ok) {
    throw new Error(validation.issues[0]?.message ?? "Cart validation failed.");
  }

  const groups = splitByVendor(validation.items);
  const grandTotal = cartSubtotal(validation.items);
  const requiresApproval = approvalCheck(grandTotal);
  const status = requiresApproval ? "PENDING_APPROVAL" : "SUBMITTED";

  const orders = await prisma.$transaction(async (tx) => {
    const created = [];
    for (const group of groups) {
      const vendor = await tx.vendor.findUnique({
        where: { id: group.vendorId },
        select: { commissionRate: true },
      });
      if (!vendor) {
        throw new Error("Vendor not found.");
      }

      const deliveryFee = 0;
      const subtotal = group.subtotal;
      const total = subtotal + deliveryFee;
      const currency = (group.items[0]?.currency ?? "USD") as MarketplaceCurrency;

      const order = await tx.marketplacePurchaseOrder.create({
        data: {
          workspaceId: input.workspaceId,
          vendorId: group.vendorId,
          status,
          subtotal,
          deliveryFee,
          total,
          currency,
          paymentMethod: input.paymentMethod,
          deliveryAddress: input.deliveryAddress,
          requestedDeliveryDate: input.requestedDeliveryDate ?? null,
          notes: input.notes ?? null,
          poNumber: `MPO-${Date.now().toString(36).toUpperCase()}`,
          items: {
            create: group.items.map((line) => ({
              productId: line.productId,
              variantId: line.variantId ?? null,
              productName: line.name,
              sku: line.sku,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              total: line.unitPrice * line.quantity,
            })),
          },
        },
      });

      const commissionRate = Number(vendor.commissionRate) / 100;
      const commissionAmount = total * commissionRate;
      await tx.vendorTransaction.create({
        data: {
          vendorId: group.vendorId,
          purchaseOrderId: order.id,
          grossAmount: total,
          commissionAmount,
          netAmount: total - commissionAmount,
          status: "PENDING",
        },
      });

      created.push({
        id: order.id,
        vendorId: group.vendorId,
        total: Number(order.total),
        currency: order.currency,
      });
    }
    return created;
  });

  await auditLog({
    workspaceId: input.workspaceId,
    actor: {
      userId: input.actorUserId,
      email: input.actorEmail,
      role: input.actorRole,
    },
    action: AUDIT_ACTIONS.ORDER_CREATED,
    category: "OTHER",
    source: "USER",
    severity: "INFO",
    entity: { type: "MarketplaceCheckout", id: orders[0]?.id ?? "batch", label: "marketplace.checkout" },
    metadata: {
      operation: "marketplace.checkout.create_orders",
      orderIds: orders.map((order) => order.id),
      requiresApproval,
      paymentMethod: input.paymentMethod,
    },
  });

  const { dispatchVendorWebhookEvent } = await import("@/services/marketplace/vendor-api-service");
  await Promise.all(
    orders.map((order) =>
      dispatchVendorWebhookEvent({
        vendorId: order.vendorId,
        event: "new_order",
        data: {
          orderId: order.id,
          total: order.total,
          currency: order.currency,
          status,
        },
      }).catch(() => undefined),
    ),
  );

  return { orders, requiresApproval };
}

export async function processPayment(input: {
  orderId: string;
  paymentMethod: MarketplacePaymentMethod;
  paymentMethodId?: string | null;
}): Promise<{ paymentIntentId: string | null; clientSecret: string | null }> {
  if (input.paymentMethod !== "CARD") {
    return { paymentIntentId: null, clientSecret: null };
  }

  const order = await prisma.marketplacePurchaseOrder.findUnique({
    where: { id: input.orderId },
    select: { id: true, total: true, currency: true, workspaceId: true },
  });
  if (!order) {
    throw new Error("Order not found.");
  }

  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(order.total) * 100),
    currency: order.currency.toLowerCase(),
    metadata: {
      marketplaceOrderId: order.id,
      workspaceId: order.workspaceId,
    },
    ...(input.paymentMethodId
      ? { payment_method: input.paymentMethodId, confirm: true }
      : { automatic_payment_methods: { enabled: true } }),
  });

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: { paymentIntentId: paymentIntent.id },
  });

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function sendConfirmation(input: {
  workspaceId: string;
  userId: string;
  actorEmail: string | null;
  orderIds: string[];
}): Promise<void> {
  const orders = await prisma.marketplacePurchaseOrder.findMany({
    where: { id: { in: input.orderIds }, workspaceId: input.workspaceId },
    include: { vendor: { select: { companyName: true } } },
  });

  const owner = await prisma.userProfile.findUnique({
    where: { id: input.userId },
    select: { email: true, fullName: true },
  });

  const recipient = input.actorEmail ?? owner?.email;
  const lines = orders
    .map(
      (order) =>
        `- ${order.vendor.companyName}: ${order.currency} ${Number(order.total).toFixed(2)} (${order.status})`,
    )
    .join("\n");

  if (recipient) {
    await sendRawEmail({
      to: recipient,
      subject: `Marketplace order confirmation (${orders.length} PO${orders.length === 1 ? "" : "s"})`,
      text: `Your marketplace purchase orders were created:\n\n${lines}\n\nView them in OS Kitchen → Marketplace → Orders.`,
    });
  }

  await prisma.notificationLog.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      type: "ORDER_CONFIRMATION",
      dedupeKey: `marketplace-checkout:${input.orderIds.join(":")}`,
      recipient: recipient ?? "workspace",
      status: "SENT",
      category: "TRANSACTIONAL",
      channel: "IN_APP",
      templateKey: "marketplace_order_confirmation",
      sourceType: "MARKETPLACE_CHECKOUT",
      sourceId: input.orderIds.join(","),
      metadata: {
        orderIds: input.orderIds,
        orderCount: orders.length,
      },
      sentAt: new Date(),
    },
  });
}

export async function checkoutMarketplaceCart(
  input: MarketplaceCheckoutInput,
): Promise<MarketplaceCheckoutResult> {
  if (input.paymentMethod === "NET_TERMS") {
    const capital = await import("@/services/marketplace/capital-integration-service");
    const cartModule = await import("@/services/marketplace/cart-service");
    const cart = await cartModule.getCart(input.workspaceId);
    const total = cartModule.cartSubtotal(cart?.items ?? []);
    const creditCheck = await capital.assertNetTermsCheckoutAllowed({
      workspaceId: input.workspaceId,
      userId: input.userId,
      additionalAmountUsd: total,
    });
    if (!creditCheck.ok) {
      throw new Error(creditCheck.error);
    }
  }

  const { orders, requiresApproval } = await createOrders(input);

  let paymentIntentClientSecret: string | null = null;
  let paymentIntentId: string | null = null;

  if (!requiresApproval && input.paymentMethod === "CARD" && orders[0]) {
    const payment = await processPayment({
      orderId: orders[0].id,
      paymentMethod: input.paymentMethod,
      paymentMethodId: input.paymentMethodId,
    });
    paymentIntentClientSecret = payment.clientSecret;
    paymentIntentId = payment.paymentIntentId;
  }

  await sendConfirmation({
    workspaceId: input.workspaceId,
    userId: input.userId,
    actorEmail: input.actorEmail,
    orderIds: orders.map((order) => order.id),
  });

  await clearCart(input.workspaceId, {
    userId: input.actorUserId,
    email: input.actorEmail,
    role: input.actorRole,
  });

  if (input.paymentMethod === "NET_TERMS" && orders.length > 0) {
    const capital = await import("@/services/marketplace/capital-integration-service");
    await capital.paymentSchedule({
      workspaceId: input.workspaceId,
      userId: input.userId,
      orderIds: orders.map((order) => order.id),
    });
  }

  return {
    orderIds: orders.map((order) => order.id),
    requiresApproval,
    paymentIntentClientSecret,
    paymentIntentId,
  };
}
