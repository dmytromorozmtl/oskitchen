/** Channels / topics for future Supabase Realtime or similar — safe no-op today. */
export const REALTIME_TOPICS = [
  "today",
  "order_hub",
  "order_detail",
  "kitchen_screen",
  "production",
  "packing_verify",
  "routes",
  "support_inbox",
  "platform_dashboard",
] as const;

export type RealtimeTopic = (typeof REALTIME_TOPICS)[number];

export type RealtimeClientStatus = "idle" | "connecting" | "live" | "polling" | "error";
