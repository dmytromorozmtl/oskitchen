import Link from "next/link";

import { StaffForm } from "@/components/dashboard/staff/staff-form";
import { StaffKpiGrid } from "@/components/dashboard/staff/kpi-grid";
import { TeamCommunicationWidget } from "@/components/dashboard/staff/team-communication-widget";
import { StaffStatusBadge } from "@/components/dashboard/staff/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanGate } from "@/components/plans/plan-gate";
import { getStaffPageAccess } from "@/lib/staff/staff-page-access";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABEL } from "@/lib/staff/staff-types";
import {
  createStaffMemberFormAction,
} from "@/actions/staff-member";
import { listStaff, listRoles, staffKpis } from "@/services/staff/staff-service";
import { loadTeamCommunicationFeed } from "@/services/team/team-communication-load";

export default async function StaffPage() {
  const { userId, workspaceId, canManage, actor } = await getStaffPageAccess();
  const isSuper = actor.platformBypass;

  const [staff, kpis, roles, brands, locations, teamFeed] = await Promise.all([
    listStaff(userId),
    staffKpis(userId),
    listRoles(userId),
    workspaceId
      ? prisma.brand.findMany({
          where: { workspaceId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
          take: 50,
        }).catch(() => [])
      : Promise.resolve([]),
    prisma.location.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    }).catch(() => []),
    loadTeamCommunicationFeed(userId, { limit: 10 }),
  ]);

  return (
    <PlanGate userId={userId} feature="staff_roles" title="Staff">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Staff</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Manage teammates, roles, permissions, training, availability, assignments, and
              operational readiness. SSO logins per teammate remain on the roadmap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/staff/roster">Roster</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/staff/roles">Manage roles</Link>
            </Button>
            {isSuper ? <Badge variant="outline">Superadmin</Badge> : null}
          </div>
        </div>

        <StaffKpiGrid tiles={kpis} />

        <TeamCommunicationWidget feed={teamFeed} />

        {staff.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">No teammates yet</CardTitle>
              <CardDescription>
                Add teammates so OS Kitchen can assign tasks, training, production roles, packing work,
                and delivery routes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManage ? (
              <StaffForm
                brands={brands}
                locations={locations}
                customRoles={roles.map((r) => ({ id: r.id, label: r.label }))}
              />
              ) : (
                <p className="text-sm text-muted-foreground">
                  You need <span className="font-medium text-foreground">staff.manage</span> to add teammates.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/import-center">Import staff</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/staff/roles">Create roles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roster preview</CardTitle>
                <CardDescription>{staff.length} teammate{staff.length === 1 ? "" : "s"}.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {staff.slice(0, 8).map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {STAFF_ROLE_LABEL[s.roleType]}
                          {s.role && s.role !== STAFF_ROLE_LABEL[s.roleType] ? ` · ${s.role}` : ""}
                          {s.location ? ` · ${s.location.name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StaffStatusBadge status={s.status} />
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/staff/${s.id}`}>Open</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/staff/roster">View full roster</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {canManage ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add teammate (quick add)</CardTitle>
                <CardDescription>The original 3-field form continues to work below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <form action={createStaffMemberFormAction} className="grid gap-3">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Name</span>
                    <input name="name" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
                    <input name="email" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Role label</span>
                    <input name="role" placeholder="chef, driver, gm" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </label>
                  <Button type="submit" size="sm" className="w-fit">Save</Button>
                  <p className="text-xs text-muted-foreground">
                    Use the full form on the roster page for role type, location, employment, and notes.
                  </p>
                </form>
              </CardContent>
            </Card>
            ) : null}
          </div>
        )}
      </div>
    </PlanGate>
  );
}
