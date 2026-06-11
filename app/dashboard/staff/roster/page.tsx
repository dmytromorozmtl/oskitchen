import Link from "next/link";

import { ArchiveStaffButton } from "@/components/dashboard/staff/archive-button";
import { RosterFilters } from "@/components/dashboard/staff/roster-filters";
import { StaffStatusBadge } from "@/components/dashboard/staff/badges";
import { StaffForm } from "@/components/dashboard/staff/staff-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStaffPageAccess } from "@/lib/staff/staff-page-access";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABEL, STAFF_EMPLOYMENT_LABEL } from "@/lib/staff/staff-types";
import { listRoles, listStaff } from "@/services/staff/staff-service";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RosterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId, workspaceId, canPII, canManage } = await getStaffPageAccess();
  const params = await searchParams;
  const roleFilter = typeof params.role === "string" ? params.role : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";

  const [staff, roles, brands, locations] = await Promise.all([
    listStaff(userId),
    listRoles(userId),
    workspaceId
      ? prisma.brand.findMany({
          where: { workspaceId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }).catch(() => [])
      : Promise.resolve([]),
    prisma.location.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const filtered = staff.filter((s) => {
    if (roleFilter && s.roleType !== roleFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    if (q) {
      const haystack = `${s.name} ${s.email ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {staff.length} teammate{staff.length === 1 ? "" : "s"}.
        </p>
      </div>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add teammate</CardTitle>
            <CardDescription>Set role, location, and employment type for richer scheduling and reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffForm
              brands={brands}
              locations={locations}
              customRoles={roles.map((r) => ({ id: r.id, label: r.label }))}
            />
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          You can view the roster but cannot add or edit teammates without{" "}
          <span className="font-medium text-foreground">staff.manage</span>.
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base">All teammates</CardTitle>
            <CardDescription>Filter by role, status, or search.</CardDescription>
          </div>
          <RosterFilters />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No teammates match the filters.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {filtered.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {STAFF_ROLE_LABEL[s.roleType]}
                      {s.role && s.role !== STAFF_ROLE_LABEL[s.roleType] ? ` · ${s.role}` : ""}
                      {s.employmentType !== "CUSTOM" ? ` · ${STAFF_EMPLOYMENT_LABEL[s.employmentType]}` : ""}
                      {s.location ? ` · ${s.location.name}` : ""}
                      {s.brand ? ` · ${s.brand.name}` : ""}
                    </p>
                    {canPII ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.email ?? "No email"}{s.phone ? ` · ${s.phone}` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted-foreground">Contact details hidden — manager access required.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{s._count.tasks} tasks</Badge>
                    <Badge variant="outline">{s._count.shifts} shifts</Badge>
                    <StaffStatusBadge status={s.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/staff/${s.id}`}>Open</Link>
                    </Button>
                    {canManage && s.status !== "ARCHIVED" ? (
                      <ArchiveStaffButton staffMemberId={s.id} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
