import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  buildKdsManagerViewSnapshot,
  normalizeManagerStation,
  type ManagerCompletedTicket,
  type ManagerViewSnapshot,
} from "@/lib/kitchen/kds-manager-view";
import { summarizeKdsQueue } from "@/lib/kitchen/kds-queue-clarity-era18";
import { productionWorkItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadKdsExpoView } from "@/services/kitchen/expo-view-service";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import { loadKdsProductionView } from "@/services/kitchen/production-view-service";

function prepMinutes(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

export async function loadKdsManagerView(userId: string): Promise<ManagerViewSnapshot> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(todayStart);

  const [production, expo, orders, workWhere] = await Promise.all([
    loadKdsProductionView(userId),
    loadKdsExpoView(userId),
    getDailyKdsOrders(userId),
    productionWorkItemListWhereForOwner(userId),
  ]);

  const queueSummary = summarizeKdsQueue(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      elapsedSeconds: order.elapsedSeconds,
      createdAt: order.createdAt,
    })),
  );

  const completedRows = await prisma.productionWorkItem.findMany({
    where: {
      AND: [
        workWhere,
        { status: "DONE" },
        { completedAt: { gte: todayStart, lte: todayEnd } },
      ],
    },
    select: {
      station: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
      dueAt: true,
    },
    orderBy: { completedAt: "desc" },
    take: 300,
  });

  const completedToday: ManagerCompletedTicket[] = completedRows
    .filter((row) => row.completedAt)
    .map((row) => {
      const start = row.startedAt ?? row.createdAt;
      const end = row.completedAt!;
      const prep = prepMinutes(start, end);
      const wasOnTime = row.dueAt ? end.getTime() <= row.dueAt.getTime() : prep <= 20;
      return {
        station: normalizeManagerStation(row.station),
        prepMinutes: prep,
        wasOnTime,
      };
    });

  return buildKdsManagerViewSnapshot({
    production,
    expo,
    queueSummary,
    completedToday,
  });
}
