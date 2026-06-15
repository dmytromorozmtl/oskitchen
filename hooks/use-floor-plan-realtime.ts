"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getFloorPlanConnectionStatusLabel } from "@/lib/restaurant/floor-plan-realtime-policy";
import {
  subscribeFloorPlanUpdates,
  type FloorPlanRealtimeTransport,
} from "@/services/floor-plan-realtime";

export type UseFloorPlanRealtimeOptions = {
  userId: string;
  workspaceId: string | null;
  onRefresh: () => void;
  enabled?: boolean;
  maxReconnectAttempts?: number;
};

export type UseFloorPlanRealtimeResult = {
  transport: FloorPlanRealtimeTransport;
  isLive: boolean;
  connectionLabel: string;
  reconnectAttempt: number;
};

/**
 * React hook for floor plan Supabase Realtime with polling fallback and auto-reconnect.
 */
export function useFloorPlanRealtime({
  userId,
  workspaceId,
  onRefresh,
  enabled = true,
  maxReconnectAttempts,
}: UseFloorPlanRealtimeOptions): UseFloorPlanRealtimeResult {
  const [isLive, setIsLive] = useState(false);
  const [transport, setTransport] = useState<FloorPlanRealtimeTransport>("polling");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const wrappedOnRefresh = useCallback(() => {
    onRefreshRef.current();
  }, []);

  useEffect(() => {
    if (!enabled || !userId.trim()) {
      setIsLive(false);
      setTransport("polling");
      setReconnectAttempt(0);
      return;
    }

    const subscription = subscribeFloorPlanUpdates({
      userId,
      workspaceId,
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
  }, [enabled, maxReconnectAttempts, userId, workspaceId, wrappedOnRefresh]);

  return {
    transport,
    isLive,
    connectionLabel: getFloorPlanConnectionStatusLabel(isLive),
    reconnectAttempt,
  };
}
