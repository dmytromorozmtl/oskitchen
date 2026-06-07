import Link from "next/link";

import { createShiftAction } from "@/actions/labor/schedule";
import { ScheduleGridDragDrop } from "@/components/dashboard/staff/schedule-grid-drag-drop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import {
  getLaborVsSales,
  weekStartMonday,
} from "@/services/labor/schedule-service";
import { loadScheduleGridDragDropModel } from "@/services/labor/schedule-grid-drag-drop-service";

export default async function StaffSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const canManageSchedule = hasPermission(actor.granted, "schedule.manage");
  const weekStart = weekParam ? new Date(weekParam) : weekStartMonday();
  weekStart.setHours(0, 0, 0, 0);

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [gridModel, staff, locations, laborOverlay] = await Promise.all([
    loadScheduleGridDragDropModel(userId, weekStart),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getLaborVsSales(userId, new Date()),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Labor schedule</h1>
          <p className="text-sm text-muted-foreground">
            Drag shifts across team members and days · labor {laborOverlay.laborPct}% of today&apos;s sales
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href={`?week=${prevWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            ← Prev
          </Link>
          <Link href={`?week=${nextWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            Next →
          </Link>
          <Link href="/dashboard/staff/ai-scheduling" className="rounded-md border px-2 py-1">
            AI scheduling →
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today sales</CardTitle>
            <p className="text-2xl font-semibold">${laborOverlay.sales.toFixed(0)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Scheduled labor</CardTitle>
            <p className="text-2xl font-semibold">${laborOverlay.scheduledLabor.toFixed(0)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Labor %</CardTitle>
            <p className="text-2xl font-semibold">{laborOverlay.laborPct}%</p>
          </CardHeader>
        </Card>
      </div>

      {laborOverlay.overtimeAlerts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            Overtime alert:{" "}
            {laborOverlay.overtimeAlerts.map((o) => `${o.name} (${o.hours.toFixed(1)}h)`).join(", ")}
          </CardContent>
        </Card>
      )}

      {!canManageSchedule && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          You can view this schedule but cannot add, move, or remove shifts without{" "}
          <span className="font-medium text-foreground">schedule.manage</span>.
        </p>
      )}

      {canManageSchedule && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add shift</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createShiftAction} className="grid gap-2 sm:grid-cols-3">
            <select name="staffMemberId" required className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Staff…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input name="shiftDate" type="date" required className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="startTime" type="time" defaultValue="09:00" required className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="endTime" type="time" defaultValue="17:00" required className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="roleLabel" placeholder="Role label" className="rounded-md border px-2 py-1.5 text-sm" />
            <select name="locationId" className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground sm:col-span-3">
              Add shift
            </button>
          </form>
        </CardContent>
      </Card>
      )}

      <ScheduleGridDragDrop model={gridModel} canManage={canManageSchedule} />
    </div>
  );
}
