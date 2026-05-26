import Link from "next/link";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { endOfUtcDay, startOfUtcDay } from "@/lib/routes/route-planning";
import { ROUTE_STATUS_LABEL } from "@/lib/routes/route-status";

export default async function DriverIndexPage() {
  const { sessionUser, userId } = await getTenantActor();
  const now = new Date();
  const start = startOfUtcDay(now);
  const end = endOfUtcDay(now);

  const routes = await prisma.deliveryRoute.findMany({
    where: {
      OR: [
        { userId },
        { driverUserId: sessionUser.id },
      ],
      routeDate: { gte: start, lte: end },
    },
    orderBy: { routeDate: "asc" },
    include: { stops: { select: { status: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Driver</p>
        <h1 className="text-xl font-semibold tracking-tight">Today’s routes</h1>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No routes assigned today</CardTitle>
            <CardDescription>Ask dispatch to assign your driver profile to a route.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map((r) => {
            const delivered = r.stops.filter((s) => s.status === "DELIVERED").length;
            return (
              <Link key={r.id} href={`/dashboard/routes/${r.id}/driver`} className="block">
                <Card className="border-border/80 transition-colors hover:bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{r.title || format(r.routeDate, "EEEE MMM d")}</CardTitle>
                    <CardDescription>
                      {ROUTE_STATUS_LABEL[r.status]} · {delivered}/{r.totalStops} delivered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{r.driverName ?? "—"}</CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
