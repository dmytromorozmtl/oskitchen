export type PosConnectivityState = "online" | "offline" | "degraded";

export const POS_OFFLINE_LIMITATIONS = [
  "Offline queue is enabled by default — cash and mark-paid modes queue locally and sync when connectivity returns.",
  "OS Kitchen does not process or store card data — offline card approvals are not implied.",
  "Placeholder Stripe / in-app card flows are blocked while offline to avoid false PAID states.",
] as const;
