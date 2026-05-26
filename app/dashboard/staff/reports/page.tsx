import Link from "next/link";

import { StaffKpiGrid } from "@/components/dashboard/staff/kpi-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABEL } from "@/lib/staff/staff-types";
import { staffKpis } from "@/services/staff/staff-service";
import { loadStaffReadinessSnapshot } from "@/services/staff/staff-readiness-service";

function bar(percent: number) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-muted">
      <div className="h-full bg-emerald-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default async function StaffReportsPage() {
  const { userId } = await getTenantActor();
  const [kpis, readiness, byRole, events] = await Promise.all([
    staffKpis(userId),
    loadStaffReadinessSnapshot(userId),
    prisma.staffMember.groupBy({
      where: { userId, status: { not: "ARCHIVED" } },
      by: ["roleType"],
      _count: { _all: true },
    }),
    prisma.staffEvent.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      take: 30,
      include: { staffMember: { select: { id: true, name: true } } },
    }),
  ]);

  const trainingTotal = await prisma.trainingAssignment.count({
    where: { userId, assignedToStaffId: { not: null } },
  });
  const trainingCompleted = await prisma.trainingAssignment.count({
    where: { userId, assignedToStaffId: { not: null }, status: "COMPLETED" },
  });
  const completionPercent = trainingTotal === 0 ? 0 : Math.round((trainingCompleted / trainingTotal) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff reports</h1>
        <p className="text-sm text-muted-foreground">
          Roster, training, certifications, shifts, role coverage, and go-live staffing readiness.
        </p>
      </div>

      <StaffKpiGrid tiles={kpis} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Go-live staffing readiness</CardTitle>
          <CardDescription>Used by the Go-live Command Center readiness engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1 text-sm md:grid-cols-2">
            <li>Active staff: <strong>{readiness.activeStaff}</strong></li>
            <li>Owner / admin present: <strong>{readiness.hasOwner ? "Yes" : "No"}</strong></li>
            <li>Manager present: <strong>{readiness.hasManager ? "Yes" : "No"}</strong></li>
            <li>Kitchen staff: <strong>{readiness.kitchenStaff}</strong></li>
            <li>Packing staff: <strong>{readiness.packingStaff}</strong></li>
            <li>Drivers: <strong>{readiness.drivers}</strong></li>
            <li>Active certifications: <strong>{readiness.activeCertifications}</strong></li>
            <li>Expiring (30d): <strong>{readiness.expiringCertifications}</strong></li>
            <li>Training incomplete: <strong>{readiness.trainingIncomplete}</strong></li>
            <li>Shifts today: <strong>{readiness.shiftsToday}</strong></li>
          </ul>
          <div className="mt-3 text-xs">
            <Link href="/dashboard/go-live" className="underline">Open Go-live readiness →</Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Training completion</CardTitle>
          <CardDescription>Staff-assigned training across the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-1 text-xs text-muted-foreground">
            {trainingCompleted} / {trainingTotal} completed · {completionPercent}%
          </p>
          {bar(completionPercent)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role coverage</CardTitle>
          <CardDescription>Headcount by role type (non-archived).</CardDescription>
        </CardHeader>
        <CardContent>
          {byRole.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byRole.map((row) => (
                <li key={row.roleType} className="flex items-center justify-between rounded-md border p-2">
                  <span>{STAFF_ROLE_LABEL[row.roleType]}</span>
                  <span className="text-xs text-muted-foreground">{row._count._all}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="rounded border px-2 py-1">
                  <span className="font-mono">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                  {" · "}
                  <span className="font-medium">{e.eventType}</span>
                  {e.staffMember ? ` · ${e.staffMember.name}` : ""}
                  {e.summary ? ` · ${e.summary}` : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
