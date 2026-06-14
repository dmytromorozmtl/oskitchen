import { mapOrderBlockers } from "@/lib/operations/operation-blockers";
import { getOrderLifecycleView } from "@/services/orders/order-lifecycle-service";

export async function getOperationalBlockersForOrder(userId: string, orderId: string) {
  const view = await getOrderLifecycleView(userId, orderId);
  if (!view) return null;
  return mapOrderBlockers(view.blockers);
}

export { mapOrderBlockers, fromOrderBlocker } from "@/lib/operations/operation-blockers";
