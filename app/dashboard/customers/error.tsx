"use client";

import { PilotRouteError } from "@/components/dashboard/pilot-route-states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PilotRouteError error={error} reset={reset} title="Customers unavailable" />;
}
