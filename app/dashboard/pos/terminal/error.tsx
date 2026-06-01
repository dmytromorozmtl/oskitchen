"use client";

import { useEffect } from "react";

import { PilotRouteError } from "@/components/dashboard/pilot-route-states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const message = error.message ?? "";
    const isChunkError =
      /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(message);
    if (!isChunkError) return;
    const key = "pos-terminal-chunk-reload";
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }, [error.message]);

  return (
    <PilotRouteError
      error={
        new Error(
          /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(
            error.message ?? "",
          )
            ? "The register screen failed to load — usually after a new release. Reload to fetch the latest version."
            : error.message,
        )
      }
      reset={() => {
        sessionStorage.removeItem("pos-terminal-chunk-reload");
        if (typeof window !== "undefined") {
          window.location.reload();
        } else {
          reset();
        }
      }}
      title="POS terminal unavailable"
    />
  );
}
