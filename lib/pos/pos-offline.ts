export type PosConnectivityState = "online" | "offline" | "degraded";

export const POS_OFFLINE_LIMITATIONS = [
  "OS Kitchen does not process or store card data — offline card approvals are not implied.",
  "Placeholder Stripe / in-app card flows are blocked while offline to avoid false PAID states.",
  "Checkout still requires a successful server round-trip; carts can be drafted locally at your own risk.",
] as const;
