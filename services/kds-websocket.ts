/**
 * KDS order-update transport — Supabase Realtime with polling fallback.
 *
 * Feature flag: `NEXT_PUBLIC_KDS_REALTIME_ENABLED=false` forces polling-only mode.
 * @see docs/kds-websocket-rfc.md
 */

import {
  getKdsPollIntervalMs,
  getKdsRealtimeChannelName,
  KDS_REALTIME_ORDERS_SCHEMA,
  KDS_REALTIME_ORDERS_TABLE,
} from "@/lib/kitchen/kds-realtime-smoke-policy";
import { createClient } from "@/lib/supabase/client";

export type KdsRealtimeTransport = "supabase" | "polling";

type KdsRealtimeEnv = Pick<
  NodeJS.ProcessEnv,
  "NEXT_PUBLIC_KDS_REALTIME_ENABLED" | "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
>;

/** Whether Supabase Realtime subscription is allowed (default: on when Supabase is configured). */
export function isKdsRealtimeEnabled(env: KdsRealtimeEnv = process.env): boolean {
  const flag = env.NEXT_PUBLIC_KDS_REALTIME_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function resolveKdsTransport(env: KdsRealtimeEnv = process.env): KdsRealtimeTransport {
  return isKdsRealtimeEnabled(env) ? "supabase" : "polling";
}

export type SubscribeKdsOrderUpdatesOptions = {
  userId: string;
  onRefresh: () => void;
  onConnectionChange: (live: boolean) => void;
};

export type KdsOrderUpdatesSubscription = {
  transport: KdsRealtimeTransport;
  disconnect: () => void;
};

/**
 * Subscribe to KDS queue updates. Always runs a poll safety net; optionally
 * attaches Supabase Realtime when enabled. Restarts poll interval when live
 * state changes (15s disconnected · 60s when Realtime is SUBSCRIBED).
 */
export function subscribeKdsOrderUpdates(
  opts: SubscribeKdsOrderUpdatesOptions,
): KdsOrderUpdatesSubscription {
  const transport = resolveKdsTransport();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  const schedulePoll = (live: boolean) => {
    if (pollTimer) clearInterval(pollTimer);
    if (disposed) return;
    pollTimer = setInterval(opts.onRefresh, getKdsPollIntervalMs(live));
  };

  const setLive = (live: boolean) => {
    opts.onConnectionChange(live);
    schedulePoll(live);
  };

  if (transport === "polling") {
    setLive(false);
    return {
      transport,
      disconnect: () => {
        disposed = true;
        if (pollTimer) clearInterval(pollTimer);
      },
    };
  }

  const supabase = createClient();
  const channel = supabase
    .channel(getKdsRealtimeChannelName(opts.userId))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: KDS_REALTIME_ORDERS_SCHEMA,
        table: KDS_REALTIME_ORDERS_TABLE,
        filter: `user_id=eq.${opts.userId}`,
      },
      () => {
        opts.onRefresh();
      },
    )
    .subscribe((status) => {
      setLive(status === "SUBSCRIBED");
    });

  return {
    transport,
    disconnect: () => {
      disposed = true;
      if (pollTimer) clearInterval(pollTimer);
      void supabase.removeChannel(channel);
    },
  };
}
