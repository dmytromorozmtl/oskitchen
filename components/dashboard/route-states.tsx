"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  isStaleServerActionError,
  reloadForStaleServerAction,
  STALE_SERVER_ACTION_USER_MESSAGE,
} from "@/lib/server-actions/stale-server-action";

export function RouteLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
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
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <span className="text-2xl text-muted-foreground" aria-hidden>
          ∅
        </span>
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        <a
          href={action.href}
          className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {action.label}
        </a>
      ) : null}
    </div>
  );
}

export function RouteLoadingSimple({ message = "Loading..." }: { message?: string }) {
  return <LoadingState title={message} />;
}
