/** Default cap for dashboard order list — keeps payloads predictable on large tenants. */
export const DASHBOARD_ORDER_LIST_TAKE = 400;

/** Enable slow-query logs for order reads when QUERY_PROFILE=1. */
export const ORDER_LIST_PROFILE_LABEL = "orders.list.dashboard";
