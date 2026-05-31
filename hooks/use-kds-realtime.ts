"use client";

import { useEffect, useRef, useState } from "react";

import { getKdsConnectionStatusLabel } from "@/lib/kitchen/kds-realtime-smoke-policy";
import {
  subscribeKdsOrderUpdates,
  type KdsRealtimeTransport,
} from "@/services/kds-websocket";

export type UseKdsRealtimeOptions = {
  userId: string;
  onRefresh: () => void;
  /** When false, no subscription is started (e.g. unmounted guard). */
  enabled?: boolean;
  maxReconnectAttempts?: number;
};

export type UseKdsRealtimeResult = {
  transport: KdsRealtimeTransport;
  isLive: boolean;
  connectionLabel: string;
  reconnectAttempt: number;
};

/**
 * React hook for KDS Supabase Realtime with polling fallback and auto-reconnect.
 * Wraps `subscribeKdsOrderUpdates` from `services/kds-websocket.ts`.
 */
export function useKdsRealtime({
  userId,
  onRefresh,
  enabled = true,
  maxReconnectAttempts,
}: UseKdsRealtimeOptions): UseKdsRealtimeResult {
  const [isLive, setIsLive] = useState(false);
  const [transport, setTransport] = useState<KdsRealtimeTransport>("polling");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled || !userId.trim()) {
      setIsLive(false);
      setTransport("polling");
      setReconnectAttempt(0);
      return;
    }

    const subscription = subscribeKdsOrderUpdates({
      userId,
      onRefresh: () => onRefreshRef.current(),
      onConnectionChange: (live) => {
        setIsLive(live);
        if (live) setReconnectAttempt(0);
      },
      onReconnectAttempt: setReconnectAttempt,
      maxReconnectAttempts,
    });

    setTransport(subscription.transport);

    return () => {
      subscription.disconnect();
    };
  }, [enabled, maxReconnectAttempts, userId]);

  return {
    transport,
    isLive,
    connectionLabel: getKdsConnectionStatusLabel(isLive),
    reconnectAttempt,
  };
}
