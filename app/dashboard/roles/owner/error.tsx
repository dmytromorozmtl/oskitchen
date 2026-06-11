"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function OwnerRoleDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} />;
}
