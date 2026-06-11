import Link from "next/link";

import { StaffStatusBadge } from "@/components/dashboard/staff/badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function DriversPage() {
  const { userId } = await getTenantActor();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [drivers, routesToday] = await Promise.all([
    prisma.staffMember.findMany({
      where: { userId, roleType: "DRIVER" },
      orderBy: { name: "asc" },
      include: {
        shifts: { where: { shiftDate: { gte: today, lt: tomorrow } } },
      },
    }),
    prisma.deliveryRoute.count({
      where: { userId, routeDate: { gte: today, lt: tomorrow } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
        <p className="text-sm text-muted-foreground">
          {drivers.length} driver{drivers.length === 1 ? "" : "s"} on the roster. {routesToday} route{routesToday === 1 ? "" : "s"} planned for today.
        </p>
      </div>

      {drivers.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No drivers yet</CardTitle>
            <CardDescription>Add a teammate with role type DRIVER to populate this list.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active drivers</CardTitle>
            <CardDescription>Drivers, today shifts, and quick links to route planning.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {drivers.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <div>
                    <Link href={`/dashboard/staff/${d.id}`} className="font-medium underline">{d.name}</Link>
                    <p className="text-xs text-muted-foreground">
                      Today shifts: {d.shifts.length} · {d.locationId ? `Location ${d.locationId.slice(0, 6)}` : "All locations"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StaffStatusBadge status={d.status} />
                    <Link href="/dashboard/delivery" className="text-xs underline">Route planner</Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
