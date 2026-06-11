"use client";

import { RouteError } from "@/components/dashboard/route-states";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Lightspeed integration unavailable"
      description={`Lightspeed integration failed to load: ${error.message}`}
      homeHref="/dashboard/integrations"
      homeLabel="Back to integrations"
    />
  );
}
