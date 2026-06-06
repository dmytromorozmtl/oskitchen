"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function EnterpriseMultiLocationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} />;
}
