export type PosConnectivityState = "online" | "offline" | "degraded";

export const POS_OFFLINE_LIMITATIONS = [
  "Offline queue is enabled by default — cash and offline-card modes queue locally and sync when connectivity returns.",
  "OS Kitchen does not process or store card numbers, CVV, or track data — only last4, brand, and Stripe references.",
  "Placeholder Stripe / in-app card flows are blocked while offline to avoid false PAID states.",
] as const;
