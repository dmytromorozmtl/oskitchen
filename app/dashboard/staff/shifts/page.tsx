import Link from "next/link";

import { ShiftStatusBadge } from "@/components/dashboard/staff/badges";
import { CreateShiftForm, ShiftStatusButtons } from "@/components/dashboard/staff/shift-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABEL } from "@/lib/staff/staff-types";
import { listShifts } from "@/services/staff/staff-service";

export default async function ShiftsPage() {
  const { userId } = await getTenantActor();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [shifts, staff, locations] = await Promise.all([
    listShifts({ userId, from: today, to: horizon }),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true, roleType: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const byDay = new Map<string, typeof shifts>();
  for (const s of shifts) {
    const key = s.shiftDate.toISOString().slice(0, 10);
    const list = byDay.get(key) ?? [];
    list.push(s);
    byDay.set(key, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shifts</h1>
        <p className="text-sm text-muted-foreground">Next 14 days of scheduled shifts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule a shift</CardTitle>
          <CardDescription>Shifts surface in production, packing, and route planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateShiftForm staff={staff} locations={locations} />
        </CardContent>
      </Card>

      {byDay.size === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No upcoming shifts</CardTitle>
            <CardDescription>Create the first shift above to populate the schedule.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, list]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-base">{day}</CardTitle>
                <CardDescription>{list.length} shift{list.length === 1 ? "" : "s"}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {list.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                      <div>
                        <Link href={`/dashboard/staff/${s.staffMember.id}`} className="font-medium underline">{s.staffMember.name}</Link>
                        <p className="text-xs text-muted-foreground">
                          {s.startTime}–{s.endTime}
                          {" · "}
                          {s.roleLabel ?? STAFF_ROLE_LABEL[s.role]}
                          {s.location ? ` · ${s.location.name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShiftStatusBadge status={s.status} />
                        <ShiftStatusButtons shiftId={s.id} status={s.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
