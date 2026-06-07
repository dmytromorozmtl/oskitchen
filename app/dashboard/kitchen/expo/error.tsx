"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function KdsExpoViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Expo view unavailable"
      description={error.message || "Could not load expo runner board."}
      homeHref="/dashboard/kitchen"
      homeLabel="Back to kitchen"
    />
  );
}
