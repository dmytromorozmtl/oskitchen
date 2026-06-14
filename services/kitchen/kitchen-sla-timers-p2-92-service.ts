import {
  buildKitchenSlaReport,
  type KitchenSlaReport,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-operations";
import { KITCHEN_SLA_TIMERS_POLICY_ID } from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import { loadMultiStationKdsPilotSnapshot } from "@/services/kitchen/multi-station-kds-p2-90-service";

export type KitchenSlaTimersSnapshot = KitchenSlaReport & {
  policyId: typeof KITCHEN_SLA_TIMERS_POLICY_ID;
  activeTicketCount: number;
  stationCount: number;
};

export async function loadKitchenSlaTimersSnapshot(userId: string): Promise<KitchenSlaTimersSnapshot> {
  const [orders, multiStation] = await Promise.all([
    getDailyKdsOrders(userId),
    loadMultiStationKdsPilotSnapshot(userId),
  ]);

  const report = buildKitchenSlaReport(orders, multiStation.stations);

  return {
    policyId: KITCHEN_SLA_TIMERS_POLICY_ID,
    activeTicketCount: orders.length,
    stationCount: multiStation.stations.length,
    ...report,
  };
}
