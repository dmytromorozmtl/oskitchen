import { notFound } from "next/navigation";

import {
  SupportTicketDetailClient,
  type AuditRow,
  type CommentRow,
  type EventRow,
  type TicketDetailSerialized,
} from "@/components/support/support-ticket-detail-client";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseFullSupportInbox, canViewSupportTicket } from "@/lib/support/support-permissions";
import { getSupportTicketById } from "@/services/support/ticket-service";
import type { Prisma } from "@prisma/client";

type CommentWithAuthor = Prisma.SupportTicketCommentGetPayload<{
  include: { authorUser: { select: { fullName: true } } };
}>;

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    select: { role: true },
  });
  if (!profile) notFound();

  const ticket = await getSupportTicketById(ticketId);
  if (!ticket) notFound();
  const allowed = await canViewSupportTicket(dataUserId, user.email, ticket, profile.role);
  if (!allowed) notFound();

  const canTriage = await canUseFullSupportInbox(dataUserId, user.email, profile.role);

  let commentsRaw: CommentWithAuthor[] = [];
  try {
    commentsRaw = await prisma.supportTicketComment.findMany({
      where: {
        ticketId,
        ...(canTriage ? {} : { visibility: { not: "INTERNAL" } }),
      },
      orderBy: { createdAt: "asc" },
      include: { authorUser: { select: { fullName: true } } },
    });
  } catch {
    commentsRaw = [];
  }

  const comments: CommentRow[] = commentsRaw.map((c) => ({
    id: c.id,
    message: c.message,
    visibility: c.visibility,
    createdAt: c.createdAt.toISOString(),
    authorName: c.authorUser?.fullName ?? null,
  }));

  let eventsRaw: Awaited<ReturnType<typeof prisma.supportTicketEvent.findMany>> = [];
  try {
    eventsRaw = await prisma.supportTicketEvent.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
  } catch {
    eventsRaw = [];
  }

  const events: EventRow[] = eventsRaw.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    createdAt: e.createdAt.toISOString(),
    metadata: e.metadataJson,
  }));

  let auditRows: AuditRow[] = [];
  if (ticket.workspaceId) {
    const since = new Date(ticket.createdAt.getTime() - 86400000);
    const logs = await prisma.auditLog.findMany({
      where: { workspaceId: ticket.workspaceId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, action: true, createdAt: true, entityType: true, entityLabel: true },
    });
    auditRows = logs.map((a) => ({
      id: a.id,
      action: a.action,
      createdAt: a.createdAt.toISOString(),
      entityType: a.entityType,
      entityLabel: a.entityLabel,
    }));
  }

  const assigneeRows = canTriage
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

  const detail: TicketDetailSerialized = {
    id: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    severity: ticket.severity,
    category: ticket.category,
    email: ticket.email,
    requesterName: ticket.requesterName,
    workspaceName: ticket.workspace?.name ?? null,
    moduleKey: ticket.moduleKey,
    relatedEntityType: ticket.relatedEntityType,
    relatedEntityId: ticket.relatedEntityId,
    slaDueAt: ticket.slaDueAt?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
  };

  return (
    <SupportTicketDetailClient
      ticket={detail}
      comments={comments}
      events={events}
      auditRows={auditRows}
      canTriage={canTriage}
      assignees={assignees}
    />
  );
}
