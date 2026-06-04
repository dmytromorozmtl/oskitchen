"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ROUTE_LOADING_MIN_HEIGHT_CLASS } from "@/lib/design/route-loading-patterns";
import {
  isStaleServerActionError,
  reloadForStaleServerAction,
  STALE_SERVER_ACTION_USER_MESSAGE,
} from "@/lib/server-actions/stale-server-action";

export function RouteLoading({ message = "Loading..." }: { message?: string }) {
  return <LoadingState title={message} className={ROUTE_LOADING_MIN_HEIGHT_CLASS} />;
}

export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = isStaleServerActionError(error);

  React.useEffect(() => {
    if (stale) reloadForStaleServerAction();
  }, [stale]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
      <AlertTriangle className="h-10 w-10 shrink-0 text-amber-500" aria-hidden />
      <ErrorState
        title={stale ? "App updated" : "Something went wrong"}
        description={
          stale
            ? STALE_SERVER_ACTION_USER_MESSAGE
            : error.message || "An unexpected error occurred while loading this page."
        }
        retryLabel={stale ? "Reload now" : "Try again"}
        onRetry={stale ? reloadForStaleServerAction : reset}
      />
    </div>
  );
}

export function RouteEmpty({
  title = "No data yet",
  description = "Get started by creating your first item.",
  action,
}: {
  title?: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <EmptyState
        title={title}
        description={description}
        primaryLabel={action?.label}
        primaryHref={action?.href}
        showDemoLink={false}
        className="max-w-md"
      />
    </div>
  );
}

export function RouteLoadingSimple({ message = "Loading..." }: { message?: string }) {
  return <LoadingState title={message} />;
}
