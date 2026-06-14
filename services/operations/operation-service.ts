import { loadOperationHealth } from "@/services/operations/operation-health-service";
import { getOrderLifecycleView } from "@/services/orders/order-lifecycle-service";

/**
 * Read-only FoodOps snapshot — composes existing Today + per-order lifecycle views
 * without introducing a second source of truth.
 */
export async function loadOperationsWorkspaceSnapshot(userId: string) {
  const health = await loadOperationHealth(userId);
  return {
    healthStatus: health.rollup,
    today: health.today,
  };
}

export async function loadOrderOperationsBundle(userId: string, orderId: string) {
  const lifecycle = await getOrderLifecycleView(userId, orderId);
  return { lifecycle };
}
