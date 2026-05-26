import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { isGoogleRoutesConfigured } from "@/services/delivery/route-optimization-service";

export default function RouteOptimizePage() {
  const ok = isGoogleRoutesConfigured();
  return (
    <PageShell narrow>
      <h1 className="text-2xl font-semibold tracking-tight">Route optimization</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google Routes API (optimizeWaypointOrder) for delivery stop ordering.
      </p>
      <p className="mt-4 text-sm">
        Status:{" "}
        <span className={ok ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
          {ok ? "GOOGLE_ROUTES_API_KEY set" : "Not configured"}
        </span>
      </p>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/routes" className="text-primary underline-offset-4 hover:underline">
          ← Routes
        </Link>
      </p>
    </PageShell>
  );
}
