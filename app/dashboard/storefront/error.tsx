"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

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
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-xl font-semibold">Storefront dashboard unavailable</h1>
      <p className="text-sm text-muted-foreground">
        {dbLike
          ? "Database connectivity failed. Run npm run check:database-connectivity in a fresh terminal (do not source .env.production.local). Use Launch → Builder → Ordering → Menu until Advanced is stable."
          : "Something went wrong loading this storefront admin view."}
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="default" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/storefront">Back to Launch</Link>
        </Button>
      </div>
    </div>
  );
}
