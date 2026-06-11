"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function KdsManagerViewError({
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
      title="Manager view unavailable"
      description={error.message || "Could not load kitchen manager dashboard."}
      homeHref="/dashboard/kitchen"
      homeLabel="Back to kitchen"
    />
  );
}
