"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function KdsProductionViewError({
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
      title="Production view unavailable"
      description={error.message || "Could not load station load snapshot."}
      homeHref="/dashboard/kitchen"
      homeLabel="Back to kitchen"
    />
  );
}
