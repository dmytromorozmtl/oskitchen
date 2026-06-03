"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  recordKdsRealtimeLatencySample,
  summarizeKdsRealtimeSloMetrics,
  type KdsRealtimeSloSnapshot,
} from "@/lib/kitchen/kds-realtime-slo-metrics";
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
  /** Rolling p50/p95/p99 refresh-handler latency (ms) vs `kds-slo-proof-policy` targets. */
  slo: KdsRealtimeSloSnapshot;
};

const EMPTY_SLO = summarizeKdsRealtimeSloMetrics([]);

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
  const [slo, setSlo] = useState<KdsRealtimeSloSnapshot>(EMPTY_SLO);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const latencySamplesRef = useRef<number[]>([]);

  const recordRefreshLatency = useCallback((latencyMs: number) => {
    latencySamplesRef.current = recordKdsRealtimeLatencySample(
      latencySamplesRef.current,
      latencyMs,
    );
    setSlo(summarizeKdsRealtimeSloMetrics(latencySamplesRef.current));
  }, []);

  const wrappedOnRefresh = useCallback(() => {
    const started = performance.now();
    try {
      onRefreshRef.current();
    } finally {
      recordRefreshLatency(performance.now() - started);
    }
  }, [recordRefreshLatency]);

  useEffect(() => {
    if (!enabled || !userId.trim()) {
      setIsLive(false);
      setTransport("polling");
      setReconnectAttempt(0);
      latencySamplesRef.current = [];
      setSlo(EMPTY_SLO);
      return;
    }

    const subscription = subscribeKdsOrderUpdates({
      userId,
      onRefresh: wrappedOnRefresh,
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
  }, [enabled, maxReconnectAttempts, userId, wrappedOnRefresh]);

  return {
    transport,
    isLive,
    connectionLabel: getKdsConnectionStatusLabel(isLive),
    reconnectAttempt,
    slo,
  };
}
