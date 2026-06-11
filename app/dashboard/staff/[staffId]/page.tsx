import Link from "next/link";
import { notFound } from "next/navigation";

import { AvailabilityEditor } from "@/components/dashboard/staff/availability-editor";
import { AddCertificationForm, RevokeCertButton } from "@/components/dashboard/staff/cert-forms";
import { ArchiveStaffButton } from "@/components/dashboard/staff/archive-button";
import { CertStatusBadge, ShiftStatusBadge, StaffStatusBadge } from "@/components/dashboard/staff/badges";
import { StaffForm } from "@/components/dashboard/staff/staff-form";
import { ShiftStatusButtons } from "@/components/dashboard/staff/shift-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStaffPageAccess } from "@/lib/staff/staff-page-access";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABEL, STAFF_EMPLOYMENT_LABEL } from "@/lib/staff/staff-types";
import { listRoles, getStaffMember } from "@/services/staff/staff-service";

type PageProps = { params: Promise<{ staffId: string }> };

export default async function StaffDetailPage({ params }: PageProps) {
  const { userId, workspaceId, canPII, canEdit } = await getStaffPageAccess();

  const { staffId } = await params;
  const [member, roles, brands, locations] = await Promise.all([
    getStaffMember(userId, staffId),
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
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{member.name}</h1>
        <p className="text-sm text-muted-foreground">
          {STAFF_ROLE_LABEL[member.roleType]}
          {member.role && member.role !== STAFF_ROLE_LABEL[member.roleType] ? ` · ${member.role}` : ""}
          {member.location ? ` · ${member.location.name}` : ""}
          {member.brand ? ` · ${member.brand.name}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StaffStatusBadge status={member.status} />
          {member.employmentType !== "CUSTOM" ? (
            <Badge variant="outline">{STAFF_EMPLOYMENT_LABEL[member.employmentType]}</Badge>
          ) : null}
          {member.customRole ? <Badge variant="outline">{member.customRole.label}</Badge> : null}
          {member.status !== "ARCHIVED" && canEdit ? <ArchiveStaffButton staffMemberId={member.id} /> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>{canPII ? "Visible to managers." : "Hidden — manager access required."}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {canPII ? (
            <ul className="space-y-1">
              <li>Email: {member.email ?? "—"}</li>
              <li>Phone: {member.phone ?? "—"}</li>
              <li>Notes: {member.notes ?? "—"}</li>
            </ul>
          ) : (
            <p className="text-muted-foreground">Contact details are gated by capability.</p>
          )}
        </CardContent>
      </Card>

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffForm
              mode="edit"
              brands={brands}
              locations={locations}
              customRoles={roles.map((r) => ({ id: r.id, label: r.label }))}
              defaults={{
                staffMemberId: member.id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                role: member.role,
                roleType: member.roleType,
                status: member.status,
                employmentType: member.employmentType,
                brandId: member.brandId,
                locationId: member.locationId,
                notes: member.notes,
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
          <CardDescription>Latest assigned kitchen tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          {member.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks assigned.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {member.tasks.slice(0, 10).map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-md border p-2">
                  <span>{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Training</CardTitle>
          <CardDescription>Programs assigned via the Training Command Center.</CardDescription>
        </CardHeader>
        <CardContent>
          {member.trainingAssignmentsAsStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No training assigned yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {member.trainingAssignmentsAsStaff.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <div>
                    <p className="font-medium">{a.program.title}</p>
                    <p className="text-xs text-muted-foreground">{a.status} · {a.completionPercent}%</p>
                  </div>
                  <Link className="text-xs underline" href="/dashboard/training/assignments">Open</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Certifications</CardTitle>
          <CardDescription>Both Staff certifications and Training-issued certifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {canEdit ? <AddCertificationForm staffMemberId={member.id} /> : null}
          <div className="space-y-2">
            {member.certifications.length === 0 && member.trainingCertsAsStaff.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certifications yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {member.certifications.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                    <div>
                      <p className="font-medium">{c.certificationType}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.issuedAt ? `Issued ${c.issuedAt.toISOString().slice(0, 10)}` : "Issued —"}
                        {c.expiresAt ? ` · Expires ${c.expiresAt.toISOString().slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CertStatusBadge status={c.status} />
                      {canEdit && c.status === "ACTIVE" ? <RevokeCertButton certId={c.id} /> : null}
                    </div>
                  </li>
                ))}
                {member.trainingCertsAsStaff.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                    <div>
                      <p className="font-medium">{c.certificationType.replaceAll("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">From Training · Issued {c.issuedAt.toISOString().slice(0, 10)}</p>
                    </div>
                    <Badge variant="outline">Training</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability</CardTitle>
          <CardDescription>Weekly available hours per day.</CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <AvailabilityEditor
              staffMemberId={member.id}
              initial={member.availability.map((a) => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
                available: a.available,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Manager access required to edit.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shifts</CardTitle>
          <CardDescription>Recent shifts.</CardDescription>
        </CardHeader>
        <CardContent>
          {member.shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shifts scheduled.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {member.shifts.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <div>
                    <p className="font-medium">
                      {s.shiftDate.toISOString().slice(0, 10)} · {s.startTime}–{s.endTime}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.roleLabel ?? STAFF_ROLE_LABEL[s.role]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShiftStatusBadge status={s.status} />
                    {canEdit ? <ShiftStatusButtons shiftId={s.id} status={s.status} /> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {member.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {member.events.map((e) => (
                <li key={e.id} className="rounded border px-2 py-1">
                  <span className="font-mono">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                  {" · "}
                  <span className="font-medium">{e.eventType}</span>
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
