"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { BRAND_ACCENT, BRAND_ACCENT_DARK, BRAND_INK } from "@/lib/constants";
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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global error boundary:", error);

    if (isStaleServerActionError(error) || isChunkLoadError(error)) {
      tryAutoReloadForChunkError("os-kitchen-global-chunk-reload");
    }
  }, [error]);

  const chunkLoad = isChunkLoadError(error);
  const stale = isStaleServerActionError(error);
  const rscCrash = isRscRenderError(error);
  const needsHardReload = chunkLoad || stale || rscCrash;

  const heading = chunkLoad
    ? CHUNK_LOAD_USER_TITLE
    : stale
      ? "App updated"
      : "Something went wrong";
  const message = chunkLoad
    ? CHUNK_LOAD_USER_MESSAGE
    : stale
      ? STALE_SERVER_ACTION_USER_MESSAGE
      : "An unexpected error occurred. Our team has been notified. Please try again.";

  const handleRetry = () => {
    if (needsHardReload) {
      clearChunkAutoReloadGuard("os-kitchen-global-chunk-reload");
      reloadForStaleDeployment();
      return;
    }
    reset();
  };

  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{
          background: "#FFFFFF",
          color: BRAND_INK,
          fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: BRAND_ACCENT }}
          >
            {needsHardReload ? "Update" : "500"}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="mt-3" style={{ color: "#3A3B40" }}>
            {message}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 rounded-full px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: BRAND_ACCENT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = BRAND_ACCENT_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = BRAND_ACCENT;
            }}
          >
            {needsHardReload ? "Reload page" : "Try again"}
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-4 text-sm underline-offset-4 hover:underline"
            style={{ color: BRAND_ACCENT }}
          >
            Return home
          </button>
        </main>
      </body>
    </html>
  );
}
