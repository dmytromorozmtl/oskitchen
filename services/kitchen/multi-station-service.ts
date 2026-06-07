import { prisma } from "@/lib/prisma";
import {
  applyKdsMultiStationRouting,
  buildKdsMultiStationSnapshot,
  mergeStationRegistry,
  normalizeKdsStationFoodType,
  type KdsMultiStationSnapshot,
  type KdsRoutedWorkItem,
} from "@/lib/kitchen/kds-multi-station";
import {
  DEFAULT_KDS_STATIONS,
  type KdsStationDefinition,
} from "@/lib/kitchen/kds-multi-station-policy";
import {
  buildProductionViewSnapshot,
  type ProductionViewSnapshot,
  type ProductionViewWorkItemInput,
} from "@/lib/kitchen/kds-production-view";
import { productionWorkItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadKdsStationRoutingRules } from "@/lib/kitchen/kds-station-routing-rules-storage";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function loadKdsStationRegistry(userId: string): Promise<KdsStationDefinition[]> {
  const rows = await prisma.productionStation.findMany({
    where: { userId, active: true },
    select: { name: true, type: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 50,
  });

  if (rows.length === 0) {
    return [...DEFAULT_KDS_STATIONS];
  }

  return mergeStationRegistry(
    rows.map((row) => ({
      name: row.name,
      foodType: normalizeKdsStationFoodType(row.type),
      sortOrder: row.sortOrder,
    })),
  );
}

async function loadActiveProductionWorkItems(userId: string): Promise<ProductionViewWorkItemInput[]> {
  const where = await productionWorkItemListWhereForOwner(userId);

  const rows = await prisma.productionWorkItem.findMany({
    where: {
      AND: [where, { status: { notIn: ["DONE", "CANCELLED"] } }],
    },
    select: {
      id: true,
      title: true,
      station: true,
      status: true,
      priority: true,
      quantity: true,
      dueAt: true,
      createdAt: true,
      startedAt: true,
      productId: true,
      product: { select: { category: true } },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
    take: 500,
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    station: row.station,
    status: row.status,
    priority: row.priority,
    quantity: row.quantity,
    dueAtIso: toIso(row.dueAt),
    createdAtIso: row.createdAt.toISOString(),
    startedAtIso: toIso(row.startedAt),
    productCategory: row.product?.category ?? null,
    productId: row.productId,
  }));
}

export async function loadKdsMultiStationSnapshot(userId: string): Promise<KdsMultiStationSnapshot> {
  const [registry, items, rules] = await Promise.all([
    loadKdsStationRegistry(userId),
    loadActiveProductionWorkItems(userId),
    loadKdsStationRoutingRules(userId),
  ]);

  return buildKdsMultiStationSnapshot(items, registry, { rules });
}

export async function loadKdsProductionViewWithRouting(userId: string): Promise<ProductionViewSnapshot> {
  const snapshot = await loadKdsMultiStationSnapshot(userId);
  return snapshot.production;
}

export async function routeKdsWorkItemsForUser(userId: string): Promise<KdsRoutedWorkItem[]> {
  const [registry, items, rules] = await Promise.all([
    loadKdsStationRegistry(userId),
    loadActiveProductionWorkItems(userId),
    loadKdsStationRoutingRules(userId),
  ]);

  return applyKdsMultiStationRouting(items, registry, rules);
}

/** Backward-compatible loader used by production and manager views. */
export async function loadKdsProductionView(userId: string): Promise<ProductionViewSnapshot> {
  return loadKdsProductionViewWithRouting(userId);
}
