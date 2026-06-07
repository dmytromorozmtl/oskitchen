"use client";

import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ERROR_STATE_ROUTE_WRAPPER_CLASS } from "@/lib/design/error-state-patterns";

export function PilotRouteLoading({ title = "Loading…" }: { title?: string }) {
  return <LoadingState title={title} />;
}

export function PilotRouteError({
  error,
  reset,
  title = "Something went wrong",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  return (
    <div className={ERROR_STATE_ROUTE_WRAPPER_CLASS}>
      <ErrorState
        title={title}
        description={error.message || "An unexpected error occurred while loading this page."}
        retryLabel="Try again"
        onRetry={reset}
      />
    </div>
  );
}
