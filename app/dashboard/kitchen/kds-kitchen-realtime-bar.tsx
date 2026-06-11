"use client";

import {
  KdsRealtimeConnectionBar,
  type KdsRealtimeConnectionBarProps,
} from "@/components/kitchen/kds-realtime-connection-bar";

type KdsKitchenRealtimeBarProps = Omit<KdsRealtimeConnectionBarProps, "variant"> & {
  className?: string;
};

/** @deprecated Import `KdsRealtimeConnectionBar` from `@/components/kitchen/kds-realtime-connection-bar`. */
export function KdsKitchenRealtimeBar(props: KdsKitchenRealtimeBarProps) {
  return (
    <KdsRealtimeConnectionBar
      {...props}
      variant="sticky"
      testId="kds-kitchen-realtime-bar"
    />
  );
}
