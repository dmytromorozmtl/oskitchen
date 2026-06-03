"use client";

import { ErrorState } from "@/components/feedback/error-state";

export function TodayPageLoadError() {
  return (
    <ErrorState
      title="Today overview unavailable"
      description="We could not load operational metrics. Try again in a moment or open Order hub while we recover."
      retryLabel="Reload"
      onRetry={() => {
        if (typeof window !== "undefined") window.location.reload();
      }}
      homeHref="/dashboard/order-hub"
    />
  );
}
