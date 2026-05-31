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

type KdsRealtimeEnv = {
  NEXT_PUBLIC_KDS_REALTIME_ENABLED?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

/** Exponential backoff for Realtime reconnect (1s → 30s cap). */
export function nextKdsReconnectDelayMs(attempt: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt));
}

/** Whether Supabase Realtime subscription is allowed (default: on when Supabase is configured). */
export function isKdsRealtimeEnabled(env: KdsRealtimeEnv = process.env as KdsRealtimeEnv): boolean {
  const flag = env.NEXT_PUBLIC_KDS_REALTIME_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function resolveKdsTransport(env: KdsRealtimeEnv = process.env as KdsRealtimeEnv): KdsRealtimeTransport {
  return isKdsRealtimeEnabled(env) ? "supabase" : "polling";
}

export type SubscribeKdsOrderUpdatesOptions = {
  userId: string;
  onRefresh: () => void;
  onConnectionChange: (live: boolean) => void;
  onReconnectAttempt?: (attempt: number) => void;
  maxReconnectAttempts?: number;
};

export type KdsOrderUpdatesSubscription = {
  transport: KdsRealtimeTransport;
  disconnect: () => void;
};

/**
 * Subscribe to KDS queue updates. Always runs a poll safety net; optionally
 * attaches Supabase Realtime when enabled. Restarts poll interval when live
 * state changes (15s disconnected · 60s when Realtime is SUBSCRIBED).
 * Reconnects Realtime with exponential backoff on channel errors.
 */
export function subscribeKdsOrderUpdates(
  opts: SubscribeKdsOrderUpdatesOptions,
): KdsOrderUpdatesSubscription {
  const transport = resolveKdsTransport();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let reconnectAttempt = 0;
  const maxReconnectAttempts = opts.maxReconnectAttempts ?? 5;

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
  let channel: ReturnType<typeof supabase.channel> | null = null;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const attachRealtimeChannel = () => {
    if (disposed) return;

    const removePromise = channel
      ? supabase.removeChannel(channel)
      : Promise.resolve();

    void removePromise.finally(() => {
      if (disposed) return;

      setLive(false);

      channel = supabase
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
          if (status === "SUBSCRIBED") {
            reconnectAttempt = 0;
            clearReconnectTimer();
            setLive(true);
            return;
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setLive(false);
            if (disposed || reconnectAttempt >= maxReconnectAttempts) return;

            reconnectAttempt += 1;
            opts.onReconnectAttempt?.(reconnectAttempt);
            clearReconnectTimer();
            reconnectTimer = setTimeout(() => {
              attachRealtimeChannel();
            }, nextKdsReconnectDelayMs(reconnectAttempt - 1));
          }
        });
    });
  };

  attachRealtimeChannel();

  return {
    transport,
    disconnect: () => {
      disposed = true;
      clearReconnectTimer();
      if (pollTimer) clearInterval(pollTimer);
      if (channel) void supabase.removeChannel(channel);
    },
  };
}
