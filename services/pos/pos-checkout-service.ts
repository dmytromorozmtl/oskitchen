import { randomUUID } from "crypto";

import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import type { PaymentModeKey } from "@/lib/orders/order-payment";
import type { FulfillmentDetailKey } from "@/lib/orders/order-fulfillment";
import { orderCreateInputSchema, type OrderCreateInput } from "@/lib/orders/order-validation";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";
import { logPosCheckoutAnalytics } from "@/services/pos/pos-analytics-service";
import { syncPosOrderToCrm } from "@/services/pos/pos-crm-service";
import { recordPendingInventoryImpactsForPosOrder } from "@/services/pos/pos-inventory-impact-service";
import { enqueueKitchenRoutingForPosOrder } from "@/services/pos/pos-kitchen-routing-service";
import { buildPosReceiptText } from "@/services/pos/pos-receipt-service";
import { auditLog } from "@/services/audit/audit-service";
import { redeemGiftCard } from "@/services/gift-cards/gift-card-service";
import { earnLoyaltyPointsForOrder,
  redeemLoyaltyPoints,
} from "@/services/loyalty/loyalty-service";
import {
  computePosCheckoutDiscountTotal,
  validateExplicitPosDiscountAmount,
} from "@/lib/pos/pos-discount-guard";
import { offlinePaymentReference } from "@/lib/pos/offline-sync";
import { linkOfflineCardCaptureToOrder } from "@/services/pos/offline-card-service";

export type PosCheckoutLine = {
  productId?: string;
  title?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  modifiersJson?: unknown;
};

export type PosCheckoutInput = {
  registerId: string;
  shiftId: string | null;
  staffMemberId: string | null;
  locationId: string | null;
  brandId: string | null;
  customerId: string | null;
  fulfillmentDetail: FulfillmentDetailKey;
  paymentMode: PaymentModeKey;
  lines: PosCheckoutLine[];
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  compRequiresManager?: boolean;
  loyaltyPointsRedeem?: number;
  giftCardCode?: string;
  offlineSaleId?: string;
};

export type PosCheckoutResult =
  | { ok: true; orderId: string; transactionId: string; receiptNumber: string }
  | { ok: false; error: string };

function receiptNumber(): string {
  return `POS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

function posReceiptCustomerSummary(input: {
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  kitchenCustomer: {
    displayName: string | null;
    name: string | null;
    email: string;
  } | null;
}): string | null {
  if (!input.customerId) return null;
  const k = input.kitchenCustomer;
  if (k) {
    const label =
      k.displayName?.trim() || k.name?.trim() || k.email.split("@")[0] || k.email;
    return `${label} (${k.email})`;
  }
  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  if (name && email) return `${name} (${email})`;
  if (email) return email;
  return name || null;
}

export async function checkoutPosSale(
  userId: string,
  performedByUserId: string,
  input: PosCheckoutInput,
): Promise<PosCheckoutResult> {
  const gate = await canUseFeature(userId, "pos_terminal");
  if (!gate.allowed) {
    return { ok: false, error: gate.reason ? `POS unavailable (${gate.reason}).` : "POS is not enabled for this plan." };
  }

  const register = await prisma.pOSRegister.findFirst({
    where: { id: input.registerId, userId },
    include: { location: { select: { id: true } } },
  });
  if (!register) return { ok: false, error: "Register not found." };
  const workspaceId =
    register.workspaceId ?? (await ensureOwnerWorkspaceId(userId));

  if (input.offlineSaleId) {
    const existing = await prisma.pOSTransaction.findFirst({
      where: {
        userId,
        externalPaymentReference: offlinePaymentReference(input.offlineSaleId),
      },
      select: { id: true, orderId: true, receiptNumber: true },
    });
    if (existing) {
      return {
        ok: true,
        orderId: existing.orderId,
        transactionId: existing.id,
        receiptNumber: existing.receiptNumber,
      };
    }
  }

  if (input.shiftId) {
    const shift = await prisma.pOSShift.findFirst({
      where: { id: input.shiftId, userId, registerId: register.id, status: "OPEN" },
    });
    if (!shift) return { ok: false, error: "Shift is not open for this register." };
  }

  const explicitDiscountError = validateExplicitPosDiscountAmount(input.discountAmount);
  if (explicitDiscountError) return { ok: false, error: explicitDiscountError };

  let giftCardApplied = 0;
  let loyaltyDiscountApplied = 0;
  if (input.giftCardCode?.trim()) {
    try {
      const gc = await redeemGiftCard(userId, input.giftCardCode.trim(), 10_000);
      giftCardApplied = gc.applied;
    } catch {
      return { ok: false, error: "Invalid or empty gift card." };
    }
  }
  if (input.loyaltyPointsRedeem && input.customerId && input.loyaltyPointsRedeem > 0) {
    try {
      const lr = await redeemLoyaltyPoints(
        userId,
        input.customerId,
        input.loyaltyPointsRedeem,
      );
      loyaltyDiscountApplied = lr.discount;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Loyalty redeem failed." };
    }
  }

  const discountTotal = computePosCheckoutDiscountTotal({
    explicitDiscountAmount: input.discountAmount,
    giftCardApplied,
    loyaltyDiscountApplied,
  });

  const orderInput: OrderCreateInput = orderCreateInputSchema.parse({
    orderType: "POS_SALE",
    statusKey: "CONFIRMED",
    fulfillmentDetail: input.fulfillmentDetail,
    paymentMode: input.paymentMode,
    customerId: input.customerId ?? undefined,
    brandId: input.brandId ?? undefined,
    locationId: input.locationId ?? register.locationId ?? undefined,
    notes: input.notes,
    discountAmount: discountTotal,
    taxAmount: input.taxAmount,
    sourceMetadataJson: JSON.stringify({
      pos: {
        registerId: register.id,
        shiftId: input.shiftId,
        staffMemberId: input.staffMemberId,
        fulfillmentIntent:
          input.fulfillmentDetail === "DELIVERY"
            ? "DELIVERY"
            : input.fulfillmentDetail === "DINE_IN"
              ? "DINE_IN"
              : "PICKUP_NOW",
      },
    }),
    lines: input.lines.map((l) => ({
      productId: l.productId,
      title: l.title,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      notes: l.notes,
      modifiersJson: l.modifiersJson ? JSON.stringify(l.modifiersJson) : undefined,
    })),
  });

  const created = await createOrderViaCenter(
    { userId, performedById: performedByUserId },
    orderInput,
  );
  if (!created.ok) return { ok: false, error: created.error };

  const order = await prisma.order.findFirst({
    where: { id: created.orderId, userId },
    include: {
      orderItems: { include: { product: true } },
      kitchenCustomer: { select: { displayName: true, name: true, email: true } },
    },
  });
  if (!order) return { ok: false, error: "Order missing after checkout." };
  const orderPii = decryptOrderPiiFields({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
  });

  const subtotal = Number(order.subtotal ?? order.total);
  const tax = Number(order.taxAmount ?? 0);
  const discount = Number(order.discountAmount ?? 0);
  const total = Number(order.total);
  const rcpt = receiptNumber();
  const customerSummary = posReceiptCustomerSummary({
    customerId: order.customerId,
    customerName: orderPii.customerName ?? "",
    customerEmail: orderPii.customerEmail ?? "",
    kitchenCustomer: order.kitchenCustomer,
  });
  const receiptText = buildPosReceiptText({
    receiptNumber: rcpt,
    businessName: null,
    orderId: order.id,
    customerSummary,
    lines: order.orderItems.map((li) => ({
      title: li.title ?? "Item",
      quantity: li.quantity,
      unitPrice: Number(li.unitPrice ?? 0),
      lineTotal: Number(li.lineTotal ?? 0),
    })),
    subtotal,
    tax,
    discount,
    total,
    paymentMode: input.paymentMode,
    fulfillment: input.fulfillmentDetail,
  });

  const paymentStatus = order.paymentStatus ?? "PAID";
  const paymentRowStatus = paymentStatus === "PAID" || paymentStatus === "NOT_REQUIRED" ? "PAID" : "PENDING";

  try {
    const txRow = await prisma.$transaction(async (tx) => {
      const txn = await tx.pOSTransaction.create({
        data: {
          userId,
          workspaceId,
          locationId: order.locationId ?? register.locationId,
          registerId: register.id,
          shiftId: input.shiftId,
          orderId: order.id,
          customerId: order.customerId,
          staffId: input.staffMemberId,
          paymentMode: input.paymentMode,
          paymentStatus,
          subtotal,
          tax,
          discount,
          tip: 0,
          total,
          receiptNumber: rcpt,
          status: "COMPLETED",
          externalPaymentReference: input.offlineSaleId
            ? offlinePaymentReference(input.offlineSaleId)
            : null,
        },
      });

      await tx.pOSPayment.create({
        data: {
          transactionId: txn.id,
          paymentMode: input.paymentMode,
          amount: total,
          status: paymentRowStatus,
          provider: "INTERNAL",
        },
      });

      await tx.pOSReceipt.create({
        data: {
          transactionId: txn.id,
          receiptNumber: rcpt,
          receiptText,
          receiptHtml: null,
        },
      });

      await tx.pOSAuditEvent.create({
        data: {
          userId,
          workspaceId,
          registerId: register.id,
          shiftId: input.shiftId,
          transactionId: txn.id,
          staffId: input.staffMemberId,
          action: "pos.checkout.completed",
          metadataJson: {
            orderId: order.id,
            total,
            paymentMode: input.paymentMode,
            customerId: order.customerId ?? undefined,
          } as Prisma.InputJsonValue,
        },
      });

      return txn;
    });

    await auditLog({
      actor: { userId: performedByUserId },
      action: AUDIT_ACTIONS.POS_CHECKOUT_COMPLETED,
      category: "ORDERS",
      source: "USER",
      severity: "INFO",
      entity: { type: "Order", id: order.id, label: "POS_SALE" },
      metadata: {
        registerId: register.id,
        receiptNumber: rcpt,
        total,
        customerId: order.customerId ?? undefined,
      },
      maskPiiInMetadata: true,
    });

    if (input.customerId) {
      const custLabel =
        order.kitchenCustomer?.displayName?.trim() ||
        order.kitchenCustomer?.name?.trim() ||
        order.customerName?.trim() ||
        "Kitchen customer";
      await auditLog({
        actor: { userId: performedByUserId },
        action: AUDIT_ACTIONS.POS_CHECKOUT_CUSTOMER_LINKED,
        category: "CUSTOMERS",
        source: "USER",
        severity: "INFO",
        entity: { type: "KitchenCustomer", id: input.customerId, label: custLabel },
        metadata: { orderId: order.id, registerId: register.id, receiptNumber: rcpt },
        maskPiiInMetadata: true,
      });
    }

    await auditLog({
      actor: { userId: performedByUserId },
      action: AUDIT_ACTIONS.POS_PAYMENT_RECORDED,
      category: "ORDERS",
      source: "USER",
      severity: "INFO",
      entity: { type: "Order", id: order.id, label: "POS_SALE" },
      metadata: { registerId: register.id, paymentMode: input.paymentMode, total },
      maskPiiInMetadata: true,
    });

    await auditLog({
      actor: { userId: performedByUserId },
      action: AUDIT_ACTIONS.POS_RECEIPT_CREATED,
      category: "ORDERS",
      source: "USER",
      severity: "INFO",
      entity: { type: "Order", id: order.id, label: rcpt },
      metadata: { registerId: register.id, receiptNumber: rcpt },
      maskPiiInMetadata: true,
    });

    await logPosCheckoutAnalytics(userId, workspaceId, order.id, total);
    await enqueueKitchenRoutingForPosOrder(userId, order.id);
    await recordPendingInventoryImpactsForPosOrder(userId, workspaceId, order.id);
    await syncPosOrderToCrm(userId, order.id);

    if (input.paymentMode === "OFFLINE_CARD_QUEUED" && input.offlineSaleId) {
      await linkOfflineCardCaptureToOrder({
        userId,
        workspaceId,
        offlineSaleId: input.offlineSaleId,
        orderId: order.id,
      }).catch(() => null);
    }

    if (order.customerId) {
      const lines = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        select: { title: true, productId: true, quantity: true, lineTotal: true },
      });
      await earnLoyaltyPointsForOrder(
        userId,
        order.customerId,
        order.id,
        Number(order.total),
        {
          lines: lines.map((line) => ({
            title: line.title,
            productId: line.productId,
            quantity: line.quantity,
            lineTotal: Number(line.lineTotal ?? 0),
          })),
        },
      ).catch(() => null);
    }

    return { ok: true, orderId: order.id, transactionId: txRow.id, receiptNumber: rcpt };
  } catch (e) {
    console.error("[pos] checkout persistence failed", e);
    return {
      ok: false,
      error: "Order was created but POS receipt/transaction failed — open the order and contact support.",
    };
  }
}
