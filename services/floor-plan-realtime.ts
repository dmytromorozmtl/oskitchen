/**
 * Floor plan table-update transport — Supabase Realtime with polling fallback.
 *
 * Feature flag: `NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED=false` forces polling-only mode.
 * @see docs/floor-plan-websocket-rfc.md
 */

import {
  getFloorPlanPollIntervalMs,
  getFloorPlanRealtimeChannelName,
  getFloorPlanRealtimeFilter,
  FLOOR_PLAN_REALTIME_SCHEMA,
  FLOOR_PLAN_REALTIME_TABLE,
} from "@/lib/restaurant/floor-plan-realtime-policy";
import { createClient } from "@/lib/supabase/client";

export type FloorPlanRealtimeTransport = "supabase" | "polling";

type FloorPlanRealtimeEnv = {
  NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

/** Exponential backoff for Realtime reconnect (1s → 30s cap). */
export function nextFloorPlanReconnectDelayMs(attempt: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt));
}

/** Whether Supabase Realtime subscription is allowed (default: on when Supabase is configured). */
export function isFloorPlanRealtimeEnabled(
  env: FloorPlanRealtimeEnv = process.env as FloorPlanRealtimeEnv,
): boolean {
  const flag = env.NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function resolveFloorPlanTransport(
  env: FloorPlanRealtimeEnv = process.env as FloorPlanRealtimeEnv,
): FloorPlanRealtimeTransport {
  return isFloorPlanRealtimeEnabled(env) ? "supabase" : "polling";
}

export type SubscribeFloorPlanUpdatesOptions = {
  userId: string;
  workspaceId: string | null;
  onRefresh: () => void;
  onConnectionChange: (live: boolean) => void;
  onReconnectAttempt?: (attempt: number) => void;
  maxReconnectAttempts?: number;
};

export type FloorPlanUpdatesSubscription = {
  transport: FloorPlanRealtimeTransport;
  disconnect: () => void;
};

/**
 * Subscribe to floor plan table updates. Always runs a poll safety net; optionally
 * attaches Supabase Realtime when enabled. Restarts poll interval when live
 * state changes (15s disconnected · 60s when Realtime is SUBSCRIBED).
 */
export function subscribeFloorPlanUpdates(
  opts: SubscribeFloorPlanUpdatesOptions,
): FloorPlanUpdatesSubscription {
  const transport = resolveFloorPlanTransport();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let reconnectAttempt = 0;
  const maxReconnectAttempts = opts.maxReconnectAttempts ?? 5;

  const schedulePoll = (live: boolean) => {
    if (pollTimer) clearInterval(pollTimer);
    if (disposed) return;
    pollTimer = setInterval(opts.onRefresh, getFloorPlanPollIntervalMs(live));
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
        .channel(getFloorPlanRealtimeChannelName(opts.workspaceId, opts.userId))
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: FLOOR_PLAN_REALTIME_SCHEMA,
            table: FLOOR_PLAN_REALTIME_TABLE,
            filter: getFloorPlanRealtimeFilter(opts.workspaceId, opts.userId),
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
            }, nextFloorPlanReconnectDelayMs(reconnectAttempt - 1));
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
