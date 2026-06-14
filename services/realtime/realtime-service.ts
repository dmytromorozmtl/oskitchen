import type { RealtimeClientStatus, RealtimeTopic } from "@/lib/realtime/realtime-events";

export type RealtimeServiceConfig = {
  /**
   * Supabase URL is configured (auth/session). Does **not** mean operational websocket sync is active —
   * collaboration still uses navigation refresh / polling until Supabase Realtime topics are subscribed.
   */
  supabaseConfigured: boolean;
  pollIntervalMs: number;
};

export function getRealtimeConfig(): RealtimeServiceConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return {
    supabaseConfigured: Boolean(url && url.length > 0),
    pollIntervalMs: 30_000,
  };
}

export function describeTopic(topic: RealtimeTopic): string {
  switch (topic) {
    case "today":
      return "Today command center";
    case "order_hub":
      return "Order hub";
    case "order_detail":
      return "Order detail";
    case "kitchen_screen":
      return "Kitchen screen";
    case "production":
      return "Production";
    case "packing_verify":
      return "Packing verification";
    case "routes":
      return "Routes";
    case "support_inbox":
      return "Support inbox";
    case "platform_dashboard":
      return "Platform dashboard";
    default:
      return topic;
  }
}

/** Ops surfaces use polling / manual refresh until realtime subscriptions ship (`docs/REALTIME_COLLABORATION.md`). */
export function defaultClientStatus(_cfg: RealtimeServiceConfig): RealtimeClientStatus {
  return "polling";
}
