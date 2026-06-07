import {
  buildKdsExpediteQueue,
  KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
  pickKdsExpediteHeroTicket,
  summarizeKdsExpediteScreen,
  type KdsExpediteScreenModel,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import { buildKdsRushModeSnapshot } from "@/lib/kitchen/kds-rush-mode";
import type { KdsPriorityTicket } from "@/lib/kitchen/kds-priority-lane-era19";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export async function loadKdsExpediteScreenModel(userId: string): Promise<KdsExpediteScreenModel> {
  const orders = await getDailyKdsOrders(userId);
  const rush = buildKdsRushModeSnapshot(orders as KdsPriorityTicket[]);
  const hero = pickKdsExpediteHeroTicket(rush.priorityRoutes);
  const queue = buildKdsExpediteQueue(rush.priorityRoutes, hero);
  const { overdueCount, activeCount } = summarizeKdsExpediteScreen(rush);

  return {
    policyId: KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
    rush,
    hero,
    queue,
    overdueCount,
    activeCount,
  };
}
