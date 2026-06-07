"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function PosCashManagementError({
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
      title="Cash management unavailable"
      description={error.message || "Something went wrong loading cash controls."}
      homeHref="/dashboard/pos"
      homeLabel="Back to POS"
    />
  );
}
