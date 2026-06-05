"use server";


import { fail, ok } from "@/lib/action-result";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

import {
  sendDeliveryReminder,
  sendOrderConfirmation,
  sendOrderReady,
  sendPickupReminder,
  sendPreorderReminder,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/schemas";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { safeError } from "@/lib/security";
import { formatCurrency } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";
import {
  notifyNewOrderPush,
  notifyOrderReadyPush,
} from "@/services/notifications/order-lifecycle-push";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { whereOwnedOrderForOwner } from "@/lib/scope/owned-order-guard";
import {
  menuByIdWhereForOwner,
  menuListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  isValidOrderDbStatus,
  validateOrderDbStatusTransition,
  type OrderLikeForLifecycle,
} from "@/lib/workflows/order-lifecycle-rules";
import {
  recomputeMetricsForOrderEmail,
} from "@/services/crm/customer-metrics-service";
import { auditLog } from "@/services/audit/audit-service";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";
import { auditOrderDbStatusChange } from "@/services/workflows/order-lifecycle-service";

export async function createOrder(formData: FormData) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return { error: access.error };
    const { userId, workspaceId } = access.actor;

    const entries = formData.getAll("productId") as string[];
    const quantities = formData.getAll("qty").map((q) => Number(q) || 0);

    const lines: { productId: string; quantity: number }[] = [];
    for (let i = 0; i < entries.length; i++) {
      const productId = entries[i];
      const quantity = quantities[i] ?? 1;
      if (productId && quantity > 0) lines.push({ productId, quantity });
    }

    const fulfillmentRaw = String(formData.get("fulfillmentType") ?? "PICKUP");
    const fulfillmentType =
      fulfillmentRaw === "DELIVERY" ? "DELIVERY" : "PICKUP";

    const phoneRaw = String(formData.get("customerPhone") ?? "").trim();

    const parsed = orderCreateSchema.safeParse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: phoneRaw || undefined,
      pickupDate: formData.get("pickupDate") || undefined,
      fulfillmentType,
      notes: formData.get("notes") ?? undefined,
      lines,
    });

    if (!parsed.success) {
      return {
        error:
          Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
          "Invalid order",
      };
    }

    const body = parsed.data;

    const activeMenu = await prisma.menu.findFirst({
      where: await menuListWhereForOwnerAnd(userId, {
        active: true,
        catalogOnly: false,
      }),
    });
    if (!activeMenu) {
      return {
        error: "Activate a weekly menu before capturing orders.",
      };
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: body.lines.map((l) => l.productId) },
        menuId: activeMenu.id,
        active: true,
      },
    });

    if (products.length !== body.lines.length) {
      return {
        error: "Items must belong to your active menu and be available.",
      };
    }

    let total = 0;
    for (const line of body.lines) {
      const prod = products.find((p) => p.id === line.productId);
      if (!prod) continue;
      total += Number(prod.price) * line.quantity;
    }

    const created = await createOrderViaCenter(
      {
        userId,
        performedById: access.actor.sessionUser.id,
        workspaceId,
      },
      {
        orderType: "PREORDER",
        persistedOrderType: "MANUAL",
        fulfillmentDetail: body.fulfillmentType,
        fulfillmentDate: body.pickupDate?.toISOString(),
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone ?? undefined,
        notes: body.notes ?? undefined,
        lines: body.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      },
    );
    if (!created.ok) {
      return { error: created.error };
    }

    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId },
    });

    if (settings?.notifyOrderConfirmation) {
      const fulfillmentLabel =
        body.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup";
      await sendOrderConfirmation({
        to: body.customerEmail,
        customerName: body.customerName,
        orderId: created.orderId,
        total: formatCurrency(created.total),
        lookupUrl: `${SITE_URL}/order/${created.lookupToken}`,
        businessName: settings.businessName,
        fulfillmentLabel,
        fulfillmentDate: body.pickupDate
          ? format(body.pickupDate, "PP")
          : undefined,
        lines: body.lines.map((line) => ({
          title:
            products.find((product) => product.id === line.productId)?.title ??
            "Custom item",
          quantity: line.quantity,
        })),
      });
    }

    void notifyNewOrderPush({
      ownerUserId: userId,
      orderId: created.orderId,
      customerLabel: body.customerName || body.customerEmail,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/production");
    revalidatePath("/dashboard/customers");
    return ok({ orderId: created.orderId });
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  options?: { requiredPermission?: PermissionKey },
) {
  try {
    const access = await requireMutationPermission(options?.requiredPermission ?? "orders.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;

    const orderWhere = await whereOwnedOrderForOwner(userId, orderId);
    const prev = await prisma.order.findFirst({
      where: orderWhere,
      include: {
        orderItems: { include: { product: true } },
      },
    });
    if (!prev) return { error: "Order not found" };
    const prevPii = decryptOrderPiiFields({
      customerName: prev.customerName,
      customerEmail: prev.customerEmail,
      customerPhone: prev.customerPhone,
    });

    if (!isValidOrderDbStatus(status)) {
      return {
        error: "Invalid order status.",
        fixHref: `/dashboard/orders/${orderId}`,
      };
    }
    const nextStatus = status as OrderStatus;
    const lifecycle: OrderLikeForLifecycle = {
      id: prev.id,
      status: prev.status,
      fulfillmentType: prev.fulfillmentType,
      fulfillmentDetail: prev.fulfillmentDetail,
      orderType: prev.orderType,
      creationSource: prev.creationSource,
      sourceMetadataJson: prev.sourceMetadataJson,
      pickupDate: prev.pickupDate,
      deliveryAddressJson: prev.deliveryAddressJson,
      paymentStatus: prev.paymentStatus,
      orderItemsCount: prev.orderItems.length,
    };
    const guard = validateOrderDbStatusTransition(lifecycle, nextStatus);
    if (!guard.ok) {
      return {
        error: guard.message,
        fixHref: guard.fixHref,
      };
    }

    await prisma.order.updateMany({
      where: orderWhere,
      data: { status: nextStatus },
    });

    await auditOrderDbStatusChange({
      userId: user.id,
      email: user.email ?? null,
      orderId: prev.id,
      customerLabel: prevPii.customerName || prevPii.customerEmail,
      from: prev.status,
      to: nextStatus,
    });

    const { emitOrderUpdatedOutboundWebhook } = await import(
      "@/services/webhooks/outbound-webhook-emitters"
    );
    await emitOrderUpdatedOutboundWebhook({
      ownerUserId: userId,
      workspaceId: prev.workspaceId,
      orderId: prev.id,
      previousStatus: prev.status,
      status: nextStatus,
    }).catch(() => undefined);

    const { syncUberEatsStatusFromKitchenOrder } = await import(
      "@/services/integrations/uber-eats/status-sync.service"
    );
    await syncUberEatsStatusFromKitchenOrder({
      userId,
      channelProvider: prev.channelProvider,
      externalOrderId: prev.externalOrderIdExt,
      status: nextStatus,
    }).catch(() => undefined);

    const { syncDoorDashStatusFromKitchenOrder } = await import(
      "@/services/integrations/doordash/status-sync.service"
    );
    await syncDoorDashStatusFromKitchenOrder({
      userId,
      channelProvider: prev.channelProvider,
      externalOrderId: prev.externalOrderIdExt,
      status: nextStatus,
    }).catch(() => undefined);

    const { syncSkipStatusFromKitchenOrder } = await import(
      "@/services/integrations/skip/status-sync.service"
    );
    await syncSkipStatusFromKitchenOrder({
      userId,
      channelProvider: prev.channelProvider,
      externalOrderId: prev.externalOrderIdExt,
      status: nextStatus,
    }).catch(() => undefined);

    if (nextStatus === "COMPLETED") {
      await recomputeMetricsForOrderEmail(userId, prevPii.customerEmail);
    }

    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId },
    });

    if (nextStatus === "READY" && prev.status !== "READY" && settings) {
      const notifyReady =
        prev.fulfillmentType === "DELIVERY"
          ? settings.notifyDeliveryReminder
          : settings.notifyPickupReminder;
      if (notifyReady) {
        await sendOrderReady({
          to: prevPii.customerEmail,
          customerName: prevPii.customerName,
          businessName: settings.businessName,
          instructions:
            prev.fulfillmentType === "DELIVERY"
              ? "Your delivery team will be en route during your scheduled window."
              : settings.pickupAddress
                ? `Pickup at: ${settings.pickupAddress}`
                : "See your confirmation email for pickup details.",
        });
      }
      void notifyOrderReadyPush({
        ownerUserId: userId,
        orderId: prev.id,
        customerLabel: prevPii.customerName || prevPii.customerEmail,
      });
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/production");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/today");
    revalidatePath("/dashboard/customers");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateOrderKitchenNotes(orderId: string, kitchenNotes: string) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const orderWhere = await whereOwnedOrderForOwner(userId, orderId);
    const prev = await prisma.order.findFirst({
      where: orderWhere,
      select: { id: true, customerName: true, customerEmail: true },
    });
    if (!prev) return { error: "Order not found" };

    await prisma.order.updateMany({
      where: orderWhere,
      data: { kitchenNotes: kitchenNotes.trim() || null },
    });

    const trimmed = kitchenNotes.trim();
    await auditLog({
      actor: { userId: user.id, email: user.email ?? null },
      action: "ORDER_INTERNAL_NOTES_UPDATED",
      category: "ORDERS",
      source: "USER",
      entity: {
        type: "Order",
        id: orderId,
        label: prev.customerName || prev.customerEmail || orderId,
      },
      metadata: { noteCharCount: trimmed.length },
      maskPiiInMetadata: true,
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendReminderEmails(menuId: string) {
  try {
    const { userId } = await requireTenantActor();
    const menu = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    if (!menu) return { error: "Menu not found" };
    if (menu.catalogOnly) {
      return { error: "Reminder emails are not sent for the internal item catalog." };
    }

    const orderScope = await orderListWhereForOwner(userId);
    const orders = await prisma.order.findMany({
      where: { AND: [orderScope, { status: { in: ["PENDING", "CONFIRMED"] } }] },
      include: { orderItems: { include: { product: true } } },
    });

    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId },
    });

    let sent = 0;
    for (const o of orders) {
      const pii = decryptOrderPiiFields({
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
      });
      if (settings?.notifyPreorderReminder) {
        await sendPreorderReminder({
          to: pii.customerEmail,
          customerName: pii.customerName,
          deadline: format(menu.preorderDeadline, "PPpp"),
          businessName: settings.businessName,
        });
        sent++;
      }
    }

    revalidatePath("/dashboard/menus");
    return ok({ sent });
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendFulfillmentReminders() {
  try {
    const { userId } = await requireTenantActor();
    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId },
    });

    const orderScope = await orderListWhereForOwner(userId);
    const orders = await prisma.order.findMany({
      where: {
        AND: [orderScope, { status: { in: ["CONFIRMED", "PREPARING", "READY"] } }],
      },
    });

    let sent = 0;
    for (const o of orders) {
      const pii = decryptOrderPiiFields({
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
      });
      if (!o.pickupDate) continue;
      const when = format(o.pickupDate, "PP");

      if (o.fulfillmentType === "DELIVERY" && settings?.notifyDeliveryReminder) {
        await sendDeliveryReminder({
          to: pii.customerEmail,
          customerName: pii.customerName,
          when,
          businessName: settings.businessName,
        });
        sent++;
      } else if (
        o.fulfillmentType === "PICKUP" &&
        settings?.notifyPickupReminder
      ) {
        await sendPickupReminder({
          to: pii.customerEmail,
          customerName: pii.customerName,
          when,
          address: settings.pickupAddress,
          businessName: settings.businessName,
        });
        sent++;
      }
    }

    return ok({ sent });
  } catch (e) {
    return { error: safeError(e) };
  }
}
