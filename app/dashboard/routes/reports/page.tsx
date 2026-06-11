import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { endOfUtcDay, startOfUtcDay } from "@/lib/routes/route-planning";

export default async function RoutesReportsPage() {
  const { userId } = await getTenantActor();
  const today = new Date();
  const start = startOfUtcDay(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
  const end = endOfUtcDay(today);

  const [routeCount, stops] = await Promise.all([
    prisma.deliveryRoute.count({ where: { userId, routeDate: { gte: start, lte: end } } }),
    prisma.deliveryStop.findMany({
      where: { route: { userId, routeDate: { gte: start, lte: end } } },
      select: { status: true, failedReason: true },
    }),
  ]);
  const totalStops = stops.length;
  const delivered = stops.filter((s) => s.status === "DELIVERED").length;
  const failed = stops.filter((s) => s.status === "FAILED").length;
  const failedBreakdown = stops
    .filter((s) => s.status === "FAILED")
    .reduce<Record<string, number>>((acc, s) => {
      const k = s.failedReason ?? "OTHER";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Routes reports</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Last 30 days. Lightweight summary — deeper analytics live on the dashboard.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Routes</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{routeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stops</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{totalStops}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{delivered}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failed delivery breakdown</CardTitle>
          <CardDescription>By reason. Helps prioritize the fix for next week.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {Object.keys(failedBreakdown).length === 0 ? (
            <p className="text-muted-foreground">No failed deliveries in the last 30 days.</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(failedBreakdown).map(([reason, count]) => (
                <li key={reason}>
                  <span className="font-medium">{reason}</span>: {count}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
