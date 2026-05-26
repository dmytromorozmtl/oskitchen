"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { whereOwnedOrderForOwner } from "@/lib/scope/owned-order-guard";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { PackingEventType } from "@prisma/client";
import { recordPackingScan } from "@/services/packing-verification/verification-service";

const tokenSchema = z.string().min(8).max(128);

export async function lookupOrderByPackTokenAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const raw = String(formData.get("token") ?? "").trim();
    const sourceRaw = String(formData.get("source") ?? "MANUAL").trim();
    const source = sourceRaw === "CAMERA" ? "CAMERA" : "MANUAL";

    const token = tokenSchema.safeParse(raw);
    if (!token.success) {
      await recordPackingScan({
        userId: dataUserId,
        token: raw.slice(0, 256),
        tokenType: "UNKNOWN",
        source,
        success: false,
        errorMessage: "Invalid token format.",
      }).catch(() => {});
      return { error: "Enter a valid scan or lookup token." };
    }

    const orderScope = await orderListWhereForOwner(dataUserId);
    const order = await prisma.order.findFirst({
      where: {
        AND: [orderScope, { OR: [{ publicLookupToken: token.data }, { id: token.data }] }],
      },
      include: {
        orderItems: { include: { product: true } },
        packingEvents: { orderBy: { createdAt: "desc" }, take: 12 },
      },
    });
    if (!order) {
      await recordPackingScan({
        userId: dataUserId,
        token: token.data,
        tokenType: "UNKNOWN",
        source,
        success: false,
        errorMessage: "No order matches that token.",
      }).catch(() => {});
      return { error: "No order matches that token." };
    }

    await recordPackingScan({
      userId: dataUserId,
      token: token.data,
      tokenType: order.publicLookupToken === token.data ? "ORDER_PUBLIC_TOKEN" : "ORDER_ID",
      source,
      success: true,
    }).catch(() => {});

    return {
      ok: true as const,
      order: {
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        fulfillmentType: order.fulfillmentType,
        notes: order.notes,
        pickupDate: order.pickupDate ? order.pickupDate.toISOString() : null,
        brandId: order.brandId,
        publicLookupToken: order.publicLookupToken,
        items: order.orderItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          title: i.product?.title ?? i.title ?? "Custom item",
          allergens: i.product?.allergens ?? null,
        })),
        events: order.packingEvents.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          notes: e.notes,
          createdAt: e.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    try {
      const { sessionUser: user, dataUserId } = await requireTenantActor();
      await recordPackingScan({
        userId: dataUserId,
        token: String(formData.get("token") ?? "").trim().slice(0, 256),
        tokenType: "UNKNOWN",
        source: "MANUAL",
        success: false,
        errorMessage: safeError(e),
      });
    } catch {
      /* ignore secondary failure */
    }
    return { error: safeError(e) };
  }
}

const eventSchema = z.object({
  orderId: z.string().uuid(),
  eventType: z.nativeEnum(PackingEventType),
  orderItemId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  performedBy: z.string().max(255).optional().or(z.literal("")),
});

export async function logPackingEventAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = eventSchema.safeParse({
      orderId: formData.get("orderId"),
      eventType: formData.get("eventType"),
      orderItemId: formData.get("orderItemId"),
      notes: formData.get("notes"),
      performedBy: formData.get("performedBy"),
    });
    if (!parsed.success) return { error: "Invalid packing event." };

    const owns = await prisma.order.findFirst({
      where: await whereOwnedOrderForOwner(dataUserId, parsed.data.orderId),
      select: { id: true },
    });
    if (!owns) return { error: "Order not found." };

    const itemIdRaw = parsed.data.orderItemId?.trim();
    const orderItemId =
      itemIdRaw && /^[0-9a-f-]{36}$/i.test(itemIdRaw) ? itemIdRaw : undefined;

    await prisma.packingEvent.create({
      data: {
        userId: dataUserId,
        orderId: parsed.data.orderId,
        orderItemId: orderItemId ?? null,
        eventType: parsed.data.eventType,
        notes: parsed.data.notes?.trim() || null,
        performedBy: parsed.data.performedBy?.trim() || null,
      },
    });

    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function logPackingEventFormAction(formData: FormData): Promise<void> {
  void (await logPackingEventAction(formData));
}
