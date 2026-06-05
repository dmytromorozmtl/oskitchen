import { prisma } from "@/lib/prisma";
import {
  buildExpoViewSnapshot,
  type ExpoViewSnapshot,
  type ExpoViewTicketInput,
} from "@/lib/kitchen/kds-expo-view";
import { routeKdsWorkItemToStation } from "@/lib/kitchen/kds-multi-station";
import { productionWorkItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import { loadKdsStationRegistry } from "@/services/kitchen/multi-station-service";

const EXPO_WORK_STATUSES = ["TO_PREP", "IN_PROGRESS", "READY", "HANDOFF", "PACK_HANDOFF", "HOLD"] as const;

function elapsedSecondsFrom(iso: string, nowMs: number): number {
  const start = Date.parse(iso);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((nowMs - start) / 1000));
}

export async function loadKdsExpoView(userId: string): Promise<ExpoViewSnapshot> {
  const nowMs = Date.now();
  const [orders, workWhere, stationRegistry] = await Promise.all([
    getDailyKdsOrders(userId),
    productionWorkItemListWhereForOwner(userId),
    loadKdsStationRegistry(userId),
  ]);

  const orderIds = new Set(orders.map((order) => order.id));
  const tickets: ExpoViewTicketInput[] = orders.map((order) => ({
    id: order.id,
    kind: "order",
    title: order.customerName,
    subtitle: order.tableName ? `Table ${order.tableName}` : null,
    status: order.status,
    elapsedSeconds: order.elapsedSeconds,
    dueAtIso: null,
    tableName: order.tableName ?? null,
    itemSummary: order.items.slice(0, 3).join(", ") || null,
    priority: order.priority,
  }));

  const workRows = await prisma.productionWorkItem.findMany({
    where: {
      AND: [
        workWhere,
        { status: { in: [...EXPO_WORK_STATUSES] } },
        ...(orderIds.size > 0 ? [{ OR: [{ orderId: null }, { orderId: { notIn: [...orderIds] } }] }] : []),
      ],
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      station: true,
      dueAt: true,
      createdAt: true,
      updatedAt: true,
      order: { select: { customerName: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });

  for (const row of workRows) {
    const routed = routeKdsWorkItemToStation(
      {
        id: row.id,
        title: row.title,
        station: row.station,
        status: row.status,
        priority: row.priority,
        quantity: 1,
        dueAtIso: row.dueAt ? row.dueAt.toISOString() : null,
        createdAtIso: row.createdAt.toISOString(),
        startedAtIso: null,
        productCategory: null,
      },
      stationRegistry,
    );
    const anchorIso = row.status === "READY" || row.status === "HANDOFF"
      ? row.updatedAt.toISOString()
      : row.createdAt.toISOString();
    tickets.push({
      id: row.id,
      kind: "work_item",
      title: row.title,
      subtitle: routed.routedStation || row.order?.customerName?.trim() || null,
      status: row.status,
      elapsedSeconds: elapsedSecondsFrom(anchorIso, nowMs),
      dueAtIso: row.dueAt ? row.dueAt.toISOString() : null,
      tableName: null,
      itemSummary: `${routed.routedStation} · ${routed.foodType}`,
      priority: row.priority.toLowerCase(),
    });
  }

  return buildExpoViewSnapshot(tickets, { now: new Date(nowMs) });
}
