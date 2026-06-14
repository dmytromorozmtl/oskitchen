/**
 * Placeholder for Today-side mutations (dismiss alert, snooze task, bulk acknowledge).
 * Today currently deep-links into domain pages; actions stay there to avoid duplicate logic.
 */
export type TodayActionId =
  | "OPEN_ORDER"
  | "OPEN_PRODUCTION"
  | "OPEN_PACKING"
  | "OPEN_ROUTES"
  | "OPEN_MAPPING"
  | "OPEN_SUPPORT";

export function todayActionHref(id: TodayActionId, orderId?: string): string {
  switch (id) {
    case "OPEN_ORDER":
      return orderId ? `/dashboard/orders/${orderId}` : "/dashboard/orders";
    case "OPEN_PRODUCTION":
      return "/dashboard/production";
    case "OPEN_PACKING":
      return "/dashboard/packing";
    case "OPEN_ROUTES":
      return "/dashboard/routes";
    case "OPEN_MAPPING":
      return "/dashboard/product-mapping/unmapped";
    case "OPEN_SUPPORT":
      return "/dashboard/support/inbox";
    default:
      return "/dashboard/today";
  }
}
