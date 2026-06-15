import { RefreshCw } from "lucide-react";

import { KDS_POLL_FALLBACK_MS } from "@/lib/kitchen/kds-realtime-smoke-policy";
import { cn } from "@/lib/utils";

type KdsPollBannerProps = {
  pollIntervalMs?: number;
  className?: string;
};

/** Honest KDS polling disclosure — default 15s fallback per kds-realtime-smoke-policy. */
export function KdsPollBanner({
  pollIntervalMs = KDS_POLL_FALLBACK_MS,
  className,
}: KdsPollBannerProps) {
  const pollSeconds = Math.round(pollIntervalMs / 1000);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
      data-testid="kds-poll-banner"
      role="status"
    >
      <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Обновляется каждые {pollSeconds} секунд</span>
    </div>
  );
}
