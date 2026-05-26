import {
  LocationStatus,
  LocationType,
  LocationAssignmentTarget,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  brandListWhereForOwner,
  deliveryRouteListWhereForOwner,
  inventoryStockListWhereForOwner,
  kitchenTaskListWhereForOwner,
  locationAssignmentEventListWhereForOwner,
  locationByIdWhereForOwner,
  locationListWhereForOwner,
  menuByIdWhereForOwner,
  menuListWhereForOwner,
  packingBatchListWhereForOwner,
  productionBatchListWhereForOwner,
  purchaseOrderListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { orderByIdWhereForOwner, orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { slugifyLocationName } from "@/lib/locations/location-types";

type Scope = { userId: string };

export type CreateLocationInput = {
  userId: string;
  name: string;
  slug?: string | null;
  type?: LocationType;
  status?: LocationStatus;
  timezone?: string | null;
  phone?: string | null;
  email?: string | null;
  managerName?: string | null;
  addressJson?: Prisma.InputJsonValue | null;
  businessHoursJson?: Prisma.InputJsonValue | null;
  pickupHoursJson?: Prisma.InputJsonValue | null;
  deliveryHoursJson?: Prisma.InputJsonValue | null;
  fulfillmentSettingsJson?: Prisma.InputJsonValue | null;
  notes?: string | null;
  sortOrder?: number | null;
};

async function uniqueSlug(userId: string, baseName: string, override?: string | null): Promise<string> {
  let base = (override?.trim() || slugifyLocationName(baseName) || "location").slice(0, 100);
  if (!base) base = "location";
  let candidate = base;
  let i = 1;
  while (
    await prisma.location.findFirst({
      where: { AND: [await locationListWhereForOwner(userId), { slug: candidate }] },
      select: { id: true },
    })
  ) {
    i += 1;
    candidate = `${base}-${i}`;
    if (i > 50) break;
  }
  return candidate;
}

export async function createLocation(input: CreateLocationInput) {
  const slug = await uniqueSlug(input.userId, input.name, input.slug);
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  return prisma.location.create({
    data: {
      userId: input.userId,
      workspaceId,
      name: input.name.trim(),
      slug,
      type: input.type ?? "RESTAURANT",
      status: input.status ?? "SETUP",
      timezone: input.timezone?.trim() || "UTC",
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      managerName: input.managerName?.trim() || null,
      addressJson: input.addressJson ?? undefined,
      businessHoursJson: input.businessHoursJson ?? undefined,
      pickupHoursJson: input.pickupHoursJson ?? undefined,
      deliveryHoursJson: input.deliveryHoursJson ?? undefined,
      fulfillmentSettingsJson: input.fulfillmentSettingsJson ?? undefined,
      notes: input.notes?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function listLocationsForUser(scope: Scope) {
  return prisma.location.findMany({
    where: await locationListWhereForOwner(scope.userId),
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getLocationForUser(scope: Scope, locationId: string) {
  return prisma.location.findFirst({
    where: await locationByIdWhereForOwner(scope.userId, locationId),
  });
}

type UpdateLocationInput = Partial<Omit<CreateLocationInput, "userId">> & {
  status?: LocationStatus;
  defaultBrandId?: string | null;
  defaultStorefrontId?: string | null;
  addressJson?: Prisma.InputJsonValue | null;
  businessHoursJson?: Prisma.InputJsonValue | null;
  pickupHoursJson?: Prisma.InputJsonValue | null;
  deliveryHoursJson?: Prisma.InputJsonValue | null;
  closuresJson?: Prisma.InputJsonValue | null;
  fulfillmentSettingsJson?: Prisma.InputJsonValue | null;
  deliveryZonesJson?: Prisma.InputJsonValue | null;
  capacitySettingsJson?: Prisma.InputJsonValue | null;
  kitchenStationsJson?: Prisma.InputJsonValue | null;
  inventorySettingsJson?: Prisma.InputJsonValue | null;
  taxSettingsJson?: Prisma.InputJsonValue | null;
};

export async function updateLocation(scope: Scope, locationId: string, input: UpdateLocationInput) {
  const existing = await getLocationForUser(scope, locationId);
  if (!existing) throw new Error("Location not found.");

  const data: Prisma.LocationUpdateInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.type !== undefined) data.type = input.type;
  if (input.status !== undefined) data.status = input.status;
  if (input.timezone !== undefined) data.timezone = input.timezone?.trim() || "UTC";
  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.email !== undefined) data.email = input.email?.trim() || null;
  if (input.managerName !== undefined) data.managerName = input.managerName?.trim() || null;
  if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
  if (input.sortOrder !== undefined && input.sortOrder !== null) data.sortOrder = input.sortOrder;
  if (input.defaultBrandId !== undefined) data.defaultBrandId = input.defaultBrandId || null;
  if (input.defaultStorefrontId !== undefined) data.defaultStorefrontId = input.defaultStorefrontId || null;

  if (input.addressJson !== undefined) data.addressJson = input.addressJson ?? Prisma.JsonNull;
  if (input.businessHoursJson !== undefined) data.businessHoursJson = input.businessHoursJson ?? Prisma.JsonNull;
  if (input.pickupHoursJson !== undefined) data.pickupHoursJson = input.pickupHoursJson ?? Prisma.JsonNull;
  if (input.deliveryHoursJson !== undefined) data.deliveryHoursJson = input.deliveryHoursJson ?? Prisma.JsonNull;
  if (input.closuresJson !== undefined) data.closuresJson = input.closuresJson ?? Prisma.JsonNull;
  if (input.fulfillmentSettingsJson !== undefined) data.fulfillmentSettingsJson = input.fulfillmentSettingsJson ?? Prisma.JsonNull;
  if (input.deliveryZonesJson !== undefined) data.deliveryZonesJson = input.deliveryZonesJson ?? Prisma.JsonNull;
  if (input.capacitySettingsJson !== undefined) data.capacitySettingsJson = input.capacitySettingsJson ?? Prisma.JsonNull;
  if (input.kitchenStationsJson !== undefined) data.kitchenStationsJson = input.kitchenStationsJson ?? Prisma.JsonNull;
  if (input.inventorySettingsJson !== undefined) data.inventorySettingsJson = input.inventorySettingsJson ?? Prisma.JsonNull;
  if (input.taxSettingsJson !== undefined) data.taxSettingsJson = input.taxSettingsJson ?? Prisma.JsonNull;

  return prisma.location.update({ where: { id: locationId }, data });
}

export async function archiveLocation(scope: Scope, locationId: string) {
  return updateLocation(scope, locationId, { status: "ARCHIVED" });
}

/** Idempotent: refuses to assign rows that don't belong to the workspace user. */
export async function assignTargetToLocation(
  scope: Scope,
  target: LocationAssignmentTarget,
  targetId: string,
  locationId: string | null,
  performedBy: string | null,
): Promise<{ assigned: boolean; fromLocationId: string | null }> {
  const userId = scope.userId;

  // If locationId is provided, confirm ownership (or null to clear assignment).
  if (locationId) {
    const loc = await prisma.location.findFirst({
      where: await locationByIdWhereForOwner(userId, locationId),
      select: { id: true },
    });
    if (!loc) throw new Error("Target location not found.");
  }

  let fromLocationId: string | null = null;
  let assigned = false;

  switch (target) {
    case "MENU": {
      const row = await prisma.menu.findFirst({
        where: await menuByIdWhereForOwner(userId, targetId),
        select: { id: true, locationId: true },
      });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.menu.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "ORDER": {
      const row = await prisma.order.findFirst({
        where: await orderByIdWhereForOwner(userId, targetId),
        select: { id: true, locationId: true },
      });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.order.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "BRAND": {
      const brandScope = await brandListWhereForOwner(userId);
      const row = await prisma.brand.findFirst({
        where: { AND: [brandScope, { id: targetId }] },
        select: { id: true, locationId: true },
      });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.brand.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PRODUCTION_BATCH": {
      const row = await prisma.productionBatch.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.productionBatch.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PRODUCTION_WORK_ITEM": {
      const row = await prisma.productionWorkItem.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.productionWorkItem.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PACKING_BATCH": {
      const row = await prisma.packingBatch.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.packingBatch.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PACKING_TASK": {
      const row = await prisma.packingTask.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.packingTask.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "DELIVERY_ROUTE": {
      const row = await prisma.deliveryRoute.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.deliveryRoute.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "INVENTORY_STOCK": {
      const row = await prisma.inventoryStock.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.inventoryStock.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PURCHASE_ORDER": {
      const row = await prisma.purchaseOrder.findFirst({ where: { id: targetId, userId }, select: { id: true, locationId: true } });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.purchaseOrder.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "KITCHEN_TASK": {
      const row = await prisma.kitchenTask.findFirst({
        where: { AND: [await kitchenTaskListWhereForOwner(userId), { id: targetId }] },
        select: { id: true, locationId: true },
      });
      if (!row) return { assigned: false, fromLocationId: null };
      fromLocationId = row.locationId;
      await prisma.kitchenTask.update({ where: { id: row.id }, data: { locationId } });
      assigned = true;
      break;
    }
    case "PROFITABILITY_LINE":
    case "MENU_ITEM":
    case "CATERING_EVENT":
      // Not implemented yet — wired through KitchenTask integration for now.
      return { assigned: false, fromLocationId: null };
  }

  if (assigned) {
    const workspaceId = await resolveOwnerWorkspaceId(userId);
    await prisma.locationAssignmentEvent.create({
      data: {
        userId,
        workspaceId,
        locationId: locationId ?? null,
        fromLocationId,
        target,
        targetId,
        performedBy: performedBy?.slice(0, 255) ?? null,
      },
    });
  }
  return { assigned, fromLocationId };
}

export async function bulkAssignToLocation(
  scope: Scope,
  target: LocationAssignmentTarget,
  targetIds: readonly string[],
  locationId: string | null,
  performedBy: string | null,
): Promise<{ assigned: number; skipped: number }> {
  let assigned = 0;
  let skipped = 0;
  for (const id of targetIds) {
    try {
      const r = await assignTargetToLocation(scope, target, id, locationId, performedBy);
      if (r.assigned) assigned += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  return { assigned, skipped };
}

/** KPI loader for the Management Center overview. */
export async function loadLocationOverviewKpis(userId: string): Promise<{
  active: number;
  setup: number;
  withOrdersToday: number;
  missingHours: number;
  missingAddress: number;
  withDeliveryZones: number;
  total: number;
}> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const orderScope = await orderListWhereForOwner(userId);
  const locationScope = await locationListWhereForOwner(userId);
  const [active, setup, missingHours, missingAddress, withDeliveryZones, total, withOrdersTodayRaw] = await Promise.all([
    prisma.location.count({ where: { AND: [locationScope, { status: "ACTIVE" }] } }),
    prisma.location.count({ where: { AND: [locationScope, { status: "SETUP" }] } }),
    prisma.location.count({
      where: { AND: [locationScope, { businessHoursJson: { equals: Prisma.JsonNull } }] },
    }),
    prisma.location.count({ where: { AND: [locationScope, { addressJson: { equals: Prisma.JsonNull } }] } }),
    prisma.location.count({
      where: { AND: [locationScope, { deliveryZonesJson: { not: Prisma.JsonNull } }] },
    }),
    prisma.location.count({ where: locationScope }),
    prisma.order.groupBy({
      by: ["locationId"],
      where: {
        AND: [orderScope, { createdAt: { gte: start, lte: end }, locationId: { not: null } }],
      },
    }),
  ]);

  return {
    active,
    setup,
    withOrdersToday: withOrdersTodayRaw.length,
    missingHours,
    missingAddress,
    withDeliveryZones,
    total,
  };
}

export async function getLocationAssignmentEvents(scope: Scope, locationId?: string | null, take = 50) {
  const eventScope = await locationAssignmentEventListWhereForOwner(scope.userId);
  return prisma.locationAssignmentEvent.findMany({
    where: locationId ? { AND: [eventScope, { locationId }] } : eventScope,
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Count of records still missing a locationId across the major models. */
export async function countUnassignedRecords(userId: string): Promise<Record<string, number>> {
  const [
    brandScope,
    menuScope,
    orderScope,
    productionBatchScope,
    packingBatchScope,
    deliveryRouteScope,
    inventoryStockScope,
    purchaseOrderScope,
  ] = await Promise.all([
    brandListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    orderListWhereForOwner(userId),
    productionBatchListWhereForOwner(userId),
    packingBatchListWhereForOwner(userId),
    deliveryRouteListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
    purchaseOrderListWhereForOwner(userId),
  ]);
  const [menus, orders, brands, productionBatches, packingBatches, routes, inventoryStocks, purchaseOrders, kitchenTasks] = await Promise.all([
    prisma.menu.count({ where: { AND: [menuScope, { locationId: null }] } }),
    prisma.order.count({ where: { AND: [orderScope, { locationId: null }] } }),
    prisma.brand.count({ where: { AND: [brandScope, { locationId: null }] } }),
    prisma.productionBatch.count({ where: { AND: [productionBatchScope, { locationId: null }] } }),
    prisma.packingBatch.count({ where: { AND: [packingBatchScope, { locationId: null }] } }),
    prisma.deliveryRoute.count({ where: { AND: [deliveryRouteScope, { locationId: null }] } }),
    prisma.inventoryStock.count({ where: { AND: [inventoryStockScope, { locationId: null }] } }),
    prisma.purchaseOrder.count({ where: { AND: [purchaseOrderScope, { locationId: null }] } }),
    prisma.kitchenTask.count({
      where: { AND: [await kitchenTaskListWhereForOwner(userId), { locationId: null }] },
    }),
  ]);
  return {
    menus,
    orders,
    brands,
    productionBatches,
    packingBatches,
    routes,
    inventoryStocks,
    purchaseOrders,
    kitchenTasks,
  };
}
