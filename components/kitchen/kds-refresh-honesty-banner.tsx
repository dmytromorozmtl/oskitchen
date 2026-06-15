import { AlertCircle } from "lucide-react";

import { KDS_POLL_FALLBACK_MS } from "@/lib/kitchen/kds-realtime-smoke-policy";

type Props = {
  pollIntervalMs?: number;
  realtimeConnected?: boolean;
  lastRefreshAt?: Date | null;
};

export function KdsRefreshHonestyBanner(props: Props) {
  const pollMs = props.pollIntervalMs ?? KDS_POLL_FALLBACK_MS;
  const pollSeconds = Math.round(pollMs / 1000);
  const realtime = props.realtimeConnected === true;

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
      data-testid="kds-refresh-honesty-banner"
      role="status"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        {realtime
          ? `Live updates active with a ${pollSeconds}s safety-net refresh — not a rush-hour SLO guarantee.`
          : `Tickets refresh about every ${pollSeconds} seconds (polling fallback). Realtime WebSocket is not certified for production rush-hour claims.`}
      </span>
      {props.lastRefreshAt ? (
        <span className="text-amber-800/80 dark:text-amber-200/80">
          Last refresh {props.lastRefreshAt.toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
}
