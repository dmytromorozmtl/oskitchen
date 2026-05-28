"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DeliveryEventType,
  DeliveryRouteMode,
  type DeliveryStopStatus,
  type FailedDeliveryReason,
} from "@prisma/client";
import { z } from "zod";

import { requireRouteMutation } from "@/lib/routes/require-route-mutation";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/routes/route-planning";
import { isRouteMode } from "@/lib/routes/route-types";
import { safeError } from "@/lib/security";
import {
  assignDriver,
  createManualRoute,
  recordRouteEvent,
  reorderStop,
  updateStopStatus,
} from "@/services/routes/route-service";

const buildSchema = z.object({
  routeDate: z.string().min(8),
  driverName: z.string().max(255).optional().or(z.literal("")),
});

function revalidateRoutes(routeId?: string) {
  revalidatePath("/dashboard/routes");
  revalidatePath("/dashboard/routes/planner");
  revalidatePath("/dashboard/routes/drivers");
  revalidatePath("/dashboard/routes/zones");
  revalidatePath("/dashboard/routes/uber-direct");
  revalidatePath("/dashboard/calendar");
  if (routeId) revalidatePath(`/dashboard/routes/${routeId}`);
}

/* ----------------------------- legacy preserved ----------------------------- */

export async function createDeliveryRouteFromOrdersAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.create_from_orders" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = buildSchema.safeParse({
      routeDate: formData.get("routeDate"),
      driverName: formData.get("driverName"),
    });
    if (!parsed.success) return { error: "Pick a route date." };

    const routeDate = startOfUtcDay(new Date(parsed.data.routeDate));

    const orders = await prisma.order.findMany({
      where: await orderListWhereForOwnerAnd(dataUserId, {
        fulfillmentType: "DELIVERY",
        pickupDate: routeDate,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
      }),
      orderBy: { createdAt: "asc" },
    });

    if (orders.length === 0) {
      return {
        error:
          "No open delivery orders with that pickup date — use Orders to set pickup dates first.",
      };
    }

    const route = await prisma.deliveryRoute.create({
      data: {
        userId: dataUserId,
        routeDate,
        driverName: parsed.data.driverName?.trim() || null,
        totalStops: orders.length,
        mode: DeliveryRouteMode.MEAL_PREP_DELIVERY,
      },
    });

    let seq = 0;
    for (const o of orders) {
      await prisma.deliveryStop.create({
        data: {
          routeId: route.id,
          orderId: o.id,
          sequence: seq++,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone ?? null,
          addressJson: {
            placeholder: true,
            hint: "Paste full address into KitchenOS orders or driver notes.",
            notes: o.notes ?? "",
          },
          status: "PENDING",
        },
      });
    }

    await recordRouteEvent(route.id, DeliveryEventType.ROUTE_CREATED, user.email ?? null, {
      source: "by_date",
      orderCount: orders.length,
    });

    revalidateRoutes(route.id);
    return { ok: true as const, routeId: route.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createDeliveryRouteFromOrdersFormAction(formData: FormData): Promise<void> {
  void (await createDeliveryRouteFromOrdersAction(formData));
}

/* ----------------------------- new actions ----------------------------- */

const manualRouteSchema = z.object({
  routeDate: z.string().min(8),
  title: z.string().max(255).optional().or(z.literal("")),
  driverName: z.string().max(255).optional().or(z.literal("")),
  vehicleName: z.string().max(255).optional().or(z.literal("")),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  zoneId: z.string().uuid().optional().or(z.literal("")),
  mode: z.string().optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function createManualRouteAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.create_manual" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = manualRouteSchema.safeParse({
      routeDate: formData.get("routeDate"),
      title: formData.get("title"),
      driverName: formData.get("driverName"),
      vehicleName: formData.get("vehicleName"),
      brandId: formData.get("brandId"),
      locationId: formData.get("locationId"),
      zoneId: formData.get("zoneId"),
      mode: formData.get("mode"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Route date is required." };

    const mode = isRouteMode(parsed.data.mode) ? parsed.data.mode : null;
    const routeId = await createManualRoute({
      userId: dataUserId,
      routeDate: new Date(parsed.data.routeDate),
      title: parsed.data.title || null,
      driverName: parsed.data.driverName || null,
      vehicleName: parsed.data.vehicleName || null,
      brandId: parsed.data.brandId || null,
      locationId: parsed.data.locationId || null,
      zoneId: parsed.data.zoneId || null,
      mode,
      notes: parsed.data.notes || null,
    });
    revalidateRoutes(routeId);
    return { ok: true as const, routeId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createManualRouteFormAction(formData: FormData): Promise<void> {
  const result = await createManualRouteAction(formData);
  if ("ok" in result && result.ok) redirect(`/dashboard/routes/${result.routeId}`);
}

const reorderSchema = z.object({
  routeId: z.string().uuid(),
  stopId: z.string().uuid(),
  toIndex: z.coerce.number().int().min(0),
});

export async function reorderStopAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.reorder_stop" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = reorderSchema.safeParse({
      routeId: formData.get("routeId"),
      stopId: formData.get("stopId"),
      toIndex: formData.get("toIndex"),
    });
    if (!parsed.success) return { error: "Invalid stop reorder request." };
    await reorderStop({ userId: dataUserId }, parsed.data);
    revalidateRoutes(parsed.data.routeId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const stopStatusSchema = z.object({
  routeId: z.string().uuid(),
  stopId: z.string().uuid(),
  to: z.enum([
    "PENDING",
    "PACKED",
    "READY",
    "LOADED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED",
    "SKIPPED",
    "RETURNED",
  ]),
  failedReason: z
    .enum([
      "CUSTOMER_UNAVAILABLE",
      "WRONG_ADDRESS",
      "DRIVER_ISSUE",
      "ORDER_NOT_PACKED",
      "WEATHER_TRAFFIC",
      "PAYMENT_ISSUE",
      "OTHER",
    ])
    .optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function updateStopStatusAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.update_stop_status" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = stopStatusSchema.safeParse({
      routeId: formData.get("routeId"),
      stopId: formData.get("stopId"),
      to: formData.get("to"),
      failedReason: formData.get("failedReason") || undefined,
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Invalid stop status update." };

    await updateStopStatus(
      { userId: dataUserId },
      {
        routeId: parsed.data.routeId,
        stopId: parsed.data.stopId,
        to: parsed.data.to as DeliveryStopStatus,
        failedReason: (parsed.data.failedReason ?? null) as FailedDeliveryReason | null,
        notes: parsed.data.notes || null,
        performedBy: user.email ?? null,
      },
    );

    revalidateRoutes(parsed.data.routeId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStopStatusFormAction(formData: FormData): Promise<void> {
  void (await updateStopStatusAction(formData));
}

const assignDriverSchema = z.object({
  routeId: z.string().uuid(),
  driverProfileId: z.string().uuid().optional().or(z.literal("")),
  driverName: z.string().max(255).optional().or(z.literal("")),
});

export async function assignDriverAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.assign_driver" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = assignDriverSchema.safeParse({
      routeId: formData.get("routeId"),
      driverProfileId: formData.get("driverProfileId"),
      driverName: formData.get("driverName"),
    });
    if (!parsed.success) return { error: "Invalid driver assignment." };
    await assignDriver(
      { userId: dataUserId },
      parsed.data.routeId,
      parsed.data.driverProfileId || null,
      parsed.data.driverName || null,
      user.email ?? null,
    );
    revalidateRoutes(parsed.data.routeId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function assignDriverFormAction(formData: FormData): Promise<void> {
  void (await assignDriverAction(formData));
}

/* ---------------------- driver profile / zone CRUD ---------------------- */

const driverSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().max(64).optional().or(z.literal("")),
  email: z.string().email().max(255).optional().or(z.literal("")),
  vehicle: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function createDriverAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.create_driver" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = driverSchema.safeParse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      vehicle: formData.get("vehicle"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Driver name is required." };
    await prisma.driverProfile.create({
      data: {
        userId: dataUserId,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        email: parsed.data.email?.trim() || null,
        vehicle: parsed.data.vehicle?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidateRoutes();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createDriverFormAction(formData: FormData): Promise<void> {
  void (await createDriverAction(formData));
}

const zoneSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  postalCodes: z.string().max(4000).optional().or(z.literal("")),
  radiusKm: z.string().optional().or(z.literal("")),
  deliveryFee: z.string().optional().or(z.literal("")),
  minimumOrderAmount: z.string().optional().or(z.literal("")),
});

function toDecimal(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createZoneAction(formData: FormData) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.create_zone" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = zoneSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      postalCodes: formData.get("postalCodes"),
      radiusKm: formData.get("radiusKm"),
      deliveryFee: formData.get("deliveryFee"),
      minimumOrderAmount: formData.get("minimumOrderAmount"),
    });
    if (!parsed.success) return { error: "Zone name is required." };

    const postal = (parsed.data.postalCodes ?? "")
      .split(/[,\s\n]+/)
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    await prisma.deliveryZone.create({
      data: {
        userId: dataUserId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        postalCodesJson: postal.length ? postal : undefined,
        radiusKm: toDecimal(parsed.data.radiusKm) ?? undefined,
        deliveryFee: toDecimal(parsed.data.deliveryFee) ?? undefined,
        minimumOrderAmount: toDecimal(parsed.data.minimumOrderAmount) ?? undefined,
      },
    });
    revalidateRoutes();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createZoneFormAction(formData: FormData): Promise<void> {
  void (await createZoneAction(formData));
}

export async function recordManifestPrintedAction(routeId: string) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.record_manifest_printed" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const route = await prisma.deliveryRoute.findFirst({
      where: { id: routeId, userId: dataUserId },
      select: { id: true },
    });
    if (!route) return { error: "Route not found." };
    await recordRouteEvent(routeId, DeliveryEventType.MANIFEST_PRINTED, user.email ?? null);
    revalidateRoutes(routeId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function recordUberQuotePlaceholderAction(routeId: string) {
  try {
    const access = await requireRouteMutation({ operation: "delivery_route.record_uber_quote_placeholder" });
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const route = await prisma.deliveryRoute.findFirst({
      where: { id: routeId, userId: dataUserId },
      select: { id: true },
    });
    if (!route) return { error: "Route not found." };
    await recordRouteEvent(routeId, DeliveryEventType.UBER_QUOTE_REQUESTED_PLACEHOLDER, user.email ?? null, {
      note: "Placeholder — no Uber API call was made.",
    });
    revalidateRoutes(routeId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
