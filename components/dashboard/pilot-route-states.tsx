"use client";

import * as React from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ERROR_STATE_ROUTE_WRAPPER_CLASS } from "@/lib/design/error-state-patterns";
import {
  CHUNK_LOAD_USER_MESSAGE,
  CHUNK_LOAD_USER_TITLE,
  clearChunkAutoReloadGuard,
  isChunkLoadError,
  isRscRenderError,
  isStaleServerActionError,
  reloadForStaleDeployment,
  STALE_SERVER_ACTION_USER_MESSAGE,
  tryAutoReloadForChunkError,
} from "@/lib/server-actions/stale-server-action";

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
  const stale = isStaleServerActionError(error);
  const chunkLoad = isChunkLoadError(error);
  const rscCrash = isRscRenderError(error);
  const needsHardReload = stale || chunkLoad || rscCrash;

  React.useEffect(() => {
    if (stale) reloadForStaleDeployment();
    if (chunkLoad) tryAutoReloadForChunkError();
  }, [stale, chunkLoad]);

  const resolvedTitle =
    chunkLoad ? CHUNK_LOAD_USER_TITLE : stale ? "App updated" : title;
  const resolvedDescription = chunkLoad
    ? CHUNK_LOAD_USER_MESSAGE
    : stale
      ? STALE_SERVER_ACTION_USER_MESSAGE
      : rscCrash
        ? "This page failed to render. Reload to fetch the latest version."
        : error.message || "An unexpected error occurred while loading this page.";

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
      />
    </div>
  );
}
