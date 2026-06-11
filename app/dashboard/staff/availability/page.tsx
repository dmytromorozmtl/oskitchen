import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { DAY_LABEL, summarizeAvailability } from "@/lib/staff/staff-availability";
import { STAFF_ROLE_LABEL } from "@/lib/staff/staff-types";

export default async function AvailabilityPage() {
  const { userId } = await getTenantActor();
  const staff = await prisma.staffMember.findMany({
    where: { userId, status: { in: ["ACTIVE", "TRAINING", "INVITED"] } },
    include: { availability: { orderBy: { dayOfWeek: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Weekly availability for {staff.length} active teammate{staff.length === 1 ? "" : "s"}.
        </p>
      </div>

      {staff.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No active staff yet</CardTitle>
            <CardDescription>Add teammates first, then set availability per person.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-2 text-sm">
          {staff.map((s) => (
            <li key={s.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/dashboard/staff/${s.id}`} className="font-medium underline">{s.name}</Link>
                  <p className="text-xs text-muted-foreground">{STAFF_ROLE_LABEL[s.roleType]}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {summarizeAvailability(s.availability.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime, available: a.available })))}
                </p>
              </div>
              {s.availability.length > 0 ? (
                <div className="mt-2 grid grid-cols-7 gap-1 text-[10px]">
                  {Array.from({ length: 7 }).map((_, day) => {
                    const a = s.availability.find((x) => x.dayOfWeek === day);
                    return (
                      <div
                        key={day}
                        className={`rounded p-1 text-center ${a?.available ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                      >
                        {DAY_LABEL[day]}
                        {a?.available ? <p>{a.startTime}–{a.endTime}</p> : <p>—</p>}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
