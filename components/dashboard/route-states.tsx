"use client";

import * as React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ERROR_STATE_ROUTE_WRAPPER_CLASS } from "@/lib/design/error-state-patterns";
import { ROUTE_LOADING_MIN_HEIGHT_CLASS } from "@/lib/design/route-loading-patterns";
import {
  CHUNK_LOAD_USER_MESSAGE,
  CHUNK_LOAD_USER_TITLE,
  clearChunkAutoReloadGuard,
  isChunkLoadError,
  isRscRenderError,
  isStaleServerActionError,
  reloadForStaleDeployment,
  reloadForStaleServerAction,
  STALE_SERVER_ACTION_USER_MESSAGE,
  tryAutoReloadForChunkError,
} from "@/lib/server-actions/stale-server-action";

export function RouteLoading({ message = "Loading..." }: { message?: string }) {
  return <LoadingState title={message} className={ROUTE_LOADING_MIN_HEIGHT_CLASS} />;
}

export function RouteError({
  error,
  reset,
  title,
  description,
  homeHref,
  homeLabel,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
}) {
  const stale = isStaleServerActionError(error);
  const chunkLoad = isChunkLoadError(error);
  const rscCrash = isRscRenderError(error);
  const needsHardReload = stale || chunkLoad || rscCrash;

  React.useEffect(() => {
    if (stale) reloadForStaleServerAction();
    if (chunkLoad) tryAutoReloadForChunkError();
  }, [stale, chunkLoad]);

  const resolvedTitle =
    title ??
    (chunkLoad ? CHUNK_LOAD_USER_TITLE : stale ? "App updated" : "Something went wrong");
  const resolvedDescription =
    description ??
    (chunkLoad
      ? CHUNK_LOAD_USER_MESSAGE
      : stale
        ? STALE_SERVER_ACTION_USER_MESSAGE
        : rscCrash
          ? "This page failed to render. Hard-refresh the browser (Cmd+Shift+R) or tap Reload — if it keeps happening, contact support."
          : error.message || "An unexpected error occurred while loading this page.");

  const handleRetry = needsHardReload
    ? () => {
        clearChunkAutoReloadGuard();
        reloadForStaleDeployment();
      }
    : reset;

  return (
    <div className={ERROR_STATE_ROUTE_WRAPPER_CLASS}>
      <ErrorState
        title={resolvedTitle}
        description={resolvedDescription}
        retryLabel={needsHardReload ? "Reload page" : "Try again"}
        onRetry={handleRetry}
        homeHref={homeHref}
        homeLabel={homeLabel}
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
