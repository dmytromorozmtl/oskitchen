import { notFound } from "next/navigation";

import { SupportCenterClient, type SupportTicketRow } from "@/components/support/support-center-client";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { userWorkspaceIds } from "@/lib/support/support-permissions";
import { getSupportCenterSnapshot } from "@/services/support/support-service";
import { visibleTicketsWhere } from "@/services/support/ticket-service";

export default async function DashboardSupportPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    select: { role: true, fullName: true },
  });
  if (!profile) notFound();

  const [snapshot, workspaceIds] = await Promise.all([
    getSupportCenterSnapshot({ userId: dataUserId, email: user.email, profileRole: profile.role }),
    userWorkspaceIds(dataUserId),
  ]);

  const baseWhere = visibleTicketsWhere({
    userId: dataUserId,
    email: user.email,
    canTriage: snapshot.canTriage,
    workspaceIds,
  });

  const raw = await prisma.supportTicket.findMany({
    where: baseWhere,
    orderBy: { updatedAt: "desc" },
    take: 150,
    include: {
      workspace: { select: { name: true } },
      assignedTo: { select: { fullName: true } },
    },
  });

  const tickets: SupportTicketRow[] = raw.map((t) => ({
    id: t.id,
    submitterUserId: t.userId,
    assignedToId: t.assignedToId,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    severity: t.severity,
    email: t.email,
    workspaceName: t.workspace?.name ?? null,
    assignedName: t.assignedTo?.fullName ?? null,
    slaDueAt: t.slaDueAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  const workspaces = await prisma.workspace.findMany({
    where: {
      active: true,
      OR: [{ ownerUserId: dataUserId }, { members: { some: { userId: dataUserId } } }],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 80,
  });

  const assigneeRows = snapshot.canTriage
    ? await prisma.platformUserRole.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN"] },
        },
        select: { user: { select: { id: true, fullName: true, email: true } } },
        take: 40,
      })
    : [];

  const assignees = assigneeRows.map((r) => ({
    id: r.user.id,
    label: `${r.user.fullName} (${r.user.email})`,
  }));

  return (
    <SupportCenterClient
      snapshot={snapshot}
      tickets={tickets}
      workspaces={workspaces}
      assignees={assignees}
      userId={dataUserId}
      defaultEmail={user.email ?? ""}
      defaultName={profile.fullName}
    />
  );
}
