import { subDays, startOfDay } from "date-fns";

import {
  assessDigitalTwinDataGateFromSnapshot,
  type DigitalTwinDataGateResult,
  type DigitalTwinDataGateSnapshot,
} from "@/lib/ai/digital-twin-data-gate";
import type { SimulationMenuMixItem } from "@/lib/ai/digital-twin-types";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner, resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { loadHistoricalMenuMix } from "@/services/ai/digital-twin";

function isSyntheticMenuMix(items: SimulationMenuMixItem[]): boolean {
  return items.length === 1 && items[0]?.item === "House favorite";
}

/** Load workspace signals and evaluate Digital Twin data gate. */
export async function loadDigitalTwinDataGate(userId: string): Promise<DigitalTwinDataGateResult> {
  const since = subDays(new Date(), 30);
  const todayStart = startOfDay(new Date());
  const [stationScope, orderScope] = await Promise.all([
    resolveOwnerScopedWhere(userId),
    orderListWhereForOwner(userId),
  ]);

  const [productionStationCount, activeStaffCount, todayShiftCount, ordersLast30Days, menuMix] =
    await Promise.all([
      prisma.productionStation.count({
        where: { AND: [stationScope, { active: true }] },
      }),
      prisma.staffMember.count({
        where: { userId, status: "ACTIVE" },
      }),
      prisma.staffShift.count({
        where: {
          userId,
          shiftDate: { gte: todayStart },
        },
      }),
      prisma.order.count({
        where: {
          AND: [
            orderScope,
            {
              createdAt: { gte: since },
              status: { notIn: ["CANCELLED"] },
            },
          ],
        },
      }),
      loadHistoricalMenuMix(userId),
    ]);

  const snapshot: DigitalTwinDataGateSnapshot = {
    productionStationCount,
    activeStaffCount,
    todayShiftCount,
    ordersLast30Days,
    menuMixItemCount: menuMix.length,
    usesSyntheticMenuMix: isSyntheticMenuMix(menuMix),
    usesDefaultStationConfig: productionStationCount === 0,
  };

  return assessDigitalTwinDataGateFromSnapshot(snapshot);
}
