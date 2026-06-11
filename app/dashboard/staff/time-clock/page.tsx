import { clockInAction, clockOutAction } from "@/actions/labor/time-clock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import {
  getActiveEntries,
  getTodayTimeEntries,
} from "@/services/labor/time-clock-service";

export default async function TimeClockPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const canManageTimeClock = hasPermission(actor.granted, "timeclock.manage");
  const [active, today, staff] = await Promise.all([
    getActiveEntries(userId),
    getTodayTimeEntries(userId),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalHoursToday = today
    .filter((e) => e.totalHours != null)
    .reduce((s, e) => s + Number(e.totalHours), 0);
  const laborEstimate = totalHoursToday * 18;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Time clock</h1>
        <p className="text-sm text-muted-foreground">Clock in/out and track labor hours for payroll.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hours today (closed shifts)</CardDescription>
            <CardTitle className="text-2xl">{totalHoursToday.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Labor cost estimate (@ $18/hr)</CardDescription>
            <CardTitle className="text-2xl">${laborEstimate.toFixed(0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {!canManageTimeClock && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          You can review time entries but cannot clock staff in or out without{" "}
          <span className="font-medium text-foreground">timeclock.manage</span>.
        </p>
      )}

      {canManageTimeClock && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clock in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={clockInAction} className="flex flex-wrap gap-3">
            <select name="staffId" required className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Select staff…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Notes (optional)" className="rounded-md border px-2 py-1.5 text-sm" />
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Clock in
            </button>
          </form>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">On shift now</CardTitle>
          <CardDescription>{active.length} active entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one clocked in.</p>
          ) : (
            active.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{e.staffMember.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Since {e.clockIn.toLocaleTimeString()} · {e.status}
                  </p>
                </div>
                {canManageTimeClock ? (
                  <form action={clockOutAction}>
                    <input type="hidden" name="entryId" value={e.id} />
                    <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                      Clock out
                    </button>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Staff</th>
                <th className="py-2 pr-4">In</th>
                <th className="py-2 pr-4">Out</th>
                <th className="py-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              {today.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{e.staffMember.name}</td>
                  <td className="py-2 pr-4">{e.clockIn.toLocaleTimeString()}</td>
                  <td className="py-2 pr-4">{e.clockOut?.toLocaleTimeString() ?? "—"}</td>
                  <td className="py-2">{e.totalHours != null ? Number(e.totalHours).toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
