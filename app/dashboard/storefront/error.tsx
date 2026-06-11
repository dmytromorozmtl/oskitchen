"use client";

import { useEffect } from "react";

import { RouteError } from "@/components/dashboard/route-states";

export default function StorefrontDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront-dashboard]", error);
  }, [error]);

  const dbLike =
    error.message.includes("Prisma") ||
    error.message.includes("Can't reach database") ||
    error.message.includes("P1001") ||
    error.message.includes("DATABASE_URL");

  return (
    <RouteError
      error={error}
      reset={reset}
      title={dbLike ? "Storefront dashboard unavailable" : "Something went wrong"}
      description={
        dbLike
          ? "Database connectivity failed. Run npm run check:database-connectivity in a fresh terminal (do not source .env.production.local). Use Launch → Builder → Ordering → Menu until Advanced is stable."
          : error.message || "Something went wrong loading this storefront admin view."
      }
      homeHref="/dashboard/storefront"
      homeLabel="Back to Launch"
    />
  );
}
