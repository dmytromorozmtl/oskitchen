"use client";

import { PilotRouteError } from "@/components/dashboard/pilot-route-states";

export default function PosTerminalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PilotRouteError error={error} reset={reset} title="POS terminal unavailable" />
  );
}
