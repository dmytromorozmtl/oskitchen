"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KdsDailyService } from "@/components/kitchen/kds-daily-service";
import { useKdsRealtime } from "@/hooks/use-kds-realtime";
import { playKdsLiveConnectChime } from "@/lib/kitchen/kds-realtime-sounds";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";

import { KdsKitchenRealtimeBar } from "./kds-kitchen-realtime-bar";

type KdsKitchenDailyClientProps = {
  initialOrders: KdsDailyOrder[];
  userId: string;
  canBump?: boolean;
  canRecall?: boolean;
};

/**
 * Client shell for daily-service KDS at `/dashboard/kitchen` — single Realtime
 * subscription, sticky LIVE/POLLING bar, and ticket board.
 */
export function KdsKitchenDailyClient({
  initialOrders,
  userId,
  canBump = true,
  canRecall = false,
}: KdsKitchenDailyClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const wasLiveRef = useRef(false);

  const onRefresh = useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  const { isLive, transport, connectionLabel, reconnectAttempt } = useKdsRealtime({
    userId,
    onRefresh,
  });

  useEffect(() => {
    if (isLive && !wasLiveRef.current && soundEnabled) {
      playKdsLiveConnectChime();
    }
    wasLiveRef.current = isLive;
  }, [isLive, soundEnabled]);

  return (
    <>
      <KdsKitchenRealtimeBar
        isLive={isLive}
        transport={transport}
        connectionLabel={connectionLabel}
        reconnectAttempt={reconnectAttempt}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
      />
      <KdsDailyService
        initialOrders={initialOrders}
        userId={userId}
        canBump={canBump}
        canRecall={canRecall}
        soundEnabled={soundEnabled}
        refreshSignal={refreshSignal}
        hideSoundToggle
        realtime={{
          isLive,
          transport,
          connectionLabel,
          reconnectAttempt,
        }}
      />
    </>
  );
}
